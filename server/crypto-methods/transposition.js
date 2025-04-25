export function encrypt(text) {
    const cleaned = text.replace(/[^A-Z]/gi, '').toUpperCase();
    let result = '';
    for (let i = 0; i < 5; i++) {
      for (let j = i; j < cleaned.length; j += 5) {
        result += cleaned[j];
      }
    }
    return result;
  }
  
  export function decrypt(text) {
    const numCols = 5;
    const numRows = Math.ceil(text.length / numCols);
    const shortCols = numCols * numRows - text.length;
    let result = new Array(text.length);
  
    let index = 0;
    for (let col = 0; col < numCols; col++) {
      let maxRows = col >= numCols - shortCols ? numRows - 1 : numRows;
      for (let row = 0; row < maxRows; row++) {
        result[row * numCols + col] = text[index++];
      }
    }
    return result.join('');
  }
  