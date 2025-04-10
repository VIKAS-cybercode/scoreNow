import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import "./Logout.css";

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <button
      className="logout-btn"
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Logout
    </button>
  );
};

export default LogoutButton;

