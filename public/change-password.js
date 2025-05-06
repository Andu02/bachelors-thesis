function toggleForm() {
  const form = document.getElementById("change-password-form");
  const button = document.getElementById("toggle-button");
  const isHidden = form.classList.contains("d-none");
  form.classList.toggle("d-none");
  button.textContent = isHidden
    ? "Anulează schimbarea parolei"
    : "Schimbă parola";
}

document
  .getElementById("change-password-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const oldPassword = document.getElementById("old-password").value;
    const newPassword = document.getElementById("new-password").value;
    const method = document.getElementById("method").value;

    // Cheie simetrică (ECB/CBC)
    const symmetricKeyInput = document.getElementById("symmetric-key");
    const symmetricKey = symmetricKeyInput ? symmetricKeyInput.value : null;

    // Matrice Hill
    const hillInputs = document.querySelectorAll(
      "#hill-matrix-container input"
    );
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

    const messageDiv = document.getElementById("change-password-message");

    // ✅ VERIFICARE: parola nouă nu trebuie să fie identică cu cea veche
    if (oldPassword === newPassword) {
      messageDiv.classList.remove("d-none", "alert-success");
      messageDiv.classList.add("alert-danger");
      messageDiv.textContent =
        "Parola nouă nu poate fi identică cu parola veche.";
      return;
    }

    try {
      const response = await fetch("/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          method,
          hill,
          symmetricKey,
        }),
      });

      const data = await response.json();
      messageDiv.classList.remove("d-none", "alert-success", "alert-danger");
      messageDiv.classList.add(response.ok ? "alert-success" : "alert-danger");
      messageDiv.textContent = data.message;

      if (response.ok) {
        document.getElementById("old-password").value = "";
        document.getElementById("new-password").value = "";
        if (symmetricKeyInput) symmetricKeyInput.value = "";
      }
    } catch (err) {
      messageDiv.classList.remove("d-none");
      messageDiv.classList.add("alert-danger");
      messageDiv.textContent = "A apărut o eroare: " + err.message;
    }
  });
