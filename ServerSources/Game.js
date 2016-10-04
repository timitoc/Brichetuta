
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
      var inWar = self.getPlayersIndInWar();
	  console.log("There are " + inWar.length + " in war");
	  if (inWar.length > 0)
	  	console.log(inWar);
      if (contains(inWar, ind)) {
		var losers = self.getCurrentWarLosersInd(ind);
		self.cleanRev(ind);
		for (var i = 0; i < losers.length; i++)
			self.cleanRev(losers[i]);
		self.takeJackpot(losers);
		self.turn = ind;
      }
      else {
        for (var i = 0; i < players.length; i++)
            self.cleanRev(i);
        if (self.bricCards.length > 0)
          self.turn = ind;
        var losers = [ind];
        self.takeJackpot(losers);
      }
    }

    this.cleanRev = function(playerInd) {
      for (var i = 0; i < players[playerInd].revCards.length; i++) {
        self.bricCards.push(players[playerInd].revCards[i]);
      }
      players[playerInd].revCards.length = 0;
    }

    this.takeJackpot = function(losers) {
      var crt = 0;
      while (crt < self.bricCards.length) {
      	for (var i = 0; i < losers.length && crt < self.bricCards.length; i++)
          players[losers[i]].unrevCards.push(self.bricCards[crt]);
        crt++;
      }
      self.bricCards.length = 0;
    }

    this.getPlayerIndFromSocketId = function(socketId) {
      for (var i = 0; i < players.length; i++)
        if (players[i].id == socketId)
          return i;
      return -1;
    }

    this.getPlayersIndInWar = function() {
		inWar = [];
		for (var i = 0; i < players.length; i++) {
			for (var j = i+1; j < players.length; j++)
				if (self.warBetween(i, j)) {
					inWar.push(i);
					inWar.push(j);
				}
		}
		return inWar;
    }

    this.getCurrentWarLosersInd = function(me) {
    	var losers = [];
    	for (var i = 0; i < players.length; i++) {
    		if (i == me) continue;
    		if (self.warBetween(me, i))
    			losers.push(i);
    	}
    	return losers;
    }

    this.warBetween = function(me, him) {
    	if (deck[players[me].getFace()].sameValue(deck[players[him].getFace()]))
    		return true;
    	return false;
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
