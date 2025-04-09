import React from "react";
import { AuthState } from "../login/authState";
import { Game } from "./game.jsx";
import { Lobby } from "./lobby.jsx";
import { ConnectionState } from "./connectionState";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

import { MsgTypes, GameEventNotifier } from "./gameNotifier";

const debug = false;

const GAME_STATES = {
  LOBBY: 0,
  PLAY: 1,
  END: 2,
};

let GameNotifier = null;

export function Play({ userData, setUserData, authState }) {
  // This is our websocket connection state
  const [connectionState, setConnectionState] = React.useState(
    ConnectionState.Connecting
  );
  const [connectionData, setConnectionData] = React.useState(null);

  function connectToGameServer() {
    if (debug) {
      console.log("Pinged Game Server");
    }
    if (GameNotifier) {
      GameNotifier.connectToGameServer(userData.email);
    }
  }

  React.useEffect(() => {
    if (connectionState == ConnectionState.Connecting) {
      if (debug) {
        console.log("🟡 Connecting to websocket...");

        console.log("Setting up websocket connection to game server...");
      }
      GameNotifier = new GameEventNotifier({
        newConnectionDataHandler: (data) => {
          if (debug) {
            console.log(
              "⭐ Got web socket connection data! Connection Data: ",
              data
            );
          }
          setConnectionData(data);
        },
        newMessageHandler: (msg) => {
          alert(msg);
        },
        connectedGetter: () => connectionState == ConnectionState.Connected,
        connectedSetter: (a) => {
          if (a) setConnectionState(ConnectionState.Connected);
          else setConnectionState(ConnectionState.Disconnected);
          if (debug) {
            console.log("Connection state changed to: ", a);
          }
        },
        // We don't actually need this for now, but we can use it in the future
        gameConnectedGetter: () => null,
        gameConnectedSetter: (a) => {},
      });
      if (debug) {
        console.log("GameNotifier: ", GameNotifier);
      }
    } else if (connectionState == ConnectionState.Disconnected) {
      if (debug) {
        console.log("🔴 Disconnected from websocket");
      }
      setConnectionData(null);
    } else if (connectionState == ConnectionState.Connected) {
      if (debug) {
        console.log("🟢 Connected to websocket");
      }

      connectToGameServer();
    } else {
      if (debug) {
        console.log("GameNotifier is null!");
      }
    }
  }, [connectionState]);

  async function handleExit() {
    // Handles canceling as either a host or a person joining
    const response = await fetch("api/game/leave", {
      method: "delete",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 204) {
      setConnectionData(null);
    } else {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  function getConnectionData() {
    if (connectionState == ConnectionState.Connected) {
      GameNotifier.requestConnectionData();
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
                  debug={debug}
                />
              </div>
            );
          } else {
            return (
              <div className="fullsize">
                {/* <DebugButtons /> */}
                <Lobby
                  connectionData={connectionData}
                  handleExit={handleExit}
                  connectToGameServer={connectToGameServer}
                  debug={debug}
                />
              </div>
            );
          }
        case ConnectionState.Disconnected:
          return (
            <div className="fullsize">
              <p>Disconnected from Server</p>
              <Button
                onClick={() => {
                  setConnectionState(ConnectionState.Connecting);
                }}
              >
                Reconnect
              </Button>
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
