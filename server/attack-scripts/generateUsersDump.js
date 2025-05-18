import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import pool from "../db.js"; // ✅ adăugat

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function dumpUsers() {
  const result = await pool.query(
    "SELECT username, password, method, encryption_key FROM users ORDER BY id"
  );
  if (result.rows.length === 0) {
    throw new Error("Nu există utilizatori în baza de date.");
  }

  const reportName = "users_dump.csv";
  const reportPath = path.resolve(__dirname, reportName);

  const header = "username,password,method,encryption_key";
  const lines = result.rows
    .filter((r) => !["vigenere", "rsa"].includes(r.method))
    .map((r) => {
      const ek =
        typeof r.encryption_key === "string"
          ? r.encryption_key
          : JSON.stringify(r.encryption_key);
      const esk = ek.replace(/"/g, '""');
      return `${r.username},${r.password},${r.method},"${esk}"`;
    });

  fs.writeFileSync(reportPath, [header, ...lines].join("\n"), "utf-8");
  console.log(`✅ Dump generat: ${reportPath} (${lines.length} intrări)`);
  return reportName;
}
