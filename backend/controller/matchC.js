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

export const matchColumns = `
    m."matchId", m."tournamentId", m."team1Id", m."team2Id",
    m."matchType", m."oversPerSide", m."city", m."ground", m."startDate",
    m."status", m."organiserId", m."scorerId",
    m."winnerTeamId", wt.name AS "winnerTeamName", m."winnerType",
    m."tossWinner", tw.name AS "tossWinnerName", m."tossSelection",
    m."firstInningScore", m."firstInningWicket", m."firstInningOver",
    m."secondInningScore", m."secondInningWicket", m."secondInningOver",
    m."firstInningExtras", m."firstInningWides", m."firstInningNoBalls",
    m."secondInningExtras", m."secondInningWides", m."secondInningNoBalls",
    t1.name AS "team1Name", t2.name AS "team2Name",
    o.name AS "organizerName", s.name AS "scorerName",
    t.name AS "tournamentName",
    COUNT(*) OVER() AS "totalCount"
`;

export const baseFrom = `
    FROM matches m
    LEFT JOIN teams t1 ON m."team1Id" = t1."teamId"
    LEFT JOIN teams t2 ON m."team2Id" = t2."teamId"
    LEFT JOIN players o ON m."organiserId" = o."playerId"
    LEFT JOIN players s ON m."scorerId" = s."playerId"
    LEFT JOIN tournaments t ON m."tournamentId" = t."tournamentId"
    LEFT JOIN teams wt ON m."winnerTeamId" = wt."teamId"
    LEFT JOIN teams tw ON m."tossWinner" = tw."teamId"
`;

const executeMatchQuery = async (query, params) => {
    try {
        const result = await pool.query(query, params);
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
            city: row.city,
            ground: row.ground,
            startDate: row.startDate,
            status: row.status,
            organizer: row.organiserId ? {
                id: row.organiserId,
                name: row.organizerName
            } : null,
            scorer: row.scorerId ? {
                id: row.scorerId,
                name: row.scorerName
            } : null,
            winnerTeam: row.winnerTeamId ? {
                id: row.winnerTeamId,
                name: row.winnerTeamName
            } : null,
            winnerType: row.winnerType,
            tossWinner: row.tossWinner ? {
                id: row.tossWinner,
                name: row.tossWinnerName
            } : null,
            tossSelection: row.tossSelection,
            firstInning: {
                score: row.firstInningScore,
                wickets: row.firstInningWicket,
                overs: row.firstInningOver,
                extras: row.firstInningExtras,
                wides: row.firstInningWides,
                noBalls: row.firstInningNoBall
            },
            secondInning: {
                score: row.secondInningScore,
                wickets: row.secondInningWicket,
                overs: row.secondInningOver,
                extras: row.secondInningExtras,
                wides: row.secondInningWides,
                noBalls: row.secondInningNoBall
            }
        }));
        console.log(matches)
        return {
            total: result.rows[0]?.totalCount || 0,
            count: result.rowCount,
            matches
        };
    } catch (err) {
        throw err;
    }
};



