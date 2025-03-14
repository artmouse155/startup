import React from "react";
import "./lobby.css";
import { ConnectionState } from "./connectionState";

export function Lobby({
  connectionState,
  setConnectionState,
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
  console.log("Connection State: ", connectionState);

  console.log("userName: ", userName);
  console.log("trophies: ", trophies);

  function handleHostGame() {
    // Handles the host game button click
    setConnectionState(ConnectionState.Connected);
    setMenuState(MENUSTATE.HOST_WAIT);
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
    // Returns a component that displays the list of connected players. Taken from connection state
  }

  function Root() {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Welcome to the Lobby</h1>
        <div className="lobby-user-info"></div>
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
  function Host() {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Host Game</h1>
        <div className="lobby-user-info"></div>
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

  function Join() {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Join Game</h1>
        <div className="lobby-user-info"></div>
        <div className="lobby-actions">
          <button
            className="lobby-button"
            onClick={setMenuState(MENUSTATE.JOIN_WAIT)}
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

  function HostWait() {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Waiting for Players</h1>
        <div className="lobby-user-info"></div>
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

  function JoinWait() {
    return (
      <div className="lobby-container">
        <h1 className="lobby-title">Waiting to Join</h1>
        <div className="lobby-user-info"></div>
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
        return <Root />;
      case MENUSTATE.HOST:
        return <Host />;
      case MENUSTATE.JOIN:
        return <Join />;
      case MENUSTATE.HOST_WAIT:
        return <HostWait />;
      case MENUSTATE.JOIN_WAIT:
        return <JoinWait />;
      default:
        return <p>Unknown Menu State!</p>;
    }
  }

  return (
    <div className="login-main">
      <div className="login-screen">
        <Menu menuState={menuState} />
      </div>
    </div>
  );
}
