import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {usePlayer} from "../PlayerContext";
const CreateTournament = () => {
  const Navigate=useNavigate();
  const { playerId } = usePlayer();
  const [formData, setFormData] = useState({
    image: "",
    name: "",
    city: "Ahmedabad",
    ground: "",
    organiserPhoneNumber: "",
    startDate: "",
    endDate: "",
    tournamentCategory: "",
    matchType: "",
    ballType: "",
  });
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSelect = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      ...formData,
      organiserId: playerId, // assuming playerId is passed as a prop or obtained elsewhere
    };
  
    try {
      const response = await fetch("http://localhost:5000/api/tournaments/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const data = await response.json();
      console.log("Tournament created:", data);
      //alert("Tournament created successfully!");
      Navigate(`/tournaments/${data.tournament.tournamentId}`, {
        state: { tournamentData: data.tournament },
      });
      
    } catch (error) {
      console.error("Error creating tournament:", error);
      //alert("Something went wrong while creating the tournament.");
    }
  };
  

  return (
    <div className="container" style={{ marginTop: "100px" }}>

      <div className="card p-4 shadow-lg">
        <h2 className="text-center mb-4">Add a New Tournament</h2>
        <form onSubmit={handleSubmit}>
  <div className="row">
    <div className="col-md-6">
    <div className="mb-3">
      <input type="text" className="form-control" name="image" placeholder="Image URL (e.g., https://example.com/image.jpg)" value={formData.image} onChange={handleChange}/>
      {formData.image && (
        <div className="text-center mb-3">
          <img
            src={formData.image}
            alt="Tournament Banner Preview"
            className="img-fluid rounded"
            style={{ maxHeight: "200px" }}
          />
        </div>
      )}

    </div>
    
      <div className="mb-3">
        <input type="text" className="form-control" name="name" placeholder="Tournament Name" required onChange={handleChange} />
      </div>
                <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="city"
              placeholder="Enter City"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              name="ground"
              placeholder="Enter Ground"
              onChange={handleChange}
              required
            />
          </div>
      <div className="mb-3">
        <input type="text" className="form-control" name="organiserPhoneNumber" placeholder="Organiser Phone Number" required onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>Start Date</label>
        <input type="date" className="form-control" name="startDate" required onChange={handleChange} />
      </div>
      <div className="mb-3">
        <label>End Date</label>
        <input type="date" className="form-control" name="endDate" required onChange={handleChange} />
      </div>
    </div>

    <div className="col-md-6 text-center">
      <div className="mb-3">
        <p className="text-center mb-2">Select Ball Type:</p>
        {["Tennis", "Leather", "Other"].map((ball) => (
          <button
            key={ball}
            type="button"
            className={`btn me-1 ${formData.ballType === ball ? "btn-success" : "btn-outline-success"}`}
            onClick={() => handleSelect("ballType", ball)}
          >
            {ball}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <p className="text-center mb-2">Select Match Type:</p>
        {["Test", "T20", "ODI"].map((type) => (
          <button
            key={type}
            type="button"
            className={`btn me-1 ${formData.matchType === type ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => handleSelect("matchType", type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <p className="text-center mb-2">Tournament Category:</p>
        {["Open", "Corporate", "Community", "School", "Series"].map((cat) => (
          <button
            key={cat}
            type="button"
            className={`btn me-1 ${formData.tournamentCategory === cat ? "btn-secondary" : "btn-outline-secondary"}`}
            onClick={() => handleSelect("tournamentCategory", cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  </div>
  <button type="submit" className="btn btn-primary w-100 mt-3">Submit</button>
</form>

      </div>
    </div>
  );
};

export default CreateTournament;  
