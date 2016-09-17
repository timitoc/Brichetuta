
var deck = require('./Deck');

function arrayShuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

var Game = function (players) {
    this.players = players;
    this.turn = 0;
    this.rule = 1;

    this.shuffle = function() {
      var cds = new Array(52);
      for (var i = 0; i < 52; i++)
        cds[i] = i;
      arrayShuffle(cds);
      var ind = 0;
      while (ind < 52) {
        for (var i = 0; ind < 52 && i < players.length; i++) {
          players[i].unrevCards.push(cds[ind]);
          ind++;
        }
      }
      //players[0].move();
      //console.log(players[0].unrevCards.toString());
    }
}

module.exports = Game;
