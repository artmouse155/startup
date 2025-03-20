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

  // async function getItemData(itemId) {
  //   if (itemId == "") {
  //     return null;
  //   }
  //   // call api to get item data
  //   const response = await fetch(`api/items/${itemId}`, {
  //     method: "get",
  //     headers: {
  //       "Content-type": "application/json; charset=UTF-8",
  //     },
  //   });
  //   if (response?.status === 200) {
  //     const body = await response.json();
  //     console.log("⭐ Got Item Data: ", body);
  //     return body;
  //   } else {
  //     const body = await response.json();
  //     alert(`⚠ Error: ${body.msg}`);
  //   }
  // }

  async function getConnectionData() {
    if (connectionData && connectionData.roomCode) {
      const response = await fetch(
        `api/game/server/${connectionData.roomCode}/connection/get`,
        {
          method: "post",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );
      if (response?.status === 200) {
        const body = await response.json();
        console.log("⭐ Got Connection Data: ", body);
        setConnectionData(body);
        if (body.gameState == GAME_STATES.PLAY) {
          setConnectionState(ConnectionState.Connected);
        }
      } else {
        const body = await response.json();
        alert(`⚠ Error: ${body.msg}`);
      }
    }
  }

  // Includes a button to get connection data and a button to start the game. Also a button to end the game
  function DebugButtons() {
    return (
      <div className="debug-buttons">
        <button onClick={getConnectionData}>⭐ Fake Websocket ⭐</button>
      </div>
    );
  }

  switch (authState) {
    case AuthState.Authenticated:
      switch (connectionState) {
        case ConnectionState.Disconnected:
        case ConnectionState.Connecting:
          return (
            <div className="login-main">
              <DebugButtons />
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
              <DebugButtons />
              <Game
                userData={userData}
                setUserData={setUserData}
                connectionData={connectionData}
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
