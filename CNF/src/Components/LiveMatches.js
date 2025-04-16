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
      endpoint = "http://localhost:5000/api/matches";
      setShowCreateMatchButton(false);
    } else if (Routelocation.pathname === `/players/${playerId}/matches`) {
      endpoint = `http://localhost:5000/api/players/${playerId}/matches`;
      setShowCreateMatchButton(false);
    } else if (Routelocation.pathname === `/players/${playerId}/organisedMatches`) {
      endpoint = `http://localhost:5000/api/players/${playerId}/organisedMatches`;
      setShowCreateMatchButton(true);
    } else {
      return;
    }

    const fetchMatches = async () => {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        console.log("Fetched data:",endpoint, data);

        const matchesArray = Array.isArray(data.matches) ? data.matches : [];

        setMatches(matchesArray);

        const locationSet = new Set(matchesArray.map((match) => {
          const loc = match.city?.split(",")[0]?.trim();
          return loc || "Unknown";
        }));
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

  return (
    <div className="matches-container">
      <h2>
        Live Cricket Matches In{" "}
        <span className="highlight">{selectedLocation}</span>{" "}
        <span className="change" onClick={() => setShowPopup(true)}>
          (Change)
        </span>
      </h2>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
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
          style={{ marginBottom: "1rem" }}
          onClick={() => Navigate(`/players/${playerId}/CreateMatch`)}
        >
          + Create Match
        </button>
      )}

      <div className="matches-grid">
        {filteredMatches.length > 0 ? (
          filteredMatches.map((match) => (
            <div
              key={match.id}
              className="match-card"
              onClick={() => Navigate(`/matches/${match.id}`)}
            >
              <p className="tournament">{match.tournament || "Untitled Tournament"}</p>
              <p className="location">
                {match.city || "Unknown City"},{" "}
                {match.startDate
                  ? new Date(match.startDate).toLocaleDateString()
                  : "Unknown Date"},{" "}
                {match.oversPerSide ? `${match.oversPerSide} overs` : ""}
              </p>

              {match.ground && <p className="stage">{match.ground}</p>}

              <h3 className="team1">{match.team1?.name || "Team 1"}</h3>
              <h3 className="team2">{match.team2?.name || "Team 2"}</h3>

              <p className="score">
                {match.firstInning?.score ?? 0}{"/ "}
                {match.firstInning?.wickets ?? 0} wickets
              </p>

              {match.secondInning && (
                <p className="score">
                  {match.secondInning.score ?? 0}{"/ "}
                  {match.secondInning.wickets ?? 0} wickets
                </p>
              )}

              <p className="toss">
                {match.tossWinner
                  ? `${match.tossWinner.name} won the toss`
                  : "Toss yet to happen"}
              </p>
              <span className="live-badge">{match.status || "Status Unknown"}</span>
            </div>
          ))
        ) : (
          <p>No live matches available for this location.</p>
        )}
      </div>
    </div>
  );
};

export default LiveMatches;
