import cards from "./cards.json";
import items from "./items.json";
import introJSON from "./intro.json";

const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const uuid = require("uuid");
const app = express();

const authCookieName = "token";

let users = [];
let games = [];

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

var gameRouter = express.Router(); // Must be authenticated to use
apiRouter.use(`/game`, gameRouter);

gameRouter.use(verifyAuth);

const NUM_CARDS = 6;
const NUM_PLAYERS = 4;
const NUM_ITEM_SLOTS = 3;

const getSampleGameData = () => {
  return {
    aspects: {
      MAGIC: 0,
      STRENGTH: 0,
      INTELLIGENCE: 0,
      CHARISMA: 0,
    },
    players: [
      {
        name: "Alice",
        aspect: "UNKNOWN",
        cards: Array(NUM_CARDS).fill(1),
      },
      {
        name: "Bob",
        aspect: "UNKNOWN",
        cards: Array(NUM_CARDS).fill(1),
      },
      {
        name: "Seth",
        aspect: "UNKNOWN",
        cards: Array(NUM_CARDS).fill(1),
      },
      {
        name: "Cosmo",
        aspect: "UNKNOWN",
        cards: Array(NUM_CARDS).fill(1),
      },
    ],
    //inventory: ["magic-potion", "", ""],
    inventory: Array(NUM_ITEM_SLOTS).fill(""),
    current_turn_id: Math.floor(Math.random() * NUM_PLAYERS),
    turns: 0,
  };
};

gameRouter.post("/host", async (req, res) => {
  // add the game to the active games list
  // Create new roomCode that isn't in use
  // Create list of all room codes
  // Codes are 5 letters long
  let roomCode = await findRoomCodeByPlayerEmail(req.body.email);
  console.log(i);
  if (roomCode != -1) {
    removePlayerFromGame(req.body.email);
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

  let newGame = {
    host: req.body.email,
    roomCode: roomCode,
    players: [{ email: req.body.email }],
    started: false,
    //gameData: sampleGameData,
  };
  games[roomCode] = newGame;
  console.log(req.body.email, "created", roomCode, newGame);
  res.send(newGame);
});

gameRouter.post("/join", verifyRoomCode, (req, res) => {
  // See if req.body.roomCode is in the active games list
  // Then, see if the player is already in the game or if there are already 4 players (the max)
  // If the player is already in the game, respond with a message saying they are already in the game
  // If there are already 4 players, respond with a message saying the game is full
  // Otherwise, add the player to the game and respond with a message saying they joined the game
  // If the room code is not in the active games list, respond with a message saying the game does not exist
  const roomCode = req.body.roomCode;
  if (games[roomCode]) {
    if (games[roomCode].players.length >= 4) {
      return res.status(403).send({ msg: "Game full" });
    }
    for (let j = 0; j < games[roomCode].players.length; j++) {
      if (games[roomCode].players[j].email == req.body.email) {
        removePlayerFromGame(req.body.email);
        return res.status(409).send({
          msg: `Already in game. Room code: ${roomCode}.`,
        });
      }
    }
    games[roomCode].players.push({ email: req.body.email });
    console.log(req.body.email, "joined", roomCode, games[roomCode]);
    res.status(200).send(games[roomCode]);
  }
});

gameRouter.delete("/leave", async (req, res) => {
  // Remove user from current game
  const i = await findGameIndexByPlayerEmail(req.body.email);
  if (i == -1) {
    return res.status(403).send({ msg: "Game not found" });
  }
  removePlayerFromGame(req.body.email);
  res.status(204).end();
  // Find by room code
});

var gameServerRouter = express.Router();
gameRouter.use(`/server/:roomCode`, gameServerRouter);

const verifyRoomCode = async (req, res, next) => {
  if (games[roomCode]) {
    return res.status(403).send({ msg: "Game not found" });
  } else {
    next();
  }
};

const verifyCurrentPlayer = async (req, res, next) => {
  const roomCode = req.params.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);

  // verify that it is the sender's turn
  const game = games[roomCode];
  const currentTurnId = game.gameData.current_turn_id;
  const currentPlayerEmail = connectionData.players[currentTurnId].email;
  if (currentPlayerEmail) {
    if (userData.email == currentPlayerEmail) {
      next();
    } else {
      res.status(401).send({ msg: "Nice try, Daniel." });
    }
  }
};

gameRouter.use([verifyRoomCode, verifyCurrentPlayer]);

gameServerRouter.post("/card/:cardIndex/use", async (req, res) => {
  const roomCode = req.params.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);
});

gameServerRouter.post("/connection/get", async (req, res) => {
  const roomCode = req.params.roomCode;
  // get user email based on their auth token
  const userData = await getUserData(req);
});

async function removePlayerFromGame(email) {
  const roomCode = await findRoomCodeByPlayerEmail(email);
  if (roomCode == -1) {
    return;
  }
  console.log(`removing ${email} from game`, games[roomCode]);
  const players = games[roomCode].players;
  for (let j = 0; j < players.length; j++) {
    if (players[j].email == email) {
      games[roomCode].players.splice(j, 1);
      console.log(email, "left", roomCode);
      if (players.length == 0) {
        delete games[roomCode];
        return;
      } else if (games[roomCode].host == email) {
        // TODO Placeholder WebSocket: Tell clients the host has left
        delete games[roomCode];
        return;
      }
    }
  }
}

async function findRoomCodeByPlayerEmail(email) {
  if (!email) return -1;
  for (const roomCode in games) {
    game = games[roomCode];
    for (const player in game.players) {
      if (player.email == email) return game.roomCode;
    }
  }
  return -1;
}

async function parseMD(md, heroName, heroGender) {
  const pronouns = {
    They: {
      male: "He",
      female: "She",
      other: "They",
    },
    Their: {
      male: "His",
      female: "Her",
      other: "Their",
    },
    Theirs: {
      male: "His",
      female: "Hers",
      other: "Theirs",
    },
    Them: {
      male: "Him",
      female: "Her",
      other: "Them",
    },
    they: {
      male: "he",
      female: "she",
      other: "they",
    },
    their: {
      male: "his",
      female: "her",
      other: "their",
    },
    theirs: {
      male: "his",
      female: "hers",
      other: "theirs",
    },
    them: {
      male: "him",
      female: "her",
      other: "them",
    },
  };
  const insertRegex = /\$([^$]*)\$/g;
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
