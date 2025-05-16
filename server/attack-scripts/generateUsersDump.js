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

    // Adaugă header la CSV
    const lines = [
      "username,password,method,encryption_key",
      ...result.rows
        .filter((row) => row.method !== "vigenere" && row.method !== "rsa")
        .map((row) => {
          // punem între ghilimele orice encryption_key care poate conține virgule
          const ekRaw =
            typeof row.encryption_key === "string"
              ? row.encryption_key
              : JSON.stringify(row.encryption_key);
          const ekEsc = ekRaw.replace(/"/g, '""');
          return [row.username, row.password, row.method, `"${ekEsc}"`].join(
            ","
          );
        }),
    ];

    fs.writeFileSync(OUT_PATH, lines.join("\n"), "utf8");
    console.log(
      `✅ Dump generat: ${OUT_PATH} (${lines.length - 1} utilizatori validați)`
    );
  } catch (err) {
    console.error("❌ Eroare la generarea dump-ului:", err.message);
  }
})();
