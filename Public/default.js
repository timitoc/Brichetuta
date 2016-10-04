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

    socket.on("start_game", function (data) {
        game.model.playerInd = data.ind;
        game.start();
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

Game.prototype.start = function () {
    this.model.gameState = 'inGame';
    this.view.notifyChange({scope: 'tableCenter'});

    for(var i = 0; i < 6; i++){
        this.model.currentCards[i] = 'blank';
        this.model.lastCards[i] = 'blank';
    }

    this.view.notifyChange({scope: 'cards', players: [0, 1, 2, 3, 4, 5]});
}

function GameView(model){
    this.model = model;
    var self = this;
    this.loaded = false;

    this.frame;
    this.tableDocument;
    this.snapTable;
    this.tableCenter;
    this.textCenter;
    this.cardBack;
    this.bricheta;

    this.showedCards = [];
}

GameView.prototype.init = function(){
    this.frame = $('#gameFrame');
    this.table = $('#gameTable');
    this.frame.css('visibility', 'visible');
    var self = this;
    var htmlTableObject = document.getElementById('gameTable');
    this.tableDocument = htmlTableObject.contentDocument;

    var linkElm = this.tableDocument.createElementNS("http://www.w3.org/1999/xhtml", "link");
    linkElm.setAttribute("href", "/Styles/tableStyle.css");
    linkElm.setAttribute("type", "text/css");
    linkElm.setAttribute("rel", "stylesheet");
    this.tableDocument.getElementsByTagName("svg")[0].appendChild(linkElm);

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
    if(e.scope == 'tableCenter'){
        if(this.model.gameState == 'message'){
            this.showMessage();
            this.hideBricheta();
        }
        else if(this.model.gameState == 'inGame'){
            this.hideMessage();
            this.loadBricheta();
        }
        else{
            console.log('gameState error');
        }
    }

    if(e.scope == 'focusPlayer'){
        this.focusPlayer(this.model.currentPlayer);
    }

    if(e.scope == 'info'){
        var infoPanel = $('#playerInfo');
        infoPanel.empty();
        infoPanel.append("Player Ind: " + this.model.playerInd + "<br>");
        infoPanel.append("Nr Cards" + this.model.nrCards[this.model.playerInd] + "<br>");
    }

}

GameView.prototype.notifyChange = function(e){
    if(this.loaded)
        this.doupdate(e);
}

GameView.prototype.loadCard = function(playerId, cardLink){
    var self = this;
    var player = this.snapTable.select('#player'+playerId);
    var placeholder = player.select('#placeholder'+playerId);

    if (cardLink === this.showedCards[playerId])
        return;

    this.showedCards[playerId] = cardLink;

    player.selectAll('.card').remove();
    if(cardLink === 'blank') {
        return;
    }

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
    var last = this.snapTable.select('.focused');
    if(last != null)
        last.removeClass('focused');
    if(playerId == -1) return;
    var player = this.snapTable.select('#player'+playerId);
    var placeholder = player.select('rect');

    placeholder.addClass('focused');

    var moveButton = $('#moveButton');
    if(this.model.currentPlayer == this.model.playerInd)
        moveButton.removeClass('inactive');
    else
        moveButton.addClass('inactive');

};

GameView.prototype.loadBricheta = function(){
    var self = this;
    Snap.load('/Assets/bricheta.svg', function(brichetaSvg) {
        self.bricheta = brichetaSvg.select("g").clone();
        self.tableCenter.append(self.bricheta);

        var t = new Snap.Matrix();
        var tableBox = self.tableCenter.select('#tableCenterBackground').getBBox();
        t.scale(0.8 * (tableBox.height / self.bricheta.getBBox().height));
        self.bricheta.transform(t);
        t = new Snap.Matrix();
        t.translate(tableBox.cx - self.bricheta.getBBox().cx, tableBox.cy - self.bricheta.getBBox().cy);
        t.add(self.bricheta.transform().localMatrix);
        self.bricheta.transform(t);

        game.controller.gameInit();  ///Bad practice, not MVC, temporary
    });
}

GameView.prototype.hideMessage = function(){
    this.textCenter.remove();
}

function GameModel() {
    this.currentCards = [];
    this.lastCards = [];
    this.nrCards = [];
    this.gameState = 'message';
    this.message = "...";
    this.currentPlayer = -1;
}

function GameController(model, view) {
    this.model = model;
    this.view = view;
}

GameController.prototype.init = function(){
    var self = this;
    socket.on('game_update', function (data) {
        self.model.currentPlayer = data.turn;
        self.view.notifyChange({scope:'focusPlayer'});
        for(var i in data.playerData){
            self.model.currentCards[i] = data.playerData[i].last_card;
            self.model.nrCards[i] = data.playerData[i].num_card;
        }
        self.view.notifyChange({scope:'cards', players:[0, 1, 2, 3, 4, 5]});
        self.view.notifyChange({scope:'info'});
    })

    socket.on('room_status', function(data) {
        self.model.message = data.description;
        self.view.notifyChange({scope:'message'});
    });

    $('#moveButton').click(function(){
        socket.emit('move');
    })

    socket.on('end_round', function(winners){
        var winnerList = "";
        for(var i in winners){
            winnerList += winners[i].name;
            winnerList += "\n";
        }
        alert("End of Round! Winners: \n" + winnerList);
    });

}

GameController.prototype.gameInit = function(){
    var self = this;
    this.view.bricheta.click(function () {
        socket.emit('click_brichetuta');
    });
}