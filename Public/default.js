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
            '<label>Introduceți Numele de Utilizator:</label>' +
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
        alert("salut " + username + "!");
        socket.emit('changeUsername', username);
    });

    var mWindow = new MWindow(userForm.view.frame);
    mWindow.create();
    mWindow.controller.init();
    userForm.controller.init();
    userForm.view.submitButton.click(function(){mWindow.hide();});

    socket.on('playerListUpdate', function (players) {
        $('#usersPanel').empty();
        for(var i in players){
            $('#usersPanel').append(players[i].name);
            $('#usersPanel').append('<br>');
        }
    });
};

