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

// Schimbarea metodei
methodSelect.addEventListener("change", () => {
  const method = methodSelect.value;

  // Hill
  hillOptions.style.display = method === "hill" ? "block" : "none";
  if (method === "hill") generateHillMatrix(parseInt(hillSizeSelect.value));
  else hillMatrixContainer.innerHTML = "";

  // ECB/CBC
  symmetricKeyGroup.style.display =
    method === "ecb" || method === "cbc" ? "block" : "none";

  // RSA
  if (method === "rsa" && rsaOptions) {
    rsaOptions.style.display = "block";
    rsaInputs.forEach((input) => {
      input.removeAttribute("disabled");
      input.setAttribute("required", "true");
    });
  } else if (rsaOptions) {
    rsaOptions.style.display = "none";
    rsaWarning?.classList.add("d-none");
    rsaInputs.forEach((input) => {
      input.removeAttribute("required");
      input.setAttribute("disabled", "true");
    });
  }
});

hillSizeSelect?.addEventListener("change", () => {
  generateHillMatrix(parseInt(hillSizeSelect.value));
});

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

// RSA validare
function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function checkRSAValidity() {
  try {
    const p = BigInt(document.getElementById("rsa-p").value);
    const q = BigInt(document.getElementById("rsa-q").value);
    const e = BigInt(document.getElementById("rsa-e").value);
    const phi = (p - 1n) * (q - 1n);
    if (gcd(e, phi) !== 1n) {
      rsaWarning.classList.remove("d-none");
      rsaWarning.textContent = `Exponentul public e trebuie să fie prim cu φ(n) = ${phi}`;
      return false;
    } else {
      rsaWarning.classList.add("d-none");
      return true;
    }
  } catch {
    rsaWarning.classList.remove("d-none");
    rsaWarning.textContent = "Toate câmpurile RSA trebuie completate corect.";
    return false;
  }
}

rsaInputs.forEach((input) => input.addEventListener("input", checkRSAValidity));
