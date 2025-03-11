import React from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import "./play.css";
import "./aspects.css";
import { TextBox } from "./textbox/textbox.jsx";
import { Aspects } from "./aspects.jsx";

const debug = true;

export function Play() {
  const GAME_STATES = {
    LOBBY: 0,
    PLAY: 1,
    END: 2,
  };
  const [gameState, setGameState] = React.useState(GAME_STATES.LOBBY);

  const [myCards, setMyCards] = React.useState([
    {
      num_id: 0,
      id: "magic-inscription",
      desc: "Read a magic inscription on the wall",
      effects: [{ amt: 5, type: Aspects.MAGIC }],
    },
    {
      num_id: 1,
      id: "magic-telescope",
      desc: "Add Magic Telescope to inventory",
    },
    {
      num_id: 2,
      id: "use-topmost-item",
      desc: "Use topmost item in inventory",
    },
    {
      num_id: 3,
      id: "cobweb-room",
      desc: "Enter cobweb-infested room",
      effects: [
        { amt: 3, type: Aspects.STRENGTH },
        { amt: 2, type: Aspects.UNKNOWN },
      ],
    },
    {
      num_id: 4,
      id: "wild-bear",
      desc: "Encounter a wild bear",
      effects: [{ amt: 5, type: Aspects.UNKNOWN }],
    },
  ]);

  const ItemType = { CARD_TYPE: "card" };
  const [gameData, setGameData] = React.useState({
    aspects: {
      MAGIC: 10,
      STRENGTH: 0,
      INTELLIGENCE: 5,
      CHARISMA: 5,
    },
    players: [
      {
        name: "Alice",
        aspect: "INTELLIGENCE",
        cards: [1, 0, 1, 1, 1],
      },
      {
        name: "Bob",
        aspect: "CHARISMA",
        cards: [1, 1, 1, 1, 0],
      },
      {
        name: "Seth",
        aspect: "MAGIC",
        cards: [1, 1, 1, 0, 1],
      },
      {
        name: "Cosmo",
        aspect: "STRENGTH",
        cards: [1, 1, 1, 1, 1],
      },
    ],
    inventory: ["🍼", "2", "3"],
    current_turn_id: 0,
  });
  const [myPlayerId, setMyPlayerID] = React.useState(-1);
  function getPlayerID() {
    console.log("Accessed player ID!");
    return myPlayerId;
  }
  const [heroData, setHeroData] = React.useState({
    heroName: "🛑NULL🛑",
    heroGender: "unknown",
  });
  const [isSetupComplete, setIsSetupComplete] = React.useState(false);

  React.useEffect(() => (isSetupComplete ? () => {} : gameSetup()));

  function gameSetup() {
    console.log("Setting up!");
    setMyPlayerID(3);
    setHeroData({
      heroName: "Elrond",
      heroGender: "male",
    });
    setGameState(GAME_STATES.PLAY);
    setIsSetupComplete(true);
    console.log("Setup complete!");
  }

  function getAdventureTitle() {
    return `${heroData.heroName}'s Quest`;
  }

  // Code from https://react-dnd.github.io/react-dnd/about
  function getItemStyles(initialOffset, currentOffset) {
    if (!initialOffset || !currentOffset) {
      return {
        display: "none",
      };
    }
    let {
      x = currentOffset.x - initialOffset.x,
      y = currentOffset.y - initialOffset.y - 150,
    } = {};
    const transform = `translate(${x}px, ${y}px)`;
    return {
      pointerEvents: "none", // Add this line
      zIndex: 100,
      transform,
      WebkitTransform: transform,
      mouse: "grab",
      //filter: "drop-shadow(#00000055 .5rem .5rem 5px)",
    };
  }

  function CardDragLayer() {
    const { item, initialOffset, currentOffset, isDragging } = useDragLayer(
      (monitor) => ({
        item: monitor.getItem() || {
          desc: "CardDragLayer",
          effects: [{ amt: 500, type: Aspects.UNKNOWN }],
        },
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
      })
    );

    //console.log("dragInitialOffset ", initialOffset);
    const { desc, effects } = item;
    const effect_html = [];
    for (let i = 0; i < effects.length; i++) {
      let effect = effects[i];
      let classNameTemp = `card-outcome-text ${effect.type.name}`;
      effect_html.push(
        <p className={classNameTemp} key={i}>
          <b>
            + {effect.amt} {effect.type.text}
          </b>
        </p>
      );
    }

    let card = (
      <div
        className="card-drag-layer shadow-5"
        style={getItemStyles(initialOffset, currentOffset)}
      >
        <p className="card-body-text">{desc}</p>
        {effect_html}
      </div>
    );
    return card;
  }

  function Card({
    num_id = "-1",
    id = "null",
    desc = "No Description",
    effects = [{ amt: 500, type: Aspects.UNKNOWN }],
  }) {
    const [{ isDragging }, drag, preview] = useDrag(() => ({
      type: ItemType.CARD_TYPE,
      item: { num_id, id, desc, effects },
      collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
    }));

    //TODO: Uncomment when I use previewlayer
    React.useEffect(() => {
      preview(getEmptyImage(), { captureDraggingState: true });
    }, [isDragging]);

    const effect_html = [];
    for (let i = 0; i < effects.length; i++) {
      let effect = effects[i];
      let classNameTemp = `card-outcome-text ${effect.type.name}`;
      effect_html.push(
        <p className={classNameTemp} key={i}>
          <b>
            + {effect.amt} {effect.type.text}
          </b>
        </p>
      );
    }

    let cardPreview = (
      <div>
        <div className="transparent-card draggable" ref={preview}></div>
        <CardDragLayer />
      </div>
    );

    let card = (
      <div className="card draggable" ref={drag}>
        <p className="card-body-text">{desc}</p>
        {effect_html}
      </div>
    );
    return isDragging ? cardPreview : card;
  }

  function returnCards() {
    let cardArray = [];
    if (myPlayerId != -1) {
      console.log("Rendered player cards!");
      for (let index = 0; index < myCards.length; index++) {
        if (gameData.players[myPlayerId].cards[index] == 1) {
          const { num_id, id, desc, effects = [] } = myCards[index];
          cardArray.push(
            <Card
              num_id={num_id}
              id={id}
              desc={desc}
              effects={effects}
              key={index}
            />
          );
        }
      }
    }
    return <DndProvider backend={HTML5Backend}>{cardArray}</DndProvider>;
  }

  function useCard(_playerID, card) {
    let card_num_id = card.num_id;
    console.log("Player ID: ", _playerID);
    if (card_num_id < gameData.players[_playerID].cards.length) {
      console.log("Making Game Data copy.");
      console.log("current_turn_id:", gameData.current_turn_id);
      let gameDataCopy = { ...gameData };
      console.log("copied current_turn_id:", gameDataCopy.current_turn_id);
      gameDataCopy.players[_playerID].cards[card_num_id] = 0;
      setGameData({ ...gameDataCopy });
      return true;
    }
    return false;
  }

  function fakeNextTurn() {
    console.log("Next Turn");
    let gameDataCopy = { ...gameData };
    gameDataCopy.current_turn_id = (gameData.current_turn_id + 1) % 4;
    setGameData(gameDataCopy);
  }

  function getTextbox(_playerID) {
    if (isSetupComplete) {
      console.log("Rendering textbox! Player ID is", _playerID);
      return (
        <DndProvider backend={HTML5Backend}>
          <TextBox
            dragItemType={ItemType.CARD_TYPE}
            heroData={heroData}
            playerID={_playerID}
            useCard={useCard}
          />
        </DndProvider>
      );
    } else {
      return null;
    }
  }

  function Leaderboard() {
    console.log("Rendering Leaderboard!");
    function LeaderboardCard({ data }) {
      const emoji = Aspects[data.aspect].emoji;

      let cardArray = [];

      for (let index = 0; index < data.cards.length; index++) {
        cardArray.push(
          <div
            key={index}
            className="dummy-card"
            id={data.cards[index] ? "unplayed" : "played"}
          ></div>
        );
      }

      return (
        <div className="player-box shadow-4" id="Player1">
          <div className="players-box-name-and-cards">
            <h4 className="player-box-name">
              {`${emoji} ${data.name} ${emoji}`}
            </h4>
            <div className="card-count">{cardArray}</div>
          </div>
          <div className="place">
            <div className="place-text-container">
              <p className="big-place-text-number">1</p>
              <p className="place-text">st</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="players-boxes-container">
        <LeaderboardCard data={gameData.players[0]} />
        <LeaderboardCard data={gameData.players[1]} />
        <LeaderboardCard data={gameData.players[2]} />
        <LeaderboardCard data={gameData.players[3]} />
      </div>
    );
  }

  if (gameState == GAME_STATES.LOBBY) {
  } else if (gameState == GAME_STATES.PLAY) {
    return (
      <main>
        <div className="all-play-sections">
          <div className="text-and-inv-and-header">
            <h3 className="centered-header" id="adventure-title">
              {getAdventureTitle()}
            </h3>
            <div className="text-and-inv-section">
              <div className="right-align-container">
                <div className="aspect-boxes-container">
                  <div className="aspect-box data-box" id="MAGIC">
                    <p className="aspect-box-text magic">✨ Magic</p>
                    <p className="aspect-box-text aspect-box-score" id="amt">
                      {gameData.aspects.MAGIC}
                    </p>
                  </div>
                  <div className="aspect-box data-box" id="STRENGTH">
                    <p className="aspect-box-text strength">🦾 Strength</p>
                    <p className="aspect-box-text aspect-box-score" id="amt">
                      {gameData.aspects.STRENGTH}
                    </p>
                  </div>
                  <div className="aspect-box data-box" id="INTELLIGENCE">
                    <p className="aspect-box-text intelligence">
                      📖 Intelligence
                    </p>
                    <p className="aspect-box-text aspect-box-score" id="amt">
                      {gameData.aspects.INTELLIGENCE}
                    </p>
                  </div>
                  <div className="aspect-box data-box" id="CHARISMA">
                    <p className="aspect-box-text charisma">💄 Charisma</p>
                    <p className="aspect-box-text aspect-box-score" id="amt">
                      {gameData.aspects.CHARISMA}
                    </p>
                  </div>
                </div>
              </div>
              {getTextbox(myPlayerId)}
              <div className="left-align-container">
                <div className="items-container">
                  <h3 className="centered-header">Inventory</h3>
                  <div className="item-box">
                    <p className="item-box-text">{gameData.inventory[0]}</p>
                  </div>
                  <div className="item-box">
                    <p className="item-box-text">{gameData.inventory[1]}</p>
                  </div>
                  <div className="item-box">
                    <p className="item-box-text">{gameData.inventory[2]}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="whose-turn-and-all-card-sections">
              <div className="whose-turn">
                <h3>
                  {gameData.current_turn_id == -1
                    ? "Loading..."
                    : gameData.current_turn_id == myPlayerId
                    ? "Your Turn"
                    : `${
                        gameData.players[gameData.current_turn_id].name
                      }'s Turn`}
                </h3>
              </div>
              <div className="all-card-sections">
                <div className="card-section">
                  {returnCards()}
                  <h2 className="my-turn">My Turn</h2>
                </div>
              </div>
            </div>
          </div>
          <Leaderboard />
        </div>
        {debug ? (
          <div>
            <button onClick={() => console.log(myCards)}>Print cards</button>
            <button onClick={() => console.log(myPlayerId)}>
              Print My Player ID
            </button>
            <button
              onClick={fakeNextTurn}
              disabled={myPlayerId == gameData.current_turn_id}
            >
              Simulate Next Turn
            </button>
            <button onClick={() => console.log(gameData.current_turn_id)}>
              Print Turn Id
            </button>
            <button onClick={() => console.log(heroData)}>
              Print Hero Data
            </button>
          </div>
        ) : null}
      </main>
    );
  } else if (gameState == GAME_STATES.END) {
    return <p>Game is over!</p>;
  }
}
