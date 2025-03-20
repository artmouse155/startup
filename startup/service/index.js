const cards = require("./game/cards.json");
const items = require("./game/items.json");
const introJSON = require("./game/intro.json");
const storyApi = require("./game/story_api.js");
const shuffler = require("./game/shuffler.js");

const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const uuid = require("uuid");
const app = express();

const authCookieName = "token";

let users = [];
let games = {};

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());

app.use(cookieParser());

// Show static content
app.use(express.static("public"));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// create new user
apiRouter.post("/auth/create", async (req, res) => {
  // has email and password
  if (await findUser("email", req.body.email)) {
    res.status(409).send({ msg: "Existing user" });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    // respond with only the email
    console.log(users);
    res.send({ email: user.email, trophies: user.trophies });
  }
});

// log in a user
apiRouter.post("/auth/login", async (req, res) => {
  const user = await findUser("email", req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email, trophies: user.trophies });
      return;
    }
  }
  res.status(401).send({ msg: "Unauthorized" });
});

// logout a user
apiRouter.delete("/auth/logout", async (req, res) => {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user) {
    delete user.token;
  }
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// Check if the user is authorized
const verifyAuth = async (req, res, next) => {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: "Unauthorized" });
  }
};

async function getUserData(req) {
  const user = await findUser("token", req.cookies[authCookieName]);
  if (user) {
    return { email: user.email, trophies: user.trophies };
  } else {
    return { email: null, trophies: null };
  }
}

// Increase the number of trophies the user has
apiRouter.post("/trophy", verifyAuth, async (req, res) => {
  const userData = await getUserData(req);
  if (userData.email != req.body.email) {
    console.log(
      "userData email",
      userData.email,
      "req.body.email",
      req.body.email
    );
    res.status(401).send({ msg: "Nice try, Daniel." });
  } else {
    // the conent is the email, and the number of trophies they just got
    const trophyReturnData = addTrophies(req.body);
    // respond with users list, but only the email and number of trophies
    res.send(trophyReturnData);
  }
});

// Get all trophies
apiRouter.get("/trophies", (req, res) => {
  // only send the email and number of trophies for each user
  // only return everything before the @ symbol of the email
  const trophies = users.map((u) => ({
    userName: u.email.split("@")[0],
    trophies: u.trophies,
  }));
  res.send(trophies);
});

// apiRouter.get("/items/:itemId", (req, res) => {
//   const item = items.find((item) => item.id == req.params.itemId);
//   if (item) {
//     res.send(item);
//   } else {
//     res.status(404).send({ msg: `Item "${req.params.itemID}" not found` });
//   }
// });

var gameRouter = express.Router(); // Must be authenticated to use
apiRouter.use(`/game`, gameRouter);

gameRouter.use(verifyAuth);

const GAME_STATES = {
  LOBBY: 0,
  PLAY: 1,
  END: 2,
};

