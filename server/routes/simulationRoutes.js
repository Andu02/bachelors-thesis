import express from 'express';
import db from '../db.js';
import fs from 'fs';
import * as caesar from '../crypto-methods/caesar.js';
import * as affine from '../crypto-methods/affine.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 🔽 Dicționar extern din fișier rockyou-sample.txt
const dictionary = fs.readFileSync('./utils/rockyou-sample.txt', 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(Boolean);

router.post('/simulate-attack', async (req, res) => {
  const { algorithm, hash } = req.body;

  try {
    if (algorithm === 'caesar') {
      for (let k = 1; k < 26; k++) {
        for (let word of dictionary) {
          const encrypted = caesar.encrypt(word, k);
          if (encrypted === hash) {
            return res.json({ success: true, result: word, method: 'Caesar', key: k });
          }
        }
      }
      return res.json({ success: false, message: 'Nicio potrivire în dicționar pentru Caesar' });
    }

    if (algorithm === 'affine') {
      const aList = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
      for (let a of aList) {
        for (let b = 0; b < 26; b++) {
          for (let word of dictionary) {
            try {
              const encrypted = affine.encrypt(word, a, b);
              if (encrypted === hash) {
                return res.json({ success: true, result: word, method: 'Afin', key: `a=${a}, b=${b}` });
              }
            } catch {}
          }
        }
      }
      return res.json({ success: false, message: 'Nicio potrivire în dicționar pentru Afin' });
    }

    if (algorithm === 'sha256') {
      for (let word of dictionary) {
        const hashed = crypto.createHash('sha256').update(word).digest('hex');
        if (hashed === hash) {
          return res.json({ success: true, result: word, method: 'SHA-256 (dicționar)' });
        }
      }
      return res.json({ success: false, message: 'Parola nu a fost găsită în dicționar (SHA-256)' });
    }

    if (algorithm === 'bcrypt') {
      for (let word of dictionary) {
        const match = await bcrypt.compare(word, hash);
        if (match) {
          return res.json({ success: true, result: word, method: 'bcrypt (dicționar)' });
        }
      }
      return res.json({ success: false, message: 'Parola nu a fost găsită (bcrypt)' });
    }

    if (algorithm === 'rsa') {
      return res.json({ success: false, message: 'RSA este criptare asimetrică – nu poate fi spart fără cheia privată.' });
    }

    return res.json({ success: false, message: 'Algoritm necunoscut.' });

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Eroare internă: ' + err.message });
  }
});

router.get('/simulation', requireAuth, async (req, res) => {
  try {
    const { username } = req.user;

    const { rows } = await db.query(
      'SELECT username, password, method FROM users WHERE username = $1',
      [username]
    );

    if (rows.length === 0) {
      return res.status(404).send('Utilizatorul nu a fost găsit.');
    }

    const { password, method } = rows[0];

    res.render('simulation', {
      username,
      hash: password,
      method
    });
  } catch (err) {
    res.status(500).send('Eroare server: ' + err.message);
  }
});

export default router;
