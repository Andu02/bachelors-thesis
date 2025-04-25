export function encrypt(text, blockEncrypt = str => str.split('').reverse().join('')) {
    const cleaned = text.replace(/[^A-Z]/gi, '').toUpperCase();
    let result = '';
    for (let i = 0; i < cleaned.length; i += 4) {
      result += blockEncrypt(cleaned.slice(i, i + 4));
    }
    return result;
  }
  
  export function decrypt(text, blockDecrypt = str => str.split('').reverse().join('')) {
    return encrypt(text, blockDecrypt); // same logic since reverse is symmetrical
  }