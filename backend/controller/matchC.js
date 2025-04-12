import pool from "../models/db.js";

// Insert a new match
const insertMatch = async (req, res) => {
    console.log("insertmatch");

    // Extracting values from request body
    let {
        tournamentId, team1Id, team2Id, matchType, oversPerSide, oversPerBowler, city, ground,
        startDate, ballType, status, organiserId, scorerId
    } = req.body;

    // ✅ Convert necessary fields to integers
    tournamentId = Number(tournamentId) || null;
    team1Id = Number(team1Id) || null;
    team2Id = Number(team2Id) || null;
    oversPerSide = Number(oversPerSide) || null;
    oversPerBowler = Number(oversPerBowler) || null;
    organiserId = Number(organiserId) || null;
    scorerId = Number(scorerId) || null;

    const query = `
        INSERT INTO "matches" (
            "tournamentId", "team1Id", "team2Id", "matchType", "oversPerSide", "oversPerBowler", "city", "ground",
            "startDate", "ballType", "status", "organiserId", "scorerId"
        ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
        ) RETURNING "matchId";
    `;

    const values = [
        tournamentId, team1Id, team2Id, matchType,
        oversPerSide, oversPerBowler, city, ground,
        startDate, ballType, status, organiserId, scorerId
    ];

    try {
        const result = await pool.query(query, values);
        console.log("Match inserted, ID:", result.rows[0].matchId);

        // Sending matchId
        res.status(201).json(result.rows[0].matchId);

    } catch (err) {
        console.error("Error inserting match:", err);
        res.status(500).json(null);
    }
};


