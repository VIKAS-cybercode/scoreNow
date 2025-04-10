import pool from './db.js';

// Create "tournamentPlayerBattingStats" Table
const createTournamentPlayerBattingStatsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "tournamentPlayerBattingStats" (
            "tournamentId" INT REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE,
            "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "innings" INT DEFAULT 0,
            "runs" INT DEFAULT 0,
            "highestScore" INT DEFAULT 0,
            "fours" INT DEFAULT 0,
            "sixes" INT DEFAULT 0,
            "fifties" INT DEFAULT 0,
            "hundreds" INT DEFAULT 0,
            "average" FLOAT DEFAULT 0,
            "strikeRate" FLOAT DEFAULT 0,
            PRIMARY KEY ("tournamentId", "playerId")
        );
    `;
    try {
        await pool.query(query);
        console.log('"tournamentPlayerBattingStats" table is ready.');
    } catch (err) {
        console.error('Error creating "tournamentPlayerBattingStats" table:', err);
    }
};

// Insert or Update Player Batting Stats in Tournament
const updateTournamentPlayerBattingStats = async (tournamentId, playerId, updates) => {
    const fields = Object.keys(updates); // Extract field names
    const values = Object.values(updates); // Extract corresponding values

    if (fields.length === 0) return; // If no updates, exit

    // Prepare column names and placeholders for INSERT
    const columns = fields.map(field => `"${field}"`).join(', ');
    const placeholders = fields.map((_, index) => `$${index + 3}`).join(', ');

    // Prepare the UPDATE clause for ON CONFLICT
    const updateClause = fields.map(field => `"${field}" = EXCLUDED."${field}"`).join(', ');

    // SQL Query
    const query = `
        INSERT INTO "tournamentPlayerBattingStats" ("tournamentId", "playerId", ${columns})
        VALUES ($1, $2, ${placeholders})
        ON CONFLICT ("tournamentId", "playerId") 
        DO UPDATE SET ${updateClause}
        RETURNING *;
    `;

    try {
        // Execute query with provided values
        const result = await pool.query(query, [tournamentId, playerId, ...values]);
        console.log('Updated/Inserted "tournamentPlayerBattingStats":', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error in "updateTournamentPlayerBattingStats":', err);
        throw err;
    }
};

// Export functions
export { 
    createTournamentPlayerBattingStatsTable,  
    updateTournamentPlayerBattingStats 
};
