import React, { useState,useEffect } from "react";
import { useNavigate,useLocation,useParams } from "react-router-dom";
import "./Tournaments.css";

const tournamentsData = [
  { tournamentId: 1, name: "A.T. Flynn Memorial T20", startDate: "07-Dec-24 To 30-Mar-25", city: "Allahabad", status: "Ongoing", ballType: "Leather", category: "Open", logo: "https://via.placeholder.com/60" },
  { tournamentId: 2, name: "MNNIT Premiere League", startDate: "21-Mar-25 To 30-Mar-25", city: "Allahabad", status: "Ongoing", ballType: "Tennis", category: "Community", logo: "https://via.placeholder.com/60" },
  { tournamentId: 3, name: "Deeha Premier League", startDate: "17-Mar-25 To 30-Mar-25", city: "Allahabad", status: "Upcoming", ballType: "Leather", category: "School", logo: "https://via.placeholder.com/60" },
  { tournamentId: 4, name: "Alpha Cricket Championship", startDate: "05-Jan-25 To 20-Feb-25", city: "Lucknow", status: "Ongoing", ballType: "Leather", category: "Open", logo: "https://via.placeholder.com/60" },
  { tournamentId: 5, name: "Beta League", startDate: "12-Jan-25 To 28-Feb-25", city: "Kanpur", status: "Past", ballType: "Tennis", category: "Community", logo: "https://via.placeholder.com/60" },
  { tournamentId: 6, name: "Gamma Cricket Cup", startDate: "15-Feb-25 To 10-Mar-25", city: "Agra", status: "Upcoming", ballType: "Leather", category: "Corporate", logo: "https://via.placeholder.com/60" },
  { tournamentId: 7, name: "Delta Invitational", startDate: "01-Apr-25 To 15-May-25", city: "Allahabad", status: "Ongoing", ballType: "Tennis", category: "Open", logo: "https://via.placeholder.com/60" },
  { tournamentId: 8, name: "Epsilon Challenge", startDate: "08-Feb-25 To 30-Mar-25", city: "Varanasi", status: "Upcoming", ballType: "Leather", category: "School", logo: "https://via.placeholder.com/60" },
  { tournamentId: 9, name: "Zeta Cup", startDate: "10-Jan-25 To 25-Feb-25", city: "Bareilly", status: "Past", ballType: "Tennis", category: "Series", logo: "https://via.placeholder.com/60" },
  { tournamentId: 10, name: "Theta Tournament", startDate: "02-Mar-25 To 05-Apr-25", city: "Kanpur", status: "Ongoing", ballType: "Leather", category: "Community", logo: "https://via.placeholder.com/60" },
  { tournamentId: 11, name: "Iota Premier League", startDate: "10-Jan-25 To 10-Mar-25", city: "Agra", status: "Upcoming", ballType: "Tennis", category: "Corporate", logo: "https://via.placeholder.com/60" },
  { tournamentId: 12, name: "Kappa Knockout", startDate: "14-Feb-25 To 30-Mar-25", city: "Lucknow", status: "Past", ballType: "Leather", category: "School", logo: "https://via.placeholder.com/60" },
  { tournamentId: 13, name: "Lambda League", startDate: "20-Jan-25 To 10-Feb-25", city: "Allahabad", status: "Ongoing", ballType: "Tennis", category: "Open", logo: "https://via.placeholder.com/60" },
  { tournamentId: 14, name: "Mu Cup", startDate: "03-Mar-25 To 20-Apr-25", city: "Varanasi", status: "Upcoming", ballType: "Leather", category: "Corporate", logo: "https://via.placeholder.com/60" },
  { tournamentId: 15, name: "Nu Challenge", startDate: "07-Jan-25 To 15-Feb-25", city: "Bareilly", status: "Past", ballType: "Tennis", category: "Series", logo: "https://via.placeholder.com/60" }
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


const Tournaments = () => {
  const Navigate = useNavigate();
  const Routelocation = useLocation();
  const { playerId } = useParams();
  const [statusFilter, setStatusFilter] = useState("All");
  const [ballTypeFilter, setBallTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [tournaments, setTournaments] = useState(tournamentsData);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("Allahabad");
  const [locations, setLocations] = useState(allLocations);
  const [showCreateTournamentButton,setShowCreateTournamentButton]=useState(false);
  useEffect(() => {
    let endpoint = "";

    if (Routelocation.pathname === "/tournaments") {
      endpoint = "http://localhost:5000/api/tournaments";
      setShowCreateTournamentButton(false);
    } else if (Routelocation.pathname === `/players/${playerId}/tournaments`) {
      endpoint = `http://localhost:5000/api/players/${playerId}/tournaments`;
      setShowCreateTournamentButton(false);
    } else if (Routelocation.pathname === `/players/${playerId}/organisedTournaments`) {
      endpoint = `http://localhost:5000/api/players/${playerId}/organisedTournaments`;
      setShowCreateTournamentButton(true);
    } 
    else {
      return;
    }

    const queryParams = new URLSearchParams({
      status: statusFilter === "All" ? "" : statusFilter,
      ballType: ballTypeFilter,
      category: categoryFilter,
      location: selectedLocation === "All" ? "" : selectedLocation,
    });
  
    const fetchTournaments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${endpoint}?${queryParams.toString()}`);
        const data = await res.json();
        setTournaments(data);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTournaments();
  }, [Routelocation.pathname, playerId, statusFilter, ballTypeFilter, categoryFilter, selectedLocation]);

  useEffect(() => {
    if (!showPopup) return;
  
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/locations");
        const data = await res.json();
        setLocations(["All", ...data]);  // Include "All" manually
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
  
    fetchLocations();
  }, [showPopup]);
  // const filteredTournaments = tournaments.filter((tournament) => {
  //   return (
  //     (statusFilter === "All" || tournament.status === statusFilter) &&
  //     (!ballTypeFilter || tournament.ballType === ballTypeFilter) &&
  //     (!categoryFilter || tournament.category === categoryFilter) &&
  //     (selectedLocation === "All" || tournament.location === selectedLocation)
  //   );
  // });
  
  // Filter locations based on search input
  const filteredLocations =locations.filter((location) =>
    location.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="tournaments-container">
      {/* Left Side Filter */}
      <div className="filter-tournaments">
        <h2 className="filters-heading">FILTER</h2>

        {/* Status Filter */}
        <div className="filter-section">
          <h3 className="filter-subHeading"> Status</h3>
          {["All", "Ongoing", "Upcoming", "Past"].map((status) => (
            <label key={status}>
              <input type="radio" name="status" checked={statusFilter === status} onChange={() => setStatusFilter(status)} />
              {status}
            </label>
          ))}
        </div>

        {/* Ball Type Filter */}
        <div className="filter-section">
          <h3 className="filter-subHeading"> Ball Type</h3>
          {["Leather", "Tennis"].map((type) => (
            <label key={type}>
              <input type="radio" name="ballType" checked={ballTypeFilter === type} onChange={() => setBallTypeFilter(type)} />
              {type}
            </label>
          ))}
        </div>  

        {/* Category Filter */}
        <div className="filter-section">
          <h3 className="filter-subHeading"> Category</h3>
          {["Open", "Corporate", "Community", "School", "Series"].map((category) => (
            <label key={category}>
              <input type="radio" name="category" checked={categoryFilter === category} onChange={() => setCategoryFilter(category)} />
              {category}
            </label>
          ))}
        </div>

        {/* Clear Filters Button */}
        <button className="reset-filters" onClick={() => { 
          setStatusFilter("All"); 
          setBallTypeFilter(""); 
          setCategoryFilter(""); 
        }}>
          Clear Filters
        </button>
      </div>

      {/* Right Side Tournaments List */}
      <div className="tournaments-list">
      <h1 className="page-title"> All Domestic Cricket Tournaments in{" "}<span className="highlight clickable-location" onClick={() => setShowPopup(true)}> {selectedLocation} </span></h1>

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
      {showCreateTournamentButton && (
  <button
    className="create-Tournament-btn"
    style={{ marginBottom: "1rem" }}
    onClick={() => Navigate(`/players/${playerId}/createTournament`)}
  >
    + Create Tournament
  </button>
)}
        <div className="tournaments-grid">
          {tournaments.length > 0 ? (
            tournaments.map((tournament) => (
              <div key={tournament.tournamentId} className="tournament-card" onClick={() => Navigate(`/tournaments/${tournament.tournamentId}`)}>
                <img src="/Images/1737713021853_eXJnOmmGpx1o.jpg" alt="Tournament Logo" className="tournament-logo" />
                <div className="tournament-info">
                  <span className="status-badge">Live</span>
                  <h2 className="tournament-name-heading">{tournament.name}</h2>
                  <p className="tournament-date">{tournament.startDate}</p>
                  <p className="tournament-location">{tournament.city}</p>
                </div>
              </div>
            ))
          ) : <p className="no-results">No tournaments match the selected filters.</p>}
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
