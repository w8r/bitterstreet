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
