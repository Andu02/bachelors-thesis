import express from "express";
import config from "./config.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";

// Import rute
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

const app = express();

//  global limiter: max 200 requests per 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// more restrictive limiter for password changes
const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // only 5 attempts per window
  message: {
    message:
      "Prea multe încercări de schimbare parolă, încearcă peste 15 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/change-password", changePasswordLimiter);

// and one for your simulation endpoint (e.g. brute-force demo)
const simulationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // no more than 10 sim. attacks per minute
  message: {
    message:
      "Rate limit atins pentru simulări, încearcă din nou peste un minut.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
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

// Rute organizate pe module
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/", profileRoutes);
app.use("/", simulationRoutes);

// Test ping
app.get("/ping", (req, res) => {
  res.send("Serverul funcționează!");
});

// 404 handler
app.use((req, res) => {
  res.status(404).render("404");
});

// Pornirea serverului
app.listen(config.port, () => {
  console.log(`Serverul rulează pe http://localhost:${config.port}`);
});
