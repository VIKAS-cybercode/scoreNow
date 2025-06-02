import React, { useState, useRef, useEffect } from "react";
import "./StartMatch.css";
import { useNavigate } from "react-router-dom";

const StartMatch = ({ teams = {}, matchId }) => {
  // Ensure each team has unique id, name, and players list
  const team1 = React.useMemo(() => ({
    teamId: (teams.team1 && teams.team1.teamId) || 1,
    name: (teams.team1 && teams.team1.name) || "Team 1",
    players: (teams.team1 && teams.team1.players) || []
  }), [teams.team1]);
  
  const team2 = React.useMemo(() => ({
    teamId: (teams.team2 && teams.team2.teamId) || 2,
    name: (teams.team2 && teams.team2.name) || "Team 2",
    players: (teams.team2 && teams.team2.players) || []
  }), [teams.team2]);
 // console.log(teams.team2.teamId);
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");
  const [coinResult, setCoinResult] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const coinRef = useRef(null);
  const navigate = useNavigate();

  // Instead of just a name, store the full team object in the popup state.
  const [showSquadPopup, setShowSquadPopup] = useState(null);

  // State to track selected players by team id
  const [selectedPlayers, setSelectedPlayers] = useState({
    [team1.teamId]: [],
    [team2.teamId]: [],
  });

  // Reset selections when teams change (if needed)
  useEffect(() => {
    setSelectedPlayers({
      [team1.teamId]: [],
      [team2.teamId]: [],
    });
  }, [team1.teamId, team2.teamId]);

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCoinResult("");
    setFlipCount((prev) => prev + 1);

    coinRef.current.style.animation = "none";
    void coinRef.current.offsetWidth;

    const rotations = 5 + Math.floor(Math.random() * 3);
    const flipTime = 2.5;
    coinRef.current.style.setProperty("--rotations", rotations);
    coinRef.current.style.animation = `flip-coin ${flipTime}s cubic-bezier(0.2, 0.8, 0.4, 1) forwards`;

    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      setCoinResult(result);
      setIsFlipping(false);
      coinRef.current.style.transform = `rotateY(${result === "heads" ? 0 : 180}deg) translateY(-5px)`;
      setTimeout(() => {
        coinRef.current.style.transform = `rotateY(${result === "heads" ? 0 : 180}deg) translateY(0)`;
      }, 200);
    }, flipTime * 1000);
  };

  // Ensure that the team object always has a players array
  const openSquadPopup = (team) => setShowSquadPopup({ ...team, players: team.players || [] });
  const closeSquadPopup = () => setShowSquadPopup(null);

  const toggleSelectPlayer = (playerId) => {
    if (!showSquadPopup) return;
    const currentTeamId = showSquadPopup.teamId;

    setSelectedPlayers((prevSelectedPlayers) => {
      const currentTeamSelection = prevSelectedPlayers[currentTeamId] || [];

      // Remove if already selected
      if (currentTeamSelection.includes(playerId)) {
        return {
          ...prevSelectedPlayers,
          [currentTeamId]: currentTeamSelection.filter((id) => id !== playerId),
        };
      }

      // Do not allow more than 11 players
      if (currentTeamSelection.length >= 11) {
        alert(`You can only select 11 players for ${showSquadPopup.name}!`);
        return prevSelectedPlayers;
      }

      // Add the player
      return {
        ...prevSelectedPlayers,
        [currentTeamId]: [...currentTeamSelection, playerId],
      };
    });
  };

  const isSquadComplete =
    selectedPlayers[team1.teamId]?.length === 11 &&
    selectedPlayers[team2.teamId]?.length === 11;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting:", {
        matchId,
        tossWinner,
        tossSelection: decision,
        squads: selectedPlayers // only player IDs are sent
      });

      const response = await fetch(`/api/matches/${matchId}/playingSquad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          tossWinner,
          tossSelection: decision,
          status: "live",
          squads: selectedPlayers, // only player IDs are sent
        }),
      });

      if (!response.ok) throw new Error("Failed to submit toss result");
      navigate(`/matches/${matchId}/score`);
    } catch (error) {
      console.error(error);
      alert("There was an error submitting the toss decision.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="combined-form">
      <div className="combined-container">
        {/* Toss Section */}
        <div className="toss-section">
          <div className="toss-header">
            <h2>Cricket Toss</h2>
            <div className="divider"></div>
          </div>

          <div className="coin-section">
            <div
              ref={coinRef}
              className={`coin ${isFlipping ? "flipping" : ""} ${coinResult}`}
              onClick={flipCoin}
            >
              <div className="coin-face coin-front">
                <div className="coin-content">
                  <i className="fas fa-crown"></i>
                  <span>HEADS</span>
                </div>
              </div>
              <div className="coin-face coin-back">
                <div className="coin-content">
                  <i className="fas fa-feather-alt"></i>
                  <span>TAILS</span>
                </div>
              </div>
              <div className="coin-edge"></div>
            </div>

            <button type="button" className="flip-btn" onClick={flipCoin} disabled={isFlipping}>
              {isFlipping ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <i className="fas fa-sync-alt"></i>
                  {flipCount > 0 ? "Flip Again" : "Flip Coin"}
                </>
              )}
            </button>

            {coinResult && (
              <div className={`result-display ${coinResult}`}>
                <p>
                  <i className={`fas ${coinResult === "heads" ? "fa-crown" : "fa-feather-alt"}`}></i>
                  <span>{coinResult.toUpperCase()}!</span>
                </p>
              </div>
            )}
          </div>

          <div className="form-section team-selection">
            <label>
              <i className="fas fa-trophy"></i> Select Toss Winner
            </label>
            <div className="custom-select">
              <select value={tossWinner} onChange={(e) => setTossWinner(e.target.value)} required>
                <option value="">-- Select Team --</option>
                <option value={team1.teamId}>{team1.name}</option>
                <option value={team2.teamId}>{team2.name}</option>
              </select>
              <span className="select-arrow"></span>
            </div>
          </div>

          {tossWinner && (
            <div className="form-section decision-selection">
              <label>
                <i className="fas fa-flag"></i> Decision After Winning
              </label>
              <div className="radio-group">
                {["bat", "bowl"].map((opt) => (
                  <label key={opt} className={decision === opt ? "active" : ""}>
                    <input
                      type="radio"
                      name="decision"
                      value={opt}
                      checked={decision === opt}
                      onChange={(e) => setDecision(e.target.value)}
                      required
                    />
                    <div className="radio-content">
                      <i className={`fas fa-baseball-${opt === "bat" ? "bat" : "ball"}`}></i>
                      <span>{opt === "bat" ? "Bat First" : "Bowl First"}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Squad Section */}
        <div className="squad-section">
          <div className="squad-header">
            <h2>Select Squad</h2>
            <div className="divider"></div>
          </div>

          <div className="squadTeams-container">
            <div className="team" key={team1.teamId}>
              <img
                src="/Images/Team1.png"
                alt={team1.name}
                className="team-logo"
                onError={(e) => (e.target.src = "/Images/Team1.png")}
              />
              <h3 className="team-name">{team1.name}</h3>
              <button
                type="button"
                onClick={() => openSquadPopup(team1)}
                className="choose-squad-btn"
              >
                Choose Squad
              </button>
              <p className="squad-count">
                {selectedPlayers[team1.teamId]?.length || 0} / 11 selected
              </p>
            </div>

            <span className="vs-text">VS</span>

            <div className="team" key={team2.teamId}>
              <img
                src="/Images/Team1.png"
                alt={team2.name}
                className="team-logo"
                onError={(e) => (e.target.src = "/Images/Team1.png")}
              />
              <h3 className="team-name">{team2.name}</h3>
              <button
                type="button"
                onClick={() => openSquadPopup(team2)}
                className="choose-squad-btn"
              >
                Choose Squad
              </button>
              <p className="squad-count">
                {selectedPlayers[team2.teamId]?.length || 0} / 11 selected
              </p>
            </div>
          </div>


          {showSquadPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <div className="popup-header">
                  <h3>Select 11 Players for {showSquadPopup.name}</h3>
                  <p className="selection-count">
                    Selected: {selectedPlayers[showSquadPopup.teamId]?.length || 0}/11
                  </p>
                </div>
                <ul className="player-list">
                  {(showSquadPopup.players || [])
                    .filter((player) => player)
                    .map((player) => {
                      const isSelected = selectedPlayers[showSquadPopup.teamId]?.includes(player.playerId);
                      return (
                        <li key={player.playerId} className={isSelected ? "selected-player" : ""}>
                          <div className="player-info">
                            <span className="player-id">ID: {player.playerId}</span>
                            <span className="squadPlayer-name">{player.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSelectPlayer(player.playerId)}
                            className={`select-btn ${isSelected ? "selected" : ""}`}
                          >
                            {isSelected ? "✓ Selected" : "Select"}
                          </button>
                        </li>
                      );
                    })}
                </ul>
                <div className="popup-actions">
                  <button type="button" onClick={closeSquadPopup} className="confirm-btn">
                    {selectedPlayers[showSquadPopup.teamId]?.length === 11 ? "Confirm" : "Close"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isSquadComplete && (
            <p className="squad-warning">Please select exactly 11 players for each team.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="combined-submit-btn"
        disabled={
          !tossWinner ||
          !decision ||
          selectedPlayers[team1.teamId]?.length !== 11 ||
          selectedPlayers[team2.teamId]?.length !== 11
        }
      >
        <i className="fas fa-paper-plane"></i> Submit
      </button>
    </form>
  );
};

export default StartMatch;
