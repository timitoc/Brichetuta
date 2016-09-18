var Card = require('./Card');

var deck = [];

(function() {
  for (var i = 1; i <= 4; i++) {
    for (var j = 2; j <= 14; j++) {
      deck.push(new Card(i, j));
    }
  }
})();

module.exports = deck;
