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
  return array[getRandomInt(array.length - 1)];
}

export function apiCall(call) {
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
      const quote = getRandom(inspirationalQuotes);
      return `"${quote.text}" - ${quote.speaker}`; //This is a stub for an external API call.
    case "$feeling$":
      return getRandom(feelings);
    case "$book-title$":
      return getRandom(bookTitles);
    case "$clothing-item$":
      return getRandom(clothingItems);
    default:
      return `<🛑undefined API call: "${call}"🛑>`;
  }
}
