// Calculează inversul modular al lui e mod phi folosind algoritmul extins Euclid
function modInverse(e, phi) {
  let [a, b] = [e, phi];
  let [x0, x1] = [0n, 1n];
  while (a > 1n) {
    const q = a / b;
    [a, b] = [b, a % b];
    [x0, x1] = [x1 - q * x0, x0];
  }
  return x1 < 0n ? x1 + phi : x1;
}

// Calculează cel mai mare divizor comun
function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Verifică dacă un număr este prim simplu (pentru validare p, q)
function isPrime(n) {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
  }
  return true;
}

// Funcția de criptare RSA
export function encrypt(text, params = { p: 61, q: 53, e: 17 }) {
  const p = BigInt(params.p);
  const q = BigInt(params.q);
  const e = BigInt(params.e);
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (gcd(e, phi) !== 1n) {
    throw new Error(`e nu este prim cu φ(n) = ${phi}`);
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

// Funcția de decriptare RSA
export function decrypt(ciphertext, params = { p: 61, q: 53, e: 17 }) {
  const p = BigInt(params.p);
  const q = BigInt(params.q);
  const e = BigInt(params.e);

  if (!isPrime(p) || !isPrime(q)) {
    throw new Error("p și q trebuie să fie numere prime.");
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  if (gcd(e, phi) !== 1n) {
    throw new Error(`Exponentul public e (${e}) nu este prim cu φ(n) = ${phi}`);
  }

  const d = modInverse(e, phi); // cheia privată

  // Decriptare caracter cu caracter
  return ciphertext
    .split(",")
    .map((c) => {
      const cBig = BigInt(c);
      const m = cBig ** d % n;
      return String.fromCharCode(Number(m));
    })
    .join("");
}
