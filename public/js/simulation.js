// ============================
// Funcție pentru activare/dezactivare butoane
// ============================
function setLoading(active) {
  document.querySelectorAll("button").forEach((b) => (b.disabled = active));
}

// ============================
// 1. Generează utilizatori
// ============================
document.getElementById("btn-generate").onclick = async () => {
  const count = +document.getElementById("input-count").value || 1000;
  setLoading(true);
  document.getElementById("spinner-generate").classList.remove("d-none");
  document.getElementById("link-generate").classList.add("d-none");

  try {
    const res = await fetch("/simulation/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    if (!res.ok) throw new Error("Server error");

    const { reportUrl } = await res.json();
    const link = document.getElementById("link-generate");
    link.href = reportUrl;
    link.classList.remove("d-none");

    // ✅ Afișează secțiunea de ștergere
    document.getElementById("section-delete").classList.remove("d-none");
  } catch (e) {
    alert(e.message);
  } finally {
    document.getElementById("spinner-generate").classList.add("d-none");
    setLoading(false);
  }
};

// ============================
// 2. Șterge toți utilizatorii
// ============================
document.getElementById("btn-delete").onclick = async () => {
  setLoading(true);
  document.getElementById("spinner-delete").classList.remove("d-none");
  document.getElementById("text-delete").textContent = "";

  try {
    const res = await fetch("/simulation/delete-all", { method: "POST" });
    if (!res.ok) throw new Error("Server error");

    const { deleted } = await res.json();
    document.getElementById(
      "text-delete"
    ).textContent = `Au fost șterși ${deleted} utilizatori.`;
  } catch (e) {
    alert(e.message);
  } finally {
    document.getElementById("spinner-delete").classList.add("d-none");
    setLoading(false);
  }
};

// ============================
// 3. Brute-force
// ============================
document.getElementById("btn-bruteforce").onclick = async () => {
  setLoading(true);
  document.getElementById("spinner-bruteforce").classList.remove("d-none");
  document.getElementById("link-bruteforce").classList.add("d-none");

  try {
    const res = await fetch("/simulation/bruteforce", { method: "POST" });
    if (!res.ok) throw new Error("Server error");

    const { reportUrl } = await res.json();
    const link = document.getElementById("link-bruteforce");
    link.href = reportUrl;
    link.classList.remove("d-none");

    // ✅ Afișează secțiunea de comparare
    document.getElementById("section-compare").classList.remove("d-none");
  } catch (e) {
    alert(e.message);
  } finally {
    document.getElementById("spinner-bruteforce").classList.add("d-none");
    setLoading(false);
  }
};

// ============================
// 4. Compară rezultate
// ============================
document.getElementById("btn-compare").onclick = async () => {
  setLoading(true);
  document.getElementById("spinner-compare").classList.remove("d-none");
  document.getElementById("link-compare").classList.add("d-none");

  try {
    const res = await fetch("/simulation/compare", { method: "POST" });
    if (!res.ok) throw new Error("Server error");

    const { reportUrl } = await res.json();
    const link = document.getElementById("link-compare");
    link.href = reportUrl;
    link.classList.remove("d-none");
  } catch (e) {
    alert(e.message);
  } finally {
    document.getElementById("spinner-compare").classList.add("d-none");
    setLoading(false);
  }
};
