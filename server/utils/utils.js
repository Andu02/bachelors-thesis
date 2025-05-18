import { isHillMatrixValid } from "../crypto-methods/hill.js";
import crypto from "crypto";

export function getEncryptionData(
  method,
  hill,
  symmetricKey,
  rsa = {},
  caesarKey = null,
  affine = {},
  bcryptSalt = null,
  sha256Salt = null
) {
  let encryptionKey = null;
  let hillMatrix = null;
  let symKey = null;

  if (method === "hill") {
    const matrix = typeof hill === "string" ? JSON.parse(hill) : hill;

    if (
      !Array.isArray(matrix) ||
      matrix.length === 0 ||
      !Array.isArray(matrix[0]) ||
      matrix.length !== matrix[0].length
    ) {
      throw new Error("Matricea Hill trebuie să fie pătratică.");
    }

    encryptionKey = JSON.stringify(matrix);
    hillMatrix = matrix;
    if (!isHillMatrixValid(matrix)) {
      throw new Error(
        "Matricea Hill este invalidă. Determinantul nu are invers modular în Z26."
      );
    }
  }

  if (method === "ecb" || method === "cbc") {
    encryptionKey = symmetricKey;
    symKey = symmetricKey;
  }

  if (method === "rsa") {
    const { p, q, e } = rsa;
    if (!p || !q || !e) {
      throw new Error("RSA necesită p, q și e.");
    }
    encryptionKey = JSON.stringify({ p, q, e });
  }

  if (method === "caesar") {
    if (typeof caesarKey !== "number" || caesarKey < 1 || caesarKey > 25) {
      throw new Error("Cifra Caesar necesită o cheie între 1 și 25.");
    }
    encryptionKey = caesarKey.toString();
  }

  if (method === "affine") {
    const { a, b } = affine;
    if (
      typeof a !== "number" ||
      typeof b !== "number" ||
      isNaN(a) ||
      isNaN(b) ||
      gcd(BigInt(a), 26n) !== 1n
    ) {
      throw new Error("Cifra Afin necesită a prim cu 26 și b valid.");
    }
    encryptionKey = JSON.stringify({ a, b });
  }

  if (method === "bcrypt") {
    if (!bcryptSalt || isNaN(bcryptSalt) || bcryptSalt < 4 || bcryptSalt > 15) {
      throw new Error("Salt-ul Bcrypt trebuie să fie un număr între 4 și 15.");
    }
    encryptionKey = bcryptSalt.toString();
  }

  if (method === "sha256") {
    if (typeof sha256Salt !== "string" || sha256Salt.trim() === "") {
      throw new Error("Salt-ul SHA256 trebuie să fie un string nevid.");
    }
    encryptionKey = sha256Salt;
  }

  return { encryptionKey, hillMatrix, symmetricKey: symKey };
}

// ✅ Reconstruiește parametrii extra necesari decriptării
export function buildExtraParams(method, encryptionKey) {
  const extra = {};

  if (!encryptionKey) return extra;

  if (method === "hill") {
    extra.hillKey = JSON.parse(encryptionKey);
  } else if (method === "ecb" || method === "cbc") {
    extra.symmetricKey = encryptionKey;
  } else if (method === "rsa") {
    try {
      const { p, q, e } = JSON.parse(encryptionKey);
      extra.rsa = { p: BigInt(p), q: BigInt(q), e: BigInt(e) };
    } catch {
      throw new Error("Cheia RSA nu este validă.");
    }
  } else if (method === "caesar") {
    extra.caesarKey = parseInt(encryptionKey);
  } else if (method === "affine") {
    try {
      const { a, b } = JSON.parse(encryptionKey);
      extra.affine = { a, b };
    } catch {
      throw new Error("Cheia Afin nu este validă.");
    }
  }

  return extra;
}

export function gcd(a, b) {
  // Convertim ambele la același tip
  const isBigInt = typeof a === "bigint" || typeof b === "bigint";
  if (isBigInt) {
    a = BigInt(a < 0 ? -a : a);
    b = BigInt(b < 0 ? -b : b);
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a;
  } else {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }
}

export function modInverse(a, m) {
  const isBigInt = typeof a === "bigint" || typeof m === "bigint";
  if (isBigInt) {
    a = BigInt(a);
    m = BigInt(m);
    let [x0, x1] = [0n, 1n];
    while (a > 1n) {
      const q = a / m;
      [a, m] = [m, a % m];
      [x0, x1] = [x1 - q * x0, x0];
    }
    return x1 < 0n ? x1 + m : x1;
  } else {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    throw new Error(`Invers modular inexistent pentru a = ${a}, modulo ${m}`);
  }
}

// Modulo pozitiv universal
export function modN(n, modulo) {
  return ((n % modulo) + modulo) % modulo;
}

// Determinant recursiv (doar pentru matrici pătratice mici)
export function determinant(matrix) {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let col = 0; col < n; col++) {
    const subMatrix = matrix
      .slice(1)
      .map((row) => row.filter((_, j) => j !== col));
    det += (col % 2 === 0 ? 1 : -1) * matrix[0][col] * determinant(subMatrix);
  }
  return det;
}

export function getKeyBuffer(keyHex) {
  if (/^[0-9a-fA-F]{32}$/.test(keyHex)) {
    return Buffer.from(keyHex, "hex");
  }
  return crypto
    .createHash("sha256")
    .update(keyHex, "utf8")
    .digest()
    .slice(0, 16);
}
