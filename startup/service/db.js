const { MongoClient } = require("mongodb");
const config = require("./dbConfig.json");

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db("startup");
const userCollection = db.collection("user");
const gameCollection = db.collection("game");

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await db.command({ ping: 1 });
    console.log(`Connected to database`);
  } catch (ex) {
    console.log(
      `Unable to connect to database with ${url} because ${ex.message}`
    );
    process.exit(1);
  }
})();

async function getUser(email) {
  return userCollection.findOne({ email: email });
}

async function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

// update trophies updates the number of trophies the user has.
async function addTrophies({ email, trophies } = newTrophyData) {
  await userCollection.updateOne(
    { email: email },
    { $inc: { trophies: trophies } }
  );
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function getGame(roomCode) {
  return gameCollection.findOne({ roomCode: roomCode });
}

function getGameByPlayerEmail(email) {
  let match = { players: { $elemMatch: { email: email } } };
  console.log(match);
  return gameCollection.findOne(match);
}

async function setGame(roomCode, game) {
  await gameCollection.updateOne(
    { roomCode: roomCode },
    { $set: game },
    { upsert: true }
  );
}

async function deleteGame(roomCode) {
  await gameCollection.deleteOne({ roomCode: roomCode });
}

async function getAllGames() {
  const query = { roomCode: { $exists: true } };
  const options = {
    limit: 50,
  };
  const cursor = gameCollection.find(query, options);
  return cursor.toArray();
}

async function pushStory(roomCode, story) {
  await gameCollection.updateOne(
    { roomCode: roomCode },
    { $push: { stories: story } }
  );
}

async function getHighScores() {
  const query = { trophies: { $gt: 0, $lt: 900 } };
  const options = {
    sort: { trophies: -1 },
    limit: 10,
  };
  const cursor = userCollection.find(query, options);
  return cursor.toArray();
}

module.exports = {
  getUser,
  getUserByToken,
  addTrophies,
  addUser,
  updateUser,
  getGame,
  getGameByPlayerEmail,
  setGame,
  deleteGame,
  getAllGames,
  pushStory,
  getHighScores,
};
