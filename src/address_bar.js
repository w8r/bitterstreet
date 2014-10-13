var AddressBar = function(options, container) {
    this.options = options;

    Component.call(this);
    this.render(container);
};

AddressBar.prototype.createDom = function() {
    this.element = dom.create('div', {
        'class': '.address-bar'
    });
};

AddressBar.prototype._template = _.template(
    '<input type="text" value="{{ data.START_ADDRESS }}" />' +
    '<ul class="{{ classes.FEATURES }}">' +
    '<% for(var i = 0, len = features.length, collapsed = len > 1;' +
    ' i < len; i++){ %><li class="{{ classes.FEATURE }}">' +
    '<table class="{{ classes.FEATURE_TABLE }}">' +
    '<thead class="{{ classes.FEATURE_HEADER }}' +
    '<% if(collapsed){ %> {{ classes.COLLAPSED }}<% } %>" ' +
    ' data-id="{{ features[i].id }}">' +
    '<tr><th colspan="2">{{ features[i].id }}</th></tr></thead>' +
    '<tbody class="{{ classes.FEATURE_PROPERTIES }}' +
    '<% if(collapsed){ %> {{ classes.COLLAPSED }}<% } %>">' +
    '<% for(var prop in features[i].properties){ %>' +
    '<tr><td class="{{ classes.FEATURE_PROPERTY_NAME }}">{{ prop }}</td>' +
    '<td class="{{ classes.FEATURE_PROPERTY_VALUE }}">' +
    '{{ features[i].properties[prop] }}</td></tr>' +
    '<% } %></tbody></table></li>' +
    '<% } %></ul></div>',
    null, {
        variable: 'data',
        interpolate: /{{([\s\S]+?)}}/g
    });
