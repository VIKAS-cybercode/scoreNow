import React, { useState, useEffect,useMemo } from "react";
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
  const [innings, setInnings] = useState({ 
    inning1: { batting: [], bowling: [], partnership: "0(0)" },
    inning2: { batting: [], bowling: [], partnership: "0(0)" } });
  const [currentInning, setCurrentInning] = useState(1);
  const [latestBowlerId, setLatestBowlerId] = useState(null);
  const [teamsData, setTeamsData] = useState({
    team1: { teamId:null, name: "", players: [] },
    team2: { teamId:null, name: "", players: [] }
  });
  
  useEffect(() => {
    const handleInningOver = ({ inningData }) => {
      setCurrentInning(old => {
        const next = old + 1;
  
        // Ensure inningData exists and has proper defaults
        const safeInningData = inningData || {
          batting: [],
          bowling: [],
          partnership: "0(0)"
        };
  
        // seed the new inning's structure
        setInnings(prev => ({
          ...prev,
          [`inning${next}`]: {
            batting: safeInningData.batting,
            bowling: safeInningData.bowling,
            partnership: safeInningData.partnership
          }
        }));
  
        return next;
      });
    };
  
    socket.on("inningOverEventClient", handleInningOver);
    return () => socket.off("inningOverEventClient", handleInningOver);
  }, [socket]);
  

  // 2) Memoize the slice of state you actually want to render:
  const currentInningData = useMemo(() => {
    return innings[`inning${currentInning}`] || {
      batting: [],
      bowling: [],
      partnership: "0(0)"
    };
  }, [innings, currentInning]);
  useEffect(() => {
    const handleBowlingStats = (updatedData) => {
      setLatestBowlerId(updatedData.bowlerId);
      console.log("Bowling stats:", updatedData); // Better logging
      const overToBalls = (overStr) => {
        const [over, balls] = overStr.toString().split('.').map(Number);
        return over * 6 + (balls || 0);
      };
      
      const totalFirstInningBalls = overToBalls(updatedData.firstInningOver);
      const maxBalls =updatedData.oversPerSide * 6;
      
      const isSecondInning =
        updatedData.firstInningWicket === 10 ||
        totalFirstInningBalls >= maxBalls;
      
      const updatedInning = isSecondInning ? 2 : 1;

      setCurrentInning(updatedInning); // ✅ this updates for future renders

      // Use dynamic inningKey from `updatedInning`, not stale state
      const inningKey = `inning${updatedInning}`;
      const liveInningData = updatedData[inningKey] || {};
      
      setInnings(prev => ({
        ...prev,
        [inningKey]: {
          batting:     liveInningData?.batting     ?? prev[inningKey]?.batting     ?? [],
          bowling:     liveInningData?.bowling     ?? prev[inningKey]?.bowling     ?? [],
          partnership: liveInningData?.partnership ?? prev[inningKey]?.partnership ?? "0(0)"
        }
      }));

    };
  
    const handleBattingStats = (updatedData) => {
      console.log("Batting stats:",updatedData); // Better logging
      const overToBalls = (overStr) => {
        const [over, balls] = overStr.toString().split('.').map(Number);
        return over * 6 + (balls || 0);
      };
      
      const totalFirstInningBalls = overToBalls(updatedData.firstInningOver);
      const maxBalls =updatedData.oversPerSide * 6;
      
      const isSecondInning =
        updatedData.firstInningWicket === 10 ||
        totalFirstInningBalls >= maxBalls;
      
      const updatedInning = isSecondInning ? 2 : 1;

      setCurrentInning(updatedInning); // ✅ this updates for future renders

      // Use dynamic inningKey from `updatedInning`, not stale state
      const inningKey = `inning${updatedInning}`;
      const liveInningData = updatedData[inningKey] || {};
      
      setInnings(prev => ({
        ...prev,
        [inningKey]: {
          batting:     liveInningData?.batting     ?? prev[inningKey]?.batting     ?? [],
          bowling:     liveInningData?.bowling     ?? prev[inningKey]?.bowling     ?? [],
          partnership: liveInningData?.partnership ?? prev[inningKey]?.partnership ?? "0(0)"
        }
      }));
    };
  
    // Add listeners
    socket.on("bowlingStatsClient", handleBowlingStats);
    socket.on("battingStatsClient", handleBattingStats);
  
    // Cleanup function
    return () => {
      socket.off("bowlingStatsClient", handleBowlingStats);
      socket.off("battingStatsClient", handleBattingStats);
    };
  }, [currentInning,matchId]);
  // Transform match data from API
  const getInningTeams = (data, inning) => {
    const team1 = data.teams.team1;
    const team2 = data.teams.team2;
    const tossSelection = data?.tossSelection?.toLowerCase() || "";
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
        //const inning = data.secondInningOver > 0 || data.status === "completed" ? 2 : 1;
        //setCurrentInning(inning);
        setInnings({
          inning1: data.inning1,
          inning2: data.inning2 || { batting: [], bowling: [], partnership: "0(0)" }
        });


        // Determine inning 1 teams for the initial scoreboard.
        const { battingTeam, bowlingTeam } = getInningTeams(data,currentInning);

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
        const remainingRuns = data.firstInningScore - data.secondInningScore + 1;
        const remainingBalls = data.oversPerSide * 6 - Math.floor(data.secondInningOver * 6);
        
        let chaseInfo = "";
        
        // Only compute chaseInfo in the second inning (i.e. when currentInning !== 1)
        if (currentInning !== 1 && data.status === "live" 
            && data.firstInningScore != null 
            && data.secondInningScore != null) 
        {
          if (remainingRuns <= 0) {
            const wicketsRemaining = 10 - data.secondInningWicket;
            chaseInfo = `${battingTeam.name} wins by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`;
          } 
          else if (remainingBalls <= 0) {
            const runsMargin = remainingRuns - 1;
            chaseInfo = `${bowlingTeam.name} wins by ${runsMargin} run${runsMargin !== 1 ? 's' : ''}`;
          } 
          else {
            chaseInfo = `${battingTeam.name} require ${remainingRuns} runs in ${remainingBalls} balls`;
          }
        }
        
        // if currentInning === 1, chaseInfo stays as ""
         

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
      const overToBalls = (overStr) => {
        const [over, balls] = overStr.toString().split('.').map(Number);
        return over * 6 + (balls || 0);
      };
      
      const totalFirstInningBalls = overToBalls(updatedData.firstInningOver);
      const maxBalls = matchData.oversPerSide * 6;
      
      const isSecondInning =
        updatedData.firstInningWicket === 10 ||
        totalFirstInningBalls >= maxBalls;
      
      const updatedInning = isSecondInning ? 2 : 1;

      setCurrentInning(updatedInning); // ✅ this updates for future renders

      // Use dynamic inningKey from `updatedInning`, not stale state
      const inningKey = `inning${updatedInning}`;
      const liveInningData = updatedData[inningKey] || {};
      
      setInnings(prev => ({
        ...prev,
        [inningKey]: {
          batting:     liveInningData?.batting     ?? prev[inningKey]?.batting     ?? [],
          bowling:     liveInningData?.bowling     ?? prev[inningKey]?.bowling     ?? [],
          partnership: liveInningData?.partnership ?? prev[inningKey]?.partnership ?? "0(0)"
        }
      }));
      
      // Determine current inning
      // setCurrentInning(prev => {
      //   if (updatedData.firstInningScore !== matchData?.teams[0].runs && updatedData.secondInningScore === 0) return 1;
      //   return 2;
      // });
      // if (updatedData.firstInningScore !== matchData?.teams[0].runs &&
      //     updatedData.secondInningScore === 0) {
      //   // Still inning 1.
      //   setCurrentInning(1);
      // } else if (updatedData.firstInningScore > 0 && updatedData.secondInningScore >= 0) {
      //   // Assume that once second inning starts, currentInning becomes 2.
      //   setCurrentInning(2);
      // }

      // Re-determine the teams based on current inning using the stored toss details.
      const dataForRoles = {
        teams: matchData.teamsRaw,
        tossSelection: matchData.tossSelection,
        tossWinner: matchData.tossWinner,
      };
      const { battingTeam, bowlingTeam } = getInningTeams(dataForRoles, updatedInning);

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
      const remainingRuns = updatedData.firstInningScore - updatedData.secondInningScore + 1;
      const remainingBalls = updatedData.oversPerSide * 6 - updatedData.secondInningOver * 6;

      let updatedChaseInfo = "";

      if (
        currentInning !== 1 && updatedData.status === "live" &&
        updatedData.firstInningScore != null &&
        updatedData.secondInningScore != null
      ) {
        if (remainingRuns <= 0) {
          const wicketsRemaining = 10 - updatedData.secondInningWicket;
          updatedChaseInfo = `${battingTeam.name} wins by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`;
        } else if (remainingBalls <= 0) {
          const runsMargin = remainingRuns - 1;
          updatedChaseInfo = `${bowlingTeam.name} wins by ${runsMargin} run${runsMargin !== 1 ? 's' : ''}`;
        } else {
          updatedChaseInfo = `${battingTeam.name} require ${remainingRuns} runs in ${remainingBalls} balls`;
        }
      }

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
  
    return calculateRR(runs*6, (Math.floor(overs)*6+(overs-Math.floor(overs))*10)); // ✅ Now it calls the helper instead of itself
  };

  if (loading) return <div className="loading">Loading match details...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!matchData) return <div className="error">No match data found</div>;

  // const { formattedDate, formattedTime, formattedDay } = {
  //   formattedDate: currentTime.toISOString().split("T")[0],
  //   formattedTime: currentTime.toLocaleTimeString(),
  //   formattedDay: currentTime.toLocaleDateString("en-US", { weekday: "long" })
  // };

  return (
    <div className="match-container">
      <div className="upperDiv">
        <header className="tournament-header-match">
          <h1>{matchData.tournamentName}</h1>
          <div className="match-info">
          <span>{`${matchData.ground}, ${matchData.city}, ${matchData.matchType}`}</span>
          <span className="toss-info">{matchData.tossSelection? `Toss: ${matchData.tossWinnerTeamName} chose ${matchData.tossSelection}`: 'Toss has not yet been conducted'}</span>
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
                    teams={matchData.teamsRaw}
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
                  {(currentInningData.batting || []).filter(batter => batter.outStatus === "Not Out").map((batter, i) => (
                      <tr key={i}>
                        <td>{batter.batsmanName}{batter.onStrike && "*"}</td>
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
                    <tr>
                      <th>Bowler</th>
                      <th>O</th>
                      <th>M</th>
                      <th>R</th>
                      <th>W</th>
                      <th>Eco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(currentInningData.bowling || [])
                      .filter((_, i, arr) => arr.length < 2 || (Math.floor(arr[i].overs) * 6 + (arr[i].overs - Math.floor(arr[i].overs)) * 10) % 6 !== 0)
                      .map((bowler, i) => (
                        <tr key={i}>
                          <td>{bowler.bowlerName}</td>
                          <td>{bowler.overs}</td>
                          <td>{bowler.maidenOvers}</td>
                          <td>{bowler.runsGiven}</td>
                          <td>{bowler.wickets}</td>
                          <td>{calculateEconomy(bowler.runsGiven, (Math.floor(bowler.overs) * 6 + (bowler.overs - Math.floor(bowler.overs)) * 10))}</td>
                        </tr>
                      ))
                    }

                  </tbody>
                </table>
                <div className="current-partnership">
                  <strong>Current Partnership:</strong> {matchData.inning1?.partnership || '0(0)'}
                </div>
                {/* <LiveStream isOrganiser={isOrganiser} /> */}
              </div>
            )}

            {activeTab === "SCORECARD" && (() => {
              const { battingTeam, bowlingTeam } = getInningTeams({
                teams: matchData.teamsRaw,
                tossSelection: matchData.tossSelection,
                tossWinner: matchData.tossWinner
              }, currentInning);

              return (
                <ScoreCardTab
                  innings={innings}
                  currentInning={currentInning}
                  battingTeam={battingTeam}
                  bowlingTeam={bowlingTeam}
                />
              );
            })()}

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
                <span>{calculateCurrentRR()}</span>
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
