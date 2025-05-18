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

    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
      let { username, password, method, encryption_key } = user;
      method = method?.replace(/^"|"$/g, ""); // curăță ghilimele dacă există

      if (
        !method ||
        ![
          "caesar",
          "hill",
          "affine",
          "ecb",
          "cbc",
          "sha256",
          "bcrypt",
        ].includes(method)
      ) {
        console.warn(
          `[WARN] Linie ignorată (method necunoscut): ${username}, ${method}`
        );
        continue;
      }

      const payload = {
        username,
        password,
        method,
        caesarKey: null,
        hill: null,
        symmetricKey: null,
        rsa: null,
        affineA: null,
        affineB: null,
        bcryptSalt: null,
        sha256Salt: null,
      };

      switch (method) {
        case "caesar":
          payload.caesarKey = parseInt(encryption_key, 10);
          break;
        case "hill":
          payload.hill = encryption_key;
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
          payload.sha256Salt = encryption_key;
          break;
        case "bcrypt":
          payload.bcryptSalt = parseInt(encryption_key, 10);
          break;
      }

      try {
        const res = await fetch(SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const text = await res.text();

        if (res.ok) {
          successCount++;
        } else {
          failureCount++;
          console.error(`[${res.status}] ${username}: ${text}`);
        }
      } catch (err) {
        failureCount++;
        console.error(`[Eroare] ${username}: ${err.message}`);
      }
    }

    console.log(
      `\n✅ Înregistrare completă: ${successCount}/${users.length} conturi create cu succes.`
    );
    if (failureCount > 0) {
      console.log(`⚠️ ${failureCount} conturi nu au fost create cu succes.`);
    }
  });
