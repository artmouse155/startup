import React from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import "./play.css";
import "./aspects.css";
import { TextBox } from "./textbox/textbox.jsx";
import Aspects from "./aspects.json";
import { End } from "./end.jsx";

const GAME_STATES = {
  LOBBY: 0,
  PLAY: 1,
  END: 2,
};

export function Game({
  userData,
  setUserData,
  connectionData,
  handleExit,
  debug = false,
}) {
  const {
    roomCode,
    gameState,
    host,
    myPlayerId,
    constants,
    myCards,
    heroData,
    gameData,
    story,
    tempStory,
  } = connectionData;

  const ItemType = { CARD_TYPE: "card" };
  const [gameLoaded, setGameLoaded] = React.useState(false);
  React.useEffect(() => {
    if (gameState == GAME_STATES.PLAY) {
      // console.log("Game loaded!");
      setGameLoaded(true);
    }
  }, []);

  function CardBox({ isMyTurn, cards }) {
    // console.log("Rendering player cards!", cards);
    function CardDragLayer() {
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
          className="game-card drag-layer shadow-5"
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
        <div className="card-relative-pos">
          <div className="transparent-card draggable" ref={preview}></div>
          <CardDragLayer />
        </div>
      );

      let card = (
        <div
          className={`game-card ${
            isMyTurn ? "draggable" : ""
          } card-relative-pos shadow-5`}
          ref={isMyTurn ? drag : null}
        >
          <p className="card-body-text">{desc}</p>
          {effect_html}
        </div>
      );
      return isDragging ? cardPreview : card;
    }

    let cardArray = [];
    // console.log("Rendered player cards!");
    for (let index = 0; index < cards.length; index++) {
      const { num_id, id, desc, effects = [] } = cards[index];
      cardArray.push(
        <div className="individual-card-container" key={index}>
          <Card num_id={num_id} id={id} desc={desc} effects={effects} />
        </div>
      );
    }
    return <DndProvider backend={HTML5Backend}>{cardArray}</DndProvider>;
  }

  function endGame() {}

  async function useCard(card) {
    let card_num_id = card.num_id;
    if (gameData.players[gameData.current_turn_id].cards[card_num_id] == 1) {
      const response = await fetch(
        `api/game/server/${roomCode}/card/${card.num_id}/use`,
        {
          method: "post",
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );
      if (response?.status === 200) {
        // pingServer();
        return true;
      } else {
        const body = await response.json();
        alert(`⚠ Error: ${body.msg}`);
      }
    }
    console.log("Card not found in player's hand.");
    return false;
  }

  function InventoryContainer({ inventory }) {
    let itemBoxes = [];
    for (let i = 0; i < constants.num_item_slots; i++) {
      // console.log("Trying to get item data!", inventory[i]);
      let title = `Empty Slot`;
      let text = `${i + 1}`;
      if (i < inventory.length && inventory[i]) {
        title = inventory[i].name;
        text = inventory[i].icon;
      }
      itemBoxes.push(
        <div className="item-box" key={i}>
          <p className="item-box-text" title={title}>
            {text}
          </p>
        </div>
      );
    }
    return (
      <div>
        <h3 className="centered-header">Inventory</h3>
        <div className="items-container">{itemBoxes}</div>
      </div>
    );
  }

  function getStandings(aspects, players, player_count) {
    // PlayerID, Standing
    let standings = Array(player_count);
    // This needs to equal the true number of players, not just the capacity.
    for (let i = 0; i < player_count; i++) {
      standings[i] = 0;
      for (let j = 0; j < player_count; j++) {
        // console.log("Comparing", players[i].aspect, players[j].aspect);
        if (aspects[players[i].aspect] < aspects[players[j].aspect]) {
          standings[i]++;
        }
      }
    }
    return standings;
  }

  // I forgot to put props around it.
  function Leaderboard({ gameData, constants }) {
    const { aspects, players, current_turn_id, turns } = gameData;
    const maxTurns = players.length * constants.num_cards;
    const player_count = players ? players.length : 0;
    if (aspects && players) {
      const standings = getStandings(aspects, players, player_count);

      // console.log(
      //   "Rendering Leaderboard! Standings:",
      //   standings,
      //   "aspects",
      //   aspects,
      //   "players",
      //   players
      // );
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
      // console.log("current turn", current_turn_id);

      let leaderboardCardList = [];
      for (let i = 0; i < player_count; i++) {
        leaderboardCardList.push(
          <LeaderboardCard
            id={current_turn_id == i ? "current-turn" : ""}
            data={{ standing: standings[i], ...players[i] }}
            key={i}
          />
        );
      }

      return (
        <div className="players-boxes-container">
          <h2 className="centered-header">
            {gameState == GAME_STATES.END
              ? `Game Complete`
              : `Turn ${turns + 1} of ${maxTurns}`}
          </h2>
          {leaderboardCardList}
        </div>
      );
    } else {
      return null;
    }
  }

  if (gameState == GAME_STATES.PLAY || gameLoaded) {
    return (
      <div className="game-container">
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
            <p className="aspect-box-text intelligence">📖 Intelligence</p>
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
        <div id="my-cards-and-textbox" className="flex-column">
          <h3 className="centered-header" id="adventure-title">
            {`${heroData.name}'s ${heroData.adventureName || `Adventure`}`}
          </h3>
          <div className="center-section">
            <DndProvider backend={HTML5Backend}>
              <TextBox
                dragItemType={ItemType.CARD_TYPE}
                story={story}
                tempStory={tempStory}
                useCard={useCard}
                setGameLoaded={setGameLoaded}
              />
            </DndProvider>
            <div className="whose-turn-container">
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
              <div className="all-card-sections"></div>
            </div>
            <div className="card-section">
              <CardBox
                isMyTurn={gameData.current_turn_id == myPlayerId}
                // cards={myCards.filter(
                //   (card, index) =>
                //     gameData.players[myPlayerId].cards[index] == 1
                // )}
                cards={myCards.filter(
                  (card, index) =>
                    gameData.players[myPlayerId].cards[index] == 1
                )}
              />
            </div>
          </div>
        </div>
        <InventoryContainer inventory={gameData.inventory} />
        <Leaderboard gameData={gameData} constants={constants} />
        {debug ? (
          <div>
            <button onClick={() => console.log(myCards)}>Print cards</button>
            <button onClick={() => console.log(myPlayerId)}>
              Print My Player Turn #
            </button>
            <button onClick={() => console.log(gameData.current_turn_id)}>
              Print Current Player Turn #
            </button>
            <button onClick={() => console.log(heroData)}>
              Print Hero Data
            </button>
            <button onClick={() => console.log(gameData)}>
              Print Game Data
            </button>
          </div>
        ) : null}
      </div>
    );
  } else if (gameState == GAME_STATES.END) {
    return (
      <End
        userData={userData}
        myPlayerId={myPlayerId}
        setUserData={setUserData}
        gameData={gameData}
        heroData={heroData}
        getStandings={() =>
          getStandings(
            gameData.aspects,
            gameData.players,
            gameData.players.length
          )
        }
        handleExit={handleExit}
      />
    );
  }
}
