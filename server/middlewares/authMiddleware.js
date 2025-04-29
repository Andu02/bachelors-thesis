import jwt from 'jsonwebtoken';

const JWT_SECRET = 'secretKey'; // aceeași cheie ca în auth.js

export function requireAuth(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.redirect('/login.html');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { username: '...' }
    next();
  } catch (err) {
    return res.status(403).send('Acces neautorizat.');
  }
}
