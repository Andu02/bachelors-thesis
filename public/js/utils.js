export function updatePasswordPattern(method) {
  const passwordInput = document.getElementById("password");
  const onlyLetters = ["caesar", "affine", "vigenere", "hill"];

  if (!passwordInput) return;

  if (onlyLetters.includes(method)) {
    passwordInput.setAttribute("pattern", "[A-Za-z]+");
    passwordInput.setAttribute(
      "title",
      "Doar litere A–Z (fără cifre, spații sau simboluri)"
    );
  } else {
    passwordInput.removeAttribute("pattern");
    passwordInput.removeAttribute("title");
  }
}

export function adjustHillOptions() {
  const passwordInput = document.getElementById("password");
  const hillSizeSelect = document.getElementById("hill-size");
  const hillOptions = document.getElementById("hill-options");

  if (!passwordInput || !hillSizeSelect || !hillOptions) return;

  const clean = passwordInput.value.toUpperCase().replace(/[^A-Z]/g, "");
  const len = clean.length;
  const option3 = hillSizeSelect.querySelector('option[value="3"]');

  // ⚠️ Dezactivează opțiunea 3x3 dacă parola e prea scurtă
  if (option3) {
    option3.disabled = len < 6;

    if (option3.disabled && hillSizeSelect.value === "3") {
      hillSizeSelect.value = "2";
      generateHillMatrix(2);
    }
  }

  // 🔴 Afișează avertisment DOAR dacă e selectat 3x3 și parola < 6
  let warning = document.getElementById("hill-warning");
  if (!warning) {
    warning = document.createElement("div");
    warning.id = "hill-warning";
    warning.className = "form-text text-danger mt-1";
    hillOptions.appendChild(warning);
  }

  warning.textContent =
    len < 6 && hillSizeSelect.value === "3"
      ? "Parola este prea scurtă pentru criptare 3x3. Minim 6 litere necesare."
      : "";
}

export function generateHillMatrix(size) {
  const hillMatrixContainer = document.getElementById("hill-matrix-container");
  if (!hillMatrixContainer) return;

  hillMatrixContainer.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("table", "table-bordered", "text-center");

  for (let i = 0; i < size; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < size; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.name = `hill[${i}][${j}]`;
      input.classList.add("form-control");
      input.required = true;
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  hillMatrixContainer.appendChild(table);
}
