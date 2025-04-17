import pool from './db.js';

// Create BattingInningsPlayerStats Table
const createBattingInningsPlayerStats = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "battingInningsPlayerStats" (
            "matchId" INT REFERENCES "matches"("matchId") ON DELETE CASCADE NOT NULL,
            "inningNumber" INT CHECK ("inningNumber" IN (1, 2)) NOT NULL,
            "batsmanId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "battingPosition" INT CHECK ("battingPosition" > 0),
            "runs" INT DEFAULT 0 CHECK ("runs" >= 0),
            "ballsFaced" INT DEFAULT 0 CHECK ("ballsFaced" >= 0),
            "fours" INT DEFAULT 0 CHECK ("fours" >= 0),
            "sixes" INT DEFAULT 0 CHECK ("sixes" >= 0),
            "outStatus" VARCHAR(50) CHECK ("outStatus" IN ('Not Out', 'Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket', 'Retired Hurt')),
            "outBowlerId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            "outFielderId" INT REFERENCES "players"("playerId") ON DELETE SET NULL,
            PRIMARY KEY ("matchId", "inningNumber", "batsmanId")
        );
    `;

    try {
        await pool.query(query);
        console.log("BattingInningsPlayerStats table is ready.");
    } catch (err) {
        console.error("Error creating BattingInningsPlayerStats table:", err);
    }
};

const insertBattingInningsStats = async ({ matchId, batsmanId, inningNumber, battingPosition }) => {
    const query = `
        INSERT INTO "battingInningsPlayerStats" (
            "matchId", 
            "batsmanId", 
            "inningNumber", 
            "battingPosition"
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ("matchId", "batsmanId", "inningNumber")
        DO UPDATE SET "battingPosition" = EXCLUDED."battingPosition"
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [matchId, batsmanId, inningNumber, battingPosition]);
        return result.rows[0];
    } catch (err) {
        console.error("Error in insertBattingInningsStats:", err);
        throw err;
    }
};



// const getBattingInningsStats = async (matchId, inningNumber) => {
//     const query = `
//         SELECT "batsmanId", "teamId", "battingPosition", "runs", "ballsFaced", "fours", "sixes", "outStatus", "outBowlerId", "outFielderId"
//         FROM "BattingInningsPlayerStats"
//         WHERE "matchId" = $1 AND "inningNumber" = $2
//         ORDER BY "battingPosition" ASC;
//     `;

//     try {
//         const result = await pool.query(query, [matchId, inningNumber]);
//         return result.rows;
//     } catch (err) {
//         console.error("Error fetching batting stats:", err);
//         return [];
//     }
// };

export { createBattingInningsPlayerStats, insertBattingInningsStats };


// **Socket.IO Connection**
// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // **Listening for a ball event from the client**
//     socket.on("newBallEvent", async (ballEventData) => {
//         try {
//             const savedEvent = await insertBallEvent(ballEventData);
//             io.emit("ballEventUpdate", savedEvent); // Broadcast to all clients
//         } catch (err) {
//             socket.emit("error", "Error inserting ball event");
//         }
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
//     });
// });
// * Function to handle incoming socket data and update stats
//  */
// const handleBallEvent = async (ballData) => {
//     try {
//         // Update batting stats
//         await insertOrUpdateBattingStats({
//             matchId: ballData.matchId,
//             inningNumber: ballData.inningNumber,
//             batsmanId: ballData.strikerId,
//             teamId: ballData.battingTeamId,
//             battingPosition: ballData.battingPosition,
//             runs: ballData.runScored,
//             ballsFaced: 1,
//             fours: ballData.boundaryType === 'Four' ? 1 : 0,
//             sixes: ballData.boundaryType === 'Six' ? 1 : 0,
//             outStatus: ballData.isWicket ? ballData.wicketType : 'Not Out',
//             outBowlerId: ballData.isWicket ? ballData.bowlerId : null,
//             outFielderId: ballData.isWicket ? ballData.fielderId : null
//         });

//         // Update bowling stats
//         await insertOrUpdateBowlingStats({
//             matchId: ballData.matchId,
//             inningNumber: ballData.inningNumber,
//             bowlerId: ballData.bowlerId,
//             teamId: ballData.bowlingTeamId,
//             bowlingPosition: ballData.bowlingPosition,
//             overs: 0.1, // Each ball is 0.1 overs
//             runsGiven: ballData.runScored + (ballData.extraType ? ballData.extraRun : 0),
//             wickets: ballData.isWicket ? 1 : 0,
//             maidenOvers: 0, // Needs additional logic to check maiden overs
//             noBall: ballData.extraType === 'No Ball' ? 1 : 0,
//             wideBall: ballData.extraType === 'Wide' ? 1 : 0
//         });

//         console.log("Successfully updated player stats.");
//     } catch (err) {
//         console.error("Error handling ball event:", err);
//     }
// };
/**
 * Broadcast updated stats to match page
 */
// const broadcastStats = async (io, matchId) => {
//     try {
//         // Fetch stats for both innings
//         const battingStatsInning1 = await getBattingStats(matchId, 1);
//         const battingStatsInning2 = await getBattingStats(matchId, 2);
//         const bowlingStatsInning1 = await getBowlingStats(matchId, 1);
//         const bowlingStatsInning2 = await getBowlingStats(matchId, 2);

//         // Emit to match-specific socket room
//         io.to(`match_${matchId}`).emit("updateStats", {
//             batting: {
//                 inning1: battingStatsInning1,
//                 inning2: battingStatsInning2
//             },
//             bowling: {
//                 inning1: bowlingStatsInning1,
//                 inning2: bowlingStatsInning2
//             }
//         });

//         console.log(`Stats broadcasted for match ${matchId}`);
//     } catch (err) {
//         console.error("Error broadcasting stats:", err);
//     }
// };
