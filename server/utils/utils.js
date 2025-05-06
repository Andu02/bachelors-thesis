// Funcție utilitară: reconstruiește cheia Hill sau ECB/CBC
export function getEncryptionData(method, hill, symmetricKey) {
  let encryptionKey = null;
  let hillMatrix = null;

  if (method === "hill" && hill) {
    const rows = Object.keys(hill);
    hillMatrix = rows.map((i) => {
      const row = hill[i];
      return Object.keys(row).map((j) => parseInt(row[j]));
    });
    encryptionKey = JSON.stringify(hillMatrix);
  } else if ((method === "ecb" || method === "cbc") && symmetricKey) {
    encryptionKey = symmetricKey;
  }

  return { encryptionKey, hillMatrix, symmetricKey };
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
