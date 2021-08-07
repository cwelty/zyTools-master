'use strict';

/* exported FlowchartElementController */

/**
    Abstract controller for an element of the flowchart.
    @class FlowchartElementController
*/
class FlowchartElementController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(canvas) {

        /**
            Reference to the Raphael.js instance used to draw the flowchart.
            @property canvas
            @type {Object}
        */
        this.canvas = canvas;

        /**
            Reference to the drawing of the element on the canvas.
            @property drawing
            @type {Raphael.Set}
            @default []
        */
        this.drawing = canvas.set();
    }

    /**
        Render the element.
        @method render
        @return {void}
    */
    render() {
        throw new Error('FlowchartElementController\'s render function should be overridden');
    }

    /**
        Return the y-position of the bottom of the element.
        @method getBottom
        @return {Number} The y-position of the bottom of the element.
    */
    getBottom() {
        return Math.max(...this.drawing.items.map(item => item.getBBox().y + item.getBBox().height)); // eslint-disable-line id-length
    }

    /**
        Return the y-position of the top of the element.
        @method getTop
        @return {Number} The y-position of the top of the element.
    */
    getTop() {
        return Math.min(...this.drawing.items.map(item => item.getBBox().y));
    }

    /**
        Return the x-position of the left of the element.
        @method getLeft
        @return {Number} The x-position of the left of the element.
    */
    getLeft() {
        return Math.min(...this.drawing.items.map(item => item.getBBox().x));
    }

    /**
        Return the x-position of the right of the element.
        @method getRight
        @return {Number} The x-position of the right of the element.
    */
    getRight() {
        return Math.max(...this.drawing.items.map(item => item.getBBox().x + item.getBBox().width)); // eslint-disable-line id-length
    }

    /**
        Return the x-position of the left of the element at vertical-center.
        Input and output nodes override this b/c the left-side wall is angled.
        @method getLeftAtVerticalCenter
        @return {Number} The x-position of the left of the element at vertical-center.
    */
    getLeftAtVerticalCenter() {
        return this.getLeft();
    }

    /**
        Return the x-position of the right of the element at vertical-center.
        Input and output nodes override this b/c the right-side wall is angled.
        @method getRightAtVerticalCenter
        @return {Number} The x-position of the right of the element at vertical-center.
    */
    getRightAtVerticalCenter() {
        return this.getRight();
    }

    /**
        Return the center x-position of the element.
        @method getHorizontalCenter
        @return {Number} The center x-position of the element.
    */
    getHorizontalCenter() {

        /*
            Want halfway point between left-most x (leftX) and right-most x (rightX).
            That is, we want to go (rightX - leftX) / 2 beyond leftX, which is:
            leftX + ((rightX - leftX) / 2)
            (rightX / 2) + (leftX - (leftX / 2))
            (rightX / 2) + (leftX / 2)
            (rightX + leftX) / 2
        */
        return (this.getRight() + this.getLeft()) / 2; // eslint-disable-line no-magic-numbers
    }

    /**
        Return the center y-position of the element.
        @method getVerticalCenter
        @return {Number} The center x-position of the element.
    */
    getVerticalCenter() {

        /*
            Want halfway point between top-most y (topY) and bottom-most y (bottomY).
            That is, we want to go (bottomY - topY) / 2 beyond topY, which is:
            topY + ((bottomY - topY) / 2)
            (bottomY / 2) +(topY - (topY / 2))
            (bottomY / 2) + (topY / 2)
            (bottomY + topY) / 2
        */
        return (this.getBottom() + this.getTop()) / 2; // eslint-disable-line no-magic-numbers
    }

    /**
        Get the width of the element.
        @method getWidth
        @return {Number} The width of the element.
    */
    getWidth() {
        return this.getRight() - this.getLeft();
    }

    /**
        Get the height of the element.
        @method getHeight
        @return {Number} The height of the element.
    */
    getHeight() {
        return this.getBottom() - this.getTop();
    }
}
