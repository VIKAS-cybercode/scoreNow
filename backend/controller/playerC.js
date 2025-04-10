import pool from '../models/db.js';

// Function to insert a new player and initialize their stats
const insertPlayer = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const playerData = req.body;
        console.log(playerData);

        // Insert into "players" table
        const playerQuery = `
            INSERT INTO "players" ("auth0Id", "name", "gmail", "profilePicture", "location", "role")
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING "playerId";
        `;
        const playerValues = [
            playerData.auth0Id, playerData.name, playerData.gmail, 
            playerData.profilePicture, playerData.location, playerData.role
        ];
        const playerResult = await client.query(playerQuery, playerValues);
        const playerId = playerResult.rows[0].playerId; // ✅ Correct case

        // Insert into "battingStats" table
        await client.query(
            `INSERT INTO "battingStats" ("playerId", "battingStyle") VALUES ($1, $2);`,
            [playerId, playerData.battingStyle || null]
        );

        // Insert into "bowlingStats" table
        await client.query(
            `INSERT INTO "bowlingStats" ("playerId", "bowlingStyle") VALUES ($1, $2);`,
            [playerId, playerData.bowlingStyle || null]
        );

        // Insert into "fieldingStats" table
        await client.query(
            `INSERT INTO "fieldingStats" ("playerId") VALUES ($1);`,
            [playerId]
        );

        await client.query("COMMIT");

        console.log("Player inserted with ID:", playerId);
        res.status(201).json({ success: true, playerId });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Error inserting player:", err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release();
    }
};

// Function to update player stats dynamically
const updatePlayerStats = async (table, playerId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) return;

    const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
    values.push(playerId);

    const query = `UPDATE "${table}" SET ${setClause} WHERE "playerId" = $${values.length} RETURNING *;`;

    try {
        const result = await pool.query(query, values);
        console.log(`Updated ${table}:`, result.rows[0]);
        return result.rows[0];
    } catch (err) {
        console.error(`Error updating ${table}:`, err);
        throw err;
    }
};

// Retrieve player profile by Auth0 ID
const getPlayerProfile = async (req, res) => {
    const { auth0Id } = req.params;

    try {
        // Get base player details
        const playerQuery = `SELECT * FROM "players" WHERE "auth0Id" = $1`;
        const playerResult = await pool.query(playerQuery, [auth0Id]);

        if (playerResult.rows.length === 0) {
            return res.status(404).json({ error: "Player not found" });
        }

        const playerId = playerResult.rows[0].playerId;

        // Get all stats in parallel
        const [battingStats, bowlingStats, fieldingStats] = await Promise.all([
            pool.query('SELECT * FROM "battingStats" WHERE "playerId" = $1', [playerId]),
            pool.query('SELECT * FROM "bowlingStats" WHERE "playerId" = $1', [playerId]),
            pool.query('SELECT * FROM "fieldingStats" WHERE "playerId" = $1', [playerId])
        ]);

        // Construct response object
        const response = {
            ...playerResult.rows[0],
            batting: battingStats.rows,
            bowling: bowlingStats.rows,
            fielding: fieldingStats.rows
        };

        res.json(response);
        
    } catch (err) {
        console.error("Error retrieving player profile:", err);
        res.status(500).json({ error: "Database error" });
    }
};
const getPlayerProfileById = async (req, res) => {
    

    try {
        // Get base player details
        const { playerId } = req.params;
        const playerQuery = `SELECT * FROM "players" WHERE "playerId" = $1`;
        const playerResult = await pool.query(playerQuery, [playerId]);

        if (playerResult.rows.length === 0) {
            return res.status(404).json({ error: "Player not found" });
        }

        //const playerId = playerResult.rows[0].playerId;

        // Get all stats in parallel
        const [battingStats, bowlingStats, fieldingStats] = await Promise.all([
            pool.query('SELECT * FROM "battingStats" WHERE "playerId" = $1', [playerId]),
            pool.query('SELECT * FROM "bowlingStats" WHERE "playerId" = $1', [playerId]),
            pool.query('SELECT * FROM "fieldingStats" WHERE "playerId" = $1', [playerId])
        ]);

        // Construct response object
        const response = {
            ...playerResult.rows[0],
            batting: battingStats.rows,
            bowling: bowlingStats.rows,
            fielding: fieldingStats.rows
        };

        res.json(response);
        
    } catch (err) {
        console.error("Error retrieving player profile:", err);
        res.status(500).json({ error: "Database error" });
    }
  };
const getMyMatches = async (req, res) => {
    const { playerId } = req.params;
    console.log("mymatches");
    console.log(playerId);
    const query = `
        SELECT "matches".* 
        FROM "matches"
        INNER JOIN "matchRPlayer" 
        ON "matches"."matchId" = "matchRPlayer"."matchId"
        WHERE "matchRPlayer"."playerId" = $1;
    `;

    try {
        const result = await pool.query(query, [playerId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving matches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getMyTeams = async (req, res) => {
    const { playerId } = req.params;
    console.log("myteams");
    console.log(playerId);
    const query = `
        SELECT "teams".* 
        FROM "teams"
        INNER JOIN "teamRPlayer" 
        ON "teams"."teamId" = "teamRPlayer"."teamId"
        WHERE "teamRPlayer"."playerId" = $1;
    `;

    try {
        const result = await pool.query(query, [playerId]);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving teams:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getOrganisedMatches = async (req, res) => {
    const { playerId } = req.params;
    console.log("orgamatch");
    console.log(playerId);
    const query = `SELECT * FROM "matches" WHERE "organiserId" = $1 OR "scorerId" = $1;`;

    try {
        const result = await pool.query(query, [playerId]);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving matches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getMyTournaments = async (req, res) => {
    const { playerId } = req.params;
    console.log("mytourna");
    console.log(playerId);
    const query = `
        SELECT DISTINCT t.*
        FROM "tournaments" t
        JOIN "tournamentRTeam" trt ON t."tournamentId" = trt."tournamentId"
        JOIN "teamRPlayer" trp ON trt."teamId" = trp."teamId"
        WHERE trp."playerId" = $1;
    `;

    try {
        const result = await pool.query(query, [playerId]);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving tournaments:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getOrganisedTournaments = async (req, res) => {
    const { playerId } = req.params;
    console.log("myorgteams");
    console.log(playerId);
    const query = `SELECT * FROM "tournaments" WHERE "organiserId" = $1;`;

    try {
        const result = await pool.query(query, [playerId]);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving matches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export {
    insertPlayer,
    updatePlayerStats,
    getPlayerProfile,
    getPlayerProfileById,
    getMyMatches,
    getOrganisedMatches,
    getMyTeams,
    getMyTournaments,
    getOrganisedTournaments
};


//deleted getOrganisedMatchById
// similar to matches/matchId frontend have to tell 

// Function to update player stats dynamically
//parameter(tablename,playerId,updates object)