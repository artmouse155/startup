import React from "react";
import "./lobby.css";
import { ConnectionState } from "./connectionState";

export function Lobby({
  connectionState,
  setConnectionState,
  connectionData,
  setConnectionData,
  roomCode,
  setRoomCode,
  userName,
  trophies,
}) {
  const MENUSTATE = {
    ROOT: 0,
    HOST: 1,
    JOIN: 2,
    HOST_WAIT: 3,
    JOIN_WAIT: 4,
  };
  const [menuState, setMenuState] = React.useState(MENUSTATE.ROOT);
  const [doPlaceholderWebsocket, setDoPlaceholderWebsocket] =
    React.useState(true);

  console.log("Connection State: ", connectionState);

  console.log("userName: ", userName);
  console.log("trophies: ", trophies);

  function handleSetRoomCode(v) {
    // It can be a max of 5 characters
    setRoomCode(v.slice(0, 5));
    // Set mouse focus to room code input
  }

  async function handleHostGame() {
    // Handles the host game button click
    if (doPlaceholderWebsocket) {
      setConnectionState(ConnectionState.Connected);
    }
    setMenuState(MENUSTATE.HOST_WAIT);
  }

  async function handleJoinGame(roomCode) {
    // Check if the room code is valid
    const response = await fetch("api/game/join", {
      method: "post",
      body: JSON.stringify({ email: userName, roomCode: roomCode }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      setConnectionData(body);
      setConnectionState(ConnectionState.Connecting);
      setMenuState(MENUSTATE.JOIN_WAIT);
    } else {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  // returns a spinner component for loading
  function Spinner() {
    return (
      <div className="spinner">
        <div className="double-bounce1"></div>
        <div className="double-bounce2"></div>
      </div>
    );
  }

  function ConnectedPlayerList() {
    let connectedList = [];
    for (let i = 0; i < connectionData.players.length; i++) {
      connectedList.push(
        <p key={i}>{`${connectionData.players[i].userName} connected`}</p>
      );
    }

    return <div>{connectedList}</div>;
    // Returns a component that displays the list of connected players. Taken from connection state
  }

  function Root({ setMenuState }) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Welcome to the Lobby</h1>
        <div className="lobby-actions">
          <button
            className="lobby-button"
            onClick={() => setMenuState(MENUSTATE.HOST)}
          >
            Host Game
          </button>
          <button
            className="lobby-button"
            onClick={() => setMenuState(MENUSTATE.JOIN)}
          >
            Join Game
          </button>
        </div>
      </div>
    );
  }
  function Host({ setMenuState }) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Host Game</h1>
        <div className="lobby-actions">
          <button className="lobby-button" onClick={handleHostGame}>
            Start Game
          </button>
          <button
            className="lobby-cancel-button"
            onClick={() => setMenuState(MENUSTATE.ROOT)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function Join({ setMenuState }) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Join Game</h1>
        <div className="lobby-actions">
          <form className="room-code-form">
            <input
              type="text"
              placeholder="Room Code"
              onChange={(e) => setRoomCode(e.target.value)}
            />
          </form>
          <button
            className="lobby-button"
            onClick={() => handleJoinGame(roomCode)}
          >
            Join Game
          </button>
          <button
            className="lobby-cancel-button"
            onClick={() => setMenuState(MENUSTATE.ROOT)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function HostWait({ setMenuState }) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Waiting for Players</h1>
        <Spinner />
        <div className="lobby-actions">
          <button
            className="lobby-cancel-button"
            onClick={() => setMenuState(MENUSTATE.HOST)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function JoinWait({ setMenuState }) {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Waiting for Players</h1>
        <h4 className="num-connected">{`${connectionData.players.length}/4 players connected`}</h4>
        <ConnectedPlayerList />
        <Spinner />
        <div className="lobby-actions">
          <button
            className="lobby-cancel-button"
            onClick={() => setMenuState(MENUSTATE.JOIN)}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  function Menu({ menuState }) {
    switch (menuState) {
      case MENUSTATE.ROOT:
        return <Root setMenuState={setMenuState} />;
      case MENUSTATE.HOST:
        return <Host setMenuState={setMenuState} />;
      case MENUSTATE.JOIN:
        return <Join setMenuState={setMenuState} />;
      case MENUSTATE.HOST_WAIT:
        return <HostWait setMenuState={setMenuState} />;
      case MENUSTATE.JOIN_WAIT:
        return <JoinWait setMenuState={setMenuState} />;
      default:
        return <p>Unknown Menu State!</p>;
    }
  }

  return (
    <div className="login-main">
      <div className="login-screen">
        <input
          type="checkbox"
          id="do-placeholder"
          checked={doPlaceholderWebsocket}
          onChange={() => setDoPlaceholderWebsocket(!doPlaceholderWebsocket)}
        />
        <label htmlFor="do-placeholder">
          Do Placeholder Web Socket (Show joining game)
        </label>
        <Menu menuState={menuState} />
      </div>
    </div>
  );
}
