const mod26 = n => ((n % 26) + 26) % 26;

/**
 * Criptează un text folosind cifrul Hill cu matrice cheie personalizată.
 * @param {string} text - textul de criptat
 * @param {number[][]} key - matricea-cheie pătratică (ex. [[3,3],[2,5]])
 * @returns {string} textul criptat
 */

// Inversă modulară a unei matrici în Z26
function inverseMatrixMod26(matrix) {
  const det = mod26(determinant(matrix));
  const detInv = modInverse(det, 26);
  const minors = matrixOfMinors(matrix);
  const adjugate = transpose(minors);
  const inverse = adjugate.map(row => row.map(val => mod26(detInv * val)));
  return inverse;
}

// Funcție auxiliară: determină invers modular
function modInverse(a, m) {
  for (let x = 1; x < m; x++) {
    if ((a * x) % m === 1) return x;
  }
  throw new Error("Determinantul nu are invers modular în Z26.");
}

// Funcție auxiliară: calculează determinantul unei matrici pătratice (recursiv)
function determinant(matrix) {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0]*matrix[1][1] - matrix[0][1]*matrix[1][0];

  let det = 0;
  for (let col = 0; col < n; col++) {
    const subMatrix = matrix.slice(1).map(row =>
      row.filter((_, j) => j !== col)
    );
    det += ((col % 2 === 0 ? 1 : -1) * matrix[0][col] * determinant(subMatrix));
  }
  return det;
}

// Funcție auxiliară: transpune o matrice
function transpose(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]));
}

// Funcție auxiliară: cofactori pentru inversa matricii
function matrixOfMinors(matrix) {
  const n = matrix.length;
  const minors = [];
  for (let i = 0; i < n; i++) {
    minors[i] = [];
    for (let j = 0; j < n; j++) {
      const subMatrix = matrix
        .filter((_, r) => r !== i)
        .map(row => row.filter((_, c) => c !== j));
      const minor = determinant(subMatrix);
      minors[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * minor;
    }
  }
  return minors;
}

// Funcția principală: criptare Hill
export function encrypt(text, key) {
  if (!Array.isArray(key) || key.length === 0 || key.length !== key[0].length) {
    throw new Error("Matricea Hill trebuie să fie pătratică.");
  }

  const n = key.length; // dimensiunea matricei (2, 3 etc.)
  text = text.toUpperCase().replace(/[^A-Z]/g, '');

  // Padding dacă textul nu e multiplu de dimensiune
  while (text.length % n !== 0) {
    text += 'X';
  }

  let result = '';
  for (let i = 0; i < text.length; i += n) {
    const block = [];
    for (let j = 0; j < n; j++) {
      block.push(text.charCodeAt(i + j) - 65); // conversie litere în vector numeric
    }

    for (let row = 0; row < n; row++) {
      let sum = 0;
      for (let col = 0; col < n; col++) {
        sum += key[row][col] * block[col]; // produsul scalar dintre linia cheii și coloana vectorului
      }
      result += String.fromCharCode(mod26(sum) + 65); // litera criptată
    }
  }

  return result;
}

// Funcția principală: decriptare Hill
export function decrypt(text, key) {
  if (!Array.isArray(key) || key.length !== key[0].length) {
    throw new Error("Matricea Hill trebuie să fie pătratică.");
  }

  const n = key.length;
  const invKey = inverseMatrixMod26(key);

  text = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (text.length % n !== 0) {
    throw new Error("Lungimea textului criptat nu este multiplu de dimensiunea cheii.");
  }

  let result = '';
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
      result += String.fromCharCode(mod26(sum) + 65);
    }
  }

  return result;
}