import pool from './db.js';

// Create "tournamentRTeam" Table
const createTournamentRTeamTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "tournamentRTeam" (
            "tournamentId" INT REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE,
            "teamId" INT REFERENCES "teams"("teamId") ON DELETE CASCADE,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY("tournamentId", "teamId")
        );
    `;
    try {
        await pool.query(query);
        console.log('"tournamentRTeam" table is ready.');
    } catch (err) {
        console.error('Error creating "tournamentRTeam" table:', err);
    }
};

// Insert team into tournament
const insertTournamentRTeam = async (tournamentId, teamId) => {
    const query = `
        INSERT INTO "tournamentRTeam" ("tournamentId", "teamId")
        VALUES ($1, $2)
        ON CONFLICT ("tournamentId", "teamId") DO NOTHING
        RETURNING *;
    `;
    try {
        const result = await pool.query(query, [tournamentId, teamId]);
        if (result.rows.length > 0) {
            console.log('Team added to tournament:', result.rows[0]);
        } else {
            console.log('Team is already in the tournament.');
        }
        return result.rows[0] || null;
    } catch (err) {
        console.error('Error inserting team into "tournamentRTeam":', err);
        throw err;
    }
};

export { createTournamentRTeamTable, insertTournamentRTeam };


// DBMS does not automatically prevent conflicts
// when inserting duplicate primary keys unless explicitly instructed.
