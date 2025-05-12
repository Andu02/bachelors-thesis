import express from "express";
import db from "../db.js";
import fs from "fs";
import readline from "readline";
import * as caesar from "../crypto-methods/caesar.js";
import * as affine from "../crypto-methods/affine.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// helper: stream the dictionary, trying each word with `testFn`
// resolves { found: true, word, extra } or { found: false }
async function dictionarySearch(testFn) {
  const rl = readline.createInterface({
    input: fs.createReadStream("./utils/rockyou-sample.txt"),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const word = line.trim();
    if (!word) continue;
    try {
      const result = await testFn(word);
      if (result) {
        rl.close();
        return { found: true, ...result };
      }
    } catch {
      // ignore individual errors
    }
  }

  return { found: false };
}

router.post("/simulate-attack", async (req, res) => {
  const { algorithm, hash } = req.body;

  try {
    if (algorithm === "caesar") {
      for (let k = 1; k < 26; k++) {
        const { found, word } = await dictionarySearch((w) => {
          const enc = caesar.encrypt(w, k);
          return enc === hash ? { word, key: k } : null;
        });
        if (found) {
          return res.json({
            success: true,
            result: word,
            method: "Caesar",
            key: k,
          });
        }
      }
      return res.json({
        success: false,
        message: "Nicio potrivire în dicționar pentru Caesar",
      });
    }

    if (algorithm === "affine") {
      const aList = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
      for (let a of aList) {
        for (let b = 0; b < 26; b++) {
          const { found, word } = await dictionarySearch((w) => {
            const enc = affine.encrypt(w, a, b);
            return enc === hash ? { word, key: `a=${a},b=${b}` } : null;
          });
          if (found) {
            return res.json({
              success: true,
              result: word,
              method: "Afin",
              key: `a=${a}, b=${b}`,
            });
          }
        }
      }
      return res.json({
        success: false,
        message: "Nicio potrivire în dicționar pentru Afin",
      });
    }

    if (algorithm === "sha256") {
      const { found, word } = await dictionarySearch((w) => {
        const h = crypto.createHash("sha256").update(w).digest("hex");
        return h === hash ? { word } : null;
      });
      if (found) {
        return res.json({
          success: true,
          result: word,
          method: "SHA-256 (dicționar)",
        });
      }
      return res.json({
        success: false,
        message: "Parola nu a fost găsită în dicționar (SHA-256)",
      });
    }

    if (algorithm === "bcrypt") {
      const { found, word } = await dictionarySearch(async (w) => {
        const match = await bcrypt.compare(w, hash);
        return match ? { word } : null;
      });
      if (found) {
        return res.json({
          success: true,
          result: word,
          method: "bcrypt (dicționar)",
        });
      }
      return res.json({
        success: false,
        message: "Parola nu a fost găsită (bcrypt)",
      });
    }

    if (algorithm === "rsa") {
      return res.json({
        success: false,
        message:
          "RSA este criptare asimetrică – nu poate fi spart fără cheia privată.",
      });
    }

    return res.json({ success: false, message: "Algoritm necunoscut." });
  } catch (err) {
    console.error("Simulation error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Eroare internă: " + err.message });
  }
});

router.get("/simulation", requireAuth, async (req, res) => {
  try {
    const { username } = req.user;
    const { rows } = await db.query(
      "SELECT username, password, method FROM users WHERE username = $1",
      [username]
    );
    if (rows.length === 0) {
      return res.status(404).send("Utilizatorul nu a fost găsit.");
    }
    const { password, method } = rows[0];
    res.render("simulation", { username, hash: password, method });
  } catch (err) {
    console.error("Simulation page error:", err);
    res.status(500).send("Eroare server: " + err.message);
  }
});

export default router;
