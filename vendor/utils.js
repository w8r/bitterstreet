/**
 * Miscellaneous utils
 * @author w8r <info@w8r.name>
 */

/**
 * Inheritance
 *
 * @param  {Function} Child
 * @param  {Function} Base
 */
var inherits = function(Child, Base) {
    var tempConstructor = function() {};
    tempConstructor.prototype = Base.prototype;
    Child.prototype = new tempConstructor();

    Child.superProto = Base.prototype;
    // Fuck you, IE8-9
    Child._super = Base;

    Child.prototype.constructor = Child;
};

/**
 * Various utils
 *
 * @type {Object}
 * @const
 */
var utils = window.utils = {

    /**
     * Empty
     */
    noop: function() {},

    /**
     * @param  {*}  o
     * @return {Boolean}
     */
    isDef: function(o) {
        return typeof o !== 'undefined';
    },

    /**
     * @param  {*}  o
     * @return {Boolean}
     */
    isString: function(o) {
        return typeof o === 'string';
    },

    /**
     * Mix-in
     * @param  {Function} Child
     * @param  {Function} Interface
     */
    mixin: function(Child, Interface) {
        for (var method in Interface.prototype) {
            Child.prototype[method] = Interface.prototype[method];
        }
    },

    /**
     * Throws error if invoked
     */
    abstractMehod: function() {
        throw new Error('This method hasn\'t been implemented');
    },

    /**
     * @type {Number}
     */
    idCounter: 0,

    /**
     * Unique string
     *
     * @return {String}
     */
    unique: function() {
        return (Date.now()).toString(36);
    },

    /**
     * Stringifies primitive type
     * @param  {String|Boolean|Number|*} v
     * @return {String}
     */
    stringifyType: function(v) {
        switch (typeof v) {
            case 'string':
                return v;

            case 'boolean':
                return v ? 'true' : 'false';

            case 'number':
                return isFinite(v) ? v : '';

            default:
                return '';
        }
    },

    /**
     * Object to query string
     * @param  {*} object
     * @return {String}
     */
    toQueryString: function(object) {
        var separator = '&',
            equals = '=',
            name;

        if (object === null) {
            object = undefined;
        }

        if (typeof object === 'object') {
            return Object.keys(object).map(function(k) {
                var ks = encodeURIComponent(utils.stringifyType(k)) + equals;
                if (Array.isArray(object[k])) {
                    return object[k].map(function(v) {
                        return ks + encodeURIComponent(utils.stringifyType(v));
                    }).join(separator);
                } else {
                    return ks + encodeURIComponent(utils.stringifyType(object[k]));
                }
            }).join(separator);

        }

        if (!name) {
            return '';
        }

        return encodeURIComponent(utils.stringifyType(name)) + equals +
            encodeURIComponent(utils.stringifyType(object));
    }
};

module.exports = utils;
