import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js'; // extensia .js este obligatorie în ESM

const app = express();

// Configurare pentru __dirname în ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setări Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rute
app.use('/', authRoutes);

// Fișiere statice
app.use(express.static(path.join(__dirname, '../public')));

// Test server
app.get('/ping', (req, res) => {
  res.send('Serverul funcționează! 🐮');
});

// Pornirea serverului
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});
