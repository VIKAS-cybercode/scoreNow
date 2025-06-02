import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import socketHandler from './socketHandler.js';
import pool from './models/db.js';

import playerR from './routes/playerR.js';
import matchR from './routes/matchR.js';
import teamR from './routes/teamR.js';
import tournamentR from './routes/tournamentR.js';
import lookingR from './routes/lookingR.js';
import newsR from './routes/newsR.js';

// Import table creation functions
import { createPlayersTable } from './models/playerM.js';
import { createMatchesTable, deleteMatchesTable } from './models/matchM.js';
import { createTeamsTable } from './models/teamsM.js';
import { createTournamentsTable } from './models/tournamentM.js';
import { createBallEvent } from './models/ballEventM.js';
import { createBattingInningsPlayerStats } from './models/battingInningsStats.js';
import { createBowlingInningsPlayerStats } from './models/bowlingInningsStats.js';
import { createTeamRPlayerTable } from './models/teamRPlayer.js';
import { createTournamentRTeamTable } from './models/tournamentRTeam.js';
import { createMatchRPlayerTable } from './models/matchRPlayer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with actual frontend URL
    methods: ["GET", "POST"]
  }
});

// Initialize socket.io
socketHandler(io);


// createPlayersTable();                     // Creates "players" table
// createMatchesTable();                     // Creates "matches" table
// createTeamsTable();                       // Creates "teams" table
// createTournamentsTable();                 // Creates "tournaments" table
// createBallEvent();                        // Creates "ballEvents" table
// createBattingInningsPlayerStats();        // Creates "battingInningsStats" table
// createBowlingInningsPlayerStats();        // Creates "bowlingInningsStats" table
// createTeamRPlayerTable();                 // Creates "teamRPlayer" (relation) table
// createTournamentRTeamTable();             // Creates "tournamentRTeam" (relation) table
// createMatchRPlayerTable();                // Creates "matchRPlayer" (relation) table
// deleteMatchesTable();                  // Optional: Deletes "matches" table (use only if needed)

const PORT = process.env.PORT || 3000;

// Test route
// app.get('/', (req, res) => {
//   res.send('server running ');
// });

// API routes
app.use('/api/players', playerR);
app.use('/api/matches', matchR);
app.use('/api/teams', teamR);
app.use('/api/tournaments', tournamentR);
app.use('/api/lookings', lookingR);
app.use('/api/cricket-news', newsR);

// Serve React static files
app.use(express.static(path.join(__dirname, 'build')));

// Fallback to React app for non-API routes (supports React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
