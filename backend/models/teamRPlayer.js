import pool from './db.js';

// Create teamRPlayer Table
const createTeamRPlayerTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "teamRPlayer" (
            "teamId" INT REFERENCES "teams"("teamId") ON DELETE CASCADE,
            "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            PRIMARY KEY ("teamId", "playerId")
        );
    `;
    try {
        await pool.query(query);
        console.log("teamRPlayer table is ready.");
    } catch (err) {
        console.error("Error creating teamRPlayer table:", err);
    }
};

// Insert a new record into teamRPlayer
const insertTeamRPlayer = async (teamId, playerId) => {
    const query = `
        INSERT INTO "teamRPlayer" ("teamId", "playerId")
        VALUES ($1, $2)
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [teamId, playerId]);
        console.log("Inserted into teamRPlayer:", result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error("Error inserting into teamRPlayer:", err);
        throw err;
    }
};

export { 
    createTeamRPlayerTable, 
    insertTeamRPlayer 
};