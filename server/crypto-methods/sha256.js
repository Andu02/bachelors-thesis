import crypto from "crypto";

// Criptare cu SHA256 + salt custom
export function encrypt(password, salt = "") {
  return crypto
    .createHash("sha256")
    .update(salt + password)
    .digest("hex");
}

// Comparație (pentru simulări sau autentificare manuală)
export function compare(input, stored, salt = "") {
  const hashed = encrypt(input, salt);
  return hashed === stored;
}
