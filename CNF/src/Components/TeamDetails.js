// src/components/TeamDetails.jsx

import React, { useState, useEffect } from 'react';
import './TeamDetails.css';
import { useParams } from 'react-router-dom';
import { usePlayer } from "../PlayerContext";

const TeamDetails = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [joinKey, setJoinKey] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const { teamId } = useParams();
  const [teamData, setTeamData] = useState({});
  const { playerId } = usePlayer();

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/teams/${teamId}`);
        const data = await response.json();
        setTeamData(data);
        console.log(data);
        // Check membership
        setIsMember(
          data?.players?.some(player => player.playerId === playerId)
        );
      } catch (error) {
        console.error("Failed to fetch team data:", error);
      }
    };

    fetchTeam();
  }, [teamId, playerId]);

  // Find the captain object in the players array
  const captain = teamData.players?.find(p => p.playerId === teamData.captainId);
  const captainName = captain?.name || 'Unknown';

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/teams/${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinKey, teamId, playerId }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsMember(true);
        setShowJoinForm(false);
        alert("Welcome to the team! You're now a member.");
      } else {
        alert(data.message || "Invalid join key. Please contact the team captain.");
      }
    } catch (error) {
      console.error("Join request failed:", error);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="team-details-main-div">
      <div className="team-details-container">
        {/* Header */}
        <div className="team-header">
          <div className="team-logo-container">
            <img
              src="/Images/Colorful Abstract Illustrative Cricket Club Sports Logo.png"
              alt={`${teamData.name} logo`}
              className="team-logo"
            />
            <div className="team-rank"></div>
          </div>
          <div className="team-info">
            <h1>{teamData.name}</h1>
            <div className="team-meta">
              <span>
                <i className="fas fa-calendar-alt"></i> Founded:&nbsp;
                {teamData.createdAt
                  ? new Date(teamData.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Unknown'}
              </span>
              <span>
                <i className="fas fa-user-shield"></i> Captain:&nbsp;
                {captainName} ({teamData.captainId ?? 'N/A'})
              </span>
            </div>

            {/* Join button / member badge */}
            {!isMember && playerId !== 0 && (
              <button className="join-team-btn" onClick={() => setShowJoinForm(true)}>
                <i className="fas fa-plus-circle"></i> Join Team
              </button>
            )}
            {isMember && (
              <div className="member-badge-container">
                <div className="member-badge">
                  <i className="fas fa-check-circle"></i> Team Member
                </div>
                {playerId === 1 && teamData.joinKey && (
                  <div className="join-key-container">
                    <strong>Join Key:</strong> {teamData.joinKey}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Join form modal */}
        {showJoinForm && (
          <div className="join-team-modal" onClick={() => setShowJoinForm(false)}>
            <div className="join-team-form" onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowJoinForm(false)}>
                <i className="fas fa-times"></i>
              </button>
              <h3>Join {teamData.name}</h3>
              <form onSubmit={handleJoinTeam}>
                <div className="input-group">
                  <i className="fas fa-key"></i>
                  <input
                    type="password"
                    value={joinKey}
                    onChange={e => setJoinKey(e.target.value)}
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

        {/* Tabs */}
        <div className="team-tabs">
          <button
            className={activeTab === 'members' ? 'active' : ''} 
            onClick={() => setActiveTab('members')}
          >
            <i className="fas fa-users"></i> Squad
          </button>
          <button
            className={activeTab === 'matches' ? 'active' : ''}
            onClick={() => setActiveTab('matches')}
          >
            <i className="fas fa-calendar"></i> Fixtures
          </button>
          <button
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            <i className="fas fa-chart-bar"></i> Statistics
          </button>
        </div>

        {/* Content */}
        <div className="team-content">
          {activeTab === 'members' && (
            <div className="members-section">
              <h2 className="section-title">Team Squad</h2>
              <div className="players-grid">
                {teamData.players?.length > 0 ? (
                  teamData.players.map(player => (
                    <div key={player.playerId} className="player-card">
                      <div className="player-image-container">
                        <img
                          src="/Images/user_profile.png"
                          alt={player.name}
                          className="player-image"
                        />
                        {player.playerId === teamData.captainId && (
                          <div className="captain-badge">C</div>
                        )}
                      </div>
                      <div className="player-details">
                        <h3 className="player-name">{player.name}</h3>
                        <div className="player-role">{player.role}</div>
                        <div className="player-role">ID: {player.playerId}</div>
                        <div className="player-stats">
                          <div className="stat-item">
                            <span className="stat-label">Matches:</span>
                            <span className="stat-value">{player.matchesPlayed}</span>
                          </div>
                          {player.runs != null && (
                            <div className="stat-item">
                              <span className="stat-label">Runs:</span>
                              <span className="stat-value">{player.runs}</span>
                            </div>
                          )}
                          {player.wickets != null && (
                            <div className="stat-item">
                              <span className="stat-label">Wickets:</span>
                              <span className="stat-value">{player.wickets}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No players found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="matches-section">
              <h2 className="section-title">Recent Matches</h2>
              <div className="matches-container">
                {teamData.matches?.length > 0 ? (
                  teamData.matches.map(match => (
                    <div key={match.matchId} className="match-card">
                      <div className="match-tournament">
                        {match.tournamentId || "Friendly Match"}
                      </div>
                      <div className="match-date">
                        {new Date(match.startDate).toLocaleDateString()}
                      </div>
                      <div className="match-info-grid">
                        <div className="match-col">
                          <div className="match-item">Opponent Team: {match.opponentName}</div>
                          <div className="match-item">Venue: {match.ground}, {match.city}</div>
                          <div className="match-item">Overs: {match.oversPerSide}</div>
                          <div className="match-item">
                          <span className="label">Toss Winner:</span>{" "}
                          {match.tossWinner === teamData.teamId ? teamData.name : match.opponentName}

                          </div>
                        </div>
                        <div className="match-col">
                        <div className={`match-item status-${match.status}`}>
                          {match.status === "scheduled" && "Scheduled"}
                          {match.status === "live" && "Live"}
                          {match.status === "completed" && "Completed"}
                          {match.status === "abandoned" && "Abandoned"}
                        </div>

                          <div className="match-item">
                            <span className="label">Result:</span> {match.winnerType || "Pending"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No matches found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-section">
              <h2 className="section-title">Team Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{teamData.won}</div>
                  <div className="stat-label">Won</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{teamData.loss}</div>
                  <div className="stat-label">Lost</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{teamData.noResult}</div>
                  <div className="stat-label">Tied</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{teamData.players?.length}</div>
                  <div className="stat-label">Squad Members</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{teamData.matches?.length}</div>
                  <div className="stat-label">Matches Played</div>
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
