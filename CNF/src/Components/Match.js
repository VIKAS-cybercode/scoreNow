import React, { useState, useEffect } from "react";
import { useParams,useNavigate } from "react-router-dom";
import "./Match.css";
import LiveStream from "./LiveStream";
import socket from "./socket";
import { usePlayer } from "../PlayerContext";
const Match = () => {
  const { matchId} = useParams(); // Extract matchId & profileId from URL
  const [matchData, setMatchData] = useState(sampleMatchData);
  const [isOrganiser, setIsOrganiser] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("LIVE");
  const [isScorer, setIsScorer] = useState(false);
  const Navigate = useNavigate();
  const { playerId } = usePlayer();
  //const matchId=123;

  useEffect(() => {
    
    if (matchId) {
      socket.emit("join-match", matchId, (response) => {
        if (response.joined) {
          console.log(`Joined live room: ${matchId}`);
        } else {
          console.log("Room not live. Loaded match data without joining.");
        }
        if (response.match) {
          setMatchData(response.match);
          
          // Set scorer status based on match data
          if (response.match.scorerId && response.match.scorerId.toString() === playerId.toString()) {
            setIsScorer(true);
          } else {
            setIsScorer(false);
          }
          if (response.match.organiserId && response.match.organiserId.toString() === playerId.toString()) {
            setIsOrganiser(true);
          } else {
            setIsOrganiser(false);
          }
        }
        
      });
    }
    return () => {
      socket.emit("leave-room", matchId);
    };
  }, [matchId,playerId]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
 
  //if (!matchData) return <p>Loading match details...</p>;

  const formattedDate = currentTime.toISOString().split("T")[0];
  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDay = currentTime.toLocaleDateString("en-US", { weekday: "long" });

  const calculateStrikeRate = (runs, balls) => (balls > 0 ? ((runs / balls) * 100).toFixed(2) : "0.00");
  const calculateEconomy = (runs, overs) => (overs > 0 ? (runs / overs).toFixed(2) : "0.00");
  const calculateCurrentRR = (score, overs) => (overs > 0 ? (score / overs).toFixed(2) : "0.00");

  return (
    <div className="match-container">
      <div className="upperDiv">
        <header className="tournament-header-match">
          <h1>{matchData.tournamentName}</h1>
          <div className="match-info">
            <span>{`${matchData.ground}, ${matchData.location}, ${matchData.format}, ${matchData.overs} Ov., ${formattedDay}, ${formattedDate} ${formattedTime}`}</span>
            <span className="toss-info">{matchData.toss}</span>
          </div>
        </header>

        <div className="match-layout">
          <div className="scoreboard">
            {matchData.teams.map((team, index) => (
              <h3 key={index} className="team-score">
                <span className="team-name">{team.name}</span>
                <span className="score">{`${team.runs}/${team.wickets} (${team.overs} Ov)`}</span>
              </h3>
            ))}
            <p className="chase-info">{matchData.chaseInfo}</p>
          </div>
        </div>

        {/* "Start Match" Button (Visible Only to Scorer) */}
          {/* {isScorer && ( */}
          
            {matchData.status === "scheduled" && (
              <button
                className="btn btn-secondary start-match-btn"
                onClick={() => Navigate(`/matches/${matchId}/toss`)}
              >
                Start Match
              </button>
            )} 
            {matchData.status === "live" && (
              <button
                className="btn btn-primary score-match-btn"
                onClick={() => Navigate(`/matches/${matchId}/score`)}
              >
                Score Match
              </button>
             )} 
        {/* )} */}



        <nav className="match-tabs">
          {["LIVE", "SCORECARD", "COMMENTARY", "ANALYSIS", "CRICHEROES", "MVP", "TEAMS", "GALLERY"].map((tab) => (
            <button key={tab} className={activeTab === tab ? "active-tab" : ""} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>

        <div className="left-column">
          <div className="stats-section">
            <h3>Batters</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>R</th>
                  <th>B</th>
                  <th>4s</th>
                  <th>6s</th>
                  <th>SR</th>
                </tr>
              </thead>
              <tbody>
                {matchData.batters.map((batter, index) => (
                  <tr key={index}>
                    <td>{batter.name}</td>
                    <td>{batter.runs}</td>
                    <td>{batter.balls}</td>
                    <td>{batter.fours}</td>
                    <td>{batter.sixes}</td>
                    <td>{calculateStrikeRate(batter.runs, batter.balls)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stats-section">
            <h3>Bowlers</h3>
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>O</th>
                  <th>M</th>
                  <th>R</th>
                  <th>W</th>
                  <th>Eco</th>
                </tr>
              </thead>
              <tbody>
                {matchData.bowlers.map((bowler, index) => (
                  <tr key={index}>
                    <td>{bowler.name}</td>
                    <td>{bowler.overs}</td>
                    <td>{bowler.maidens}</td>
                    <td>{bowler.runs}</td>
                    <td>{bowler.wickets}</td>
                    <td>{calculateEconomy(bowler.runs, bowler.overs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="match-status">
            <div className="partnership">
              <span>{matchData.partnership}</span>
              <div className="recent-events">
                <span>RECENT:</span>
                {matchData.recentEvents.map((event, i) => (
                  <span key={i} className="event">
                    {event}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="right-column">
          <LiveStream isOrganiser={isOrganiser} />

          <div className="match-stats">
            <div className="stat-item">
              <span>Current RR</span>
              <span>{calculateCurrentRR()}</span>
            </div>
            <div className="stat-item">
              <span>Projected Score</span>
              <span>{matchData.projectedScore}</span>
            </div>
            <div className="stat-item">
              <span>Last 5 Ov. (RR)</span>
              <span>{matchData.lastFiveOvers}</span>
            </div>
          </div>

          <div className="match-officials">
            <h3>Match Officials</h3>
            <div className="officials-list">
              {matchData.officials.map((official, index) => (
                <span key={index}>{official}</span>
              ))}
            </div>
          </div>

          <div className="match-details">
            <h3>Series Name</h3>
            <p>{matchData.seriesName}</p>
            <div className="detail-item">
              <span>Match Date</span>
              <span>{matchData.matchDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



// Example Usage
const sampleMatchData = {
  tournamentName: "INDUSION SPORTS ACADEMY T25 WHITE BALL TOURNAMENT 2025",
  ground: "Indusion Cricket Ground",
  location: "Chennai",
  format: "Limited Overs",
  overs: "25",
  date: "30-Mar-25",
  time: "02:34 PM",
  toss: "Toss: Stride Riders opt to field",
  status:"scheduled",
  teams: [
    { name: "Manibhadra 11", runs:"171" ,wickets:"7", overs: "10.0" },
    { name: "Radhe Krishna 11", runs:"107" ,wickets:"9", overs: "9.4" },
  ],
  chaseInfo: "Radhe Krishna 11 require 40 runs in 2 balls (DLS par score: 111)",
  batters: [
    { name: "R'Veeraa", runs: "1", balls: "1", fours: "0", sixes: "0" },
    { name: "Laxman", runs: "19", balls: "10", fours: "3", sixes: "0" },
  ],
  bowlers: [
    { name: "Sriram", overs: "1", maidens: "0", runs: "21", wickets: "0"},
    { name: "Arjun", overs: "2", maidens: "0", runs: "31", wickets: "1"},
  ],
  partnership: "Current Partnership: 1(3)",
  recentEvents: ["1", "1", "1", "4", "1", "W", "1", "0", "0"],
  //currentScore: "29/1 (3.0 Ov)",
  //yetToBat: "Yet to Bat",
  totalViews: 27,
  liveViewers: 4,
  //currentRunRate: "9.67",
  //projectedScore: "242 (at 9.67 RPO)",
  lastFiveOvers: "29/1 (9.67)",
  officials: ["Subanandhan M - Scorer"],
  seriesName: "T25 White Ball Tournament 2025",
  matchDate: "30-Mar-2025",
};

export default Match;
