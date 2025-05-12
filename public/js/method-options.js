import {
  updatePasswordPattern,
  adjustHillOptions,
  generateHillMatrix,
  fixAndValidateRSA,
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
export function hideAllOptions() {
  Object.values(methodConfig).forEach((config) => {
    config.show?.forEach((id) => {
      const element = document.getElementById(id);
      if (element) element.style.display = "none";
    });

    config.enable?.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.removeAttribute("required");
        element.removeAttribute("name");
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

  // Custom logic (ex: Hill, RSA)
  if (typeof config.custom === "function") {
    // ❌ Ascunde secțiunea de decriptare pentru metode nereversibile
    const decryptSection = document.getElementById("decrypt-section");
    if (["bcrypt", "sha256"].includes(method)) {
      if (decryptSection) decryptSection.classList.add("d-none");
    } else {
      if (decryptSection) decryptSection.classList.remove("d-none");
    }

    config.custom();
  }

  // ✅ RSA: validare automată
  if (method === "rsa") {
    const warning = document.getElementById("rsa-warning");
    const pInput = document.getElementById("rsa-p");
    const qInput = document.getElementById("rsa-q");
    const eInput = document.getElementById("rsa-e");
    const submitButton = document.querySelector("button[type='submit']");

    const p = pInput?.value;
    const q = qInput?.value;
    const e = eInput?.value;

    if (p && q && e) {
      const result = fixAndValidateRSA({ p, q, e });

      // 🛠 înlocuiește în UI dacă a fost corectat
      if (result.p !== p) pInput.value = result.p;
      if (result.q !== q) qInput.value = result.q;

      warning.classList.remove("d-none", "text-danger", "text-success");

      if (result.isValid) {
        warning.classList.add("text-success");
        warning.textContent = `Valori corecte: p = ${result.p}, q = ${result.q}, φ(n) = ${result.phi}. e este prim cu φ(n).`;
        submitButton.disabled = false;
      } else {
        warning.classList.add("text-danger");
        warning.textContent = `Valori corectate: p = ${result.p}, q = ${result.q}, φ(n) = ${result.phi}. ⚠️ e NU este prim cu φ(n).`;
        submitButton.disabled = true;
      }
    } else {
      warning.classList.add("d-none");
      submitButton.disabled = true;
    }
  }
}

// 🔁 La selectarea unei metode
methodSelect?.addEventListener("change", () => {
  const method = methodSelect.value;
  hideAllOptions(); // 🔁 ascunde tot înainte
  updatePasswordPattern(method);
  enableOptionsFor(method);
});

// 🔁 Inițializare la încărcare pagină
document.addEventListener("DOMContentLoaded", () => {
  const method = methodSelect?.value;
  if (method && methodConfig[method]) {
    updatePasswordPattern(method);
    enableOptionsFor(method);
  } else {
    hideAllOptions(); // ascunde tot dacă nu e selectat nimic
  }
});

// 🔁 Ajustează Hill când utilizatorul tastează parola
passwordInput?.addEventListener("input", adjustHillOptions);

// 🔁 Revalidare RSA la input
["rsa-p", "rsa-q", "rsa-e"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", () => enableOptionsFor("rsa"));
  }
});
