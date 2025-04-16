import React, { useState } from 'react';
import './TeamsTab.css';

const TeamsTab = ({ teams }) => {
  // Transform incoming teams object into the desired structure
  const teamPlayers = {};
  Object.values(teams).forEach(team => {
    teamPlayers[team.name] = team.players.map(player => ({
      id: player.playerId,
      name: player.name,
      photo: player.profilePicture || 'https://via.placeholder.com/80',
    }));
  });

  const teamNames = Object.keys(teamPlayers);
  const [selectedTeam, setSelectedTeam] = useState(teamNames[0]); // default to first team

  return (
    <div className="teams-container">
      {/* Team Tabs */}
      <div className="team-tabs">
        {teamNames.map((teamName) => (
          <button
            key={teamName}
            className={`team-tab ${selectedTeam === teamName ? 'active' : ''}`}
            onClick={() => setSelectedTeam(teamName)}
          >
            {teamName}
          </button>
        ))}
      </div>

      {/* Players Grid */}
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
