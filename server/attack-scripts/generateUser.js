// ============================
// Importuri necesare
// ============================
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import * as math from "mathjs";
import pool from "../db.js";
import { getReportPath, writeCsv } from "../utils/utils.js";

// ============================
// Setare __dirname
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================
// Dicționar parole (din public/reports)
// ============================
const dictPath = path.resolve(
  __dirname,
  "../../public/reports",
  "100k-most-used-passwords-NCSC.txt"
);
const allPasswords = fs
  .readFileSync(dictPath, "utf-8")
  .split(/\r?\n/)
  .filter(Boolean);
const letterPasswords = allPasswords.filter((pw) => /^[A-Za-z]+$/.test(pw));

// ============================
// Generatoare de chei random
// ============================
function randomCaesarKey() {
  return String(Math.floor(Math.random() * 25) + 1);
}
function randomAffineKey() {
  const validA = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
  const a = validA[Math.floor(Math.random() * validA.length)];
  const b = Math.floor(Math.random() * 26);
  return JSON.stringify({ a, b });
}
function randomHillKey() {
  let a, b, c, d, det;
  do {
    a = Math.floor(Math.random() * 26);
    b = Math.floor(Math.random() * 26);
    c = Math.floor(Math.random() * 26);
    d = Math.floor(Math.random() * 26);
    det = (a * d - b * c) % 26;
    if (det < 0) det += 26;
  } while (math.gcd(det, 26) !== 1);
  return JSON.stringify([
    [a, b],
    [c, d],
  ]);
}
function randomHexKey() {
  return crypto.randomBytes(16).toString("hex");
}
function randomSalt() {
  return crypto.randomBytes(4).toString("hex");
}
function randomBcryptSalt() {
  return String(Math.floor(Math.random() * 7) + 8);
}

// ============================
// Funcția principală
// ============================
export default async function generateUsers(count = 1000) {
  const methods = [
    "caesar",
    "hill",
    "affine",
    "ecb",
    "cbc",
    "sha256",
    "bcrypt",
  ];
  const samplesPerMethod = Math.floor(count / methods.length);

  // ============================
  // Determină numărul de la care continuăm numerotarea
  // ============================
  let userCounter = 1;
  try {
    const [result] = await pool.query(
      "SELECT MAX(CAST(SUBSTRING(username, 5) AS UNSIGNED)) AS last_id FROM users WHERE username LIKE 'user%';"
    );
    const lastId = result[0]?.last_id;
    if (lastId !== null && !isNaN(lastId)) {
      userCounter = lastId + 1;
    }
  } catch (err) {
    console.warn("⚠️ Nu s-a putut obține ultimul ID din DB:", err.message);
  }

  // ============================
  // Pregătește salvarea CSV
  // ============================
  const { reportName, reportPath } = getReportPath("user_data_to_encrypt");
  const output = [["username", "password", "method", "encryption_key"]];

  for (const method of methods) {
    const pool = (
      ["caesar", "hill", "affine"].includes(method)
        ? letterPasswords
        : allPasswords
    )
      .sort(() => 0.5 - Math.random())
      .slice(0, samplesPerMethod);

    for (const password of pool) {
      const username = `user${userCounter++}`;
      let encryption_key = "";
      switch (method) {
        case "caesar":
          encryption_key = randomCaesarKey();
          break;
        case "affine":
          encryption_key = randomAffineKey();
          break;
        case "hill":
          encryption_key = randomHillKey();
          break;
        case "ecb":
        case "cbc":
          encryption_key = randomHexKey();
          break;
        case "sha256":
          encryption_key = randomSalt();
          break;
        case "bcrypt":
          encryption_key = randomBcryptSalt();
          break;
      }

      // ============================
      // Transformă parola doar dacă e metodă pe litere
      // ============================
      const adjustedPassword = ["caesar", "hill", "affine"].includes(method)
        ? password.toUpperCase()
        : password;

      output.push([username, adjustedPassword, method, encryption_key]);
    }
  }

  // ============================
  // Scrie fișierul CSV
  // ============================
  writeCsv(reportPath, output);
  return reportName;
}
