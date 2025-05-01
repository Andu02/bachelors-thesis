import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { encryptPassword, comparePasswords } from '../utils/cryptoRouter.js';

const router = express.Router();
const JWT_SECRET = 'secretKey'; // În producție folosește .env

router.get('/register', (req, res) => {
  res.render('register', { message: null });
});

// RUTĂ: Înregistrare utilizator
router.post('/register', async (req, res) => {
  const { username, password, method, hill } = req.body;

  if (username.length < 3 || username.length > 20) {
    return res.status(400).send('Username-ul trebuie să aibă între 3 și 20 de caractere.');
  }

  if (password.length < 6 || password.length > 30) {
    return res.status(400).send('Parola trebuie să aibă între 6 și 30 de caractere.');
  }

  try {
    // Reconstruim matricea Hill dacă este cazul
    let hillMatrix = null;
    if (method === 'hill' && hill) {
      const rows = Object.keys(hill);
      hillMatrix = rows.map(i => {
        const row = hill[i];
        return Object.keys(row).map(j => parseInt(row[j]));
      });
    }

    // Măsurăm timpul de criptare
    const start = Date.now();
    const encryptedPassword = await encryptPassword(method, password, { hillKey: hillMatrix });
    const encryptionTime = Date.now() - start;

    // Convertim cheia Hill în string pentru salvare în baza de date
    const hillKeyJSON = hillMatrix ? JSON.stringify(hillMatrix) : null;

    // Salvăm în baza de date, inclusiv hill_key
    await pool.query(
      'INSERT INTO users (username, password, method, hill_key) VALUES ($1, $2, $3, $4)',
      [username, encryptedPassword, method, hillKeyJSON]
    );

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true });

    res.cookie('registrationDetails', JSON.stringify({
      username,
      method,
      originalPassword: password,
      encryptedPassword,
      encryptionTime
    }), {
      httpOnly: false,
      maxAge: 3600000
    });

    res.redirect('/success-register.html');
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).send('Acest nume de utilizator este deja folosit.');
    }
    console.error('Eroare la înregistrare:', err);
    res.status(500).send('Eroare la salvare în baza de date.');
  }
});

// RUTĂ: Autentificare utilizator
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length === 0) {
    return res.status(401).send('Utilizatorul nu există.');
  }

  const user = result.rows[0];
  const storedPassword = user.password;
  const method = user.method;

  try {
    let hillMatrix = null;

    // Dacă metoda e Hill și există cheia stocată, o reconstruim din JSON
    if (method === 'hill' && user.hill_key) {
      hillMatrix = JSON.parse(user.hill_key);
    }

    // Verificăm parola folosind cheia Hill dacă e cazul
    const valid = await comparePasswords(method, password, storedPassword, { hillKey: hillMatrix });

    if (!valid) {
      return res.status(401).send('Parolă incorectă.');
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true });
    res.redirect('/success-login.html');
  } catch (err) {
    console.error('Eroare la verificarea parolei:', err);
    res.status(500).send('Eroare la verificarea parolei.');
  }
});


// RUTĂ: Schimbare parolă
router.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword, method, hill } = req.body;
  const token = req.cookies.authToken;

  if (!token) return res.status(401).send('Nu sunteți autentificat.');

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(401).send('Token invalid.');

    const username = decoded.username;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    try {
      const valid = await comparePasswords(user.method, oldPassword, user.password);
      if (!valid) return res.status(400).send('Parola veche este incorectă.');

      let hillMatrix = null;
      if (method === 'hill' && hill) {
        const rows = Object.keys(hill);
        hillMatrix = rows.map(i => {
          const row = hill[i];
          return Object.keys(row).map(j => parseInt(row[j]));
        });
      }

      const newHashed = await encryptPassword(method, newPassword, { hillKey: hillMatrix });

      await pool.query('UPDATE users SET password = $1, method = $2 WHERE username = $3',
        [newHashed, method, username]);

      res.send('Parola a fost schimbată cu succes!');
    } catch (err) {
      console.error('Eroare la schimbarea parolei:', err);
      res.status(500).send('Eroare la schimbarea parolei.');
    }
  });
});

// RUTĂ: Logout
router.get('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.redirect('/index.html');
});

export default router;
