import React from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import "./play.css";
import "./aspects.css";
import {
  nextTurn,
  setTurnEndFunc,
  createGame,
  getPlayerCards,
  getItemData,
  evalCard,
  NUM_PLAYERS,
  NUM_CARDS,
  NUM_ITEM_SLOTS,
} from "./server/server.jsx";
import { TextBox } from "./textbox/textbox.jsx";
import { Aspects } from "./aspects.jsx";
import { End } from "./end.jsx";

const debug = false;
const defaultGameData = {
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
  turns: 0,
};

export function Game({ userName, userData, setUserData, returnToLobby }) {
  const GAME_STATES = {
    PLAY: 0,
    END: 1,
  };
  const ItemType = { CARD_TYPE: "card" };
  const [gameState, setGameState] = React.useState(GAME_STATES.PLAY);
  const [myCards, setMyCards] = React.useState([]);
  const [gameData, setGameData] = React.useState(defaultGameData);
  const [myPlayerId, setMyPlayerID] = React.useState(-1);

  setTurnEndFunc((_gameData) => {
    console.log("Turn ended hook started! Updating player data.", _gameData);
    setGameData({ ..._gameData }); // Create a shallow copy to ensure state update
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
  React.useEffect(() => {
    console.log("game Data updated!", gameData);
    if (gameData.turns >= NUM_PLAYERS * NUM_CARDS) {
      endGame();
    }
  }, [gameData]);

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

  function endGame() {
    setGameState(GAME_STATES.END);
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

  function returnCards(isMyTurn) {
    function Card({
      num_id = "-1",
      id = "null",
      desc = "No Description",
      effects = [],
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
        <div
          className={`card ${isMyTurn ? "draggable" : ""}`}
          ref={isMyTurn ? drag : null}
        >
          <p className="card-body-text">{desc}</p>
          {effect_html}
        </div>
      );
      return isDragging ? cardPreview : card;
    }

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

  function useCard(card) {
    let card_num_id = card.num_id;
    if (gameData.players[gameData.current_turn_id].cards[card_num_id] == 1) {
      // console.log("Making Game Data copy.");
      // console.log("current_turn_id:", gameData.current_turn_id);
      // let gameDataCopy = { ...gameData };
      // console.log("copied current_turn_id:", gameDataCopy.current_turn_id);
      // gameDataCopy.players[_playerID].cards[card_num_id] = 0;
      // setGameData({ ...gameDataCopy });
      evalCard(card_num_id);
      return true;
    }
    console.log("Card not found in player's hand.");
    return false;
  }

  // function fakeNextTurn() {
  //   console.log("Next Turn");
  //   // Make game data copy
  //   let gameDataCopy = { ...gameData };

  //   // Use a random card

  //   // Give next player a turn to go
  //   gameDataCopy.current_turn_id = (gameData.current_turn_id + 1) % 4;
  //   setGameData(gameDataCopy);
  // }

  function getTextbox() {
    if (isSetupComplete) {
      //console.log("Rendering textbox! Player ID is", _playerID);
      return (
        <DndProvider backend={HTML5Backend}>
          <TextBox
            dragItemType={ItemType.CARD_TYPE}
            heroData={heroData}
            initialPlayerName={gameData.players[gameData.current_turn_id].name}
            useCard={useCard}
          />
        </DndProvider>
      );
    } else {
      return null;
    }
  }

  function InventoryContainer({ inventory }) {
    let itemBoxes = [];
    for (let i = 0; i < NUM_ITEM_SLOTS; i++) {
      const itemData = getItemData(inventory[i]);
      itemBoxes.push(
        <div className="item-box" key={i}>
          <p className="item-box-text" title={itemData.name}>
            {inventory[i] == "" ? i + 1 : itemData.icon}
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

  // I forgot to put props around it.
  function Leaderboard({ aspects, players, currentTurn, numTurns, maxTurns }) {
    if (aspects && players) {
      // PlayerID, Standing
      let standings = Array(NUM_PLAYERS);
      for (let i = 0; i < NUM_PLAYERS; i++) {
        standings[i] = 0;
        for (let j = 0; j < NUM_PLAYERS; j++) {
          if (aspects[players[i].aspect] < aspects[players[j].aspect]) {
            standings[i]++;
          }
        }
      }

      console.log(
        "Rendering Leaderboard! Standings:",
        standings,
        "aspects",
        aspects,
        "players",
        players
      );
      function LeaderboardCard({ id, data }) {
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
          <div className="player-box shadow-4" id={id}>
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
      console.log("current turn", currentTurn);
      return (
        <div className="players-boxes-container">
          <h2 className="centered-header">
            {`Turn ${numTurns + 1} of ${maxTurns}`}
          </h2>
          <LeaderboardCard
            id={currentTurn == 0 ? "current-turn" : ""}
            data={{ standing: standings[0], ...players[0] }}
          />
          <LeaderboardCard
            id={currentTurn == 1 ? "current-turn" : ""}
            data={{ standing: standings[1], ...players[1] }}
          />
          <LeaderboardCard
            id={currentTurn == 2 ? "current-turn" : ""}
            data={{ standing: standings[2], ...players[2] }}
          />
          <LeaderboardCard
            id={currentTurn == 3 ? "current-turn" : ""}
            data={{ standing: standings[3], ...players[3] }}
          />
          <button
            onClick={() => {
              // Evaluate random card of current player, using gameData.current_turn_id, gameData.players[gameData.current_turn_id].cards, and evalCard
              const currentPlayerCards =
                gameData.players[gameData.current_turn_id].cards;
              const randomCardIndex = currentPlayerCards.findIndex(
                (card) => card == 1
              );
              if (randomCardIndex !== -1) {
                evalCard(randomCardIndex);
              }
            }}
            //disabled={myPlayerId == gameData.current_turn_id}
          >
            Simulate Next Turn
          </button>
          <button onClick={() => endGame()}>End Game</button>
        </div>
      );
    } else {
      return null;
    }
  }

  if (gameState == GAME_STATES.PLAY) {
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
              {getTextbox()}
              <div className="left-align-container">
                <InventoryContainer inventory={gameData.inventory} />
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
                  {returnCards(gameData.current_turn_id == myPlayerId)}
                  <h2 className="my-turn">My Turn</h2>
                </div>
              </div>
            </div>
          </div>
          <Leaderboard
            aspects={gameData.aspects}
            players={gameData.players}
            currentTurn={gameData.current_turn_id}
            numTurns={gameData.turns}
            maxTurns={NUM_PLAYERS * NUM_CARDS}
          />
        </div>

        {debug ? (
          <div>
            <button onClick={() => console.log(myCards)}>Print cards</button>
            <button onClick={() => console.log(myPlayerId)}>
              Print My Player ID
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
    return (
      <End
        userData={userData}
        setUserData={setUserData}
        gameData={gameData}
        heroData={heroData}
        returnToLobby={returnToLobby}
      />
    );
  }
}
