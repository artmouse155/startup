const cards = require("./game/cards.json");
const items = require("./game/items.json");
const introJSON = require("./game/intro.json");
const endingJSON = require("./game/ending.json");
const gameConstants = require("./game/constants.json");
const storyApi = require("./game/story_api.js");
const shuffler = require("./game/shuffler.js");

const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const uuid = require("uuid");
const app = express();

const DB = require("./db.js");

const authCookieName = "token";

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());

app.use(cookieParser());

// Show static content
app.use(express.static("public"));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

//#region Auth

// create new user
apiRouter.post("/auth/create", async (req, res) => {
  // has email and password
  if (await DB.getUser(req.body.email)) {
    res.status(409).send({ msg: "Existing user" });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    // respond with only the email
    // console.log(users);

    res.send({ email: user.email, trophies: user.trophies });
  }
});

// log in a user
apiRouter.post("/auth/login", async (req, res) => {
  const user = await DB.getUser(req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      await DB.updateUser(user);
      setAuthCookie(res, user.token);
      res.send({ email: user.email, trophies: user.trophies });
      return;
    }
  }
  res.status(401).send({ msg: "Unauthorized" });
});

// logout a user
apiRouter.delete("/auth/logout", async (req, res) => {
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Check if the user is authorized
const verifyAuth = async (req, res, next) => {
  // console.log("Verifying Auth!", req.cookies[authCookieName]);
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  // console.log("User:", user);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
};
//#endregion Auth

// Get user data
async function getUserData(req) {
  // console.log("Getting user data", req.cookies[authCookieName]);
  const user = await DB.getUserByToken(req.cookies[authCookieName]);
  if (user) {
    return { email: user.email, trophies: user.trophies };
  } else {
    return { email: null, trophies: null };
  }
}
//#region Trophies
// Get the number of trophies the user has
apiRouter.get("/trophy", verifyAuth, async (req, res) => {
  const userData = await getUserData(req);
  res.send({ trophies: userData.trophies });
});

// Get all trophies
apiRouter.get("/trophies", async (req, res) => {
  // only send the email and number of trophies for each user
  // only return everything before the @ symbol of the email
  const trophies = (await DB.getHighScores()).map((user) => {
    return { userName: displayName(user.email), trophies: user.trophies };
  });
  console.log(trophies);
  res.send(trophies);
});
//#endregion Trophies

//#region Game
var gameRouter = express.Router(); // Must be authenticated to use
apiRouter.use(`/game`, gameRouter);

//#region gameVerification
gameRouter.use(verifyAuth);

const verifyRoomCode = async (req, res, next) => {
  req.game = await DB.getGame(req.roomCode);
  if (req.game) {
    next();
  } else {
    res
      .status(403)
      .send({ msg: `Game not found (Room code: ${req.roomCode})` });
  }
};

const verifyCurrentPlayer = async (req, res, next) => {
  const roomCode = req.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);

  // verify that it is the sender's turn
  const game = await DB.getGame(roomCode);
  const currentTurnId = game.gameData.current_turn_id;
  const currentPlayerEmail = game.gameData.players[currentTurnId].email;
  if (currentPlayerEmail) {
    if (userData.email == currentPlayerEmail) {
      next();
    } else {
      res.status(401).send({ msg: "Nice try, Daniel." });
    }
  }
};
//#endregion gameVerification

gameRouter.post("/host", async (req, res) => {
  // add the game to the active games list
  // Create new roomCode that isn't in use
  // Create list of all room codes
  // Codes are 5 letters long

  const userData = await getUserData(req);
  const email = userData.email;
  let roomCode = await findRoomCodeByPlayerEmail(email);
  // console.log(roomCode);
  if (roomCode) {
    await removePlayerFromGame(email);
    return res
      .status(409)
      .send({ msg: `Already in game. Room code: ${roomCode}.` });
  }
  let usedCodes = Object.keys(await DB.getAllGames());
  do {
    // Generate room code
    roomCode = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let codeLength = 5;
    for (let i = 0; i < codeLength; i++) {
      roomCode += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
  } while (usedCodes.length > 0 && usedCodes.includes(roomCode));

  let gameData = {
    aspects: {
      MAGIC: 0,
      STRENGTH: 0,
      INTELLIGENCE: 0,
      CHARISMA: 0,
    },
    players: [], // Create when we start
    inventory: [], // Create when we call start
    current_turn_id: 0,
    turns: 0, // How many turns have passed
  };

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
  await DB.setGame(roomCode, newGame);
  console.log(`[${roomCode}]`, email, "created new game");
  res.status(200).send({ roomCode: roomCode });
});

gameRouter.post("/join/:roomCode", async (req, res) => {
  // See if req.params.roomCode is in the active games list
  // Then, see if the player is already in the game or if there are already 4 players (the max)
  // If the player is already in the game, respond with a message saying they are already in the game
  // If there are already 4 players, respond with a message saying the game is full
  // Otherwise, add the player to the game and respond with a message saying they joined the game
  // If the room code is not in the active games list, respond with a message saying the game does not exist

  const userData = await getUserData(req);
  const email = userData.email;
  const roomCode = req.params.roomCode;
  const game = await DB.getGame(roomCode);
  if (game) {
    if (game.gameState != gameConstants.GAME_STATES.LOBBY) {
      return res.status(409).send({ msg: "Game already started or ended" });
    }
    if (game.players.length >= game.constants.num_players) {
      return res.status(403).send({ msg: "Game full" });
    }
    for (let j = 0; j < game.players.length; j++) {
      if (game.players[j].email == email) {
        await removePlayerFromGame(email);
        return res.status(409).send({
          msg: `Already in game. Room code: ${roomCode}.`,
        });
      }
    }
    game.players.push({ email: email });
    await DB.setGame(roomCode, game);
    console.log(`[${roomCode}]`, email, "joined");
    res.status(200).send(await getConnectionData(roomCode, email));
  } else {
    res
      .status(403)
      .send({ msg: `Game not found (Room code: ${req.roomCode})` });
  }
});

gameRouter.delete("/leave", async (req, res) => {
  // Remove user from current game
  const userData = await getUserData(req);
  const email = userData.email;
  await removePlayerFromGame(email);
  res.status(204).end();
  // Find by room code
});

//#region GameServer
var gameServerRouter = express.Router();
gameRouter.use(`/server/:roomCode`, gameServerRouter);

gameRouter.param("roomCode", (req, res, next, roomCode) => {
  //console.log(`[${roomCode}]`);
  req.roomCode = roomCode;
  next();
});

gameServerRouter.use(verifyRoomCode);

// Client request to start a game
gameServerRouter.post("/start", async (req, res) => {
  const roomCode = req.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);
  // If the user is the host, start the game
  console.log(`[${roomCode}]`, "Game start requested by", userData.email);
  if (req.game.host == userData.email) {
    // If the game state is already play, we don't need to set up. Instead, we return an error.
    if (req.game.gameState == gameConstants.GAME_STATES.PLAY) {
      res.status(409).send({ msg: "Game already started" });
    } else {
      // Set up the game
      // Assign a random order to the players, then assign random aspects.
      const num_players = req.game.players.length;
      let order = Array.from({ length: num_players }, (_, i) => i); // From https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
      const orderShuffled = shuffler.shuffled(order);

      let aspects = ["MAGIC", "STRENGTH", "INTELLIGENCE", "CHARISMA"];
      const aspectsShuffled = shuffler.shuffled(aspects);
      // First, assign each player in req.game.players a random turnIndex
      let i = 0;
      let gameDataPlayers = [];
      for (let j = 0; j < num_players; j++) {
        const player = req.game.players[j];
        const email = player.email;
        req.game.players[j].turnIndex = orderShuffled[i];
        gameDataPlayers.push({
          email: email,
          aspect: aspectsShuffled[i],
          cards: Array(req.game.constants.num_cards).fill(1),
        });
        i++;
      }
      // sortgameDataPlayers by game[roomCode].players[email].turnIndex
      gameDataPlayers.sort((a, b) => {
        return (
          req.game.players.find((item) => item.email == a.email).turnIndex -
          req.game.players.find((item) => item.email == b.email).turnIndex
        );
      });
      req.game.gameData.players = gameDataPlayers;
      // Set the gameState to PLAY
      req.game.gameState = gameConstants.GAME_STATES.PLAY;
      // Set the heroData to the heroName and heroGender from the request body
      req.game.heroData = storyApi.getRandomHero();

      for (let i = 0; i < req.game.gameData.players.length; i++) {
        const email = req.game.gameData.players[i].email;
        //console.log("email:", email);
        // Generate 5 random cards for each player
        // PLACEHOLDER: Variation based on the current aspect of the player
        let cardsExport = [];
        for (let j = 0; j < req.game.constants.num_cards; j++) {
          let { outcomes, ...cardWithoutOutcomes } = shuffler.getRandom(cards);
          let n = { num_id: j, ...cardWithoutOutcomes };
          cardsExport.push(n);
        }
        req.game.players.find((item) => item.email == email).cards =
          cardsExport;
      }
      // Set an empty inventory
      req.game.gameData.inventory = Array(
        req.game.constants.num_item_slots
      ).fill("");
      // Set the story to the introJSON
      req.game.story = [];

      // Set the tempStory to something random
      req.game.tempStory = {
        text: [],
        type: "turn",
        playerTurnName: displayName(req.game.gameData.players[0].email),
      };

      const intro_outcome = shuffler.getRandom(introJSON.sections);

      // Push the intro story, using storyAPI.apiCall to replace $stuff$.
      await pushOutcome(req.game, intro_outcome, req.game.heroData);

      // Set the game with MongoDB
      await DB.setGame(roomCode, req.game);

      // PLACEHOLDER: Respond with the connection data
      for (const player of req.game.players) {
        console.log(
          `[${roomCode}]`,
          "Sending connection data to",
          player,
          ":",
          await getConnectionData(roomCode, player.email)
        );
      }
      res.status(200).end();
    }
  }
});

// Client request to use a card
gameServerRouter.post(
  "/card/:cardIndex/use",
  verifyCurrentPlayer,
  async (req, res) => {
    const roomCode = req.roomCode;
    // get user email based on their auth token
    const userData = await getUserData(req);
    const email = userData.email;
    // Apply aspect changes, item changes, and story changes. Switch turn AND take away the card.
    if (await evalCard(roomCode, email, req.params.cardIndex)) {
      res.status(200).end();
    } else {
      res.status(409).send({ msg: "Card not played" });
    }
  }
);

// Get the connection data for the player
gameServerRouter.post("/connection/get", async (req, res) => {
  const roomCode = req.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);
  res.status(200).send(await getConnectionData(roomCode, userData.email));
});

