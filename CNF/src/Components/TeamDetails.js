import React, { useState, useEffect } from 'react';
import './TeamDetails.css';
import { useParams } from 'react-router-dom';

const TeamDetails = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [joinKey, setJoinKey] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { teamId } = useParams();
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}`);
        const data = await response.json();
        setTeamData(data);
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      }
    };

    fetchTeam();
  }, [teamId]);

  // Static team data for display purposes
  const team = {
    name: "VASAVI KNIGHTS",
    logo: "https://cricheroes-media-mumbai.s3.ap-south-1.amazonaws.com/team_logo/1733668987727_Bo2fDkMKBGrr.jpg",
    description: "Competitive cricket team participating in KOMTI PREMIER LEAGUE with a strong batting lineup.",
    founded: "2020",
    captain: "Rahul Sharma",
    members: [
      { id: 1, name: "Rahul Sharma", role: "Captain", matches: 28, runs: 850, wickets: 12 },
      { id: 2, name: "Vikram Singh", role: "Vice Captain", matches: 25, runs: 620, wickets: 18 },
      { id: 3, name: "Arjun Patel", role: "Batsman", matches: 22, runs: 780 },
      { id: 4, name: "Neel Desai", role: "All-rounder", matches: 20, runs: 450, wickets: 22 },
      { id: 5, name: "Karan Malhotra", role: "Bowler", matches: 18, wickets: 30 },
      { id: 6, name: "Amit Joshi", role: "Wicket Keeper", matches: 15, runs: 320 },
      { id: 7, name: "Rohan Verma", role: "Batsman", matches: 12, runs: 380 },
      { id: 8, name: "Sanjay Gupta", role: "Bowler", matches: 10, wickets: 15 },
      { id: 9, name: "Prakash Mehta", role: "All-rounder", matches: 8, runs: 210, wickets: 8 },
      { id: 10, name: "Deepak Chavan", role: "Batsman", matches: 5, runs: 150 },
      { id: 11, name: "Rajesh Iyer", role: "Bowler", matches: 7, wickets: 12 },
      { id: 12, name: "Nitin Rao", role: "Batsman", matches: 9, runs: 280 }
    ],
    matches: [
      { 
        id: 1, 
        opponent: "VASAVI PANTHERS", 
        date: "2023-12-24", 
        venue: "Krida Sankool, Allapalli",
        result: "Lost by 10 wickets",
        score: "39/6 (8.0)",
        opponentScore: "41/0 (2.0)",
        tournament: "KOMTI PREMIER LEAGUE SESSION II",
        toss: "Lost",
        status: "Completed"
      },
      { 
        id: 2, 
        opponent: "FOREST STRIKERS", 
        date: "2023-12-18", 
        venue: "Krida Sankool, Allapalli",
        result: "Won by 24 runs",
        score: "145/5 (8.0)",
        opponentScore: "121/7 (8.0)",
        tournament: "KOMTI PREMIER LEAGUE SESSION II",
        toss: "Won",
        status: "Completed"
      }
      // Additional match objects...
    ],
    stats: {
      matchesPlayed: 28,
      matchesWon: 16,
      matchesLost: 11,
      matchesTied: 1,
      matchesDrawn: 1,
      matchesNR: 0,
      matchesUpcoming: 1,
      highestScore: "165/4 (8.0)",
      lowestScore: "39/6 (8.0)",
      bestBatsman: "Rahul Sharma (850 runs)",
      bestBowler: "Karan Malhotra (30 wickets)",
      currentRank: 3,
      tossWon: 12,
      tossLost: 16
    }
  };

  const handleJoinTeam = (e) => {
    e.preventDefault();
    if (joinKey === "KNIGHTS2023") {
      setIsMember(true);
      setShowJoinForm(false);
      alert("Welcome to VASAVI KNIGHTS! You're now a team member.");
    } else {
      alert("Invalid join key. Please contact the team captain.");
    }
  };

  return (
    <div className="team-details-main-div">
      <div className="team-details-container">
        <div className="team-header">
          <div className="team-logo-container">
            <img src={team.logo} alt={`${team.name} logo`} className="team-logo" />
            <div className="team-rank">#{team.stats.currentRank}</div>
          </div>
          <div className="team-info">
            <h1>{team.name}</h1>
            <div className="team-tournament-badge">KOMTI PREMIER LEAGUE</div>
            <p className="team-description">{team.description}</p>
            <div className="team-meta">
              <span><i className="fas fa-calendar-alt"></i> Founded: {team.founded}</span>
              <span><i className="fas fa-user-shield"></i> Captain: {team.captain}</span>
            </div>
            {!isMember ? (
              <button className="join-team-btn" onClick={() => setShowJoinForm(true)}>
                <i className="fas fa-plus-circle"></i> Join Team
              </button>
            ) : (
              <div className="member-badge">
                <i className="fas fa-check-circle"></i> Team Member
              </div>
            )}
          </div>
        </div>

        {showJoinForm && (
          <div
            className="join-team-modal"
            onClick={() => setShowJoinForm(false)}
          >
            <div
              className="join-team-form"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setShowJoinForm(false)}>
                <i className="fas fa-times"></i>
              </button>
              <div className="form-header">
                <h3>Join {team.name}</h3>
                <p>Enter the team key given by the captain</p>
              </div>
              <form onSubmit={handleJoinTeam}>
                <div className="input-group">
                  <i className="fas fa-key"></i>
                  <input
                    type="password"
                    value={joinKey}
                    onChange={(e) => setJoinKey(e.target.value)}
                    placeholder="Secret key"
                    required
                  />
                </div>
                <button type="submit" className="submit-btn">
                  <i className="fas fa-lock-open"></i> Unlock
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="team-tabs">
          <button className={activeTab === 'members' ? 'active' : ''} onClick={() => setActiveTab('members')}>
            <i className="fas fa-users"></i> Squad
          </button>
          <button className={activeTab === 'matches' ? 'active' : ''} onClick={() => setActiveTab('matches')}>
            <i className="fas fa-calendar"></i> Fixtures
          </button>
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
            <i className="fas fa-chart-bar"></i> Statistics
          </button>
        </div>

        <div className="team-content">
          {activeTab === 'members' && (
            <div className="members-section">
              <h2 className="section-title">Team Squad</h2>
              <div className="players-grid">
                {team.members.map(member => (
                  <div key={member.id} className="player-card">
                    <div className="player-image-container">
                      <img 
                        src="https://cricheroes-media-mumbai.s3.ap-south-1.amazonaws.com/default/user_profile.png" 
                        alt={member.name}
                        className="player-image"
                      />
                      {member.role === "Captain" && <div className="captain-badge">C</div>}
                      {member.role === "Vice Captain" && <div className="vice-captain-badge">VC</div>}
                    </div>
                    <div className="player-details">
                      <h3 className="player-name">{member.name}</h3>
                      <div className="player-role">{member.role}</div>
                      <div className="player-stats">
                        <div className="stat-item">
                          <span className="stat-label">Matches:</span>
                          <span className="stat-value">{member.matches}</span>
                        </div>
                        {member.runs && (
                          <div className="stat-item">
                            <span className="stat-label">Runs:</span>
                            <span className="stat-value">{member.runs}</span>
                          </div>
                        )}
                        {member.wickets && (
                          <div className="stat-item">
                            <span className="stat-label">Wickets:</span>
                            <span className="stat-value">{member.wickets}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="matches-section">
              <h2 className="section-title">Recent Matches</h2>
              <div className="matches-container">
                {team.matches.map(match => (
                  <div key={match.id} className="match-card">
                    <div className="match-tournament">{match.tournament}</div>
                    <div className="match-details">
                      <div className="match-date">
                        <i className="fas fa-calendar-day"></i> {new Date(match.date).toLocaleDateString()}
                      </div>
                      <div className="match-venue">
                        <i className="fas fa-map-marker-alt"></i> {match.venue}
                      </div>
                      <div className="match-toss">
                        <i className="fas fa-coin"></i> Toss: {match.toss}
                      </div>
                    </div>
                    <div className="match-result">{match.result}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-section">
              <h2 className="section-title">Team Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{team.stats.matchesWon}</div>
                  <div className="stat-label">Won</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{team.stats.matchesLost}</div>
                  <div className="stat-label">Lost</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{team.stats.matchesTied}</div>
                  <div className="stat-label">Tied</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{team.stats.matchesDrawn}</div>
                  <div className="stat-label">Drawn</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{team.stats.matchesNR}</div>
                  <div className="stat-label">NR</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{team.stats.matchesUpcoming}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
