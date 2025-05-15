import express from "express";
import jwt from "jsonwebtoken";
import { registerValidator } from "../middlewares/authValidators.js";
import config from "../config.js";
import { handleRegister } from "../utils/handleRegister.js";
import { handleLogin } from "../utils/handleLogin.js";

const router = express.Router();

// GET /register
router.get("/register", (req, res) => {
  res.render("register", { message: null });
});

// POST /register — cu validator
router.post("/register", registerValidator, (req, res) => {
  return handleRegister(req, res, false);
});

// POST /vuln-register — fără validator
router.post("/vuln-register", (req, res) => {
  return handleRegister(req, res, true);
});

// GET /login
router.get("/login", (req, res) => {
  res.render("login", { message: null });
});

// POST /login — sigur
router.post("/login", (req, res) => {
  return handleLogin(req, res, false);
});

// POST /vuln-login — vulnerabil
router.post("/vuln-login", (req, res) => {
  return handleLogin(req, res, true);
});

// GET /logout
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.clearCookie("registrationDetails");
  res.redirect("/");
});

export default router;
