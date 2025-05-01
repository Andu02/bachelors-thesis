


function decryptAffine(text, a = 5, b = 8) {
  const mod26 = n => ((n % 26) + 26) % 26;
  function modInverse(a, m) {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x; // găsim x astfel încât a*x ≡ 1 (mod m)
    }
    throw new Error("Invers modular inexistent");
  }
  const a_inv = modInverse(a, 26);
  return text
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('')
    .map(char => {
      let c = char.charCodeAt(0) - 65;
      let p = mod26(a_inv * (c - b));
      return String.fromCharCode(p + 65);
    })
    .join('');
}