// Format the connection data for the client
async function getConnectionData(roomCode, email) {
  const game = await DB.getGame(roomCode);
  const playerIndex = game.players.findIndex((item) => item.email == email);
  if (playerIndex == -1) {
    console.log(`[${roomCode}]`, "Player not found", email);
    return false;
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
  clientGameData.inventory = clientGameData.inventory.map((i) =>
    getItemData(i)
  );
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

// Removes a player from game
async function removePlayerFromGame(email) {
  const roomCode = await findRoomCodeByPlayerEmail(email);
  if (!roomCode) {
    return false;
  }
  //console.log(`[${roomCode}]`, `removing ${email} from game`, getGame(roomCode));
  const game = await DB.getGame(roomCode);
  const players = game.players;
  const playerIndex = players.findIndex((item) => item.email == email);
  if (playerIndex != -1) {
    // If (game in progress) or (email was host) or (no players left), delete game
    if (
      game.gameState == gameConstants.GAME_STATES.PLAY ||
      players.length <= 1 ||
      game.host == email
    ) {
      // TODO Placeholder WebSocket: Tell clients the host has left, or tell other players the game has ended
      console.log(`[${roomCode}]`, "was deleted");
      await DB.deleteGame(roomCode);
    } else {
      console.log(`[${roomCode}]`, email, "left the game");
      game.players.splice(playerIndex, 1);
      // Actually remove player from game
      await DB.setGame(roomCode, game);
    }
    return true;
  }
}

async function findRoomCodeByPlayerEmail(email) {
  console.log("[] Finding room code for", email);
  if (!email) return false;
  const game = await DB.getGameByPlayerEmail(email);
  if (game) {
    console.log("[] Game found", game.roomCode);
    return game.roomCode;
  }
  return false;
}

// Evaluates the card and
async function evalCard(roomCode, email, card_num_id, doNextTurn = true) {
  // get result object from card based on checking conditions
  // console.log("Checking card", card_id);
  let game = await DB.getGame(roomCode);
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
      if (outcome.results) {
        const results = outcome.results;
        for (let j = 0; j < results.length; j++) {
          const result = results[j];

          if (result.type == "aspect-points") {
            game.gameData.aspects[result.aspect] += parseInt(result.amt);
          }

          if (result.type == "item-obtained") {
            // Add item to inventory. The inventory is a list of strings that represent the item names.
            // If there isn't an item in the slot, the value of the slot is "".
            // You always have NUM_ITEM_SLOTS slots in your inventory.
            // If you try to add an item to a full inventory, the oldest item disappears.
            if (!game.gameData.inventory.includes("")) {
              game.gameData.inventory.shift(); // Remove the oldest item
              game.gameData.inventory.push(result.item);
              outcome.text.push(`_Not enough room. Oldest item removed._`);
            } else {
              for (let k = 0; k < game.gameData.inventory.length; k++) {
                if (game.gameData.inventory[k] == "") {
                  game.gameData.inventory[k] = result.item;
                  break;
                }
              }
            }
            result.item = getItemData(result.item);
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
          text: outcome.text,
          results: outcome.results,
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
            // PLACEHOLDER: Tell clients the game has ended
            // PLACEHOLDER: Give each client 5 trophies
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
              await DB.addTrophies({ email: email, trophies: trophiesEarned });
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
      await DB.setGame(roomCode, game);

      // PLACEHOLDER for websocket
      for (const player of game.players) {
        // textboxPushFunc({
        //   ...outcome,
        //   type: "turn",
        //   playerTurnName: cardPlayerName,
        // });
      }

      return true;
    }
  }
  console.log(`[${roomCode}]`, "No outcome found for card", card);
  return false;
}

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
  if (item_id == "") {
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
//#endregion GameServer
//#endregion Game

// Handle errors
app.use(function (err, req, res, next) {
  console.log("Oops! Error.");
  console.error(err.stack);
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the default application page (not during dev build)
app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Creates a new user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
    trophies: 0,
  };
  await DB.addUser(user);

  return user;
}

// Finds the user by the field! Super useful for when we have one piece of info but maybe not the other
// async function findUser(field, value) {
//   if (!value) return null;

//   return users.find((u) => u[field] === value);
// }

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
}
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

function displayName(email) {
  // Check if the userName has an '@' in it, if so, use the first part of the email as the display name
  if (email.includes("@")) {
    return email.split("@")[0];
  }
  return email;
}
