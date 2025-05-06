import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { encryptPassword, comparePasswords } from "../utils/cryptoRouter.js";
import { getEncryptionData, buildExtraParams } from "../utils/utils.js";
import { validateUsername, validatePassword } from "../utils/validators.js";

const router = express.Router();
const JWT_SECRET = "secretKey"; // În producție folosește .env

// RUTA REGISTER
router.get("/register", (req, res) => {
  res.render("register", { message: null });
});

router.post("/register", async (req, res) => {
  const { username, password, method, hill, symmetricKey, rsa } = req.body;

  if (!validateUsername(username)) {
    return res.render("register", {
      message: "Username-ul trebuie să aibă între 3 și 20 de caractere.",
    });
  }

  if (!validatePassword(password)) {
    return res.render("register", {
      message: "Parola trebuie să aibă între 6 și 30 de caractere.",
    });
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
      { httpOnly: false, maxAge: 3600000 }
    );

    res.render("success-register", {
      details: JSON.parse(req.cookies.registrationDetails || "{}"),
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.render("register", {
        message: "Acest nume de utilizator este deja folosit.",
      });
    }
    console.error("Eroare la înregistrare:", err);
    res
      .status(500)
      .render("register", { message: "Eroare la salvare în baza de date." });
  }
});

// RUTA LOGIN (GET)
router.get("/login", (req, res) => {
  res.render("login", { message: null });
});

// RUTA LOGIN
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.render("login", { message: "Utilizatorul nu există." });
    }

    const user = result.rows[0];
    const extra = buildExtraParams(user.method, user.encryption_key);

    const valid = await comparePasswords(
      user.method,
      password,
      user.password,
      extra
    );
    if (!valid) {
      return res.render("login", { message: "Parolă incorectă." });
    }

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });

    res.render("success-login", { username });
  } catch (err) {
    console.error("Eroare la autentificare:", err);
    res.status(500).render("login", { message: "Eroare la autentificare." });
  }
});

// RUTA PROFIL
router.get("/profile", (req, res) => {
  const token = req.cookies.authToken;
  if (!token) return res.redirect("/login.html");

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.redirect("/login.html");

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [decoded.username]
      );
      const user = result.rows[0];
      res.render("profile", { user, message: null });
    } catch (err) {
      console.error("Eroare la obținerea datelor utilizatorului:", err);
      res.status(500).send("Eroare la obținerea datelor utilizatorului.");
    }
  });
});

// RUTA SCHIMBARE PAROLĂ
router.post("/change-password", async (req, res) => {
  const { username, password, method, hill, symmetricKey, rsa } = req.body;
  const token = req.cookies.authToken;

  if (!token) return res.status(401).send("Nu sunteți autentificat.");

  if (!validatePassword(newPassword)) {
    return res
      .status(400)
      .send("Parola nouă trebuie să aibă între 6 și 30 de caractere.");
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).send("Token invalid.");

    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      decoded.username,
    ]);
    const user = result.rows[0];

    const valid = await comparePasswords(
      user.method,
      oldPassword,
      user.password,
      buildExtraParams(user.method, user.encryption_key)
    );
    if (!valid) return res.status(400).send("Parola veche este incorectă.");

    try {
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
        [newHashed, method, encryptionKey, decoded.username]
      );

      res.send("Parola a fost schimbată cu succes!");
    } catch (err) {
      console.error("Eroare la schimbarea parolei:", err);
      res.status(500).send("Eroare la schimbarea parolei.");
    }
  });
});

// RUTA DELOGARE
router.get("/logout", (req, res) => {
  res.clearCookie("authToken");
  res.redirect("/index.html");
});

export default router;
