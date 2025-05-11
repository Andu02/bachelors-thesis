import { modN, modInverse } from "../utils/utils.js";

// Criptare cu cifrul Afin: C = (a * P + b) mod 26
export function encrypt(text, a, b) {
  text = text.toUpperCase().replace(/[^A-Z]/g, "");
  return text
    .split("")
    .map((char) => {
      const p = char.charCodeAt(0) - 65;
      const c = modN(a * p + b, 26);
      return String.fromCharCode(c + 65);
    })
    .join("");
}

// Decriptare: P = a⁻¹ * (C - b) mod 26
export function decrypt(text, a, b) {
  const a_inv = modInverse(a, 26);
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("")
    .map((char) => {
      const c = char.charCodeAt(0) - 65;
      const p = modN(a_inv * (c - b), 26);
      return String.fromCharCode(p + 65);
    })
    .join("");
}
