// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerProfile from "./Components/PlayerProfile";
import PlayerForm from "./Components/PlayerForm"; // Make sure this is imported
import Tournaments from "./Components/Tournaments";
import LiveMatches from "./Components/LiveMatches";
import TournamentDetails from "./Components/TournamentDetails";
import Carousel from "./Components/Carousel";
import Navbar from "./Components/Navbar";
import "./App.css";
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
const AppContent = () => {
  const { playerId, loadingPlayer, authLoading } = usePlayer();
  console.log(playerId);
  if (authLoading || loadingPlayer) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<><Carousel /><Why /></>} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/matches" element={<LiveMatches />} />
          <Route path="/looking" element={<Looking />} />
          <Route path="/teams" element={<Teams/>}/>
          <Route path="/teams/:teamId" element={<TeamDetails />}/>
          <Route path="/matches/:matchId" element={<Match />} />
          <Route path="/matches/:matchId/start" element={<StartMatch />} />
          <Route path="/matches/:matchId/score" element={<Scoring />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentDetails />} />

          {/* Redirect: If player not created, show form */}
          <Route path="/players/:playerId" element={Number(playerId)===0 ? <PlayerForm /> : <PlayerProfile />} />
          
          {/* Routes behind player login */}
              {/* <Route path={"/players/:playerId"} element={<PlayerProfile />} /> */}
              <Route path={"/players/:playerId/matches"} element={<LiveMatches />} />
              <Route path={"/players/:playerId/createMatch"} element={<CreateMatch />} />
              <Route path={"/players/:playerId/tournaments"} element={<Tournaments />} />
              <Route path={"/players/:playerId/organisedMatches"} element={<LiveMatches />} />
              <Route path={"/players/:playerId/organisedTournaments"} element={<Tournaments />} />
              <Route path={"/players/:playerId/createTournament"} element={<CreateTournament />} />
              <Route path={"/players/:playerId/Teams"} element={<Teams/>} />
              <Route path={"/players/:playerId/createTeam"} element={<CreateTeam />} />
        </Routes>
      </div>
    </>
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
