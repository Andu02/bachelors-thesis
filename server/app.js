// ============================
// Importuri necesare
// ============================
import express from "express";
import config from "./config.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// ============================
// Import rate-limiters
// ============================
import {
  globalLimiter,
  changePasswordLimiter,
  simulationLimiter,
} from "./middlewares/rateLimiters.js";

// ============================
// Import rute definite modular
// ============================
import publicRoutes from "./routes/publicRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

// ============================
// Inițializare aplicație
// ============================
const app = express();

// ============================
// Aplicare rate-limiters
// ============================
app.use(globalLimiter);
app.use("/change-password", changePasswordLimiter);
app.use("/simulation", simulationLimiter);

// ============================
// Setare __dirname
// ============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================
// Servire fișiere statice
// ============================
app.use("/reports", express.static(path.join(__dirname, "public/reports")));
app.use(express.static(path.join(__dirname, "../public")));

// ============================
// Setări Express
// ============================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================
// Montare rute aplicație
// ============================
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", simulationRoutes);

// ============================
// Rută de testare conectivitate
// ============================
app.get("/ping", (req, res) => {
  res.send("Serverul funcționează!\n");
});

// ============================
// Handler 404 pentru rute inexistente
// ============================
app.use((req, res) => {
  res.status(404).render("404");
});

// ============================
// Start server
// ============================
app.listen(config.port, () => {
  console.log(`Serverul rulează pe ${config.serverUrl}\n`);
});
