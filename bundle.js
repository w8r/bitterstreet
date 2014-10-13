(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/w8r/Projects/verve/config.json":[function(require,module,exports){
module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports=module.exports={
    "GOOGLE_MAPS_API_KEY": "AIzaSyD4Iwd_DZDeoIftNyebsaR6l_QnKt7CxMQ",
    "MAPBOX_API_TOKEN": "pk.eyJ1IjoidzhyIiwiYSI6IlF2Nlh6QVkifQ.D7BkmeoMI7GEkMDtg3durw",
    "START": [51.531037, -0.080749],
    "START_ADDR": "67 Falkirk St London N1 6SD, UK",
    "FINISH": [51.534778, -0.080872],
    "FINISH_ADDR": "285 Hoxton St Greater London, UK",
    "player": {
        "urls": [
            "https://vimeo.com/8717262"
        ],
        "repeat": "single",
        "autoplay": true,
        "mute": true
    }
}

},{}],"/Users/w8r/Projects/verve/index.js":[function(require,module,exports){
(function (global){
require("./vendor/spin.js");
require("./vendor/eventtarget.js");
require("./vendor/component.js");

var App = require("./src/app");
require("./src/player");
require("./src/route");

global.app = new App(require("./config.json"));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./config.json":"/Users/w8r/Projects/verve/config.json","./src/app":"/Users/w8r/Projects/verve/src/app.js","./src/player":"/Users/w8r/Projects/verve/src/player.js","./src/route":"/Users/w8r/Projects/verve/src/route.js","./vendor/component.js":"/Users/w8r/Projects/verve/vendor/component.js","./vendor/eventtarget.js":"/Users/w8r/Projects/verve/vendor/eventtarget.js","./vendor/spin.js":"/Users/w8r/Projects/verve/vendor/spin.js"}],"/Users/w8r/Projects/verve/node_modules/inherits/inherits_browser.js":[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],"/Users/w8r/Projects/verve/src/app.js":[function(require,module,exports){
var inherits = require('inherits');
var Component = require('../vendor/component');
var dom = require('../vendor/dom');
var Player = require('./player');
var Route = require('./route');

var App = function(config) {

    this.config = config;
    mapboxgl.accessToken = config.MAPBOX_API_TOKEN;

    this._player = null;

    this._geocoder = new google.maps.Geocoder();

    this._directionsService = new google.maps.DirectionsService()

    this._endPoints = window.localStorage.getItem('route');
    if (this._endPoints) {
        console.log(this._endPoints)
        this._endPoints = JSON.parse(this._endPoints);
    } else {
        this._endPoints = [];
    }

    Component.call(this);
    this.render();

    this.on({
        'load:start': this.showPreloader,
        'load:end': this.hidePreloader,
        'coords:ready': this.onCoordsRetrieved
    });

    this.init();
};
inherits(App, Component);

App.prototype.createDom = function() {
    this.element = dom.create('div', {
        'class': 'app',
        'html': '<div class="route-map" id="route-map"></div>'
    });
};

App.prototype.init = function() {
    this.fire('load:start');

    this.createPlayer();
    if (this._endPoints.length === 0) {
        this.geocodeEndPoints();
    } else {
        this.onCoordsRetrieved();
    }
};

App.prototype.geocodeEndPoints = function() {
    this._geocoder.geocode({
        'address': this.config.START_ADDR
    }, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            this._endPoints.push([
                results[0].geometry.location.lat(),
                results[0].geometry.location.lng()
            ]);
            this._geocoder.geocode({
                address: this.config.FINISH_ADDR
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    this._endPoints.push([
                        results[0].geometry.location.lat(),
                        results[0].geometry.location.lng()
                    ]);
                    window.localStorage.setItem('route',
                        JSON.stringify(this._endPoints));

                    this.fire('coords:ready');
                }
            }.bind(this))
        }
    }.bind(this));
};

App.prototype.createPlayer = function() {
    this._player = new Player(this.config.player, this.element);
};

App.prototype.onCoordsRetrieved = function() {
    this.fire('load:end');
    console.log(this._endPoints);
    this.createRouteMap();
};

App.prototype.createRouteMap = function() {
    var bounds = new mapboxgl.LatLngBounds(this._endPoints[0], this._endPoints[1]);
    console.log(bounds);
    mapboxgl.util.getJSON('https://www.mapbox.com/mapbox-gl-styles/styles/outdoors-v4.json', function(err, style) {
        style.layers.push({
            "id": "route",
            "source": "route",
            "render": {
                "$type": "LineString",
                "line-join": "round",
                "line-cap": "round"
            },
            "style": {
                "line-color": "#888",
                "line-width": 8
            },
            "type": "line"
        });
        this._routeMap = new mapboxgl.Map({
            container: dom.getElement(this.element, '.route-map'),
            style: style,
            zoom: 16,
            center: bounds.getCenter()
        });
        this._bounds = bounds;
        //this._routeMap.fitBounds(bounds);
        // this._directionsRenderer =
        //     new google.maps.DirectionsRenderer({
        //         map: this._routeMap,
        //     });

        this.getRoute();
    }.bind(this));
};

App.prototype.getRoute = function getDirection() {
    this.fire('load:start');
    this._directionsService.route({
        origin: new google.maps.LatLng(
            this._endPoints[0][0], this._endPoints[0][1]),
        destination: new google.maps.LatLng(
            this._endPoints[1][0], this._endPoints[1][1]),
        travelMode: google.maps.DirectionsTravelMode.WALKING
    }, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            this._route = response;
            this.onRouteCalculated();
        } else {
            console.log(response)
        }
        this.fire('load:end');
    }.bind(this));
}

App.prototype.onRouteCalculated = function() {
    this._routeMap.fitBounds(this._bounds);
    this._route = new Route(this._route.routes[0].overview_path).densify(5);
    var route = new mapboxgl.GeoJSONSource({
        data: this._route.toGeoJSON()
    });
    this._routeMap.addSource('route', route);

    this.retrieveImagery(this._route._points);
};

App.prototype.retrieveImagery = function(points) {
    console.log(points, this._route)
    this.fire('load:start');
    var imgs = [],
        bearing;

    for (var i = 1; i < points.length; i++) {
        bearing = this.computeHeading(points[i - 1], points[i]);
        imgs.push([
            "http://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
            points[i - 1][0] + "," +
            points[i - 1][1] + "&heading=" + bearing +
            "&pitch=-1.62&sensor=false&key=" + this.config.GOOGLE_MAPS_API_KEY,
            points[i - 1]
        ]);
    }

    imgs.push([
        "http://maps.googleapis.com/maps/api/streetview?size=600x300&location=" +
        points[i - 1][0] + "," +
        points[i - 1][1] + "&heading=" + bearing +
        "&pitch=-1.62&sensor=false&key=" + GOOGLE_MAPS_API_KEY, points[i - 1]
    ]);
    return imgs
}

App.prototype.showPreloader = function() {
    var opts = {
        lines: 13, // The number of lines to draw
        length: 20, // The length of each line
        width: 10, // The line thickness
        radius: 30, // The radius of the inner circle
        corners: 1, // Corner roundness (0..1)
        rotate: 0, // The rotation offset
        direction: 1, // 1: clockwise, -1: counterclockwise
        color: '#000', // #rgb or #rrggbb or array of colors
        speed: 1, // Rounds per second
        trail: 60, // Afterglow percentage
        shadow: false, // Whether to render a shadow
        hwaccel: false, // Whether to use hardware acceleration
        className: 'spinner', // The CSS class to assign to the spinner
        zIndex: 2e9, // The z-index (defaults to 2000000000)
        top: '50%', // Top position relative to parent
        left: '50%' // Left position relative to parent
    };
    if (!this._spinner) {
        this._spinner = new Spinner(opts).spin(this.element);
    } else {
        this._spinner.spin(this.element);
    }

    this._spinner._isStopped = false;
};

App.prototype.hidePreloader = function() {
    if (this._spinner) {
        this._spinner.stop();
        this._spinner._isStopped = true;
    }
};

