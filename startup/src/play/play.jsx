import React from "react";
import { AuthState } from "../login/authState";
import { Game } from "./game.jsx";
import { Lobby } from "./lobby.jsx";
import { ConnectionState } from "./connectionState";
import Spinner from "react-bootstrap/Spinner";

const debug = false;

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
        if (debug) {
          console.log("Found room code in local storage: ", roomCode);
        }
        getConnectionData(roomCode);
      } else {
        if (debug) {
          console.log("No room code found in local storage");
        }
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
    if (debug) {
      console.log("Getting connection data with room code", roomCode);
    }
    const response = await fetch(`api/game/server/${roomCode}/connection/get`, {
      method: "post",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      if (debug) {
        console.log("⭐ Server Pinged! Connection Data: ", body);
      }
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
              <div className="fullsize flex-column align-items-stretch">
                {/* <DebugButtons /> */}
                <Game
                  userData={userData}
                  setUserData={setUserData}
                  connectionData={connectionData}
                  handleExit={handleExit}
                  pingServer={pingServer}
                  debug={debug}
                />
              </div>
            );
          }
        case ConnectionState.Disconnected:
          return (
            <div className="fullsize">
              {/* <DebugButtons /> */}
              <Lobby
                setWebSocket={setWebSocket}
                pingServer={pingServer}
                connectionData={connectionData}
                handleExit={handleExit}
                debug={debug}
              />
            </div>
          );

        case ConnectionState.Connecting:
          return (
            <div className="fullsize">
              <p>Connecting to server...</p>
              <Spinner animation="border" />
            </div>
          );
        default:
          return <p className="fullsize">Error: Unknown Connection State!</p>;
      }
    case AuthState.Unauthenticated:
      return <p className="fullsize">Sign in to play!</p>;
    default:
      return <p className="fullsize">Error: Unknown Auth State!</p>;
  }
}
