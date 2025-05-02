// Criptare CBC cu cheie (folosește primele 4 caractere ca IV)
export function encrypt(text, key = "DEFAULT") {
  key = key.toUpperCase(); // convertim cheia la majuscule pentru shift-uri previzibile (ASCII A–Z)
  const cleaned = text.replace(/[^A-Z]/gi, "").toUpperCase();
  const iv = key.slice(0, 4).padEnd(4, "X"); // vector inițializare
  const blockSize = iv.length;

  let prevBlock = iv;
  let result = "";

  for (let i = 0; i < cleaned.length; i += blockSize) {
    let block = cleaned.slice(i, i + blockSize);
    while (block.length < blockSize) block += "X"; // padding

    // XOR între bloc și blocul precedent
    let xored = "";
    for (let j = 0; j < blockSize; j++) {
      const xorChar = block.charCodeAt(j) ^ prevBlock.charCodeAt(j);
      xored += String.fromCharCode((xorChar % 26) + 65);
    }

    const encryptedBlock = blockEncrypt(xored, key);
    result += encryptedBlock;
    prevBlock = encryptedBlock; // devine blocul precedent
  }

  return result;
}

// Decriptare CBC cu aceeași cheie
export function decrypt(text, key = "DEFAULT") {
  const cleaned = text.replace(/[^A-Z]/gi, "").toUpperCase();
  const iv = key.slice(0, 4).padEnd(4, "X");
  const blockSize = iv.length;

  let prevBlock = iv;
  let result = "";

  for (let i = 0; i < cleaned.length; i += blockSize) {
    const block = cleaned.slice(i, i + blockSize);
    const decrypted = blockDecrypt(block, key); // decriptăm blocul criptat

    // Aplicăm XOR între bloc decriptat și blocul precedent
    let xored = "";
    for (let j = 0; j < blockSize; j++) {
      const charCode = (decrypted.charCodeAt(j) - 65) ^ prevBlock.charCodeAt(j);
      xored += String.fromCharCode((((charCode % 26) + 26) % 26) + 65);
    }

    result += xored;
    prevBlock = block; // actualizăm blocul precedent
  }

  return result;
}

// Criptare pe bloc
function blockEncrypt(block, key) {
  let result = "";
  for (let i = 0; i < block.length; i++) {
    const shift = key.charCodeAt(i % key.length) % 26;
    const code = (block.charCodeAt(i) - 65 + shift) % 26;
    result += String.fromCharCode(code + 65);
  }
  return result;
}

// Decriptare pe bloc
function blockDecrypt(block, key) {
  let result = "";
  for (let i = 0; i < block.length; i++) {
    const shift = key.charCodeAt(i % key.length) % 26;
    const code = (block.charCodeAt(i) - 65 - shift + 26) % 26;
    result += String.fromCharCode(code + 65);
  }
  return result;
}
