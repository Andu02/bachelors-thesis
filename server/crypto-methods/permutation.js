
// permutation.js
export function encrypt(text, key = [2, 0, 3, 1]) {
    const blockSize = key.length;
    const cleaned = text.replace(/[^A-Z]/gi, '').toUpperCase();
    let padded = cleaned;
    while (padded.length % blockSize !== 0) padded += 'X';
  
    let result = '';
    for (let i = 0; i < padded.length; i += blockSize) {
      const block = padded.slice(i, i + blockSize);
      for (let idx of key) {
        result += block[idx];
      }
    }
    return result;
  }
  
  export function decrypt(text, key = [2, 0, 3, 1]) {
    const blockSize = key.length;
    const inverseKey = Array(blockSize);
    key.forEach((val, i) => inverseKey[val] = i);
  
    let result = '';
    for (let i = 0; i < text.length; i += blockSize) {
      const block = text.slice(i, i + blockSize);
      let temp = Array(blockSize);
      inverseKey.forEach((pos, j) => temp[pos] = block[j]);
      result += temp.join('');
    }
    return result;
  }
  
  