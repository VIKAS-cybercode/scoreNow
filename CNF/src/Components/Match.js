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
  const [tossInfo, setTossInfo] = useState({ tossWinner: null, tossSelection: null });
  const Navigate = useNavigate();
  const { playerId } = usePlayer();
  const [showTossModal, setShowTossModal] = useState(false);
  const [scoreCardData, setScoreCardData] = useState({
    inning1: { batting: [], bowling: [], partnership: "0(0)" },
    inning2: { batting: [], bowling: [], partnership: "0(0)" }
  });
  const [currentInning, setCurrentInning] = useState(1);
  const [teamsData, setTeamsData] = useState({
    team1: { teamId:null, name: "", players: [] },
    team2: { teamId:null, name: "", players: [] }
  });
  socket.on("inningOverEventClient",(data)=>{
      setCurrentInning((currentInning)=>currentInning+1)
  })
  
  // Transform match data from API
  const getInningTeams = (data, inning) => {
    const team1 = data.teams.team1;
    const team2 = data.teams.team2;
    const tossSelection = data.tossSelection.toLowerCase();
    const tossWinner = data.tossWinner; // team id
    let battingTeam, bowlingTeam;

    // Determine roles as per inning 1.
    if (tossSelection === "bat") {
      battingTeam = tossWinner === team1.teamId ? team1 : team2;
      bowlingTeam = tossWinner === team1.teamId ? team2 : team1;
    } else {
      battingTeam = tossWinner === team1.teamId ? team2 : team1;
      bowlingTeam = tossWinner === team1.teamId ? team1 : team2;
    }

    // If it's inning 2, swap the roles.
    if (inning === 2) {
      return { battingTeam: bowlingTeam, bowlingTeam: battingTeam };
    }

    return { battingTeam, bowlingTeam };
  };

  // Fetch initial match data.
  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/matches/${matchId}`);
        const data = await response.json();
        console.log(data);
        // Determine current inning from match status (or set manually).
        // Here we assume matchData.status has some info to determine that.
        const inning = data.secondInningOver > 0 || data.status === "completed" ? 2 : 1;
        setCurrentInning(inning);


        // Determine inning 1 teams for the initial scoreboard.
        const { battingTeam, bowlingTeam } = getInningTeams(data,inning);

        // Create teams array using inning 1 scores.
        const teamsScoreData = [
          {
            name: battingTeam.name,
            runs: data.firstInningScore || 0,
            wickets: data.firstInningWicket || 0,
            overs: data.firstInningOver || 0,
          },
          {
            name: bowlingTeam.name,
            runs: data.secondInningScore || 0,
            wickets: data.secondInningWicket || 0,
            overs: data.secondInningOver || 0,
          }
        ];

        // Optional: Prepare chaseInfo if applicable.
        const chaseInfo =
          data.status === "live" &&
          data.firstInningScore &&
          data.secondInningScore
            ? `${bowlingTeam.name} require ${
                data.firstInningScore - data.secondInningScore + 1
              } runs in ${
                data.oversPerSide * 6 - Math.floor(data.secondInningOver * 6)
              } balls`
            : "";
        

            let tossWinnerTeamName = "";
            if (data.teams) {
              const allTeams = Object.values(data.teams);
              const tossWinnerTeam = allTeams.find(team => team.teamId === data.tossWinner);
              tossWinnerTeamName = tossWinnerTeam ? tossWinnerTeam.name : "";
            }
               
        // Create transformed match data.
        const transformedData = {
          ground: data.ground,
          scorerId:data.scorerId,
          organiserId:data.organiserId,
          city: data.city,
          matchType: data.matchType,
          status: data.status,
          tossSelection: data.tossSelection,
          tossWinner: data.tossWinner,
          tossWinnerTeamName,
          teamsRaw: data.teams, // Store raw teams for re-determining roles.
          oversPerSide: data.oversPerSide,
          // Save the teams array for the scoreboard.
          teams: teamsScoreData,
          chaseInfo,
          tournamentName: data.tournamentId ? `Tournament ${data.tournamentId}` : "Friendly Match",
        };
        if (data.organiserId === playerId) {
          setIsOrganiser(true);
        }
        if(data.scorerId===playerId){
          setIsScorer(true);
        }
        setMatchData(transformedData);

      } catch (err) {
        console.error("Error fetching match data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMatchData();

    // Join the match room for live socket updates.
    socket.emit("join-match", matchId, (response) => {
      if (response.joined) {
        console.log("Joined match room successfully");
      } else {
        console.log("Could not join match room");
      }
    });

    return () => {
      //socket.off("scoreUpdate", handleScoreUpdate);
      socket.emit("leave-room", matchId);
    };
  }, [matchId,playerId]);

  // Live socket event handling.
  useEffect(() => {
    const handleScoreUpdate = (updatedData) => {
      // Optionally, you may determine current inning logic if it changes
      // (e.g., when first inning is complete, update currentInning to 2).
      // For the purpose of this demo, let's assume we update currentInning when firstInningScore stops updating.
      console.log(updatedData);
      if (updatedData.firstInningScore !== matchData?.teams[0].runs &&
          updatedData.secondInningScore === 0) {
        // Still inning 1.
        setCurrentInning(1);
      } else if (updatedData.firstInningScore > 0 && updatedData.secondInningScore >= 0) {
        // Assume that once second inning starts, currentInning becomes 2.
        setCurrentInning(2);
      }

      // Re-determine the teams based on current inning using the stored toss details.
      const dataForRoles = {
        teams: matchData.teamsRaw,
        tossSelection: matchData.tossSelection,
        tossWinner: matchData.tossWinner,
      };
      const { battingTeam, bowlingTeam } = getInningTeams(dataForRoles, currentInning);

      // Update the scoreboard accordingly.
      const updatedTeamsScoreData =
        currentInning === 1
          ? [
              {
                name: battingTeam.name,
                runs: updatedData.firstInningScore,
                wickets: updatedData.firstInningWicket,
                overs: updatedData.firstInningOver,
              },
              {
                name: bowlingTeam.name,
                runs: updatedData.secondInningScore,
                wickets: updatedData.secondInningWicket,
                overs: updatedData.secondInningOver,
              }
            ]
          : [
              // In inning 2, note that scores are for the new batting team.
              {
                name: battingTeam.name,
                runs: updatedData.secondInningScore, // Now the batting team is the team that bowled in inning 1.
                wickets: updatedData.secondInningWicket,
                overs: updatedData.secondInningOver,
              },
              {
                name: bowlingTeam.name,
                runs: updatedData.firstInningScore, // Their first inning scores remain (or might be used differently).
                wickets: updatedData.firstInningWicket,
                overs: updatedData.firstInningOver,
              }
            ];

      // Optionally update chaseInfo.
      const updatedChaseInfo =
        updatedData.status === "live" &&
        updatedData.firstInningScore &&
        updatedData.secondInningScore
          ? `${battingTeam.name} require ${
              updatedData.firstInningScore - updatedData.secondInningScore + 1
            } runs in ${updatedData.oversPerSide * 6 - (updatedData.secondInningOver) * 6} balls`
          : "";

      setMatchData((prevData) => ({
        ...prevData,
        teams: updatedTeamsScoreData,
        chaseInfo: updatedChaseInfo,
        status: updatedData.status,
      }));
    };

    socket.on("ballEventClient", handleScoreUpdate);

    return () => {
      socket.off("ballEventClient", handleScoreUpdate);
    };
  }, [currentInning, matchData]);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getCurrentInning = () => {
    if (!matchData) return 1;
    
    // If match is completed, return the last inning
    if (matchData.status === 'completed') {
      return matchData.secondInningScore ? 2 : 1;
    }
    
    // If first inning is being played (score exists but second doesn't)
    if (matchData.teams[0].runs > 0 && matchData.teams[1].runs === 0) {
      return 1;
    }
    
    // Otherwise it's second inning
    return 2;
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
          <span>{`${matchData.ground}, ${matchData.city}, ${matchData.matchType}`}</span>
          <span className="toss-info">{`Toss: ${matchData.tossWinnerTeamName} chose ${matchData.tossSelection}`}</span>
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
                    teams={teamsData}
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
                {/* <LiveStream isOrganiser={isOrganiser} /> */}
              </div>
            )}

            {activeTab === "SCORECARD" && <ScoreCardTab matchData={scoreCardData} />}
            {activeTab === "TEAMS" && <TeamsTab teams={matchData.teamsRaw} />}
            {/* Add other tabs as needed */}
          </div>
        </div>
      </div>

      <div className="main-content-wrapper">
        <div className="main-content">
          <div className="right-column">
            <LiveStream isOrganiser={isOrganiser} matchData={matchData} currentInning={currentInning} />
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
                  <h4>Officials</h4>
                  <p>
                    <strong>Organiser:</strong>{" "}
                    {matchData.organiserName} (ID: {matchData.organiserId})
                  </p>
                  <p>
                    <strong>Scorer:</strong>{" "}
                    {matchData.scorerName} (ID: {matchData.scorerId})
                  </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Match;
