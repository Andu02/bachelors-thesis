import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import generateUsers from "../attack-scripts/generateUser.js";
import bulkRegister from "../attack-scripts/bulkRegister.js";
import deleteAllUsers from "../attack-scripts/deleteAllUsers.js";
import dumpUsers from "../attack-scripts/generateUsersDump.js";
import bruteForce from "../attack-scripts/bruteForce.js";
import compareResults from "../attack-scripts/compareResults.js"; // ✅ sincron

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get("/simulation", (req, res) => {
  res.render("simulation", { title: "Simulare atacuri cibernetice" });
});

router.post("/simulation/generate", async (req, res) => {
  try {
    const count = Number(req.body.count) || 1000;
    const csvFile = await generateUsers(count);
    await bulkRegister(csvFile);
    res.json({ reportUrl: `/reports/${csvFile}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/simulation/delete-all", async (req, res) => {
  try {
    const deleted = await deleteAllUsers();
    res.json({ deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/simulation/bruteforce", async (req, res) => {
  try {
    const dumpFile = await dumpUsers();
    const reportFile = await bruteForce(dumpFile);
    res.json({ reportUrl: `/reports/${reportFile}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/simulation/compare", (req, res) => {
  try {
    const compareFile = compareResults(); // ✅ sincron
    res.json({ reportUrl: `/reports/${compareFile}` });
  } catch (err) {
    console.error("Eroare la comparare:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
