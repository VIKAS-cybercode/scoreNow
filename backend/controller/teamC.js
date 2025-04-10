import pool from '../models/db.js';

// Enter captain ID
const insertTeam = async (req, res) => {
    const { name, location, profilePicture } = req.body;

    const query = `
        INSERT INTO "teams" (
            "name", "location", "profilePicture"
        ) VALUES (
            $1, $2, $3
        ) RETURNING *;
    `;

    const values = [name, location, profilePicture];

    try {
        const result = await pool.query(query, values);
        console.log("Team inserted:", result.rows[0]);
        res.status(201).json({ success: true, team: result.rows[0] });
    } catch (err) {
        console.error("Error inserting team:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getTeamById = async (req, res) => {
    const { teamId } = req.params; 

    try {
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

        res.status(200).json(response);
        
    } catch (err) {
        console.error("Error retrieving team:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getAllTeams = async (req, res) => {
    try {
        const query = `SELECT * FROM "teams" ORDER BY "name" ASC;`; // Sorting by name (optional)
        const result = await pool.query(query);
        //console.log(result);
        res.status(200).json({ success: true, teams: result.rows });
    } catch (err) {
        console.error("Error fetching teams:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};


export { insertTeam, getTeamById,getAllTeams };
