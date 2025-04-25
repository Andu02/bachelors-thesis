export function encrypt(text, key) {
    text = text.toUpperCase();
    key = key.toUpperCase();
    let result = '';
    let keyIndex = 0;
  
    for (let char of text) {
      if (char.match(/[A-Z]/)) {
        let shift = key.charCodeAt(keyIndex % key.length) - 65;
        let code = (char.charCodeAt(0) - 65 + shift) % 26;
        result += String.fromCharCode(code + 65);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  }
  
  export function decrypt(text, key) {
    text = text.toUpperCase();
    key = key.toUpperCase();
    let result = '';
    let keyIndex = 0;
  
    for (let char of text) {
      if (char.match(/[A-Z]/)) {
        let shift = key.charCodeAt(keyIndex % key.length) - 65;
        let code = (char.charCodeAt(0) - 65 - shift + 26) % 26;
        result += String.fromCharCode(code + 65);
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  }
  
