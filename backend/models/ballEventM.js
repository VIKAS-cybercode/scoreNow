import pool from './db.js';

// Create BallEvent Table
const createBallEvent = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "ballEvent" (
            "uniqueId" SERIAL PRIMARY KEY,
            "matchId" INT REFERENCES "matches"("matchId") ON DELETE CASCADE NOT NULL,
            "inningNumber" INT CHECK ("inningNumber" IN (1, 2)) NOT NULL,
            "overNumber" INT CHECK ("overNumber" >= 0) NOT NULL,
            "ballNumber" INT CHECK ("ballNumber" BETWEEN 1 AND 6) NOT NULL,
            "strikerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE NOT NULL,
            "nonStrikerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE NOT NULL,
            "bowlerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE NOT NULL,
            "runScored" INT DEFAULT 0 CHECK ("runScored" BETWEEN 0 AND 9),
            "isWicket" BOOLEAN DEFAULT FALSE,
            "wicketType" VARCHAR(50) CHECK ("wicketType" IN 
                ('Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Handled the Ball', 'Obstructing the Field')) DEFAULT NULL,
            "outBatsmanId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "boundaryType" VARCHAR(10) DEFAULT NULL,
            "fielderId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "extraRun" INT DEFAULT 0 CHECK ("extraRun" >= 0),
            "extraType" VARCHAR(20) CHECK ("extraType" IN ('Wide', 'No Ball', 'Bye', 'Leg Bye', 'Penalty')) DEFAULT NULL,
            "shotDirection" VARCHAR(50),
            "isStrikeRotated" BOOLEAN DEFAULT FALSE,
            "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('"ballEvent" table is ready.');
    } catch (err) {
        console.error("Error creating ballEvent table:", err);
    }
};

const deleteTable = async () => {
    const client = await pool.connect();
    try {
        await client.query(`DROP TABLE IF EXISTS "ballEvent" CASCADE;`);
        console.log(`Table "ballEvent" deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting table "ballEvent":`, error);
    } finally {
        client.release();
    }
};

export { createBallEvent,deleteTable };
