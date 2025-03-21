function getRandomInt(max) {
  // From Mozilla docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
  return Math.floor(Math.random() * max);
}

function getRandom(array) {
  return array[getRandomInt(array.length)];
}

function shuffled(array) {
  let temp = [];

  while (array.length > 0) {
    temp.push(array.splice(getRandomInt(array.length), 1)[0]);
  }
  return temp;
}

module.exports = { getRandom, shuffled };
