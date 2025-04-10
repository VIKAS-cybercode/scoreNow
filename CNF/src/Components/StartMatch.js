import React, { useState, useRef } from "react";
import "./StartMatch.css";
import { useParams,useNavigate } from "react-router-dom";

const StartMatch = () => {
  // Toss states
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");
  const [coinResult, setCoinResult] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const coinRef = useRef(null);
  const {matchId}=useParams();
  const Navigate=useNavigate();
  // Squad selection states
  const [showSquadPopup, setShowSquadPopup] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState({
    "THALTEJ TIGERS": [],
    "THE MAVERICKS": [],
  });

  // Toss coin flip handler
  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setCoinResult("");
    setFlipCount(flipCount + 1);
    
    // Reset animation
    coinRef.current.style.animation = "none";
    void coinRef.current.offsetWidth;
    
    // Random rotation (5-7 full rotations)
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

  // Squad popup handlers
  const openSquadPopup = (team) => {
    setShowSquadPopup(team);
  };

  const closeSquadPopup = () => {
    setShowSquadPopup(null);
  };

  const toggleSelectPlayer = (playerIndex) => {
    const currentTeam = showSquadPopup;
    const currentSelection = selectedPlayers[currentTeam];

    let newSelection;
    if (currentSelection.includes(playerIndex)) {
      newSelection = currentSelection.filter((p) => p !== playerIndex);
    } else {
      newSelection = [...currentSelection, playerIndex];
    }
    setSelectedPlayers({
      ...selectedPlayers,
      [currentTeam]: newSelection,
    });
  };

  // Check if both squads have at least 11 players
  const isSquadComplete =
    selectedPlayers["THALTEJ TIGERS"].length >= 11 &&
    selectedPlayers["THE MAVERICKS"].length >= 11;

  // // Combined form submission handler
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Process data as needed.
  //   alert(
  //     `Toss Winner: ${tossWinner}\nDecision: ${
  //       decision === "bat" ? "Bat First" : "Bowl First"
  //     }\nCoin Result: ${coinResult}\nSelected Squads: ${JSON.stringify(
  //       selectedPlayers,
  //       null,
  //       2
  //     )}`
  //   );
  // };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tossWinner:tossWinner,
          tossSelection:decision,
          status:"live",
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit toss result");
      }
  
      // Optional: Show a success toast or message
      Navigate(`/matches/${matchId}/score`);
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

            <button
              type="button"
              className="flip-btn"
              onClick={flipCoin}
              disabled={isFlipping}
            >
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
                  <i
                    className={`fas ${
                      coinResult === "heads" ? "fa-crown" : "fa-feather-alt"
                    }`}
                  ></i>
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
              <select
                value={tossWinner}
                onChange={(e) => setTossWinner(e.target.value)}
                required
              >
                <option value="">-- Select Team --</option>
                <option value="THALTEJ TIGERS">THALTEJ TIGERS</option>
                <option value="THE MAVERICKS">THE MAVERICKS</option>
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
                <label className={decision === "bat" ? "active" : ""}>
                  <input
                    type="radio"
                    name="decision"
                    value="bat"
                    checked={decision === "bat"}
                    onChange={(e) => setDecision(e.target.value)}
                    required
                  />
                  <div className="radio-content">
                    <i className="fas fa-baseball-bat bat-icon"></i>
                    <span>Bat First</span>
                  </div>
                </label>
                <label className={decision === "bowl" ? "active" : ""}>
                  <input
                    type="radio"
                    name="decision"
                    value="bowl"
                    checked={decision === "bowl"}
                    onChange={(e) => setDecision(e.target.value)}
                    required
                  />
                  <div className="radio-content">
                    <i className="fas fa-baseball-ball ball-icon"></i>
                    <span>Bowl First</span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Squad Selection Section */}
        <div className="squad-section">
          <div className="squad-header">
            <h2>Select Squad</h2>
            <div className="divider"></div>
          </div>

          <div className="teams-container">
            <div className="team">
              <img
                src="/Images/Team1.png"
                alt="Team 1"
                className="team-logo"
              />
              <h3 className="team-name">THALTEJ TIGERS</h3>
              <button
                type="button"
                onClick={() => openSquadPopup("THALTEJ TIGERS")}
                className="choose-squad-btn"
              >
                Choose Squad
              </button>
              <p className="squad-count">
                {selectedPlayers["THALTEJ TIGERS"].length} / 11 selected
              </p>
            </div>
            <span className="vs-text">VS</span>
            <div className="team">
              <img
                src="/Images/Team2.png"
                alt="Team 2"
                className="team-logo"
              />
              <h3 className="team-name">THE MAVERICKS</h3>
              <button
                type="button"
                onClick={() => openSquadPopup("THE MAVERICKS")}
                className="choose-squad-btn"
              >
                Choose Squad
              </button>
              <p className="squad-count">
                {selectedPlayers["THE MAVERICKS"].length} / 11 selected
              </p>
            </div>
          </div>

          {showSquadPopup && (
            <div className="popup-overlay">
              <div className="popup-content">
                <h3>Select Players for {showSquadPopup}</h3>
                <ul>
                  {[...Array(13).keys()].map((i) => (
                    <li key={i}>
                      <span>Player {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => toggleSelectPlayer(i + 1)}
                        style={{
                          backgroundColor: selectedPlayers[showSquadPopup].includes(
                            i + 1
                          )
                            ? "#ffcc00"
                            : "#333",
                          color: selectedPlayers[showSquadPopup].includes(i + 1)
                            ? "#121212"
                            : "#ffcc00",
                        }}
                      >
                        {selectedPlayers[showSquadPopup].includes(i + 1)
                          ? "Selected"
                          : "Select"}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={closeSquadPopup}
                  className="close-popup"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {!isSquadComplete && (
            <p className="squad-warning">
              Please select at least 11 players for each squad.
            </p>
          )}
        </div>
      </div>

      {/* Combined Submit Button */}
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


