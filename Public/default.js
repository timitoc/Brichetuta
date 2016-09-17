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
        self.model.username = $(':text', this.view).val();
        self.callback(self.model.username);
    })
}

function main(){
    console.log('ready');
    var userForm = new UserForm(function(username){
        socket.emit('changeUsername', username);
    });

    var mWindow = new MWindow(userForm.view.frame);
    mWindow.setHeight('256px');
    mWindow.setWidth('300px');
    mWindow.create();
    mWindow.controller.init();
    userForm.controller.init();
    userForm.view.submitButton.click(function(){
        mWindow.hide();
        var game = new Game();
        game.create();
    });

    socket.on('playerListUpdate', function (players) {
        $('#usersPanel').empty();
        for(var i in players){
            $('#usersPanel').append(players[i].name);
            $('#usersPanel').append('<br>');
        }
    });


};

function Game() {
    this.model = new GameModel();
    this.view = new GameView(this.model);
    this.controller = new GameController(this.model, this.view);
}

Game.prototype.create = function () {
    $('body').append($('<div class = "gameBackground"/>'));
    $('body').append(this.view.frame);
}

function GameView(model){
    this.frame = $('<div class = "gameFrame" />')
    this.table = $('<object type="image/svg+xml" data="Assets/table.svg" class="table"/>');

    this.frame.append(this.table);

    $('#table', this.table).attr('rx', '2000');
}

function GameModel() {
    
}

function GameController() {
    
}