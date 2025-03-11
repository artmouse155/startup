import cards from "./cards.json";
import items from "./items.json";

const NUM_CARDS = 5;
const NUM_PLAYERS = 4;

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
  const card = cards.find((card) => card.id == card_id);

  const outcomes = card.outcomes;
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
      return {
        ...outcome,
        type: "turn",
        playerTurnName: gameData.self.player,
      };
    }
  }
}

export function getItemIcon(itemName) {
  const item = items.find((item) => item.id == itemName);
  return item ? item.icon : `No icon found for ${itemName}`;
}

export function obtainItem(itemName) {}

export { NUM_PLAYERS };
