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

// Cards
const Cards = () => {
  return {
    // groups: [{ id: String, cards: [Card] }],
    aspects: {
      MAGIC: [Card],
      STRENGTH: [Card],
      INTELLIGENCE: [Card],
      CHARISMA: [Card],
    },
    misc: [Card],
    null: Card,
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
        email: String,
        aspect: String,
        cards: [Number],
        trophiesEarned: Number, // Only present at game end
      }, // Attr different on client side
    ],
    inventory: [String], // Attr different on client side. ="" or ="item-id-here!"
    current_turn_id: Number,
    turns: Number, // How many turns have passed
  };
};

const Games = () => {
  return {
    _roomCode: {
      roomCode: String,
      gameState: String, // LOBBY = 0, PLAY = 1, END = 2
      host: String, // Attr is different on client side; this is the email of the host. On client side, is just username
      players: [{ email: String, turnIndex: Number, cards: [Card] }], // Attr different on client side
      constants: {
        num_cards: Number,
        num_players: Number, // Max number of players. May be greater than actual number of players.
        num_item_slots: Number,
      },
      heroData: {
        // TODO: Change to just hero
        name: String,
        gender: String,
      },
      gameData: GameData,
      story: [{ title: String, ...Outcome }],
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

// GameData
const ClientGameData = () => {
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
        trophiesEarned: Number, // Only present at game end
      }, // Attr different on server side
    ],
    inventory: [{ id: String, name: String, icon: String }], // Attr different on server side
    current_turn_id: Number,
    turns: Number, // How many turns have passed
  };
};

// ConnectionData
const ConnectionData = () => {
  return {
    roomCode: String,
    gameState: String,
    amHost: Boolean, // Attr not present on server side
    host: String, // Attr different on server side, just a username. On server side, is an email
    myPlayerId: Number, // Attr not present on server side
    players: [String], // Attr different on server side, a list of usernames. On server side, is a list of emails
    myCards: [ClientCard], // Attr not present on server side. A list of cards that the player has
    constants: {
      num_cards: Number,
      num_players: Number, // Max number of players. May be greater than actual number of players.
      num_item_slots: Number,
    },
    heroData: {
      name: String,
      gender: String,
    },
    gameData: ClientGameData,
    story: [{ title: String, ...Outcome }],
    tempStory: Outcome,
  };
};
