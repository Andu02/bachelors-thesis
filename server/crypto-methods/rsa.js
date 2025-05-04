// Calculează inversul modular al lui e mod phi folosind algoritmul extins Euclid
function modInverse(e, phi) {
  let [a, b] = [e, phi];
  let [x0, x1] = [0n, 1n];

  // Continuăm până când a devine 1 (gcd = 1)
  while (a > 1n) {
    const q = a / b;
    [a, b] = [b, a % b];
    [x0, x1] = [x1 - q * x0, x0];
  }

  // Dacă rezultatul este negativ, îl aducem în intervalul pozitiv
  return x1 < 0n ? x1 + phi : x1;
}

// Funcția de criptare RSA
export function encrypt(text, params = { p: 61, q: 53, e: 17 }) {
  const p = BigInt(params.p); // primul număr prim
  const q = BigInt(params.q); // al doilea număr prim
  const e = BigInt(params.e); // exponentul public
  const n = p * q; // modulul n = p * q
  const phi = (p - 1n) * (q - 1n); // funcția lui Euler: φ(n)
  const d = modInverse(e, phi); // cheia privată (nu este folosită la criptare)

  return text
    .split("")
    .map((char) => {
      const m = BigInt(char.charCodeAt(0)); // mesajul ca număr
      const c = m ** e % n; // criptarea RSA
      return c.toString(); // convertim în string pentru a-l salva
    })
    .join(","); // caracterele criptate sunt separate prin virgulă
}
