import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Match.css";
import LiveStream from "./LiveStream";
import socket from "./socket";
import { usePlayer } from "../PlayerContext";
import StartMatch from "./StartMatch";
import ScoreCardTab from "./ScoreCardTab";
import TeamsTab from "./TeamsTab";

const Match = () => {
  const { matchId } = useParams();
  const [matchData, setMatchData] = useState(null);
  const [isOrganiser, setIsOrganiser] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("LIVE");
  const [isScorer, setIsScorer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const Navigate = useNavigate();
  const { playerId } = usePlayer();
  const [showTossModal, setShowTossModal] = useState(false);
  const [scoreCardData,setScoreCardData]=useState({
    inning1: {  batters: [], bowlers: [] },
    inning2: {  batters: [], bowlers: [] }
  });
  const [teamData,setTeamData]=useState({
  },);
  // Transform match data from API
  const transformMatchData = (data) => ({
    tournamentName: data.tournamentId ? `Tournament ${data.tournamentId}` : "Friendly Match",
    ground: data.ground,
    location: data.city,
    format: data.matchType === 'limitedOvers' ? 'Limited Overs' : 'Other Format',
    overs: data.oversPerSide,
    status: data.status,
    toss: data.tossWinner 
      ? `Toss: ${data.teams[data.tossWinner === data.team1Id ? 'team1' : 'team2'].name} ${data.tossSelection}`
      : 'Toss not yet decided',
    teams: [
      { 
        name: data.teams.team1.name, 
        runs: data.firstInningScore || 0,
        wickets: data.firstInningWicket || 0,
        overs: data.firstInningOver || 0
      },
      { 
        name: data.teams.team2.name, 
        runs: data.secondInningScore || 0,
        wickets: data.secondInningWicket || 0,
        overs: data.secondInningOver || 0
      }
    ],
    inning1: data.inning1,
    inning2: data.inning2,
    chaseInfo: data.status === 'live' 
      ? `${data.teams.team2.name} require ${(data.firstInningScore - data.secondInningScore + 1)} runs in ${(data.oversPerSide * 6 - data.secondInningOver * 6)} balls`
      : '',
    projectedScore: data.firstInningScore 
      ? `Projected: ${Math.round(data.firstInningScore * (data.oversPerSide / data.firstInningOver)) || 0}`
      : '',
    lastFiveOvers: "0/0 (0.00)",
    officials: data.scorerId ? [`Scorer: User ${data.scorerId}`] : [],
    seriesName: data.tournamentId ? `Tournament ${data.tournamentId}` : "Friendly Match",
    matchDate: new Date(data.startDate).toLocaleDateString(),
    organiserId: data.organiserId,
    scorerId: data.scorerId,
  });

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/${matchId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log(data);
        setScoreCardData({ inning1: data.inning1, inning2: data.inning2 });
        setTeamData({teams:data.teams});
        const transformed = transformMatchData(data);
        
        setMatchData(transformed);
        setIsScorer(data.scorerId?.toString() === playerId?.toString());
        setIsOrganiser(data.organiserId?.toString() === playerId?.toString());

        socket.emit("join-match", matchId, (socketResponse) => {
          if (socketResponse.joined) {
            console.log(`Joined live room: ${matchId}`);
            if (socketResponse.match) {
              setMatchData(prev => ({
                ...prev,
                ...transformMatchData(socketResponse.match)
              }));
            }
          }
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching match data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatchData();
    return () => socket.emit("leave-room", matchId);
  }, [matchId, playerId]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentInning = () => {
    if (!matchData) return 1;
    return matchData.status === 'live' ? 
      (matchData.firstInningScore ? 2 : 1) : 
      (matchData.secondInningScore ? 2 : 1);
  };

  const calculateStrikeRate = (runs, balls) => (balls > 0 ? ((runs / balls) * 100).toFixed(2) : "0.00");
  const calculateEconomy = (runs, overs) => (overs > 0 ? (runs / overs).toFixed(2) : "0.00");
  const calculateRR = (runs, overs) => {
    if (!overs || overs === 0) return 0;
    return (runs / overs).toFixed(2);
  };
  
  // ✅ Main function to get data and call the helper
  const calculateCurrentRR = () => {
    const inning = getCurrentInning();
    const { runs, overs } = inning === 1 ? 
      { runs: matchData.teams[0].runs, overs: matchData.teams[0].overs } :
      { runs: matchData.teams[1].runs, overs: matchData.teams[1].overs };
  
    return calculateRR(runs, overs); // ✅ Now it calls the helper instead of itself
  };

  if (loading) return <div className="loading">Loading match details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!matchData) return <div className="error">No match data found</div>;

  const { formattedDate, formattedTime, formattedDay } = {
    formattedDate: currentTime.toISOString().split("T")[0],
    formattedTime: currentTime.toLocaleTimeString(),
    formattedDay: currentTime.toLocaleDateString("en-US", { weekday: "long" })
  };

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

        {matchData.status === "scheduled" && (
          <div>
            <button onClick={() => setShowTossModal(true)} className="open-toss-btn">
              Launch Toss Popup
            </button>
            {showTossModal && (
              <div className="modal-3d-overlay">
                <div className="modal-3d-container">
                  <button className="modal-close-btn" onClick={() => setShowTossModal(false)}>
                    ×
                  </button>
                  <StartMatch 
                    teams={teamData}
                    matchId={matchId}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {matchData.status === "live" && isScorer && (
          <button
            className="btn btn-primary score-match-btn"
            onClick={() => Navigate(`/matches/${matchId}/score`)}
          >
            {getCurrentInning() === 1 ? "Score 1st Inning" : "Score 2nd Inning"}
          </button>
        )}

        <div className="match-tabs-wrapper">
          <nav className="match-tabs">
            {["LIVE", "SCORECARD", "COMMENTARY", "ANALYSIS", "CRICHEROES", "MVP", "TEAMS", "GALLERY"].map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active-tab" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="active-tab-content">
            {activeTab === "LIVE" && (
              <div className="live-section">
                <h2>Live Match Updates</h2>
                
                <h3>Batters</h3>
                <table className="batters-table">
                  <thead>
                    <tr>
                      <th>Batter</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(matchData.inning1?.batting || []).map((batter, i) => (
                      <tr key={i}>
                        <td>{batter.playerName}{batter.onStrike && "*"}</td>
                        <td>{batter.runs}</td>
                        <td>{batter.ballsFaced}</td>
                        <td>{batter.fours}</td>
                        <td>{batter.sixes}</td>
                        <td>{calculateStrikeRate(batter.runs, batter.ballsFaced)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3>Bowlers</h3>
                <table className="bowlers-table">
                  <thead>
                    <tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>Eco</th></tr>
                  </thead>
                  <tbody>
                    {(matchData.inning1?.bowling || []).map((bowler, i) => (
                      <tr key={i}>
                        <td>{bowler.playerName}</td>
                        <td>{bowler.oversBowled}</td>
                        <td>{bowler.maidens}</td>
                        <td>{bowler.runsConceded}</td>
                        <td>{bowler.wickets}</td>
                        <td>{calculateEconomy(bowler.runsConceded, bowler.oversBowled)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="current-partnership">
                  <strong>Current Partnership:</strong> {matchData.inning1?.partnership || '0(0)'}
                </div>
                <LiveStream isOrganiser={isOrganiser} />
              </div>
            )}

            {activeTab === "SCORECARD" && <ScoreCardTab matchData={scoreCardData} />}
            {activeTab === "TEAMS" && <TeamsTab teams={teamData} />}
            {/* Add other tabs as needed */}
          </div>
        </div>
      </div>

      <div className="main-content-wrapper">
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
            </div>
            <div className="match-officials">
              <h3>Match Officials</h3>
              <div className="officials-list">
                {matchData.officials.map((official, index) => (
                  <span key={index}>{official}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Match;
