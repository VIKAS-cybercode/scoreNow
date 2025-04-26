

// backend/models/lookingM.js
import pool from '../models/db.js';

export const createLookingsTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS "lookings" (
      "id" SERIAL PRIMARY KEY,
      "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
      "name" VARCHAR(100) NOT NULL,
      "lookingFor" VARCHAR(50) NOT NULL,
      "description" TEXT NOT NULL,
      "location" VARCHAR(100) NOT NULL,
      "avatarUrl" TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(query);
    console.log('✅ lookings table is ready');
  } catch (err) {
    console.error("❌ Error creating lookings table:", err);
  }
};
createLookingsTable();
export const deleteLookingsTable = async () => {
  const client = await pool.connect();
  try {
    await client.query('DROP TABLE IF EXISTS lookings CASCADE;');
    console.log('🗑 lookings table deleted');
  } catch (err) {
    console.error("❌ Error deleting lookings table:", err);
  } finally {
    client.release();
  }
};
