import cards from "./cards.json";
import items from "./items.json";
import introJSON from "./intro.json";

const NUM_CARDS = 5;
const NUM_PLAYERS = 4;
const NUM_ITEM_SLOTS = 3;

let gameData = {
  aspects: {
    MAGIC: 10,
    STRENGTH: 0,
    INTELLIGENCE: 5,
    CHARISMA: 5,
  },
  players: [
    {
      name: "Alice",
      aspect: "UNKNOWN",
      cards: [1, 0, 1, 1, 1],
    },
    {
      name: "Bob",
      aspect: "UNKNOWN",
      cards: [1, 1, 1, 1, 0],
    },
    {
      name: "Seth",
      aspect: "UNKNOWN",
      cards: [1, 1, 1, 0, 1],
    },
    {
      name: "Cosmo",
      aspect: "UNKNOWN",
      cards: [1, 1, 1, 1, 1],
    },
  ],
  //inventory: ["magic-potion", "", ""],
  inventory: Array(NUM_ITEM_SLOTS).fill(""),
  current_turn_id: 3,
  turns: 0,
};

let playerCards = [{}, {}, {}, {}];

let turnEndFunc = (_playerData) => {};
let textboxPushFunc = (_storyElem) => {};
let textboxSetCurrentTurnFunc = (_currentTurnId) => {};

function getRandomInt(max) {
  // From Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * max);
}

// Returns specific cards
export function getPlayerCards(player_id) {
  return playerCards[player_id];
}

function generateCards() {
  let cardsExport = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    let { outcomes, ...cardWithoutOutcomes } =
      cards[getRandomInt(cards.length)];
    let n = { num_id: i, ...cardWithoutOutcomes };
    cardsExport.push(n);
  }
  return cardsExport;
}

export function createGame() {
  // Assign a random order for players
  // From https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  // Shuffle players

  // Assign each player one of the four aspects
  const aspects = ["MAGIC", "STRENGTH", "INTELLIGENCE", "CHARISMA"];
  gameData.players.forEach((player, index) => {
    player.aspect = aspects[index];
  });

  // Generate 5 random cards for each player
  for (let i = 0; i < NUM_PLAYERS; i++) {
    playerCards[i] = generateCards();
  }

  let _gameData = { ...gameData };

  let _heroData = {
    heroName: "Elrond",
    heroGender: "male",
  };

  return { _gameData, _heroData };
}

export function initTextbox() {
  const init_story = [
    introJSON.sections[getRandomInt(introJSON.sections.length)],
  ];
  const init_name = gameData.players[gameData.current_turn_id].name;
  return { init_story, init_name };
}

export function setTurnEndFunc(func) {
  turnEndFunc = func;
}

export function setTextboxPushFunc(func) {
  textboxPushFunc = func;
}

export function setTextboxSetCurrentTurnFunc(func) {
  textboxSetCurrentTurnFunc = func;
}

export function nextTurn() {
  gameData.current_turn_id = (gameData.current_turn_id + 1) % NUM_PLAYERS;
  gameData.turns++;
  textboxSetCurrentTurnFunc(gameData.players[gameData.current_turn_id].name);
  turnEndFunc(gameData);
}

// Will compute card result and return the text of the result.
export function evalCard(card_num_id) {
  // get result object from card based on checking conditions
  // console.log("Checking card", card_id);
  console.log(
    `Player ${
      gameData.players[gameData.current_turn_id].name
    } is playing card ${card_num_id} from their hand.`
  );
  ``;

  // If this card has already been played, something crazy is going on!

  const card_id = playerCards[gameData.current_turn_id][card_num_id].id;
  const card = cards.find((card) => card.id == card_id);
  if (!card) {
    console.log("No card found for card", card_num_id);
    return null;
  }

  const outcomes = card.outcomes;
  if (!outcomes) {
    console.log("No outcomes found for card", card);
    return null;
  }

  // This card is no longer playable.
  gameData.players[gameData.current_turn_id].cards[card_num_id] = 0;

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    const conditions = outcome.conditions;

    let conditionsMet = true;
    for (let j = 0; j < conditions.length; j++) {
      const condition = conditions[j];

      if (condition.hasItem) {
        if (!gameData.inventory.includes(condition.hasItem)) {
          conditionsMet = false;
          break;
        }
      }

      if (condition.randomChance) {
        if (Math.random() > parseFloat(condition.randomChance)) {
          conditionsMet = false;
          break;
        }
      }
    }

    if (conditionsMet) {
      // Evaluate the result of outcome
      if (outcome.result) {
        const results = outcome.result;
        for (let j = 0; j < results.length; j++) {
          const result = results[j];

          if (result.type == "aspect-points") {
            gameData.aspectPoints[result.aspect] += parseInt(result.amt);
          }

          if (result.type == "item-obtained") {
            // Add item to inventory. The inventory is a list of strings that represent the item names.
            // If there isn't an item in the slot, the value of the slot is "".
            // You always have NUM_ITEM_SLOTS slots in your inventory.
            // If you try to add an item to a full inventory, the oldest item disappears.
            if (gameData.inventory.length >= NUM_ITEM_SLOTS) {
              gameData.inventory.shift(); // Remove the oldest item
              gameData.inventory.push(result.item);
              outcome.text.push(`_Not enough room. Oldest item removed._`);
            } else {
              for (let k = 0; k < gameData.inventory.length; k++) {
                if (gameData.inventory[k] === "") {
                  gameData.inventory[k] = result.item;
                  break;
                }
              }
            }
          }
        }
      }
      const cardPlayerName = gameData.players[gameData.current_turn_id].name;

      textboxPushFunc({
        ...outcome,
        type: "turn",
        playerTurnName: cardPlayerName,
      });

      // Go to next player's turn
      nextTurn();

      return true;
    }
  }
  console.log("No outcome found for card", card);
  return null;
}

export function getItemIcon(itemName) {
  const item = items.find((item) => item.id == itemName);
  return item ? item.icon : `No icon found for ${itemName}`;
}

export { NUM_PLAYERS, NUM_CARDS, NUM_ITEM_SLOTS };
