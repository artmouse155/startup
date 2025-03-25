import React from "react";
import "./lobby.css";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";

export function Lobby({
  setWebSocket,
  connectionData,
  handleExit,
  pingServer,
}) {
  const MENUSTATE = {
    ROOT: 0,
    HOST: 1,
    JOIN: 2,
    HOST_WAIT: 3,
    JOIN_WAIT: 4,
  };
  const [menuState, setMenuState] = React.useState(MENUSTATE.ROOT);
  const [roomCodeInput, setRoomCodeInput] = React.useState("");
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [roomCodeInput]);

  React.useEffect(() => {
    if (connectionData) {
      if (connectionData.amHost) {
        console.log("Hosting. Connection Data: ", connectionData);
        setMenuState(MENUSTATE.HOST);
        return;
      } else {
        console.log("Joining Wait. Connection Data: ", connectionData);
        setMenuState(MENUSTATE.JOIN_WAIT);
        return;
      }
    }
    if (menuState == MENUSTATE.JOIN_WAIT) {
      setMenuState(MENUSTATE.JOIN);
      return;
    }
    setMenuState(MENUSTATE.ROOT);
  }, [connectionData]);

  //console.log("Connection State: ", connectionState);

  async function handleHostGame() {
    // Handles the host game button click

    console.log("Preparing to host!");
    const response = await fetch("api/game/host", {
      method: "post",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      const body = await response.json();
      //console.log("Host Game Result: ", body);
      setWebSocket(body.roomCode);
    } else {
      if (response?.status === 409) {
        const body = await response.json();
        alert(`${body.msg} You are no longer in the game.`);
      } else {
        const body = await response.json();
        alert(`⚠ Error: ${body.msg}`);
      }
    }
  }

  async function handleHostStartGame() {
    if (connectionData && connectionData.roomCode) {
      const response = await fetch(
        `api/game/server/${connectionData.roomCode}/start`,
        {
          method: "post",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );
      if (response?.status === 200) {
        pingServer();
        return true;
      } else {
        const body = await response.json();
        alert(`⚠ Error: ${body.msg}`);
        return false;
      }
    }
  }

  async function handleJoinGame(roomCode) {
    // Check if the room code is valid
    console.log("Preparing to join!");
    const response = await fetch(`api/game/join/${roomCode}`, {
      method: "post",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    if (response?.status === 200) {
      setWebSocket(roomCode);
    } else {
      if (response?.status === 409) {
        const body = await response.json();
        alert(`${body.msg} You are no longer in the game.`);
      } else {
        const body = await response.json();
        alert(`⚠ Error: ${body.msg}`);
      }
    }
    console.log("Join Game Result");
  }

  function handleSetRoomCodeInput(e) {
    let code = e.target.value;
    // Make code all caps
    code = code.toUpperCase();
    // keep only a-z characters
    code = code.replaceAll(/([^A-Z])+/g, "");
    // It can be a max of 5 characters
    code = code.slice(0, 5);

    setRoomCodeInput(code);
    // Set mouse focus to room code input
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
        <p key={i}>{`${connectionData.players[i]} connected ${
          i == 0 ? ` (host)` : ``
        }`}</p>
      );
    }

    return <div>{connectedList}</div>;
    // Returns a component that displays the list of connected players. Taken from connection state
  }

  function Root({ setMenuState }) {
    return (
      <Card.Body>
        <Card.Title>Lobby</Card.Title>
        <div className="lobby-actions">
          <Button className="lobby-button" onClick={() => handleHostGame()}>
            Host
          </Button>
          <Button
            className="lobby-button"
            onClick={() => setMenuState(MENUSTATE.JOIN)}
          >
            Join
          </Button>
        </div>
      </Card.Body>
    );
  }

  function Host() {
    const playerCount = connectionData ? connectionData.players.length : 0;
    const maxPlayers = connectionData
      ? connectionData.constants.num_players
      : 0;
    const roomCode = connectionData ? connectionData.roomCode : null;
    return (
      <Card.Body>
        <Card.Title>Host Game</Card.Title>
        <Card.Title className="room-code">
          {connectionData
            ? `Room Code: ${connectionData.roomCode}`
            : `Disconnected`}
        </Card.Title>
        <h4 className="num-connected">{`${playerCount}/${maxPlayers} players connected.\nWaiting for host to start game`}</h4>
        {connectionData ? <ConnectedPlayerList /> : null}
        <Spinner />
        <div className="lobby-actions">
          {connectionData ? (
            <Button
              className="lobby-button"
              onClick={handleHostStartGame}
              // TODO: Uncomment this line to enable the button only when the player count is equal to the max players
              //disabled={playerCount < maxPlayers}
            >
              Start Game
            </Button>
          ) : null}
          <Button
            className="lobby-button"
            variant="secondary"
            onClick={() => handleExit(MENUSTATE.ROOT)}
          >
            Cancel
          </Button>
        </div>
      </Card.Body>
    );
  }

  function Join({ setMenuState, roomCodeInput }) {
    return (
      <Card.Body>
        <Card.Title>Join Game</Card.Title>
        <Form className="mb-3">
          <Form.Control
            className="room-code-input"
            type="text"
            placeholder="Room Code"
            value={roomCodeInput}
            onChange={(e) => handleSetRoomCodeInput(e)}
            ref={inputRef}
          />
        </Form>
        <div className="lobby-actions">
          <Button
            className="lobby-button"
            onClick={() => handleJoinGame(roomCodeInput)}
            disabled={roomCodeInput.length != 5}
          >
            Join
          </Button>
          <Button
            className="lobby-button"
            variant="secondary"
            onClick={() => setMenuState(MENUSTATE.ROOT)}
          >
            Cancel
          </Button>
        </div>
      </Card.Body>
    );
  }

  function JoinWait() {
    return (
      <Card.Body>
        <Card.Title>Waiting for Players</Card.Title>
        <h4 className="num-connected">{`${connectionData.players.length}/${connectionData.constants.num_players} players connected.\nWaiting for host to start game`}</h4>
        <ConnectedPlayerList />
        <Spinner />
        <div className="lobby-actions">
          <Button
            className="lobby-button"
            variant="secondary"
            onClick={() => handleExit(MENUSTATE.JOIN)}
          >
            Cancel
          </Button>
        </div>
      </Card.Body>
    );
  }

  function Menu({ menuState }) {
    switch (menuState) {
      case MENUSTATE.ROOT:
        return <Root setMenuState={setMenuState} />;
      case MENUSTATE.HOST:
        return <Host />;
      case MENUSTATE.JOIN:
        return (
          <Join setMenuState={setMenuState} roomCodeInput={roomCodeInput} />
        );
      case MENUSTATE.JOIN_WAIT:
        return <JoinWait />;
      default:
        return <p>Unknown Menu State!</p>;
    }
  }

  return (
    <div className="login-center">
      <Card>
        <Card.Header>Hi</Card.Header>
        <Menu menuState={menuState} />
      </Card>
    </div>
  );
}
