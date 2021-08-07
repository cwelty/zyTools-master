'use strict';

/* exported CircleCSS */

/**
    A class that defines a circle.
    @class CircleCSS
*/
class CircleCSS {

    /**
        @constructor
        @param {Number} [height=0] A value for the height CSS attribute.
        @param {Number} [left=0] A value for the left CSS attribute.
        @param {Number} [top=0] A value for the top CSS attribute.
        @param {Number} [width=0] A value for the width CSS attribute.
    */
    constructor(height = 0, left = 0, top = 0, width = 0) {

        /**
            A value for the height CSS attribute.
            @property height
            @type {Number}
        */
        this.height = height;

        /**
            A value for the left CSS attribute.
            @property left
            @type {Number}
        */
        this.left = left;

        /**
            A value for the top CSS attribute.
            @property top
            @type {Number}
        */
        this.top = top;

        /**
            A value for the width CSS attribute.
            @property width
            @type {Number}
        */
        this.width = width;
    }

    /**
        Sets the height.
        @method setHeight
        @param {Number} newHeight The new height to set.
        @return {CircleCSS} A reference to the current CircleCSS object. Allows chaining calls to these a other functions.
    */
    setHeight(newHeight) {
        this.height = newHeight;
        return this;
    }

    /**
        Sets the left.
        @method setLeft
        @param {Number} newLeft The new left to set.
        @return {CircleCSS} A reference to the current CircleCSS object. Allows chaining calls to these a other functions.
    */
    setLeft(newLeft) {
        this.left = newLeft;
        return this;
    }

    /**
        Sets the top.
        @method setTop
        @param {Number} newTop The new top to set.
        @return {CircleCSS} A reference to the current CircleCSS object. Allows chaining calls to these a other functions.
    */
    setTop(newTop) {
        this.top = newTop;
        return this;
    }

    /**
        Sets the width.
        @method setWidth
        @param {Number} newWidth The new width to set.
        @return {CircleCSS} A reference to the current CircleCSS object. Allows chaining calls to these a other functions.
    */
    setWidth(newWidth) {
        this.width = newWidth;
        return this;
    }

    /**
        Returns an object representing this CircleCSS
        @method getObject
        @return {Object}
    */
    getObject() {
        return {
            height: this.height,
            left: this.left,
            top: this.top,
            width: this.width,
        };
    }

    /**
        Clones this CircleCSS object and returns the new one.
        @method clone
        @return {CircleCSS}
    */
    clone() {
        return new CircleCSS(this.height, this.left, this.top, this.width);
    }
}
