import React, { useState } from 'react';
import './ScoreCardTab.css';

const ScorecardTab = ({ innings, currentInning, battingTeam, bowlingTeam }) => {
  // selectedInning corresponds to either "inning1" or "inning2"
  const [selectedInning, setSelectedInning] = useState(`inning${currentInning}`);

  // Pick the stats for the selected inning
  const inningStats = innings[selectedInning] || {};

  // Determine if we're viewing the currentInning or the "other" tab
  const isDefaultInning = selectedInning === `inning${currentInning}`;

  // If on default inning: battingTeam bats, bowlingTeam bowls
  // Otherwise: swap them
  const battingSide = isDefaultInning ? battingTeam : bowlingTeam;
  const bowlingSide = isDefaultInning ? bowlingTeam : battingTeam;

  // Raw player arrays
  const batters = inningStats.batting || [];
  const bowlers = inningStats.bowling || [];

  // Compute SR & Eco
  const calculateStrikeRate = (runs = 0, balls = 0) =>
    balls > 0 ? ((runs / balls) * 100).toFixed(2) : '0.00';
  const calculateEconomy = (runs = 0, overs = 0) =>
    overs > 0 ? (runs / overs).toFixed(2) : '0.00';

  // Extras and total wickets
  const totalExtras = bowlers.reduce(
    (sum, { noBall = 0, wideBall = 0 }) => sum + noBall + wideBall,
    0
  );
  const totalWickets = bowlers.reduce(
    (sum, { wickets = 0 }) => sum + wickets,
    0
  );

  return (
    <div className="scorecard-container">
      {/* inning tabs */}
      <div className="inning-tabs">
        <button
          className={selectedInning === 'inning1' ? 'active' : ''}
          onClick={() => setSelectedInning('inning1')}
        >
          Inning 1
        </button>
        <button
          className={selectedInning === 'inning2' ? 'active' : ''}
          onClick={() => setSelectedInning('inning2')}
        >
          Inning 2
        </button>
      </div>

      <div className="team-section">
        {/* Batting */}
        <h2 className="section-title">{battingSide?.name || 'Batting'} – Batting</h2>
        <table className="score-table">
          <thead>
            <tr>
              <th>Name</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th>
            </tr>
          </thead>
          <tbody>
            {batters.map((b, i) => (
              <tr key={i}>
                <td>{b.batsmanName || b.name}</td>
                <td>{b.runs || 0}</td>
                <td>{b.ballsFaced || 0}</td>
                <td>{b.fours || 0}</td>
                <td>{b.sixes || 0}</td>
                <td>{calculateStrikeRate(b.runs, b.ballsFaced)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bowling */}
        <h2 className="section-title">{bowlingSide?.name || 'Bowling'} – Bowling</h2>
        <table className="score-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>O</th>
              <th>M</th>
              <th>R</th>
              <th>W</th>
              <th>NB</th>
              <th>WD</th>
              <th>Eco</th>
            </tr>
          </thead>
          <tbody>
            {bowlers.map((b, i) => (
              <tr key={i}>
                <td>{b.bowlerName || b.name}</td>
                <td>{b.overs || 0}</td>
                <td>{b.maidenOvers || 0}</td>
                <td>{b.runsGiven || 0}</td>
                <td>{b.wickets || 0}</td>
                <td>{b.noBall || 0}</td>
                <td>{b.wideBall || 0}</td>
                <td>{calculateEconomy(b.runsGiven, parseFloat(b.overs) || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Extras & Fall of Wickets */}
        <div className="score-info">
          <p><strong>Extras:</strong> {totalExtras}</p>
          <p><strong>Fall of Wickets:</strong> {totalWickets}</p>
        </div>
      </div>
    </div>
  );
};

export default ScorecardTab;
