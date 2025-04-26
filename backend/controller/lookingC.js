// backend/controllers/lookingC.js
import pool from '../models/db.js';

export const getAllLookings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * 
         FROM "lookings" 
        ORDER BY "createdAt" DESC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error fetching lookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLooking = async (req, res) => {
  const {
    playerId,
    name,
    lookingFor,
    description,
    location,
    avatarUrl
  } = req.body;

  if (!playerId) {
    return res.status(400).json({ error: 'playerId is required' });
  }

  try {
    const insertQuery = `
      INSERT INTO "lookings"
        ("playerId", "name", "lookingFor", "description", "location", "avatarUrl")
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [playerId, name, lookingFor, description, location, avatarUrl];
    const result = await pool.query(insertQuery, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error creating looking:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
