import React, { useState } from "react";
import "./Why.css";

const Why = () => {
  const features = [
    { id: 1, title: "Live Scoring", description: "Get instant updates on ongoing matches.", image: "/Images/Scoring.jpeg" },
    { id: 2, title: "Scorecard", description: "Explore player performances and match outcomes.", image: "/Images/ScoreCard.jpeg" },
    { id: 3, title: "Organise Tournaments", description: "Seamlessly organise tournaments and plan better.", image: "/Images/OrganisedTournaments.jpeg" },
    { id: 4, title: "Live Streaming", description: "Get real-time cricket match updates.", image: "/Images/liveStream_resized.jpeg" },
    { id: 5, title: "Instant Messaging", description: "Chat in real-time and stay connected with players", image: "/Images/Chat.jpeg" },
    { id: 6, title: "CricInsights", description: "Get in-depth analysis of matches and players.", image: "/Images/CricInsights.jpeg" },
    { id: 7, title: "Highlights", description: "AI-generated match highlights.", image: "/Images/pika7.jpeg" },
    { id: 8, title: "Looking", description: "Find players, teams, umpires, and scorers.", image: "/Images/Looking.jpeg" }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [animationDirection, setAnimationDirection] = useState("slide-left");
  const [imageKey, setImageKey] = useState(0);

  const handleHover = (hoveredIndex) => {
    if (hoveredIndex === currentIndex) return;

    const newDirection = hoveredIndex > currentIndex ? "slide-left" : "slide-right";

    let index = currentIndex;
    const transitionImages = () => {
      if (index < hoveredIndex) {
        index++;
      } else if (index > hoveredIndex) {
        index--;
      }

      setAnimationDirection(""); // Reset animation
      setTimeout(() => {
        setAnimationDirection(newDirection);
        setCurrentIndex(index);
        setImageKey((prevKey) => prevKey + 1); // Force re-render
      }, 30);

      if (index !== hoveredIndex) {
        setTimeout(transitionImages, 30);
      }
    };

    transitionImages();
  };

  return (
    <div className="why-container">
      <h1 className="why-heading">Why ScoreNow?</h1>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "50px" }}>
        
        {/* Left Features */}
        <div className="features-left">
          {features.slice(0, 2).map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-item" onMouseEnter={() => handleHover(index)}
            >
              <h2 className="feature-title-heading">{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Image Container */}
        <div className="image-container-why">
          <div key={imageKey} className={`image-wrapper ${animationDirection}`}>
            <img 
              src={features[currentIndex].image} 
              alt="Feature Preview" 
              className="feature-image"
            />
          </div>
        </div>

        {/* Right Features */}
        <div className="features-right">
          {features.slice(2, 4).map((feature, index) => (
            <div 
              key={feature.id} 
              className="feature-item"
              onMouseEnter={() => handleHover(index + 2)}
            >
              <h2 className="feature-title-heading">{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Features in a Row */}
      <div className="features-bottom">
        {features.slice(4, 8).map((feature, index) => (
          <div 
            key={feature.id} 
            className="feature-item"
            onMouseEnter={() => handleHover(index + 4)}
          >
            <h2 className="feature-title-heading">{feature.title}</h2>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
      
    </div>
  );
};

export default Why;
