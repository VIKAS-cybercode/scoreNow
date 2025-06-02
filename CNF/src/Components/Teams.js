import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Teams.css';


const Teams = () => {
  const { playerId } = useParams(); // Extract playerId from the URL
  const navigate = useNavigate();
  const location = useLocation(); // To determine which URL is being accessed
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let endpoint = '';

    // Determine the API endpoint based on the route
    if (location.pathname === '/teams') {
      endpoint = '/api/teams';
    } else if (location.pathname.startsWith('/players/')) {
      endpoint = `/api/players/${playerId}/teams`;
    }

    const fetchTeams = async () => {
      try {
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setTeams(data);
      } catch (error) {
        console.error('Request failed, showing demo data:', error);
        setTeams([]); // Fallback to demo data
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [location.pathname, playerId]);

  const handleTeamClick = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  const handleCreateTeamClick = () => {
    navigate(`/players/${playerId}/createTeam`);
  };

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner while fetching data
  }

  return (
    <div className="Teams-main-div">
    <h1 className="page-title"> All Teams</h1>
    <div className="myTeams-container">
      {teams.length === 0 ? (
        <div>No teams available</div>
      ) : (
        teams.map((team) => (
          <div
            key={team.teamId}
            className="team-card"
            onClick={() => handleTeamClick(team.teamId)}
          >
            
            <img src="/Images/teamLogo.png" alt="Team Logo" className="Teams-team-logo"/>
            <div className="team-details">
              <h3>{team.name}</h3>
              <p>Since {team.createdAt
                    ? new Date(team.createdAt).getFullYear()
                    : 'Unknown Date'}</p>
              <p>{team.location}</p>
              <div className="team-stats">
                <span>Played {team.matches}</span>
                <span>Won {team.won}</span>
                <span>Lost {team.loss}</span>
              </div>
            </div>
          </div>
        ))
      )}
      
      {/* Show the "Create Team" button only if playerId exists */}
      {playerId && (
        <button className="create-team-button" onClick={handleCreateTeamClick}>
          + Create Team
        </button>
      )}
    </div>
    </div>
  );
};

export default Teams;
