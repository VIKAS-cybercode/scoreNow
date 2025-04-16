import pool from '../models/db.js';


// Insert Ball Event
// const insertBallEvent = async (ballEventData) => {
//     const fields = Object.keys(ballEventData).map(field => `"${field}"`);  
//     const values = Object.values(ballEventData);

//     if (fields.length === 0) throw new Error("No data provided");

//     const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ");
//     const query = `
//         INSERT INTO "ballEvent" (${fields.join(", ")})
//         VALUES (${placeholders})
//         RETURNING *;
//     `;

//     try {
//         const result = await pool.query(query, values);
//         console.log("Ball event added:", result.rows[0]);
//         return result.rows[0];
//     } catch (err) {
//         console.error("Error inserting ball event:", err);
//         throw err;
//     }
// };
const insertBallEvent = async (ballEventData) => {
    const client = await pool.connect();
    try {
        console.log("insertballevent");
        await client.query('BEGIN');
        // List of valid columns in ballEvent table (adjust according to your schema)
        const validColumns = new Set([
            'matchId', 'inningNumber', 'overNumber', 'ballNumber',
            'strikerId', 'nonStrikerId', 'bowlerId', 'runScored',
            'extraRun', 'isWicket', 'wicketType', 'boundaryType',
            'extraType', 'outBatsmanId', 'fielderId', 'timestamp'
            // ... add other actual column names from your table
        ]);

        // Filter input data to only valid columns
        const filteredData = Object.entries(ballEventData).reduce((acc, [key, value]) => {
            if (validColumns.has(key)) {
                acc[key] = value;
            }
            return acc;
        }, {});

        // 1. Insert ball event
        const ballFields = Object.keys(filteredData);
        const ballValues = Object.values(filteredData);
        const ballPlaceholders = ballFields.map((_, i) => `$${i + 1}`).join(', ');
        
        const ballQuery = `
            INSERT INTO "ballEvent" (${ballFields.map(f => `"${f}"`).join(', ')})
            VALUES (${ballPlaceholders})
            RETURNING *;
        `;
        const ballResult = await client.query(ballQuery, ballValues);
        const ballEvent = ballResult.rows[0];

        // 2. Extract required values
        const {
            matchId,
            inningNumber: inning,
            overNumber,
            ballNumber,
            strikerId,
            bowlerId,
            runScored = 0,
            extraRun = 0,
            isWicket = false,
            wicketType,
            boundaryType,
            extraType,
            outBatsmanId,
            fielderId
        } = ballEvent;

        // 3. Update matches table
        const scoreIncrement = runScored + extraRun;
        const overProgress = overNumber + (ballNumber / 10 != 0.6) ? ballNumber / 10 : 1.0 ;  // Convert ballNumber (1-6) to 0.1-0.6
        const isWide = extraType === 'Wide';
        const isNoBall = extraType === 'No Ball';

        const updateMatchesQuery = `
            UPDATE matches
            SET
                ${inning === 1 ? `
                    "firstInningScore" = "firstInningScore" + $1,
                    "firstInningWicket" = "firstInningWicket" + $2,
                    "firstInningOver" = GREATEST("firstInningOver", $3),
                    "firstInningExtras" = "firstInningExtras" + $4,
                    "firstInningWides" = "firstInningWides" + $5,
                    "firstInningNoBalls" = "firstInningNoBalls" + $6
                ` : `
                    "secondInningScore" = "secondInningScore" + $1,
                    "secondInningWicket" = "secondInningWicket" + $2,
                    "secondInningOver" = GREATEST("secondInningOver", $3),
                    "secondInningExtras" = "secondInningExtras" + $4,
                    "secondInningWides" = "secondInningWides" + $5,
                    "secondInningNoBalls" = "secondInningNoBalls" + $6
                `}
            WHERE "matchId" = $7;
        `;

        await client.query(updateMatchesQuery, [
            scoreIncrement,
            isWicket ? 1 : 0,
            overProgress,  
            extraRun,
            isWide ? 1 : 0,
            isNoBall ? 1 : 0,
            matchId
        ]);

        // 4. Update batting stats
        const incrementBallsFaced = extraType !== 'Wide';
        const foursIncrement = boundaryType === 'Four' ? 1 : 0;
        const sixesIncrement = boundaryType === 'Six' ? 1 : 0;
        const isOut = isWicket && outBatsmanId === strikerId;
        const outStatus = isOut ? wicketType : 'Not Out';

        const upsertBattingQuery = `
            INSERT INTO "battingInningsPlayerStats" (
                "matchId", "inningNumber", "batsmanId", "battingPosition",
                "runs", "ballsFaced", "fours", "sixes", 
                "outStatus", "outBowlerId", "outFielderId"
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT ("matchId", "inningNumber", "batsmanId") DO UPDATE SET
                "runs" = "battingInningsPlayerStats"."runs" + EXCLUDED."runs",
                "ballsFaced" = "battingInningsPlayerStats"."ballsFaced" + EXCLUDED."ballsFaced",
                "fours" = "battingInningsPlayerStats"."fours" + EXCLUDED."fours",
                "sixes" = "battingInningsPlayerStats"."sixes" + EXCLUDED."sixes",
                "outStatus" = COALESCE(EXCLUDED."outStatus", "battingInningsPlayerStats"."outStatus"),
                "outBowlerId" = COALESCE(EXCLUDED."outBowlerId", "battingInningsPlayerStats"."outBowlerId"),
                "outFielderId" = COALESCE(EXCLUDED."outFielderId", "battingInningsPlayerStats"."outFielderId");
        `;
        await client.query(upsertBattingQuery, [
            matchId,
            inning,
            strikerId,
            ballEventData.battingPosition,
            runScored,
            incrementBallsFaced ? 1 : 0,
            foursIncrement,
            sixesIncrement,
            isOut ? outStatus : null,
            isOut ? bowlerId : null,
            isOut && (wicketType === 'Caught' || wicketType === 'Run Out' || wicketType === 'Stumped') ? fielderId : null
        ]);

        // 5. Update bowling stats
        const runsGivenIncrement = runScored + (['Wide', 'No Ball'].includes(extraType) ? extraRun : 0);
        const wicketsIncrement = (isWicket && wicketType !== 'Run Out') ? 1 : 0;

        const upsertBowlingQuery = `
            INSERT INTO "bowlingInningsPlayerStats" (
                "matchId", "inningNumber", "bowlerId", "bowlingPosition",
                "overs", "runsGiven", "wickets", "noBall", "wideBall"
            )
            VALUES ($1, $2, $3, $4, 0.1, $5, $6, $7, $8)
            ON CONFLICT ("matchId", "inningNumber", "bowlerId") DO UPDATE SET
                "overs" = "bowlingInningsPlayerStats"."overs" + 0.1,
                "runsGiven" = "bowlingInningsPlayerStats"."runsGiven" + EXCLUDED."runsGiven",
                "wickets" = "bowlingInningsPlayerStats"."wickets" + EXCLUDED."wickets",
                "noBall" = "bowlingInningsPlayerStats"."noBall" + EXCLUDED."noBall",
                "wideBall" = "bowlingInningsPlayerStats"."wideBall" + EXCLUDED."wideBall";
        `;
        await client.query(upsertBowlingQuery, [
            matchId,
            inning,
            bowlerId,
            ballEventData.bowlingPosition,
            runsGivenIncrement,
            wicketsIncrement,
            extraType === 'No Ball' ? 1 : 0,
            extraType === 'Wide' ? 1 : 0
        ]);

        await client.query('COMMIT');
        console.log(ballEvent);
        return ballEvent;
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transaction failed:", err);
        throw err;
    } finally {
        client.release();
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

export {insertBallEvent,updateBallEvent}
