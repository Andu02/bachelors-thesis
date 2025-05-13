import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import config from "../config.js";
import { encryptPassword, comparePasswords } from "../utils/cryptoRouter.js";
import { getEncryptionData, buildExtraParams } from "../utils/utils.js";
import { changePasswordValidator } from "../middlewares/authValidators.js";
import { requireAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = "secretKey";

// Ruta protejată: /profile
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      req.user.username,
    ]);
    const user = result.rows[0];

    // Verifică dacă 'method' există și este valid
    if (!user.method) {
      throw new Error("Metoda de criptare nu este definită.");
    }

    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.render("profile", { user, message: null });
  } catch (err) {
    console.error("Eroare la obținerea profilului:", err);
    res.status(500).send("Eroare la profil.");
  }
});

// Ruta protejată: /change-password
router.post(
  "/change-password",
  requireAuth,
  changePasswordValidator,
  async (req, res) => {
    // ← first pull everything out of the body
    const {
      oldPassword,
      newPassword,
      method,
      caesarKey,
      hill,
      symmetricKey,
      rsa,
      affineA,
      affineB,
    } = req.body;

    // 🛑 now you can safely check it
    const irreversibleMethods = ["bcrypt", "sha256"];
    if (irreversibleMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: `Metoda '${method}' nu permite schimbarea parolei cu decriptare.`,
      });
    }

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [req.user.username]
      );
      const user = result.rows[0];

      const valid = await comparePasswords(
        user.method,
        oldPassword,
        user.password,
        buildExtraParams(user.method, user.encryption_key)
      );
      if (!valid) {
        return res
          .status(400)
          .json({ message: "Parola veche este incorectă." });
      }

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
        { a: parseInt(affineA), b: parseInt(affineB) }
      );

      const newHashed = await encryptPassword(method, newPassword, {
        hillKey: hillMatrix,
        symmetricKey: symKey,
        rsa,
        caesarKey: parseInt(caesarKey),
        affine: { a: parseInt(affineA), b: parseInt(affineB) },
      });

      await pool.query(
        "UPDATE users SET password = $1, method = $2, encryption_key = $3 WHERE username = $4",
        [newHashed, method, encryptionKey, req.user.username]
      );

      res.status(200).json({ message: "Parola a fost schimbată cu succes!" });
    } catch (err) {
      console.error("Eroare la schimbarea parolei:", err);
      res.status(500).json({ message: "Eroare la schimbarea parolei." });
    }
  }
);

// Ruta protejată: /success-login
router.get("/success-login", requireAuth, (req, res) => {
  res.render("success-login", { username: req.user.username });
});

export default router;
