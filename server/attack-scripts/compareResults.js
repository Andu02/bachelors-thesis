// server/attack-scripts/compareResults.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userDataPath = path.resolve(__dirname, "1k_user_data_to_encrypt.csv");
const bruteResPath = path.resolve(__dirname, "bruteforce_results.csv");
const outputPath = path.resolve(__dirname, "compareResults_report.csv");

// Verificăm existența fișierelor
for (const p of [userDataPath, bruteResPath]) {
  if (!fs.existsSync(p)) {
    console.error(`❌ Fișier inexistent: ${p}`);
    process.exit(1);
  }
}

// --- Parse user data manually ---
const users = {};
const userLines = fs
  .readFileSync(userDataPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean);
// Prima linie e header, o sărim
userLines.shift();
for (const line of userLines) {
  const parts = line.split(",");
  const username = parts[0];
  const originalPassword = parts[1];
  const method = parts[2];
  // Reconstruim cheia (fără ghilimele)
  let encryption_key = parts.slice(3).join(",");
  encryption_key = encryption_key.replace(/^"|"$/g, "").replace(/""/g, '"');
  users[username] = { originalPassword, method, encryption_key };
}

// --- Pregătim raportul de output ---
const outStream = fs.createWriteStream(outputPath, { flags: "w" });
outStream.write(
  "username,method,originalPassword,crackedPassword,encryption_key\n"
);

// --- Parse brute-force results manually ---
const bruteLines = fs
  .readFileSync(bruteResPath, "utf8")
  .split(/\r?\n/)
  .filter(Boolean);
// Sărim și aici headerul
bruteLines.shift();

let nMatch = 0,
  nTotal = 0;

for (const line of bruteLines) {
  const cols = line.split(",");
  const username = cols[0];
  const method = cols[1];
  const crackedPassword = cols[4];
  const u = users[username];
  if (!u) continue;

  nTotal++;
  // comparăm case-insensitive
  if (u.originalPassword.toLowerCase() === crackedPassword.toLowerCase()) {
    nMatch++;
  } else {
    // escapăm ghilimelele din encryption_key
    const ek = u.encryption_key.replace(/"/g, '""');
    outStream.write(
      `${username},${method},${u.originalPassword},${crackedPassword},"${ek}"\n`
    );
  }
}

// linia de summary
outStream.write(`\n# Potriviri (case-insensitive): ${nMatch} / ${nTotal}\n`);
outStream.end(() => {
  console.log(
    `✅ Raport comparare salvat în ${outputPath} (Potriviri: ${nMatch}/${nTotal})`
  );
});
