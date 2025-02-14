import React from "react";

export function Play() {
  return (
    <main>
      <div class="all-play-sections">
        <div class="text-and-inv-and-header">
          <h3 class="centered-header" style="display: unset">
            Elrond's Big Adventure
          </h3>
          <div class="text-and-inv-section">
            <div class="right-align-container">
              <div class="aspect-boxes-container">
                <div class="aspect-box data-box" id="magic">
                  <p class="aspect-box-text magic" id="magic">
                    ✨ Magic
                  </p>
                  <p class="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div class="aspect-box data-box" id="strength">
                  <p class="aspect-box-text strength" id="strength">
                    🦾 Strength
                  </p>
                  <p class="aspect-box-text aspect-box-score" id="amt">
                    0
                  </p>
                </div>
                <div class="aspect-box data-box" id="intelligence">
                  <p class="aspect-box-text intelligence" id="intelligence">
                    📖 Intelligence
                  </p>
                  <p class="aspect-box-text aspect-box-score" id="amt">
                    5
                  </p>
                </div>
                <div class="aspect-box data-box" id="charisma">
                  <p class="aspect-box-text charisma" id="charisma">
                    💄 Charisma
                  </p>
                  <p class="aspect-box-text aspect-box-score" id="amt">
                    300
                  </p>
                </div>
              </div>
            </div>

            <div class="text-adventure-container">
              <div class="text-adventure">
                <div class="text-adventure-text">
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
            <div class="left-align-container">
              <div class="items-container">
                <h3 class="centered-header">Inventory</h3>
                <div class="item-box">
                  <p class="item-box-text">1</p>
                </div>
                <div class="item-box">
                  <p class="item-box-text">2</p>
                </div>
                <div class="item-box">
                  <p class="item-box-text">3</p>
                </div>
              </div>
            </div>
          </div>
          <div class="whose-turn-and-all-card-sections">
            <div class="whose-turn">
              <h3>Your Turn</h3>
            </div>

            <div class="all-card-sections">
              <div class="card drag-here-card">
                <p class="drag-here-card-text">Drag card here to play</p>
              </div>

              <div class="card-section">
                <h2 class="my-turn">My Turn</h2>
                <div class="card draggable">
                  <p class="card-body-text">
                    Read a magic inscription on the wall
                  </p>
                  <p class="card-outcome-text magic">
                    <b>+ 5 ✨Magic</b>
                  </p>
                </div>
                <div class="card draggable">
                  <p class="card-body-text">
                    Add <i class="magic">Magic Telescope</i> to inventory
                  </p>
                </div>
                <div class="card draggable">
                  <p class="card-body-text">Use topmost item in inventory</p>
                </div>
                <div class="card draggable">
                  <p class="card-body-text">Enter cobweb-infested room</p>
                  <p class="card-outcome-text strength">
                    <b>+ 3 🦾Strength</b>
                  </p>
                  <p class="card-outcome-text unknown">
                    <b>+ 2 ???</b>
                  </p>
                </div>
                <div class="card draggable">
                  <p class="card-body-text">
                    Read a magic inscription on the wall
                    <br />
                  </p>
                  <p class="card-outcome-text magic">
                    <b>+ 5 ✨Magic</b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="players-boxes-container">
          <div class="player-box" id="Player1">
            <div class="players-box-name-and-cards">
              <h4 class="player-box-name">📖 Alice 📖</h4>
              <div class="card-count">
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="played"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
              </div>
            </div>
            <div class="place">
              <div class="place-text-container">
                <p class="big-place-text-number">2</p>
                <p class="place-text">nd</p>
              </div>
            </div>
          </div>

          <div class="player-box" id="Player2">
            <div class="players-box-name-and-cards">
              <h4 class="player-box-name">💄 Bob 💄</h4>
              <div class="card-count">
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="played"></div>
              </div>
            </div>
            <div class="place">
              <div class="place-text-container">
                <p class="big-place-text-number">1</p>
                <p class="place-text">st</p>
              </div>
            </div>
          </div>

          <div class="player-box" id="Player3">
            <div class="players-box-name-and-cards">
              <h4 class="player-box-name">✨ Seth ✨</h4>
              <div class="card-count">
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="played"></div>
                <div class="dummy-card" id="unplayed"></div>
              </div>
            </div>
            <div class="place">
              <div class="place-text-container">
                <p class="big-place-text-number">4</p>
                <p class="place-text">th</p>
              </div>
            </div>
          </div>

          <div class="player-box current-playing-turn" id="Player4">
            <div class="players-box-name-and-cards">
              <h4 class="player-box-name">🦾 Cosmo 🦾</h4>
              <div class="card-count">
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
                <div class="dummy-card" id="unplayed"></div>
              </div>
            </div>
            <div class="place">
              <div class="place-text-container">
                <p class="big-place-text-number">4</p>
                <p class="place-text">th</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
