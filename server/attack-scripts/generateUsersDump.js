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
// Funcția principală: extrage utilizatori din DB
// ============================
export default async function dumpUsers() {
  const result = await pool.query(
    "SELECT username, password, method, encryption_key FROM users ORDER BY id"
  );

  if (result.rows.length === 0) {
    throw new Error("Nu există utilizatori în baza de date.");
  }

  // Pregătește rândurile CSV
  const lines = [["username", "password", "method", "encryption_key"]];
  result.rows
    .filter((r) => !["vigenere", "rsa"].includes(r.method))
    .forEach((r) => {
      const ek =
        typeof r.encryption_key === "string"
          ? r.encryption_key
          : JSON.stringify(r.encryption_key);
      lines.push([r.username, r.password, r.method, ek]);
    });

  // Scrie raportul CSV
  const { reportName, reportPath } = getReportPath("users_dump");
  writeCsv(reportPath, lines);

  console.log(`✅ Dump generat: ${reportPath} (${lines.length - 1} intrări)`);
  return reportName;
}
