var CardViewGenerator = function(){
    var self = this;
    var suit_keys = [' ', 'club', 'diamond', 'heart', 'spade'];
    var card_keys = [];
    for(var i = 2; i < 10; i++)
        card_keys[i] = '_x3'+i+'__x5F';
    card_keys[10] = '_x31_0_x5F';
    card_keys[11] = '_x31__x5F';
    card_keys[12] = 'jack';
    card_keys[13] = 'queen';
    card_keys[14] = 'king';

    function generteDeckFromSvg(svgPath, deckFolder){
        const jsdom = require('jsdom');
        const fs = require('fs');
        const xmlserializer = require('xmlserializer');
        jsdom.env({
            file: svgPath,
            scripts: [require.resolve('snapsvg')],
            done: function(error, window){
                if (error) throw error;
                var namespaceStr = 'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"'
                self.deck = window.Snap(window.document.getElementById('deck'));
                for(var i = 1; i <= 4; i++)
                    for(var j = 2; j <= 14; j++)
                    {
                        var card = self.deck.select('#'+card_keys[j]+'_'+suit_keys[i]);

                        var str = xmlserializer.serializeToString(card.node);
                        fs.writeFileSync(deckFolder + "/" + i+"_"+j+".svg", '<svg ' + namespaceStr + ' version="1.1" height="1216.19" width="2178.18" viewBox="-.2 -236 2178.99 1216.19" id="deck" >' + str + ' </svg>');

                    }
                var card = self.deck.select('#back').clone();

                var str = xmlserializer.serializeToString(card.node);
                fs.writeFileSync(deckFolder + "/back.svg", '<svg ' + namespaceStr + ' version="1.1" height="1216.19" width="2178.18" viewBox="-.2 -236 2178.99 1216.19" id="deck" >' + str + ' </svg>');

                window.close();
            }
        });
    }

    this.getCardView = function(card){
        if(card == 'undefined' || card == null)
            return 'blank';
        if(card === 'back' || card.suit === 'back' || card.value === 'back')
            return "/Assets/decks/mainDeck/back.svg";
        else if(card === 'blank' || card.suit === 'blank' || card.value === 'blank'  || card.suit == null && card.value == null)
            return 'blank';
        else
            return "/Assets/decks/mainDeck/"+card.suit + "_" + card.value + ".svg";
    }
}


var Card = function (suit, value) {
    this.suit = suit;
    this.value = value;
    this.sameSuit = function(compCard) {
    	if (compCard == undefined) return false;
    	return this.suit == compCard.suit;
    }
    this.sameValue = function(compCard) {
    	if (compCard == undefined) return false;
    	return this.value == compCard.value;
    }
}
Card.prototype.viewGenerator = new CardViewGenerator();


module.exports = Card;
