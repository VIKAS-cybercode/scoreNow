import React, { useState } from "react";
import "./StartMatch.css";

const StartMatch = () => {
  const [showSquadPopup, setShowSquadPopup] = useState(null);



  const openSquadPopup = (team) => {
    setShowSquadPopup(team);
  };

  const closeSquadPopup = () => {
    setShowSquadPopup(null);
  };


  return (
    <div className="start-match-container">
      <h2 className="match-title">Start A Match</h2>
      <div className="teams-container">
        <div className="team">
          <img src="/Images/Team1.png" alt="Team 1" className="team-logo" />
          <h3 className="team-name">THALTEJ TIGERS</h3>
          <button onClick={() => openSquadPopup('Team 1')} className="choose-squad-btn">Choose Squad</button>
        </div>
        <span className="vs-text">VS</span>
        <div className="team">
          <img src="/Images/Team2.png" alt="Team 2" className="team-logo" />
          <h3 className="team-name">THE MAVERICKS</h3>
          <button onClick={() => openSquadPopup('Team 2')} className="choose-squad-btn">Choose Squad</button>
        </div>
      </div>
        
      <div className="match-actions">
        <button className="schedule-btn">SCHEDULE MATCH</button>
        <button className="next-btn">NEXT (TOSS)</button>
      </div>

      {showSquadPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Select Players for {showSquadPopup}</h3>
            <ul>
              {[...Array(13).keys()].map((i) => (
                <li key={i}>
                  <span>Player {i + 1}</span>
                  <button>Select</button>
                </li>
              ))}
            </ul>
            <button onClick={closeSquadPopup} className="close-popup">Close</button>
          </div>
        </div>
      )}
   </div>
  );
};

export default StartMatch;
