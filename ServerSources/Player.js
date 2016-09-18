
// Player class
var Player = function(clientId, userName) {
        var self = this;
        this.id = clientId;
        this.name = userName;
        this.roomNr = -1;
        this.unrevCards = [];
        this.revCards = [];
        this.move = function() {
          if (self.unrevCards.length <= 0) {

          }
          else {
            self.revCards.push(self.unrevCards.pop());
          }
        }
        this.getFace = function() {
          return self.revCards[self.revCards.length-1];
        }
        return this;
}

module.exports = Player;
