import React, { useState, useEffect } from 'react';
import './Looking.css';
import { usePlayer } from '../PlayerContext';

const Looking = () => {
  const [notices, setNotices] = useState([]);
  const [location] = useState('Allahabad');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lookingFor: '',
    description: '',
    avatar: ''
  });
  const [filters, setFilters] = useState({
    Team: false,
    Player: false,
    Umpire: false,
    Scorer: false,
    Coach: false
  });
  const { playerId } = usePlayer();

  // Load existing entries from backend
  useEffect(() => {
    fetch('/api/lookings')
      .then(res => res.json())
      .then(data => {
        // Ensure we get an array — backend might return { data: [...] }
        if (Array.isArray(data)) {
          setNotices(data);
        } else if (Array.isArray(data.data)) {
          setNotices(data.data);
        } else {
          console.error("Unexpected data format:", data);
          setNotices([]);
        }
      })
      .catch(console.error);
  }, []);

  // Toggle sidebar filters
  const toggleFilter = type => {
    setFilters(f => ({ ...f, [type]: !f[type] }));
  };

  // Filter logic: if no filter active, show all
  const filteredList = () => {
    if (!Array.isArray(notices)) return [];

    const active = Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k]) => k);

    if (active.length === 0) return notices;
    return notices.filter(n => active.includes(n.lookingFor));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!playerId) return alert('🚫 You must be logged in to post.');

    const payload = {
      playerId,
      name: formData.name,
      lookingFor: formData.lookingFor,
      description: formData.description,
      location,
      avatarUrl: formData.avatar
    };

    try {
      const res = await fetch('/api/lookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error();
      const newNotice = await res.json();
      setNotices(prev => [newNotice, ...prev]);
      setShowModal(false);
      setFormData({ name: '', lookingFor: '', description: '', avatar: '' });
    } catch (err) {
      console.error(err);
      alert('⚠️ Submission failed.');
    }
  };

  // Optional: map types to border colors
  const borderColors = {
    Team: '#FFA500',
    Player: '#4CAF50',
    Umpire: '#FF4D4D',
    Scorer: '#1E90FF',
    Coach: '#9932CC'
  };

  return (
    <div className="looking-container">
      <aside className="filter-sidebar">
        <h3>Filters</h3>
        {Object.keys(filters).map(type => (
          <label key={type} className="checkbox-label">
            <input
              type="checkbox"
              checked={filters[type]}
              onChange={() => toggleFilter(type)}
            />
            {type === 'Team' ? 'Teams' : `${type}s`}
          </label>
        ))}
      </aside>

      <section className="notices-section">
        <h2 className="noticeHeading">
          Find Services & Products for Your Cricket Tournament{' '}
          <span className="highlight">({location})</span>
        </h2>

        {playerId !== 0 && playerId && (
          <button
            className="add-button"
            onClick={() => setShowModal(true)}
          >
            Add Looking
          </button>
        )}


        <div className="notices-grid">
          {filteredList().map(n => (
            <div
              key={n.id}
              className="notice-card"
              style={{
                borderLeft: `4px solid ${borderColors[n.lookingFor] || '#007bff'}`
              }}
            >
              <img
                // src={n.avatarUrl || 'https://via.placeholder.com/40'}
                src="/Images/user_profile.png"
                alt={n.name}
                className="avatar"
              />
              <div className="notice-content">
                <p>
                  <strong>{n.name}</strong> {n.description}
                </p>
                <span className="date">
                  {new Date(n.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showModal && (
        <div className="looking-modal-overlay">
          <div className="looking-modal">
            <h3>Add Requirements</h3>
            <form className="modal-form" onSubmit={handleSubmit}>
              <label>
                Your Name:
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Looking For:
                <select
                  name="lookingFor"
                  value={formData.lookingFor}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Team">Team</option>
                  <option value="Player">Player</option>
                  <option value="Umpire">Umpire</option>
                  <option value="Scorer">Scorer</option>
                  <option value="Coach">Coach</option>
                </select>
              </label>
              <label>
                Description:
                <textarea
  name="description"
  value={formData.description}
  onChange={handleChange}
  required
/>

              </label>
              <label>
                Avatar URL:
                <input
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                />
              </label>
              <div className="modal-buttons">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Looking;
