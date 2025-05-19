// server/config.js
import dotenv from "dotenv";
dotenv.config();

const {
  JWT_SECRET,
  DATABASE_URL,
  PORT,
  DB_USER,
  DB_PASS,
  DB_HOST,
  DB_NAME,
  DB_PORT,
  SERVER_URL,
} = process.env;

if (!JWT_SECRET) {
  throw new Error("🚨 JWT_SECRET nu este definit în .env");
}
if (
  !DATABASE_URL &&
  (!DB_USER || !DB_PASS || !DB_HOST || !DB_NAME || !DB_PORT)
) {
  throw new Error(
    "🚨 Trebuie să definești fie DATABASE_URL, fie toate variabilele DB_* în .env"
  );
}

export default {
  jwtSecret: JWT_SECRET,
  databaseUrl: DATABASE_URL,
  port: parseInt(PORT, 10) || 3000,
  serverUrl: SERVER_URL || `http://localhost:${PORT}`,
  db: {
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    database: DB_NAME,
    port: parseInt(DB_PORT, 10),
  },
};
