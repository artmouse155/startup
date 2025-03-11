import cards from "./cards.json";

const NUM_CARDS = 5;

export let gameData = {};

function getRandomInt(max) {
  // From Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * max);
}

export function getCards() {
  let cardsExport = [];
  for (let i = 0; i < NUM_CARDS; i++) {
    let newCard = { num_id: i, ...cards[getRandomInt(cards.length)] };
    cardsExport.push(newCard);
  }
  return cardsExport;
}

function createGame() {
  // Assign a random order for players
  // Assign each player one of the four aspects
  // Generate 5 random cards for each player
}

export function simulateNextTurn() {}
