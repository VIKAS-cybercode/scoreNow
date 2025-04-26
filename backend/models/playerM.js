import pool from './db.js';

// Create Players Table
const createPlayersTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "players" (
            "playerId" SERIAL PRIMARY KEY,
            "auth0Id" VARCHAR(50) UNIQUE NOT NULL,
            "name" VARCHAR(100) NOT NULL,
            "gmail" VARCHAR(100) UNIQUE NOT NULL,
            "profilePicture" VARCHAR(255),
            "location" VARCHAR(50),
            "role" VARCHAR(50) CHECK ("role" IN ('Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper')),
            "matchesPlayed" INT DEFAULT 0 CHECK ("matchesPlayed" >= 0),
            "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(query);
        console.log("Players table is ready.");
    } catch (err) {
        console.error("Error creating players table:", err);
    }
};

// Create Batting Stats Table
const createBattingStatsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "battingStats" (
            "playerId" INT PRIMARY KEY REFERENCES "players"("playerId") ON DELETE CASCADE,
            "battingStyle" VARCHAR(50) CHECK ("battingStyle" IN ('Right-handed', 'Left-handed')),
            "battingInnings" INT DEFAULT 0,
            "runsScored" INT DEFAULT 0,
            "ballsFaced" INT DEFAULT 0,
            "highestRun" INT DEFAULT 0,
            "notOut" INT DEFAULT 0,
            "fours" INT DEFAULT 0,
            "sixes" INT DEFAULT 0,
            "fifties" INT DEFAULT 0,
            "hundreds" INT DEFAULT 0
        );
    `;
    try {
        await pool.query(query);
        console.log("Batting stats table is ready.");
    } catch (err) {
        console.error("Error creating batting stats table:", err);
    }
};

// Create Bowling Stats Table
const createBowlingStatsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "bowlingStats" (
            "playerId" INT PRIMARY KEY REFERENCES "players"("playerId") ON DELETE CASCADE,
            "bowlingStyle" VARCHAR(100),
            "bowlingInnings" INT DEFAULT 0,
            "overs" INT DEFAULT 0,
            "runsGiven" INT DEFAULT 0,
            "wicketsTaken" INT DEFAULT 0,
            "maidenOvers" INT DEFAULT 0,
            "bestBowling" VARCHAR(10),
            "fiveWickets" INT DEFAULT 0,
            "wides" INT DEFAULT 0,
            "noBalls" INT DEFAULT 0
        );
    `;
    try {
        await pool.query(query);
        console.log("Bowling stats table is ready.");
    } catch (err) {
        console.error("Error creating bowling stats table:", err);
    }
};

// Create Fielding Stats Table
const createFieldingStatsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS "fieldingStats" (
            "playerId" INT PRIMARY KEY REFERENCES "players"("playerId") ON DELETE CASCADE,
            "catches" INT DEFAULT 0,
            "stumpings" INT DEFAULT 0,
            "runOuts" INT DEFAULT 0
        );
    `;
    try {
        await pool.query(query);
        console.log("Fielding stats table is ready.");
    } catch (err) {
        console.error("Error creating fielding stats table:", err);
    }
};

// Export functions
export { 
    createPlayersTable, createBattingStatsTable, createBowlingStatsTable, createFieldingStatsTable
};

async function makeTable() {
    try {
        await createPlayersTable();
        await createBattingStatsTable();
        // await createBowlingStatsTable();
        // await createFieldingStatsTable();
    } catch (error) {
        console.error("Error in execution:", error);
    }
}

//makeTable();
