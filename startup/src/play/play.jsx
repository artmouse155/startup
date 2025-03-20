import React from "react";
import { AuthState } from "../login/authState";
import { Game } from "./game.jsx";
import { Lobby } from "./lobby.jsx";
import { ConnectionState } from "./connectionState";

const GAME_STATES = {
  LOBBY: 0,
  PLAY: 1,
  END: 2,
};

export function Play({ userData, setUserData, authState }) {
  // This is our websocket connection state
  const [connectionState, setConnectionState] = React.useState(
    ConnectionState.Connecting
  );
  const [connectionData, setConnectionData] = React.useState(null);

  React.useEffect(() => {
    if (connectionState == ConnectionState.Connecting) {
      console.log("🟡 Trying to connect to game server...");
      // Check local storage for a roomCode
      const roomCode = localStorage.getItem("roomCode");
      if (roomCode) {
        console.log("Found room code in local storage: ", roomCode);
        getConnectionData(roomCode);
      } else {
        console.log("No room code found in local storage");
        setConnectionState(ConnectionState.Disconnected);
      }
    } else if (connectionState == ConnectionState.Disconnected) {
      console.log("🔴 Disconnected from game server");
      setConnectionData(null);
      localStorage.removeItem("roomCode");
    } else if (connectionState == ConnectionState.Connected) {
      console.log("🟢 Connected to game server");
    }
  }, [connectionState]);
  // console.log("Auth State: ", authState);
  // console.log("Connection State: ", connectionState);
  // console.log("User Data: ", userData);
  function setWebSocket(roomCode) {
    if (roomCode) {
      localStorage.setItem("roomCode", roomCode);
      setConnectionState(ConnectionState.Connecting);
    } else {
      //alert("Closing WebSocket Connection");
      setConnectionState(ConnectionState.Disconnected);
    }
  }

  async function handleExit() {
    // Handles canceling as either a host or a person joining
    const response = await fetch("api/game/leave", {
      method: "delete",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 204) {
      setWebSocket(null);
    } else {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  async function getConnectionData(roomCode = null) {
    if (!roomCode) {
      if (connectionData && connectionData.roomCode) {
        roomCode = connectionData.roomCode;
      } else {
        alert("No room code specified");
        return;
      }
    }
    console.log("Getting connection data with room code", roomCode);
    const response = await fetch(`api/game/server/${roomCode}/connection/get`, {
      method: "post",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      console.log("⭐ Server Pinged! Connection Data: ", body);
      setConnectionData(body);
      localStorage.setItem("roomCode", body.roomCode);
      setConnectionState(ConnectionState.Connected);
    } else {
      const body = await response.json();
      setConnectionState(ConnectionState.Disconnected);
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  // Includes a button to get connection data and a button to start the game. Also a button to end the game
  function DebugButtons() {
    return (
      <div className="debug-buttons">
        <button onClick={() => getConnectionData()}>⟳ Ping Server</button>
      </div>
    );
  }

  function pingServer() {
    getConnectionData();
  }

  switch (authState) {
    case AuthState.Authenticated:
      switch (connectionState) {
        case ConnectionState.Connected:
          // If connectionData && connectionData.gameState == GAME_STATES.PLAY, then we are in the game
          if (connectionData && connectionData.gameState != GAME_STATES.LOBBY) {
            return (
              <div className="play-main">
                <DebugButtons />
                <Game
                  userData={userData}
                  setUserData={setUserData}
                  connectionData={connectionData}
                  handleExit={handleExit}
                  pingServer={pingServer}
                />
              </div>
            );
          }
        case ConnectionState.Disconnected:
          return (
            <div className="login-main">
              <DebugButtons />
              <Lobby
                setWebSocket={setWebSocket}
                pingServer={pingServer}
                connectionData={connectionData}
                handleExit={handleExit}
              />
            </div>
          );

        case ConnectionState.Connecting:
          return <p className="login-main">Connecting to server...</p>;
        default:
          return <p className="login-main">Error: Unknown Connection State!</p>;
      }
    case AuthState.Unauthenticated:
      return <p className="login-main">Sign in to play!</p>;
    default:
      return <p className="login-main">Error: Unknown Auth State!</p>;
  }
}
