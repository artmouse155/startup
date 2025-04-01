import React from "react";
import "./lobby.css";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";

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

  function ConnectedPlayerList({ playerCount, maxPlayers }) {
    let connectedList = [];
    for (let i = 0; i < playerCount; i++) {
      connectedList.push(
        <ListGroup.Item className="players-list-item" key={i}>
          <p className="players-list-text">{`${connectionData.players[i]} ${
            i == 0 ? ` (host)` : ``
          }`}</p>
        </ListGroup.Item>
      );
    }
    // For the rest, just push a spinner
    for (let i = playerCount; i < maxPlayers; i++) {
      connectedList.push(
        <ListGroup.Item className="players-list-item" key={i}>
          <Spinner />
        </ListGroup.Item>
      );
    }

    return (
      <Card>
        <Card.Header>{`${playerCount}/${maxPlayers} players connected`}</Card.Header>
        <ListGroup variant="flush">{connectedList}</ListGroup>
      </Card>
    );
    // Returns a component that displays the list of connected players. Taken from connection state
  }

  function Root({ setMenuState }) {
    return (
      <Card.Body>
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
        <Card.Body>
          <Card>
            <InputGroup>
              <InputGroup.Text>Room Code</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Room Code"
                readOnly
                value={connectionData ? `${connectionData.roomCode}` : ``}
              />
              <Button
                variant="secondary"
                onClick={() =>
                  navigator.clipboard.writeText(connectionData.roomCode)
                }
              >
                <img src="copy.png" width="20px"></img>
              </Button>
            </InputGroup>
          </Card>
          <br />
          {connectionData ? (
            <ConnectedPlayerList
              playerCount={playerCount}
              maxPlayers={maxPlayers}
            />
          ) : null}
        </Card.Body>
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
        <Form
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinGame(roomCodeInput);
          }}
        >
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
    const playerCount = connectionData ? connectionData.players.length : 0;
    const maxPlayers = connectionData;
    return (
      <Card.Body>
        <Card.Title>Waiting for Players</Card.Title>
        <Card.Body>
          <Card>
            <InputGroup>
              <InputGroup.Text>Room Code</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Room Code"
                readOnly
                value={connectionData ? `${connectionData.roomCode}` : ``}
              />
              <Button
                variant="secondary"
                onClick={() =>
                  navigator.clipboard.writeText(connectionData.roomCode)
                }
              >
                <img src="copy.png" width="20px"></img>
              </Button>
            </InputGroup>
          </Card>
          <br />
          {connectionData ? (
            <ConnectedPlayerList
              playerCount={playerCount}
              maxPlayers={maxPlayers}
            />
          ) : null}
        </Card.Body>
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
        <Card.Header>🟢 Connected</Card.Header>
        <Menu menuState={menuState} disableButtons={!connectionData} />
      </Card>
    </div>
  );
}
