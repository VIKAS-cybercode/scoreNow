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
            "boundaryType" VARCHAR(10) CHECK ("boundaryType" IN ('Four', 'Six')) DEFAULT NULL,
            "fielderId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "extraRun" INT DEFAULT 0 CHECK ("extraRun" >= 0),
            "extraType" VARCHAR(20) CHECK ("extraType" IN ('Wide', 'No Ball', 'Bye', 'Leg Bye', 'Penalty')) DEFAULT NULL,
            "shotDirection" VARCHAR(50),
            "isStrikeRotated" BOOLEAN DEFAULT FALSE,
            "ballTimestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log('"ballEvent" table is ready.');
    } catch (err) {
        console.error("Error creating ballEvent table:", err);
    }
};

// Insert Ball Event
const insertBallEvent = async (ballEventData) => {
    const fields = Object.keys(ballEventData).map(field => `"${field}"`);  
    const values = Object.values(ballEventData);

    if (fields.length === 0) throw new Error("No data provided");

    const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
        INSERT INTO "ballEvent" (${fields.join(", ")})
        VALUES (${placeholders})
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, values);
        console.log("Ball event added:", result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error("Error inserting ball event:", err);
        throw err;
    }
};

// Update Ball Event
const updateBallEvent = async (uniqueId, updates) => {
    const fields = Object.keys(updates).map(field => `"${field}"`);
    const values = Object.values(updates);

    if (fields.length === 0) return;

    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    values.push(uniqueId);

    const query = `
        UPDATE "ballEvent" 
        SET ${setClause} 
        WHERE "uniqueId" = $${values.length} 
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, values);
        console.log("Ball event updated:", result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error("Error updating ball event:", err);
        throw err;
    }
};

export { createBallEvent, insertBallEvent, updateBallEvent };