const verifyRoomCode = async (req, res, next) => {
  if (games[req.roomCode]) {
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
  const game = games[roomCode];
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

gameRouter.post("/host", async (req, res) => {
  // add the game to the active games list
  // Create new roomCode that isn't in use
  // Create list of all room codes
  // Codes are 5 letters long
  const userData = await getUserData(req);
  const email = userData.email;
  let roomCode = await findRoomCodeByPlayerEmail(email);
  console.log(roomCode);
  if (roomCode) {
    removePlayerFromGame(email);
    return res
      .status(409)
      .send({ msg: `Already in game. Room code: ${roomCode}.` });
  }
  let usedCodes = Object.keys(games);
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

  const NUM_CARDS = 5;
  const NUM_PLAYERS = 4;
  const NUM_ITEM_SLOTS = 3;

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
    gameState: GAME_STATES.LOBBY,
    host: email, // Attr not present on server side; this is the email of the host
    players: {}, // Attr not present on client side
    constants: {
      num_cards: NUM_CARDS,
      num_players: NUM_PLAYERS,
      num_item_slots: NUM_ITEM_SLOTS,
    },
    heroData: {}, // Create when we call start
    gameData: gameData,
    // story: [{ title: String, ...Outcome }], // Create when we call start
    // tempStory: Outcome, // Create when we call start
  };
  newGame.players[email] = {
    email: email,
    // turnIndex: Number, Create when we call start
    // cards: [Card], Create when we call start
  };
  games[roomCode] = newGame;
  console.log(email, "created", roomCode, newGame);
  res.send(await getConnectionData(roomCode, email));
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
  if (games[roomCode]) {
    if (games[roomCode].gameState != GAME_STATES.LOBBY) {
      return res.status(409).send({ msg: "Game already started or ended" });
    }
    if (
      games[roomCode].players.length >= games[roomCode].constants.num_players
    ) {
      return res.status(403).send({ msg: "Game full" });
    }
    for (let j = 0; j < games[roomCode].players.length; j++) {
      if (games[roomCode].players[j].email == email) {
        removePlayerFromGame(email);
        return res.status(409).send({
          msg: `Already in game. Room code: ${roomCode}.`,
        });
      }
    }
    games[roomCode].players[email] = { email: email };
    console.log(email, "joined", roomCode, games[roomCode]);
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
  removePlayerFromGame(email);
  res.status(204).end();
  // Find by room code
});

var gameServerRouter = express.Router();
gameRouter.use(`/server/:roomCode`, gameServerRouter);

gameRouter.param("roomCode", (req, res, next, roomCode) => {
  console.log("param roomCode", roomCode);
  req.roomCode = roomCode;
  next();
});

gameServerRouter.use(verifyRoomCode);

gameServerRouter.post("/start", async (req, res) => {
  const roomCode = req.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);
  // If the user is the host, start the game
  console.log("Starting game", roomCode, games[roomCode]);
  if (games[roomCode].host == userData.email) {
    // If the game state is already play, we don't need to set up. Instead, we return an error.
    if (games[roomCode].gameState == GAME_STATES.PLAY) {
      res.status(409).send({ msg: "Game already started" });
    } else {
      // Set up the game
      // Assign a random order to the players, then assign random aspects.
      const num_players = Object.entries(games[roomCode].players).length;
      let order = Array.from({ length: num_players }, (_, i) => i); // From https://dev.to/ycmjason/how-to-create-range-in-javascript-539i
      const orderShuffled = shuffler.shuffled(order);
      console.log("orderShuffled:", orderShuffled);

      let aspects = ["MAGIC", "STRENGTH", "INTELLIGENCE", "CHARISMA"];
      const aspectsShuffled = shuffler.shuffled(aspects);
      // First, assign each player in games[roomCode].players a random turnIndex
      let i = 0;
      let gameDataPlayers = [];
      for (const [email, player] of Object.entries(games[roomCode].players)) {
        games[roomCode].players[email].turnIndex = orderShuffled[i];
        gameDataPlayers.push({
          email: email,
          aspect: aspectsShuffled[i],
          cards: Array(games[roomCode].constants.num_cards).fill(1),
        });
        i++;
      }
      // sortgameDataPlayers by game[roomCode].players[email].turnIndex
      gameDataPlayers.sort((a, b) => {
        return (
          games[roomCode].players[a.email].turnIndex -
          games[roomCode].players[b.email].turnIndex
        );
      });
      games[roomCode].gameData.players = gameDataPlayers;
      // Set the gameState to PLAY
      games[roomCode].gameState = GAME_STATES.PLAY;
      // Set the heroData to the heroName and heroGender from the request body
      games[roomCode].heroData = storyApi.getRandomHero();

      for (let i = 0; i < games[roomCode].gameData.players.length; i++) {
        const email = games[roomCode].gameData.players[i].email;
        console.log("email:", email);
        // Generate 5 random cards for each player
        // PLACEHOLDER: Variation based on the current aspect of the player
        let cardsExport = [];
        for (let j = 0; j < games[roomCode].constants.num_cards; j++) {
          let { outcomes, ...cardWithoutOutcomes } = shuffler.getRandom(cards);
          let n = { num_id: j, ...cardWithoutOutcomes };
          cardsExport.push(n);
        }
        games[roomCode].players[email].cards = cardsExport;
      }
      // Set an empty inventory
      games[roomCode].gameData.inventory = Array(
        games[roomCode].constants.num_item_slots
      ).fill("");
      // Set the story to the introJSON
      games[roomCode].story = [];
      const intro_outcome = shuffler.getRandom(introJSON.sections);

      // Push the intro story, using storyAPI.apiCall to replace $stuff$.
      await pushOutcome(roomCode, intro_outcome);

      // Set the tempStory to something random
      games[roomCode].tempStory = {
        text: [],
        type: "turn",
        playerTurnName: usernameFromEmail(
          games[roomCode].gameData.players[0].email
        ),
      };
      // PLACEHOLDER: Respond with the connection data
      for (const player in games[roomCode].players) {
        console.log(
          "Sending connection data to",
          player,
          ":",
          await getConnectionData(roomCode, player)
        );
      }
      res.status(200).end();
    }
  }
});

gameServerRouter.post(
  "/card/:cardIndex/use",
  verifyCurrentPlayer,
  async (req, res) => {
    const roomCode = req.roomCode;
    // get user email based on their auth token
    const userData = await getUserData(req);
  }
);

gameServerRouter.post("/connection/get", async (req, res) => {
  const roomCode = req.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);
  res.status(200).send(await getConnectionData(roomCode, userData.email));
});

