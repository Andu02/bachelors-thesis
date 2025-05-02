import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { encryptPassword, comparePasswords } from "../utils/cryptoRouter.js";
import { getEncryptionData } from "../utils/utils.js";

const router = express.Router();
const JWT_SECRET = "secretKey"; // În producție folosește .env

router.get("/register", (req, res) => {
  res.render("register", { message: null });
});

// RUTA DE ÎNREGISTRARE
router.post("/register", async (req, res) => {
  const { username, password, method, hill, symmetricKey } = req.body;

  if (username.length < 3 || username.length > 20) {
    return res
      .status(400)
      .send("Username-ul trebuie să aibă între 3 și 20 de caractere.");
  }

  if (password.length < 6 || password.length > 30) {
    return res
      .status(400)
      .send("Parola trebuie să aibă între 6 și 30 de caractere.");
  }

  try {
    const {
      encryptionKey,
      hillMatrix,
      symmetricKey: symKey,
    } = getEncryptionData(method, hill, symmetricKey);

    const start = Date.now();
    const encryptedPassword = await encryptPassword(method, password, {
      hillKey: hillMatrix,
      symmetricKey: symKey,
    });
    const encryptionTime = Date.now() - start;

    await pool.query(
      "INSERT INTO users (username, password, method, encryption_key) VALUES ($1, $2, $3, $4)",
      [username, encryptedPassword, method, encryptionKey]
    );

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });

    res.cookie(
      "registrationDetails",
      JSON.stringify({
        username,
        method,
        originalPassword: password,
        encryptedPassword,
        encryptionTime,
      }),
      {
        httpOnly: false,
        maxAge: 3600000,
      }
    );

    res.redirect("/success-register.html");
  } catch (err) {
    if (err.code === "23505") {
      return res
        .status(400)
        .send("Acest nume de utilizator este deja folosit.");
    }
    console.error("Eroare la înregistrare:", err);
    res.status(500).send("Eroare la salvare în baza de date.");
  }
});

// RUTA DE LOGARE
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  if (result.rows.length === 0) {
    return res.status(401).send("Utilizatorul nu există.");
  }

  const user = result.rows[0];
  const storedPassword = user.password;
  const method = user.method;

  try {
    let extra = {};
    if (method === "hill" && user.encryption_key) {
      extra.hillKey = JSON.parse(user.encryption_key);
    } else if ((method === "ecb" || method === "cbc") && user.encryption_key) {
      extra.symmetricKey = user.encryption_key;
    }

    const valid = await comparePasswords(
      method,
      password,
      storedPassword,
      extra
    );

    if (!valid) {
      return res.status(401).send("Parolă incorectă.");
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("authToken", token, { httpOnly: true });
    res.redirect("/success-login.html");
  } catch (err) {
    console.error("Eroare la verificarea parolei:", err);
    res.status(500).send("Eroare la verificarea parolei.");
  }
});

// RUTA PROFIL
router.get("/profile", (req, res) => {
  const token = req.cookies.authToken;
  if (!token) return res.redirect("/login.html");

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.redirect("/login.html");

    const username = decoded.username;

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      const user = result.rows[0];
      res.render("profile", { user, message: null });
    } catch (err) {
      console.error("Eroare la obținerea datelor utilizatorului:", err);
      res.status(500).send("Eroare la obținerea datelor utilizatorului.");
    }
  });
});

// RUTA DE SCHIMBARE A PAROLEI
router.post("/change-password", async (req, res) => {
  const { oldPassword, newPassword, method, hill, symmetricKey } = req.body;
  const token = req.cookies.authToken;

  if (!token) return res.status(401).send("Nu sunteți autentificat.");

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).send("Token invalid.");

    const username = decoded.username;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];

    try {
      const valid = await comparePasswords(
        user.method,
        oldPassword,
        user.password
      );
      if (!valid) return res.status(400).send("Parola veche este incorectă.");

      const {
        encryptionKey,
        hillMatrix,
        symmetricKey: symKey,
      } = getEncryptionData(method, hill, symmetricKey);

      const newHashed = await encryptPassword(method, newPassword, {
        hillKey: hillMatrix,
        symmetricKey: symKey,
      });

      await pool.query(
        "UPDATE users SET password = $1, method = $2, encryption_key = $3 WHERE username = $4",
        [newHashed, method, encryptionKey, username]
      );

      res.send("Parola a fost schimbată cu succes!");
    } catch (err) {
      console.error("Eroare la schimbarea parolei:", err);
      res.status(500).send("Eroare la schimbarea parolei.");
    }
  });
});

//RUTA DE DELGARE
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/index.html");
});

export default router;
