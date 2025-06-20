// PlayerContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();

  const [playerId, setPlayerId] = useState(null); // Start as null
  const [loadingPlayer, setLoadingPlayer] = useState(true);

  useEffect(() => {
    // Don't fetch if auth is still loading
    if (authLoading) return;

    // Reset before fetch
    setLoadingPlayer(true);

    if (isAuthenticated && user?.sub) {
      fetch(`/api/players/${user.sub}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          console.log("Fetched playerId:", data.playerId);
          setPlayerId(data.playerId ?? 0); // 0 means show PlayerForm
        })
        .catch((err) => {
          console.error("Error fetching player:", err);
          setPlayerId(0);
        })
        .finally(() => {
          setLoadingPlayer(false);
        });
    } else {
      // Not authenticated
      setPlayerId(0);
      setLoadingPlayer(false);
    }
  }, [isAuthenticated, authLoading, user?.sub]);
  return (
    <PlayerContext.Provider
      value={{
        playerId,
        setPlayerId,
        loadingPlayer,
        authLoading,
        userSub: user?.sub ?? null,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
