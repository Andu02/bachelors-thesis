// server/middlewares/rateLimiters.js

import rateLimit from "express-rate-limit";
import config from "../config.js";

const {
  global: GLOBAL,
  changePassword: CP,
  simulation: SIM,
} = config.rateLimits;

export const globalLimiter = rateLimit({
  windowMs: GLOBAL.windowMs,
  max: GLOBAL.max,
  standardHeaders: true,
  legacyHeaders: false,
});

export const changePasswordLimiter = rateLimit({
  windowMs: CP.windowMs,
  max: CP.max,
  message: {
    message:
      "Prea multe încercări de schimbare parolă, încearcă peste 15 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const simulationLimiter = rateLimit({
  windowMs: SIM.windowMs,
  max: SIM.max,
  message: {
    message:
      "Rate limit atins pentru simulări, încearcă din nou peste un minut.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
