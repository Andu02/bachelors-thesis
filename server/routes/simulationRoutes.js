import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import generateUsers from "../attack-scripts/generateUsers.js";
import bulkRegister from "../attack-scripts/bulkRegister.js";
import deleteAllUsers from "../attack-scripts/deleteAllUsers.js";
import dumpUsers from "../attack-scripts/generateUsersDump.js";
import bruteForce from "../attack-scripts/bruteForce.js";
import compareResults from "../attack-scripts/compareResults.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

// ============================
// RENDER PAGINĂ SIMULARE
// ============================
router.get("/simulation", (req, res) => {
  res.render("simulation", { title: "Simulare atacuri cibernetice" });
});

// ============================
// 1. GENEREAZĂ UTILIZATORI ȘI ÎNREGISTREAZĂ-I
// ============================
router.post("/simulation/generate", async (req, res) => {
  try {
    const count = Number(req.body.count) || 1000;
    const csvFile = await generateUsers(count); // user_data_to_encrypt.csv
    await bulkRegister(csvFile); // înregistrează în DB
    res.json({ reportUrl: `/reports/${csvFile}` }); // pentru descărcare CSV
  } catch (err) {
    console.error("Eroare la generare:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// 2. ȘTERGE TOȚI UTILIZATORII
// ============================
router.post("/simulation/delete-all", async (req, res) => {
  try {
    const deleted = await deleteAllUsers();
    res.json({ deleted });
  } catch (err) {
    console.error("Eroare la ștergere:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// 3. BRUTEFORCE PE USERS_DUMP.CSV
// ============================
router.post("/simulation/bruteforce", async (req, res) => {
  try {
    const dumpFile = await dumpUsers(); // users_dump.csv
    const reportFile = await bruteForce(dumpFile); // bruteforce_results.csv
    res.json({ reportUrl: `/reports/${reportFile}` });
  } catch (err) {
    console.error("Eroare la bruteforce:", err);
    res.status(500).json({ error: err.message });
  }
});

// ============================
// 4. COMPARARE CU PAROLE ORIGINALE
// ============================
router.post("/simulation/compare", (req, res) => {
  try {
    const compareFile = compareResults(); // compareResults_report.csv
    res.json({ reportUrl: `/reports/${compareFile}` });
  } catch (err) {
    console.error("Eroare la comparare:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
