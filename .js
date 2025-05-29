// Prelucrează răspunsul și afișează mesajul corespunzător
const data = await response.json();
messageDiv.classList.add(response.ok ? "alert-success" : "alert-danger");
messageDiv.textContent = data.message;

// Redirecționează la pagina de succes sau ascunde mesajul de eroare
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
