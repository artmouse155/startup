const cards = require("./cards.json");
const items = require("./items.json");
const introJSON = require("./intro.json");
const endingJSON = require("./ending.json");
const gameConstants = require("./constants.json");
const storyApi = require("./story_api.js");
const shuffler = require("./shuffler.js");

// Pushes outcome to game object provided; doesn't use database. IMPORTANT: Uses pass by REFERENCE
async function pushOutcome(game, outcome, heroData) {
  // Verify game exists
  if (!game) {
    console.log("Game not found");
    return;
  }
  //console.log(`[${game.roomCode}]`, `Parsing outcome`);
  updatedText = [...outcome.text];
  for (let i = 0; i < updatedText.length; i++) {
    updatedText[i] = await storyApi.apiCall(updatedText[i], heroData);
  }
  const updatedOutcome = { ...outcome, text: updatedText };
  console.log(`[${game.roomCode}]`, "Pushed new outcome");
  game.story.push(updatedOutcome);
}

// Get item data
function getItemData(item_id) {
  // If item_id is an object, return item_id
  if (typeof item_id == "object") {
    return item_id;
  }
  if (!item_id) {
    return null;
  }
  const item = items.find((item) => item.id == item_id);
  if (item) {
    return item;
  } else {
    console.log("[] No item found for item_id", item_id);
    return null;
  }
}

module.exports = {
  displayName,
  newGame,
  setupGame,
  evalCard,
  getConnectionData,
};

function displayName(email) {
  // Check if the userName has an '@' in it, if so, use the first part of the email as the display name
  if (email.includes("@")) {
    return email.split("@")[0];
  }
  return email;
}

function newGame(roomCode, email) {
  let gameData = {
    // aspects: {
    //   MAGIC: 0,
    //   STRENGTH: 0,
    //   INTELLIGENCE: 0,
    //   CHARISMA: 0,
    // },
    aspects: {},
    players: [], // Create when we start
    inventory: [], // Create when we call start
    current_turn_id: 0,
    turns: 0, // How many turns have passed
  };

  for (aspect of gameConstants.ASPECTS) {
    gameData.aspects[aspect] = 0;
  }

  let newGame = {
    roomCode: roomCode,
    gameState: gameConstants.GAME_STATES.LOBBY,
    host: email, // Attr not present on server side; this is the email of the host
    players: [], // Attr not present on client side
    constants: {
      num_cards: gameConstants.NUM_CARDS,
      num_players: gameConstants.NUM_PLAYERS,
      num_item_slots: gameConstants.NUM_ITEM_SLOTS,
    },
    heroData: {}, // Create when we call start
    gameData: gameData,
    // story: [{ title: String, ...Outcome }], // Create when we call start
    // tempStory: Outcome, // Create when we call start
  };
  newGame.players.push({ email: email });
  return newGame;
}

