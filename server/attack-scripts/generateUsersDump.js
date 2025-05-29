// ============================
// Importuri necesare
// ============================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pool from "../db.js";
import { getReportPath, writeCsv } from "../utils/utils.js";

// ============================
// Setare __dirname
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Metode pe care nu le includem în dump
// ============================
const EXCLUDED_METHODS = ["vigenere", "rsa"];

// ============================
// Funcția principală: extrage utilizatori din DB
// ============================
export default async function generateUsersDumps() {
  try {
    const result = await pool.query(
      "SELECT username, password, method, encryption_key FROM users ORDER BY id;"
    );
    const rows = result.rows;

    if (rows.length === 0) {
      throw new Error("Nu există utilizatori în baza de date.");
    }

    // Construim rândurile CSV, excluzând metodele nedorite
    const lines = [
      ["username", "password", "method", "encryption_key"],
      ...rows
        .filter(({ method }) => !EXCLUDED_METHODS.includes(method))
        .map(({ username, password, method, encryption_key }) => {
          const ek =
            typeof encryption_key === "string"
              ? encryption_key
              : JSON.stringify(encryption_key);
          return [username, password, method, ek];
        }),
    ];

    const { reportName, reportPath } = getReportPath("users_dump");
    writeCsv(reportPath, lines);

    console.log(
      `Dump generat: ${reportPath} (${lines.length - 1} intrări; ` +
        `${rows.length - (lines.length - 1)} excluse)`
    );
    return reportName;
  } catch (err) {
    console.error("Eroare la generarea dump-ului de utilizatori:", err.message);
    throw err;
  }
}
