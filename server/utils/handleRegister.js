// server/utils/handleRegister.js
import jwt from "jsonwebtoken";
import pool from "../db.js";
import config from "../config.js";
import { encryptPassword } from "./cryptoRouter.js";
import { getEncryptionData } from "./utils.js";

export async function handleRegister(req, res, isVulnerable = false) {
  try {
    const {
      username,
      password,
      method,
      caesarKey,
      hill,
      symmetricKey,
      rsa,
      affineA,
      affineB,
      bcryptSalt,
      sha256Salt, // ✅ nou
    } = req.body;

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
      { a: parseInt(affineA), b: parseInt(affineB) },
      parseInt(bcryptSalt),
      sha256Salt // ✅ nou
    );

    const start = Date.now();
    const encryptedPassword = await encryptPassword(method, password, {
      hillKey: hillMatrix,
      symmetricKey: symKey,
      rsa,
      caesarKey: parseInt(caesarKey),
      affine: { a: parseInt(affineA), b: parseInt(affineB) },
      bcryptSalt: parseInt(bcryptSalt),
      sha256Salt, // ✅ nou
    });
    const encryptionTime = Date.now() - start;

    await pool.query(
      "INSERT INTO users (username, password, method, encryption_key) VALUES ($1, $2, $3, $4)",
      [username, encryptedPassword, method, encryptionKey]
    );

    const token = jwt.sign({ username }, config.jwtSecret, { expiresIn: "1h" });
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
