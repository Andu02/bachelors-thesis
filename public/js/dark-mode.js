const toggle = document.getElementById("toggle-checkbox");

toggle?.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark-mode", toggle.checked);
  localStorage.setItem("dark-mode", toggle.checked ? "1" : "0");
});

window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("dark-mode") === "1";
  document.documentElement.classList.toggle("dark-mode", isDark);
});
