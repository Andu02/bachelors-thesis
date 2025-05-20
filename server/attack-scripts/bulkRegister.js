// server/attack-scripts/bulkRegister.js

// ============================
// Importuri necesare
// ============================
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pool from "../db.js"; // import corect
import { getReportPath, writeCsv } from "../utils/utils.js";
import config from "../config.js";

// ============================
// Setare __dirname
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Endpoint backend
// ============================
const SERVER_URL = config.serverUrl + "/vuln-register";

// ============================
// Funcția principală de înregistrare bulk
// ============================
export default async function bulkRegister(
  csvFile = "user_data_to_encrypt.csv"
) {
  const csvPath = path.resolve(__dirname, "../../public/reports", csvFile);

  if (!fs.existsSync(csvPath)) {
    throw new Error(`bulkRegister: fișier inexistent ${csvPath}`);
  }

  // Încarcă utilizatorii din CSV
  const users = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csvParser())
      .on("data", (row) => users.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  // Pregătește raportul CSV
  const { reportName, reportPath } = getReportPath("bulk_register_report");
  const logLines = [["username", "method", "status", "error_message"]];

  let success = 0,
    failure = 0;
  for (const { username, password, method, encryption_key } of users) {
    // ============================
    // Pre-check în baza de date
    // ============================
    try {
      const result = await pool.query(
        "SELECT 1 FROM users WHERE username = $1",
        [username]
      );
      if (result.rows.length > 0) {
        console.log(`⏭️ Sărim peste ${username}: există deja.`);
        logLines.push([username, method, "skipped", "username deja existent"]);
        continue;
      }
    } catch (err) {
      console.warn(`⚠️ Eroare la pre-check pentru ${username}:`, err.message);
      // continuăm înregistrarea, poate funcționează API-ul
    }

    if (!method) {
      console.warn("bulkRegister: metodă necunoscută", method);
      logLines.push([username, method || "?", "error", "Metodă necunoscută"]);
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
          logLines.push([username, method, "error", "Metodă necunoscută"]);
          failure++;
          continue;
      }

      const res = await fetch(SERVER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        success++;
        logLines.push([username, method, "success", ""]);
      } else {
        const msg = await res.text();
        failure++;
        logLines.push([username, method, "error", msg]);
        console.error(`[${res.status}] ${username}: ${msg}`);
      }
    } catch (err) {
      failure++;
      logLines.push([username, method, "error", err.message]);
      console.error(`[Eroare] ${username}: ${err.message}`);
    }
  }

  // Scrie raportul CSV
  writeCsv(reportPath, logLines);
  console.log(
    `✅ bulkRegister: ${success}/${users.length} OK, ${failure} eșecuri.`
  );
  console.log(`✅ Raport bulkRegister salvat în ${reportPath}`);
  return reportName;
}
