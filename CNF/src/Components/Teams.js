import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Teams.css';

const Teams = () => {
  const { playerId } = useParams(); // Extract playerId from the URL
  const navigate = useNavigate();
  const [teams, setTeams] = useState([
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
  ]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/players/${playerId}/teams`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTeams(data); // Update state with fetched data
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        // Keep demo data if fetch fails
      }
    };

    fetchTeams();
  }, [playerId]); // Re-run effect if playerId changes

  const handleTeamClick = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  const handleCreateTeamClick = () => {
    navigate(`/players/${playerId}/createTeam`);
  };

  return (
    <div className="myTeams-container">
      {teams.map((team) => (
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
      ))}
      <button className="create-team-button" onClick={handleCreateTeamClick}>
        +  Create Team
      </button>
    </div>
  );
};

export default Teams;