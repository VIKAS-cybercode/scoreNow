import pool from './db.js'

// Create tournamentPlayerFieldingStats Table
const createTournamentPlayerFieldingStatsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "tournamentPlayerFieldingStats" (
            "tournamentId" INT REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE,
            "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "runOuts" INT DEFAULT 0,
            "catches" INT DEFAULT 0,
            "stumpings" INT DEFAULT 0,
            PRIMARY KEY ("tournamentId", "playerId")
        );
    `;
    try {
        await pool.query(query);
        console.log('"tournamentPlayerFieldingStats" table is ready.');
    } catch (err) {
        console.error('Error creating "tournamentPlayerFieldingStats" table:', err);
    }
};

const updateTournamentPlayerFieldingStats = async (tournamentId, playerId, updates) => {
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
        INSERT INTO "tournamentPlayerFieldingStats" ("tournamentId", "playerId", ${columns})
        VALUES ($1, $2, ${placeholders})
        ON CONFLICT ("tournamentId", "playerId") 
        DO UPDATE SET ${updateClause}
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [tournamentId, playerId, ...values]);
        console.log('Upserted "tournamentPlayerFieldingStats":', result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error('Error upserting "tournamentPlayerFieldingStats":', err);
        throw err;
    }
};

export {createTournamentPlayerFieldingStatsTable,updateTournamentPlayerFieldingStats}