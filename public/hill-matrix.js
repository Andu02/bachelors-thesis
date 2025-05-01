const methodSelect = document.getElementById('method');
const hillOptions = document.getElementById('hill-options');
const hillSizeSelect = document.getElementById('hill-size');
const hillMatrixContainer = document.getElementById('hill-matrix-container');

methodSelect.addEventListener('change', () => {
  if (methodSelect.value === 'hill') {
    hillOptions.style.display = 'block';
    generateHillMatrix(parseInt(hillSizeSelect.value));
  } else {
    hillOptions.style.display = 'none';
    hillMatrixContainer.innerHTML = '';
  }
});

hillSizeSelect.addEventListener('change', () => {
  generateHillMatrix(parseInt(hillSizeSelect.value));
});

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
