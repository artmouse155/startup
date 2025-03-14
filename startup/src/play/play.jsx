import React from "react";
import { AuthState } from "../login/authState";
import { Game } from "./game.jsx";
import { Lobby } from "./lobby.jsx";
import { ConnectionState } from "./connectionState";

export function Play({ userData, authState }) {
  const [connectionState, setConnectionState] = React.useState(
    ConnectionState.Disconnected
  );

  console.log("Auth State: ", authState);
  console.log("Connection State: ", connectionState);
  console.log("User Data: ", userData);
  return authState == AuthState.Authenticated ? (
    connectionState == ConnectionState.Disconnected ? (
      <div className="login-main">
        <Lobby
          connectionState={connectionState}
          setConnectionState={setConnectionState}
          userName={userData.email.split("@")[0]}
          trophies={userData.trophies}
        />
      </div>
    ) : connectionState == ConnectionState.Connected ? (
      <div className="play-main">
        <Game />
      </div>
    ) : (
      <p className="login-main">Error: Unknown Connection State!</p>
    )
  ) : (
    <p className="login-main">Sign in to play!</p>
  );
}
