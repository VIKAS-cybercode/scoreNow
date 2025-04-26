import pool from './db.js';

const createTables = async () => {
  try {
    // One-to-one messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" SERIAL PRIMARY KEY,
        "sender_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        "receiver_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "timestamp"     TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
      );
    `);

    // Chat Requests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "chat_requests" (
        "id" SERIAL PRIMARY KEY,
        "sender_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        "receiver_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        "status" VARCHAR(10) DEFAULT 'pending',
        "timestamp"     TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
      );
    `);

    // Groups
await pool.query(`
  CREATE TABLE IF NOT EXISTS "groups" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "creator_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE
  );
`);

    // Group Members
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "group_members" (
        "id" SERIAL PRIMARY KEY,
        "group_id" INT REFERENCES "groups"("id") ON DELETE CASCADE,
        "user_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        UNIQUE ("group_id", "user_id")
      );
    `);

    // Group Messages
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "group_messages" (
        "id" SERIAL PRIMARY KEY,
        "group_id" INT REFERENCES "groups"("id") ON DELETE CASCADE,
        "sender_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        "content" TEXT NOT NULL,
        "timestamp"     TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
      );
    `);

    // Group Join Requests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "group_join_requests" (
        "id" SERIAL PRIMARY KEY,
        "user_id" INT REFERENCES "players"("playerId") ON DELETE CASCADE,
        "group_id" INT REFERENCES "groups"("id") ON DELETE CASCADE,
        "status" VARCHAR(10) DEFAULT 'pending',
        "timestamp"     TIMESTAMPTZ DEFAULT (NOW() AT TIME ZONE 'Asia/Kolkata')
      );    
    `);

    console.log("✅ All tables created successfully.");
    process.exit();
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
};

export { createTables };
