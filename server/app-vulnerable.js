// server/app-vulnerable.js

import express from "express";
import config from "./config.js";
import pool from "./db.js";
import { fileURLToPath } from "url";
import path from "path";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// body parser
app.use(express.urlencoded({ extended: true }));

// static files (CSS/JS/images)
app.use(express.static(path.join(__dirname, "../public")));

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// --- RUTA VULNERABILĂ --------------------------------------

// GET /vuln-login – afișează formularul
app.get("/vuln-login", (req, res) => {
  console.log("✔  GET /vuln-login");
  res.render("login", { message: null });
});

// POST /vuln-login – SQL Injection prin concatenare directă
app.post("/vuln-login", async (req, res) => {
  console.log("→ POST /vuln-login body:", req.body);
  const { username, password } = req.body;
  const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log("   SQL:", sql);
  try {
    const result = await pool.query(sql);
    console.log("   DB rows:", result.rows.length);
    if (result.rows.length > 0) {
      return res.send("Autentificat cu succes (vulnerabil)");
    }
    return res.render("login", { message: "Utilizatorul nu există." });
  } catch (err) {
    console.error("🔥 DB error:", err);
    return res.status(500).send("Eroare internă");
  }
});

// ping pentru verificări rapide
app.get("/ping", (_req, res) => res.send("Server vulnerabil funcționează!"));

// 404 fallback
app.use((req, res) => {
  console.log(`⚠ 404 ${req.method} ${req.path}`);
  res.status(404).send("404 Not Found");
});

// pornește serverul
const port = config.port || 3000;
app.listen(port, () => {
  console.log(`🚀 Vulnerable app la http://localhost:${port}/vuln-login`);
});
