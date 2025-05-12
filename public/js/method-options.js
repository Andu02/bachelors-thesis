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
    // hide the whole group
    config.show?.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    // disable the inputs but keep their name
    config.enable?.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.removeAttribute("required");
        el.setAttribute("disabled", "true");
        // ← no removeAttribute('name')
      }
    });
  });
}

// ✅ Activează opțiunile vizibile pentru metoda curentă
function enableOptionsFor(method) {
  const config = methodConfig[method];
  if (!config) return;

  // 1) Show only the groups for this method
  config.show?.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
  });

  // 2) Enable & require the inputs (but don’t touch their name!)
  config.enable?.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.removeAttribute("disabled");
      el.setAttribute("required", "true");
      // leave el.name alone so it will be submitted
    }
  });

  // 3) Clear any previous warning
  if (config.clearWarning) {
    const warningEl = document.getElementById(config.clearWarning);
    if (warningEl) {
      warningEl.classList.add("d-none");
      warningEl.textContent = "";
    }
  }

  // 4) Custom per‐method logic (e.g. Hill matrix, hide decrypt for bcrypt/sha256)
  if (typeof config.custom === "function") {
    const decryptSection = document.getElementById("decrypt-section");
    if (["bcrypt", "sha256"].includes(method)) {
      decryptSection?.classList.add("d-none");
    } else {
      decryptSection?.classList.remove("d-none");
    }
    config.custom();
  }

  // 5) RSA on‐the‐fly validation
  if (method === "rsa") {
    const warning = document.getElementById("rsa-warning");
    const pInput = document.getElementById("rsa-p");
    const qInput = document.getElementById("rsa-q");
    const eInput = document.getElementById("rsa-e");
    const submitBtn = document.querySelector("button[type='submit']");

    const p = pInput?.value;
    const q = qInput?.value;
    const e = eInput?.value;

    if (p && q && e) {
      const result = fixAndValidateRSA({ p, q, e });
      if (result.p !== p) pInput.value = result.p;
      if (result.q !== q) qInput.value = result.q;

      warning.classList.remove("d-none", "text-danger", "text-success");
      if (result.isValid) {
        warning.classList.add("text-success");
        warning.textContent = `Valori corecte: p = ${result.p}, q = ${result.q}, φ(n) = ${result.phi}.`;
        submitBtn.disabled = false;
      } else {
        warning.classList.add("text-danger");
        warning.textContent = `⚠️ φ(n) și e NU sunt prime între ele.`;
        submitBtn.disabled = true;
      }
    } else {
      warning.classList.add("d-none");
      submitBtn.disabled = true;
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
