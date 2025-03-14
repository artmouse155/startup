const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const uuid = require("uuid");
const { act } = require("react");
const app = express();

const authCookieName = "token";

let users = [];
let activeGames = [];

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

// Increase the number of trophies the user has
apiRouter.post("/trophy", verifyAuth, (req, res) => {
  // the conent is the email, and the number of trophies they just got
  trophies = addTrophies(req.body);
  // respond with users list, but only the email and number of trophies
  res.send(trophies);
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

var gameRouter = express.Router();
apiRouter.use(`/game`, gameRouter);

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

gameRouter.post("/host", verifyAuth, (req, res) => {
  // add the game to the active games list
  // Create new roomCode that isn't in use
  // Create list of all room codes
  // Codes are 5 letters long
  let usedCodes = activeGames.map((game) => game.roomCode);
  let roomCode = "";
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
  activeGames.push(newGame);
  res.send(newGame);
});

gameRouter.post("/join", verifyAuth, (req, res) => {
  // See if req.body.roomCode is in the active games list
  // Then, see if the player is already in the game or if there are already 4 players (the max)
  // If the player is already in the game, respond with a message saying they are already in the game
  // If there are already 4 players, respond with a message saying the game is full
  // Otherwise, add the player to the game and respond with a message saying they joined the game
  // If the room code is not in the active games list, respond with a message saying the game does not exist
  for (let i = 0; i < activeGames.length; i++) {
    if (activeGames[i].roomCode == req.body.roomCode) {
      if (activeGames[i].players.length >= 4) {
        return res.status(403).send({ msg: "Game full" });
      }
      for (let j = 0; j < activeGames[i].players.length; j++) {
        if (activeGames[i].players[j].email == req.body.email) {
          return res.status(403).send({ msg: "Already in game" });
        }
      }
      activeGames[i].players.push({ email: req.body.email });
      res.status(200).send(activeGames[i]);
    }
  }
  res.status(403).send({ msg: "Room Code Invalid" });
});

gameRouter.delete("/leave", verifyAuth, (req, res) => {
  // Remove user from current game
  for (let i = 0; i < activeGames.length; i++) {
    // Find by room code
    if (activeGames[i].roomCode == req.body.roomCode) {
      for (let j = 0; j < activeGames[i].players.length; j++) {
        if (activeGames[i].players[j].email == req.body.email) {
          activeGames[i].players.splice(j, 1);
          if (activeGames[i].players.length == 0) {
            activeGames.splice(i, 1);
          } else if (activeGames[i].host == req.body.email) {
            // TODO Placeholder WebSocket: Tell clients the host has left
            activeGames.splice(i, 1);
          }

          return res.status(200).end();
        }
      }
    }
  }
  res.status(403).send({ msg: "Game not found" });
});

// Finds the user by the field! Super useful for when we have one piece of info but maybe not the other
async function findGame(field, value) {
  if (!value) return null;

  return activeGames.find((u) => u[field] === value);
}

// Handle errors
app.use(function (err, req, res, next) {
  console.log("Oops! Error.");
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the default application page (not during dev build)
app.use((_req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// update trophies updates the number of trophies the user has.
function addTrophies(newTrophyData) {
  let found = false;
  for (let i = 0; i < users.length; i++) {
    if (users[i].email == newTrophyData.email) {
      users[i].trophies += newTrophyData.trophies;
      found = true;
      break;
    }
  }

  if (!found) {
    return { msg: "User not found" };
  }

  return { email: newTrophyData.email, trophies: users[i].trophies };
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
