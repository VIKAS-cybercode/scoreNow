import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const CreateTournament = () => {
  const [formData, setFormData] = useState({
    tournamentName: "",
    city: "Ahmedabad",
    ground: "",
    organiserName: "",
    countryCode: "+91",
    organiserContact: "",
    allowContact: false,
    startDate: "",
    endDate: "",
    ballType: "",
    matchType: "",
    category: "",
    pitchType: "",
    tags: "",
    description: ""
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted", formData);
  };

  return (
    <div className="container" style={{ marginTop: "0px" }}>

      <div className="card p-4 shadow-lg">
        <h2 className="text-center mb-4">Add a New Tournament</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <input type="text" className="form-control" name="tournamentName" placeholder="Tournament Name" required onChange={handleChange} />
              </div>
              <div className="mb-3">
                <input type="text" className="form-control" name="organiserName" placeholder="Organiser Name" required onChange={handleChange} />
              </div>
              <div className="mb-3">
                <select className="form-select" name="city" onChange={handleChange} required>
                  <option value="Ahmedabad">Ahmedabad</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                </select>
              </div>
              <div className="mb-3">
                <select className="form-select" name="ground" onChange={handleChange} required>
                  <option value="">Select Ground</option>
                  <option value="ground1">Ground 1</option>
                  <option value="ground2">Ground 2</option>
                </select>
              </div>
              <div className="mb-3">
                <input type="text" className="form-control" name="organiserContact" placeholder="Organiser Contact" required onChange={handleChange} />
              </div>
              <div className="mb-3">
                <textarea className="form-control" name="description" placeholder="Enter tournament details..." rows="4" onChange={handleChange}></textarea>
              </div>
            </div>
            <div className="col-md-6 text-center">
              <div className="mb-3">
                <p className="text-center mb-2">Select Ball Type:</p>
                <button type="button" className={`btn ${formData.ballType === "Tennis" ? "btn-success" : "btn-outline-success"} me-1`} onClick={() => handleSelect("ballType", "Tennis")}> 
                  <img src="/images/tennis-ball.png" alt="Tennis Ball" width="30" className="me-1" /> Tennis
                </button>
                <button type="button" className={`btn ${formData.ballType === "Leather" ? "btn-warning" : "btn-outline-warning"} me-1`} onClick={() => handleSelect("ballType", "Leather")}> 
                  <img src="/images/leather-ball.png" alt="Leather Ball" width="30" className="me-1" /> Leather
                </button>
                <button type="button" className={`btn ${formData.ballType === "Other" ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => handleSelect("ballType", "Other")}>🔴 Other</button>
              </div>
              <div className="mb-3">
                <p className="text-center mb-2">Select Match Type:</p>
                {['Limited Overs', 'The Hundred', 'Test Match', 'T20', 'One Day'].map(type => (
                  <button type="button" className={`btn me-1 ${formData.matchType === type ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleSelect("matchType", type)}>{type}</button>
                ))}
              </div>
              <div className="mb-3">
                <p className="text-center mb-2">Select Tournament Category:</p>
                {['School', 'Community', 'Corporate', 'Open', 'Other'].map(category => (
                  <button type="button" className={`btn me-1 ${formData.category === category ? "btn-primary" : "btn-outline-primary"}`} onClick={() => handleSelect("category", category)}>{category}</button>
                ))}
              </div>
              <div className="mb-3">
                <p className="text-center mb-2">Select Pitch Type:</p>
                {['Rough', 'Cement', 'Turf', 'Astroturf', 'Matting'].map(pitch => (
                  <button type="button" className={`btn me-1 ${formData.pitchType === pitch ? "btn-secondary" : "btn-outline-secondary"}`} onClick={() => handleSelect("pitchType", pitch)}>{pitch}</button>
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
