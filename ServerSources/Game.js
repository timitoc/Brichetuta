
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

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

var Game = function (players) {

    var self = this;
    this.players = players;
    this.turn = 0;
    this.rule = 1;
    this.bricCards = [];

    this.shuffle = function() {
      var cds = new Array(52);
      for (var i = 0; i < 52; i++)
        cds[i] = i;
      arrayShuffle(cds);
      var ind = 0;
      for (var i = 0; i < players.length; i++)
        players[i].length = 0;
      while (ind < 52) {
        for (var i = 0; ind < 52 && i < players.length; i++) {
          players[i].unrevCards.push(cds[ind]);
          ind++;
        }
      }
    }

    this.move = function(socketId) {
        var ind = self.getPlayerIndFromSocketId(socketId);
        console.log("Ind is: " + ind + " and turn is: " + self.turn);
        if (ind == -1) {
          console.log("error 37");
          return;
        }
        if (ind != self.turn) {
          return;
        }
        console.log(players[ind].getFace());
        players[ind].move();
        console.log(players[ind].getFace());
        self.turn++;
        self.turn %= players.length;
    }

    this.clickB = function(socketId) {
      var ind = self.getPlayerIndFromSocketId(socketId);
      if (ind == -1) {
        console.log("error 49");
        return;
      }
      var inWar = [];
      self.getPlayersIndInWar(inWar);
      if (contains(inWar, ind)) {

      }
      else {
        for (var i = 0; i < players.length; i++)
            self.cleanRev(i);
        if (bricCards.length > 0)
          self.turn = ind;
        var losers = [ind];
        self.takeJakpot(losers);
      }
    }

    this.cleanRev = function(playerInd) {
      for (var i = 0; i < players[playerInd].revCards.length; i++) {
        bricCards.push(players[playerInd].revCards[i]);
      }
      player[playerInd].length = 0;
    }

    this.takeJakpot = function(losers) {
      var crt = 0;
      while (crt < bricCards.length) {
        for (var i = 0; i < losers.length && crt < bricCards.length; i++)
          players[losers[i]].unrevCards.push(bricCards[crt]);
          crt++;
      }
      bricCards.length = 0;
    }

    this.getPlayerIndFromSocketId = function(socketId) {
      for (var i = 0; i < players.length; i++)
        if (players[i].id == socketId)
          return i;
      return -1;
    }

    this.getPlayersIndInWar = function(inWar) {

    }

    this.getWinners = function() {
      var winners = [];
      for (var i = 0; i < players.length; i++)
        if (players[i].revCards.length == 0 && players[i].unrevCards.length == 0)
          winners.push(players[i]);
      return winners;
    }

}

module.exports = Game;
