import express from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { encryptPassword, comparePasswords } from "../utils/cryptoRouter.js";
import { getEncryptionData, buildExtraParams } from "../utils/utils.js";
import { validateNewPassword } from "../middlewares/validateInput.js";
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
  validateNewPassword,
  async (req, res) => {
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

    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [req.user.username]
      );
      const user = result.rows[0];

      // ✅ Verifică parola veche (criptată cu metoda veche)
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

      // 🔐 Obține parametrii pentru noua metodă de criptare (ca în /register)
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
        {
          a: parseInt(affineA),
          b: parseInt(affineB),
        }
      );

      // 🔒 Criptează noua parolă
      const newHashed = await encryptPassword(method, newPassword, {
        hillKey: hillMatrix,
        symmetricKey: symKey,
        rsa,
        caesarKey: parseInt(caesarKey),
        affine: {
          a: parseInt(affineA),
          b: parseInt(affineB),
        },
      });

      // 💾 Actualizează utilizatorul
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
