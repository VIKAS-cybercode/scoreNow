import React, { useState ,useEffect} from 'react';
import './TeamDetails.css';
import { useParams } from 'react-router-dom';

const TeamDetails = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [joinKey, setJoinKey] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const {teamId}=useParams();
  const [teamData, setTeamData] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}`);
        const data = await response.json();
        setTeamData(data);
        // setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
        // setLoading(false);
      }
    };
    
    fetchTeam();
  }, [teamId]);
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
      },
      { 
        id: 3, 
        opponent: "ROYAL CHALLENGERS", 
        date: "2023-12-10", 
        venue: "Krida Sankool, Allapalli",
        result: "Lost by 5 wickets",
        score: "112/8 (8.0)",
        opponentScore: "113/5 (7.2)",
        tournament: "KOMTI PREMIER LEAGUE SESSION II",
        toss: "Lost",
        status: "Completed"
      },
      { 
        id: 4, 
        opponent: "TITAN CRICKETERS", 
        date: "2024-01-05", 
        venue: "Krida Sankool, Allapalli",
        result: "Won by 15 runs",
        score: "165/4 (8.0)",
        opponentScore: "150/6 (8.0)",
        tournament: "KOMTI PREMIER LEAGUE SESSION II",
        toss: "Won",
        status: "Completed"
      },
      { 
        id: 5, 
        opponent: "DYNAMO CHARGERS", 
        date: "2024-01-12", 
        venue: "Krida Sankool, Allapalli",
        result: "Match Drawn",
        score: "120/7 (8.0)",
        opponentScore: "120/6 (8.0)",
        tournament: "KOMTI PREMIER LEAGUE SESSION II",
        toss: "Lost",
        status: "Completed"
      },
      { 
        id: 6, 
        opponent: "PHOENIX CC", 
        date: "2024-01-20", 
        venue: "Krida Sankool, Allapalli",
        result: "Upcoming",
        score: "-",
        opponentScore: "-",
        tournament: "KOMTI PREMIER LEAGUE SESSION II",
        toss: "-",
        status: "Upcoming"
      }
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
    <div className="team-details-container">
      <div className="team-header">
        <div className="team-logo-container">
          <img src={team.logo} alt={`${team.name} logo`} className="team-logo" />
          <div className="team-rank">Rank #{team.stats.currentRank}</div>
        </div>
        <div className="team-info">
          <h1>{team.name}</h1>
          <div className="team-tournament-badge">KOMTI PREMIER LEAGUE</div>
          <p className="team-description">{team.description}</p>
          <div className="team-meta">
            <span><i className="fas fa-calendar-alt"></i> Founded: {team.founded}</span>
            <span><i className="fas fa-user-shield"></i> Captain: {team.captain}</span>
          </div>
          {!isMember && (
            <button className="join-team-btn" onClick={() => setShowJoinForm(true)}>
              <i className="fas fa-plus-circle"></i> Join Team
            </button>
          )}
          {isMember && (
            <div className="member-badge">
              <i className="fas fa-check-circle"></i> Team Member
            </div>
          )}
        </div>
      </div>

      {showJoinForm && (
        <div className="join-team-modal">
          <div className="join-team-form">
            <button className="close-btn" onClick={() => setShowJoinForm(false)}>
              <i className="fas fa-times"></i>
            </button>
            <div className="form-header">
              <h3>Join {team.name}</h3>
              <p>Enter the exclusive team key provided by the captain</p>
            </div>
            <form onSubmit={handleJoinTeam}>
              <div className="input-group">
                <i className="fas fa-key"></i>
                <input
                  type="password"
                  value={joinKey}
                  onChange={(e) => setJoinKey(e.target.value)}
                  placeholder="Enter secret key"
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                <i className="fas fa-lock-open"></i> Unlock Membership
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
            <h2 className="section-title">
              <i className="fas fa-users"></i> Team Squad
            </h2>
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
                        <span className="stat-label">Matches</span>
                        <span className="stat-value">{member.matches}</span>
                      </div>
                      {member.runs && (
                        <div className="stat-item">
                          <span className="stat-label">Runs</span>
                          <span className="stat-value">{member.runs}</span>
                        </div>
                      )}
                      {member.wickets && (
                        <div className="stat-item">
                          <span className="stat-label">Wickets</span>
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
            <h2 className="section-title">
              <i className="fas fa-calendar"></i> Recent Matches
            </h2>
            <div className="matches-container">
              {team.matches.map(match => (
                <div key={match.id} className={`match-card ${match.status === 'Upcoming' ? 'upcoming' : match.result.includes('Lost') ? 'lost' : match.result.includes('Won') ? 'won' : match.result.includes('Drawn') ? 'drawn' : 'tied'}`}>
                  <div className="match-tournament">{match.tournament}</div>
                  <div className="match-teams-horizontal">
                    <div className="team-horizontal">
                      <div className="team-logo-small">
                        <img src={team.logo} alt={team.name} />
                      </div>
                      <div className="team-info-horizontal">
                        <span className="team-name">{team.name}</span>
                        <div className="team-score">{match.score}</div>
                      </div>
                    </div>
                    <div className="vs-horizontal">vs</div>
                    <div className="team-horizontal">
                      <div className="team-logo-small">
                        <img src={`https://via.placeholder.com/50/2c3e50/FFFFFF?text=${match.opponent.split(' ').map(w => w[0]).join('')}`} alt={match.opponent} />
                      </div>
                      <div className="team-info-horizontal">
                        <span className="team-name">{match.opponent}</span>
                        <div className="team-score">{match.opponentScore}</div>
                      </div>
                    </div>
                  </div>
                  <div className="match-details">
                    <div className="match-venue">
                      <i className="fas fa-map-marker-alt"></i> {match.venue}
                    </div>
                    <div className="match-date">
                      <i className="fas fa-calendar-day"></i> {new Date(match.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    <div className="match-toss">
                      <i className="fas fa-coin"></i> Toss: {match.toss}
                    </div>
                  </div>
                  <div className="match-result">
                    {match.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="stats-section">
            <h2 className="section-title">
              <i className="fas fa-chart-bar"></i> Team Statistics
            </h2>
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">
                  <i className="fas fa-trophy"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.matchesWon}</div>
                  <div className="stat-label">Won</div>
                </div>
              </div>
              
              <div className="stat-card secondary">
                <div className="stat-icon">
                  <i className="fas fa-times"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.matchesLost}</div>
                  <div className="stat-label">Lost</div>
                </div>
              </div>
              
              <div className="stat-card accent">
                <div className="stat-icon">
                  <i className="fas fa-equals"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.matchesTied}</div>
                  <div className="stat-label">Tied</div>
                </div>
              </div>
              
              <div className="stat-card dark">
                <div className="stat-icon">
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.matchesDrawn}</div>
                  <div className="stat-label">Drawn</div>
                </div>
              </div>
              
              <div className="stat-card light">
                <div className="stat-icon">
                  <i className="fas fa-question"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.matchesNR}</div>
                  <div className="stat-label">NR</div>
                </div>
              </div>
              
              <div className="stat-card info">
                <div className="stat-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.matchesUpcoming}</div>
                  <div className="stat-label">Upcoming</div>
                </div>
              </div>
              
              <div className="stat-card primary">
                <div className="stat-icon">
                  <i className="fas fa-arrow-up"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.highestScore}</div>
                  <div className="stat-label">Highest Score</div>
                </div>
              </div>
              
              <div className="stat-card secondary">
                <div className="stat-icon">
                  <i className="fas fa-arrow-down"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.lowestScore}</div>
                  <div className="stat-label">Lowest Score</div>
                </div>
              </div>
              
              <div className="stat-card accent">
                <div className="stat-icon">
                  <i className="fas fa-bat"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.bestBatsman.split(' ')[0]}</div>
                  <div className="stat-label">Top Batsman</div>
                </div>
              </div>
              
              <div className="stat-card dark">
                <div className="stat-icon">
                  <i className="fas fa-baseball-ball"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.bestBowler.split(' ')[0]}</div>
                  <div className="stat-label">Top Bowler</div>
                </div>
              </div>
              
              <div className="stat-card light">
                <div className="stat-icon">
                  <i className="fas fa-coin"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.tossWon}</div>
                  <div className="stat-label">Toss Won</div>
                </div>
              </div>
              
              <div className="stat-card info">
                <div className="stat-icon">
                  <i className="fas fa-coin"></i>
                </div>
                <div className="stat-info">
                  <div className="stat-value">{team.stats.tossLost}</div>
                  <div className="stat-label">Toss Lost</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDetails;