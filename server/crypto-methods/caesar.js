// Caesar cipher cu shift default de 3
export function encrypt(text, shift = 3) {
    return text.toUpperCase().split('').map(char => {
      if (char.match(/[A-Z]/)) {
        let code = (char.charCodeAt(0) - 65 + shift) % 26;
        return String.fromCharCode(code + 65);
      } else {
        return char;
      }
    }).join('');
  }
  
  export function decrypt(text, shift = 3) {
    return text.toUpperCase().split('').map(char => {
      if (char.match(/[A-Z]/)) {
        let code = (char.charCodeAt(0) - 65 - shift + 26) % 26;
        return String.fromCharCode(code + 65);
      } else {
        return char;
      }
    }).join('');
  }
  
  