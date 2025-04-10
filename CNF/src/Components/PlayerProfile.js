import { useState,useEffect } from "react";
import { useParams } from "react-router-dom";
import "./PlayerProfile.css";
//import { usePlayer } from "../PlayerContext";
import PlayerForm from "./PlayerForm";
const PlayerProfile = () => {
  const { playerId } = useParams();
  const [activeTab, setActiveTab] = useState("matches");
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
   // If no playerId, show the form
  // const profileData = {
  //   name: "Mrinal Sharma",
  //   location: "Allahabad",
  //   views: 14,
  //   stats: {
  //     matches: 10,
  //     runs: 450,
  //     wickets: 15,
  //   },
  //   matches: [
  //     { id: 1, opponent: "Team A", score: "50 (30)" },
  //     { id: 2, opponent: "Team B", score: "32 (25)" },
  //   ],
  //   teams: ["Warriors", "Titans", "Blazers"],
  // };
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/players/id/${playerId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch player data");
        }
        const data = await response.json();
      console.log(data);

      setProfileData({
        name: data.name || "Unknown",
        location: data.location || "Not specified",
        profilePicture: data.profilePicture || "",
        role: data.role || "Unknown",
        matchesPlayed: data.matchesPlayed || 0,
        auth0Id: data.auth0Id || "",
        email: data.gmail || "",
        
        batting: data.batting?.[0] || {
          battingStyle: "Not specified",
          battingInnings: 0,
          runsScored: 0,
          ballsFaced: 0,
        },

        bowling: data.bowling?.[0] || {
          bowlingStyle: "Not specified",
          bowlingInnings: 0,
          wicketsTaken: 0,
          runsGiven: 0,
          overs: 0,
        },

        fielding: data.fielding?.[0] || {
          catches: 0,
          stumpings: 0,
          runOuts: 0,
        }
      });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId]);
  if (playerId==="0") {
    return <PlayerForm />;
  }
  if (loading) return <p>Loading player data...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!profileData) return <p>No player data found.</p>;
  return (
    <div className="profile-container">
      <div className="profile-header-stats">
        <div className="profile-header">
          <div className="profile-image">
            <img src="/Images/user_profile.png" alt="User Profile" />
          </div>
          <div className="profile-info">
            <h2>{profileData.name}</h2>
            <p>{profileData.location} • {profileData.role} Role</p>
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-box">
            <p className="stat-value">{profileData.matchesPlayed}</p>
            <p className="stat-label">Matches</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">{profileData.batting.ballsFaced}</p>
            <p className="stat-label">Runs</p>
          </div>
          <div className="stat-box">
            <p className="stat-value">{profileData.bowling.wicketsTaken}</p>
            <p className="stat-label">Wickets</p>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        {["matches", "stats", "teams"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "matches" && (
          <div>
            {/* {profileData.matches.length > 0 ? (
              <ul>
                {profileData.matches.map((match) => (
                  <li key={match.id}>{match.opponent} - {match.score}</li>
                ))}
              </ul>
            ) : ( */}
              <p className="dark-text">No matches found. Please change the filter.</p>
            {/* )} */}
          </div>
        )}
        {activeTab === "stats" && <p className="dark-text">Stats will be displayed here.</p>}
        {activeTab === "teams" && (
          <div>
            {/* {profileData.teams.length > 0 ? (
              <ul>
                {profileData.teams.map((team, index) => (
                  <li key={index}>{team}</li>
                ))}
              </ul>
            ) : ( */}
              <p className="dark-text">Teams information will be displayed here.</p>
            {/* )} */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile;
