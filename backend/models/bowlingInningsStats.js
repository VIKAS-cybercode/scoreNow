import pool from './db.js';

// Create BowlingInningsPlayerStats Table
const createBowlingInningsPlayerStats = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "bowlingInningsPlayerStats" (
            "matchId" INT REFERENCES "matches"("matchId") ON DELETE CASCADE NOT NULL,
            "inningNumber" INT CHECK ("inningNumber" IN (1, 2)) NOT NULL,
            "bowlerId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "bowlingPosition" INT CHECK ("bowlingPosition" > 0),
            "overs" DECIMAL(4, 2) DEFAULT 0 CHECK ("overs" >= 0),
            "runsGiven" INT DEFAULT 0 CHECK ("runsGiven" >= 0),
            "wickets" INT DEFAULT 0 CHECK ("wickets" >= 0),
            "maidenOvers" INT DEFAULT 0 CHECK ("maidenOvers" >= 0),
            "noBall" INT DEFAULT 0 CHECK ("noBall" >= 0),
            "wideBall" INT DEFAULT 0 CHECK ("wideBall" >= 0),
            PRIMARY KEY ("matchId", "inningNumber", "bowlerId")
        );
    `;

    try {
        await pool.query(query);
        console.log("BowlingInningsPlayerStats table is ready.");
    } catch (err) {
        console.error("Error creating BowlingInningsPlayerStats table:", err);
    }
};

const insertBowlingInningsStats = async ({ matchId, bowlerId, inningNumber, bowlingPosition }) => {
    const query = `
        INSERT INTO "bowlingInningsPlayerStats" (
            "matchId", 
            "bowlerId", 
            "inningNumber", 
            "bowlingPosition"
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("matchId", "bowlerId", "inningNumber")
        DO UPDATE SET "bowlingPosition" = EXCLUDED."bowlingPosition"
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [matchId, bowlerId, inningNumber, bowlingPosition]);
        return result.rows[0];
    } catch (err) {
        console.error("Error in insertBowlingInningsStats:", err);
        throw err;
    }
};



// const getBowlingInningsStats = async (matchId, inningNumber) => {
//     const query = `
//         SELECT "bowlerId", "teamId", "bowlingPosition", "overs", "runsGiven", "wickets", "maidenOvers", "noBall", "wideBall"
//         FROM "BowlingInningsPlayerStats"
//         WHERE "matchId" = $1 AND "inningNumber" = $2
//         ORDER BY "bowlingPosition" ASC;
//     `;

//     try {
//         const result = await pool.query(query, [matchId, inningNumber]);
//         return result.rows;
//     } catch (err) {
//         console.error("Error fetching bowling stats:", err);
//         return [];
//     }
// };

export { createBowlingInningsPlayerStats, insertBowlingInningsStats };
