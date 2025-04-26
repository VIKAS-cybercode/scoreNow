import pool from './db.js';

// Create tournamentPlayerBowlingStats Table
const createTournamentPlayerBowlingStatsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "tournamentPlayerBowlingStats" (
            "tournamentId" INT REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE,
            "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "innings" INT DEFAULT 0,
            "wickets" INT DEFAULT 0,
            "maidenOvers" INT DEFAULT 0,
            "economy" FLOAT DEFAULT 0,
            "average" FLOAT DEFAULT 0,
            "strikeRate" FLOAT DEFAULT 0,
            "maxWickets" INT DEFAULT 0,
            PRIMARY KEY ("tournamentId", "playerId")
        );
    `;
    try {
        await pool.query(query);
        console.log('"tournamentPlayerBowlingStats" table is ready.');
    } catch (err) {
        console.error('Error creating "tournamentPlayerBowlingStats" table:', err);
    }
};

const updateTournamentPlayerBowlingStats = async (tournamentId, playerId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    // Prepare column names and placeholders for INSERT
    const columns = fields.map(field => `"${field}"`).join(', ');
    const placeholders = fields.map((_, index) => `$${index + 3}`).join(', ');

    // Prepare the UPDATE clause for ON CONFLICT
    const updateClause = fields.map(field => `"${field}" = EXCLUDED."${field}"`).join(', ');

    // SQL Query
    const query = `
        INSERT INTO "tournamentPlayerBowlingStats" ("tournamentId", "playerId", ${columns})
        VALUES ($1, $2, ${placeholders})
        ON CONFLICT ("tournamentId", "playerId") 
        DO UPDATE SET ${updateClause}
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [tournamentId, playerId, ...values]);
        console.log('Upserted "tournamentPlayerBowlingStats":', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error upserting "tournamentPlayerBowlingStats":', err);
        throw err;
    }
};


export { 
    createTournamentPlayerBowlingStatsTable, 
    updateTournamentPlayerBowlingStats 
};