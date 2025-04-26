import pool from './db.js';

// Create teamRPlayer Table
const createTeamRPlayerTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "teamRPlayer" (
            "teamId" INT REFERENCES "teams"("teamId") ON DELETE CASCADE,
            "playerId" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
            PRIMARY KEY ("teamId", "playerId")
        );
    `;
    try {
        await pool.query(query);
        console.log("teamRPlayer table is ready.");
    } catch (err) {
        console.error("Error creating teamRPlayer table:", err);
    }
};

// Insert a new record into teamRPlayer
const insertTeamRPlayer = async (teamId, joinKey, playerId) => {
    try {
        if (!joinKey) {
            throw new Error("Join key is required");
        }
        const checkQuery = `
            SELECT "joinKey" FROM "teams" WHERE "teamId" = $1;
        `;
        const checkResult = await pool.query(checkQuery, [teamId]);

        if (checkResult.rows.length === 0) {
            throw new Error("Team not found");
        }

        const actualJoinKey = checkResult.rows[0].joinKey;
        if (!actualJoinKey) {
            throw new Error("Team join key is missing");
        }
        if (actualJoinKey.toLowerCase() !== joinKey.toLowerCase()) {  
            throw new Error("Invalid join key");
        }

        // Step 2: Insert the player into teamRPlayer
        const insertQuery = `
            INSERT INTO "teamRPlayer" ("teamId", "playerId")
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await pool.query(insertQuery, [teamId, playerId]);
        console.log("Inserted into teamRPlayer:", result.rows[0]);

        return result.rows[0]; 
    } catch (err) {
        console.error("Error inserting into teamRPlayer:", err.message);
        throw err;  
    }
};
const joinTeam = async (req, res) => {
    const { teamId, joinKey, playerId } = req.body;

    try {
        // Call insertTeamRPlayer and handle the result
        const result = await insertTeamRPlayer(teamId, joinKey, playerId);
        res.status(201).json({ success: true, data: result });  // Successfully joined
    } catch (err) {
        // Catch the error thrown by insertTeamRPlayer
        if (err.message === "Invalid join key") {
            res.status(400).json({ success: false, message: "Invalid join key" });  // Send a 400 error if join key is invalid
        } else {
            res.status(500).json({ success: false, message: "Something went wrong" });  // Generic error handling
        }
    }
};



export { 
    createTeamRPlayerTable, 
    joinTeam
};