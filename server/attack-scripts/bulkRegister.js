// server/attack-scripts/bulkRegister.js
import fs from "fs";
import fetch from "node-fetch";
import csv from "csv-parser";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const csvPath = resolve(__dirname, "1k_user_data_to_encrypt.csv");

const SERVER_URL = "http://localhost:3000/vuln-register";
const users = [];

fs.createReadStream(csvPath)
  .pipe(csv())
  .on("data", (data) => users.push(data))
  .on("end", async () => {
    console.log(`📤 Trimit ${users.length} utilizatori către server...\n`);

    for (const user of users) {
      const { username, password, method, encryption_key } = user;

      const payload = {
        username,
        password,
        method,
        encryptionKey: encryption_key,
        caesarKey: null,
        hill: null,
        symmetricKey: null,
        rsa: null,
        affineA: null,
        affineB: null,
        bcryptSalt: null,
      };

      try {
        switch (method) {
          case "caesar":
            payload.caesarKey = parseInt(encryption_key);
            break;

          case "vigenere":
            payload.symmetricKey = encryption_key;
            break;

          case "hill":
            payload.hill = encryption_key; // JSON string (ex: [[3,3],[2,5]])
            break;

          case "affine": {
            const { a, b } = JSON.parse(encryption_key);
            payload.affineA = a;
            payload.affineB = b;
            break;
          }

          case "ecb":
          case "cbc":
            payload.symmetricKey = encryption_key;
            break;

          case "sha256":
            payload.symmetricKey = encryption_key;
            break;

          case "bcrypt":
            payload.bcryptSalt = parseInt(encryption_key);
            break;
        }

        const res = await fetch(SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const text = await res.text();
        console.log(`[${res.status}] ${username}: ${text}`);
      } catch (err) {
        console.error(`[Eroare] ${username}:`, err.message);
      }
    }

    console.log("\n✅ Înregistrare completă.");
  });
