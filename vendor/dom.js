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