const getAllMatches = async (req, res) => {
    try {
        console.log("allmatch")
        const { location, status} = req.query;
        
        let query = `
        SELECT 
        m.*,
        t1.name AS "team1Name",
        t2.name AS "team2Name",
        o.name AS "organizerName",
        s.name AS "scorerName",
        t.name AS "tournamentName",
        COUNT(*) OVER() AS "totalCount"
        FROM matches m
        LEFT JOIN teams t1 ON m."team1Id" = t1."teamId"
        LEFT JOIN teams t2 ON m."team2Id" = t2."teamId"
        LEFT JOIN players o ON m."organiserId" = o."playerId"
        LEFT JOIN players s ON m."scorerId" = s."playerId"
        LEFT JOIN tournaments t ON m."tournamentId" = t."tournamentId"
        WHERE 1=1
        `;
        
        const values = [];
        
        // Add location filter
        if (location) {
            values.push(location);
            query += ` AND m.location = $${values.length}`;
        }
        // Add status filter
        if (status) {
            values.push(status);
            query += ` AND m.status = $${values.length}`;
        }
        
        const result = await pool.query(query, values);
        
        // Format response
        const matches = result.rows.map(row => ({
            id: row.matchId,
            tournament: row.tournamentId ? { 
                id: row.tournamentId, 
                name: row.tournamentName 
            } : null,
            team1: { id: row.team1Id, name: row.team1Name },
            team2: { id: row.team2Id, name: row.team2Name },
            matchType: row.matchType,
            oversPerSide: row.oversPerSide,
            oversPerBowler: row.oversPerBowler,
            city: row.city,
            ground: row.ground,
            startDate: row.startDate,
            ballType: row.ballType,
            status: row.status,
            organizer: row.organiserId ? { 
                id: row.organiserId, 
                name: row.organizerName 
            } : null,
            scorer: row.scorerId ? { 
                id: row.scorerId, 
                name: row.scorerName 
            } : null,
            winnerTeamId: row.winnerTeamId,
            winnerType: row.winnerType,
            tossWinner: row.tossWinner,
            tossSelection: row.tossSelection,
            playerOfMatch: row.playerOfMatch,
            firstInning: {
                score: row.firstInningScore,
                wickets: row.firstInningWicket,
                overs: row.firstInningOver
            },
            secondInning: {
                score: row.secondInningScore,
                wickets: row.secondInningWicket,
                overs: row.secondInningOver
            },
            extras: row.extras,
            wides: row.wides,
            noBall: row.noBall,
            createdAt: row.createdAt
        }));
        
        console.log(matches)
        res.status(200).json({
            total: result.rows[0]?.totalCount || 0,
            count: result.rowCount,
            matches
        });

    } catch (err) {
        console.error("Error retrieving matches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// const getAllMatches = async (req, res) => {
//     try {
//         console.log("allmatch")
//         const { location, status } = req.query;
//         let query = "SELECT * FROM \"matches\" WHERE 1=1";
//         let values = [];

//         if (location) {
//             query += ` AND "location" = $${values.length + 1}`;
//             values.push(location);
//         }

//         if (status) {
//             query += ` AND "status" = $${values.length + 1}`;
//             values.push(status);
//         }

//         const result = await pool.query(query, values);
//         console.log(result.rows);
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error("Error retrieving matches:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const getMatchById = async (req, res) => {
    const { matchId } = req.params;

    try {
        console.log("match with id")
        // Get base match details
        const matchQuery = `SELECT * FROM "matches" WHERE "matchId" = $1;`;
        const matchResult = await pool.query(matchQuery, [matchId]);

        if (matchResult.rows.length === 0) {
            return res.status(404).json({ error: "Match not found" });
        }

        const match = matchResult.rows[0];
        const { team1Id, team2Id } = match;

        // Get all related data in parallel with player names and team names
        const [
            battingStats,
            bowlingStats,
            team1Data,
            team2Data
        ] = await Promise.all([
            // Batting stats with player names
            pool.query(`
                SELECT b.*, p."name" as "batsmanName"
                FROM "battingInningsPlayerStats" b
                JOIN "players" p ON b."batsmanId" = p."playerId"
                WHERE b."matchId" = $1
                ORDER BY b."inningNumber", b."battingPosition"
            `, [matchId]),
            
            // Bowling stats with player names
            pool.query(`
                SELECT bw.*, p."name" as "bowlerName"
                FROM "bowlingInningsPlayerStats" bw
                JOIN "players" p ON bw."bowlerId" = p."playerId"
                WHERE bw."matchId" = $1
                ORDER BY bw."inningNumber", bw."bowlingPosition"
            `, [matchId]),
            
            // Team 1 data with players and team name
            pool.query(`
                SELECT 
                    p."playerId", 
                    p."name", 
                    p."profilePicture",
                    t."name" as "teamName"
                FROM "teamRPlayer" trp
                JOIN "players" p ON trp."playerId" = p."playerId"
                JOIN "teams" t ON trp."teamId" = t."teamId"
                WHERE trp."teamId" = $1
            `, [team1Id]),
            
            // Team 2 data with players and team name
            pool.query(`
                SELECT 
                    p."playerId", 
                    p."name", 
                    p."profilePicture",
                    t."name" as "teamName"
                FROM "teamRPlayer" trp
                JOIN "players" p ON trp."playerId" = p."playerId"
                JOIN "teams" t ON trp."teamId" = t."teamId"
                WHERE trp."teamId" = $1
            `, [team2Id])
        ]);

        // Process into innings structure
        const processStats = (stats, inning) => 
            stats.rows.filter(row => row.inningnumber === inning);

        const response = {
            ...match,
            teams: {
                team1: {
                    teamId: team1Id,
                    name: team1Data.rows[0]?.teamName || 'Team 1', // Fallback name
                    players: team1Data.rows.map(p => ({
                        playerId: p.playerId,
                        name: p.name,
                        profilePicture: p.profilePicture
                    }))
                },
                team2: {
                    teamId: team2Id,
                    name: team2Data.rows[0]?.teamName || 'Team 2', // Fallback name
                    players: team2Data.rows.map(p => ({
                        playerId: p.playerId,
                        name: p.name,
                        profilePicture: p.profilePicture
                    }))
                }
            },
            inning1: {
                batting: processStats(battingStats, 1),
                bowling: processStats(bowlingStats, 1)
            },
            inning2: {
                batting: processStats(battingStats, 2),
                bowling: processStats(bowlingStats, 2)
            }
        };
        console.log(response)
        res.status(200).json(response);
    } catch (err) {
        console.error("Error retrieving match details:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// For socket broadcasts (modified version without team players)
const getMatchDataForBroadcast = async (matchId) => {
    const data = await getMatchById({ params: { matchId } }, { sendResponse: false });
    
    // Remove team from response
    delete data.teams.team1;
    delete data.teams.team2;
    
    return data;
};
// Retrieve match details by ID
// const getMatchById = async (req, res) => {
//     const { matchId } = req.params;
//     console.log(matchId);

//     try {
//         // Get base match details
//         const matchQuery = `SELECT * FROM "matches" WHERE "matchId" = $1;`;
//         const matchResult = await pool.query(matchQuery, [matchId]);

//         if (matchResult.rows.length === 0) {
//             return res.status(404).json({ error: "Match not found" });
//         }

//         const match = matchResult.rows[0];
//         const { team1Id, team2Id } = match;

//         // Get all related data in parallel
//         const [
//             battingStats,
//             bowlingStats,
//             team1Players,
//             team2Players
//         ] = await Promise.all([
//             // Batting stats
//             pool.query(`
//                 SELECT * FROM "BattingInningsPlayerStats" 
//                 WHERE "matchId" = $1
//                 ORDER BY "inningNumber", "battingPosition"
//             `, [matchId]),
            
//             // Bowling stats
//             pool.query(`
//                 SELECT * FROM "BowlingInningsPlayerStats" 
//                 WHERE "matchId" = $1
//                 ORDER BY "inningNumber", "bowlerPosition"
//             `, [matchId]),
            
//             // Team 1 players
//             pool.query(`
//                 SELECT p."playerId", p."name", p."profilePicture"
//                 FROM "teamRPlayer" trp
//                 JOIN "players" p ON trp."playerId" = p."playerId"
//                 WHERE trp."teamId" = $1
//             `, [team1Id]),
            
//             // Team 2 players
//             pool.query(`
//                 SELECT p."playerId", p."name", p."profilePicture"
//                 FROM "teamRPlayer" trp
//                 JOIN "players" p ON trp."playerId" = p."playerId"
//                 WHERE trp."teamId" = $1
//             `, [team2Id])
//         ]);

//         // Process into innings structure
//         const processStats = (stats, inning) => 
//             stats.rows.filter(row => row.inningnumber === inning);

//         const response = {
//             ...match,
//             teams: {
//                 team1: {
//                     teamId: team1Id,
//                     players: team1Players.rows
//                 },
//                 team2: {
//                     teamId: team2Id,
//                     players: team2Players.rows
//                 }
//             },
//             inning1: {
//                 batting: processStats(battingStats, 1),
//                 bowling: processStats(bowlingStats, 1)
//             },
//             inning2: {
//                 batting: processStats(battingStats, 2),
//                 bowling: processStats(bowlingStats, 2)
//             }
//         };
//         res.status(200).json(response);
//         console.log(response);
//     } catch (err) {
//         console.error("Error retrieving match details:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// Parameter(matchId,map{key:value})
const updateMatch = async (req, res) => {
    try {
        const { matchId } = req.params; 
        const updates = req.body; 

        const fields = Object.keys(updates);
        const values = Object.values(updates);

        if (fields.length === 0) {
            return res.status(400).json({ error: "No fields provided for update" });
        }

        const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(", ");
        values.push(matchId);

        const query = `UPDATE "matches" SET ${setClause} WHERE "matchId" = $${values.length} RETURNING *;`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Match not found" });
        }
        // Sending updated match details
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error updating match:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


const updateMatchPlayingSquad = async (req, res) => {
    const { matchId, team1Players, team2Players } = req.body;

    if (!matchId || !Array.isArray(team1Players) || !Array.isArray(team2Players)) {
        return res.status(400).json({ error: "Invalid request body" });
    }

    const allPlayers = [...team1Players, ...team2Players];

    try {
        // Reset all players in the match to false before updating
        await pool.query(
            `UPDATE "matchRPlayer" SET "isPlaying" = false WHERE "matchId" = $1`,
            [matchId]
        );

        // Set selected players as playing
        const query = `
            UPDATE "matchRPlayer"
            SET "isPlaying" = true
            WHERE "matchId" = $1 AND "playerId" = ANY($2);
        `;
        await pool.query(query, [matchId, allPlayers]);

        res.status(200).json({ message: "Playing XI updated successfully." });
    } catch (err) {
        console.error("Error updating playing XI:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getMatchPlayingSquad = async (req, res) => {
    const { matchId } = req.params;

    try {
        const query = `
            SELECT 
                mrp."teamId", 
                p."playerId", 
                p."playerName", 
                p."photo", 
                t."teamName"
            FROM "matchRPlayer" mrp
            JOIN "players" p ON mrp."playerId" = p."playerId"
            JOIN "teams" t ON mrp."teamId" = t."teamId"
            WHERE mrp."matchId" = $1 AND mrp."isPlaying" = true
            ORDER BY mrp."teamId";
        `;

        const result = await pool.query(query, [matchId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No playing 11 found for this match." });
        }

        let teams = {};

        result.rows.forEach(player => {
            if (!teams[player.teamId]) {
                teams[player.teamId] = {
                    teamId: player.teamId,
                    teamName: player.teamName,
                    players: []
                };
            }
            teams[player.teamId].players.push({
                playerId: player.playerId,
                playerName: player.playerName,
                photo: player.photo
            });
        });

        // Convert teams object to an array with team1 and team2
        const teamArray = Object.values(teams);
        
        res.status(200).json({
            team1: teamArray[0] || {},
            team2: teamArray[1] || {}
        });

    } catch (err) {
        console.error("Error fetching playing 11:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



export {insertMatch,updateMatch,getMatchById,getAllMatches,getMatchPlayingSquad,updateMatchPlayingSquad,getMatchDataForBroadcast}



//for update
// fetch("http://localhost:5000/api/matches/1", {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ status: "Completed", score: "200/5" }),
// })
// .then(res => res.json())
// .then(data => console.log("Updated Match:", data))
// .catch(err => console.error("Error:", err));

//  call on /selectSquard

// sending data of match
// {
//     "matchId": 123,
//     "team1id": 456,
//     "team2id": 789,
//     "teams": {
//       "team1": {
//         "teamId": 456,
//         "players": [
//           {"playerId": 1, "name": "Player A", "profilePicture": "url1"},
//           {"playerId": 2, "name": "Player B", "profilePicture": "url2"}
//         ]
//       },
//       "team2": {
//         "teamId": 789,
//         "players": [
//           {"playerId": 3, "name": "Player C", "profilePicture": "url3"}
//         ]
//       }
//     },
//     "inning1": {
//       "batting": [...],
//       "bowling": [...]
//     },
//     "inning2": {
//       "batting": [...],
//       "bowling": [...]
//     }
//   }
