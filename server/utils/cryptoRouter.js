import { encrypt as caesarEncrypt } from "../crypto-methods/caesar.js";
import { encrypt as affineEncrypt } from "../crypto-methods/affine.js";
import { encrypt as hillEncrypt } from "../crypto-methods/hill.js";
import { encrypt as rsaEncrypt } from "../crypto-methods/rsa.js";
import { encrypt as ecbEncrypt } from "../crypto-methods/ecb.js";
import { encrypt as cbcEncrypt } from "../crypto-methods/cbc.js";
import {
  encrypt as bcryptEncrypt,
  compare as bcryptCompare,
} from "../crypto-methods/bcrypt.js";
import {
  encrypt as shaEncrypt,
  compare as shaCompare,
} from "../crypto-methods/sha256.js";

const DEFAULT_SYMMETRIC_KEY = "DEFAULT";

const encryptionMethods = {
  caesar: (password, extra) => caesarEncrypt(password, extra.caesarKey),
  affine: (password, extra) => {
    const { a, b } = extra.affine || {};
    if (typeof a !== "number" || typeof b !== "number") {
      throw new Error("Parametrii a și b lipsesc pentru cifrul Afin");
    }
    return affineEncrypt(password, a, b);
  },
  hill: (password, extra) => hillEncrypt(password, extra.hillKey),
  rsa: (password, extra) => rsaEncrypt(password, extra.rsa),
  bcrypt: async (password, extra) => {
    const rounds = parseInt(extra.bcryptSalt) || 10;
    return await bcryptEncrypt(password, rounds);
  },
  sha256: (password, extra) => {
    const salt = extra.sha256Salt || "";
    return shaEncrypt(password, salt);
  },
  ecb: (password, extra) =>
    ecbEncrypt(password, extra.symmetricKey || DEFAULT_SYMMETRIC_KEY),
  cbc: (password, extra) =>
    cbcEncrypt(password, extra.symmetricKey || DEFAULT_SYMMETRIC_KEY),
};

export async function encryptPassword(method, password, extra = {}) {
  const encryptFunc = encryptionMethods[method];
  if (!encryptFunc) {
    throw new Error("Metodă de criptare necunoscută");
  }
  return await encryptFunc(password, extra);
}

export async function comparePasswords(method, input, stored, extra = {}) {
  if (method === "bcrypt") {
    return await bcryptCompare(input, stored);
  }
  if (method === "sha256") {
    return shaCompare(input, stored, extra.sha256Salt || "");
  }

  const encryptedInput = await encryptPassword(method, input, extra);
  return encryptedInput === stored;
}
