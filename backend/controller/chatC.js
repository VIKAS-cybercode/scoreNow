// chatC.js
import pool from "../models/db.js";

/**
 * Helper to parse an integer from params or query, returning null if invalid.
 */
function parseIntParam(value) {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

// Create chat request
export const createChatRequest = async (req, res) => {
  const senderId   = parseIntParam(req.params.playerId);
  const { receiverId } = req.body;

  if (!senderId || Number.isNaN(parseInt(receiverId, 10))) {
    return res.status(400).json({ error: "Invalid sender or receiver ID" });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO "chat_requests" ("sender_id", "receiver_id", "status")
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [senderId, receiverId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ createChatRequest:", err);
    res.status(500).json({ error: "Failed to send chat request" });
  }
};

// Get incoming & pending chat requests
export const getChatRequests = async (req, res) => {
  const playerId = parseIntParam(req.params.playerId);
  if (!playerId) {
    return res.status(400).json({ error: "Invalid player ID" });
  }

  try {
    const incomingQ = await pool.query(
      `SELECT
         cr.*,
         p.name AS sender_name
       FROM "chat_requests" cr
       JOIN "players" p ON cr.sender_id = p."playerId"
       WHERE cr.receiver_id = $1
         AND cr.status = 'pending'`,
      [playerId]
    );
    const pendingQ = await pool.query(
      `SELECT
         cr.*,
         p.name AS receiver_name
       FROM "chat_requests" cr
       JOIN "players" p ON cr.receiver_id = p."playerId"
       WHERE cr.sender_id = $1
         AND cr.status = 'pending'`,
      [playerId]
    );
    res.json({ incoming: incomingQ.rows, pending: pendingQ.rows });
  } catch (err) {
    console.error("❌ getChatRequests:", err);
    res.status(500).json({ error: "Failed to get chat requests" });
  }
};

// Accept chat request
export const acceptChatRequest = async (req, res) => {
  const id = parseIntParam(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Invalid request ID" });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE "chat_requests"
       SET "status" = 'accepted'
       WHERE "id" = $1
       RETURNING *`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Chat request not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ acceptChatRequest:", err);
    res.status(500).json({ error: "Failed to accept chat request" });
  }
};

// Get conversations
export const getConversations = async (req, res) => {
  const playerId = parseIntParam(req.params.playerId);
  if (!playerId) {
    return res.status(400).json({ error: "Invalid player ID" });
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         cr."id",
         CASE
           WHEN cr."sender_id" = $1 THEN cr."receiver_id"
           ELSE cr."sender_id"
         END AS "partner_id"
       FROM "chat_requests" cr
       WHERE (cr."sender_id" = $1 OR cr."receiver_id" = $1)
         AND cr."status" = 'accepted'`,
      [playerId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getConversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

// Get one-to-one messages
export const getMessages = async (req, res) => {
  console.log(req.params.playerId);
  console.log(req.params.receiverId);
  // allow both path params and query params
  const senderId   = parseIntParam(req.params.playerId   ?? req.params.playerId);
  const receiverId = parseIntParam(req.params.receiverId ?? req.params.receiverId);

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "Invalid sender or receiver ID" });
  }

  try {
    const allowed = await pool.query(
      `SELECT 1
       FROM "chat_requests"
       WHERE (( "sender_id" = $1 AND "receiver_id" = $2 )
           OR  ( "sender_id" = $2 AND "receiver_id" = $1 ))
         AND "status" = 'accepted'`,
      [senderId, receiverId]
    );
    if (!allowed.rowCount) {
      return res.json([]); // no chat allowed, return empty list
    }

    const { rows } = await pool.query(
      `SELECT *
       FROM "messages"
       WHERE ( "sender_id" = $1 AND "receiver_id" = $2 )
          OR ( "sender_id" = $2 AND "receiver_id" = $1 )
       ORDER BY "timestamp"`,
      [senderId, receiverId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ getMessages:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

// Send one-to-one message
export const sendMessage = async (req, res) => {
  const senderId   = parseIntParam(req.params.senderId   ?? req.query.senderId);
  const receiverId = parseIntParam(req.params.receiverId ?? req.query.receiverId);
  const { content } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({ error: "Invalid sender or receiver ID" });
  }
  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Message content cannot be empty" });
  }

  try {
    const allowed = await pool.query(
      `SELECT 1
       FROM "chat_requests"
       WHERE (( "sender_id" = $1 AND "receiver_id" = $2 )
           OR  ( "sender_id" = $2 AND "receiver_id" = $1 ))
         AND "status" = 'accepted'`,
      [senderId, receiverId]
    );
    if (!allowed.rowCount) {
      return res.status(403).json({ error: "Chat not allowed" });
    }

    const { rows } = await pool.query(
      `INSERT INTO "messages" ("sender_id", "receiver_id", "content")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, receiverId, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("❌ sendMessage:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Create group
export const createGroup = async (req, res) => {
  const { name, members, creator_id } = req.body;

  if (!name || !Array.isArray(members) || members.length < 2 || !creator_id) {
    return res
      .status(400)
      .json({ error: "Group name, creator ID, and at least two members are required." });
  }

  try {
    const { rows: [newGroup] } = await pool.query(
      `INSERT INTO groups (name, creator_id)
       VALUES ($1, $2)
       RETURNING *`,
      [name, creator_id]
    );

    const uniqueIds = Array.from(new Set(members));
    await Promise.all(
      uniqueIds.map((id) =>
        pool.query(
          `INSERT INTO group_members (group_id, user_id)
           VALUES ($1, $2)`,
          [newGroup.id, id]
        )
      )
    );

    const { rows: [fullGroup] } = await pool.query(
      `SELECT
         g.id,
         g.name,
         g.creator_id,
         json_agg(
           json_build_object(
             'id', p."playerId",
             'name', p.name
           )
         ) AS members
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       JOIN players p ON gm.user_id = p."playerId"
       WHERE g.id = $1
       GROUP BY g.id`,
      [newGroup.id]
    );

    res.status(201).json(fullGroup);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create group" });
  }
};


// Get user's groups
export const getGroups = async (req, res) => {
  const playerId = parseInt(req.params.playerId, 10);

  try {
    const { rows } = await pool.query(
      `SELECT g.*
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1`,
      [playerId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
};

// Get group messages
export const getGroupMessages = async (req, res) => {
  const groupId = parseInt(req.params.groupId, 10);

  try {
    const { rows } = await pool.query(
      `SELECT
         gm.*,
         p.name AS sender_name
       FROM group_messages gm
       JOIN players p ON gm.sender_id = p."playerId"
       WHERE gm.group_id = $1
       ORDER BY gm.timestamp`,
      [groupId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get group messages" });
  }
};

// Create group join request
export const createGroupJoinRequest = async (req, res) => {
  const playerId = parseInt(req.params.playerId, 10);
  const { groupId } = req.body;
  if (!groupId)
    return res.status(400).json({ error: "groupId is required" });

  try {
    const existsQ = await pool.query(
      `SELECT 1
       FROM group_join_requests
       WHERE user_id = $1
         AND group_id = $2
         AND status = 'pending'`,
      [playerId, groupId]
    );
    if (existsQ.rowCount)
      return res.status(409).json({ error: "Join request already pending" });

    const { rows } = await pool.query(
      `INSERT INTO group_join_requests (user_id, group_id, status)
       VALUES ($1, $2, 'pending')
       RETURNING *`,
      [playerId, groupId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send join request" });
  }
};

// Get group join requests
export const getGroupJoinRequests = async (req, res) => {
  const playerId = parseInt(req.params.playerId, 10);

  try {
    const incomingQ = await pool.query(
      `SELECT
         jr.id,
         jr.user_id   AS requester_id,
         p.name       AS requester_name,
         jr.group_id,
         g.name       AS group_name,
         jr.timestamp
       FROM group_join_requests jr
       JOIN group_members gm ON jr.group_id = gm.group_id
       JOIN players p         ON jr.user_id = p."playerId"
       JOIN groups g          ON jr.group_id = g.id
       WHERE gm.user_id = $1
         AND jr.status = 'pending'`,
      [playerId]
    );

    const pendingQ = await pool.query(
      `SELECT
         jr.id,
         jr.group_id,
         g.name       AS group_name,
         jr.status,
         jr.timestamp
       FROM group_join_requests jr
       JOIN groups g ON jr.group_id = g.id
       WHERE jr.user_id = $1
         AND jr.status = 'pending'`,
      [playerId]
    );

    res.json({ incoming: incomingQ.rows, pending: pendingQ.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch join requests" });
  }
};

// Accept group join request
export const acceptGroupJoinRequest = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(
      `UPDATE group_join_requests
       SET status = 'accepted'
       WHERE id = $1
       RETURNING user_id, group_id`,
      [id]
    );
    if (!rows.length)
      return res.status(404).json({ error: "Join request not found" });

    const { user_id, group_id } = rows[0];
    await pool.query(
      `INSERT INTO group_members (group_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [group_id, user_id]
    );

    res.json({ requestId: id, groupId: group_id, userId: user_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to accept join request" });
  }
};

export const deleteGroup =  async (req, res) => {
  const { playerId, groupId } = req.params;
console.log(playerId,groupId);
  try {
    // Check if this player is the creator of the group
    const groupRes = await pool.query(
      `SELECT * FROM groups WHERE id = $1 AND creator_id = $2`,
      [groupId, playerId]
    );

    if (groupRes.rowCount === 0) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this group." });
    }

    // Delete the group (cascades to members, messages, requests)
    await pool.query(`DELETE FROM groups WHERE id = $1`, [groupId]);

    return res.json({ message: "Group deleted successfully." });
  } catch (err) {
    console.error("Error deleting group:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
