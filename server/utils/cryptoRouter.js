import { encrypt as caesarEncrypt } from '../crypto-methods/caesar.js';
import { encrypt as affineEncrypt } from '../crypto-methods/affine.js';
import { encrypt as vigenereEncrypt } from '../crypto-methods/vigenere.js';
import { encrypt as hillEncrypt } from '../crypto-methods/hill.js';
import { encrypt as rsaEncrypt } from '../crypto-methods/rsa.js';
import { encrypt as transpositionEncrypt } from '../crypto-methods/transposition.js';
import { encrypt as permutationEncrypt } from '../crypto-methods/permutation.js';
import { encrypt as ecbEncrypt } from '../crypto-methods/ecb.js';
import { encrypt as cbcEncrypt } from '../crypto-methods/cbc.js';
import { encrypt as bcryptEncrypt, compare as bcryptCompare } from '../crypto-methods/bcrypt.js';

export async function encryptPassword(method, password) {
  switch (method) {
    // Clasice
    case 'caesar':
      return caesarEncrypt(password, 3);
    case 'affine':
      return affineEncrypt(password, 5, 8);
    case 'vigenere':
      return vigenereEncrypt(password, "KEY");
    case 'hill':
      return hillEncrypt(password);
    case 'transposition':
      return transpositionEncrypt(password);
    case 'permutation':
      return permutationEncrypt(password);

    // Moderne
    case 'rsa':
      return rsaEncrypt(password);
    case 'bcrypt':
      return await bcryptEncrypt(password);

    // Pe blocuri (simulate)
    case 'ecb':
      return ecbEncrypt(password);
    case 'cbc':
      return cbcEncrypt(password, "IV");

    default:
      throw new Error('Metodă de criptare necunoscută');
  }
}

export async function comparePasswords(method, input, stored) {
  if (method === 'bcrypt') {
    return await bcryptCompare(input, stored);
  } else {
    const encryptedInput = await encryptPassword(method, input);
    return encryptedInput === stored;
  }
}
