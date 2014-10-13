var inherits = require('inherits');
var Component = require('../vendor/component');

var Player = function(options, container) {
    Component.call(this);

    this.render(container);

    this._player = vimeowrap(this.element).setup(options);
};
inherits(Player, Component);

Player.prototype.createDom = function() {
    this.element = dom.create('div', {
        'class': 'player'
    });
};

module.exports = Player;
