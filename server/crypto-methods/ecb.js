// Criptare ECB cu cheie personalizată
export function encrypt(text, key = "DEFAULT") {
  key = key.toUpperCase(); // convertim cheia la majuscule pentru shift-uri previzibile (ASCII A–Z)

  const cleaned = text.replace(/[^A-Z]/gi, "").toUpperCase(); // eliminăm caracterele non-AZ
  let result = "";
  const blockSize = 4;

  for (let i = 0; i < cleaned.length; i += blockSize) {
    const block = cleaned.slice(i, i + blockSize);
    result += blockEncrypt(block, key); // criptăm fiecare bloc
  }

  return result;
}

// Decriptare ECB cu aceeași cheie
export function decrypt(text, key = "DEFAULT") {
  const cleaned = text.replace(/[^A-Z]/gi, "").toUpperCase();
  let result = "";
  const blockSize = 4;

  for (let i = 0; i < cleaned.length; i += blockSize) {
    const block = cleaned.slice(i, i + blockSize);
    result += blockDecrypt(block, key); // decriptăm fiecare bloc
  }

  return result;
}

// Criptare pe bloc individual
function blockEncrypt(block, key) {
  let result = "";
  for (let i = 0; i < block.length; i++) {
    const shift = key.charCodeAt(i % key.length) % 26;
    const code = (block.charCodeAt(i) - 65 + shift) % 26;
    result += String.fromCharCode(code + 65);
  }

  return result;
}

// Decriptare pe bloc individual
function blockDecrypt(block, key) {
  let result = "";
  for (let i = 0; i < block.length; i++) {
    const shift = key.charCodeAt(i % key.length) % 26;
    const code = (block.charCodeAt(i) - 65 - shift + 26) % 26;
    result += String.fromCharCode(code + 65);
  }
  return result;
}
