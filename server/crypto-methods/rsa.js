import { gcd, modInverse } from "../utils/utils.js";

// Verifică dacă un număr este prim (BigInt)
function isPrime(n) {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
  }
  return true;
}

// 🔐 Criptare RSA
export function encrypt(text, params = { p: 61, q: 53, e: 17 }) {
  let p, q, e;

  try {
    p = BigInt(params.p);
    q = BigInt(params.q);
    e = BigInt(params.e);
  } catch {
    throw new Error("Parametrii RSA trebuie să fie numere întregi valide.");
  }

  if (!isPrime(p) || !isPrime(q)) {
    throw new Error(
      `Parametrii RSA p și q trebuie să fie numere prime. Exemplu valid: p=61, q=53.`
    );
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (gcd(e, phi) !== 1n) {
    throw new Error(
      `Exponentul e = ${e} nu este prim cu φ(n) = ${phi}. Alege un e prim cu φ(n), de exemplu e = 17.`
    );
  }

  return text
    .split("")
    .map((char) => {
      const m = BigInt(char.charCodeAt(0));
      const c = m ** e % n;
      return c.toString();
    })
    .join(",");
}

// 🔓 Decriptare RSA
export function decrypt(ciphertext, params = { p: 61, q: 53, e: 17 }) {
  let p, q, e;

  try {
    p = BigInt(params.p);
    q = BigInt(params.q);
    e = BigInt(params.e);
  } catch {
    throw new Error(
      "Parametrii RSA (p, q, e) trebuie să fie numere întregi valide."
    );
  }

  if (!isPrime(p) || !isPrime(q)) {
    throw new Error("p și q trebuie să fie numere prime.");
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (gcd(e, phi) !== 1n) {
    throw new Error(`Exponentul e (${e}) nu este prim cu φ(n) = ${phi}`);
  }

  const d = modInverse(e, phi);

  return ciphertext
    .split(",")
    .map((c) => {
      const cBig = BigInt(c);
      const m = cBig ** d % n;
      return String.fromCharCode(Number(m));
    })
    .join("");
}