const getAllMatches = async (req, res) => {
    try {
        console.log("allmatches")
        const { location, status } = req.query;

        let query = `
            SELECT ${matchColumns}
            ${baseFrom}
            WHERE 1=1
        `;

        const params = [];

        if (location) {
            params.push(location);
            query += ` AND m.city = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND m.status = $${params.length}`;
        }

        const result = await executeMatchQuery(query, params);
        res.status(200).json(result);
    } catch (err) {
        console.error("Error retrieving all matches:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// const getAllMatches = async (req, res) => {
//     try {
//         console.log("allmatch");
//         const { location, status } = req.query;

//         let query = `
//         SELECT 
//             m."matchId", m."tournamentId", m."team1Id", m."team2Id",
//             m."matchType", m."oversPerSide", m."city", m."ground", m."startDate",
//             m."status", m."organiserId", m."scorerId",
//             m."winnerTeamId", wt.name AS "winnerTeamName", m."winnerType",
//             m."tossWinner", tw.name AS "tossWinnerName", m."tossSelection",
//             m."firstInningScore", m."firstInningWicket", m."firstInningOver",
//             m."secondInningScore", m."secondInningWicket", m."secondInningOver",
//             m."firstInningExtras", m."firstInningWides", m."firstInningNoBall",
//             m."secondInningExtras", m."secondInningWides", m."secondInningNoBall",
//             t1.name AS "team1Name", t2.name AS "team2Name",
//             o.name AS "organizerName", s.name AS "scorerName",
//             t.name AS "tournamentName",
//             COUNT(*) OVER() AS "totalCount"
//         FROM matches m
//         LEFT JOIN teams t1 ON m."team1Id" = t1."teamId"
//         LEFT JOIN teams t2 ON m."team2Id" = t2."teamId"
//         LEFT JOIN players o ON m."organiserId" = o."playerId"
//         LEFT JOIN players s ON m."scorerId" = s."playerId"
//         LEFT JOIN tournaments t ON m."tournamentId" = t."tournamentId"
//         LEFT JOIN teams wt ON m."winnerTeamId" = wt."teamId"
//         LEFT JOIN teams tw ON m."tossWinner" = tw."teamId"
//         WHERE 1=1
//         `;

//         const values = [];

//         if (location) {
//             values.push(location);
//             query += ` AND m.city = $${values.length}`; // assuming location maps to 'city'
//         }

//         if (status) {
//             values.push(status);
//             query += ` AND m.status = $${values.length}`;
//         }

//         const result = await pool.query(query, values);

//         const matches = result.rows.map(row => ({
//             id: row.matchId,
//             tournament: row.tournamentId ? {
//                 id: row.tournamentId,
//                 name: row.tournamentName
//             } : null,
//             team1: { id: row.team1Id, name: row.team1Name },
//             team2: { id: row.team2Id, name: row.team2Name },
//             matchType: row.matchType,
//             oversPerSide: row.oversPerSide,
//             city: row.city,
//             ground: row.ground,
//             startDate: row.startDate,
//             status: row.status,
//             organizer: row.organiserId ? {
//                 id: row.organiserId,
//                 name: row.organizerName
//             } : null,
//             scorer: row.scorerId ? {
//                 id: row.scorerId,
//                 name: row.scorerName
//             } : null,
//             winnerTeam: row.winnerTeamId ? {
//                 id: row.winnerTeamId,
//                 name: row.winnerTeamName
//             } : null,
//             winnerType: row.winnerType,
//             tossWinner: row.tossWinner ? {
//                 id: row.tossWinner,
//                 name: row.tossWinnerName
//             } : null,
//             tossSelection: row.tossSelection,
//             firstInning: {
//                 score: row.firstInningScore,
//                 wickets: row.firstInningWicket,
//                 overs: row.firstInningOver,
//                 extras: row.firstInningExtras,
//                 wides: row.firstInningWides,
//                 noBall: row.firstInningNoBall
//             },
//             secondInning: {
//                 score: row.secondInningScore,
//                 wickets: row.secondInningWicket,
//                 overs: row.secondInningOver,
//                 extras: row.secondInningExtras,
//                 wides: row.secondInningWides,
//                 noBall: row.secondInningNoBall
//             }
//         }));
//         console.log(matches)
//         res.status(200).json({
//             total: result.rows[0]?.totalCount || 0,
//             count: result.rowCount,
//             matches
//         });

//     } catch (err) {
//         console.error("Error retrieving matches:", err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

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

// This function only fetches data from the database.
const fetchMatchById = async (matchId) => {
  // Get base match details
  const matchQuery = `SELECT * FROM "matches" WHERE "matchId" = $1;`;
  const matchResult = await pool.query(matchQuery, [matchId]);

  if (matchResult.rows.length === 0) {
    throw new Error("Match not found");
  }

  const match = matchResult.rows[0];
  const { team1Id, team2Id } = match;

  // Get all related data in parallel with player names and team names
  const [battingStats, bowlingStats, team1Data, team2Data] = await Promise.all([
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

  // Helper function to filter stats by inning
  const processStats = (stats, inning) =>
    stats.rows.filter(row => row.inningNumber === inning);

  const response = {
    ...match,
    teams: {
      team1: {
        teamId: team1Id,
        name: team1Data.rows[0]?.teamName || 'Team 1',
        players: team1Data.rows.map(p => ({
          playerId: p.playerId,
          name: p.name,
          profilePicture: p.profilePicture
        }))
      },
      team2: {
        teamId: team2Id,
        name: team2Data.rows[0]?.teamName || 'Team 2',
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

  return response;
};

// Express HTTP handler version
const getMatchById = async (req, res) => {
  const { matchId } = req.params;
  try {
    const matchData = await fetchMatchById(matchId);
    res.status(200).json(matchData);
  } catch (err) {
    console.error("Error retrieving match details:", err);
    if (err.message === "Match not found") {
      res.status(404).json({ error: "Match not found" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

// Socket version
const getMatchDataForBroadcast = async (matchId) => {
  try {
    const data = await fetchMatchById(matchId);
    // Remove team data from response if necessary
    delete data.teams.team1;
    delete data.teams.team2;
    return data;
  } catch (err) {
    console.error("Error retrieving match details for broadcast:", err);
    return { error: err.message };
  }
};

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


const updateMatchTossAndPlayers = async (req, res) => {
  const { matchId } = req.params;  
  const { tossWinner, tossSelection, status, squads } = req.body;  

  const client = await pool.connect();

  try {
    await client.query('BEGIN');  

    //Update the matches table
    const updateMatchQuery = `
      UPDATE "matches"
      SET "tossWinner" = $1, "tossSelection" = $2, "status" = $3
      WHERE "matchId" = $4;
    `;
    await client.query(updateMatchQuery, [tossWinner, tossSelection, status, matchId]);

    // Update the matchRPlayer table for the selected players (mark them as playing)
    let values = [];

    for (const [teamId, playerIds] of Object.entries(squads)) {
      playerIds.forEach(playerId => {
        values.push(`(${matchId}, ${playerId}, ${teamId}, true)`);  
      });
    }

    const updatePlayersQuery = `
      INSERT INTO "matchRPlayer" ("matchId", "playerId", "teamId", "isPlaying")
      VALUES
        ${values.join(', ')}
      ON CONFLICT ("matchId", "playerId", "teamId") DO UPDATE
      SET "isPlaying" = EXCLUDED."isPlaying";
    `;

    await client.query(updatePlayersQuery);

    await client.query('COMMIT'); 
    res.status(200).json({ message: 'Toss result and players updated successfully' });
  } catch (error) {
    await client.query('ROLLBACK');  
    console.error('Error updating toss and players:', error);
    res.status(500).json({ error: 'Failed to update toss and players' });
  } finally {
    client.release();  
  }
};


const getMatchPlayingSquad = async (req, res) => {
  const { matchId } = req.params;

  try {
    // Query 1: Get playing 11
    const playersQuery = `
      SELECT 
          mrp."teamId", 
          p."playerId", 
          p."name" AS "playerName",  
          p."profilePicture", 
          t."name" AS "teamName"
      FROM "matchRPlayer" mrp
      JOIN "players" p ON mrp."playerId" = p."playerId"
      JOIN "teams" t ON mrp."teamId" = t."teamId"
      WHERE mrp."matchId" = $1 AND mrp."isPlaying" = true
      ORDER BY mrp."teamId";
    `;
    const playerResult = await pool.query(playersQuery, [matchId]);

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: "No playing 11 found for this match." });
    }

    let teams = {};
    playerResult.rows.forEach(player => {
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
        profilePicture: player.profilePicture
      });
    });

    const teamArray = Object.values(teams);

    // Query 2: Get tossWinner and tossSelection
    const tossQuery = `
      SELECT "tossWinner", "tossSelection"
      FROM "matches"
      WHERE "matchId" = $1
    `;
    const tossResult = await pool.query(tossQuery, [matchId]);

    if (tossResult.rows.length === 0) {
      return res.status(404).json({ error: "Match not found." });
    }

    const { tossWinner, tossSelection } = tossResult.rows[0];

    // Final response
    res.status(200).json({
      team1: teamArray[0] || {},
      team2: teamArray[1] || {},
      tossWinner,
      tossSelection
    });

  } catch (err) {
    console.error("Error fetching playing 11:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export {insertMatch,updateMatch,getMatchById,getAllMatches,getMatchPlayingSquad,updateMatchTossAndPlayers,
    getMatchDataForBroadcast,executeMatchQuery}



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