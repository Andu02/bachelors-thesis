export function encrypt(text) {
    const e = 17;
    const n = 3233;
    return text.split('').map(char => {
      let m = char.charCodeAt(0);
      let c = BigInt(m) ** BigInt(e) % BigInt(n);
      return c.toString();
    }).join(',');
  }
  
  