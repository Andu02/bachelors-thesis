// ============================
// Importuri necesare
// ============================
import jwt from "jsonwebtoken";
import pool from "../db.js";
import config from "../config.js";
import { comparePasswords } from "./cryptoRouter.js";

// ============================
// Funcția principală pentru autentificare
// ============================
export async function handleLogin(req, res, isVulnerable = false) {
  try {
    const { username, password } = req.body;

    // ============================
    // Variante vulnerabile pentru demonstrație SQL Injection
    // ============================
    if (isVulnerable) {
      const rawQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      console.log("Query executat:", rawQuery);
      const result = await pool.query(rawQuery);

      if (result.rows.length > 0) {
        return res.send("Autentificare reușită ca: " + result.rows[0].username);
      } else {
        return res.send("Autentificare eșuată");
      }
    }

    // ============================
    // Autentificare sigură (fără SQL Injection)
    // ============================
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.render("login", { message: "Utilizatorul nu există." });
    }

    const user = result.rows[0];
    let extra = {};

    // ============================
    // Reconstruim parametrii în funcție de metoda criptografică
    // ============================
    switch (user.method) {
      case "rsa": {
        const { p, q, e } = JSON.parse(user.encryption_key);
        extra.rsa = { p: BigInt(p), q: BigInt(q), e: BigInt(e) };
        break;
      }
      case "affine": {
        const { a, b } = JSON.parse(user.encryption_key);
        extra.affine = { a: parseInt(a), b: parseInt(b) };
        break;
      }
      case "caesar":
        extra.caesarKey = parseInt(user.encryption_key);
        break;
      case "hill":
        extra.hillKey = JSON.parse(user.encryption_key);
        break;
      case "ecb":
      case "cbc":
        extra.symmetricKey = user.encryption_key;
        break;
      case "bcrypt":
        extra.bcryptSalt = parseInt(user.encryption_key);
        break;
      case "sha256":
        extra.sha256Salt = user.encryption_key;
        break;
    }

    // ============================
    // Comparăm parola introdusă cu parola criptată
    // ============================
    const valid = await comparePasswords(
      user.method,
      password,
      user.password,
      extra
    );

    if (!valid) {
      return res.render("login", { message: "Parolă incorectă." });
    }

    // ============================
    // Autentificare reușită: generăm token JWT
    // ============================
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });

    res.redirect("/success-login");
  } catch (err) {
    console.error("Eroare la autentificare:", err);
    res.status(500).render("login", { message: "Eroare la autentificare." });
  }
}
