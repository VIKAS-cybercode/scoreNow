import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PlayerForm.css";
import {usePlayer} from "../PlayerContext";
const locations = Array.from({ length: 100 }, (_, i) => `Location ${i + 1}`);

const PlayerForm = () => {
  const { setPlayerId , userSub} = usePlayer();
  const [formData, setFormData] = useState({
    name: "",
    gmail: "",
    profilePicture: "",
    location: "",
    role: "Batsman",
  });
  const Navigate=useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...formData,auth0Id:userSub}),
      });

      if (!res.ok) throw new Error("Failed to create player");

      const data = await res.json();

      setPlayerId(data.playerId); // assuming backend returns { playerId: "abc123" }
      Navigate(`/players/${data.playerId}`);
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an error submitting the form.");
    }
  };

  return (
    <div className="main-div-player-form">
        <div className="player-form-container">
      <h2>Personal Details</h2>
      <form className="player-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name:</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Profile Picture URL:</label>
          <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <select name="location" value={formData.location} onChange={handleChange}>
            <option value="" disabled>Select a location</option>
            {locations.map((loc, index) => (
              <option key={index} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="Batsman">Batsman</option>
            <option value="Bowler">Bowler</option>
            <option value="Allrounder">Allrounder</option>
            <option value="Wicketkeeper">Wicketkeeper</option>
          </select>
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
    </div>
  );
};

export default PlayerForm;
