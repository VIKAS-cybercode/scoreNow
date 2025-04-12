import React, { useState } from 'react';
import './TeamsTab.css';

const teamPlayers = {
  'SAM FM': [
    { id: 'SAM001', name: 'Azeem', photo: 'https://via.placeholder.com/80' },
    { id: 'SAM002', name: 'Salman Sid', photo: 'https://via.placeholder.com/80' },
    { id: 'SAM003', name: 'Shareek', photo: 'https://via.placeholder.com/80' },
    { id: 'SAM004', name: 'Raj', photo: 'https://via.placeholder.com/80' }
  ],
  'Opponent FC': [
    { id: 'OPP001', name: 'Umar Turf', photo: 'https://via.placeholder.com/80' },
    { id: 'OPP002', name: 'Md Sadiq', photo: 'https://via.placeholder.com/80' },
    { id: 'OPP003', name: 'Ali Turf', photo: 'https://via.placeholder.com/80' },
    { id: 'OPP004', name: 'Zain', photo: 'https://via.placeholder.com/80' }
  ]
};

const TeamsTab = () => {
  const [selectedTeam, setSelectedTeam] = useState('SAM FM');
  const teams = Object.keys(teamPlayers);

  return (
    <div className="teams-container">
      {/* Toggle Tabs */}
      <div className="team-tabs">
        {teams.map((team) => (
          <button
            key={team}
            className={`team-tab ${selectedTeam === team ? 'active' : ''}`}
            onClick={() => setSelectedTeam(team)}
          >
            {team}
          </button>
        ))}
      </div>

      {/* Player Cards */}
      <div className="players-grid">
        {teamPlayers[selectedTeam].map((player) => (
          <div key={player.id} className="player-card">
            <img src={player.photo} alt={player.name} className="player-photo" />
            <div className="player-info">
              <h4>{player.name}</h4>
              <p>ID: {player.id}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamsTab;
