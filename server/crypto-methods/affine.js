const mod26 = (n) => ((n % 26) + 26) % 26;

// Funcție pentru invers modular (folosit la decriptare)
function modInverse(a, m) {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  throw new Error("Invers modular inexistent pentru cheia dată.");
}

// Criptare cu cifrul Afin: C = (a * P + b) mod 26
export function encrypt(text, a, b) {
  text = text.toUpperCase().replace(/[^A-Z]/g, "");
  return text
    .split("")
    .map((char) => {
      let p = char.charCodeAt(0) - 65;
      let c = mod26(a * p + b);
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
      let c = char.charCodeAt(0) - 65;
      let p = mod26(a_inv * (c - b));
      return String.fromCharCode(p + 65);
    })
    .join("");
}
