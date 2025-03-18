// Server side:

// Outcome
const Outcome = () => {
  return {
    conditions: [{ condition: String }],
    text: [String],
    results: [
      {
        type: String,
        amt: Number,
        aspect: String,
      },
    ],
  };
};

// Card
const Card = () => {
  return {
    id: String,
    desc: String,
    effects: [
      {
        amt: Number,
        type: String,
      },
    ],
    outcomes: [Outcome],
  };
};

// GameData
const GameData = () => {
  return {
    aspects: {
      MAGIC: Number,
      STRENGTH: Number,
      INTELLIGENCE: Number,
      CHARISMA: Number,
    },
    players: [
      {
        name: String,
        aspect: String,
        cards: [Number],
      },
    ],
    inventory: [String],
    current_turn_id: Number,
    turns: Number, // How many turns have passed
  };
};

const Games = () => {
  return {
    _roomCode: {
      roomCode: String,
      players: { _email: { email: String, turnIndex: Number, cards: [Card] } }, // Attr not present on client side
      heroData: {
        heroName: String,
        heroGender: String,
      },
      gameData: GameData,
      story: { title: String, ...Outcome },
      tempStory: Outcome,
    },
  };
};

// Client side:

// Card
const ClientCard = () => {
  return {
    id: String,
    desc: String,
    effects: [
      {
        amt: Number,
        type: String,
      },
    ],
  };
};

// connectionData
const connectionData = () => {
  return {
    roomCode: String,
    myCards: [ClientCard], // Attr not present on server side
    heroData: {
      heroName: String,
      heroGender: String,
    },
    gameData: GameData,
    story: { title: String, ...Outcome },
    tempStory: Outcome,
  };
};
