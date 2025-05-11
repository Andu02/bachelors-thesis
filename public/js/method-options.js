import {
  updatePasswordPattern,
  adjustHillOptions,
  generateHillMatrix,
} from "./utils.js";
import { getMethodConfig } from "./method-config.js";

const methodSelect = document.querySelector("select[name='method']");
const passwordInput = document.getElementById("password");
const hillSizeSelect = document.getElementById("hill-size");
const rsaInputs = document.querySelectorAll("#rsa-options input");

const methodConfig = getMethodConfig(
  hillSizeSelect,
  rsaInputs,
  adjustHillOptions,
  generateHillMatrix
);

// 🔁 Ascunde toate grupurile de opțiuni
function hideAllOptions() {
  Object.values(methodConfig).forEach((config) => {
    config.show?.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.style.display = "none";
    });

    config.enable?.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.removeAttribute("required");
        element.setAttribute("disabled", "true");
      }
    });
  });
}

// ✅ Activează opțiunile vizibile pentru metoda curentă
function enableOptionsFor(method) {
  const config = methodConfig[method];
  if (!config) return;

  config.show?.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.style.display = "block";
  });

  config.enable?.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.removeAttribute("disabled");
      element.setAttribute("required", "true");
    }
  });

  if (config.clearWarning) {
    const warningElement = document.getElementById(config.clearWarning);
    if (warningElement) {
      warningElement.classList.add("d-none");
      warningElement.textContent = "";
    }
  }

  if (typeof config.custom === "function") {
    config.custom();
  }
}

// 🔁 Schimbare metodă selectată
function handleMethodChange(method) {
  hideAllOptions();
  if (methodConfig[method]) {
    enableOptionsFor(method);
  }
}

// 🔁 La selectarea unei metode
methodSelect?.addEventListener("change", () => {
  const method = methodSelect.value;
  updatePasswordPattern(method);
  handleMethodChange(method);
});

// 🔁 Inițializare la încărcare pagină
document.addEventListener("DOMContentLoaded", () => {
  const method = methodSelect?.value;
  if (method && methodConfig[method]) {
    updatePasswordPattern(method);
    handleMethodChange(method);
  } else {
    handleMethodChange(""); // ascunde tot dacă nu e selectat nimic
  }
});

// 🔁 Ajustează Hill când utilizatorul tastează parola
passwordInput?.addEventListener("input", adjustHillOptions);
