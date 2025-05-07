import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Import rute
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import simulationRoutes from "./routes/simulationRoutes.js";

const app = express();

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

// Pornirea serverului
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
