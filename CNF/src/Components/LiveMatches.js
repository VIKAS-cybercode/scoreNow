import React, { useState ,useEffect} from "react";
import { useParams,useLocation,useNavigate } from "react-router-dom";
import "./LiveMatches.css";

const allMatches = [
  {
    id:1,
    tournament: "DRM CUP INTER DEPARTMENTAL CRICKET TOURNAMENT",
    location: "DSA Railway Ground, Allahabad",
    date: "29-Mar-25",
    overs: "15 Ov.",
    stage: "SEMI FINAL",
    team1: "MECHANICAL (C & W)",
    team2: "ENGINEERING",
    score: "99/5 (12.3)",
    toss: "MECHANICAL (C & W) won the toss and elected to bat",
    status: "LIVE",
  },
  {
    id:2,
    tournament: "MNNIT Premiere League",
    location: "Mnnit Athletic Ground, Allahabad",
    date: "29-Mar-25",
    overs: "10 Ov.",
    stage: "PRE QUARTER FINAL",
    team1: "Senior Strikers",
    team2: "Dominators",
    score: "94/8 (10.0)",
    toss: "Senior Strikers won the toss and elected to bat",
    status: "LIVE",
  },
  {
    id:3,
    tournament: "Heroes 11 (H11) VS Lion Super Kings 11 (LSK11)",
    location: "Local Bamrauli Ground, Allahabad",
    date: "29-Mar-25",
    overs: "Test Match",
    stage: "4TH TEST",
    team1: "Heroes 11 (H11)",
    team2: "Lion Super Kings 11 (LSK11)",
    score: "6/0",
    toss: "Heroes 11 (H11) won the toss and elected to bat",
    status: "LIVE",
  },
  {
    id:4,
    tournament: "Individual Match",
    location: "Dav Cricket Ground, Lucknow",
    date: "29-Mar-25",
    overs: "45 Ov.",
    team1: "Farhat Ali Cricket Club",
    team2: "Prayag Cricket Academy",
    score: "407/7 (45.0)",
    score2: "267/6 (44.0)",
    toss: "Prayag Cricket Academy require 141 runs in 6 balls",
    status: "LIVE",
  },
];

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
  const { playerId} = useParams()
  const [selectedLocation, setSelectedLocation] = useState("Allahabad");
  const [matches, setMatches] = useState(allMatches);
  const [showPopup, setShowPopup] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const Navigate=useNavigate();
  const [locations, setLocations] = useState(allLocations);
  const [showCreateMatchButton,setShowCreateMatchButton]=useState(false);

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
        setMatches(data);
    
        // Extract unique locations from match data
        const locationSet = new Set(data.map((match) => {
          const loc = match.location?.split(",")[0]?.trim();
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

  
  // Filter matches based on selected location
  // const filteredMatches = matches.filter((match) =>
  //   selectedLocation === "All" ? true : match.location.includes(selectedLocation)
  // );

  // Filter locations based on search input
  const filteredLocations = locations.filter((location) =>
    location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="matches-container">
      <h2>
        Live Cricket Matches In <span className="highlight">{selectedLocation}</span>{" "}
        <span className="change" onClick={() => setShowPopup(true)}>(Change)</span>
      </h2>

      {/* Location Selection Popup */}
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
                <p key={index} onClick={() => { setSelectedLocation(location); setShowPopup(false); }}>
                  {location}
                </p>
              ))}
            </div>
            <button className="close-btn" onClick={() => setShowPopup(false)}>Close</button>
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

      {/* Match Cards */}
      <div className="matches-grid">
        {matches.length > 0 ? (
          matches.map((match) => (
            <div key={match.id} className="match-card"onClick={() => Navigate(`/matches/${match.id}`)}>

              <p className="tournament">{match.tournament}</p>
              <p className="location">{match.location}, {match.date}, {match.overs}</p>
              {match.stage && <p className="stage">{match.stage}</p>}
              <h3 className="team1">{match.team1}</h3>
              <h3 className="team2">{match.team2}</h3>
              <p className="score">{match.score}</p>
              {match.score2 && <p className="score">{match.score2}</p>}
              <p className="toss">{match.toss}</p>
              <span className="live-badge">{match.status}</span>
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
