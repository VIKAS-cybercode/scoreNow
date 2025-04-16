import { insertBallEvent } from "./controller/ballEventC.js";
import { getMatchDataForBroadcast } from "./controller/matchC.js";
import { insertOrUpdateBattingInningsStats } from "./models/battingInningsStats.js";
import { insertOrUpdateBowlingInningsStats } from "./models/bowlingInningsStats.js";
// socketHandler.js
const socketHandler = (io) => {
  const connectedUsers = {};

  io.on("connection", (socket) => {
    console.log(" Client connected:", socket.id);
    socket.on("join-room", (matchId) => {
      socket.join(matchId);
      console.log(`User ${socket.id} joined room ${matchId}`);
    });
    socket.on('join-match', async (matchId, callback) => {
      //const match = await getMatchFromDB(matchId); // your pg call
  
      const room = io.sockets.adapter.rooms.get(matchId);
     // console.log(room);
     // console.log(matchId);
      const isLive = room && room.size > 0;
      if (isLive) {
        socket.join(matchId);
        console.log(`User ${socket.id} joined room ${matchId}`);
        callback({ joined: true });
      } else {
        //callback({ joined: false, match });
      }
    });
    // socket.on("initialPlayersSelected",(ballEvent)=>{
    //   const { matchId } = ballEvent;
    //   console.log(ballEvent);
    //   //function to be written
    //   // Broadcast to the room (except sender) using socket.to
    //   socket.to(matchId).emit("initialPlayersSelectedClient", ballEvent);
    // })

    socket.on("ballEvent",async (ballData)=>{
      try {
        // Insert into database
        console.log(ballData)
        const newBallEvent = await insertBallEvent(ballData);
        
        // Broadcast updated match state to all clients
        const matchState = await getMatchDataForBroadcast(ballData.matchId); // Implement this
        console.log(matchState);
        socket.to(ballData.matchId).emit("ballEventClient", matchState);
        // io.emit('matchUpdate', matchState);
        
        // Optional: Send confirmation to sender
        // socket.emit('ballEventSuccess', newBallEvent);
      } catch (err) {
        console.error('Socket error:', err);
        socket.emit('ballEventError', {
          message: 'Failed to process ball event',
          error: err.message
        });
      }
    });
    socket.on("battingStats", async (payload) => {
      try {
        const result = await insertOrUpdateBattingInningsStats({
          matchId: payload.matchId,
          inningNumber: payload.inningNumber,
          batsmanId: payload.batsmanId,
          teamId: payload.teamId,
          battingPosition: payload.battingPosition,
          // Add default values or expand payload if needed:
          runs: payload.runs || 0,
          ballsFaced: payload.ballsFaced || 0,
          fours: payload.fours || 0,
          sixes: payload.sixes || 0,
          outStatus: payload.outStatus || "Not Out",
          outBowlerId: payload.outBowlerId || null,
          outFielderId: payload.outFielderId || null,
        });
        console.log("Batting stats inserted/updated successfully:", result);
        // Optionally emit a success event to the client:
        //socket.emit("battingStatsUpdated", result);
      } catch (err) {
        console.error("Error in inserting/updating batting stats:", err);
        socket.emit("error", { message: err.message });
      }
    });  
    socket.on("bowlingStats",async (payload)=>{
      try {
       
        const {matchId,inningNumber,bowlerId,teamId,bowlingPosition} = payload;
  
        // Here we're assuming that when the bowler is changed,
        // the stats for this delivery (or over) are recorded.
        // If these statistics aren't part of the payload, defaults (zero) will be applied.
        const overs = payload.overs || 0;
        const runsGiven = payload.runsGiven || 0;
        const wickets = payload.wickets || 0;
        const maidenOvers = payload.maidenOvers || 0;
        const noBall = payload.noBall || 0;
        const wideBall = payload.wideBall || 0;
  
        // Call the database insert/update function with the relevant data.
        const result = await insertOrUpdateBowlingInningsStats({
          matchId,
          inningNumber,
          bowlerId,
          teamId,
          bowlingPosition,
          overs,
          runsGiven,
          wickets,
          maidenOvers,
          noBall,
          wideBall
        });
  
        console.log("Successfully inserted/updated bowling stats:", result);
        // Optionally, emit back an acknowledgment or updated data
        socket.to(matchId).emit("bowlingStatsClient", data);
      } catch (err) {
        console.error("Error inserting/updating bowling stats:", err);
        socket.emit("error", { message: err.message });
      }

      // Broadcast to the room (except sender) using socket.to
      
    })
    socket.on("inningOverEvent",(data)=>{
      const { matchId } = data;

      // Broadcast to the room (except sender) using socket.to
      socket.to(matchId).emit("inningOverEventClient", data);
    })


    /// chat message socket -------------------------------------------------------
    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, content } = data;
  
      try {
        // Save message to DB
        const result = await db.query(
          `INSERT INTO messages (sender_id, receiver_id, content)
           VALUES ($1, $2, $3) RETURNING *`,
          [senderId, receiverId, content]
        );
  
        const message = result.rows[0];
  
        // Send message to both sender and receiver rooms
        const room1 = `${senderId}-${receiverId}`;
        const room2 = `${receiverId}-${senderId}`;
  
        io.to(room1).to(room2).emit("receiveMessage", message);
      } catch (err) {
        console.error("❌ Error saving message:", err);
      }
    });
     
    socket.on('joinGroup', (groupId) => {
      socket.join(groupId);
    });
  
    socket.on('groupMessage', async ({ groupId, senderId, content }) => {
      try {
        const result = await db.query(
          `INSERT INTO group_messages (group_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [groupId, senderId, content]
        );
        
        // Fetch sender name
        const sender = await db.query(`SELECT name FROM players WHERE "playerId" = $1`, [senderId]);
        const senderName = sender.rows[0]?.name || "Unknown";
        
        // Emit with name
        io.to(groupId).emit("groupMessage", {
          ...result.rows[0],
          sender_name: senderName
        });
        
      } catch (err) {
        console.error('❌ Error saving group message:', err);
      }
    });
  //------------------------------------------------------------  
  socket.on("liveStream",(data)=>{
    const { matchId,liveStreamId } = data;
    console.log("live",matchId,liveStreamId);
    // Broadcast to the room (except sender) using socket.to
    socket.to(matchId).emit("liveStreamClient", {liveStreamId});
  })

    socket.on('leave-room', (matchId) => {
      socket.leave(matchId);
      console.log(`Socket ${socket.id} left room ${matchId}`);
    });
    socket.on("disconnect", () => {
      console.log("🔌 Disconnected:", socket.id);
    });
  });
};

export default socketHandler;
