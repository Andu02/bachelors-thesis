// server/attack-scripts/deleteAllUsers.js
import pool from "../db.js";

/**
 * Șterge toți utilizatorii din baza de date.
 * @returns {Promise<number>} numărul de rânduri șterse
 */
export default async function deleteAllUsers() {
  const result = await pool.query("DELETE FROM users");
  console.log(`✅ Toți utilizatorii au fost șterși (${result.rowCount}).`);
  return result.rowCount;
}
