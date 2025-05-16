// server/attack-scripts/generateUsersDump.js
import fs from "fs";
import path from "path";
import pool from "../db.js";

const OUT_PATH = path.resolve("attack-scripts", "users_dump.csv");

(async () => {
  try {
    const result = await pool.query(
      "SELECT username, password, method, encryption_key FROM users ORDER BY id"
    );

    if (result.rows.length === 0) {
      console.log("❌ Nu există utilizatori în baza de date.");
      return;
    }

    // Fără header, și fără utilizatori cu metoda "vigenere"
    const lines = result.rows
      .filter((row) => row.method !== "vigenere")
      .map((row) =>
        [
          row.username,
          row.password,
          row.method,
          JSON.stringify(row.encryption_key),
        ].join(",")
      );

    fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");
    console.log(
      `✅ Dump generat: ${OUT_PATH} (${lines.length} utilizatori validați)`
    );
  } catch (err) {
    console.error("❌ Eroare la generarea dump-ului:", err.message);
  }
})();
