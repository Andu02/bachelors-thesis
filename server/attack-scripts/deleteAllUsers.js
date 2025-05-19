// server/attack-scripts/deleteAllUsers.js
import pool from "../db.js";

export default async function deleteAllUsers() {
  const result = await pool.query("DELETE FROM users");
  console.log(`✅ Toți utilizatorii au fost șterși (${result.rowCount}).`);
  return result.rowCount;
}
