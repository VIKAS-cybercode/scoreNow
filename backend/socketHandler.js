import { insertBallEvent } from "./controller/ballEventC.js";
import { getMatchDataForBroadcast } from "./controller/matchC.js";
import { insertBattingInningsStats } from "./models/battingInningsStats.js";
import { insertBowlingInningsStats } from "./models/bowlingInningsStats.js";
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

    // socket.on("ballEvent",async (ballData)=>{
    //   try {
    //     // Insert into database
    //     console.log(ballData)
    //     const newBallEvent = await insertBallEvent(ballData);
        
    //     // Broadcast updated match state to all clients
    //     const matchState = await getMatchDataForBroadcast(ballData.matchId); // Implement this
    //     console.log(matchState);
    //     socket.to(ballData.matchId).emit("ballEventClient", matchState);
    //     // io.emit('matchUpdate', matchState);
        
    //     // Optional: Send confirmation to sender
    //     // socket.emit('ballEventSuccess', newBallEvent);
    //   } catch (err) {
    //     console.error('Socket error:', err);
    //     socket.emit('ballEventError', {
    //       message: 'Failed to process ball event',
    //       error: err.message
    //     });
    //   }
    // });
    socket.on("ballEvent", async (ballData) => {
      try {
        // Insert into database
        console.log(ballData);
        const newBallEvent = await insertBallEvent(ballData);
    
        // Broadcast updated match state to all clients
        const matchState = await getMatchDataForBroadcast(ballData.matchId); // Implement this
    
        // Extract current striker ID (assumes structure like ballData.strikerId or similar)
        const currentStrikerId = ballData.currentStrikerId;
        const bowlerId=ballData.bowlerId;
        const noBallType=ballData.noBallType;
        console.log({ ...matchState, currentStrikerId ,bowlerId,noBallType});
        
        // Emit to match room
        socket.to(ballData.matchId).emit("ballEventClient", {
          ...matchState,
          currentStrikerId,bowlerId,noBallType
        });
    
        // Optional: Send confirmation to sender
        // socket.emit('ballEventSuccess', newBallEvent);
    
      } catch (err) {
        console.error("Socket error:", err);
        socket.emit("ballEventError", {
          message: "Failed to process ball event",
          error: err.message,
        });
      }
    });
    
    socket.on("battingStats", async (dataObject) => {
      console.log("batting",dataObject);
      try {
        const insertedStats = await insertBattingInningsStats({
            matchId: dataObject.matchId,
            batsmanId: dataObject.batsmanId,
            inningNumber: dataObject.inningNumber,
            battingPosition: dataObject.battingPosition,
            outStatus:'Not Out'
          });
          const matchState = await getMatchDataForBroadcast(dataObject.matchId);
          console.log("Inserted batting stats:", insertedStats);
          socket.to(dataObject.matchId).emit("battingStatsClient", matchState);
        } catch (error) {
            console.error("Error inserting batting stats:", error);
        }
        
      });  
      socket.on("bowlingStats",async (dataObject)=>{
        console.log("bowling",dataObject);
        try {
          const insertedStats = await insertBowlingInningsStats({
            matchId: dataObject.matchId,
            bowlerId: dataObject.bowlerId,
            inningNumber: dataObject.inningNumber,
            bowlingPosition: dataObject.bowlingPosition
          });
          const bowlerId=dataObject.bowlerId;
          const matchState = await getMatchDataForBroadcast(dataObject.matchId);
          console.log("Inserted bowling stats:", insertedStats);
          socket.to(dataObject.matchId).emit("bowlingStatsClient", {
            ...matchState,bowlerId
          });
        } catch (error) {
          console.error("Error inserting bowling stats:", error);
        }
        
      // Broadcast to the room (except sender) using socket.to
      
    });
    socket.on("inningOverEvent",(data)=>{
      const { matchId } = data;

      // Broadcast to the room (except sender) using socket.to
      socket.to(matchId).emit("inningOverEventClient", data);
    })
    socket.on("matchEnd",(data)=>{
      console.log(data);
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
