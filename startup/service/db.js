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
    console.log(`Connect to database`);
  } catch (ex) {
    console.log(
      `Unable to connect to database with ${url} because ${ex.message}`
    );
    process.exit(1);
  }
})();

let games = {};

async function getUser(uid) {
  return { uid, name: "John Doe" };
  return db.collection("users").doc(uid).get();
}

async function getUserByToken(token) {
  return { uid: "123", name: "John Doe" };
  return db.collection("users").where("token", "==", token).get();
}

async function addUser(user) {
  return;
  return db.collection("users").doc(user.uid).set(user);
}

async function updateUser(user) {
  return;
  return db.collection("users").doc(user.uid).update(user);
}

async function getGame(roomCode) {
  return games[roomCode];
  return db.collection("games").doc(roomCode).get();
}

async function setGame(roomCode, game) {
  games[roomCode] = game;
  return;
  return db.collection("games").doc(roomCode).set(game);
}

async function deleteGame(roomCode) {
  delete games[roomCode];
  return;
  return db.collection("games").doc(roomCode).delete();
}

async function getAllGames() {
  return games;
  return db.collection("games").get();
}

async function pushStory(roomCode, story) {
  games[roomCode].stories.push(story);
  return;
  return db
    .collection("games")
    .doc(roomCode)
    .update({
      stories: firebase.firestore.FieldValue.arrayUnion(story),
    });
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  getGame,
  setGame,
  deleteGame,
  getAllGames,
  pushStory,
};
