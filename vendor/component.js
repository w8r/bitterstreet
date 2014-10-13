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
