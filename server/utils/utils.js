// Funcție utilitară: reconstruiește cheia Hill sau ECB/CBC
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function getEncryptionData(method, hill, symmetricKey, rsa = {}) {
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

  return { encryptionKey, hillMatrix, symmetricKey: symKey };
}

// Funcție auxiliară pentru extragerea parametrilor suplimentari
export function buildExtraParams(method, encryptionKey) {
  const extra = {};
  if (method === "hill" && encryptionKey) {
    extra.hillKey = JSON.parse(encryptionKey);
  } else if ((method === "ecb" || method === "cbc") && encryptionKey) {
    extra.symmetricKey = encryptionKey;
  }
  return extra;
}
