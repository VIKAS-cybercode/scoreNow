import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import './Teams.css';

const demoData = [
  {
    id: 1,
    name: '11 Kings',
    abbreviation: '1K',
    since: '03 May, 2023',
    played: 0,
    won: 0,
    lost: 0,
    status: 'Ongoing',
    location: 'Allahabad',
  },
  {
    id: 2,
    name: 'MNNIT Allahabad',
    abbreviation: 'MA',
    since: '14 Sep, 2024',
    played: 1,
    won: 1,
    lost: 0,
    status: 'Ongoing',
    location: 'Allahabad',
  },
  {
    id: 3,
    name: 'MNNIT Allahabad',
    abbreviation: 'MA',
    since: '16 Oct, 2024',
    played: 2,
    won: 0,
    lost: 2,
    status: 'Upcoming',
    location: 'Allahabad',
  },
  {
    id: 4,
    name: 'NIT Prayagraj',
    abbreviation: 'NP',
    since: '04 Jan, 2024',
    played: 0,
    won: 0,
    lost: 0,
    status: 'Upcoming',
    location: 'Prayagraj',
  },
  {
    id: 5,
    name: 'The Mavericks',
    abbreviation: 'TM',
    since: '15 Apr, 2023',
    played: 2,
    won: 1,
    lost: 1,
    status: 'Past',
    location: 'Lucknow',
  },
  {
    id: 6,
    name: 'The Mavericks',
    abbreviation: 'TM',
    since: '13 Apr, 2024',
    played: 2,
    won: 1,
    lost: 1,
    status: 'Past',
    location: 'Lucknow',
  },
];

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
      endpoint = 'http://localhost:5000/api/teams';
    } else if (location.pathname.startsWith('/players/')) {
      endpoint = `http://localhost:5000/api/players/${playerId}/teams`;
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
        setTeams(demoData); // Fallback to demo data
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
    <div className="myTeams-container">
      {teams.length === 0 ? (
        <div>No teams available</div>
      ) : (
        teams.map((team) => (
          <div
            key={team.id}
            className="team-card"
            onClick={() => handleTeamClick(team.id)}
          >
            <div className="team-status">{team.status}</div>
            <div className="team-logo">Logo</div>
            <div className="team-details">
              <h3>{team.name}</h3>
              <p>Since {team.since}</p>
              <p>{team.location}</p>
              <div className="team-stats">
                <span>Played {team.played}</span>
                <span>Won {team.won}</span>
                <span>Lost {team.lost}</span>
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
  );
};

export default Teams;
