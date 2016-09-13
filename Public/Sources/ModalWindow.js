var MWindow = function(content){
    var self = this;
    this.model = new MWindowModel(content);
    this.view = new MWindowView(this.model);
    this.controller = new MWindowController(this.model, this.view);
}

MWindow.prototype.create = function(){
    $('body').append(this.view.wrapper);
}
MWindow.prototype.hide = function(){
    this.view.wrapper.css('visibility', 'hidden');
}
MWindow.prototype.show = function(){
    this.view.wrapper.css('visibility', 'visible');
}
MWindow.prototype.setWidth = function(newWidth){
    this.view.window.css('width', newWidth);
}
MWindow.prototype.setHeight = function(newHeight){
    this.view.window.css('height', newHeight);
}


var MWindowModel = function(content){
    this.content = content;
}

var MWindowView = function(model){
    this.wrapper = $('<div class = "modalWrapper"></div>');
    this.backgroundLayer = $('<div class = "modalBackgroundLayer" />');
    this.window = $('<div class = "modalWindow" />');
    this.menuBar = $('<div class = "modalMenuBar" />');
    this.exitButton = $('<div class = "modalMenuButton right"><span class = "glyphicon glyphicon-remove"/></div>');
    this.contentFrame = $('<div class = "modalContentFrame" />')
    this.menuBar.append(this.exitButton);
    this.window.append(this.menuBar);
    this.contentFrame.append(model.content);
    this.window.append(this.contentFrame);

    this.wrapper.append(this.backgroundLayer);
    this.wrapper.append(this.window);
}


var MWindowController = function(model, view){

    this.exit = function(){
        view.wrapper.remove();
    }
    this.init = function(){
        view.exitButton.click(this.exit);
        view.backgroundLayer.click(this.exit);
    }
}