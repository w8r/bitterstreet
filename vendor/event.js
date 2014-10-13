/**
 * @fileOverview Dom events
 * @author w8r <info@w8r.name>
 */

(function() {

    /**
     * @type {Boolean}
     */
    var supportsEventListenerApi =
        (document.createElement('a').addEventListener);

    /**
     * @type {Object}
     */
    dom.event = {

        /**
         * Add event listener wrapper
         *
         * @param {Element}  element
         * @param {String}   event
         * @param {Function} handler
         */
        _addEventListener: supportsEventListenerApi ?
            function(element, event, handler) {
                element.addEventListener(event, handler, false);
        } : function(element, event, handler) {
            element.attachEvent("on" + event, handler);
        },

        /**
         * Remove event listener wrapper
         *
         * @param {Element}  element
         * @param {String}   event
         * @param {Function} handler
         */
        _removeEventListener: supportsEventListenerApi ?
            function(element, event, handler) {
                element.removeEventListener(event, handler, false);
        } : function(element, event, handler) {
            element.detachEvent("on" + event, handler);
        },

        /**
         * Add event listener
         *
         * @param  {Element|NodeList|Array.<Element>} element
         * @param  {String|Object}                    event
         * @param  {Function}                         [handler]
         * @return {*}
         */
        on: function(element, event, handler) {
            if (dom.isArrayLike(element)) {
                for (var i = 0, len = element.length; i < len; i++) {
                    dom.event.on(element[i], event, handler);
                }
            } else {
                if (handler) {
                    dom.event._addEventListener(element, event, handler);
                } else {
                    for (var evt in event) {
                        dom.event._addEventListener(element, evt, event[evt]);
                    }
                }
            }
            return element;
        },


        /**
         * Remove event listener
         *
         * @param  {Element|NodeList|Array.<Element>} element
         * @param  {String|Object}                    event
         * @param  {Function}                         [handler]
         * @return {*}
         */
        off: function(element, event, handler) {
            if (dom.isArrayLike(element)) {
                for (var i = 0, len = element.length; i < len; i++) {
                    dom.event.off(element[i], event, handler);
                }
            } else {
                if (handler) {
                    dom.event._removeEventListener(element, event, handler);
                } else {
                    for (var evt in event) {
                        dom.event._removeEventListener(
                            element, evt, event[evt]);
                    }
                }
            }
        },

        trigger: function() {},

        /**
         * Adds event handler that is only called once then
         * detaches from element
         * @param  {Element|NodeList|Array.<Element>} element
         * @param  {String}                           event
         * @param  {Function}                         handler
         * @return {*}
         */
        once: function(element, event, handler) {
            if (dom.isArrayLike(element)) {
                for (var i = 0, len = element.length; i < len; i++) {
                    dom.event.once(element[i], event, handler);
                }
            } else {
                var ref = element,
                    wrapped = function() {
                        handler.apply(ref,
                            Array.prototype.slice.call(arguments, 0));
                        dom.event.off(ref, event, arguments.callee);
                    };
                dom.event.on(element, event, wrapped);
            }
        },

        /**
         * prevent default for `event`
         * @param {DOMEvent}
         */
        preventDefault: function(event) {
            if (event.preventDefault) event.preventDefault();
            else event.returnValue = false;
        },

        /**
         * stop propagation of `event`
         * @param {DOMEvent}
         */
        stopPropagation: function(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
                event.returnValue = false;
            }
        },

        /**
         * Prevents default and stops propagation
         *
         * @param  {DOMEvent} event
         */
        stop: function(event) {
            dom.event.preventDefault(event);
            dom.event.stopPropagation(event);
        }
    };

})();
