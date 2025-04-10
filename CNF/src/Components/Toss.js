import React, { useState, useRef } from "react";
import { useParams,useNavigate } from "react-router-dom";
// import "./Toss.css";

const Toss = () => {
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");
  const [coinResult, setCoinResult] = useState("");
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const coinRef = useRef(null);
  const Navigate=useNavigate();
  const {matchId}=useParams();
  const flipCoin = () => {
    if (isFlipping) return;
    
    setIsFlipping(true);
    setCoinResult("");
    setFlipCount(flipCount + 1);
    
    // Reset animation
    coinRef.current.style.animation = 'none';
    void coinRef.current.offsetWidth;
    
    // Random rotation (5-7 full rotations)
    const rotations = 5 + Math.floor(Math.random() * 3);
    const flipTime = 2.5;
    
    // Start flipping animation
    coinRef.current.style.setProperty('--rotations', rotations);
    coinRef.current.style.animation = `flip-coin ${flipTime}s cubic-bezier(0.2, 0.8, 0.4, 1) forwards`;
    
    setTimeout(() => {
      const result = Math.random() < 0.5 ? "heads" : "tails";
      setCoinResult(result);
      setIsFlipping(false);
      
      // Gentle landing effect
      coinRef.current.style.transform = `rotateY(${result === 'heads' ? 0 : 180}deg) translateY(-5px)`;
      setTimeout(() => {
        coinRef.current.style.transform = `rotateY(${result === 'heads' ? 0 : 180}deg) translateY(0)`;
      }, 200);
    }, flipTime * 1000);
  };

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
    <div className="toss-container">
      <div className="header">
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
          className="flip-btn" 
          onClick={flipCoin}
          disabled={isFlipping}
        >
          {isFlipping ? (
            <span className="spinner"></span>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i> 
              {flipCount > 0 ? 'Flip Again' : 'Flip Coin'}
            </>
          )}
        </button>
        
        {coinResult && (
          <div className={`result-display ${coinResult}`}>
            <p>
              <i className={`fas ${coinResult === 'heads' ? 'fa-crown' : 'fa-feather-alt'}`}></i>
              <span>{coinResult.toUpperCase()}!</span>
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-section team-selection">
          <label>
            <i className="fas fa-trophy"></i>
            Select Toss Winner
          </label>
          <div className="custom-select">
            <select 
              value={tossWinner} 
              onChange={(e) => setTossWinner(e.target.value)}
              required
            >
              <option value="">-- Select Team --</option>
              <option value="Team A">Team A</option>
              <option value="Team B">Team B</option>
            </select>
            <span className="select-arrow"></span>
          </div>
        </div>

        {tossWinner && (
          <div className="form-section decision-selection">
            <label>
              <i className="fas fa-flag"></i>
              Decision After Winning
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

        <button 
          type="submit" 
          className="proceed-btn"
          disabled={!tossWinner || !decision}
        >
          <i className="fas fa-paper-plane"></i>
          Submit Decision
        </button>
      </form>
    </div>
  );
};

export default Toss;