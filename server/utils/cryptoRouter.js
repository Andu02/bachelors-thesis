import { encrypt as caesarEncrypt } from "../crypto-methods/caesar.js";
import { encrypt as affineEncrypt } from "../crypto-methods/affine.js";
import { encrypt as vigenereEncrypt } from "../crypto-methods/vigenere.js";
import { encrypt as hillEncrypt } from "../crypto-methods/hill.js";
import { encrypt as rsaEncrypt } from "../crypto-methods/rsa.js";
import { encrypt as transpositionEncrypt } from "../crypto-methods/transposition.js";
import { encrypt as permutationEncrypt } from "../crypto-methods/permutation.js";
import { encrypt as ecbEncrypt } from "../crypto-methods/ecb.js";
import { encrypt as cbcEncrypt } from "../crypto-methods/cbc.js";
import {
  encrypt as bcryptEncrypt,
  compare as bcryptCompare,
} from "../crypto-methods/bcrypt.js";

const encryptionMethods = {
  caesar: (password, extra) => caesarEncrypt(password, extra.caesarKey),
  affine: (password, extra) =>
    affineEncrypt(password, extra.affine?.a, extra.affine?.b),
  vigenere: (password, extra) => vigenereEncrypt(password, "KEY"),
  hill: (password, extra) => hillEncrypt(password, extra.hillKey),
  transposition: (password, extra) => transpositionEncrypt(password),
  permutation: (password, extra) => permutationEncrypt(password),
  rsa: (password, extra) => rsaEncrypt(password, extra.rsa),
  bcrypt: async (password, extra) => await bcryptEncrypt(password),
  ecb: (password, extra) =>
    ecbEncrypt(password, extra.symmetricKey || "DEFAULT"),
  cbc: (password, extra) =>
    cbcEncrypt(password, extra.symmetricKey || "DEFAULT"),
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
  } else {
    const encryptedInput = await encryptPassword(method, input, extra);
    return encryptedInput === stored;
  }
}
