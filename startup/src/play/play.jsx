import React from "react";
import { AuthState } from "../login/authState";
import { Game } from "./game.jsx";
import { Lobby } from "./lobby.jsx";
import { ConnectionState } from "./connectionState";

export function Play({ userData, setUserData, authState }) {
  const [connectionState, setConnectionState] = React.useState(
    ConnectionState.Disconnected
  );
  const [connectionData, setConnectionData] = React.useState(null);

  console.log("Auth State: ", authState);
  console.log("Connection State: ", connectionState);
  console.log("User Data: ", userData);
  async function returnToLobby() {
    const response = await fetch("api/game/leave", {
      method: "delete",
      body: JSON.stringify({
        email: userData.email,
        roomCode: connectionData.roomCode,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 204) {
      setConnectionData(null);
      setConnectionState(ConnectionState.Disconnected);
    } else {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }
  switch (authState) {
    case AuthState.Authenticated:
      switch (connectionState) {
        case ConnectionState.Disconnected:
        case ConnectionState.Connecting:
          return (
            <div className="login-main">
              <Lobby
                connectionState={connectionState}
                setConnectionState={setConnectionState}
                connectionData={connectionData}
                setConnectionData={setConnectionData}
                email={userData.email}
                trophies={userData.trophies}
              />
            </div>
          );
        case ConnectionState.Connected:
          return (
            <div className="play-main">
              <Game
                userData={userData}
                setUserData={setUserData}
                userName={userData.email.split("@")[0]}
                returnToLobby={returnToLobby}
              />
            </div>
          );
        default:
          return <p className="login-main">Error: Unknown Connection State!</p>;
      }
    case AuthState.Unauthenticated:
      return <p className="login-main">Sign in to play!</p>;
    default:
      return <p className="login-main">Error: Unknown Auth State!</p>;
  }
}
