import dotenv from 'dotenv';
import express from 'express'
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import socketHandler from "./socketHandler.js";
import pool from './models/db.js'
import playerR from './routes/playerR.js'
import matchR from './routes/matchR.js'
import teamR from './routes/teamR.js'
import tournamentR from './routes/tournamentR.js'
import { createPlayersTable } from './models/playerM.js';
import {createMatchesTable} from './models/matchM.js';
import { createTeamsTable } from './models/teamsM.js';
import { createTournamentsTable } from './models/tournamentM.js';
import { createBallEvent } from './models/ballEventM.js';
import { createBattingInningsPlayerStats } from './models/battingInningsStats.js';
import { createBowlingInningsPlayerStats } from './models/bowlingInningsStats.js';
import { createTeamRPlayerTable } from './models/teamRPlayer.js';
import { createTournamentRTeamTable } from './models/tournamentRTeam.js';
import { createMatchRPlayerTable } from './models/matchRPlayer.js';


// createMatchesTable();
// createTeamsTable();
// createTournamentsTable();
// createBallEvent();
// createBattingInningsPlayerStats();
// createBowlingInningsPlayerStats();
// createTeamRPlayerTable();
// createTournamentRTeamTable();
// createMatchRPlayerTable();

const app = express()
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Replace with your frontend URL in production
    methods: ["GET", "POST"]
  }
});

socketHandler(io);

const PORT = process.env.PORT || 5000;
dotenv.config();

app.get('/',(req,res)=>{
    res.send('vikas 💘 sanchi !')
})


app.use('/api/players', playerR)
app.use('/api/matches', matchR)
app.use('/api/teams',teamR)
app.use('/api/tournaments',tournamentR)
// app.use('/api/ballEvent',ballEventR)

server.listen(PORT,()=>{
    console.log(`vikas listening on ${PORT}`)
})