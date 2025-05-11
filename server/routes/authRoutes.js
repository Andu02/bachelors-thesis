import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { encryptPassword, comparePasswords } from "../utils/cryptoRouter.js";
import { getEncryptionData } from "../utils/utils.js";
import {
  validateRegisterFields,
  getPasswordErrorMessage,
} from "../middlewares/validateInput.js";

const router = express.Router();
const JWT_SECRET = "secretKey";

// GET /register
router.get("/register", (req, res) => {
  res.render("register", { message: null });
});

// ✅ POST /register - răspunde cu JSON pentru fetch()
router.post("/register", validateRegisterFields, async (req, res) => {
  const {
    username,
    password,
    method,
    caesarKey,
    hill,
    symmetricKey,
    rsa,
    affineA,
    affineB,
  } = req.body;

  try {
    const {
      encryptionKey,
      hillMatrix,
      symmetricKey: symKey,
    } = getEncryptionData(
      method,
      hill,
      symmetricKey,
      rsa,
      parseInt(caesarKey),
      {
        a: parseInt(affineA),
        b: parseInt(affineB),
      }
    );

    const passwordError = getPasswordErrorMessage(password, method);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    const start = Date.now();
    const encryptedPassword = await encryptPassword(method, password, {
      hillKey: hillMatrix,
      symmetricKey: symKey,
      rsa,
      caesarKey: parseInt(caesarKey),
      affine: { a: parseInt(affineA), b: parseInt(affineB) },
    });
    const encryptionTime = Date.now() - start;

    await pool.query(
      "INSERT INTO users (username, password, method, encryption_key) VALUES ($1, $2, $3, $4)",
      [username, encryptedPassword, method, encryptionKey]
    );

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });

    res.cookie(
      "registrationDetails",
      JSON.stringify({
        username,
        method,
        originalPassword: password,
        encryptedPassword,
        encryptionTime,
      }),
      { httpOnly: false, maxAge: 3600000 }
    );

    return res.status(200).json({ message: "Cont creat cu succes!" });
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(400)
        .json({ message: "Acest nume de utilizator este deja folosit." });
    }
    console.error("Eroare la înregistrare:", err);
    return res
      .status(500)
      .json({ message: "Eroare internă la salvarea contului." });
  }
});

// GET /login
router.get("/login", (req, res) => {
  res.render("login", { message: null });
});

// POST /login (rămâne pe render clasic dacă nu trecem și el pe fetch)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.render("login", { message: "Utilizatorul nu există." });
    }

    const user = result.rows[0];
    let extra = {};

    switch (user.method) {
      case "rsa":
        const { p, q, e } = JSON.parse(user.encryption_key);
        extra.rsa = { p: BigInt(p), q: BigInt(q), e: BigInt(e) };
        break;

      case "affine":
        const { a, b } = JSON.parse(user.encryption_key);
        extra.affine = { a: parseInt(a), b: parseInt(b) };
        break;

      case "caesar":
        extra.caesarKey = parseInt(user.encryption_key);
        break;

      case "hill":
        extra.hillKey = JSON.parse(user.encryption_key);
        break;

      case "ecb":
      case "cbc":
        extra.symmetricKey = user.encryption_key;
        break;

      default:
        break;
    }

    const valid = await comparePasswords(
      user.method,
      password,
      user.password,
      extra
    );

    if (!valid) {
      return res.render("login", { message: "Parolă incorectă." });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });

    res.redirect("/success-login");
  } catch (err) {
    console.error("Eroare la autentificare:", err);
    res.status(500).render("login", { message: "Eroare la autentificare." });
  }
});

// Logout
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.clearCookie("registrationDetails");
  res.redirect("/");
});

export default router;
