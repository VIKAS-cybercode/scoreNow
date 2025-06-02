// LiveMatches.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./LiveMatches.css";

const allLocations = [
  "All",
  "Allahabad",
  "Azamgarh",
  "Gorakhpur",
  "Lucknow",
  "Kanpur",
  "Varanasi",
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bangalore",
  "Kolkata",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Ahmedabad",
  "Chandigarh",
  "Indore",
  "Patna",
  "Ranchi",
  "Bhopal",
  "Thiruvananthapuram",
  "Visakhapatnam",
  "Nagpur",
  "Dehradun",
  "Guwahati",
  "Surat",
  "Amritsar",
  "Vadodara",
  "Jammu",
  "Shimla",
  "Gangtok",
  "Bhubaneswar",
  "Panaji",
  "Agartala",
  "Itanagar",
  "Imphal",
  "Aizawl",
  "Kohima",
  "Shillong",
  "Pondicherry",
];

// Helper to determine batting order based on toss
function getInningsTeams(match) {
  const { tossSelection, tossWinner, team1, team2 } = match;
  const isTeam1Winner = team1.id === tossWinner?.id;
  let firstBattingTeam;
  let secondBattingTeam;

  if (!tossWinner || !tossSelection) {
    firstBattingTeam = team1.name;
    secondBattingTeam = team2.name;
  } else if (tossSelection === "bat") {
    // toss winner chooses to bat first
    firstBattingTeam = tossWinner.name;
    secondBattingTeam = isTeam1Winner ? team2.name : team1.name;
  } else {
    // toss winner fields first, so other team bats first
    firstBattingTeam = isTeam1Winner ? team2.name : team1.name;
    secondBattingTeam = tossWinner.name;
  }

  return { firstBattingTeam, secondBattingTeam };
}

const LiveMatches = () => {
  const Routelocation = useLocation();
  const { playerId } = useParams();
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [matches, setMatches] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const Navigate = useNavigate();
  const [locations, setLocations] = useState(allLocations);
  const [showCreateMatchButton, setShowCreateMatchButton] = useState(false);

  useEffect(() => {
    let endpoint = "";

    if (Routelocation.pathname === "/matches") {
      endpoint = "/api/matches";
      setShowCreateMatchButton(false);
    } else if (Routelocation.pathname === `/players/${playerId}/matches`) {
      endpoint = `/api/players/${playerId}/matches`;
      setShowCreateMatchButton(false);
    } else if (
      Routelocation.pathname === `/players/${playerId}/organisedMatches`
    ) {
      endpoint = `/api/players/${playerId}/organisedMatches`;
      setShowCreateMatchButton(true);
    } else {
      return;
    }

    const fetchMatches = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        console.log("Fetched data:", endpoint, data);

        const matchesArray = Array.isArray(data.matches) ? data.matches : [];
        setMatches(matchesArray);

        const locationSet = new Set(
          matchesArray.map((match) => {
            const loc = match.city?.split(",")[0]?.trim();
            return loc || "Unknown";
          })
        );
        setLocations(["All", ...Array.from(locationSet)]);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [Routelocation.pathname, playerId]);

  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(search.toLowerCase())
  );

  const filteredMatches = matches.filter((match) =>
    selectedLocation === "All" ? true : match.city?.includes(selectedLocation)
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="matches-page-container">
      <h2 className="matches-heading">
        Live Cricket Matches In{' '}
        <span className="LiveMatches-highlight" onClick={() => setShowPopup(true)}>{selectedLocation}</span>{' '}
      </h2>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <h2>Select Location</h2>
            <input
              type="text"
              className="search-bar"
              placeholder="Search location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="location-list">
              {filteredLocations.map((location, index) => (
                <p
                  className="location-list-p"
                  key={index}
                  onClick={() => {
                    setSelectedLocation(location);
                    setShowPopup(false);
                  }}
                >
                  {location}
                </p>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showCreateMatchButton && (
        <button
          className="create-match-btn"
          style={{ marginBottom: '1rem' }}
          onClick={() =>
            Navigate(`/players/${playerId}/CreateMatch`)
          }
        >
          + Create Match
        </button>
      )}

      <div className="matches-grid">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => {
            const { firstBattingTeam, secondBattingTeam } = getInningsTeams(match);
            return (
              <div
                key={match.id}
                className="matches-match-card"
                onClick={() => Navigate(`/matches/${match.id}`)}
              >
                <p className="tournament">
                  {match.tournament?.name || 'Friendly Match'}
                </p>

                <p className="location">
                  {match.city || 'Unknown City'},{' '}
                  {match.startDate
                    ? new Date(match.startDate).toLocaleDateString()
                    : 'Unknown Date'}
                  , {match.oversPerSide ? `${match.oversPerSide} overs` : ''}
                </p>

                {match.ground && <p className="stage">{match.ground}</p>}

                <h3 className="team1">
                  {firstBattingTeam}
                </h3>
                <p className="score">
                  {match.firstInning?.score ?? 0}/
                  {match.firstInning?.wickets ?? 0} ({match.firstInning?.overs})
                </p>

                <h3 className="team2">
                  {secondBattingTeam}
                </h3>
                {match.secondInning && (
                  <p className="score">
                    {match.secondInning.score ?? 0}/
                    {match.secondInning.wickets ?? 0} ({match.secondInning?.overs})
                  </p>
                )}

                <p className="toss">
                  {match.tossWinner
                    ? `${match.tossWinner.name} won the toss and chose to ${match.tossSelection}`
                    : 'Toss yet to happen'}
                </p>

                <span className="live-badge">
                  {match.status || 'Status Unknown'}
                </span>
              </div>
            );
          })
        ) : (
          <p>No live matches available for this location.</p>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;
