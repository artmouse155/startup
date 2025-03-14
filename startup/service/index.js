const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const express = require("express");
const uuid = require("uuid");
const app = express();

const authCookieName = "token";

let users = [];
let trophies = [];

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());

app.use(cookieParser());

// Show static content
app.use(express.static("public"));

var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// create new user
apiRouter.post("/auth/create", async (req, res) => {
  console.log("Yeet!");
  if (await findUser("email", req.body.email)) {
    res.status(409).send({ msg: "Existing user" });
  } else {
    const user = await createUser(req.body.email, req.body.password);

    setAuthCookie(res, user.token);
    res.send({ email: user.email });
  }
});

// log in a user
apiRouter.post("/auth/login", async (req, res) => {
  const user = await findUser("email", req.body.email);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      user.token = uuid.v4();
      setAuthCookie(res, user.token);
      res.send({ email: user.email });
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

// Get all trophies
apiRouter.get("/trophies", verifyAuth, (_req, res) => {
  res.send(trophies);
});

// Submit a new trophy
apiRouter.post("/trophy", verifyAuth, (req, res) => {
  trophies = updateTrophies(req.body);
  res.send(trophies);
});

// Handle errors
app.use(function (err, req, res, next) {
  console.log("Oops! Error.");
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the default application page
app.use((_req, res) => {
  console.log("Well, looks like we are just serving up the default.");
  res.sendFile("index.html", { root: "../" });
});

// update trophies updates the number of trophies the user has.
function updateTrophies(newTrophyCount) {
  let found = false;
  for (const [i, prevTrophyCount] of trophies.entries()) {
    if (prevTrophyCount.name == prevTrophyCount.name) {
      trophies[i] = newTrophyCount;
      found = true;
      break;
    }
  }

  if (!found) {
    trophies.push(newTrophyCount);
  }

  return trophies;
}

// Creates a new user
async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = {
    email: email,
    password: passwordHash,
    token: uuid.v4(),
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
