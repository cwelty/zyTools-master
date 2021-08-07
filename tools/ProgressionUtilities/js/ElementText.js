'use strict';

/* exported ElementText */
/* global replaceStringVariables, replaceBackticks */

/**
    An {ElementText} models text that is displayed to the user.
    @class ElementText
    @extends Element
*/
class ElementText extends Element {

    /**
        @constructor
        @param {Object} elementTextJSON JSON that models that the text. See {Element} for more properties.
        @param {String} elementTextJSON.text The text displayed to the user.
    */
    constructor(elementTextJSON) {
        super(elementTextJSON);
        this.text = elementTextJSON.text || '';

        /**
            The text as HTML.
            @property html
            @type {String}
            @default null
        */
        this.html = null;
    }

    /**
        Return a clone of this element.
        @method clone
        @return {Element} Copy of this element.
    */
    clone() {
        return new ElementText(this.toJSON());
    }

    /**
        Return JSON representing this element.
        @method toJSON
        @return {Object} JSON representing this element.
    */
    toJSON() {
        const elementJSON = Element.prototype.toJSON.call(this); // eslint-disable-line prefer-reflect

        elementJSON.text = this.text;

        return elementJSON;
    }

    /**
        Update text with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        this.text = replaceStringVariables(this.text, module);
    }

    /**
        Prepare text for rendering.
        @method prepareForRendering
        @return {void}
    */
    prepareForRendering() {
        this.html = replaceBackticks(this.text);
    }
}
