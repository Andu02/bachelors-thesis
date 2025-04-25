const mod26 = n => ((n % 26) + 26) % 26;

export function encrypt(text) {
  const key = [[3, 3], [2, 5]]; // matrice cheie fixă
  text = text.toUpperCase().replace(/[^A-Z]/g, '');

  if (text.length % 2 !== 0) text += 'X'; // padding

  let result = '';
  for (let i = 0; i < text.length; i += 2) {
    let a = text.charCodeAt(i) - 65;
    let b = text.charCodeAt(i + 1) - 65;
    let x = mod26(key[0][0] * a + key[0][1] * b);
    let y = mod26(key[1][0] * a + key[1][1] * b);
    result += String.fromCharCode(x + 65) + String.fromCharCode(y + 65);
  }
  return result;
}


