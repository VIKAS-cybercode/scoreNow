import React, { useState } from "react";
import "./Looking.css";

const notices = [
  {
    id: 1,
    name: "Abhishek Pandey",
    lookingFor: "Team",
    description: "is looking for a Team to join as an All-rounder (Right-arm fast) in Allahabad.",
    date: "3 days ago",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    borderColor: "#FFA500",
  },
  {
    id: 2,
    name: "Daya Shankar Tiwari",
    lookingFor: "Umpire",
    description: "is looking for an Umpire on Karchana Naini, Allahabad for a tournament on 20/10/2025.",
    date: "3 days ago",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    borderColor: "#4CAF50",
  },
  {
    id: 3,
    name: "Rahul Mishra",
    lookingFor: "Team",
    description: "is looking for a Team for their Tournament in Allahabad. The tournament begins on 15/04/2025.",
    date: "5 days ago",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg",
    borderColor: "#FF4D4D",
  },
  {
    id: 4,
    name: "Vikram Singh",
    lookingFor: "Scorer",
    description: "is looking for a Scorer for a tournament in Lucknow on 12/05/2025.",
    date: "2 days ago",
    avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    borderColor: "#1E90FF",
  },
  {
    id: 5,
    name: "Neha Verma",
    lookingFor: "Player",
    description: "is looking for a Player to join her team as an Opening Batsman in Delhi.",
    date: "1 day ago",
    avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    borderColor: "#FF69B4",
  },
  {
    id: 6,
    name: "Ankit Yadav",
    lookingFor: "Umpire",
    description: "is looking for an experienced Umpire for a weekend tournament in Mumbai.",
    date: "4 days ago",
    avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    borderColor: "#008000",
  },
  {
    id: 7,
    name: "Siddharth Sharma",
    lookingFor: "Team",
    description: "is looking for a team to play in an upcoming T20 tournament in Jaipur.",
    date: "6 days ago",
    avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    borderColor: "#FF4500",
  },
  {
    id: 8,
    name: "Pooja Desai",
    lookingFor: "Coach",
    description: "is looking for a Cricket Coach for an Under-15 girls' team in Ahmedabad.",
    date: "2 days ago",
    avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    borderColor: "#9932CC",
  },
  {
    id: 9,
    name: "Rohan Patel",
    lookingFor: "Scorer",
    description: "is looking for a scorer for a T10 league match in Bangalore on 18/06/2025.",
    date: "5 days ago",
    avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    borderColor: "#00CED1",
  },
  {
    id: 10,
    name: "Meera Khan",
    lookingFor: "Player",
    description: "is looking for a fast bowler to strengthen her team in Hyderabad.",
    date: "7 days ago",
    avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    borderColor: "#FFD700",
  },
];


const Looking = () => {
  const [location, setLocation] = useState("Allahabad");

  return (
    <div className="looking-container">
      {/* Sidebar */}
      <aside className="filter-sidebar">
        

        <h3>Filters</h3>
        <label className="checkbox-label">
          <input type="checkbox" /> Teams for Tournament
        </label>
        <label className="checkbox-label">
          <input type="checkbox" /> Players
        </label>
        <label className="checkbox-label">
          <input type="checkbox" /> Umpires
        </label>
        <label className="checkbox-label">
          <input type="checkbox" /> Scorers
        </label>
      </aside>

      {/* Notices Section */}
      <section className="notices-section">
        <h2 className="noticeHeading">
          Find Services & Products for Your Cricket Tournament{" "}
          <span className="highlight">({location})</span>
        </h2>
        <div className="notices-grid">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="notice-card"
              style={{ borderLeft: `4px solid ${notice.borderColor}` }}
            >
              <img src={notice.avatar} alt={notice.name} className="avatar" />
              <div className="notice-content">
                <p>
                  <strong>{notice.name}</strong> {notice.description}
                </p>
                <span className="date">{notice.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Looking;
