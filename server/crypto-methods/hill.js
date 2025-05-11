import { gcd, modInverse, modN, determinant } from "../utils/utils.js";

const MOD = 26;

// Inversă modulară a unei matrici în Z26
function inverseMatrixMod26(matrix) {
  const det = modN(determinant(matrix), MOD);
  const detInv = modInverse(det, MOD);
  const minors = matrixOfMinors(matrix);
  const adjugate = transpose(minors);
  const inverse = adjugate.map((row) =>
    row.map((val) => modN(detInv * val, MOD))
  );
  return inverse;
}

// Transpune o matrice
function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]));
}

// Cofactori pentru inversa matricii
function matrixOfMinors(matrix) {
  const n = matrix.length;
  const minors = [];
  for (let i = 0; i < n; i++) {
    minors[i] = [];
    for (let j = 0; j < n; j++) {
      const subMatrix = matrix
        .filter((_, r) => r !== i)
        .map((row) => row.filter((_, c) => c !== j));
      const minor = determinant(subMatrix);
      minors[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * minor;
    }
  }
  return minors;
}

// 🔐 Criptare Hill
export function encrypt(text, key) {
  if (!Array.isArray(key) || key.length === 0 || key.length !== key[0].length) {
    throw new Error("Matricea Hill trebuie să fie pătratică.");
  }

  const n = key.length;
  text = text.toUpperCase().replace(/[^A-Z]/g, "");

  while (text.length % n !== 0) {
    text += "X";
  }

  let result = "";
  for (let i = 0; i < text.length; i += n) {
    const block = [];
    for (let j = 0; j < n; j++) {
      block.push(text.charCodeAt(i + j) - 65);
    }

    for (let row = 0; row < n; row++) {
      let sum = 0;
      for (let col = 0; col < n; col++) {
        sum += key[row][col] * block[col];
      }
      result += String.fromCharCode(modN(sum, MOD) + 65);
    }
  }

  return result;
}

// 🔓 Decriptare Hill
export function decrypt(text, key) {
  if (!Array.isArray(key) || key.length !== key[0].length) {
    throw new Error("Matricea Hill trebuie să fie pătratică.");
  }

  const n = key.length;
  const invKey = inverseMatrixMod26(key);

  text = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (text.length % n !== 0) {
    throw new Error(
      "Lungimea textului criptat nu este multiplu de dimensiunea cheii."
    );
  }

  let result = "";
  for (let i = 0; i < text.length; i += n) {
    const block = [];
    for (let j = 0; j < n; j++) {
      block.push(text.charCodeAt(i + j) - 65);
    }

    for (let row = 0; row < n; row++) {
      let sum = 0;
      for (let col = 0; col < n; col++) {
        sum += invKey[row][col] * block[col];
      }
      result += String.fromCharCode(modN(sum, MOD) + 65);
    }
  }

  return result;
}

// ✅ Validare matrice Hill (pentru criptare corectă)
export function isHillMatrixValid(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== matrix[0].length)
    return false;
  const det = modN(determinant(matrix), 26);
  return gcd(det, 26) === 1;
}
