export function encrypt(text, iv = 'ABCD', blockEncrypt = str => str.split('').reverse().join('')) {
    const cleaned = text.replace(/[^A-Z]/gi, '').toUpperCase();
    const blockSize = iv.length;
    let prevBlock = iv;
    let result = '';
  
    for (let i = 0; i < cleaned.length; i += blockSize) {
      let block = cleaned.slice(i, i + blockSize);
      while (block.length < blockSize) block += 'X';
      let xored = '';
      for (let j = 0; j < blockSize; j++) {
        xored += String.fromCharCode(((block.charCodeAt(j) ^ prevBlock.charCodeAt(j)) % 26) + 65);
      }
      const encryptedBlock = blockEncrypt(xored);
      result += encryptedBlock;
      prevBlock = encryptedBlock;
    }
    return result;
  }
  
  export function decrypt(text, iv = 'ABCD', blockDecrypt = str => str.split('').reverse().join('')) {
    const blockSize = iv.length;
    let prevBlock = iv;
    let result = '';
  
    for (let i = 0; i < text.length; i += blockSize) {
      const block = text.slice(i, i + blockSize);
      const decrypted = blockDecrypt(block);
      let xored = '';
      for (let j = 0; j < blockSize; j++) {
        xored += String.fromCharCode(((decrypted.charCodeAt(j) ^ prevBlock.charCodeAt(j)) % 26) + 65);
      }
      result += xored;
      prevBlock = block;
    }
    return result;
  }
  