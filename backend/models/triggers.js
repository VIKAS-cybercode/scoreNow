import pool from "./db.js";

const createTrigger = async () => {
    const query = `
    -- Function to insert players into "matchRPlayer" when a new match is added
    CREATE OR REPLACE FUNCTION "insertMatchRPlayers"()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO "matchRPlayer" ("matchId", "playerId", "teamId", "isPlaying")
        SELECT NEW."matchId", tp."playerId", tp."teamId", FALSE
        FROM "teamRPlayer" tp
        WHERE tp."teamId" = NEW."team1Id" OR tp."teamId" = NEW."team2Id";
        
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger to call the function on match insert
    CREATE OR REPLACE TRIGGER "triggerInsertMatchRPlayers"
    AFTER INSERT ON "matches"
    FOR EACH ROW
    EXECUTE FUNCTION "insertMatchRPlayers"();
    `;

    try {
        await pool.query(query);
        console.log("Trigger created successfully!");
    } catch (err) {
        console.error("Error creating trigger:", err);
    } finally {
        pool.end();
    }
};

createTrigger();
//execute the file separately