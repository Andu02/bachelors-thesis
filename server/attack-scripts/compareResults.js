// server/attack-scripts/compareResults.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csvParser from "csv-parser";

// Rezolvăm directorul curent al scriptului
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Căi către fișiere
const userDataPath = path.resolve(__dirname, "1k_user_data_to_encrypt.csv");
const bruteResPath = path.resolve(__dirname, "bruteforce_results.csv");
const outputPath = path.resolve(__dirname, "compareResults_report.csv");

// Verificăm existența fișierelor de input
for (const p of [userDataPath, bruteResPath]) {
  if (!fs.existsSync(p)) {
    console.error(`❌ Fișier inexistent: ${p}`);
    process.exit(1);
  }
}

// Încarcă fișierul cu utilizatori originali
const users = {};
fs.createReadStream(userDataPath)
  .pipe(csvParser({ strict: true, mapHeaders: ({ header }) => header.trim() }))
  .on("data", (row) => {
    users[row.username] = {
      originalPassword: row.password,
      method: row.method,
      encryption_key: row.encryption_key,
    };
  })
  .on("end", () => {
    // Pregătește CSV-ul de output
    const outStream = fs.createWriteStream(outputPath, { flags: "w" });
    outStream.write(
      "username,method,originalPassword,crackedPassword,encryption_key\n"
    );

    // Încarcă rezultatele brute-force
    const data = fs.readFileSync(bruteResPath, "utf8");
    const lines = data.split(/\r?\n/).filter(Boolean);

    let nMatch = 0,
      nTotal = 0;

    for (const line of lines.slice(1)) {
      // skip header
      const [username, method, attempts, time, crackedPassword] =
        line.split(",");
      const u = users[username];
      if (!u) continue;

      nTotal++;
      if (u.originalPassword === crackedPassword) {
        nMatch++;
      } else {
        // Escapăm ghilimelele în encryption_key înainte de CSV
        const ek = u.encryption_key.replace(/"/g, '""');
        outStream.write(
          `${username},${method},${u.originalPassword},${crackedPassword},"${ek}"\n`
        );
      }
    }

    // Linia de summary
    outStream.write(`\n# Potriviri: ${nMatch} / ${nTotal}\n`);
    outStream.end(() => {
      console.log(
        `✅ Raport comparare salvat în ${outputPath} (Potriviri: ${nMatch}/${nTotal})`
      );
    });
  });
