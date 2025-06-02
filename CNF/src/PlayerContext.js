// PlayerContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [playerId, setPlayerId] = useState("0");
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Don't overwrite too early
    if (isAuthenticated && user) {
      fetch(`api/players/${user.sub}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.playerId) {
            console.log(data.playerId);
            setPlayerId(data.playerId);
          } else {
            setPlayerId(0); // Player not found, show form
            console.log(playerId);
          }
        })
        .catch(() => setPlayerId(0))
        .finally(() => setLoadingPlayer(false));
    } else {
      setPlayerId(0);
      setLoadingPlayer(false);
    }
    console.log(playerId);
  }, [isAuthenticated, user,authLoading,playerId]);

  return (
    <PlayerContext.Provider value={{ playerId, setPlayerId, loadingPlayer, authLoading, userSub:user?.sub || null }}>
      {children}
    </PlayerContext.Provider>
  );
};
