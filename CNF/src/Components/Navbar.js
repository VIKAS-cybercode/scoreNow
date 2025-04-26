import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./Login"; // Auth0 Login
import LogoutButton from "./Logout"; // Auth0 Logout
import { usePlayer } from "../PlayerContext";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { playerId } = usePlayer();
  const { isAuthenticated } = useAuth0();

  const userDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Function to close dropdown on link click
  const handleUserLinkClick = () => {
    setUserMenuOpen(false);
  };

  return (
    <div className="navbar-container">
      {/* Logo */}
      <div className="logo" onClick={() => navigate("/")}>
        <img
          src="/Images/logo.png"
          alt="ScoreNow Logo" 
          className="logo-image"
        />ScoreNow</div>

      {/* Navbar Links */}
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/matches">Matches</Link></li>
          <li><Link to="/tournaments">Tournaments</Link></li>
          <li><Link to="/looking">Looking</Link></li>
          <li><Link to="/teams">Teams</Link></li>
          <li className="more-dropdown">
            More
            <ul className="dropdown">
              <li><Link to="/news">News</Link></li>
              {/* <li><Link to="/articles">Articles</Link></li> */}
              <li><Link to="/faq">FAQ</Link></li>
            </ul>
          </li>
        </ul>

        {/* Search Icon */}
        <span className="search-icon" onClick={() => setSearchVisible(!searchVisible)}>
          {searchVisible ? "❌" : "🔍"}
        </span>

        {searchVisible && (
          <div className="search-box active">
            <input type="text" placeholder="Search..." />
          </div>
        )}

        {/* Authenticated User Dropdown */}
        {isAuthenticated ? (
          <div className="user-dropdown" ref={userDropdownRef}>
            <div className="user-icon" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <img src="/Images/user_profile.png" className="profile-icon-logo" alt="Player Profile Icon" />
            </div>
            {userMenuOpen && (
              <ul className="user-menu">
                <li><Link to={`/players/${playerId}`} onClick={handleUserLinkClick}>Profile</Link></li>
                <li><Link to={`/players/${playerId}/chat`} onClick={handleUserLinkClick}>Chat</Link></li>
                <li><Link to={`/players/${playerId}/matches`} onClick={handleUserLinkClick}>My Matches</Link></li>
                <li><Link to={`/players/${playerId}/teams`} onClick={handleUserLinkClick}>My Teams</Link></li>
                <li><Link to={`/players/${playerId}/tournaments`} onClick={handleUserLinkClick}>My Tournaments</Link></li>
                <li><Link to={`/players/${playerId}/organisedMatches`} onClick={handleUserLinkClick}>Organised Matches</Link></li>
                <li><Link to={`/players/${playerId}/organisedTournaments`} onClick={handleUserLinkClick}>Organised Tournaments</Link></li>
                <li className="lgt-btn"><LogoutButton /></li>
              </ul>
            )}
          </div>
        ) : (
          <LoginButton />
        )}

        {/* Mobile Menu Toggle */}
        <button className="menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✖" : "☰"}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu">
          <ul>
            <li><Link to="/Matches">Matches</Link></li>
            <li><Link to="/Tournaments">Tournaments</Link></li>
            <li><Link to="/Looking">Looking</Link></li>
            <li><Link to="/Profile">Player Profile</Link></li>
            <li className="more-dropdown">
              More
              <ul className="dropdown">
                <li><Link to="/News">News</Link></li>
                <li><Link to="/Articles">Articles</Link></li>
                <li><Link to="/FAQ">FAQ</Link></li>
              </ul>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;
