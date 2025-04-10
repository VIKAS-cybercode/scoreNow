import pool from './db.js';

const createMatchesTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "matches" (
            "matchId" SERIAL PRIMARY KEY,
            "tournamentId" INT REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE,
            "team1Id" INT REFERENCES "teams"("teamId") ON DELETE CASCADE NOT NULL,
            "team2Id" INT REFERENCES "teams"("teamId") ON DELETE CASCADE NOT NULL,
            "matchType" VARCHAR(50) CHECK ("matchType" IN ('limitedOvers', 'boxCricket', 'testMatch')) NOT NULL,
            "oversPerSide" INT DEFAULT 0,
            "oversPerBowler" INT DEFAULT 0,
            "city" VARCHAR(50),
            "ground" VARCHAR(50),
            "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "ballType" VARCHAR(50) CHECK ("ballType" IN ('leather', 'other', 'tennis')),
            "status" VARCHAR(50) CHECK ("status" IN ('scheduled', 'live', 'completed', 'abandoned')),
            "organiserId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "scorerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            "winnerTeamId" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
            "winnerType" VARCHAR(50) CHECK ("winnerType" IN ('Runs', 'Wickets', 'Draw', 'Tie')) DEFAULT NULL,
            "tossWinner" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
            "tossSelection" VARCHAR(50) CHECK ("tossSelection" IN ('bat', 'bowl')),
            "playerOfMatch" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "firstInningScore" INT DEFAULT 0,
            "firstInningWicket" INT DEFAULT 0,
            "firstInningOver" FLOAT DEFAULT 0,
            "secondInningScore" INT DEFAULT 0,
            "secondInningWicket" INT DEFAULT 0,
            "secondInningOver" FLOAT DEFAULT 0,
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log("Matches table is ready.");
    } catch (err) {
        console.error("Error creating matches table:", err);
    }
};

// createMatchesTable();

export { createMatchesTable };
