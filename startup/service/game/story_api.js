const heroes = [
  {
    name: "Elrond",
    gender: "male",
  },
  {
    name: "Jamie",
    gender: "female",
  },
];

const adventureNames = [
  "Adventure",
  "Trek",
  "Saga",
  "Quest",
  "Journey",
  "Expedition",
  "Odyssey",
  "Crusade",
  "Voyage",
  "Exploration",
];

const wowLongQuotes = [
  "This doesn't look like Kansas anymore!",
  "I've never seen anything like it in my life!",
  "Holy cabooses and call me a monkey's great grandpappy!",
];

const exclaimations = [
  "exclaimed",
  "shouted",
  "screamed",
  "blared",
  "proclaimed",
  "declared",
  "whispered",
];

const wowQuotes = [
  "Gadzooks!",
  "Great Scott!",
  "Nuggets!",
  "Great Googly Moogly!",
  "I'll be a monkey's uncle!",
  "Jinkies!",
  "Zoinks!",
  "Holy Guacamole!",
  "WHAT???!?!?!?",
];

const roomTypes = [
  "a small musty room",
  "a mysterious cavern",
  "an enchanting underground forest",
  "some dude's apartment",
];

const roomConditions = [
  "filled with bugs",
  "littered with trash",
  "covered in mold",
];

// Fallback if quote API breaks
const inspirationalQuotes = [
  {
    text: "It's easy to stand in the crowd but it takes courage to stand alone.",
    speaker: "Ghandi",
  },
  {
    text: "*👏👏👏👏👏👏* Congratulations! You win 20 dollars!",
    speaker: "Luke",
  },
];

const feelings = [
  "inspired",
  "scared",
  "terrified",
  "enbolded",
  "curious",
  "destitute",
  "energized",
  "*absolutely incredible*",
];

const bookTitles = [
  "A Summary of Every Book Ever Written",
  "101 BYU Student Vacation Ideas (And why the MARB is the best one)",
  "So You're Stuck in a Text Adventure",
  "Platonic Liquids and Other Things Your Math Teachers Don't Tell You About",
  "The Book of Time",
];

const clothingItems = [
  "A luxurious top hat",
  "A radiant clown wig",
  "A spunky pair of orange shades",
];

function getRandomInt(max) {
  // From Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * max);
}

function getRandom(array) {
  return array[getRandomInt(array.length)];
}

async function apiCallSegment(call) {
  switch (call) {
    case "$wow-long-quote$":
      return getRandom(wowLongQuotes);
    case "$exclamation$":
      return getRandom(exclaimations);
    case "$wow-quote$":
      return getRandom(wowQuotes);
    case "$room-type$":
      return getRandom(roomTypes);
    case "$room-condition$":
      return getRandom(roomConditions);
    case "$inspirational-quote$":
      let quote = {};
      try {
        const response = await fetch("http://api.quotable.io/quotes/random", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
        if (response?.status === 200) {
          const body = await response.json();
          const quote = body[0];
          return `"${quote.content}" — ${quote.author}`; //This is an external API call. Source: https://github.com/lukePeavey/quotable?tab=readme-ov-file
        } else {
          const quote = getRandom(inspirationalQuotes);
          return `*Error: External API Call failed. Using local quote falback.*\n*"${quote.text}" — ${quote.speaker}`; //This is a stub for an external API call.
          // const body = await response.json();
          // alert(`⚠ Error: ${body.msg}`);
        }
      } catch (error) {
        const quote = getRandom(inspirationalQuotes);
        return `*Error: External API Call failed. Using local quote falback.*\n*"${quote.text}" — ${quote.speaker}`; //This is a stub for an external API call
      }

    case "$feeling$":
      return getRandom(feelings);
    case "$book-title$":
      return getRandom(bookTitles);
    case "$clothing-item$":
      return getRandom(clothingItems);
    default:
      return `[⚠️ undefined API call: "${call}" ⚠️]`;
  }
}

module.exports = { apiCall, getRandomHero };

// Put in a string
async function apiCall(
  s,
  { name = "undefined", gender = "undefined" } = herodata
) {
  if (!s) return null;

  //console.log("apiCall", s);
  const insertRegex = /\$([^$]*)\$/g;
  const matches = s.match(insertRegex);
  //console.log("matches", matches);
  if (matches) {
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
    for (let j = 0; j < matches.length; j++) {
      const m = matches[j].substring(1, matches[j].length - 1);
      //console.log("m", m);
      let r = "DEFAULT REPLACE";
      if (pronouns[m]) {
        r = pronouns[m][gender];
      } else {
        switch (m) {
          case "n":
            r = name;
            break;
          default:
            r = await apiCallSegment(`$${m}$`);
            break;
        }
      }
      s = s.replace(`$${m}$`, r);
    }
  }
  //console.log("apiCall return", s);
  return s;
}

function getRandomHero() {
  hero = getRandom(heroes);
  hero.adventureName = getRandom(adventureNames);
  return hero;
}
