import pool from './db.js';

const createMatchesTable = async () => {
    const query = `
      CREATE TABLE IF NOT EXISTS "matches" (
        "matchId" SERIAL PRIMARY KEY,
        "tournamentId" INT REFERENCES "tournaments"("tournamentId") ON DELETE CASCADE,
        "team1Id" INT REFERENCES "teams"("teamId") ON DELETE CASCADE NOT NULL,
        "team2Id" INT REFERENCES "teams"("teamId") ON DELETE CASCADE NOT NULL,
        "matchType" VARCHAR(50),
        "oversPerSide" INT DEFAULT 0,
        "oversPerBowler" INT DEFAULT 0,
        "city" VARCHAR(50),
        "ground" VARCHAR(50),
        "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "ballType" VARCHAR(50) CHECK ("ballType" IN ('leather', 'other', 'tennis')),
        "status" VARCHAR(50) CHECK ("status" IN ('scheduled', 'live', 'completed', 'abandoned')),
        "organiserId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
        "scorerId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
        "winnerTeamId" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
        "winnerType" VARCHAR(50) DEFAULT NULL,
        "tossWinner" INT REFERENCES "teams"("teamId") ON DELETE SET NULL,
        "tossSelection" VARCHAR(50),
        "playerOfMatch" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
        "firstInningScore" INT DEFAULT 0,
        "firstInningWicket" INT DEFAULT 0,
        "firstInningOver" FLOAT DEFAULT 0,
        "secondInningScore" INT DEFAULT 0,
        "secondInningWicket" INT DEFAULT 0,
        "secondInningOver" FLOAT DEFAULT 0,
        "firstInningExtras" INT DEFAULT 0,
        "firstInningWides" INT DEFAULT 0,
        "firstInningNoBalls" INT DEFAULT 0,
        "secondInningExtras" INT DEFAULT 0,
        "secondInningWides" INT DEFAULT 0,
        "secondInningNoBalls" INT DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    try {
      await pool.query(query);
      console.log("matches table is ready");
    } catch (err) {
      console.error("Error creating new 'matches' table:", err);
    }
  };
  
const deleteMatchesTable = async () => {
    const client = await pool.connect();
    try {
        await client.query(`DROP TABLE IF EXISTS "matches" CASCADE;`);
        console.log(`Table "matches" deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting table "matches":`, error);
    } finally {
        client.release();
    }
};

// createMatchesTable();

export { createMatchesTable,deleteMatchesTable };