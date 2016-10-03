/**
 * Created by root on 13.09.2016.
 */


function UserForm(callback) {
    this.model = new UserFormModel();
    this.view  = new UserFormView(this.model);
    this.controller = new UserFormController(this.model, this.view, callback);
}
function UserFormModel(){
    this.username = "";
}
function UserFormView(){
    this.frame = $(
        '<div>' +
            '<br>' +
            '<label>Username:</label>' +
            '<br>' +
            '<input type = "text" class = "usernameInput"/>' +
            '<br>' +
        '</div>');
    this.submitButton = $('<div class="mainButton"> OK </div>');
    this.frame.append(this.submitButton);
}
function UserFormController(model, view, callback){
    this.model = model;
    this.view  = view;
    this.callback = callback;
};



UserFormController.prototype.init = function(){
    var self = this;


    this.view.submitButton.click(function(){
        self.model.username = $('input', self.view.frame).val();
        self.callback(self.model.username);
    })
    $(this.view.frame).keydown(function(event){

        if(event.key == "Enter"){
            self.view.submitButton.trigger('click');
        }
    });
}

var cardBack;

function main(){
    console.log('ready');
    var userForm = new UserForm(function(username){
        socket.emit('changeUsername', username);
    });

    socket.on('cardBack', function(data){
        cardBack = data;
    })

    socket.on('room_size', function(data){
       // console.log('room_size');
        document.getElementById("myRoomSize").innerHTML = "There are " + data.description + " players in this room ";
        for (var i = 0; i < 6; i++){
            game.model.lastCards[i] = game.model.currentCards[i];
            if(i < data.description)
                game.model.currentCards[i] = cardBack;
            else
                game.model.currentCards[i] = 'blank';
        }
        game.view.notifyChange({scope:'cards', players:[0, 1, 2, 3, 4, 5]});
    });

    var mWindow = new MWindow(userForm.view.frame);
    mWindow.setHeight('256px');
    mWindow.setWidth('300px');
    mWindow.create();
    $('input', userForm.view.frame).focus();
    mWindow.controller.init();
    userForm.controller.init();
    userForm.view.submitButton.click(function(){
        mWindow.hide();
        game.create();
    });

    socket.on('playerListUpdate', function (players) {
        $('#usersPanel').empty();
        for(var i in players){
            $('#usersPanel').append($('<li>'+ players[i].name + '</li>'));
        }
    });
    socket.on('cardBack', function (data) {
        game.view.cardBack = data;
    })
};

function Game() {
    this.model = new GameModel();
    this.view = new GameView(this.model);
    this.controller = new GameController(this.model, this.view);
}

Game.prototype.create = function () {
    self = this;
    self.view.init();
    self.controller.init();
}

function GameView(model){
    this.model = model;
    var self = this;
    this.loaded = false;

}

GameView.prototype.init = function(){
    this.frame = $('#gameFrame');
    this.table = $('#gameTable');
    this.frame.css('visibility', 'visible');
    var self = this;
    var htmlTableObject = document.getElementById('gameTable');
    this.tableDocument = htmlTableObject.contentDocument;
    this.snapTable = Snap(this.tableDocument);

    this.tableCenter = this.snapTable.select('#tableCenter')
    this.textCenter = this.tableCenter.text(this.tableCenter.getBBox().cx, this.tableCenter.getBBox().cy, this.model.message);
    this.textCenter.attr('font-size', '128px');
    this.textCenter.attr('font-weight', 'bold');
    this.textCenter.attr('text-anchor', 'middle');
    this.textCenter.attr('fill', 'red');

    this.loaded = true;
}

GameView.prototype.doupdate = function(e){
    if(e.scope == 'message')
        this.textCenter.attr('text', this.model.message);
    if(e.scope == 'cards')
        for(var i in e.players)
            this.loadCard(i, this.model.currentCards[i]);
}

GameView.prototype.notifyChange = function(e){
    if(this.loaded)
        this.doupdate(e);
}

GameView.prototype.loadCard = function(playerId, cardLink){
    var self = this;
    var player = this.snapTable.select('#player'+playerId);
    var placeholder = player.select('#placeholder'+playerId);

    player.selectAll('.card').remove();
    if(cardLink === 'blank')
        return;

    Snap.load(cardLink, function(cardPage){
       // console.log(cardPage);
        var card = cardPage.select('.card');
       // console.log(card);
        var placeholder0 = self.snapTable.select('#placeholder0');
        player.append(card);

        var t = new Snap.Matrix();

        t.scale((placeholder0.getBBox().width) / card.getBBox().width);
        t.add(placeholder.transform().localMatrix);
        card.transform(t);
        t = new Snap.Matrix();
        t.translate(placeholder.getBBox().cx-card.getBBox().cx, placeholder.getBBox().cy-card.getBBox().cy);
        t.add(card.transform().localMatrix);
        card.transform(t);
    });
}

GameView.prototype.focusPlayer = function (playerId) {
    var player = this.snapTable.select('#player'+playerId);
    var placeholder = player.select('rect');
    placeholder.attr('fill', 'blue');
};

function GameModel() {
    this.currentCards = [];
    this.lastCards = [];
    this.loadedDeck = false;
    this.gameState = 'message';
    this.message = "...";
}

function GameController(model, view) {
    this.model = model;
    this.view = view;
}

GameController.prototype.init = function(){
    var self = this;
    socket.on('game_update', function (data) {
        self.view.focusPlayer(data.turn);
        for(var i in data.playerData){
            self.model.currentCards[i] = self.view.getSVGcard(data.playerData[i].last_card);
        }
        self.view.notifyChange({scope:'message'});
    })

    socket.on('room_status', function(data) {
        self.model.message = data.description;
        self.view.notifyChange({scope:'message'});
    });

    $('#moveButton').click(function(){
        socket.emit('move');
    })
}