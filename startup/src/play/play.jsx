import React from "react";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import "./play.css";
import "./aspects.css";
import { TextBox } from "./textbox/textbox.jsx";
import { Aspects } from "./aspects.jsx";

const ItemType = { CARD_TYPE: "card" };

let gameData = {
  aspects: {
    MAGIC: 0,
    STRENGTH: 0,
    INTELLIGENCE: 5,
    CHARISMA: 5,
  },
  players: {
    p1: {
      name: "Alice",
      aspect: "INTELLIGENCE",
      cards: [1, 0, 1, 1, 1],
    },
    p2: {
      name: "Bob",
      aspect: "CHARISMA",
      cards: [1, 1, 1, 1, 0],
    },
    p3: {
      name: "Seth",
      aspect: "MAGIC",
      cards: [1, 1, 1, 0, 1],
    },
    p4: {
      name: "Cosmo",
      aspect: "STRENGTH",
      cards: [1, 2, 1, 1, 1],
    },
  },
};

// Code from https://react-dnd.github.io/react-dnd/about
function getItemStyles(initialOffset, currentOffset) {
  if (!initialOffset || !currentOffset) {
    return {
      display: "none",
    };
  }
  let {
    x = currentOffset.x - initialOffset.x,
    y = currentOffset.y - initialOffset.y,
  } = {};
  const transform = `translate(${x}px, ${y}px)`;
  return {
    position: "absolute !important",
    transform,
    WebkitTransform: transform,
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

  console.log("Interacted with ", item);
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
    <div className="card" style={getItemStyles(initialOffset, currentOffset)}>
      <p className="card-body-text">{desc}</p>
      {effect_html}
    </div>
  );
  return isDragging ? card : <div></div>;
}

function Card({
  desc = "No Description",
  effects = [{ amt: 500, type: Aspects.UNKNOWN }],
}) {
  const [{ isDragging }, drag, preview] = useDrag(() => ({
    type: ItemType.CARD_TYPE,
    item: { desc, effects },
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
    <div className="transparent-card draggable" ref={preview}></div>
  );

  let card = (
    <div className="card draggable" ref={drag}>
      <p className="card-body-text">{desc}</p>
      {effect_html}
    </div>
  );
  return isDragging ? cardPreview : card;
}

const DroppableArea = () => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemType.BOX,
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  }));

  return (
    <div
      ref={drop}
      style={{
        marginTop: 20,
        padding: 50,
        background: isOver ? "lightgreen" : "lightgray",
      }}
    >
      Drop here
    </div>
  );
};

function returnCards() {
  return (
    <DndProvider backend={HTML5Backend}>
      <CardDragLayer />
      <Card
        desc="Read a magic inscription on the wall"
        effects={[{ amt: 5, type: Aspects.MAGIC }]}
      />
      <Card desc="Add Magic Telescope to inventory" effects={[]} />
      <Card desc="Use topmost item in inventory" effects={[]} />
      <Card
        desc="Enter cobweb-infested room"
        effects={[
          { amt: 3, type: Aspects.STRENGTH },
          { amt: 2, type: Aspects.UNKNOWN },
        ]}
      />
      <Card
        desc="Read a magic inscription on the wall"
        effects={[{ amt: 5, type: Aspects.MAGIC }]}
      />
    </DndProvider>
  );
}

function Leaderboard() {
  function LeaderboardCard({ data }) {
    //data = { cards: [1, 1, 1, 1, 0] };
    const emoji = Aspects[data.aspect].emoji;
    return (
      <div className="player-box" id="Player1">
        <div className="players-box-name-and-cards">
          <h4 className="player-box-name">
            {`${emoji} ${data.name} ${emoji}`}
          </h4>
          <div className="card-count">
            <div
              className="dummy-card"
              id={data.cards[0] ? "unplayed" : "played"}
            ></div>
            <div
              className="dummy-card"
              id={data.cards[1] ? "unplayed" : "played"}
            ></div>
            <div
              className="dummy-card"
              id={data.cards[2] ? "unplayed" : "played"}
            ></div>
            <div
              className="dummy-card"
              id={data.cards[3] ? "unplayed" : "played"}
            ></div>
            <div
              className="dummy-card"
              id={data.cards[4] ? "unplayed" : "played"}
            ></div>
          </div>
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
      <LeaderboardCard data={gameData.players.p1} />
      <LeaderboardCard data={gameData.players.p2} />
      <LeaderboardCard data={gameData.players.p3} />
      <LeaderboardCard data={gameData.players.p4} />
    </div>
  );
}

export function Play() {
  React.useCallback(() => console.log("Yeet"));

  return (
    <main>
      <div className="all-play-sections">
        <div className="text-and-inv-and-header">
          <h3 className="centered-header">Elrond's Big Adventure</h3>
          <div className="text-and-inv-section">
            <div className="right-align-container">
              <div className="aspect-boxes-container">
                <div className="aspect-box data-box" id="MAGIC">
                  <p className="aspect-box-text magic">✨ Magic</p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div className="aspect-box data-box" id="STRENGTH">
                  <p className="aspect-box-text strength">🦾 Strength</p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div className="aspect-box data-box" id="INTELLIGENCE">
                  <p className="aspect-box-text intelligence">
                    📖 Intelligence
                  </p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div className="aspect-box data-box" id="CHARISMA">
                  <p className="aspect-box-text charisma">💄 Charisma</p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
              </div>
            </div>

            <div className="text-adventure-container">
              <TextBox />
            </div>
            <div className="left-align-container">
              <div className="items-container">
                <h3 className="centered-header">Inventory</h3>
                <div className="item-box">
                  <p className="item-box-text">1</p>
                </div>
                <div className="item-box">
                  <p className="item-box-text">2</p>
                </div>
                <div className="item-box">
                  <p className="item-box-text">3</p>
                </div>
              </div>
            </div>
          </div>
          <div className="whose-turn-and-all-card-sections">
            <div className="whose-turn">
              <h3>Your Turn</h3>
            </div>
            <div className="all-card-sections">
              <div className="card-section">
                <h2 className="my-turn">My Turn</h2>
                {returnCards()}
              </div>
            </div>
          </div>
        </div>
        <Leaderboard />
      </div>
    </main>
  );
}
