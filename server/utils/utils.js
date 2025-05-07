// Funcție pentru calculul GCD (cel mai mare divizor comun)
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

// ✅ Obține datele necesare criptării în funcție de metodă
export function getEncryptionData(
  method,
  hill,
  symmetricKey,
  rsa = {},
  caesarKey = null,
  affine = {}
) {
  let encryptionKey = null;
  let hillMatrix = null;
  let symKey = null;

  if (method === "hill") {
    encryptionKey = JSON.stringify(hill);
    hillMatrix = hill;
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
