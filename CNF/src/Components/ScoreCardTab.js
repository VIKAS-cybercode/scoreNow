import React, { useState } from 'react';
import './ScoreCardTab.css';

const ScorecardTab = ({ matchData }) => {
  const [selectedInning, setSelectedInning] = useState('inning1');

  // Return early if matchData is not ready
  if (!matchData || !matchData.inning1 || !matchData.inning2) {
    return <div>Loading scorecard...</div>;
  }

  const { inning1, inning2 } = matchData;

  const innings = {
    inning1: { name: inning1.team || 'Team 1', data: inning1 },
    inning2: { name: inning2.team || 'Team 2', data: inning2 }
  };

  const {
    batters = [],
    bowlers = [],
    extras = 0,
    yetToBat = '',
    fallOfWickets = ''
  } = innings[selectedInning]?.data || {};

  return (
    <div className="scorecard-container">
      {/* Inning Tabs */}
      <div className="team-tabs">
        {Object.keys(innings).map((inning) => (
          <button
            key={inning}
            className={`team-tab ${selectedInning === inning ? 'active' : ''}`}
            onClick={() => setSelectedInning(inning)}
          >
            {innings[inning].name}
          </button>
        ))}
      </div>

      {/* Batters Table */}
      <div className="team-section">
        <h2 className="section-title">Batters</h2>
        <table className="score-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>
          <tbody>
            {batters.map((batter, idx) => (
              <tr key={idx}>
                <td className="highlight">{batter.name}</td>
                <td>{batter.r}</td>
                <td>{batter.b}</td>
                <td>{batter.fours}</td>
                <td>{batter.sixes}</td>
                <td>{batter.sr}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bowlers Table */}
        <h2 className="section-title">Bowlers</h2>
        <table className="score-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>O</th>
              <th>R</th>
              <th>W</th>
              <th>WD</th>
              <th>NB</th>
              <th>Eco</th>
            </tr>
          </thead>
          <tbody>
            {bowlers.map((bowler, idx) => (
              <tr key={idx}>
                <td>{bowler.name}</td>
                <td>{bowler.o}</td>
                <td>{bowler.r}</td>
                <td>{bowler.w}</td>
                <td>{bowler.wd}</td>
                <td>{bowler.nb}</td>
                <td>{bowler.eco}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Match Info */}
        <div className="score-info">
          <p><strong>Extras:</strong> ({extras})</p>
          <p><strong>Yet to Bat:</strong> {yetToBat}</p>
          <p><strong>Fall Of Wickets:</strong> {fallOfWickets}</p>
        </div>
      </div>
    </div>
  );
};

export default ScorecardTab;
