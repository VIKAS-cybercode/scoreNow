import pool from './db.js';

// Create Teams Table
const createTeamsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "teams" (
            "teamId" SERIAL PRIMARY KEY,
            "name" VARCHAR(100) NOT NULL,
            "location" VARCHAR(100),
            "profilePicture" VARCHAR(255),
            "matches" INT DEFAULT 0,
            "won" INT DEFAULT 0,
            "loss" INT DEFAULT 0,
            "noResult" INT DEFAULT 0,
            "captainId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log("Teams table is ready.");
    } catch (err) {
        console.error("Error creating teams table:", err);
    }
};

const updateTeam = async (teamId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    values.push(teamId);

    const query = `UPDATE "teams" SET ${setClause} WHERE "teamId" = $${values.length} RETURNING *;`;

    try {
        const result = await pool.query(query, values);
        console.log("Team updated:", result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error("Error updating team:", err);
        throw err;
    }
};

// createTeamsTable();
export { createTeamsTable, updateTeam };
