import { collectCryptoParams } from "./utils.js";
import { hideAllOptions } from "./method-options.js";

// ✅ toggleForm pentru butonul de afișare formular
window.toggleForm = function () {
  const form = document.getElementById("change-password-form");
  const button = document.getElementById("toggle-button");
  const isHidden = form.classList.contains("d-none");
  form.classList.toggle("d-none");
  button.textContent = isHidden
    ? "Anulează schimbarea parolei"
    : "Schimbă parola";
};

document
  .getElementById("change-password-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const messageDiv = document.getElementById("change-password-message");
    messageDiv.classList.remove("d-none", "alert-success", "alert-danger");

    const form = document.getElementById("change-password-form");
    const oldPassword = form.oldPassword.value;
    const newPassword = form.newPassword.value;

    if (oldPassword === newPassword) {
      messageDiv.classList.add("alert-danger");
      messageDiv.textContent =
        "Parola nouă nu poate fi identică cu parola veche.";
      return;
    }

    // ← first pull out everything, including `method`
    const { method, caesarKey, hill, symmetricKey, rsa, affineA, affineB } =
      collectCryptoParams("change-password-form");

    try {
      const response = await fetch("/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          method,
          caesarKey,
          hill,
          symmetricKey,
          rsa,
          affineA,
          affineB,
        }),
      });

      const data = await response.json();

      messageDiv.classList.add(response.ok ? "alert-success" : "alert-danger");
      messageDiv.textContent = data.message;

      if (response.ok) {
        form.reset();
        hideAllOptions();
        toggleForm();
        setTimeout(() => {
          messageDiv.classList.add("d-none");
          messageDiv.textContent = "";
        }, 6000);
      }
    } catch (err) {
      messageDiv.classList.add("alert-danger");
      messageDiv.textContent = "Eroare: " + err.message;
    }
  });
