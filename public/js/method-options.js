const methodSelect = document.getElementById("method");

// Caesar
const caesarKeyGroup = document.getElementById("caesar-key-group");
const caesarKeyInput = document.getElementById("caesar-key");

// Affine
const affineOptions = document.getElementById("affine-options");
const affineA = document.getElementById("affine-a");
const affineB = document.getElementById("affine-b");
const affineWarning = document.getElementById("affine-warning");

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

methodSelect?.addEventListener("change", () => {
  const method = methodSelect.value;

  // Caesar
  if (caesarKeyGroup && caesarKeyInput) {
    if (method === "caesar") {
      caesarKeyGroup.style.display = "block";
      caesarKeyInput.removeAttribute("disabled");
      caesarKeyInput.setAttribute("required", "true");
    } else {
      caesarKeyGroup.style.display = "none";
      caesarKeyInput.removeAttribute("required");
      caesarKeyInput.setAttribute("disabled", "true");
    }
  }

  // Affine
  if (affineOptions && affineWarning) {
    if (method === "affine") {
      affineOptions.style.display = "block";
    } else {
      affineOptions.style.display = "none";
      affineWarning.classList?.add("d-none");
      affineWarning.textContent = "";
    }
  }

  // Hill
  if (hillOptions && hillMatrixContainer && hillSizeSelect) {
    if (method === "hill") {
      hillOptions.style.display = "block";
      generateHillMatrix(parseInt(hillSizeSelect.value));
    } else {
      hillOptions.style.display = "none";
      hillMatrixContainer.innerHTML = "";
    }
  }

  // ECB / CBC
  if (symmetricKeyGroup) {
    symmetricKeyGroup.style.display =
      method === "ecb" || method === "cbc" ? "block" : "none";
  }

  // RSA
  if (rsaOptions && rsaInputs && rsaWarning) {
    if (method === "rsa") {
      rsaOptions.style.display = "block";
      rsaInputs.forEach((input) => {
        input.removeAttribute("disabled");
        input.setAttribute("required", "true");
      });
    } else {
      rsaOptions.style.display = "none";
      rsaWarning.classList?.add("d-none");
      rsaInputs.forEach((input) => {
        input.removeAttribute("required");
        input.setAttribute("disabled", "true");
      });
    }
  }
});
