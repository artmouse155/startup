const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const uuid = require("uuid");
const app = express();

const gameLogic = require("./game/gameLogic.js");
const gameConstants = require("./game/constants.json");

const DB = require("./db.js");
const { peerProxy } = require("./peerProxy.js");

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
    return {
      userName: gameLogic.displayName(user.email),
      trophies: user.trophies,
    };
  });
  console.log(trophies);
  res.send(trophies);
});
//#endregion Trophies

//#region Game
var gameRouter = express.Router(); // Must be authenticated to use
apiRouter.use(`/game`, gameRouter);

let sendEvent = null;

const GameEvent = {
  System: "system",
  ConnectionData: "connectionData",
  End: "gameEnd",
  Start: "gameStart",
  gameConnect: "gameConnect",
};

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
  const newGame = gameLogic.newGame(roomCode, email);

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
    res.status(200).send(await gameLogic.getConnectionData(game, email));
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
      await gameLogic.setupGame(req.game);

      // Set the game with MongoDB
      await DB.setGame(roomCode, req.game);

      // PLACEHOLDER: Respond with the connection data
      for (const player of req.game.players) {
        console.log(
          `[${roomCode}]`,
          "Sending connection data to",
          player,
          ":",
          await gameLogic.getConnectionData(req.game, player.email)
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
    // const roomCode = req.roomCode;
    // get user email based on their auth token
    const userData = await getUserData(req);
    const email = userData.email;
    // Apply aspect changes, item changes, and story changes. Switch turn AND take away the card.
    if (
      await gameLogic.evalCard(
        req.game,
        email,
        req.params.cardIndex,
        DB.setGame,
        DB.addTrophies,
        true
      )
    ) {
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
  if (req.game)
    res
      .status(200)
      .send(await gameLogic.getConnectionData(req.game, userData.email));
  else res.status(403).send({ msg: "Game not found" });
});

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
  if (!email) return null;
  const game = await DB.getGameByPlayerEmail(email);
  if (game) {
    console.log("[] Game found", game.roomCode);
    return game.roomCode;
  }
  return null;
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

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });
}
const httpService = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const proxyGetConnectionData = async (email) => {
  const game = await DB.getGameByPlayerEmail(email);
  if (game) {
    return await gameLogic.getConnectionData(game, email);
  }
  return null;
};

const proxy = peerProxy(
  httpService,
  findRoomCodeByPlayerEmail,
  proxyGetConnectionData
);

if (proxy) {
  console.log("Connected to Peer Proxy");
  sendEvent = proxy.sendEvent;
} else {
  console.log("No proxy found.");
}
