import pool from '../models/db.js';

// Enter captain ID
const insertTeam = async (req, res) => {
    const { name, location, profilePicture, captainId, joinKey } = req.body; 

    const client = await pool.connect(); // Acquire a client for transaction
    try {
        await client.query('BEGIN'); // Start transaction

        // 1. Insert the team with joinKey
        const teamQuery = `
            INSERT INTO "teams" ("name", "location", "profilePicture", "captainId", "joinKey")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const teamResult = await client.query(teamQuery, [
            name, location, profilePicture, captainId, joinKey
        ]);
        const team = teamResult.rows[0];
        console.log("Team inserted:", team);

        // 2. Add captain to teamRPlayer using the same client
        await client.query(`
            INSERT INTO "teamRPlayer" ("teamId", "playerId")
            VALUES ($1, $2)
        `, [team.teamId, captainId]);

        await client.query('COMMIT'); // Commit transaction
        res.status(201).json({ success: true, team });
    } catch (err) {
        await client.query('ROLLBACK'); // Rollback on error
        console.error("Error in transaction:", err);
        res.status(500).json({ success: false, error: err.message });
    } finally {
        client.release(); 
    }
};


const getTeamById = async (req, res) => {
    const { teamId } = req.params; 

    try {
        console.log("getteambyid")
        const teamQuery = `
            SELECT * FROM "teams" WHERE "teamId" = $1`;
        
        const teamResult = await pool.query(teamQuery, [teamId]);
        
        if (teamResult.rows.length === 0) {
            return res.status(404).json({ error: "Team not found" });
        }

        // Get associated players
        const playersQuery = `
            SELECT p.* FROM "teamRPlayer" trp
            JOIN "players" p ON trp."playerId" = p."playerId"
            WHERE trp."teamId" = $1`;
        
        const playersResult = await pool.query(playersQuery, [teamId]);

        // Get team matches
        const matchesQuery = `
            SELECT * FROM "matches" 
            WHERE "team1Id" = $1 OR "team2Id" = $1
            ORDER BY "startDate" DESC`;
        
        const matchesResult = await pool.query(matchesQuery, [teamId]);

        // Single response
        const response = {
            ...teamResult.rows[0],
            players: playersResult.rows,
            matches: matchesResult.rows
        };
        console.log(response);

        res.status(200).json(response);
        
    } catch (err) {
        console.error("Error retrieving team:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getAllTeams = async (req, res) => {
    try {
        console.log("getallteams")
        const query = `SELECT * FROM "teams" ORDER BY "name" ASC;`; // Sorting by name (optional)
        const result = await pool.query(query);
        console.log(result.rows);
        res.status(200).json(result.rows );
        // console.log()
    } catch (err) {
        console.error("Error fetching teams:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


export { insertTeam, getTeamById,getAllTeams };