const toggle = document.getElementById("toggle-checkbox");

toggle?.addEventListener("change", () => {
  document.documentElement.classList.toggle("dark-mode", toggle.checked);
  localStorage.setItem("dark-mode", toggle.checked ? "1" : "0");

  // ✅ activează tranziția DOAR când utilizatorul schimbă manual tema
  document.documentElement.classList.add("transition-enabled");

  setTimeout(() => {
    document.documentElement.classList.remove("transition-enabled");
  }, 1000);
});

window.addEventListener("DOMContentLoaded", () => {
  const isDark = localStorage.getItem("dark-mode") === "1";
  document.documentElement.classList.toggle("dark-mode", isDark);
});
