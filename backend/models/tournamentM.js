import pool from './db.js';

// Create Tournaments Table
const createTournamentsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "tournaments" (
            "tournamentId" SERIAL PRIMARY KEY,
            "profilePicture" VARCHAR(255) ,
            "name" VARCHAR(100) NOT NULL,
            "city" VARCHAR(100),
            "ground" VARCHAR(100),
            "organiserId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "organiserPhoneNumber" VARCHAR(15) CHECK ("organiserPhoneNumber" ~ '^[0-9]+$'),
            "startDate" TIMESTAMP NOT NULL,
            "endDate" TIMESTAMP NOT NULL,
            "tournamentCategory" VARCHAR(50) CHECK ("tournamentCategory" IN ('Open', 'Corporate', 'Community', 'School', 'Series')),
            "matchType" VARCHAR(50) CHECK ("matchType" IN ('T20', 'ODI', 'Test')),
            "ballType" VARCHAR(50) CHECK ("ballType" IN ('Leather', 'Tennis', 'Rubber')),
            "totalMatches" INT DEFAULT 0,
            "totalTeams" INT DEFAULT 0,
            "runs" INT DEFAULT 0,
            "wickets" INT DEFAULT 0,
            "balls" INT DEFAULT 0,
            "extras" INT DEFAULT 0,
            "fours" INT DEFAULT 0,
            "sixes" INT DEFAULT 0,
            "fifties" INT DEFAULT 0,
            "hundreds" INT DEFAULT 0,
            "maidenOvers" INT DEFAULT 0,
            "catches" INT DEFAULT 0,
            "stumpings" INT DEFAULT 0,
            "firstPositionTeam" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
            "secondPositionTeam" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
            "thirdPositionTeam" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
            "playerOfTheTournament" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log("Tournaments table is ready.");
    } catch (err) {
        console.error("Error creating tournaments table:", err);
    }
};

const updateTournament = async (tournamentId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    values.push(tournamentId);

    const query = `UPDATE "tournaments" SET ${setClause} WHERE "tournamentId" = $${values.length} RETURNING *;`;

    try {
        const result = await pool.query(query, values);
        console.log("Tournament updated:", result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error("Error updating tournament:", err);
        throw err;
    }
};

export { createTournamentsTable, updateTournament };
