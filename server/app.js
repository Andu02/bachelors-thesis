import express from "express";
import config from "./config.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

// Constante configurabile
const GLOBAL_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const GLOBAL_LIMIT_MAX = 5000;

const CHANGE_PASSWORD_WINDOW_MS = 15 * 60 * 1000;
const CHANGE_PASSWORD_MAX = 5;

const SIMULATION_WINDOW_MS = 60 * 1000;
const SIMULATION_MAX = 10;

// Limitatori
const globalLimiter = rateLimit({
  windowMs: GLOBAL_LIMIT_WINDOW_MS,
  max: GLOBAL_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

const changePasswordLimiter = rateLimit({
  windowMs: CHANGE_PASSWORD_WINDOW_MS,
  max: CHANGE_PASSWORD_MAX,
  message: {
    message:
      "Prea multe încercări de schimbare parolă, încearcă peste 15 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const simulationLimiter = rateLimit({
  windowMs: SIMULATION_WINDOW_MS,
  max: SIMULATION_MAX,
  message: {
    message:
      "Rate limit atins pentru simulări, încearcă din nou peste un minut.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Import rute
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

const app = express();

// Aplicare limitatori
app.use(globalLimiter);
app.use("/change-password", changePasswordLimiter);
app.use("/simulate-attack", simulationLimiter);

// Configurare __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setări Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Rute
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", simulationRoutes);

// Ping test
app.get("/ping", (req, res) => {
  res.send("Serverul funcționează!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("404");
});

// Start server
app.listen(config.port, () => {
  console.log(`Serverul rulează pe http://localhost:${config.port}`);
});
