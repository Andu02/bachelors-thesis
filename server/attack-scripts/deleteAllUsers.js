// server/scripts/deleteAllUsers.js
import pool from "../db.js";

(async () => {
  try {
    const result = await pool.query("DELETE FROM users");
    console.log(
      `✅ Toți utilizatorii au fost șterși (${result.rowCount} rânduri).`
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Eroare la ștergerea utilizatorilor:", err.message);
    process.exit(1);
  }
})();
