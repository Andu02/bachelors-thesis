import { collectCryptoParams } from "./utils.js";

document
  .getElementById("register-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const messageDiv = document.getElementById("register-message");
    messageDiv.classList.remove("d-none", "alert-success", "alert-danger");

    const form = document.getElementById("register-form");
    const username = form.username.value;
    const password = form.password.value;

    const { method, caesarKey, hill, symmetricKey, rsa, affineA, affineB } =
      collectCryptoParams("register-form");

    try {
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
        }),
      });

      const data = await response.json();

      messageDiv.classList.add(response.ok ? "alert-success" : "alert-danger");
      messageDiv.textContent = data.message;

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
      messageDiv.classList.add("alert-danger");
      messageDiv.textContent = "Eroare la înregistrare: " + err.message;
    }
  });
