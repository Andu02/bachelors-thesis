// ============================
// Importuri necesare
// ============================
import jwt from "jsonwebtoken";
import pool from "../db.js";
import config from "../config.js";
import { encryptPassword } from "./cryptoRouter.js";
import { getEncryptionData } from "./utils.js";

// ============================
// Funcția principală pentru înregistrare
// ============================
export async function handleRegister(req, res, isVulnerable = false) {
  try {
    // ============================
    // Extragem datele trimise din request
    // ============================
    const {
      username,
      password,
      method,
      caesarKey,
      hill,
      symmetricKey,
      rsa,
      affine,
      affineA,
      affineB,
      bcryptSalt,
      sha256Salt,
    } = req.body;

    // ============================
    // Procesăm cheia pentru cifrul affine
    // ============================
    const parsedAffine = affine
      ? typeof affine === "string"
        ? JSON.parse(affine)
        : affine
      : { a: parseInt(affineA), b: parseInt(affineB) };

    // ============================
    // Obținem datele de criptare în funcție de metodă
    // ============================
    const {
      encryptionKey,
      hillMatrix,
      symmetricKey: symKey,
    } = getEncryptionData(
      method,
      hill,
      symmetricKey,
      rsa,
      parseInt(caesarKey),
      parsedAffine,
      parseInt(bcryptSalt),
      sha256Salt
    );

    // ============================
    // Criptăm parola și măsurăm timpul de execuție
    // ============================
    const start = Date.now();
    const encryptedPassword = await encryptPassword(method, password, {
      hillKey: hillMatrix,
      symmetricKey: symKey,
      rsa,
      caesarKey: parseInt(caesarKey),
      affine: parsedAffine,
      bcryptSalt: parseInt(bcryptSalt),
      sha256Salt,
    });
    const encryptionTime = Date.now() - start;

    // ============================
    // Inserăm utilizatorul și parola criptată în baza de date
    // ============================
    await pool.query(
      "INSERT INTO users (username, password, method, encryption_key) VALUES ($1, $2, $3, $4)",
      [username, encryptedPassword, method, encryptionKey]
    );

    // ============================
    // Generăm token JWT și îl setăm în cookie
    // ============================
    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: "1h" });
    res.cookie("authToken", token, { httpOnly: true });

    // ============================
    // Setăm cookie cu detalii pentru debug sau afișare client
    // ============================
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

    return res.status(200).json({ message: "Cont creat cu succes!" });
  } catch (err) {
    if (!isVulnerable && err.code === "23505") {
      return res
        .status(400)
        .json({ message: "Acest nume de utilizator este deja folosit." });
    }

    console.error("Eroare la înregistrare:", err);
    return res.status(500).json({ message: "Eroare internă la înregistrare." });
  }
}
