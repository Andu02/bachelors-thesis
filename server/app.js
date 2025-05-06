import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/authRoutes.js";
import simulationRouters from "./routes/simulationRoutes.js";

const app = express();
const JWT_SECRET = "secretKey"; // Folosește .env în producție

// Configurare __dirname în ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setări Express
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Servirea fișierelor statice (CSS, JS, imagini)
app.use(express.static(path.join(__dirname, "../public")));

// ✅ Rute aplicație
app.use("/", authRoutes);
app.use("/", simulationRouters);

// ✅ Ruta principală – index.ejs sau redirect dacă e logat
app.get("/", (req, res) => {
  const token = req.cookies.authToken;
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (!err) {
        return res.redirect("/profile");
      }
    });
  }
  res.render("index");
});

// ✅ Test ping
app.get("/ping", (req, res) => {
  res.send("Serverul funcționează!");
});

// ✅ Pornirea serverului
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
