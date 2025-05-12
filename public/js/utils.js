// 🔠 Setează pattern-ul de parolă în funcție de metoda aleasă
export function updatePasswordPattern(method) {
  const passwordInput =
    document.getElementById("password") ||
    document.getElementById("new-password");

  if (!passwordInput) return;

  if (
    [
      "caesar",
      "vigenere",
      "hill",
      "affine",
      "transposition",
      "permutation",
    ].includes(method)
  ) {
    passwordInput.pattern = "[A-Za-z]+";
    passwordInput.title = "Doar litere A–Z (fără cifre, spații sau simboluri)";
  } else {
    passwordInput.pattern = "^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$";
    passwordInput.title =
      "Minim 8 caractere, o literă mare, o cifră și un caracter special";
  }
}

export function collectCryptoParams(formId) {
  const form = document.getElementById(formId);
  const method = form.querySelector("select[name='method']")?.value;

  // 🔐 Caesar
  const caesarKeyInput = form.querySelector("#caesar-key");
  const caesarKey = caesarKeyInput ? parseInt(caesarKeyInput.value) : null;

  // 🔐 Hill
  const hillInputs = form.querySelectorAll("#hill-matrix-container input");
  const hill = {};
  hillInputs.forEach((input) => {
    const match = input.name.match(/hill\[(\d+)]\[(\d+)]/);
    if (match) {
      const i = match[1],
        j = match[2];
      if (!hill[i]) hill[i] = {};
      hill[i][j] = input.value;
    }
  });

  // 🔐 ECB / CBC
  const symmetricKeyInput = form.querySelector("#symmetric-key");
  const symmetricKey = symmetricKeyInput ? symmetricKeyInput.value : null;

  // 🔐 RSA
  const rsaP = form.querySelector("#rsa-p")?.value;
  const rsaQ = form.querySelector("#rsa-q")?.value;
  const rsaE = form.querySelector("#rsa-e")?.value;
  const rsa = rsaP && rsaQ && rsaE ? { p: rsaP, q: rsaQ, e: rsaE } : null;

  // 🔐 Affine
  const affineA = form.querySelector("#affine-a")?.value;
  const affineB = form.querySelector("#affine-b")?.value;

  // 🔐 Bcrypt
  const bcryptSaltInput = form.querySelector("#bcrypt-salt");
  const bcryptSalt = bcryptSaltInput ? parseInt(bcryptSaltInput.value) : null;

  return {
    method,
    caesarKey,
    hill,
    symmetricKey,
    rsa,
    affineA: affineA ? parseInt(affineA) : null,
    affineB: affineB ? parseInt(affineB) : null,
    bcryptSalt,
  };
}

export function fixAndValidateRSA({ p, q, e }) {
  let bigP = BigInt(p);
  let bigQ = BigInt(q);
  const bigE = BigInt(e);

  // 🛠 Înlocuiește p cu următorul prim dacă nu e valid
  if (!isPrime(bigP)) bigP = nextPrime(bigP);
  if (!isPrime(bigQ)) bigQ = nextPrime(bigQ);

  const phi = (bigP - 1n) * (bigQ - 1n);
  const isValid = gcd(bigE, phi) === 1n;

  return {
    p: bigP.toString(),
    q: bigQ.toString(),
    e: bigE.toString(),
    phi: phi.toString(),
    isValid,
  };
}

function isPrime(n) {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;
  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) return false;
  }
  return true;
}

function nextPrime(n) {
  let candidate = n + 1n;
  while (!isPrime(candidate)) {
    candidate += 1n;
  }
  return candidate;
}

// Hill ------------------------------------------

// 🔄 Ajustează opțiunile pentru Hill în funcție de lungimea parolei
export function adjustHillOptions() {
  const sizeSelect = document.getElementById("hill-size");
  const container = document.getElementById("hill-matrix-container");
  const warning = document.getElementById("hill-warning");
  const password = (document.getElementById("password") || {}).value || "";

  if (!sizeSelect || !container || !warning) return;

  const size = parseInt(sizeSelect.value);
  const requiredLength = size * size;

  if (password.length < requiredLength) {
    warning.textContent = `Parola trebuie să aibă cel puțin ${requiredLength} caractere pentru o matrice ${size}x${size}.`;
    warning.classList.remove("d-none");
  } else {
    warning.textContent = "";
    warning.classList.add("d-none");
  }
}

// 🔢 Generează matricea Hill
function buildMatrixFromInputs(size, container) {
  const matrix = [];
  for (let i = 0; i < size; i++) {
    matrix[i] = [];
    for (let j = 0; j < size; j++) {
      const input = container.querySelector(
        `[data-row="${i}"][data-col="${j}"]`
      );
      matrix[i][j] = parseInt(input?.value) || 0;
    }
  }
  return matrix;
}

// 🧮 Generează inputurile pentru matricea Hill și salvează JSON-ul în input hidden
export function generateHillMatrix(size) {
  const container = document.getElementById("hill-matrix-container");
  const warning = document.getElementById("hill-warning");
  const hiddenInput = document.getElementById("hill-matrix");
  const submitButton = document.querySelector("button[type='submit']");

  if (!container || !hiddenInput || !submitButton) return;

  let html = '<div class="d-flex flex-column gap-2">';
  for (let i = 0; i < size; i++) {
    html += '<div class="d-flex gap-2">';
    for (let j = 0; j < size; j++) {
      html += `<input
        type="number"
        class="form-control text-center hill-cell"
        data-row="${i}" data-col="${j}"
        min="0" max="25" required
      />`;
    }
    html += "</div>";
  }
  html += "</div>";
  container.innerHTML = html;

  const inputs = container.querySelectorAll(".hill-cell");

  function updateMatrixAndValidate() {
    const matrix = buildMatrixFromInputs(size, container);
    hiddenInput.value = JSON.stringify(matrix);

    const valid = isHillMatrixValid(matrix);
    warning.classList.toggle("d-none", valid);
    warning.textContent = valid
      ? ""
      : "Matricea Hill este invalidă. Determinantul nu are invers modular în Z26.";

    // Blochează butonul de submit dacă matricea este invalidă
    submitButton.disabled = !valid;
  }

  inputs.forEach((input) =>
    input.addEventListener("input", updateMatrixAndValidate)
  );

  updateMatrixAndValidate(); // inițializare
}

// 🔢 GCD – cel mai mare divizor comun
export function gcd(a, b) {
  const isBigInt = typeof a === "bigint" || typeof b === "bigint";

  if (isBigInt) {
    a = BigInt(a < 0 ? -a : a);
    b = BigInt(b < 0 ? -b : b);
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a;
  } else {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }
}

// 🔁 Modulo pozitiv universal
export function modN(n, m) {
  return ((n % m) + m) % m;
}

// 🧮 Determinant recursiv pentru matrice pătratică
export function determinant(matrix) {
  const n = matrix.length;
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let col = 0; col < n; col++) {
    const sub = matrix.slice(1).map((row) => row.filter((_, j) => j !== col));
    det += (col % 2 === 0 ? 1 : -1) * matrix[0][col] * determinant(sub);
  }
  return det;
}

// ✅ Verifică dacă determinantul are invers modular în Z26
export function isHillMatrixValid(matrix) {
  const det = modN(determinant(matrix), 26);
  return gcd(det, 26) === 1;
}

// -------------------------------------------------
