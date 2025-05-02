const methodSelect = document.getElementById('method');
const hillOptions = document.getElementById('hill-options');
const hillSizeSelect = document.getElementById('hill-size');
const hillMatrixContainer = document.getElementById('hill-matrix-container');
const symmetricKeyGroup = document.getElementById('symmetric-key-group');

methodSelect.addEventListener('change', () => {
  const method = methodSelect.value;

  // Afișăm opțiunile pentru Hill
  if (method === 'hill') {
    hillOptions.style.display = 'block';
    generateHillMatrix(parseInt(hillSizeSelect.value));
  } else {
    hillOptions.style.display = 'none';
    hillMatrixContainer.innerHTML = '';
  }

  // Afișăm câmpul de cheie pentru ECB/CBC
  if (method === 'ecb' || method === 'cbc') {
    symmetricKeyGroup.style.display = 'block';
  } else {
    symmetricKeyGroup.style.display = 'none';
  }
});

// Re-generează matricea Hill la schimbarea dimensiunii
hillSizeSelect?.addEventListener('change', () => {
  generateHillMatrix(parseInt(hillSizeSelect.value));
});

// Creează inputuri pentru matricea Hill
function generateHillMatrix(n) {
  hillMatrixContainer.innerHTML = '';
  const table = document.createElement('table');
  table.classList.add('table', 'table-bordered', 'text-center');

  for (let i = 0; i < n; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < n; j++) {
      const cell = document.createElement('td');
      const input = document.createElement('input');
      input.type = 'number';
      input.required = true;
      input.className = 'form-control';
      input.name = `hill[${i}][${j}]`;
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  hillMatrixContainer.appendChild(table);
}
