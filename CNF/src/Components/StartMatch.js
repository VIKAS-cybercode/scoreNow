import React, { useState, useRef } from "react";
import "./StartMatch.css";
import { useNavigate } from "react-router-dom";

const StartMatch = ({ teams = {}, matchId }) => {
  const team1 = teams.team1 || { name: "Team 1", players: [] };
  const team2 = teams.team2 || { name: "Team 2", players: [] };

  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");
  const [coinResult, setCoinResult] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const coinRef = useRef(null);
  const navigate = useNavigate();

  const [showSquadPopup, setShowSquadPopup] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState({
    [team1.name]: [],
    [team2.name]: [],
  });

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

  const openSquadPopup = (teamName) => setShowSquadPopup(teamName);
  const closeSquadPopup = () => setShowSquadPopup(null);

  const toggleSelectPlayer = (playerId) => {
    const currentTeam = showSquadPopup;
    const currentSelection = selectedPlayers[currentTeam];

    const newSelection = currentSelection.includes(playerId)
      ? currentSelection.filter((p) => p !== playerId)
      : [...currentSelection, playerId];

    setSelectedPlayers({
      ...selectedPlayers,
      [currentTeam]: newSelection,
    });
  };

  const isSquadComplete =
    selectedPlayers[team1.name]?.length >= 11 &&
    selectedPlayers[team2.name]?.length >= 11;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tossWinner,
          tossSelection: decision,
          status: "live",
          squads: selectedPlayers,
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
            <label><i className="fas fa-trophy"></i> Select Toss Winner</label>
            <div className="custom-select">
              <select value={tossWinner} onChange={(e) => setTossWinner(e.target.value)} required>
                <option value="">-- Select Team --</option>
                <option value={team1.name}>{team1.name}</option>
                <option value={team2.name}>{team2.name}</option>
              </select>
              <span className="select-arrow"></span>
            </div>
          </div>

          {tossWinner && (
            <div className="form-section decision-selection">
              <label><i className="fas fa-flag"></i> Decision After Winning</label>
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

          <div className="teams-container">
            {[team1, team2].map((team) => (
              <div className="team" key={team.name}>
                <img
                  src={`/Images/${team.name.replace(/\s+/g, "")}.png`}
                  alt={team.name}
                  className="team-logo"
                />
                <h3 className="team-name">{team.name}</h3>
                <button
                  type="button"
                  onClick={() => openSquadPopup(team.name)}
                  className="choose-squad-btn"
                >
                  Choose Squad
                </button>
                <p className="squad-count">{selectedPlayers[team.name]?.length} / 11 selected</p>
              </div>
            ))}
            <span className="vs-text">VS</span>
          </div>

          {showSquadPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h3>Select Players for {showSquadPopup}</h3>
                <ul>
                  {(showSquadPopup === team1.name ? team1.players : team2.players).map((player, index) => {
                    const key = player?.playerId || player?.name || index;
                    const name = player?.name || `Player ${index + 1}`;
                    return (
                      <li key={key}>
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => toggleSelectPlayer(key)}
                          style={{
                            backgroundColor: selectedPlayers[showSquadPopup]?.includes(key) ? "#ffcc00" : "#333",
                            color: selectedPlayers[showSquadPopup]?.includes(key) ? "#121212" : "#ffcc00",
                          }}
                        >
                          {selectedPlayers[showSquadPopup]?.includes(key) ? "Selected" : "Select"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button type="button" onClick={closeSquadPopup} className="close-popup">
                  Close
                </button>
              </div>
            </div>
          )}

          {!isSquadComplete && (
            <p className="squad-warning">Please select at least 11 players for each squad.</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="combined-submit-btn"
        disabled={!tossWinner || !decision || !isSquadComplete}
      >
        <i className="fas fa-paper-plane"></i> Submit
      </button>
    </form>
  );
};

export default StartMatch;
