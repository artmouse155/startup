import React from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
//import { ItemTypes } from "./Constants";
import "./play.css";
import "./aspects.css";
import { Aspects } from "./aspects.jsx";

// function makeCardsDraggable() {
//   const draggable_list = document.querySelectorAll(".draggable");
//   let options = {
//     grid: 10,
//     onDrag: function () {
//       console.log("woohoo!");
//     },
//   };
//   for (let i = 0; i < draggable_list.length; i++) {
//     new Draggable(draggable_list[i], options);
//   }
//   console.log("woohoo!");
// }
// TODO: Make the type something else
function Card({
  desc = "No Description",
  effects = [{ amt: 500, type: Aspects.UNKNOWN }],
}) {
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
  return (
    <div className="card draggable">
      <p className="card-body-text">{desc}</p>
      {effect_html}
    </div>
  );
}

function DraggableComponent(props) {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: "card",
    item: { cardId: 42 },
  }));
  return collected.isDragging ? <div ref={dragPreview}></div> : <Card />;
}

function returnCards() {
  return (
    <DndProvider backend={HTML5Backend}>
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

export function Play() {
  // React.useEffect(() => {
  //   makeCardsDraggable();
  // });
  // const [{ isDragging }, dragRef] = useDrag(
  //   () => ({
  //     type: "card",
  //     collect: (monitor) => ({
  //       isDragging: !!monitor.isDragging(),
  //     }),
  //   }),
  //   []
  // );

  return (
    <main>
      <div className="all-play-sections">
        <div className="text-and-inv-and-header">
          <h3 className="centered-header">Elrond's Big Adventure</h3>
          <div className="text-and-inv-section">
            <div className="right-align-container">
              <div className="aspect-boxes-container">
                <div className="aspect-box data-box" id="magic">
                  <p className="aspect-box-text magic" id="magic">
                    ✨ Magic
                  </p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div className="aspect-box data-box" id="strength">
                  <p className="aspect-box-text strength" id="strength">
                    🦾 Strength
                  </p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div className="aspect-box data-box" id="intelligence">
                  <p className="aspect-box-text intelligence" id="intelligence">
                    📖 Intelligence
                  </p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    5
                  </p>
                </div>
                <div className="aspect-box data-box" id="charisma">
                  <p className="aspect-box-text charisma" id="charisma">
                    💄 Charisma
                  </p>
                  <p className="aspect-box-text aspect-box-score" id="amt">
                    300
                  </p>
                </div>
              </div>
            </div>

            <div className="text-adventure-container">
              <div className="text-adventure">
                <div className="text-adventure-text">
                  Eldrond had barely finished stepping both feet inside the
                  dungeon when
                  <b>WHAM!</b> the gate slammed down behind him.
                  <br />"<span>This doesn't look like Kansas anymore!</span>"
                  exclaimed Eldrond.
                  <br />
                  <br />
                  Eldrond looked around and found himself in a small musty room
                  that was
                  <span>filled with bugs</span>. He looked ahead and saw an
                  archway, and inscripted above the arch were the following
                  words: <br />
                  <br />
                  <i>
                    <span>
                      “It's easy to stand in the crowd but it takes courage to
                      stand alone.” - Ghandi
                    </span>
                  </i>
                  <br />
                  <br />
                  Feeling inspired, Eldron began his trek into the unknown.
                  <br />
                  <br />
                  <b>Alice's Turn</b>
                  <br />
                  <br />
                  As Elrond walked, his foot suddenly hit something small and
                  hard. He looked down and... it was a book titled "
                  <span>A Summary of Every Book Ever Written</span>".
                  <br />
                  <br />"<span>Gadzooks!</span>" exclaimed Elrond. He sat on the
                  floor and began to inspect its pages and before he knew it, he
                  had read the whole thing!
                  <br />
                  <br />
                  <b>+5 📖 Intelligence</b>
                  <br />
                  <br />
                  <br />
                  <b>Bob's Turn</b>
                  <br />
                  <br />
                  Down a dark staircase, Elrond noticed a mysterious object
                  glimmering in a hole in the rock on his left. Curious, He
                  reached his hand in and pulled out...
                  <br />
                  <br />
                  A luxirous top hat!
                  <br />
                  <br />
                  Elrond tried the item on, noticed it was very fashionable, and
                  satisfied, placed the clothing item back where he found it.
                  Maybe his adventure was short-lived, but he felt that it
                  somehow left a lasting mark on his appearance.
                  <br />
                  <br />
                  <b>+300 💄 Intelligence</b>
                  <br />
                  <br />
                  <br />
                  <b>Seth's Turn</b>
                  <br />
                  <br />
                  After several hours of walking (and a few minutes of skipping)
                  Elrond came across a well that looked so old, it was as if it
                  would crumble to dust if he touched it. He noticed the bucket
                  was close to the surface of the well and so he took a look
                  inside. He could see what was inside! It was...
                  <br />
                  <br />
                  A mysterious potion of unknown consequence!
                  <br />
                  <br />
                  Just barely able to reach it, Elrond grabbed the item and
                  stuffed it into his inventory. <br />
                  <br />
                  <b>Mysterious Potion Obtained</b>
                  <br />
                </div>
              </div>
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
              <div className="card drag-here-card">
                <p className="drag-here-card-text">Drag card here to play</p>
              </div>

              <div className="card-section">
                <h2 className="my-turn">My Turn</h2>
                {returnCards()}
              </div>
            </div>
          </div>
        </div>

        <div className="players-boxes-container">
          <div className="player-box" id="Player1">
            <div className="players-box-name-and-cards">
              <h4 className="player-box-name">📖 Alice 📖</h4>
              <div className="card-count">
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="played"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
              </div>
            </div>
            <div className="place">
              <div className="place-text-container">
                <p className="big-place-text-number">2</p>
                <p className="place-text">nd</p>
              </div>
            </div>
          </div>

          <div className="player-box" id="Player2">
            <div className="players-box-name-and-cards">
              <h4 className="player-box-name">💄 Bob 💄</h4>
              <div className="card-count">
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="played"></div>
              </div>
            </div>
            <div className="place">
              <div className="place-text-container">
                <p className="big-place-text-number">1</p>
                <p className="place-text">st</p>
              </div>
            </div>
          </div>

          <div className="player-box" id="Player3">
            <div className="players-box-name-and-cards">
              <h4 className="player-box-name">✨ Seth ✨</h4>
              <div className="card-count">
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="played"></div>
                <div className="dummy-card" id="unplayed"></div>
              </div>
            </div>
            <div className="place">
              <div className="place-text-container">
                <p className="big-place-text-number">4</p>
                <p className="place-text">th</p>
              </div>
            </div>
          </div>

          <div className="player-box current-playing-turn" id="Player4">
            <div className="players-box-name-and-cards">
              <h4 className="player-box-name">🦾 Cosmo 🦾</h4>
              <div className="card-count">
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
                <div className="dummy-card" id="unplayed"></div>
              </div>
            </div>
            <div className="place">
              <div className="place-text-container">
                <p className="big-place-text-number">4</p>
                <p className="place-text">th</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