async function getConnectionData(roomCode, email) {
  const game = games[roomCode];
  const player = game.players[email];
  const clientGameData = { ...game.gameData };
  clientGameData.players = clientGameData.players.map((p) => {
    return {
      name: usernameFromEmail(p.email),
      aspect: p.aspect,
      cards: p.cards,
    };
  });
  clientGameData.inventory = clientGameData.inventory.map((i) =>
    getItemData(i)
  );
  const connectionData = {
    roomCode: roomCode,
    gameState: game.gameState,
    host: usernameFromEmail(game.host),
    myPlayerId: player.turnIndex,
    players: Object.keys(game.players).map((p) => usernameFromEmail(p)),
    myCards: player.cards,
    constants: game.constants,
    heroData: game.heroData,
    gameData: clientGameData,
    story: game.story,
    tempStory: game.tempStory,
  };
  return connectionData;
}

async function removePlayerFromGame(email) {
  const roomCode = await findRoomCodeByPlayerEmail(email);
  if (roomCode == -1) {
    return false;
  }
  console.log(`removing ${email} from game`, games[roomCode]);
  const players = games[roomCode].players;
  if (games[roomCode].players[email]) {
    console.log(email, "left", roomCode);
    delete games[roomCode].players[email];
    // If email was host or no players left, delete game
    if (Object.keys(players).length == 0 || games[roomCode].host == email) {
      // TODO Placeholder WebSocket: Tell clients the host has left
      console.log("Game", roomCode, "deleted");
      delete games[roomCode];
    }
    return true;
  }
}

async function findRoomCodeByPlayerEmail(email) {
  if (!email) return false;
  for (const roomCode of Object.keys(games)) {
    console.log("Checking room", roomCode, Object.keys(games));
    const game = games[roomCode];
    for (const playerEmail of Object.keys(game.players)) {
      if (playerEmail == email) return game.roomCode;
    }
  }
  return false;
}

async function evalCard(roomCode, card_num_id) {
  // get result object from card based on checking conditions
  // console.log("Checking card", card_id);
  let gameData = games[roomCode].gameData;
  const current_turn_id = gameData.current_turn_id;
  const current_turn_email = "email@email.com";

  console.log(
    `[${roomCode}] Player ${gameData.players[current_turn_id].name} is playing card ${card_num_id} from their hand.`
  );

  // If this card has already been played, something crazy is going on!
  const card_id = games[roomCode].players[email].cards[card_num_id].id;
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
  games[roomCode].gameData.players[current_turn_id].cards[card_num_id] = 0;

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
            games[roomCode].gameData.aspects[result.aspect] += parseInt(
              result.amt
            );
          }

          if (result.type == "item-obtained") {
            // Add item to inventory. The inventory is a list of strings that represent the item names.
            // If there isn't an item in the slot, the value of the slot is "".
            // You always have NUM_ITEM_SLOTS slots in your inventory.
            // If you try to add an item to a full inventory, the oldest item disappears.
            if (!games[roomCode].gameData.inventory.includes("")) {
              games[roomCode].gameData.inventory.shift(); // Remove the oldest item
              games[roomCode].gameData.inventory.push(result.item);
              outcome.text.push(`_Not enough room. Oldest item removed._`);
            } else {
              for (
                let k = 0;
                k < games[roomCode].gameData.inventory.length;
                k++
              ) {
                if (games[roomCode].gameData.inventory[k] == "") {
                  games[roomCode].gameData.inventory[k] = result.item;
                  break;
                }
              }
            }
          }
        }
      }
      const cardPlayerName = gameData.players[gameData.current_turn_id].name;

      // PLACEHOLDER for websocket
      for (const player in games[roomCode]) {
        // textboxPushFunc({
        //   ...outcome,
        //   type: "turn",
        //   playerTurnName: cardPlayerName,
        // });
      }
      // Go to next player's turn
      nextTurn(roomCode);

      return true;
    }
  }
  console.log("No outcome found for card", card);
  return null;
}

async function pushOutcome(roomCode, outcome) {
  const heroData = games[roomCode].heroData;
  console.log("Parsing outcome", outcome);
  updatedText = [...outcome.text];
  for (let i = 0; i < updatedText.length; i++) {
    updatedText[i] = await storyApi.apiCall(updatedText[i], heroData);
  }
  const updatedOutcome = { ...outcome, text: updatedText };
  console.log("Updated outcome", updatedOutcome);
  games[roomCode].story.push(updatedOutcome);
}

function getItemData(item_id) {
  if (item_id == "") {
    return null;
  }
  const item = items.find((item) => item.id == item_id);
  if (item) {
    return item;
  } else {
    console.log("No item found for item_id", item_id);
    return null;
  }
}

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

// update trophies updates the number of trophies the user has.
function addTrophies(newTrophyData) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == newTrophyData.email) {
      users[i].trophies += parseInt(newTrophyData.trophies);
      return { email: newTrophyData.email, trophies: users[i].trophies };
      break;
    }
  }

  return { msg: "User not found" };
}

// Creates a new user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
    trophies: 0,
  };
  users.push(user);

  return user;
}

// Finds the user by the field! Super useful for when we have one piece of info but maybe not the other
async function findUser(field, value) {
  if (!value) return null;

  return users.find((u) => u[field] === value);
}

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

function usernameFromEmail(email) {
  return email.split("@")[0];
}
