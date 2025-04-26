// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerProfile from "./Components/PlayerProfile";
import PlayerForm from "./Components/PlayerForm";
import Tournaments from "./Components/Tournaments";
import LiveMatches from "./Components/LiveMatches";
import TournamentDetails from "./Components/TournamentDetails";
import Carousel from "./Components/Carousel";
import CreateTournament from "./Components/CreateTournament";
import Why from "./Components/Why";
import Match from "./Components/Match";
import StartMatch from "./Components/StartMatch";
import CreateMatch from "./Components/CreateMatch";
import Scoring from "./Components/Scoring";
import Looking from "./Components/Looking";
import { PlayerProvider, usePlayer } from "./PlayerContext";
import CreateTeam from "./Components/CreateTeam";
import Teams from "./Components/Teams";
import TeamDetails from "./Components/TeamDetails";
import Chat from "./Components/Chat";
import Faq from "./Components/Faq";
import Layout from "./Components/Layout";
import News from "./Components/News";
import "./App.css";

const AppContent = () => {
  const { playerId, loadingPlayer, authLoading } = usePlayer();
  console.log("Player ID:", playerId);

  // Show a loading message while Auth0/player data is still loading
  if (authLoading || loadingPlayer) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="App">
        <Routes>
          <Route path="/" element={<><Carousel /><Why /></>} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/matches" element={<LiveMatches />} />
          <Route path="/looking" element={<Looking />} />
          <Route path="/news" element={<News/>}/>
          <Route path="/faq" element={<Faq/>}/>
          <Route path="/teams" element={<Teams/>}/>
          <Route path="/teams/:teamId" element={<TeamDetails/>} />
          <Route path="/matches/:matchId" element={<Match />} />
          <Route path="/matches/:matchId/start" element={<StartMatch />} />
          <Route path="/matches/:matchId/score" element={<Scoring />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentDetails />} />
          <Route
            path="/players/:playerId"
            element={
              Number(playerId) === 0 ? <PlayerForm /> : <PlayerProfile />
            }
          />
          <Route path="/players/:playerId/matches" element={<LiveMatches />} />
          <Route path="/players/:playerId/createMatch" element={<CreateMatch />} />
          <Route path="/players/:playerId/tournaments" element={<Tournaments />} />
          <Route path="/players/:playerId/organisedMatches" element={<LiveMatches />} />
          <Route path="/players/:playerId/organisedTournaments" element={<Tournaments />} />
          <Route path="/players/:playerId/createTournament" element={<CreateTournament />} />
          <Route path="/players/:playerId/Teams" element={<Teams />} />
          <Route path="/players/:playerId/createTeam" element={<CreateTeam />} />
          <Route path="/players/:playerId/Chat" element={<Chat />} />
        </Routes>
      </div>
      </Layout>
  );
};

function App() {
  return (
    <Router>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </Router>
  );
}

export default App;