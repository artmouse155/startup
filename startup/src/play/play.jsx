import React from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import "./play.css";
import "./aspects.css";
import {
  setTurnEndFunc,
  createGame,
  getPlayerCards,
  getItemIcon,
  evalCard,
  NUM_PLAYERS,
  NUM_CARDS,
  NUM_ITEM_SLOTS,
} from "./server/server.jsx";
import { TextBox } from "./textbox/textbox.jsx";
import { Aspects } from "./aspects.jsx";

const debug = true;

export function Play() {
  const GAME_STATES = {
    LOBBY: 0,
    PLAY: 1,
    END: 2,
  };
  const ItemType = { CARD_TYPE: "card" };
  const [gameState, setGameState] = React.useState(GAME_STATES.LOBBY);
  const [myCards, setMyCards] = React.useState();
  const [gameData, setGameData] = React.useState({
    aspects: {
      MAGIC: 0,
      STRENGTH: 0,
      INTELLIGENCE: 0,
      CHARISMA: 0,
    },
    players: [
      {
        name: "P1",
        aspect: "INTELLIGENCE",
        cards: Array(NUM_CARDS).fill(1),
      },
      {
        name: "P2",
        aspect: "CHARISMA",
        cards: Array(NUM_CARDS).fill(1),
      },
      {
        name: "P3",
        aspect: "MAGIC",
        cards: Array(NUM_CARDS).fill(1),
      },
      {
        name: "P4",
        aspect: "STRENGTH",
        cards: Array(NUM_CARDS).fill(1),
      },
    ],
    inventory: Array(NUM_ITEM_SLOTS).fill(""),
    current_turn_id: 0,
  });
  const [myPlayerId, setMyPlayerID] = React.useState(-1);

  setTurnEndFunc((_gameData) => {
    console.log("Turn ended hook worked. Updating player data.");
    setGameData(_gameData);
  });

  function getPlayerID() {
    console.log("Accessed player ID!");
    return myPlayerId;
  }
  const [heroData, setHeroData] = React.useState({
    heroName: "<Null Name>",
    heroGender: "unknown",
  });
  const [isSetupComplete, setIsSetupComplete] = React.useState(false);

  React.useEffect(() => (isSetupComplete ? () => {} : gameSetup()));

  function gameSetup() {
    console.log("Setting up!");
    const _myPlayerId = 3;
    setMyPlayerID(_myPlayerId);
    const { _gameData, _heroData } = createGame();

    setGameData(_gameData);
    setHeroData(_heroData);
    setMyCards(getPlayerCards(_myPlayerId));
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
      let effectData = Aspects[effect.type];
      let classNameTemp = `card-outcome-text ${effectData.name}`;
      effect_html.push(
        <p className={classNameTemp} key={i}>
          <b>
            + {effect.amt} {effectData.text}
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
      let effectData = Aspects[effect.type];
      // console.log(effectData);
      let classNameTemp = `card-outcome-text ${effectData.name}`;
      effect_html.push(
        <p className={classNameTemp} key={i}>
          <b>
            + {effect.amt} {effectData.text}
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
    if (card_num_id < NUM_CARDS) {
      console.log("Making Game Data copy.");
      console.log("current_turn_id:", gameData.current_turn_id);
      let gameDataCopy = { ...gameData };
      console.log("copied current_turn_id:", gameDataCopy.current_turn_id);
      gameDataCopy.players[_playerID].cards[card_num_id] = 0;
      setGameData({ ...gameDataCopy });
      evalCard(card.num_id);
      return true;
    }
    return false;
  }

  function fakeNextTurn() {
    console.log("Next Turn");
    // Make game data copy
    let gameDataCopy = { ...gameData };

    // Use a random card

    // Give next player a turn to go
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

  function InventoryContainer() {
    let itemBoxes = [];
    for (let i = 0; i < NUM_ITEM_SLOTS; i++) {
      itemBoxes.push(
        <div className="item-box" key={i}>
          <p className="item-box-text">
            {gameData.inventory[i] == ""
              ? i + 1
              : getItemIcon(gameData.inventory[i])}
          </p>
        </div>
      );
    }
    return (
      <div className="items-container">
        <h3 className="centered-header">Inventory</h3>
        {itemBoxes}
      </div>
    );
  }

  function Leaderboard(aspects) {
    // PlayerID, Standing
    let standings = Array(NUM_PLAYERS);
    for (let i = 0; i < NUM_PLAYERS; i++) {
      standings[i] = 0;
      for (let j = 0; j < NUM_PLAYERS; j++) {
        if (
          aspects[gameData.players[i].aspect] <
          aspects[gameData.players[j].aspect]
        ) {
          standings[i]++;
        }
      }
    }

    // console.log(
    //   "Rendering Leaderboard! Standings:",
    //   standings,
    //   "gameData: ",
    //   gameData
    // );
    function LeaderboardCard({ data }) {
      const emoji = Aspects[data.aspect].emoji;

      let cardArray = [];
      let placeText = "th";
      switch (data.standing) {
        case 0:
          placeText = "st";
          break;
        case 1:
          placeText = "nd";
          break;
        default:
          placeText = "th";
          break;
      }

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
              <p className="big-place-text-number">{data.standing + 1}</p>
              <p className="place-text">{placeText}</p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="players-boxes-container">
        <LeaderboardCard
          data={{ standing: standings[0], ...gameData.players[0] }}
        />
        <LeaderboardCard
          data={{ standing: standings[1], ...gameData.players[1] }}
        />
        <LeaderboardCard
          data={{ standing: standings[2], ...gameData.players[2] }}
        />
        <LeaderboardCard
          data={{ standing: standings[3], ...gameData.players[3] }}
        />
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
                <InventoryContainer />
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
          <Leaderboard aspects={gameData.aspects} />
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
            <button onClick={() => console.log(gameData)}>
              Print Game Data
            </button>
          </div>
        ) : null}
      </main>
    );
  } else if (gameState == GAME_STATES.END) {
    return <p>Game is over!</p>;
  }
}
