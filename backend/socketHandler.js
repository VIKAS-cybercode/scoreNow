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
  