async function setupGame(game) {
  // Assign a random order to the players, then assign random aspects.
  const num_players = game.players.length;
  let order = Array.from({ length: num_players }, (_, i) => i); // From https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
  const orderShuffled = shuffler.shuffled(order);

  let aspects = ["MAGIC", "STRENGTH", "INTELLIGENCE", "CHARISMA"];
  const aspectsShuffled = shuffler.shuffled(aspects);
  // First, assign each player in game.players a random turnIndex
  let i = 0;
  let gameDataPlayers = [];
  for (let j = 0; j < num_players; j++) {
    const player = game.players[j];
    const email = player.email;
    game.players[j].turnIndex = orderShuffled[i];
    gameDataPlayers.push({
      email: email,
      aspect: aspectsShuffled[i],
      cards: Array(game.constants.num_cards).fill(1),
    });
    i++;
  }
  // sortgameDataPlayers by game[roomCode].players[email].turnIndex
  gameDataPlayers.sort((a, b) => {
    return (
      game.players.find((item) => item.email == a.email).turnIndex -
      game.players.find((item) => item.email == b.email).turnIndex
    );
  });
  game.gameData.players = gameDataPlayers;
  // Set the gameState to PLAY
  game.gameState = gameConstants.GAME_STATES.PLAY;
  // Set the heroData to the heroName and heroGender from the request body
  game.heroData = storyApi.getRandomHero();

  for (let i = 0; i < game.gameData.players.length; i++) {
    const email = game.gameData.players[i].email;
    //console.log("email:", email);
    // Generate 5 random cards for each player
    // PLACEHOLDER: Variation based on the current aspect of the player
    let cardsExport = [];
    for (let j = 0; j < game.constants.num_cards; j++) {
      let { outcomes, ...cardWithoutOutcomes } = shuffler.getRandom(cards);
      let n = { num_id: j, ...cardWithoutOutcomes };
      cardsExport.push(n);
    }
    game.players.find((item) => item.email == email).cards = cardsExport;
  }

  // Set the story to the introJSON
  game.story = [];

  // Set the tempStory to something random
  game.tempStory = {
    text: [],
    type: "turn",
    playerTurnName: displayName(game.gameData.players[0].email),
  };

  const intro_outcome = shuffler.getRandom(introJSON.sections);

  // Push the intro story, using storyAPI.apiCall to replace $stuff$.
  await pushOutcome(game, intro_outcome, game.heroData);
}

// Evaluates the card and updates the game
async function evalCard(
  game,
  email,
  card_num_id,
  updateRoomConnection,
  setGame,
  addTrophies,
  doNextTurn = true
) {
  // get result object from card based on checking conditions
  // console.log("Checking card", card_id);
  const roomCode = game.roomCode;
  let gameData = game.gameData;
  const current_turn_id = gameData.current_turn_id;

  console.log(
    `[${roomCode}] Player ${email} is playing card ${card_num_id} from their hand.`
  );

  // If this card has already been played, something crazy is going on!
  const card_id = game.players.find((item) => item.email == email).cards[
    card_num_id
  ].id;
  const card = cards.find((card) => card.id == card_id);
  if (!card) {
    console.log(`[${roomCode}]`, "No card found for card", card_num_id);
    return false;
  }

  const outcomes = card.outcomes;
  if (!outcomes) {
    console.log(`[${roomCode}]`, "No outcomes found for card", card);
    return false;
  }

  // This card is no longer playable.
  game.gameData.players[current_turn_id].cards[card_num_id] = 0;

  for (let i = 0; i < outcomes.length; i++) {
    const outcome = outcomes[i];
    const { conditions = [], results = [] } = outcome || {};
    let text = [...outcome.text] || [];

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
      if (results) {
        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          const resultType = result.type;
          switch (resultType) {
            case "aspect-points":
              game.gameData.aspects[result.aspect] += parseInt(result.amt);
              break;

            case "item-obtained":
              // Add item to inventory. The inventory is a list of strings that represent the item names.
              // If you try to add an item to a full inventory, the oldest item disappears.
              // If the inventory is full, remove the first item
              if (
                game.gameData.inventory.length >= game.constants.num_item_slots
              ) {
                const removed = game.gameData.inventory.shift(); // Remove the first item
                text.push(
                  `_Too many items. Discarded ${getItemData(removed)?.name}_` // Optional chaining! WOOHOO
                );
              }
              const itemData = getItemData(result.item);
              result.itemData = itemData;
              game.gameData.inventory.push(result.item); // Add the new item
              break;
            case "item-used-firstmost":
              // Remove the first item from the inventory
              if (game.gameData.inventory.length > 0) {
                const item = game.gameData.inventory.shift(); // Remove the first item
                const itemData = getItemData(item);
                result.itemData = itemData; // Add the item data to the result
              } else {
                text.push(`_No items to use_`);
              }
              break;
            default:
              console.log(
                `[${roomCode}]`,
                "No result found for type",
                resultType
              );
              break;
          }
        }
      }
      const getCardUserName = () => {
        return displayName(gameData.players[gameData.current_turn_id].email);
      };

      // Push outcome to story
      await pushOutcome(
        game,
        {
          type: "turn",
          playerTurnName: getCardUserName(),
          text: text,
          results: results,
        },
        game.heroData
      );

      // Go to next player's turn
      if (doNextTurn) {
        game.gameData.current_turn_id++;
        if (game.gameData.current_turn_id >= game.players.length) {
          game.gameData.current_turn_id = 0;
        }
        game.gameData.turns++;
        if (
          game.gameData.turns >=
          game.constants.num_cards * game.players.length
        ) {
          if (game.gameState != gameConstants.GAME_STATES.END) {
            game.gameState = gameConstants.GAME_STATES.END;

            const ending_outcome = shuffler.getRandom(endingJSON.sections);

            // Push the intro story, using storyAPI.apiCall to replace $stuff$.
            await pushOutcome(game, ending_outcome, game.heroData);
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

            const standings = getStandings(
              game.gameData.aspects,
              game.gameData.players,
              game.gameData.players.length
            );

            const trophy_counts =
              gameConstants.TROPHY_COUNTS[game.gameData.players.length];
            // console.log("Standings", standings);
            // console.log("Trophy Counts:", trophy_counts);
            // console.log("Trophy Counts at 1:", trophy_counts[1]);

            for (let i = 0; i < game.players.length; i++) {
              const player = game.gameData.players[i];
              const trophiesEarned = trophy_counts
                ? trophy_counts[standings[i] + 1] ||
                  gameConstants.TROPHY_COUNT_FALLBACK
                : gameConstants.TROPHY_COUNT_FALLBACK;
              const email = player.email;
              game.gameData.players[i] = {
                trophiesEarned: trophiesEarned,
                ...player,
              };
              await addTrophies({ email: email, trophies: trophiesEarned });
            }
            console.log(`[${roomCode}]`, "Game ended");
          }
        }
      }

      // Set tempStory
      game.tempStory =
        game.gameState == gameConstants.GAME_STATES.END
          ? { type: "empty" }
          : {
              type: "turn",
              playerTurnName: getCardUserName(),
              text: [],
            };

      // Set the game with MongoDB
      await setGame(roomCode, game);

      updateRoomConnection(game);

      return true;
    }
  }
  console.log(`[${roomCode}]`, "No outcome found for card", card);
  return false;
}

