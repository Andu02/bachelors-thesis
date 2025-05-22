// ============================
// Importuri necesare
// ============================
import express from "express";
import { registerValidator } from "../middlewares/authValidators.js";
import { handleRegister } from "../utils/handleRegister.js";
import { handleLogin } from "../utils/handleLogin.js";

// ============================
// Inițializare router Express
// ============================
const router = express.Router();

// ============================
// Rute GET pentru afișarea paginilor
// ============================
router.get("/register", (req, res) => {
  res.render("register", { message: null });
});

router.get("/login", (req, res) => {
  res.render("login", { message: null });
});

router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.clearCookie("registrationDetails");
  res.redirect("/");
});

// ============================
// Rute POST pentru procesarea formularelor
// ============================
// Înregistrare cu validare
router.post("/register", registerValidator, (req, res) => {
  return handleRegister(req, res, false);
});

// Înregistrare fără validare (vulnerabilă)
router.post("/vuln-register", (req, res) => {
  return handleRegister(req, res, true);
});

// Autentificare sigură
router.post("/login", (req, res) => {
  return handleLogin(req, res, false);
});

// Autentificare vulnerabilă
router.post("/vuln-login", (req, res) => {
  return handleLogin(req, res, true);
});

// ============================
// Export router pentru utilizare în app.js
// ============================
export default router;
