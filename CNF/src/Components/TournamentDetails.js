import React, { useState ,useEffect} from "react";
import { useParams ,useNavigate} from "react-router-dom";
import "./TournamentDetails.css";

const AlltournamentData = {
  id: 1,
  name: "A.T. Flynn Memorial T20 Cricket Tournament 2024-25 (7th Edition)",
  location: "Allahabad",
  views: 7834,
  date: "07-Dec-2024 to 30-Mar-2025",
  totalMatches: 17,
  totalTeams: 6,
  logo: "https://via.placeholder.com/100",
  matches: [
    { id: 1, type: "Semi Final", status: "Past", team1: "Chappel Of Brotherly Love", score1: "146/10 (19.3)", team2: "St. Peters Church Muirabad", score2: "147/6 (17.3)" },
    { id: 2, type: "Semi Final", status: "Past", team1: "BHS", score1: "182/6 (20.0)", team2: "St. Pauls Church", score2: "148/9 (20.0)" },
    { id: 3, type: "League Match", status: "Past", team1: "BHS", score1: "176/8 (20.0)", team2: "St. Peters Church Muirabad", score2: "82/10 (13.4)" }
  ]
};

const TournamentDetails = () => {
  const {tournamentId} = useParams();
  const Navigate = useNavigate(); 
  const [activeTab, setActiveTab] = useState("matches");
  const [matchFilter, setMatchFilter] = useState("Completed");
  const [tournamentData, setTournamentData] = useState(AlltournamentData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await fetch(`/api/tournaments/${tournamentId}`);
        const data = await response.json();
        setTournamentData(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tournament data:", error);
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);
  return (
    <div className="tournament-details-container">
      {/* Header Section */}
      <div className="tournament-header">
        <img src={tournamentData.logo} alt="Tournament Logo" className="tournament-logo" />
        <div className="tournament-info-td">
          <h1>{tournamentData.name}</h1>
          <p>{tournamentData.location} • {tournamentData.views} Views</p>
          <p className="tournament-date-heading">{tournamentData.date}</p>
          <button className="contact-btn">CONTACT US</button>
        </div>
        <div className="stats">
          <div className="stat-box">
            <h2>{tournamentData.totalMatches}</h2>
            <p>Total Matches</p>
          </div>
          <div className="stat-box">
            <h2>{tournamentData.totalTeams}</h2>
            <p>Total Teams</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        {["Matches", "Leaderboard", "Points Table", "Stats", "CricHeroes", "Sponsors", "Teams", "Gallery", "About Us"].map((tab) => (
          <button key={tab} className={activeTab === tab.toLowerCase() ? "active" : ""} onClick={() => setActiveTab(tab.toLowerCase())}>
            {tab}
          </button>
        ))}
      </div>

      {/* Matches Section */}
      {activeTab === "matches" && (
        <div className="matches-section">
          <div className="match-filters">
            {["Live", "Upcoming", "Completed"].map((filter) => (
              <button key={filter} className={matchFilter === filter ? "active-filter" : ""} onClick={() => setMatchFilter(filter)}>
                {filter}
              </button>
            ))}
          </div>

          <div className="match-list">
            {tournamentData.matches
              .filter((match) => match.status === matchFilter || matchFilter === "Completed")
              .map((match) => (
                <div key={match.id} className="match-card" onClick={() => Navigate(`/matches/${match.id}`)}
                style={{ cursor: "pointer" }}>
                  <h3>{match.type}</h3>
                  <p><strong>{match.team1}</strong> {match.score1}</p>
                  <p><strong>{match.team2}</strong> {match.score2}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;
