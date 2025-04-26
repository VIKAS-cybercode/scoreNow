import pool from './db.js';

// Create matchRPlayer Table with foreign keys referencing match and players
const createMatchRPlayerTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "matchRPlayer" (
            "matchId" INT REFERENCES "matches"("matchId") ON DELETE CASCADE,
            "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "teamId" INT REFERENCES "teams"("teamId") ON DELETE CASCADE,
            "isPlaying" BOOLEAN DEFAULT false,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY ("matchId", "playerId", "teamId")
        );
    `;
    try {
        await pool.query(query);
        console.log("matchRPlayer table is ready.");
    } catch (err) {
        console.error("Error creating matchRPlayer table:", err);
    }
};

export { createMatchRPlayerTable };

// if the entry is present update in using ON CONFLICT
// const insertMatchRPlayer = async (matchId, playerId, teamId, isPlaying = false) => {
//     const query = `
//         INSERT INTO matchRPlayer (matchId, playerId, teamId, isPlaying)
//         VALUES ($1, $2, $3, $4)
//         ON CONFLICT (matchId, playerId) DO UPDATE 
//         SET teamId = EXCLUDED.teamId, isPlaying = EXCLUDED.isPlaying
//         RETURNING *;
//     `;
    
//     try {
//         const result = await pool.query(query, [matchId, playerId, teamId, isPlaying]);
//         console.log("Inserted/Updated matchRPlayer record:", result.rows[0]);
//         return result.rows[0];
//     } catch (err) {
//         console.error("Error inserting/updating matchRPlayer:", err);
//         throw err;
//     }
// };

