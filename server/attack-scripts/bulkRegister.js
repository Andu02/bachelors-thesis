import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SERVER_URL = "http://localhost:3000/vuln-register";

export default async function bulkRegister(
  csvFile = "user_data_to_encrypt.csv"
) {
  const csvPath = path.resolve(__dirname, csvFile);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`bulkRegister: fișier inexistent ${csvPath}`);
  }

  const users = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on("data", (row) => users.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  let success = 0,
    failure = 0;
  for (const { username, password, method, encryption_key } of users) {
    if (!method) {
      console.warn("bulkRegister: metodă necunoscută", method);
      continue;
    }

    const payload = { username, password, method };

    try {
      switch (method) {
        case "caesar":
          payload.caesarKey = parseInt(encryption_key, 10);
          break;
        case "hill":
          payload.hill = encryption_key;
          break;
        case "affine":
          payload.affine = encryption_key;
          break;
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
        default:
          console.warn("bulkRegister: metodă necunoscută", method);
          continue;
      }

      const res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success++;
      } else {
        failure++;
        console.error(`[${res.status}] ${username}: ${await res.text()}`);
      }
    } catch (err) {
      failure++;
      console.error(`[Eroare] ${username}: ${err.message}`);
    }
  }

  console.log(
    `✅ bulkRegister: ${success}/${users.length} OK, ${failure} eșecuri.`
  );
  return csvFile;
}
