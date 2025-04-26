import pool from './db.js';

// Create tournamentGroupTeam Table
const createTournamentGroupTeamTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS tournamentGroupTeam (
            tournamentId INT REFERENCES tournaments(tournamentId) ON DELETE CASCADE,
            groupName VARCHAR(50) NOT NULL,
            teamId INT REFERENCES teams(teamId) ON DELETE CASCADE,
            stageName VARCHAR(50) NOT NULL,
            matches INT DEFAULT 0,
            wins INT DEFAULT 0,
            losses INT DEFAULT 0,
            points INT DEFAULT 0,
            NRR FLOAT DEFAULT 0,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (tournamentId, groupName, teamId, stageName)
        );
    `;
    try {
        await pool.query(query);
        console.log("tournamentGroupTeam table is ready.");
    } catch (err) {
        console.error("Error creating tournamentGroupTeam table:", err);
    }
};

const updateTournamentGroupTeam = async (tournamentId, groupName, teamId, stageName, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    // Prepare column names and placeholders for INSERT
    const columns = fields.join(', ');
    const placeholders = fields.map((_, index) => `$${index + 5}`).join(', ');

    // Prepare the UPDATE clause for ON CONFLICT
    const updateClause = fields.map((field) => `${field} = EXCLUDED.${field}`).join(', ');

    // SQL Query
    const query = `
        INSERT INTO tournamentGroupTeam (tournamentId, groupName, teamId, stageName, ${columns})
        VALUES ($1, $2, $3, $4, ${placeholders})
        ON CONFLICT (tournamentId, groupName, teamId, stageName) 
        DO UPDATE SET ${updateClause}
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [tournamentId, groupName, teamId, stageName, ...values]);
        console.log("Upserted tournamentGroupTeam:", result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error("Error upserting tournamentGroupTeam:", err);
        throw err;
    }
};


// Export functions
export { 
    createTournamentGroupTeamTable, 
    updateTournamentGroupTeam 
};