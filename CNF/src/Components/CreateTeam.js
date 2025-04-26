import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CreateTeam.css';

const CreateTeam = () => {
  const { playerId } = useParams(); // Extract playerId from the URL
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [location, setLocation] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [joinKey, setJoinKey] = useState('');
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    }
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!joinKey.trim()) {
      newErrors.joinKey = 'Join key is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const teamData = {
          name: teamName,
          location,
          profilePicture,
          joinKey,
          captainId:playerId,
          since: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          played: 0,
          won: 0,
          lost: 0,
          status: 'Ongoing',
        };

        const response = await fetch(`http://localhost:5000/api/players/${playerId}/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(teamData),
        });

        if (!response.ok) {
          throw new Error('Failed to create team');
        }

        setSubmitted(true);
        console.log('Team Created:', teamData);
        navigate(`/players/${playerId}/teams`);
      } catch (error) {
        console.error('Error creating team:', error);
        setErrors({ submit: 'Failed to create team. Please try again.' });
      }
    }
  };

  return (
    <div className="team-form-page">
      <div className="team-form-container">
        <h2>Create a New Team</h2>
        {submitted && (
          <p className="success-message">Team created successfully!</p>
        )}
        <form onSubmit={handleSubmit} className="team-form">
          <div className="form-group">
            <label htmlFor="teamName">Team Name</label>
            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className={errors.teamName ? 'input-error' : ''}
            />
            {errors.teamName && <span className="error">{errors.teamName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
              className={errors.location ? 'input-error' : ''}
            />
            {errors.location && <span className="error">{errors.location}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profilePicture">Team Logo URL (Optional)</label>
            <input
              type="url"
              id="profilePicture"
              value={profilePicture}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="Enter logo URL (e.g., https://example.com/logo.png)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="joinKey">Join Key</label>
            <input
              type="text"
              id="joinKey"
              value={joinKey}
              onChange={(e) => setJoinKey(e.target.value)}
              placeholder="Enter a secret join key"
              className={errors.joinKey ? 'input-error' : ''}
            />
            {errors.joinKey && <span className="error">{errors.joinKey}</span>}
          </div>

          <button type="submit" className="submit-btn">
            Create Team
          </button>
          {errors.submit && <span className="error">{errors.submit}</span>}
        </form>

        {profilePicture && (
          <div className="logo-preview">
            <h3>Logo Preview</h3>
            <img
              src={profilePicture}
              alt="Team Logo Preview"
              onError={(e) => (e.target.src = 'https://via.placeholder.com/100?text=Invalid+URL')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTeam;
