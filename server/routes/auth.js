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
  const { username, password, method } = req.body;

  if (username.length < 3 || username.length > 20) {
    return res.status(400).send('Username-ul trebuie să aibă între 3 și 20 de caractere.');
  }

  if (password.length < 6 || password.length > 30) {
    return res.status(400).send('Parola trebuie să aibă între 6 și 30 de caractere.');
  }

  try {
    const encryptedPassword = await encryptPassword(method, password); // folosește `await`

    await pool.query(
      'INSERT INTO users (username, password, method) VALUES ($1, $2, $3)',
      [username, encryptedPassword, method]
    );

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true });

    res.json({ username, method, original: password, encrypted: encryptedPassword });
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
    const valid = await comparePasswords(method, password, storedPassword);
    if (!valid) {
      return res.status(401).send('Parolă incorectă.');
    }

    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('authToken', token, { httpOnly: true });
    res.redirect('/profile');
  } catch (err) {
    res.status(500).send('Eroare la verificarea parolei.');
  }
});

// RUTĂ: Profil
router.get('/profile', (req, res) => {
  const token = req.cookies.authToken;
  if (!token) return res.redirect('/login.html');

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.redirect('/login.html');
    const username = decoded.username;

    pool.query('SELECT * FROM users WHERE username = $1', [username], (err, result) => {
      if (err) return res.status(500).send('Eroare la obținerea datelor utilizatorului');
      const user = result.rows[0];
      res.render('profile', { user, message: null });
    });
  });
});

// RUTĂ: Schimbare parolă
router.post('/change-password', async (req, res) => {
  const { oldPassword, newPassword, method } = req.body;
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

      const newHashed = await encryptPassword(method, newPassword); // folosește metoda nouă
      await pool.query('UPDATE users SET password = $1, method = $2 WHERE username = $3', [newHashed, method, username]);

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
