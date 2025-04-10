import { useState } from "react";
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
  const {playerId}=usePlayer();
  const { isAuthenticated, user } = useAuth0(); // Get Auth0 user info

  return (
    <div className="navbar-container">
      {/* Logo */}
      <div className="logo" onClick={() => navigate("/")}>CricNow</div>

      {/* Navbar Links */}
      <nav className="navbar">
        <ul className="nav-links">
          <li><Link to="/matches">Matches</Link></li>
          <li><Link to="/tournaments">Tournaments</Link></li>
          <li><Link to="/looking">Looking</Link></li>
          <li className="more-dropdown">
            More
            <ul className="dropdown">
              <li><Link to="/news">News</Link></li>
              <li><Link to="/articles">Articles</Link></li>
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
          <div className="user-dropdown">
            <div className="user-icon" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <img src="/Images/user_profile.png" className="profile-icon-logo" alt="Player Profile Icon"/>
            </div>
            {userMenuOpen && (
              <ul className="user-menu">
                <li><Link to={`/players/${playerId}`}>Profile</Link></li>
                <li><Link to={`/players/${playerId}/matches`}>My Matches</Link></li>
                <li><Link to={`/players/${playerId}/teams`}>My Teams</Link></li>
                <li><Link to={`/players/${playerId}/tournaments`}>My Tournaments</Link></li>
                <li><Link to={`/players/${playerId}/organisedMatches`}>Organize Matches</Link></li>
                <li><Link to={`/players/${playerId}/organisedTournaments`}>Organized Tournaments</Link></li>
                <li><LogoutButton /></li>
              </ul>
            )}
          </div>
        ) : (
          <LoginButton />
        )}

        {/* Mobile Menu */}
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
