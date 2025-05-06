const methodSelect = document.getElementById("method");

// Hill
const hillOptions = document.getElementById("hill-options");
const hillSizeSelect = document.getElementById("hill-size");
const hillMatrixContainer = document.getElementById("hill-matrix-container");

// ECB / CBC
const symmetricKeyGroup = document.getElementById("symmetric-key-group");

// RSA
const rsaOptions = document.getElementById("rsa-options");
const rsaInputs = rsaOptions ? rsaOptions.querySelectorAll("input") : [];
const rsaWarning = document.getElementById("rsa-warning");

// Dacă există selectul metodei
if (methodSelect) {
  methodSelect.addEventListener("change", () => {
    const method = methodSelect.value;

    // Hill
    if (
      method === "hill" &&
      hillOptions &&
      hillSizeSelect &&
      hillMatrixContainer
    ) {
      hillOptions.style.display = "block";
      generateHillMatrix(parseInt(hillSizeSelect.value));
    } else if (hillOptions && hillMatrixContainer) {
      hillOptions.style.display = "none";
      hillMatrixContainer.innerHTML = "";
    }

    // ECB / CBC
    if (symmetricKeyGroup) {
      symmetricKeyGroup.style.display =
        method === "ecb" || method === "cbc" ? "block" : "none";
    }

    // RSA
    if (rsaOptions) {
      if (method === "rsa") {
        rsaOptions.style.display = "block";
        rsaInputs.forEach((input) => {
          input.removeAttribute("disabled");
          input.setAttribute("required", "true");
        });
      } else {
        rsaOptions.style.display = "none";
        rsaWarning?.classList.add("d-none");
        rsaWarning.textContent = "";
        rsaInputs.forEach((input) => {
          input.removeAttribute("required");
          input.setAttribute("disabled", "true");
        });
      }
    }
  });
}

// Re-generează matricea Hill dacă există
if (hillSizeSelect && hillMatrixContainer) {
  hillSizeSelect.addEventListener("change", () => {
    generateHillMatrix(parseInt(hillSizeSelect.value));
  });
}

// Creează inputuri pentru matricea Hill
function generateHillMatrix(n) {
  hillMatrixContainer.innerHTML = "";
  const table = document.createElement("table");
  table.classList.add("table", "table-bordered", "text-center");

  for (let i = 0; i < n; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < n; j++) {
      const cell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.required = true;
      input.className = "form-control";
      input.name = `hill[${i}][${j}]`;
      cell.appendChild(input);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }

  hillMatrixContainer.appendChild(table);
}

// Calculează GCD
function gcd(a, b) {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

// Verifică validitatea e față de phi(n)
function checkRSAValidity() {
  try {
    const p = BigInt(document.getElementById("rsa-p").value);
    const q = BigInt(document.getElementById("rsa-q").value);
    const e = BigInt(document.getElementById("rsa-e").value);
    const phi = (p - 1n) * (q - 1n);

    if (gcd(e, phi) !== 1n) {
      rsaWarning.classList.remove("d-none");
      rsaWarning.textContent = `Exponentul public e trebuie să fie prim cu φ(n) = ${phi}.`;
      return false;
    } else {
      rsaWarning.classList.add("d-none");
      rsaWarning.textContent = "";
      return true;
    }
  } catch {
    rsaWarning.classList.remove("d-none");
    rsaWarning.textContent =
      "Toate câmpurile RSA trebuie completate cu numere valide.";
    return false;
  }
}

// Activare validare RSA dacă există inputurile
rsaInputs.forEach((input) => {
  input.addEventListener("input", checkRSAValidity);
});
