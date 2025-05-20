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
  // *** Adăugat: rate limit settings ***
  rateLimits: {
    global: {
      windowMs:
        parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MS, 10) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10) || 5000,
    },
    changePassword: {
      windowMs:
        parseInt(process.env.RATE_LIMIT_CP_WINDOW_MS, 10) || 15 * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_CP_MAX, 10) || 5,
    },
    simulation: {
      windowMs: parseInt(process.env.RATE_LIMIT_SIM_WINDOW_MS, 10) || 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_SIM_MAX, 10) || 10,
    },
  },
};