module.exports = App;

},{"../vendor/component":"/Users/w8r/Projects/verve/vendor/component.js","../vendor/dom":"/Users/w8r/Projects/verve/vendor/dom.js","./player":"/Users/w8r/Projects/verve/src/player.js","./route":"/Users/w8r/Projects/verve/src/route.js","inherits":"/Users/w8r/Projects/verve/node_modules/inherits/inherits_browser.js"}],"/Users/w8r/Projects/verve/src/player.js":[function(require,module,exports){
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

},{"../vendor/component":"/Users/w8r/Projects/verve/vendor/component.js","inherits":"/Users/w8r/Projects/verve/node_modules/inherits/inherits_browser.js"}],"/Users/w8r/Projects/verve/src/route.js":[function(require,module,exports){
var Route = function(points) {
    this._points = points.map(function(ll) {
        return [ll.lat(), ll.lng()];
    });
};

Route.interpolate = function(start, end, ratio) {
    start = new google.maps.LatLng(start[0], start[1]);
    end = new google.maps.LatLng(end[0], end[1]);
    var res = google.maps.geometry.spherical.interpolate(
        start,
        end,
        ratio);
    return [res.lat(), res.lng()];
};

Route.prototype.densify = function(factor) {
    var res = [],
        pt;
    for (var i = 1, len = this._points.length; i < len; i++) {
        var npoints = [];
        for (var j = 0; j < factor; j++) {
            res.push(Route.interpolate(
                this._points[i - 1],
                this._points[i],
                j / factor));
        }
    }
    this._points = res;
    return this;
};

Route.prototype.toGeoJSON = function() {
    return {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "LineString",
            "coordinates": this._points.map(function(ll) {
                return ll.reverse();
            })
        }
    };
};

module.exports = Route;

},{}],"/Users/w8r/Projects/verve/vendor/component.js":[function(require,module,exports){
var inherits = require('inherits');
var EventTarget = require('./eventtarget');
console.log(EventTarget)

/**
 * @fileOverview Basic view class
 * @author w8r <info@w8r.name>
 */

/**
 * Basic vuew class
 * @constructor
 * @extends {EventTarget}
 */
var Component = function() {};
inherits(Component, EventTarget);

/**
 * @enum{String}
 */
Component.events = {};

/**
 * @type {Element}
 */
Component.prototype.element = null;

/**
 * @type {*}
 */
Component.prototype.model = null;

/**
 * @type {Component}
 */
Component.prototype.parent = null;

/**
 * @param  {Element} container
 */
Component.prototype.render = function(container) {
    if (!this.element) {
        this.createDom();
    }

    if (container) {
        container.appendChild(this.element);
    } else {
        document.body.appendChild(this.element);
    }
    this.onRendered();
};

/**
 * @return {Element}
 */
Component.prototype.getElement = function() {
    return this.element;
};

/**
 * @param {*} model
 */
Component.prototype.setModel = function(model) {
    this.model = model;
};

/**
 * @return {*}
 */
Component.prototype.getModel = function() {
    return this.model;
};

/**
 * @return {Component}
 */
Component.prototype.getParent = function() {
    return this.parent;
};

/**
 * @param {Component} parent
 */
Component.prototype.setParent = function(parent) {
    this.parent = parent;
};

/**
 * Create dom elements, from template for example
 */
Component.prototype.createDom = function() {};

/**
 * Element rendered, enhance
 */
Component.prototype.onRendered = function() {};

/**
 * Element will be destroyed, remove handlers
 */
Component.prototype.onBeforeDestroy = function() {};

/**
 * Destroys dom element
 */
Component.prototype.destroyDom = function() {
    if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
    }
};

/**
 * @param {Component} child
 */
Component.prototype.appendChild = function(child) {
    child.setParent(this);
    child.render(this.element);
    child.parent = this;
};

/**
 * Destructor
 */
Component.prototype.destroy = function() {
    this.onBeforeDestroy();
    this.destroyDom();

    this.element = null;
    this.model = null;
};

module.exports = Component;

},{"./eventtarget":"/Users/w8r/Projects/verve/vendor/eventtarget.js","inherits":"/Users/w8r/Projects/verve/node_modules/inherits/inherits_browser.js"}],"/Users/w8r/Projects/verve/vendor/dom.js":[function(require,module,exports){
var dom = window.dom = {

    /**
     * Creates dom element
     *
     * @param {String} tag HTML tag
     * @param {Object} [options] properties/attributes
     * @param {Object} [options.events] Event listeners
     * @param {Object} [options.styles] CSS styles
     * @return {Element}
     */
    create: function(tag, options) {
        var element = document.createElement(tag),
            styles;
        if (options) {
            if (options.events) {
                $(element).on(options.events);
                delete options.events;
            }

            if (options.styles) {
                styles = options.styles;
                delete options.styles;
            }

            if (options['class']) {
                element.className = options['class'];
                delete options['class'];
            }

            if (options.html) {
                element.innerHTML = options.html;
                delete options.html;
            }

            for (var attr in options) {
                element.setAttribute(attr, options[attr]);
            }

            if (styles) {
                dom.setStyles(element, styles);
            }
        }
        return element;
    },

    /**
     * @param {Element|NodeList|Array.<Element>} element
     * @param {String}                           style
     * @param {*}                                value
     */
    setStyle: function(element, style, value) {
        if (dom.isArrayLike(element)) {
            for (var i = 0, len = element.length; i < len; i++) {
                dom.setStyle(element[i], style, value);
            }
        } else {
            element.style[style] = value;
        }
    },

    /**
     * Set multiple styles
     * @param {Element|NideList|Array.<Element>} element
     * @param {Object}                           styles
     */
    setStyles: function(element, styles) {
        if (dom.isArrayLike(element)) {
            for (var i = 0, len = element.length; i < len; i++) {
                dom.setStyles(element[i], styles);
            }
        } else {
            for (var style in styles) {
                dom.setStyle(element, style, styles[style]);
            }
        }
    },

    /**
     * Gets node collection
     *
     * @param  {Element} [context]
     * @param  {String}  selector
     * @return {NodeList|Array}
     */
    getElements: function(context, selector) {
        if (typeof context === 'string') {
            selector = context;
            context = document;
        }
        return context.querySelectorAll(selector);
    },

    /**
     * Same as above but only gets one element
     *
     * @param  {Element} [context]
     * @param  {String} selector
     * @return {Element|Null}
     */
    getElement: function(context, selector) {
        if (typeof context === 'string') {
            selector = context;
            context = document;
        }
        return context.querySelector(selector);
    },

    /**
     * Next element sibling for IE8
     * @param  {Element} el
     * @return {Element}
     */
    nextElementSibling: function(el) {
        if (el.nextElementSibling) return el.nextElementSibling;
        do {
            el = el.nextSibling;
        } while (el && el.nodeType !== 1);
        return el;
    },

    /**
     * Useful for Nodelists and collections
     * @param  {*}  el
     * @return {Boolean}
     */
    isArrayLike: function(el) {
        return Array.isArray(el) ||
            Object.prototype.toString.call(el) === '[object NodeList]';
    },

    /**
     * is object `o` a node?
     * stolen from: http://stackoverflow.com/a/384380/156225
     */
    isNode: function(o) {
        return (typeof Node === "object" ?
            o instanceof Node : o &&
            typeof o === "object" &&
            typeof o.nodeType === "number" &&
            typeof o.nodeName === "string");
    },

    /**
     * is object `o` an html element?
     * stolen from: http://stackoverflow.com/a/384380/156225
     */
    isHtmlElement: function(o) {
        return (typeof HTMLElement === "object" ?
            o instanceof HTMLElement : //DOM2
            o && typeof o === "object" &&
            o !== null &&
            o.nodeType === 1 &&
            typeof o.nodeName === "string");
    }
};

module.exports = dom;

},{}],"/Users/w8r/Projects/verve/vendor/eventtarget.js":[function(require,module,exports){
/* jshint eqnull: true */
/**
 * @fileOverview Events mixin
 * @author <a href="mailto:info@w8r.name">w8r</a>
 */

/**
 * Events mixin
 * @class EventTarget
 */
var EventTarget = function() {};

/**
 * Removes 'on' part
 *
 * @param  {String} type
 * @static
 * @return {String}
 */
EventTarget.cleanEventType = function(type) {
    return type.replace(/^on([A-Z])/, function(full, first) {
        return first.toLowerCase();
    });
};

/**
 * Convenience & consistency
 */
EventTarget.prototype.constructor = EventTarget;

/**
 * @type {Object}
 */
EventTarget.prototype._events = null;

/**
 * Adds event handler
 *
 * @param  {String|Object} type
 * @param  {Function}      [handler]
 * @return {EventTarget} self
 */
EventTarget.prototype.on = function(type, handler) {
    var handlers;
    if (typeof type === 'string') {
        type = EventTarget.cleanEventType(type);
        this._events = this._events || {};
        handlers = this._events[type] = this._events[type] || [];
        if (handler && handlers.indexOf(handler) === -1) {
            handlers.push(handler);
        }
    } else {
        handlers = type;
        for (var t in handlers) {
            this.on(t, handlers[t]);
        }
    }
    return this;
};

/**
 * Adds event that fires only once
 *
 * @param  {String}   type
 * @param  {Function} handler
 * @return {EventTarget} self
 */
EventTarget.prototype.once = function(type, handler) {
    var self = this,
        wrapped = function() {
            handler.apply(self, Array.prototype.slice.call(arguments, 0));
            self.off(type, arguments.callee);
        };
    this.on(type, wrapped);
    return this;
};

/**
 * Removes event handler
 *
 * @param  {String|Object} type
 * @param  {Function} [handler]
 * @return {EventTarget} self
 */
EventTarget.prototype.off = function(type, handler) {
    var handlers, i, len;
    if (typeof type === 'string') {
        if (arguments.length > 1) {
            var pos;
            type = EventTarget.cleanEventType(type);
            this._events = this._events || {};
            if (!this._events[type]) return this;
            pos = this._events[type].indexOf(handler);
            if (pos !== -1) {
                this._events[type].splice(pos, 1);

                if (this._events[type].length === 0) {
                    this._events[type] = null;
                }
            }

        } else { // remove all events of given type
            for (handlers = this._events[type] || [],
                i = 0, len = handlers.length; i < len; i++) {
                this.off(type, handlers[i]);
            }
            delete this._events[type];
        }
    } else {
        handlers = type;
        for (var t in handlers) {
            this.off(t, handlers[t]);
        }
    }
    return this;
};

/**
 * Fires event
 *
 * @param  {String} type
 * @param  {Mixed}  args
 * @return {EventTarget} self
 */
EventTarget.prototype.trigger = function(type, args) {
    var handlers, i, len;
    this._events = this._events || {};
    if (!this._events[type]) return this;

    if (args != null) {
        // we could've used isArray, but let's pass collections too
        if (typeof args === 'string' ||
            typeof args.length !== 'number' ||
            Object.prototype.toString.call(args) === '[object Function]') {
            args = [args];
        }
    } else {
        args = [];
    }

    for (handlers = this._events[type],
        i = 0,
        len = handlers.length; i < len; i++) {
        var handler = handlers[i];
        if (typeof handler === 'function') {
            handler.apply(this, args);
        }
    }
    return this;
};

/* Aliases */
EventTarget.prototype.fire = EventTarget.prototype.trigger;
EventTarget.prototype.addEventListener = EventTarget.prototype.on;
EventTarget.prototype.removeEventListener = EventTarget.prototype.off;
EventTarget.prototype.addOneTimeEventListener = EventTarget.prototype.once;

module.exports = EventTarget;

},{}],"/Users/w8r/Projects/verve/vendor/spin.js":[function(require,module,exports){
/**
 * Copyright (c) 2011-2014 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

    /* CommonJS */
    if (typeof exports == 'object') module.exports = factory()

    /* AMD module */
    else if (typeof define == 'function' && define.amd) define(factory)

    /* Browser global */
    else root.Spinner = factory()
  }
  (this, function() {
    "use strict";

    var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */ ,
      animations = {} /* Animation rules keyed by their name */ ,
      useCssAnimations /* Whether to use CSS animations or setTimeout */

    /**
     * Utility function to create elements. If no tag name is given,
     * a DIV is created. Optionally properties can be passed.
     */
    function createEl(tag, prop) {
      var el = document.createElement(tag || 'div'),
        n

      for (n in prop) el[n] = prop[n]
      return el
    }

    /**
     * Appends children and returns the parent.
     */
    function ins(parent /* child1, child2, ...*/ ) {
      for (var i = 1, n = arguments.length; i < n; i++)
        parent.appendChild(arguments[i])

      return parent
    }

    /**
     * Insert a new stylesheet to hold the @keyframe or VML rules.
     */
    var sheet = (function() {
      var el = createEl('style', {
        type: 'text/css'
      })
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())

    /**
     * Creates an opacity keyframe animation rule and returns its name.
     * Since most mobile Webkits have timing issues with animation-delay,
     * we create separate rules for each line/segment.
     */
    function addAnimation(alpha, trail, i, lines) {
      var name = ['opacity', trail, ~~ (alpha * 100), i, lines].join('-'),
        start = 0.01 + i / lines * 100,
        z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha),
        prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase(),
        pre = prefix && '-' + prefix + '-' || ''

      if (!animations[name]) {
        sheet.insertRule(
          '@' + pre + 'keyframes ' + name + '{' +
          '0%{opacity:' + z + '}' +
          start + '%{opacity:' + alpha + '}' +
          (start + 0.01) + '%{opacity:1}' +
          (start + trail) % 100 + '%{opacity:' + alpha + '}' +
          '100%{opacity:' + z + '}' +
          '}', sheet.cssRules.length)

        animations[name] = 1
      }

      return name
    }

    /**
     * Tries various vendor prefixes and returns the first supported property.
     */
    function vendor(el, prop) {
      var s = el.style,
        pp, i

      prop = prop.charAt(0).toUpperCase() + prop.slice(1)
      for (i = 0; i < prefixes.length; i++) {
        pp = prefixes[i] + prop
        if (s[pp] !== undefined) return pp
      }
      if (s[prop] !== undefined) return prop
    }

    /**
     * Sets multiple style properties at once.
     */
    function css(el, prop) {
      for (var n in prop)
        el.style[vendor(el, n) || n] = prop[n]

      return el
    }

    /**
     * Fills in default values.
     */
    function merge(obj) {
      for (var i = 1; i < arguments.length; i++) {
        var def = arguments[i]
        for (var n in def)
          if (obj[n] === undefined) obj[n] = def[n]
      }
      return obj
    }

    /**
     * Returns the absolute page-offset of the given element.
     */
    function pos(el) {
      var o = {
        x: el.offsetLeft,
        y: el.offsetTop
      }
      while ((el = el.offsetParent))
        o.x += el.offsetLeft, o.y += el.offsetTop

      return o
    }

    /**
     * Returns the line color from the given string or array.
     */
    function getColor(color, idx) {
      return typeof color == 'string' ? color : color[idx % color.length]
    }

    // Built-in defaults

    var defaults = {
      lines: 12, // The number of lines to draw
      length: 7, // The length of each line
      width: 5, // The line thickness
      radius: 10, // The radius of the inner circle
      rotate: 0, // Rotation offset
      corners: 1, // Roundness (0..1)
      color: '#000', // #rgb or #rrggbb
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1, // Rounds per second
      trail: 100, // Afterglow percentage
      opacity: 1 / 4, // Opacity of the lines
      fps: 20, // Frames per second when using setTimeout()
      zIndex: 2e9, // Use a high z-index by default
      className: 'spinner', // CSS class to assign to the element
      top: '50%', // center vertically
      left: '50%', // center horizontally
      position: 'absolute' // element position
    }

    /** The constructor */
    function Spinner(o) {
      this.opts = merge(o || {}, Spinner.defaults, defaults)
    }

    // Global defaults that override the built-ins:
    Spinner.defaults = {}

    merge(Spinner.prototype, {

      /**
       * Adds the spinner to the given target element. If this instance is already
       * spinning, it is automatically removed from its previous target b calling
       * stop() internally.
       */
      spin: function(target) {
        this.stop()

        var self = this,
          o = self.opts,
          el = self.el = css(createEl(0, {
            className: o.className
          }), {
            position: o.position,
            width: 0,
            zIndex: o.zIndex
          }),
          mid = o.radius + o.length + o.width

        css(el, {
          left: o.left,
          top: o.top
        })

        if (target) {
          target.insertBefore(el, target.firstChild || null)
        }

        el.setAttribute('role', 'progressbar')
        self.lines(el, self.opts)

        if (!useCssAnimations) {
          // No CSS animation support, use setTimeout() instead
          var i = 0,
            start = (o.lines - 1) * (1 - o.direction) / 2,
            alpha, fps = o.fps,
            f = fps / o.speed,
            ostep = (1 - o.opacity) / (f * o.trail / 100),
            astep = f / o.lines

          ;
          (function anim() {
            i++;
            for (var j = 0; j < o.lines; j++) {
              alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

              self.opacity(el, j * o.direction + start, alpha, o)
            }
            self.timeout = self.el && setTimeout(anim, ~~ (1000 / fps))
          })()
        }
        return self
      },

      /**
       * Stops and removes the Spinner.
       */
      stop: function() {
        var el = this.el
        if (el) {
          clearTimeout(this.timeout)
          if (el.parentNode) el.parentNode.removeChild(el)
          this.el = undefined
        }
        return this
      },

      /**
       * Internal method that draws the individual lines. Will be overwritten
       * in VML fallback mode below.
       */
      lines: function(el, o) {
        var i = 0,
          start = (o.lines - 1) * (1 - o.direction) / 2,
          seg

        function fill(color, shadow) {
          return css(createEl(), {
            position: 'absolute',
            width: (o.length + o.width) + 'px',
            height: o.width + 'px',
            background: color,
            boxShadow: shadow,
            transformOrigin: 'left',
            transform: 'rotate(' + ~~(360 / o.lines * i + o.rotate) + 'deg) translate(' + o.radius + 'px' + ',0)',
            borderRadius: (o.corners * o.width >> 1) + 'px'
          })
        }

        for (; i < o.lines; i++) {
          seg = css(createEl(), {
            position: 'absolute',
            top: 1 + ~(o.width / 2) + 'px',
            transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
            opacity: o.opacity,
            animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
          })

          if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {
            top: 2 + 'px'
          }))
          ins(el, ins(seg, fill(getColor(o.color, i), '0 0 1px rgba(0,0,0,.1)')))
        }
        return el
      },

      /**
       * Internal method that adjusts the opacity of a single line.
       * Will be overwritten in VML fallback mode below.
       */
      opacity: function(el, i, val) {
        if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
      }

    })


    function initVML() {

      /* Utility function to create a VML tag */
      function vml(tag, attr) {
        return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
      }

      // No CSS transforms but VML support, add a CSS rule for VML elements:
      sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

      Spinner.prototype.lines = function(el, o) {
        var r = o.length + o.width,
          s = 2 * r

        function grp() {
          return css(
            vml('group', {
              coordsize: s + ' ' + s,
              coordorigin: -r + ' ' + -r
            }), {
              width: s,
              height: s
            }
          )
        }

        var margin = -(o.width + o.length) * 2 + 'px',
          g = css(grp(), {
            position: 'absolute',
            top: margin,
            left: margin
          }),
          i

        function seg(i, dx, filter) {
          ins(g,
            ins(css(grp(), {
                rotation: 360 / o.lines * i + 'deg',
                left: ~~dx
              }),
              ins(css(vml('roundrect', {
                  arcsize: o.corners
                }), {
                  width: r,
                  height: o.width,
                  left: o.radius,
                  top: -o.width >> 1,
                  filter: filter
                }),
                vml('fill', {
                  color: getColor(o.color, i),
                  opacity: o.opacity
                }),
                vml('stroke', {
                  opacity: 0
                }) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          )
        }

        if (o.shadow)
          for (i = 1; i <= o.lines; i++)
            seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

        for (i = 1; i <= o.lines; i++) seg(i)
        return ins(el, g)
      }

      Spinner.prototype.opacity = function(el, i, val, o) {
        var c = el.firstChild
        o = o.shadow && o.lines || 0
        if (c && i + o < c.childNodes.length) {
          c = c.childNodes[i + o];
          c = c && c.firstChild;
          c = c && c.firstChild
          if (c) c.opacity = val
        }
      }
    }

    var probe = css(createEl('group'), {
      behavior: 'url(#default#VML)'
    })

    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')

    return Spinner

  }));

},{}]},{},["/Users/w8r/Projects/verve/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL3c4ci9Qcm9qZWN0cy92ZXJ2ZS9jb25maWcuanNvbiIsIi9Vc2Vycy93OHIvUHJvamVjdHMvdmVydmUvaW5kZXguanMiLCIvVXNlcnMvdzhyL1Byb2plY3RzL3ZlcnZlL25vZGVfbW9kdWxlcy9pbmhlcml0cy9pbmhlcml0c19icm93c2VyLmpzIiwiL1VzZXJzL3c4ci9Qcm9qZWN0cy92ZXJ2ZS9zcmMvYXBwLmpzIiwiL1VzZXJzL3c4ci9Qcm9qZWN0cy92ZXJ2ZS9zcmMvcGxheWVyLmpzIiwiL1VzZXJzL3c4ci9Qcm9qZWN0cy92ZXJ2ZS9zcmMvcm91dGUuanMiLCIvVXNlcnMvdzhyL1Byb2plY3RzL3ZlcnZlL3ZlbmRvci9jb21wb25lbnQuanMiLCIvVXNlcnMvdzhyL1Byb2plY3RzL3ZlcnZlL3ZlbmRvci9kb20uanMiLCIvVXNlcnMvdzhyL1Byb2plY3RzL3ZlcnZlL3ZlbmRvci9ldmVudHRhcmdldC5qcyIsIi9Vc2Vycy93OHIvUHJvamVjdHMvdmVydmUvdmVuZG9yL3NwaW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9e1xuICAgIFwiR09PR0xFX01BUFNfQVBJX0tFWVwiOiBcIkFJemFTeUQ0SXdkX0RaRGVvSWZ0TnllYnNhUjZsX1FuS3Q3Q3hNUVwiLFxuICAgIFwiTUFQQk9YX0FQSV9UT0tFTlwiOiBcInBrLmV5SjFJam9pZHpoeUlpd2lZU0k2SWxGMk5saDZRVmtpZlEuRDdCa21lb01JN0dFa01EdGczZHVyd1wiLFxuICAgIFwiU1RBUlRcIjogWzUxLjUzMTAzNywgLTAuMDgwNzQ5XSxcbiAgICBcIlNUQVJUX0FERFJcIjogXCI2NyBGYWxraXJrIFN0IExvbmRvbiBOMSA2U0QsIFVLXCIsXG4gICAgXCJGSU5JU0hcIjogWzUxLjUzNDc3OCwgLTAuMDgwODcyXSxcbiAgICBcIkZJTklTSF9BRERSXCI6IFwiMjg1IEhveHRvbiBTdCBHcmVhdGVyIExvbmRvbiwgVUtcIixcbiAgICBcInBsYXllclwiOiB7XG4gICAgICAgIFwidXJsc1wiOiBbXG4gICAgICAgICAgICBcImh0dHBzOi8vdmltZW8uY29tLzg3MTcyNjJcIlxuICAgICAgICBdLFxuICAgICAgICBcInJlcGVhdFwiOiBcInNpbmdsZVwiLFxuICAgICAgICBcImF1dG9wbGF5XCI6IHRydWUsXG4gICAgICAgIFwibXV0ZVwiOiB0cnVlXG4gICAgfVxufVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwpe1xucmVxdWlyZShcIi4vdmVuZG9yL3NwaW4uanNcIik7XG5yZXF1aXJlKFwiLi92ZW5kb3IvZXZlbnR0YXJnZXQuanNcIik7XG5yZXF1aXJlKFwiLi92ZW5kb3IvY29tcG9uZW50LmpzXCIpO1xuXG52YXIgQXBwID0gcmVxdWlyZShcIi4vc3JjL2FwcFwiKTtcbnJlcXVpcmUoXCIuL3NyYy9wbGF5ZXJcIik7XG5yZXF1aXJlKFwiLi9zcmMvcm91dGVcIik7XG5cbmdsb2JhbC5hcHAgPSBuZXcgQXBwKHJlcXVpcmUoXCIuL2NvbmZpZy5qc29uXCIpKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xudmFyIENvbXBvbmVudCA9IHJlcXVpcmUoJy4uL3ZlbmRvci9jb21wb25lbnQnKTtcbnZhciBkb20gPSByZXF1aXJlKCcuLi92ZW5kb3IvZG9tJyk7XG52YXIgUGxheWVyID0gcmVxdWlyZSgnLi9wbGF5ZXInKTtcbnZhciBSb3V0ZSA9IHJlcXVpcmUoJy4vcm91dGUnKTtcblxudmFyIEFwcCA9IGZ1bmN0aW9uKGNvbmZpZykge1xuXG4gICAgdGhpcy5jb25maWcgPSBjb25maWc7XG4gICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSBjb25maWcuTUFQQk9YX0FQSV9UT0tFTjtcblxuICAgIHRoaXMuX3BsYXllciA9IG51bGw7XG5cbiAgICB0aGlzLl9nZW9jb2RlciA9IG5ldyBnb29nbGUubWFwcy5HZW9jb2RlcigpO1xuXG4gICAgdGhpcy5fZGlyZWN0aW9uc1NlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1NlcnZpY2UoKVxuXG4gICAgdGhpcy5fZW5kUG9pbnRzID0gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyb3V0ZScpO1xuICAgIGlmICh0aGlzLl9lbmRQb2ludHMpIHtcbiAgICAgICAgY29uc29sZS5sb2codGhpcy5fZW5kUG9pbnRzKVxuICAgICAgICB0aGlzLl9lbmRQb2ludHMgPSBKU09OLnBhcnNlKHRoaXMuX2VuZFBvaW50cyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fZW5kUG9pbnRzID0gW107XG4gICAgfVxuXG4gICAgQ29tcG9uZW50LmNhbGwodGhpcyk7XG4gICAgdGhpcy5yZW5kZXIoKTtcblxuICAgIHRoaXMub24oe1xuICAgICAgICAnbG9hZDpzdGFydCc6IHRoaXMuc2hvd1ByZWxvYWRlcixcbiAgICAgICAgJ2xvYWQ6ZW5kJzogdGhpcy5oaWRlUHJlbG9hZGVyLFxuICAgICAgICAnY29vcmRzOnJlYWR5JzogdGhpcy5vbkNvb3Jkc1JldHJpZXZlZFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbml0KCk7XG59O1xuaW5oZXJpdHMoQXBwLCBDb21wb25lbnQpO1xuXG5BcHAucHJvdG90eXBlLmNyZWF0ZURvbSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvbS5jcmVhdGUoJ2RpdicsIHtcbiAgICAgICAgJ2NsYXNzJzogJ2FwcCcsXG4gICAgICAgICdodG1sJzogJzxkaXYgY2xhc3M9XCJyb3V0ZS1tYXBcIiBpZD1cInJvdXRlLW1hcFwiPjwvZGl2PidcbiAgICB9KTtcbn07XG5cbkFwcC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZmlyZSgnbG9hZDpzdGFydCcpO1xuXG4gICAgdGhpcy5jcmVhdGVQbGF5ZXIoKTtcbiAgICBpZiAodGhpcy5fZW5kUG9pbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB0aGlzLmdlb2NvZGVFbmRQb2ludHMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9uQ29vcmRzUmV0cmlldmVkKCk7XG4gICAgfVxufTtcblxuQXBwLnByb3RvdHlwZS5nZW9jb2RlRW5kUG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fZ2VvY29kZXIuZ2VvY29kZSh7XG4gICAgICAgICdhZGRyZXNzJzogdGhpcy5jb25maWcuU1RBUlRfQUREUlxuICAgIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICB0aGlzLl9lbmRQb2ludHMucHVzaChbXG4gICAgICAgICAgICAgICAgcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvbi5sYXQoKSxcbiAgICAgICAgICAgICAgICByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIHRoaXMuX2dlb2NvZGVyLmdlb2NvZGUoe1xuICAgICAgICAgICAgICAgIGFkZHJlc3M6IHRoaXMuY29uZmlnLkZJTklTSF9BRERSXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihyZXN1bHRzLCBzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IGdvb2dsZS5tYXBzLkdlb2NvZGVyU3RhdHVzLk9LKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2VuZFBvaW50cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24ubGF0KCksXG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpXG4gICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JvdXRlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMuX2VuZFBvaW50cykpO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlyZSgnY29vcmRzOnJlYWR5Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICB9XG4gICAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbkFwcC5wcm90b3R5cGUuY3JlYXRlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcGxheWVyID0gbmV3IFBsYXllcih0aGlzLmNvbmZpZy5wbGF5ZXIsIHRoaXMuZWxlbWVudCk7XG59O1xuXG5BcHAucHJvdG90eXBlLm9uQ29vcmRzUmV0cmlldmVkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5maXJlKCdsb2FkOmVuZCcpO1xuICAgIGNvbnNvbGUubG9nKHRoaXMuX2VuZFBvaW50cyk7XG4gICAgdGhpcy5jcmVhdGVSb3V0ZU1hcCgpO1xufTtcblxuQXBwLnByb3RvdHlwZS5jcmVhdGVSb3V0ZU1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBib3VuZHMgPSBuZXcgbWFwYm94Z2wuTGF0TG5nQm91bmRzKHRoaXMuX2VuZFBvaW50c1swXSwgdGhpcy5fZW5kUG9pbnRzWzFdKTtcbiAgICBjb25zb2xlLmxvZyhib3VuZHMpO1xuICAgIG1hcGJveGdsLnV0aWwuZ2V0SlNPTignaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGVzL3N0eWxlcy9vdXRkb29ycy12NC5qc29uJywgZnVuY3Rpb24oZXJyLCBzdHlsZSkge1xuICAgICAgICBzdHlsZS5sYXllcnMucHVzaCh7XG4gICAgICAgICAgICBcImlkXCI6IFwicm91dGVcIixcbiAgICAgICAgICAgIFwic291cmNlXCI6IFwicm91dGVcIixcbiAgICAgICAgICAgIFwicmVuZGVyXCI6IHtcbiAgICAgICAgICAgICAgICBcIiR0eXBlXCI6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICAgICAgICAgIFwibGluZS1qb2luXCI6IFwicm91bmRcIixcbiAgICAgICAgICAgICAgICBcImxpbmUtY2FwXCI6IFwicm91bmRcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic3R5bGVcIjoge1xuICAgICAgICAgICAgICAgIFwibGluZS1jb2xvclwiOiBcIiM4ODhcIixcbiAgICAgICAgICAgICAgICBcImxpbmUtd2lkdGhcIjogOFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwidHlwZVwiOiBcImxpbmVcIlxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fcm91dGVNYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgICAgICAgIGNvbnRhaW5lcjogZG9tLmdldEVsZW1lbnQodGhpcy5lbGVtZW50LCAnLnJvdXRlLW1hcCcpLFxuICAgICAgICAgICAgc3R5bGU6IHN0eWxlLFxuICAgICAgICAgICAgem9vbTogMTYsXG4gICAgICAgICAgICBjZW50ZXI6IGJvdW5kcy5nZXRDZW50ZXIoKVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYm91bmRzID0gYm91bmRzO1xuICAgICAgICAvL3RoaXMuX3JvdXRlTWFwLmZpdEJvdW5kcyhib3VuZHMpO1xuICAgICAgICAvLyB0aGlzLl9kaXJlY3Rpb25zUmVuZGVyZXIgPVxuICAgICAgICAvLyAgICAgbmV3IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNSZW5kZXJlcih7XG4gICAgICAgIC8vICAgICAgICAgbWFwOiB0aGlzLl9yb3V0ZU1hcCxcbiAgICAgICAgLy8gICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ2V0Um91dGUoKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuQXBwLnByb3RvdHlwZS5nZXRSb3V0ZSA9IGZ1bmN0aW9uIGdldERpcmVjdGlvbigpIHtcbiAgICB0aGlzLmZpcmUoJ2xvYWQ6c3RhcnQnKTtcbiAgICB0aGlzLl9kaXJlY3Rpb25zU2VydmljZS5yb3V0ZSh7XG4gICAgICAgIG9yaWdpbjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhcbiAgICAgICAgICAgIHRoaXMuX2VuZFBvaW50c1swXVswXSwgdGhpcy5fZW5kUG9pbnRzWzBdWzFdKSxcbiAgICAgICAgZGVzdGluYXRpb246IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoXG4gICAgICAgICAgICB0aGlzLl9lbmRQb2ludHNbMV1bMF0sIHRoaXMuX2VuZFBvaW50c1sxXVsxXSksXG4gICAgICAgIHRyYXZlbE1vZGU6IGdvb2dsZS5tYXBzLkRpcmVjdGlvbnNUcmF2ZWxNb2RlLldBTEtJTkdcbiAgICB9LCBmdW5jdGlvbihyZXNwb25zZSwgc3RhdHVzKSB7XG4gICAgICAgIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICAgICAgdGhpcy5fcm91dGUgPSByZXNwb25zZTtcbiAgICAgICAgICAgIHRoaXMub25Sb3V0ZUNhbGN1bGF0ZWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmlyZSgnbG9hZDplbmQnKTtcbiAgICB9LmJpbmQodGhpcykpO1xufVxuXG5BcHAucHJvdG90eXBlLm9uUm91dGVDYWxjdWxhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5fcm91dGVNYXAuZml0Qm91bmRzKHRoaXMuX2JvdW5kcyk7XG4gICAgdGhpcy5fcm91dGUgPSBuZXcgUm91dGUodGhpcy5fcm91dGUucm91dGVzWzBdLm92ZXJ2aWV3X3BhdGgpLmRlbnNpZnkoNSk7XG4gICAgdmFyIHJvdXRlID0gbmV3IG1hcGJveGdsLkdlb0pTT05Tb3VyY2Uoe1xuICAgICAgICBkYXRhOiB0aGlzLl9yb3V0ZS50b0dlb0pTT04oKVxuICAgIH0pO1xuICAgIHRoaXMuX3JvdXRlTWFwLmFkZFNvdXJjZSgncm91dGUnLCByb3V0ZSk7XG5cbiAgICB0aGlzLnJldHJpZXZlSW1hZ2VyeSh0aGlzLl9yb3V0ZS5fcG9pbnRzKTtcbn07XG5cbkFwcC5wcm90b3R5cGUucmV0cmlldmVJbWFnZXJ5ID0gZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgY29uc29sZS5sb2cocG9pbnRzLCB0aGlzLl9yb3V0ZSlcbiAgICB0aGlzLmZpcmUoJ2xvYWQ6c3RhcnQnKTtcbiAgICB2YXIgaW1ncyA9IFtdLFxuICAgICAgICBiZWFyaW5nO1xuXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYmVhcmluZyA9IHRoaXMuY29tcHV0ZUhlYWRpbmcocG9pbnRzW2kgLSAxXSwgcG9pbnRzW2ldKTtcbiAgICAgICAgaW1ncy5wdXNoKFtcbiAgICAgICAgICAgIFwiaHR0cDovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvc3RyZWV0dmlldz9zaXplPTYwMHgzMDAmbG9jYXRpb249XCIgK1xuICAgICAgICAgICAgcG9pbnRzW2kgLSAxXVswXSArIFwiLFwiICtcbiAgICAgICAgICAgIHBvaW50c1tpIC0gMV1bMV0gKyBcIiZoZWFkaW5nPVwiICsgYmVhcmluZyArXG4gICAgICAgICAgICBcIiZwaXRjaD0tMS42MiZzZW5zb3I9ZmFsc2Uma2V5PVwiICsgdGhpcy5jb25maWcuR09PR0xFX01BUFNfQVBJX0tFWSxcbiAgICAgICAgICAgIHBvaW50c1tpIC0gMV1cbiAgICAgICAgXSk7XG4gICAgfVxuXG4gICAgaW1ncy5wdXNoKFtcbiAgICAgICAgXCJodHRwOi8vbWFwcy5nb29nbGVhcGlzLmNvbS9tYXBzL2FwaS9zdHJlZXR2aWV3P3NpemU9NjAweDMwMCZsb2NhdGlvbj1cIiArXG4gICAgICAgIHBvaW50c1tpIC0gMV1bMF0gKyBcIixcIiArXG4gICAgICAgIHBvaW50c1tpIC0gMV1bMV0gKyBcIiZoZWFkaW5nPVwiICsgYmVhcmluZyArXG4gICAgICAgIFwiJnBpdGNoPS0xLjYyJnNlbnNvcj1mYWxzZSZrZXk9XCIgKyBHT09HTEVfTUFQU19BUElfS0VZLCBwb2ludHNbaSAtIDFdXG4gICAgXSk7XG4gICAgcmV0dXJuIGltZ3Ncbn1cblxuQXBwLnByb3RvdHlwZS5zaG93UHJlbG9hZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdHMgPSB7XG4gICAgICAgIGxpbmVzOiAxMywgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICAgIGxlbmd0aDogMjAsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICAgIHdpZHRoOiAxMCwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICAgIHJhZGl1czogMzAsIC8vIFRoZSByYWRpdXMgb2YgdGhlIGlubmVyIGNpcmNsZVxuICAgICAgICBjb3JuZXJzOiAxLCAvLyBDb3JuZXIgcm91bmRuZXNzICgwLi4xKVxuICAgICAgICByb3RhdGU6IDAsIC8vIFRoZSByb3RhdGlvbiBvZmZzZXRcbiAgICAgICAgZGlyZWN0aW9uOiAxLCAvLyAxOiBjbG9ja3dpc2UsIC0xOiBjb3VudGVyY2xvY2t3aXNlXG4gICAgICAgIGNvbG9yOiAnIzAwMCcsIC8vICNyZ2Igb3IgI3JyZ2diYiBvciBhcnJheSBvZiBjb2xvcnNcbiAgICAgICAgc3BlZWQ6IDEsIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgICAgIHRyYWlsOiA2MCwgLy8gQWZ0ZXJnbG93IHBlcmNlbnRhZ2VcbiAgICAgICAgc2hhZG93OiBmYWxzZSwgLy8gV2hldGhlciB0byByZW5kZXIgYSBzaGFkb3dcbiAgICAgICAgaHdhY2NlbDogZmFsc2UsIC8vIFdoZXRoZXIgdG8gdXNlIGhhcmR3YXJlIGFjY2VsZXJhdGlvblxuICAgICAgICBjbGFzc05hbWU6ICdzcGlubmVyJywgLy8gVGhlIENTUyBjbGFzcyB0byBhc3NpZ24gdG8gdGhlIHNwaW5uZXJcbiAgICAgICAgekluZGV4OiAyZTksIC8vIFRoZSB6LWluZGV4IChkZWZhdWx0cyB0byAyMDAwMDAwMDAwKVxuICAgICAgICB0b3A6ICc1MCUnLCAvLyBUb3AgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XG4gICAgICAgIGxlZnQ6ICc1MCUnIC8vIExlZnQgcG9zaXRpb24gcmVsYXRpdmUgdG8gcGFyZW50XG4gICAgfTtcbiAgICBpZiAoIXRoaXMuX3NwaW5uZXIpIHtcbiAgICAgICAgdGhpcy5fc3Bpbm5lciA9IG5ldyBTcGlubmVyKG9wdHMpLnNwaW4odGhpcy5lbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zcGlubmVyLnNwaW4odGhpcy5lbGVtZW50KTtcbiAgICB9XG5cbiAgICB0aGlzLl9zcGlubmVyLl9pc1N0b3BwZWQgPSBmYWxzZTtcbn07XG5cbkFwcC5wcm90b3R5cGUuaGlkZVByZWxvYWRlciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9zcGlubmVyKSB7XG4gICAgICAgIHRoaXMuX3NwaW5uZXIuc3RvcCgpO1xuICAgICAgICB0aGlzLl9zcGlubmVyLl9pc1N0b3BwZWQgPSB0cnVlO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwO1xuIiwidmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbnZhciBDb21wb25lbnQgPSByZXF1aXJlKCcuLi92ZW5kb3IvY29tcG9uZW50Jyk7XG5cbnZhciBQbGF5ZXIgPSBmdW5jdGlvbihvcHRpb25zLCBjb250YWluZXIpIHtcbiAgICBDb21wb25lbnQuY2FsbCh0aGlzKTtcblxuICAgIHRoaXMucmVuZGVyKGNvbnRhaW5lcik7XG5cbiAgICB0aGlzLl9wbGF5ZXIgPSB2aW1lb3dyYXAodGhpcy5lbGVtZW50KS5zZXR1cChvcHRpb25zKTtcbn07XG5pbmhlcml0cyhQbGF5ZXIsIENvbXBvbmVudCk7XG5cblBsYXllci5wcm90b3R5cGUuY3JlYXRlRG9tID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZG9tLmNyZWF0ZSgnZGl2Jywge1xuICAgICAgICAnY2xhc3MnOiAncGxheWVyJ1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCJ2YXIgUm91dGUgPSBmdW5jdGlvbihwb2ludHMpIHtcbiAgICB0aGlzLl9wb2ludHMgPSBwb2ludHMubWFwKGZ1bmN0aW9uKGxsKSB7XG4gICAgICAgIHJldHVybiBbbGwubGF0KCksIGxsLmxuZygpXTtcbiAgICB9KTtcbn07XG5cblJvdXRlLmludGVycG9sYXRlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCwgcmF0aW8pIHtcbiAgICBzdGFydCA9IG5ldyBnb29nbGUubWFwcy5MYXRMbmcoc3RhcnRbMF0sIHN0YXJ0WzFdKTtcbiAgICBlbmQgPSBuZXcgZ29vZ2xlLm1hcHMuTGF0TG5nKGVuZFswXSwgZW5kWzFdKTtcbiAgICB2YXIgcmVzID0gZ29vZ2xlLm1hcHMuZ2VvbWV0cnkuc3BoZXJpY2FsLmludGVycG9sYXRlKFxuICAgICAgICBzdGFydCxcbiAgICAgICAgZW5kLFxuICAgICAgICByYXRpbyk7XG4gICAgcmV0dXJuIFtyZXMubGF0KCksIHJlcy5sbmcoKV07XG59O1xuXG5Sb3V0ZS5wcm90b3R5cGUuZGVuc2lmeSA9IGZ1bmN0aW9uKGZhY3Rvcikge1xuICAgIHZhciByZXMgPSBbXSxcbiAgICAgICAgcHQ7XG4gICAgZm9yICh2YXIgaSA9IDEsIGxlbiA9IHRoaXMuX3BvaW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgbnBvaW50cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGZhY3RvcjsgaisrKSB7XG4gICAgICAgICAgICByZXMucHVzaChSb3V0ZS5pbnRlcnBvbGF0ZShcbiAgICAgICAgICAgICAgICB0aGlzLl9wb2ludHNbaSAtIDFdLFxuICAgICAgICAgICAgICAgIHRoaXMuX3BvaW50c1tpXSxcbiAgICAgICAgICAgICAgICBqIC8gZmFjdG9yKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcG9pbnRzID0gcmVzO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuUm91dGUucHJvdG90eXBlLnRvR2VvSlNPTiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgICAgXCJwcm9wZXJ0aWVzXCI6IHt9LFxuICAgICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgICAgIFwidHlwZVwiOiBcIkxpbmVTdHJpbmdcIixcbiAgICAgICAgICAgIFwiY29vcmRpbmF0ZXNcIjogdGhpcy5fcG9pbnRzLm1hcChmdW5jdGlvbihsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsbC5yZXZlcnNlKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUm91dGU7XG4iLCJ2YXIgaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xudmFyIEV2ZW50VGFyZ2V0ID0gcmVxdWlyZSgnLi9ldmVudHRhcmdldCcpO1xuY29uc29sZS5sb2coRXZlbnRUYXJnZXQpXG5cbi8qKlxuICogQGZpbGVPdmVydmlldyBCYXNpYyB2aWV3IGNsYXNzXG4gKiBAYXV0aG9yIHc4ciA8aW5mb0B3OHIubmFtZT5cbiAqL1xuXG4vKipcbiAqIEJhc2ljIHZ1ZXcgY2xhc3NcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMge0V2ZW50VGFyZ2V0fVxuICovXG52YXIgQ29tcG9uZW50ID0gZnVuY3Rpb24oKSB7fTtcbmluaGVyaXRzKENvbXBvbmVudCwgRXZlbnRUYXJnZXQpO1xuXG4vKipcbiAqIEBlbnVte1N0cmluZ31cbiAqL1xuQ29tcG9uZW50LmV2ZW50cyA9IHt9O1xuXG4vKipcbiAqIEB0eXBlIHtFbGVtZW50fVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLmVsZW1lbnQgPSBudWxsO1xuXG4vKipcbiAqIEB0eXBlIHsqfVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLm1vZGVsID0gbnVsbDtcblxuLyoqXG4gKiBAdHlwZSB7Q29tcG9uZW50fVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLnBhcmVudCA9IG51bGw7XG5cbi8qKlxuICogQHBhcmFtICB7RWxlbWVudH0gY29udGFpbmVyXG4gKi9cbkNvbXBvbmVudC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgaWYgKCF0aGlzLmVsZW1lbnQpIHtcbiAgICAgICAgdGhpcy5jcmVhdGVEb20oKTtcbiAgICB9XG5cbiAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KTtcbiAgICB9XG4gICAgdGhpcy5vblJlbmRlcmVkKCk7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKi9cbkNvbXBvbmVudC5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Kn0gbW9kZWxcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5zZXRNb2RlbCA9IGZ1bmN0aW9uKG1vZGVsKSB7XG4gICAgdGhpcy5tb2RlbCA9IG1vZGVsO1xufTtcblxuLyoqXG4gKiBAcmV0dXJuIHsqfVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLmdldE1vZGVsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubW9kZWw7XG59O1xuXG4vKipcbiAqIEByZXR1cm4ge0NvbXBvbmVudH1cbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5nZXRQYXJlbnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wYXJlbnQ7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Q29tcG9uZW50fSBwYXJlbnRcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5zZXRQYXJlbnQgPSBmdW5jdGlvbihwYXJlbnQpIHtcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGRvbSBlbGVtZW50cywgZnJvbSB0ZW1wbGF0ZSBmb3IgZXhhbXBsZVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLmNyZWF0ZURvbSA9IGZ1bmN0aW9uKCkge307XG5cbi8qKlxuICogRWxlbWVudCByZW5kZXJlZCwgZW5oYW5jZVxuICovXG5Db21wb25lbnQucHJvdG90eXBlLm9uUmVuZGVyZWQgPSBmdW5jdGlvbigpIHt9O1xuXG4vKipcbiAqIEVsZW1lbnQgd2lsbCBiZSBkZXN0cm95ZWQsIHJlbW92ZSBoYW5kbGVyc1xuICovXG5Db21wb25lbnQucHJvdG90eXBlLm9uQmVmb3JlRGVzdHJveSA9IGZ1bmN0aW9uKCkge307XG5cbi8qKlxuICogRGVzdHJveXMgZG9tIGVsZW1lbnRcbiAqL1xuQ29tcG9uZW50LnByb3RvdHlwZS5kZXN0cm95RG9tID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuZWxlbWVudCAmJiB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpO1xuICAgIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtDb21wb25lbnR9IGNoaWxkXG4gKi9cbkNvbXBvbmVudC5wcm90b3R5cGUuYXBwZW5kQ2hpbGQgPSBmdW5jdGlvbihjaGlsZCkge1xuICAgIGNoaWxkLnNldFBhcmVudCh0aGlzKTtcbiAgICBjaGlsZC5yZW5kZXIodGhpcy5lbGVtZW50KTtcbiAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xufTtcblxuLyoqXG4gKiBEZXN0cnVjdG9yXG4gKi9cbkNvbXBvbmVudC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub25CZWZvcmVEZXN0cm95KCk7XG4gICAgdGhpcy5kZXN0cm95RG9tKCk7XG5cbiAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMubW9kZWwgPSBudWxsO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDb21wb25lbnQ7XG4iLCJ2YXIgZG9tID0gd2luZG93LmRvbSA9IHtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgZG9tIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSB0YWcgSFRNTCB0YWdcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIHByb3BlcnRpZXMvYXR0cmlidXRlc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5ldmVudHNdIEV2ZW50IGxpc3RlbmVyc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5zdHlsZXNdIENTUyBzdHlsZXNcbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24odGFnLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0YWcpLFxuICAgICAgICAgICAgc3R5bGVzO1xuICAgICAgICBpZiAob3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgJChlbGVtZW50KS5vbihvcHRpb25zLmV2ZW50cyk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuZXZlbnRzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5zdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSBvcHRpb25zLnN0eWxlcztcbiAgICAgICAgICAgICAgICBkZWxldGUgb3B0aW9ucy5zdHlsZXM7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zWydjbGFzcyddKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBvcHRpb25zWydjbGFzcyddO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zWydjbGFzcyddO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5odG1sKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5pbm5lckhUTUwgPSBvcHRpb25zLmh0bWw7XG4gICAgICAgICAgICAgICAgZGVsZXRlIG9wdGlvbnMuaHRtbDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgYXR0ciBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoYXR0ciwgb3B0aW9uc1thdHRyXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzdHlsZXMpIHtcbiAgICAgICAgICAgICAgICBkb20uc2V0U3R5bGVzKGVsZW1lbnQsIHN0eWxlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGVsZW1lbnQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7RWxlbWVudHxOb2RlTGlzdHxBcnJheS48RWxlbWVudD59IGVsZW1lbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgICAgICBzdHlsZVxuICAgICAqIEBwYXJhbSB7Kn0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICovXG4gICAgc2V0U3R5bGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHN0eWxlLCB2YWx1ZSkge1xuICAgICAgICBpZiAoZG9tLmlzQXJyYXlMaWtlKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZWxlbWVudC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGRvbS5zZXRTdHlsZShlbGVtZW50W2ldLCBzdHlsZSwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZVtzdHlsZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXQgbXVsdGlwbGUgc3R5bGVzXG4gICAgICogQHBhcmFtIHtFbGVtZW50fE5pZGVMaXN0fEFycmF5LjxFbGVtZW50Pn0gZWxlbWVudFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlc1xuICAgICAqL1xuICAgIHNldFN0eWxlczogZnVuY3Rpb24oZWxlbWVudCwgc3R5bGVzKSB7XG4gICAgICAgIGlmIChkb20uaXNBcnJheUxpa2UoZWxlbWVudCkpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbGVtZW50Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgZG9tLnNldFN0eWxlcyhlbGVtZW50W2ldLCBzdHlsZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgc3R5bGUgaW4gc3R5bGVzKSB7XG4gICAgICAgICAgICAgICAgZG9tLnNldFN0eWxlKGVsZW1lbnQsIHN0eWxlLCBzdHlsZXNbc3R5bGVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIG5vZGUgY29sbGVjdGlvblxuICAgICAqXG4gICAgICogQHBhcmFtICB7RWxlbWVudH0gW2NvbnRleHRdXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJuIHtOb2RlTGlzdHxBcnJheX1cbiAgICAgKi9cbiAgICBnZXRFbGVtZW50czogZnVuY3Rpb24oY29udGV4dCwgc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2VsZWN0b3IgPSBjb250ZXh0O1xuICAgICAgICAgICAgY29udGV4dCA9IGRvY3VtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTYW1lIGFzIGFib3ZlIGJ1dCBvbmx5IGdldHMgb25lIGVsZW1lbnRcbiAgICAgKlxuICAgICAqIEBwYXJhbSAge0VsZW1lbnR9IFtjb250ZXh0XVxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gc2VsZWN0b3JcbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fE51bGx9XG4gICAgICovXG4gICAgZ2V0RWxlbWVudDogZnVuY3Rpb24oY29udGV4dCwgc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjb250ZXh0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2VsZWN0b3IgPSBjb250ZXh0O1xuICAgICAgICAgICAgY29udGV4dCA9IGRvY3VtZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb250ZXh0LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBOZXh0IGVsZW1lbnQgc2libGluZyBmb3IgSUU4XG4gICAgICogQHBhcmFtICB7RWxlbWVudH0gZWxcbiAgICAgKiBAcmV0dXJuIHtFbGVtZW50fVxuICAgICAqL1xuICAgIG5leHRFbGVtZW50U2libGluZzogZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgaWYgKGVsLm5leHRFbGVtZW50U2libGluZykgcmV0dXJuIGVsLm5leHRFbGVtZW50U2libGluZztcbiAgICAgICAgZG8ge1xuICAgICAgICAgICAgZWwgPSBlbC5uZXh0U2libGluZztcbiAgICAgICAgfSB3aGlsZSAoZWwgJiYgZWwubm9kZVR5cGUgIT09IDEpO1xuICAgICAgICByZXR1cm4gZWw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVzZWZ1bCBmb3IgTm9kZWxpc3RzIGFuZCBjb2xsZWN0aW9uc1xuICAgICAqIEBwYXJhbSAgeyp9ICBlbFxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgaXNBcnJheUxpa2U6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KGVsKSB8fFxuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVsKSA9PT0gJ1tvYmplY3QgTm9kZUxpc3RdJztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaXMgb2JqZWN0IGBvYCBhIG5vZGU/XG4gICAgICogc3RvbGVuIGZyb206IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM4NDM4MC8xNTYyMjVcbiAgICAgKi9cbiAgICBpc05vZGU6IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgTm9kZSA9PT0gXCJvYmplY3RcIiA/XG4gICAgICAgICAgICBvIGluc3RhbmNlb2YgTm9kZSA6IG8gJiZcbiAgICAgICAgICAgIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICB0eXBlb2Ygby5ub2RlVHlwZSA9PT0gXCJudW1iZXJcIiAmJlxuICAgICAgICAgICAgdHlwZW9mIG8ubm9kZU5hbWUgPT09IFwic3RyaW5nXCIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpcyBvYmplY3QgYG9gIGFuIGh0bWwgZWxlbWVudD9cbiAgICAgKiBzdG9sZW4gZnJvbTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzg0MzgwLzE1NjIyNVxuICAgICAqL1xuICAgIGlzSHRtbEVsZW1lbnQ6IGZ1bmN0aW9uKG8pIHtcbiAgICAgICAgcmV0dXJuICh0eXBlb2YgSFRNTEVsZW1lbnQgPT09IFwib2JqZWN0XCIgP1xuICAgICAgICAgICAgbyBpbnN0YW5jZW9mIEhUTUxFbGVtZW50IDogLy9ET00yXG4gICAgICAgICAgICBvICYmIHR5cGVvZiBvID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgICAgICBvICE9PSBudWxsICYmXG4gICAgICAgICAgICBvLm5vZGVUeXBlID09PSAxICYmXG4gICAgICAgICAgICB0eXBlb2Ygby5ub2RlTmFtZSA9PT0gXCJzdHJpbmdcIik7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBkb207XG4iLCIvKiBqc2hpbnQgZXFudWxsOiB0cnVlICovXG4vKipcbiAqIEBmaWxlT3ZlcnZpZXcgRXZlbnRzIG1peGluXG4gKiBAYXV0aG9yIDxhIGhyZWY9XCJtYWlsdG86aW5mb0B3OHIubmFtZVwiPnc4cjwvYT5cbiAqL1xuXG4vKipcbiAqIEV2ZW50cyBtaXhpblxuICogQGNsYXNzIEV2ZW50VGFyZ2V0XG4gKi9cbnZhciBFdmVudFRhcmdldCA9IGZ1bmN0aW9uKCkge307XG5cbi8qKlxuICogUmVtb3ZlcyAnb24nIHBhcnRcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBzdGF0aWNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuRXZlbnRUYXJnZXQuY2xlYW5FdmVudFR5cGUgPSBmdW5jdGlvbih0eXBlKSB7XG4gICAgcmV0dXJuIHR5cGUucmVwbGFjZSgvXm9uKFtBLVpdKS8sIGZ1bmN0aW9uKGZ1bGwsIGZpcnN0KSB7XG4gICAgICAgIHJldHVybiBmaXJzdC50b0xvd2VyQ2FzZSgpO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBDb252ZW5pZW5jZSAmIGNvbnNpc3RlbmN5XG4gKi9cbkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEV2ZW50VGFyZ2V0O1xuXG4vKipcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5fZXZlbnRzID0gbnVsbDtcblxuLyoqXG4gKiBBZGRzIGV2ZW50IGhhbmRsZXJcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd8T2JqZWN0fSB0eXBlXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gICAgICBbaGFuZGxlcl1cbiAqIEByZXR1cm4ge0V2ZW50VGFyZ2V0fSBzZWxmXG4gKi9cbkV2ZW50VGFyZ2V0LnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgaGFuZGxlcnM7XG4gICAgaWYgKHR5cGVvZiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICB0eXBlID0gRXZlbnRUYXJnZXQuY2xlYW5FdmVudFR5cGUodHlwZSk7XG4gICAgICAgIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgICAgICAgaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbdHlwZV0gPSB0aGlzLl9ldmVudHNbdHlwZV0gfHwgW107XG4gICAgICAgIGlmIChoYW5kbGVyICYmIGhhbmRsZXJzLmluZGV4T2YoaGFuZGxlcikgPT09IC0xKSB7XG4gICAgICAgICAgICBoYW5kbGVycy5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaGFuZGxlcnMgPSB0eXBlO1xuICAgICAgICBmb3IgKHZhciB0IGluIGhhbmRsZXJzKSB7XG4gICAgICAgICAgICB0aGlzLm9uKHQsIGhhbmRsZXJzW3RdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBldmVudCB0aGF0IGZpcmVzIG9ubHkgb25jZVxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gICB0eXBlXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gaGFuZGxlclxuICogQHJldHVybiB7RXZlbnRUYXJnZXR9IHNlbGZcbiAqL1xuRXZlbnRUYXJnZXQucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBoYW5kbGVyKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB3cmFwcGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBoYW5kbGVyLmFwcGx5KHNlbGYsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMCkpO1xuICAgICAgICAgICAgc2VsZi5vZmYodHlwZSwgYXJndW1lbnRzLmNhbGxlZSk7XG4gICAgICAgIH07XG4gICAgdGhpcy5vbih0eXBlLCB3cmFwcGVkKTtcbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlcyBldmVudCBoYW5kbGVyXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfE9iamVjdH0gdHlwZVxuICogQHBhcmFtICB7RnVuY3Rpb259IFtoYW5kbGVyXVxuICogQHJldHVybiB7RXZlbnRUYXJnZXR9IHNlbGZcbiAqL1xuRXZlbnRUYXJnZXQucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uKHR5cGUsIGhhbmRsZXIpIHtcbiAgICB2YXIgaGFuZGxlcnMsIGksIGxlbjtcbiAgICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdmFyIHBvcztcbiAgICAgICAgICAgIHR5cGUgPSBFdmVudFRhcmdldC5jbGVhbkV2ZW50VHlwZSh0eXBlKTtcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgICAgICAgICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2V2ZW50c1t0eXBlXS5pbmRleE9mKGhhbmRsZXIpO1xuICAgICAgICAgICAgaWYgKHBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0uc3BsaWNlKHBvcywgMSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgeyAvLyByZW1vdmUgYWxsIGV2ZW50cyBvZiBnaXZlbiB0eXBlXG4gICAgICAgICAgICBmb3IgKGhhbmRsZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdIHx8IFtdLFxuICAgICAgICAgICAgICAgIGkgPSAwLCBsZW4gPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMub2ZmKHR5cGUsIGhhbmRsZXJzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBoYW5kbGVycyA9IHR5cGU7XG4gICAgICAgIGZvciAodmFyIHQgaW4gaGFuZGxlcnMpIHtcbiAgICAgICAgICAgIHRoaXMub2ZmKHQsIGhhbmRsZXJzW3RdKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRmlyZXMgZXZlbnRcbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSAge01peGVkfSAgYXJnc1xuICogQHJldHVybiB7RXZlbnRUYXJnZXR9IHNlbGZcbiAqL1xuRXZlbnRUYXJnZXQucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbih0eXBlLCBhcmdzKSB7XG4gICAgdmFyIGhhbmRsZXJzLCBpLCBsZW47XG4gICAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICAgIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKSByZXR1cm4gdGhpcztcblxuICAgIGlmIChhcmdzICE9IG51bGwpIHtcbiAgICAgICAgLy8gd2UgY291bGQndmUgdXNlZCBpc0FycmF5LCBidXQgbGV0J3MgcGFzcyBjb2xsZWN0aW9ucyB0b29cbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzID09PSAnc3RyaW5nJyB8fFxuICAgICAgICAgICAgdHlwZW9mIGFyZ3MubGVuZ3RoICE9PSAnbnVtYmVyJyB8fFxuICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3MpID09PSAnW29iamVjdCBGdW5jdGlvbl0nKSB7XG4gICAgICAgICAgICBhcmdzID0gW2FyZ3NdO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IFtdO1xuICAgIH1cblxuICAgIGZvciAoaGFuZGxlcnMgPSB0aGlzLl9ldmVudHNbdHlwZV0sXG4gICAgICAgIGkgPSAwLFxuICAgICAgICBsZW4gPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKiBBbGlhc2VzICovXG5FdmVudFRhcmdldC5wcm90b3R5cGUuZmlyZSA9IEV2ZW50VGFyZ2V0LnByb3RvdHlwZS50cmlnZ2VyO1xuRXZlbnRUYXJnZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBFdmVudFRhcmdldC5wcm90b3R5cGUub247XG5FdmVudFRhcmdldC5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IEV2ZW50VGFyZ2V0LnByb3RvdHlwZS5vZmY7XG5FdmVudFRhcmdldC5wcm90b3R5cGUuYWRkT25lVGltZUV2ZW50TGlzdGVuZXIgPSBFdmVudFRhcmdldC5wcm90b3R5cGUub25jZTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudFRhcmdldDtcbiIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMTQgRmVsaXggR25hc3NcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xuXG4gICAgLyogQ29tbW9uSlMgKi9cbiAgICBpZiAodHlwZW9mIGV4cG9ydHMgPT0gJ29iamVjdCcpIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpXG5cbiAgICAvKiBBTUQgbW9kdWxlICovXG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShmYWN0b3J5KVxuXG4gICAgLyogQnJvd3NlciBnbG9iYWwgKi9cbiAgICBlbHNlIHJvb3QuU3Bpbm5lciA9IGZhY3RvcnkoKVxuICB9XG4gICh0aGlzLCBmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHZhciBwcmVmaXhlcyA9IFsnd2Via2l0JywgJ01veicsICdtcycsICdPJ10gLyogVmVuZG9yIHByZWZpeGVzICovICxcbiAgICAgIGFuaW1hdGlvbnMgPSB7fSAvKiBBbmltYXRpb24gcnVsZXMga2V5ZWQgYnkgdGhlaXIgbmFtZSAqLyAsXG4gICAgICB1c2VDc3NBbmltYXRpb25zIC8qIFdoZXRoZXIgdG8gdXNlIENTUyBhbmltYXRpb25zIG9yIHNldFRpbWVvdXQgKi9cblxuICAgIC8qKlxuICAgICAqIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGVsZW1lbnRzLiBJZiBubyB0YWcgbmFtZSBpcyBnaXZlbixcbiAgICAgKiBhIERJViBpcyBjcmVhdGVkLiBPcHRpb25hbGx5IHByb3BlcnRpZXMgY2FuIGJlIHBhc3NlZC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVFbCh0YWcsIHByb3ApIHtcbiAgICAgIHZhciBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGFnIHx8ICdkaXYnKSxcbiAgICAgICAgblxuXG4gICAgICBmb3IgKG4gaW4gcHJvcCkgZWxbbl0gPSBwcm9wW25dXG4gICAgICByZXR1cm4gZWxcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBBcHBlbmRzIGNoaWxkcmVuIGFuZCByZXR1cm5zIHRoZSBwYXJlbnQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gaW5zKHBhcmVudCAvKiBjaGlsZDEsIGNoaWxkMiwgLi4uKi8gKSB7XG4gICAgICBmb3IgKHZhciBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspXG4gICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChhcmd1bWVudHNbaV0pXG5cbiAgICAgIHJldHVybiBwYXJlbnRcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbnNlcnQgYSBuZXcgc3R5bGVzaGVldCB0byBob2xkIHRoZSBAa2V5ZnJhbWUgb3IgVk1MIHJ1bGVzLlxuICAgICAqL1xuICAgIHZhciBzaGVldCA9IChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbCA9IGNyZWF0ZUVsKCdzdHlsZScsIHtcbiAgICAgICAgdHlwZTogJ3RleHQvY3NzJ1xuICAgICAgfSlcbiAgICAgIGlucyhkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdLCBlbClcbiAgICAgIHJldHVybiBlbC5zaGVldCB8fCBlbC5zdHlsZVNoZWV0XG4gICAgfSgpKVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbiBvcGFjaXR5IGtleWZyYW1lIGFuaW1hdGlvbiBydWxlIGFuZCByZXR1cm5zIGl0cyBuYW1lLlxuICAgICAqIFNpbmNlIG1vc3QgbW9iaWxlIFdlYmtpdHMgaGF2ZSB0aW1pbmcgaXNzdWVzIHdpdGggYW5pbWF0aW9uLWRlbGF5LFxuICAgICAqIHdlIGNyZWF0ZSBzZXBhcmF0ZSBydWxlcyBmb3IgZWFjaCBsaW5lL3NlZ21lbnQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkQW5pbWF0aW9uKGFscGhhLCB0cmFpbCwgaSwgbGluZXMpIHtcbiAgICAgIHZhciBuYW1lID0gWydvcGFjaXR5JywgdHJhaWwsIH5+IChhbHBoYSAqIDEwMCksIGksIGxpbmVzXS5qb2luKCctJyksXG4gICAgICAgIHN0YXJ0ID0gMC4wMSArIGkgLyBsaW5lcyAqIDEwMCxcbiAgICAgICAgeiA9IE1hdGgubWF4KDEgLSAoMSAtIGFscGhhKSAvIHRyYWlsICogKDEwMCAtIHN0YXJ0KSwgYWxwaGEpLFxuICAgICAgICBwcmVmaXggPSB1c2VDc3NBbmltYXRpb25zLnN1YnN0cmluZygwLCB1c2VDc3NBbmltYXRpb25zLmluZGV4T2YoJ0FuaW1hdGlvbicpKS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICBwcmUgPSBwcmVmaXggJiYgJy0nICsgcHJlZml4ICsgJy0nIHx8ICcnXG5cbiAgICAgIGlmICghYW5pbWF0aW9uc1tuYW1lXSkge1xuICAgICAgICBzaGVldC5pbnNlcnRSdWxlKFxuICAgICAgICAgICdAJyArIHByZSArICdrZXlmcmFtZXMgJyArIG5hbWUgKyAneycgK1xuICAgICAgICAgICcwJXtvcGFjaXR5OicgKyB6ICsgJ30nICtcbiAgICAgICAgICBzdGFydCArICcle29wYWNpdHk6JyArIGFscGhhICsgJ30nICtcbiAgICAgICAgICAoc3RhcnQgKyAwLjAxKSArICcle29wYWNpdHk6MX0nICtcbiAgICAgICAgICAoc3RhcnQgKyB0cmFpbCkgJSAxMDAgKyAnJXtvcGFjaXR5OicgKyBhbHBoYSArICd9JyArXG4gICAgICAgICAgJzEwMCV7b3BhY2l0eTonICsgeiArICd9JyArXG4gICAgICAgICAgJ30nLCBzaGVldC5jc3NSdWxlcy5sZW5ndGgpXG5cbiAgICAgICAgYW5pbWF0aW9uc1tuYW1lXSA9IDFcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWVcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUcmllcyB2YXJpb3VzIHZlbmRvciBwcmVmaXhlcyBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgc3VwcG9ydGVkIHByb3BlcnR5LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHZlbmRvcihlbCwgcHJvcCkge1xuICAgICAgdmFyIHMgPSBlbC5zdHlsZSxcbiAgICAgICAgcHAsIGlcblxuICAgICAgcHJvcCA9IHByb3AuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwcm9wLnNsaWNlKDEpXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcHAgPSBwcmVmaXhlc1tpXSArIHByb3BcbiAgICAgICAgaWYgKHNbcHBdICE9PSB1bmRlZmluZWQpIHJldHVybiBwcFxuICAgICAgfVxuICAgICAgaWYgKHNbcHJvcF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIHByb3BcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIG11bHRpcGxlIHN0eWxlIHByb3BlcnRpZXMgYXQgb25jZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjc3MoZWwsIHByb3ApIHtcbiAgICAgIGZvciAodmFyIG4gaW4gcHJvcClcbiAgICAgICAgZWwuc3R5bGVbdmVuZG9yKGVsLCBuKSB8fCBuXSA9IHByb3Bbbl1cblxuICAgICAgcmV0dXJuIGVsXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlsbHMgaW4gZGVmYXVsdCB2YWx1ZXMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGVmID0gYXJndW1lbnRzW2ldXG4gICAgICAgIGZvciAodmFyIG4gaW4gZGVmKVxuICAgICAgICAgIGlmIChvYmpbbl0gPT09IHVuZGVmaW5lZCkgb2JqW25dID0gZGVmW25dXG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgYWJzb2x1dGUgcGFnZS1vZmZzZXQgb2YgdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcG9zKGVsKSB7XG4gICAgICB2YXIgbyA9IHtcbiAgICAgICAgeDogZWwub2Zmc2V0TGVmdCxcbiAgICAgICAgeTogZWwub2Zmc2V0VG9wXG4gICAgICB9XG4gICAgICB3aGlsZSAoKGVsID0gZWwub2Zmc2V0UGFyZW50KSlcbiAgICAgICAgby54ICs9IGVsLm9mZnNldExlZnQsIG8ueSArPSBlbC5vZmZzZXRUb3BcblxuICAgICAgcmV0dXJuIG9cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBsaW5lIGNvbG9yIGZyb20gdGhlIGdpdmVuIHN0cmluZyBvciBhcnJheS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRDb2xvcihjb2xvciwgaWR4KSB7XG4gICAgICByZXR1cm4gdHlwZW9mIGNvbG9yID09ICdzdHJpbmcnID8gY29sb3IgOiBjb2xvcltpZHggJSBjb2xvci5sZW5ndGhdXG4gICAgfVxuXG4gICAgLy8gQnVpbHQtaW4gZGVmYXVsdHNcblxuICAgIHZhciBkZWZhdWx0cyA9IHtcbiAgICAgIGxpbmVzOiAxMiwgLy8gVGhlIG51bWJlciBvZiBsaW5lcyB0byBkcmF3XG4gICAgICBsZW5ndGg6IDcsIC8vIFRoZSBsZW5ndGggb2YgZWFjaCBsaW5lXG4gICAgICB3aWR0aDogNSwgLy8gVGhlIGxpbmUgdGhpY2tuZXNzXG4gICAgICByYWRpdXM6IDEwLCAvLyBUaGUgcmFkaXVzIG9mIHRoZSBpbm5lciBjaXJjbGVcbiAgICAgIHJvdGF0ZTogMCwgLy8gUm90YXRpb24gb2Zmc2V0XG4gICAgICBjb3JuZXJzOiAxLCAvLyBSb3VuZG5lc3MgKDAuLjEpXG4gICAgICBjb2xvcjogJyMwMDAnLCAvLyAjcmdiIG9yICNycmdnYmJcbiAgICAgIGRpcmVjdGlvbjogMSwgLy8gMTogY2xvY2t3aXNlLCAtMTogY291bnRlcmNsb2Nrd2lzZVxuICAgICAgc3BlZWQ6IDEsIC8vIFJvdW5kcyBwZXIgc2Vjb25kXG4gICAgICB0cmFpbDogMTAwLCAvLyBBZnRlcmdsb3cgcGVyY2VudGFnZVxuICAgICAgb3BhY2l0eTogMSAvIDQsIC8vIE9wYWNpdHkgb2YgdGhlIGxpbmVzXG4gICAgICBmcHM6IDIwLCAvLyBGcmFtZXMgcGVyIHNlY29uZCB3aGVuIHVzaW5nIHNldFRpbWVvdXQoKVxuICAgICAgekluZGV4OiAyZTksIC8vIFVzZSBhIGhpZ2ggei1pbmRleCBieSBkZWZhdWx0XG4gICAgICBjbGFzc05hbWU6ICdzcGlubmVyJywgLy8gQ1NTIGNsYXNzIHRvIGFzc2lnbiB0byB0aGUgZWxlbWVudFxuICAgICAgdG9wOiAnNTAlJywgLy8gY2VudGVyIHZlcnRpY2FsbHlcbiAgICAgIGxlZnQ6ICc1MCUnLCAvLyBjZW50ZXIgaG9yaXpvbnRhbGx5XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyAvLyBlbGVtZW50IHBvc2l0aW9uXG4gICAgfVxuXG4gICAgLyoqIFRoZSBjb25zdHJ1Y3RvciAqL1xuICAgIGZ1bmN0aW9uIFNwaW5uZXIobykge1xuICAgICAgdGhpcy5vcHRzID0gbWVyZ2UobyB8fCB7fSwgU3Bpbm5lci5kZWZhdWx0cywgZGVmYXVsdHMpXG4gICAgfVxuXG4gICAgLy8gR2xvYmFsIGRlZmF1bHRzIHRoYXQgb3ZlcnJpZGUgdGhlIGJ1aWx0LWluczpcbiAgICBTcGlubmVyLmRlZmF1bHRzID0ge31cblxuICAgIG1lcmdlKFNwaW5uZXIucHJvdG90eXBlLCB7XG5cbiAgICAgIC8qKlxuICAgICAgICogQWRkcyB0aGUgc3Bpbm5lciB0byB0aGUgZ2l2ZW4gdGFyZ2V0IGVsZW1lbnQuIElmIHRoaXMgaW5zdGFuY2UgaXMgYWxyZWFkeVxuICAgICAgICogc3Bpbm5pbmcsIGl0IGlzIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIGl0cyBwcmV2aW91cyB0YXJnZXQgYiBjYWxsaW5nXG4gICAgICAgKiBzdG9wKCkgaW50ZXJuYWxseS5cbiAgICAgICAqL1xuICAgICAgc3BpbjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgICAgIHRoaXMuc3RvcCgpXG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICAgIG8gPSBzZWxmLm9wdHMsXG4gICAgICAgICAgZWwgPSBzZWxmLmVsID0gY3NzKGNyZWF0ZUVsKDAsIHtcbiAgICAgICAgICAgIGNsYXNzTmFtZTogby5jbGFzc05hbWVcbiAgICAgICAgICB9KSwge1xuICAgICAgICAgICAgcG9zaXRpb246IG8ucG9zaXRpb24sXG4gICAgICAgICAgICB3aWR0aDogMCxcbiAgICAgICAgICAgIHpJbmRleDogby56SW5kZXhcbiAgICAgICAgICB9KSxcbiAgICAgICAgICBtaWQgPSBvLnJhZGl1cyArIG8ubGVuZ3RoICsgby53aWR0aFxuXG4gICAgICAgIGNzcyhlbCwge1xuICAgICAgICAgIGxlZnQ6IG8ubGVmdCxcbiAgICAgICAgICB0b3A6IG8udG9wXG4gICAgICAgIH0pXG5cbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgIHRhcmdldC5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldC5maXJzdENoaWxkIHx8IG51bGwpXG4gICAgICAgIH1cblxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoJ3JvbGUnLCAncHJvZ3Jlc3NiYXInKVxuICAgICAgICBzZWxmLmxpbmVzKGVsLCBzZWxmLm9wdHMpXG5cbiAgICAgICAgaWYgKCF1c2VDc3NBbmltYXRpb25zKSB7XG4gICAgICAgICAgLy8gTm8gQ1NTIGFuaW1hdGlvbiBzdXBwb3J0LCB1c2Ugc2V0VGltZW91dCgpIGluc3RlYWRcbiAgICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDIsXG4gICAgICAgICAgICBhbHBoYSwgZnBzID0gby5mcHMsXG4gICAgICAgICAgICBmID0gZnBzIC8gby5zcGVlZCxcbiAgICAgICAgICAgIG9zdGVwID0gKDEgLSBvLm9wYWNpdHkpIC8gKGYgKiBvLnRyYWlsIC8gMTAwKSxcbiAgICAgICAgICAgIGFzdGVwID0gZiAvIG8ubGluZXNcblxuICAgICAgICAgIDtcbiAgICAgICAgICAoZnVuY3Rpb24gYW5pbSgpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgby5saW5lczsgaisrKSB7XG4gICAgICAgICAgICAgIGFscGhhID0gTWF0aC5tYXgoMSAtIChpICsgKG8ubGluZXMgLSBqKSAqIGFzdGVwKSAlIGYgKiBvc3RlcCwgby5vcGFjaXR5KVxuXG4gICAgICAgICAgICAgIHNlbGYub3BhY2l0eShlbCwgaiAqIG8uZGlyZWN0aW9uICsgc3RhcnQsIGFscGhhLCBvKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi50aW1lb3V0ID0gc2VsZi5lbCAmJiBzZXRUaW1lb3V0KGFuaW0sIH5+ICgxMDAwIC8gZnBzKSlcbiAgICAgICAgICB9KSgpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNlbGZcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogU3RvcHMgYW5kIHJlbW92ZXMgdGhlIFNwaW5uZXIuXG4gICAgICAgKi9cbiAgICAgIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgICAgIGlmIChlbCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUpIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXG4gICAgICAgICAgdGhpcy5lbCA9IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzXG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IGRyYXdzIHRoZSBpbmRpdmlkdWFsIGxpbmVzLiBXaWxsIGJlIG92ZXJ3cml0dGVuXG4gICAgICAgKiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgICAqL1xuICAgICAgbGluZXM6IGZ1bmN0aW9uKGVsLCBvKSB7XG4gICAgICAgIHZhciBpID0gMCxcbiAgICAgICAgICBzdGFydCA9IChvLmxpbmVzIC0gMSkgKiAoMSAtIG8uZGlyZWN0aW9uKSAvIDIsXG4gICAgICAgICAgc2VnXG5cbiAgICAgICAgZnVuY3Rpb24gZmlsbChjb2xvciwgc2hhZG93KSB7XG4gICAgICAgICAgcmV0dXJuIGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHdpZHRoOiAoby5sZW5ndGggKyBvLndpZHRoKSArICdweCcsXG4gICAgICAgICAgICBoZWlnaHQ6IG8ud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogY29sb3IsXG4gICAgICAgICAgICBib3hTaGFkb3c6IHNoYWRvdyxcbiAgICAgICAgICAgIHRyYW5zZm9ybU9yaWdpbjogJ2xlZnQnLFxuICAgICAgICAgICAgdHJhbnNmb3JtOiAncm90YXRlKCcgKyB+figzNjAgLyBvLmxpbmVzICogaSArIG8ucm90YXRlKSArICdkZWcpIHRyYW5zbGF0ZSgnICsgby5yYWRpdXMgKyAncHgnICsgJywwKScsXG4gICAgICAgICAgICBib3JkZXJSYWRpdXM6IChvLmNvcm5lcnMgKiBvLndpZHRoID4+IDEpICsgJ3B4J1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKDsgaSA8IG8ubGluZXM7IGkrKykge1xuICAgICAgICAgIHNlZyA9IGNzcyhjcmVhdGVFbCgpLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogMSArIH4oby53aWR0aCAvIDIpICsgJ3B4JyxcbiAgICAgICAgICAgIHRyYW5zZm9ybTogby5od2FjY2VsID8gJ3RyYW5zbGF0ZTNkKDAsMCwwKScgOiAnJyxcbiAgICAgICAgICAgIG9wYWNpdHk6IG8ub3BhY2l0eSxcbiAgICAgICAgICAgIGFuaW1hdGlvbjogdXNlQ3NzQW5pbWF0aW9ucyAmJiBhZGRBbmltYXRpb24oby5vcGFjaXR5LCBvLnRyYWlsLCBzdGFydCArIGkgKiBvLmRpcmVjdGlvbiwgby5saW5lcykgKyAnICcgKyAxIC8gby5zcGVlZCArICdzIGxpbmVhciBpbmZpbml0ZSdcbiAgICAgICAgICB9KVxuXG4gICAgICAgICAgaWYgKG8uc2hhZG93KSBpbnMoc2VnLCBjc3MoZmlsbCgnIzAwMCcsICcwIDAgNHB4ICcgKyAnIzAwMCcpLCB7XG4gICAgICAgICAgICB0b3A6IDIgKyAncHgnXG4gICAgICAgICAgfSkpXG4gICAgICAgICAgaW5zKGVsLCBpbnMoc2VnLCBmaWxsKGdldENvbG9yKG8uY29sb3IsIGkpLCAnMCAwIDFweCByZ2JhKDAsMCwwLC4xKScpKSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZWxcbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgYWRqdXN0cyB0aGUgb3BhY2l0eSBvZiBhIHNpbmdsZSBsaW5lLlxuICAgICAgICogV2lsbCBiZSBvdmVyd3JpdHRlbiBpbiBWTUwgZmFsbGJhY2sgbW9kZSBiZWxvdy5cbiAgICAgICAqL1xuICAgICAgb3BhY2l0eTogZnVuY3Rpb24oZWwsIGksIHZhbCkge1xuICAgICAgICBpZiAoaSA8IGVsLmNoaWxkTm9kZXMubGVuZ3RoKSBlbC5jaGlsZE5vZGVzW2ldLnN0eWxlLm9wYWNpdHkgPSB2YWxcbiAgICAgIH1cblxuICAgIH0pXG5cblxuICAgIGZ1bmN0aW9uIGluaXRWTUwoKSB7XG5cbiAgICAgIC8qIFV0aWxpdHkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgVk1MIHRhZyAqL1xuICAgICAgZnVuY3Rpb24gdm1sKHRhZywgYXR0cikge1xuICAgICAgICByZXR1cm4gY3JlYXRlRWwoJzwnICsgdGFnICsgJyB4bWxucz1cInVybjpzY2hlbWFzLW1pY3Jvc29mdC5jb206dm1sXCIgY2xhc3M9XCJzcGluLXZtbFwiPicsIGF0dHIpXG4gICAgICB9XG5cbiAgICAgIC8vIE5vIENTUyB0cmFuc2Zvcm1zIGJ1dCBWTUwgc3VwcG9ydCwgYWRkIGEgQ1NTIHJ1bGUgZm9yIFZNTCBlbGVtZW50czpcbiAgICAgIHNoZWV0LmFkZFJ1bGUoJy5zcGluLXZtbCcsICdiZWhhdmlvcjp1cmwoI2RlZmF1bHQjVk1MKScpXG5cbiAgICAgIFNwaW5uZXIucHJvdG90eXBlLmxpbmVzID0gZnVuY3Rpb24oZWwsIG8pIHtcbiAgICAgICAgdmFyIHIgPSBvLmxlbmd0aCArIG8ud2lkdGgsXG4gICAgICAgICAgcyA9IDIgKiByXG5cbiAgICAgICAgZnVuY3Rpb24gZ3JwKCkge1xuICAgICAgICAgIHJldHVybiBjc3MoXG4gICAgICAgICAgICB2bWwoJ2dyb3VwJywge1xuICAgICAgICAgICAgICBjb29yZHNpemU6IHMgKyAnICcgKyBzLFxuICAgICAgICAgICAgICBjb29yZG9yaWdpbjogLXIgKyAnICcgKyAtclxuICAgICAgICAgICAgfSksIHtcbiAgICAgICAgICAgICAgd2lkdGg6IHMsXG4gICAgICAgICAgICAgIGhlaWdodDogc1xuICAgICAgICAgICAgfVxuICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBtYXJnaW4gPSAtKG8ud2lkdGggKyBvLmxlbmd0aCkgKiAyICsgJ3B4JyxcbiAgICAgICAgICBnID0gY3NzKGdycCgpLCB7XG4gICAgICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgICAgIHRvcDogbWFyZ2luLFxuICAgICAgICAgICAgbGVmdDogbWFyZ2luXG4gICAgICAgICAgfSksXG4gICAgICAgICAgaVxuXG4gICAgICAgIGZ1bmN0aW9uIHNlZyhpLCBkeCwgZmlsdGVyKSB7XG4gICAgICAgICAgaW5zKGcsXG4gICAgICAgICAgICBpbnMoY3NzKGdycCgpLCB7XG4gICAgICAgICAgICAgICAgcm90YXRpb246IDM2MCAvIG8ubGluZXMgKiBpICsgJ2RlZycsXG4gICAgICAgICAgICAgICAgbGVmdDogfn5keFxuICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgaW5zKGNzcyh2bWwoJ3JvdW5kcmVjdCcsIHtcbiAgICAgICAgICAgICAgICAgIGFyY3NpemU6IG8uY29ybmVyc1xuICAgICAgICAgICAgICAgIH0pLCB7XG4gICAgICAgICAgICAgICAgICB3aWR0aDogcixcbiAgICAgICAgICAgICAgICAgIGhlaWdodDogby53aWR0aCxcbiAgICAgICAgICAgICAgICAgIGxlZnQ6IG8ucmFkaXVzLFxuICAgICAgICAgICAgICAgICAgdG9wOiAtby53aWR0aCA+PiAxLFxuICAgICAgICAgICAgICAgICAgZmlsdGVyOiBmaWx0ZXJcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB2bWwoJ2ZpbGwnLCB7XG4gICAgICAgICAgICAgICAgICBjb2xvcjogZ2V0Q29sb3Ioby5jb2xvciwgaSksXG4gICAgICAgICAgICAgICAgICBvcGFjaXR5OiBvLm9wYWNpdHlcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICB2bWwoJ3N0cm9rZScsIHtcbiAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcbiAgICAgICAgICAgICAgICB9KSAvLyB0cmFuc3BhcmVudCBzdHJva2UgdG8gZml4IGNvbG9yIGJsZWVkaW5nIHVwb24gb3BhY2l0eSBjaGFuZ2VcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvLnNoYWRvdylcbiAgICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKylcbiAgICAgICAgICAgIHNlZyhpLCAtMiwgJ3Byb2dpZDpEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5CbHVyKHBpeGVscmFkaXVzPTIsbWFrZXNoYWRvdz0xLHNoYWRvd29wYWNpdHk9LjMpJylcblxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IG8ubGluZXM7IGkrKykgc2VnKGkpXG4gICAgICAgIHJldHVybiBpbnMoZWwsIGcpXG4gICAgICB9XG5cbiAgICAgIFNwaW5uZXIucHJvdG90eXBlLm9wYWNpdHkgPSBmdW5jdGlvbihlbCwgaSwgdmFsLCBvKSB7XG4gICAgICAgIHZhciBjID0gZWwuZmlyc3RDaGlsZFxuICAgICAgICBvID0gby5zaGFkb3cgJiYgby5saW5lcyB8fCAwXG4gICAgICAgIGlmIChjICYmIGkgKyBvIDwgYy5jaGlsZE5vZGVzLmxlbmd0aCkge1xuICAgICAgICAgIGMgPSBjLmNoaWxkTm9kZXNbaSArIG9dO1xuICAgICAgICAgIGMgPSBjICYmIGMuZmlyc3RDaGlsZDtcbiAgICAgICAgICBjID0gYyAmJiBjLmZpcnN0Q2hpbGRcbiAgICAgICAgICBpZiAoYykgYy5vcGFjaXR5ID0gdmFsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcHJvYmUgPSBjc3MoY3JlYXRlRWwoJ2dyb3VwJyksIHtcbiAgICAgIGJlaGF2aW9yOiAndXJsKCNkZWZhdWx0I1ZNTCknXG4gICAgfSlcblxuICAgIGlmICghdmVuZG9yKHByb2JlLCAndHJhbnNmb3JtJykgJiYgcHJvYmUuYWRqKSBpbml0Vk1MKClcbiAgICBlbHNlIHVzZUNzc0FuaW1hdGlvbnMgPSB2ZW5kb3IocHJvYmUsICdhbmltYXRpb24nKVxuXG4gICAgcmV0dXJuIFNwaW5uZXJcblxuICB9KSk7XG4iXX0=