// Format the connection data for the client
function getConnectionData(game, email) {
  if (!game) {
    console.log(`[     ] no game found for email`, email);
    return null;
  }
  const roomCode = game.roomCode;
  const playerIndex = game.players.findIndex((item) => item.email == email);
  if (playerIndex == -1) {
    console.log(`[${roomCode}]`, "Player not found", email);
    return null;
  }
  const player = game.players[playerIndex];
  console.log(`[${roomCode}]`, "Sending connection data to", email);
  const clientGameData = { ...game.gameData };
  clientGameData.players = clientGameData.players.map((p) => {
    return {
      name: displayName(p.email),
      aspect: p.aspect,
      cards: p.cards,
      trophiesEarned: p.trophiesEarned,
    };
  });
  clientGameData.inventory = clientGameData.inventory.map((i) => {
    // Only send id, name and icon fields
    const itemData = getItemData(i);
    if (!itemData) return null;
    const { id, name, icon } = itemData;
    return { id, name, icon };
  });
  const connectionData = {
    roomCode: roomCode,
    gameState: game.gameState,
    amHost: game.host == email,
    host: displayName(game.host),
    myPlayerId: player.turnIndex,
    players: game.players.map((p) => displayName(p.email)),
    myCards: player.cards,
    constants: game.constants,
    heroData: game.heroData,
    gameData: clientGameData,
    story: game.story,
    tempStory: game.tempStory,
  };
  return connectionData;
}
