import cards from "./cards.json";
import items from "./items.json";

const NUM_CARDS = 5;

export let gameData = {};

function getRandomInt(max) {
  // From Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * max);
}

export function getCards() {
  let cardsExport = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    let { outcomes, ...cardWithoutOutcomes } =
      cards[getRandomInt(cards.length)];
    let n = { num_id: i, ...cardWithoutOutcomes };
    cardsExport.push(n);
  }
  return cardsExport;
}

function createGame() {
  // Assign a random order for players
  // Assign each player one of the four aspects
  // Generate 5 random cards for each player
}

export function simulateNextTurn() {}

export function getCardResult(card_id) {
  // get result object from card based on checking conditions
  // append "type": "turn" and "playerTurnName": "<insert player turn name here>"
  // return the object
}

export function getItemIcon(itemName) {
  const item = items.find((item) => item.id == itemName);
  return item ? item.icon : `No icon found for ${itemName}`;
}
