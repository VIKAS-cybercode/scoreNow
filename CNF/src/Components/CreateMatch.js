import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate and useParams
import "bootstrap/dist/css/bootstrap.min.css";

export default function CreateMatch() {
  const navigate = useNavigate();
  const { playerId } = useParams(); // Get playerId from the current route

  const [match, setMatch] = useState({
    tournamentId: "",
    team1Id: "",
    team2Id: "",
    matchType: "limitedOvers",
    oversPerSide: "0",
    oversPerBowler: "0",
    city: "",
    ground: "",
    startDate: "",
    ballType: "leather",
    status: "scheduled",
    officialName: "",
  });

  const [teams, setTeams] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTeamField, setSelectedTeamField] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [ballType, setBallType] = useState("Tennis");
  const [city, setCity] = useState("Ahmedabad");
  const [ground, setGround] = useState("");
  const [categoryType, setCategoryType] = useState("School");
  const [pitchType, setPitchType] = useState("Rough");
  useEffect(() => {
    if (match.tournamentId) {
      fetch(`http://localhost:5000/api/teams/${match.tournamentId}`)
        .then((res) => res.json())
        .then((data) => setTeams(data.length > 0 ? data : []))
        .catch(() => setTeams([]));
    } else {
      console.log("t");
      fetch("http://localhost:5000/api/teams/all")
        .then((res) => res.json())
        .then((data) => setTeams(data))
        .catch(() => setTeams([]));
    }
    
  }, [match.tournamentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMatch((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelect = (field, value) => {
    if (field === "ballType") {
      setBallType(value);
    } else if (field === "pitchType") {
      setPitchType(value);
    } else if (field === "category") {
      setCategoryType(value);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(match),
      });

      if (!response.ok) throw new Error("Failed to create match");

      const data = await response.json();
      console.log("Match Created:", data);

      // Redirect to /playerid/matches/matchid
      navigate(`/${playerId}/matches/${data.matchId}`);
    } catch (error) {
      console.error("Error creating match:", error);
    }
  };

  const openTeamPopup = (field) => {
    if (!match.tournamentId && teams.length === 0) return;
    setSelectedTeamField(field);
    setShowPopup(true);
  };

  const selectTeam = (teamId) => {
    setMatch((prev) => ({ ...prev, [selectedTeamField]: teamId }));
    setShowPopup(false);
  };

  return (
    <div className="container mt-4" >
      {showPopup && (
        <div className="position-fixed top-50 start-50 translate-middle bg-white p-4 border rounded shadow-lg" style={{ zIndex: 1050 }}>
          <h4>Select Team</h4>
          <input 
            type="text" 
            className="form-control mb-2" 
            placeholder="Search Teams..." 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul className="list-group">
            {teams.filter(team => team.name.toLowerCase().includes(searchTerm.toLowerCase())).map((team) => (
              <li key={team.teamId} className="list-group-item list-group-item-action" onClick={() => selectTeam(team.teamId)}>
                {team.name}
              </li>
            ))}
          </ul>
          <button className="btn btn-danger mt-2 w-100" onClick={() => setShowPopup(false)}>Close</button>
        </div>
      )}

      <div className="card p-4 shadow">
        <h2 className="mb-3" style={{ marginTop: '100px' }}>Create Match</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" name="tournamentId" className="form-control" placeholder="Tournament ID" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <button type="button" className="btn btn-secondary w-100" onClick={() => openTeamPopup("team1Id")}
              disabled={!match.tournamentId && teams.length === 0}>
              {match.team1Id ? `Selected Team: ${match.team1Id}` : "Choose Team 1"}
            </button>
          </div>
          <div className="mb-3">
            <button type="button" className="btn btn-secondary w-100" onClick={() => openTeamPopup("team2Id")}
              disabled={!match.tournamentId && teams.length === 0 }>
              {match.team2Id ? `Selected Team: ${match.team2Id}` : "Choose Team 2"}
            </button>
          </div>
          <div className="mb-3">
            <input type="text" name="officialName" className="form-control" placeholder="Official Name" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input type="text" name="scorerName" className="form-control" placeholder="scorer Name" onChange={handleChange} />
          </div>
          <div className="mb-3">
          <p className="text-center mb-2">Select Ball Type:</p>
          <button
            type="button"
            className={`btn ${ballType === "Tennis" ? "btn-success" : "btn-outline-success"} me-1`}
            onClick={() => handleSelect("ballType", "Tennis")}
          >
            <img src="/images/tennis-ball.png" alt="Tennis Ball" width="30" className="me-1" /> Tennis
          </button>
          <button
            type="button"
            className={`btn ${ballType === "Leather" ? "btn-warning" : "btn-outline-warning"} me-1`}
            onClick={() => handleSelect("ballType", "Leather")}
          >
            <img src="/images/leather-ball.png" alt="Leather Ball" width="30" className="me-1" /> Leather
          </button>
          <button
            type="button"
            className={`btn ${ballType === "Other" ? "btn-secondary" : "btn-outline-secondary"}`}
            onClick={() => handleSelect("ballType", "Other")}
          >
            🔴 Other
          </button>
        </div>

          <div className="mb-3">
            <input type="number" name="oversPerSide" className="form-control" placeholder="Overs Per Side" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input type="number" name="oversPerBowler" className="form-control" placeholder="Overs Per Bowler" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input type="text" name="city" className="form-control" placeholder="City" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input type="text" name="ground" className="form-control" placeholder="Ground" onChange={handleChange} />
          </div>
          <div className="mb-3">
            <input type="datetime-local" name="startDate" className="form-control" onChange={handleChange} />
          </div>
          {/* <div className="mb-3">
            <select name="ballType" className="form-select" onChange={handleChange}>
              <option value="leather">Leather</option>
              <option value="other">Other</option>
              <option value="tennis">Tennis</option>
            </select>
          </div> */}
           <div className="mb-3">
          <p className="text-center mb-2">Select Match Category:</p>
          {['School', 'Community', 'Corporate', 'Open', 'Other'].map(category => (
            <button
              key={category}
              type="button"
              className={`btn me-1 ${category === categoryType ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handleSelect("category", category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mb-3">
          <p className="text-center mb-2">Select Pitch Type:</p>
          {['Rough', 'Cement', 'Turf', 'Astroturf', 'Matting'].map(pitch => (
            <button
              key={pitch}
              type="button"
              className={`btn me-1 ${pitch === pitchType ? "btn-secondary" : "btn-outline-secondary"}`}
              onClick={() => handleSelect("pitchType", pitch)}
            >
              {pitch}
            </button>
          ))}
        </div>
          <button type="submit" className="btn btn-primary w-100">Create Match</button>
        </form>
      </div>
    </div>
  );
}
