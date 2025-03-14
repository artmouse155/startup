import React from "react";
import { AuthState } from "../login/authState";
import { Game } from "./game.jsx";
import { Lobby } from "./lobby.jsx";
import { ConnectionState } from "./connectionState";

export function Play({ userData, authState }) {
  const [connectionState, setConnectionState] = React.useState(
    ConnectionState.Disconnected
  );
  const [connectionData, setConnectionData] = React.useState(null);

  console.log("Auth State: ", authState);
  console.log("Connection State: ", connectionState);
  console.log("User Data: ", userData);
  return authState == AuthState.Authenticated ? (
    connectionState == ConnectionState.Disconnected ||
    connectionState == ConnectionState.Connecting ? (
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
    ) : connectionState == ConnectionState.Connected ? (
      <div className="play-main">
        <Game userName={userData.email.split("@")[0]} />
      </div>
    ) : (
      <p className="login-main">Error: Unknown Connection State!</p>
    )
  ) : (
    <p className="login-main">Sign in to play!</p>
  );
}
