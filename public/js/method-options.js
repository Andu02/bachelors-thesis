import {
  updatePasswordPattern,
  adjustHillOptions,
  generateHillMatrix,
} from "./utils.js";

const methodSelect = document.querySelector("select[name='method']");
const passwordInput = document.getElementById("password");
const hillSizeSelect = document.getElementById("hill-size");
const rsaInputs = document.querySelectorAll("#rsa-options input");

const methodConfig = {
  caesar: {
    show: ["caesar-key-group"],
    enable: ["caesar-key"],
  },
  affine: {
    show: ["affine-options"],
    enable: ["affine-a", "affine-b"],
    clearWarning: "affine-warning",
  },
  hill: {
    show: ["hill-options"],
    custom: () => {
      adjustHillOptions();
      const size = parseInt(hillSizeSelect?.value);
      if (!isNaN(size)) generateHillMatrix(size);
    },
  },
  ecb: {
    show: ["symmetric-key-group"],
    enable: ["symmetric-key"],
  },
  cbc: {
    show: ["symmetric-key-group"],
    enable: ["symmetric-key"],
  },
  rsa: {
    show: ["rsa-options"],
    enable: Array.from(rsaInputs).map((input) => input.id),
    clearWarning: "rsa-warning",
  },
};

function handleMethodChange(method) {
  // Dacă metoda este invalidă sau nealeasă, ascunde și dezactivează tot
  if (!methodConfig[method]) {
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
    return;
  }

  // Ascunde și dezactivează toate opțiunile
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

  // Afișează și activează opțiunile pentru metoda curentă
  const current = methodConfig[method];

  current.show?.forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.style.display = "block";
  });

  current.enable?.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.removeAttribute("disabled");
      element.setAttribute("required", "true");
    }
  });

  if (current.clearWarning) {
    const warningElement = document.getElementById(current.clearWarning);
    if (warningElement) {
      warningElement.classList.add("d-none");
      warningElement.textContent = "";
    }
  }

  if (typeof current.custom === "function") {
    current.custom();
  }
}

// Schimbare de metodă selectată
methodSelect?.addEventListener("change", () => {
  const method = methodSelect.value;
  updatePasswordPattern(method);
  handleMethodChange(method);
});

// Inițializare la încărcare
document.addEventListener("DOMContentLoaded", () => {
  const method = methodSelect?.value;
  if (method && methodConfig[method]) {
    updatePasswordPattern(method);
    handleMethodChange(method);
  } else {
    handleMethodChange(""); // forțăm ascunderea totală dacă nu e selectată metoda
  }
});

// Actualizare dinamică pentru cifrul Hill
passwordInput?.addEventListener("input", adjustHillOptions);
