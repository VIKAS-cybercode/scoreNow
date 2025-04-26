import pool from '../models/db.js';

const insertTournament = async (req, res) => {
    const {
        profilePicture, name, city, ground, organiserId, organiserPhoneNumber,
        startDate, endDate, tournamentCategory, matchType, ballType
    } = req.body;

    const query = `
        INSERT INTO "tournaments" (
            "profilePicture", "name", "city", "ground", "organiserId", "organiserPhoneNumber", 
            "startDate", "endDate", "tournamentCategory", "matchType", "ballType"
        ) VALUES (
            $1, $2, $3, $4, $5, $6, 
            $7, $8, $9, $10, $11
        ) RETURNING *;
    `;

    const values = [
        profilePicture, name, city, ground, organiserId, organiserPhoneNumber,
        startDate, endDate, tournamentCategory, matchType, ballType
    ];

    try {
        const result = await pool.query(query, values);
        console.log("Tournament inserted:", result.rows[0]);
        res.status(201).json({ success: true, tournament: result.rows[0] });
    } catch (err) {
        console.error("Error inserting tournament:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getAllTournaments = async (req, res) => {
    try {
        console.log("alltourna");
        const { location, status, ballType, category } = req.query;
        let query = "SELECT * FROM \"tournaments\" WHERE 1=1";
        let values = [];

        if (location) {
            query += ` AND "city" = $${values.length + 1}`;
            values.push(location);
        }

        if (status) {
            query += ` AND "status" = $${values.length + 1}`;
            values.push(status);
        }

        if (ballType) {
            query += ` AND "ballType" = $${values.length + 1}`;
            values.push(ballType);
        }

        if (category) {
            query += ` AND "tournamentCategory" = $${values.length + 1}`;
            values.push(category);
        }

        const result = await pool.query(query, values);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving tournaments:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getTournamentMatches = async (req, res) => {
    const { tournamentId } = req.params;
    const { status } = req.query; 
    console.log("tournamatch");
    try {
        let query = `
            SELECT 
                m.*, 
                t1."name" as "team1Name",
                t2."name" as "team2Name"
            FROM "matches" m
            JOIN "teams" t1 ON m."team1Id" = t1."teamId"
            JOIN "teams" t2 ON m."team2Id" = t2."teamId"
            WHERE m."tournamentId" = $1
        `;

        let values = [tournamentId];

        if (status) {
            query += ` AND m."status" = $2`;
            values.push(status);
        }

        query += ` ORDER BY m."startDate" DESC;`;

        const result = await pool.query(query, values);
        console.log(result.rows);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving tournament matches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getTournamentTeams = async (req, res) => {
    const { tournamentId } = req.params;
    console.log("tournateams");
    try {
        const query = `
            SELECT DISTINCT t."teamId", t."name" 
            FROM "teams" t
            WHERE t."teamId" IN (
                SELECT m."team1Id" FROM "matches" m WHERE m."tournamentId" = $1
                UNION
                SELECT m."team2Id" FROM "matches" m WHERE m."tournamentId" = $1
            )
            ORDER BY t."name";
        `;

        const result = await pool.query(query, [tournamentId]);
        console.log(result.rows);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error retrieving tournament teams:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getTournamentStats = async (req, res) => {
    const { tournamentId } = req.params; 
    console.log("tstats");

    try {
        const teamQuery = `
            SELECT * FROM "teams" WHERE "tournamentId" = $1`;
        
        const result = await pool.query(teamQuery, [tournamentId]);
        
        console.log(result.rows);


        res.status(200).json(result.rows[0]);
        
    } catch (err) {
        console.error("Error retrieving tournament stats:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export { insertTournament, getAllTournaments, getTournamentMatches, getTournamentTeams, getTournamentStats };