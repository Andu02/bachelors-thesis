// ============================
// Importă funcția de colectare a parametrilor criptografici
// ============================
import { collectCryptoParams } from "./utils.js";

// ============================
// Adaugă un event listener pe formularul de înregistrare
// ============================
document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    // Selectează div-ul pentru mesaje și resetează stilurile
    const messageDiv = document.getElementById("register-message");
    messageDiv.classList.remove("d-none", "alert-success", "alert-danger");

    // Colectează datele din formular
    const form = document.getElementById("register-form");
    const username = form.username.value;
    const password = form.password.value;

    // Colectează parametrii specifici metodei selectate
    const {
      method,
      caesarKey,
      hill,
      symmetricKey,
      rsa,
      affineA,
      affineB,
      bcryptSalt,
      sha256Salt,
    } = collectCryptoParams("register-form");

    try {
      // Trimite cererea către backend prin fetch (POST JSON)
      const response = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          method,
          caesarKey,
          hill,
          symmetricKey,
          rsa,
          affineA,
          affineB,
          bcryptSalt,
          sha256Salt,
        }),
      });

      // Prelucrează răspunsul și afișează mesajul corespunzător
      const data = await response.json();
      messageDiv.classList.add(response.ok ? "alert-success" : "alert-danger");
      messageDiv.textContent = data.message;

      // Redirecționează la succes sau ascunde mesajul de eroare
      if (response.ok) {
        setTimeout(() => {
          window.location.href = "/success-register";
        }, 1000);
      } else {
        setTimeout(() => {
          messageDiv.classList.add("d-none");
          messageDiv.textContent = "";
        }, 6000);
      }
    } catch (err) {
      // În caz de eroare de rețea sau excepție
      messageDiv.classList.add("alert-danger");
      messageDiv.textContent = "Eroare la înregistrare: " + err.message;
    }
  });
