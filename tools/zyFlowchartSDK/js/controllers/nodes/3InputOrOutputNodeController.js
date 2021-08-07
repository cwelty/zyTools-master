'use strict';

/* exported InputOrOutputNodeController */
/* global FlowchartNodeController */

/**
    Abstract controller for rendering and controlling an input or output node.
    @class InputOrOutputNodeController
    @extends FlowchartNodeController
*/
class InputOrOutputNodeController extends FlowchartNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);

        /**
            The width of the parallelogram's angle.
            @property parallelogramAngleWidth
            @type {Number}
            @default null
        */
        this.parallelogramAngleWidth = null;
    }

    /**
        Return a reference to a Raphael shape.
        @method makeNodeShape
        @param {Number} textWidth The width of the text.
        @param {Number} textHeight The height of the text.
        @return {Object} Reference to a Raphael shape.
    */
    makeNodeShape(textWidth, textHeight) {
        const parallelogramAngleRadians = 1.2;

        this.parallelogramAngleWidth = textHeight / Math.tan(parallelogramAngleRadians);

        const bottomLeft = `0, ${textHeight}`;
        const topLeft = `${this.parallelogramAngleWidth}, 0`;
        const topRight = `${(2 * this.parallelogramAngleWidth) + textWidth}, 0`; // eslint-disable-line no-magic-numbers
        const bottomRight = `${this.parallelogramAngleWidth + textWidth}, ${textHeight}`;

        // Notation meanings: (M)ove to. (L)ine to. Z means close path.
        return this.canvas.path(`M ${bottomLeft} L ${topLeft} L ${topRight} L ${bottomRight} Z`);
    }

    /**
        Return the x-position of the left of the element at vertical-center.
        @method getLeftAtVerticalCenter
        @return {Number} The x-position of the left of the element at vertical-center.
    */
    getLeftAtVerticalCenter() {
        return this.getLeft() + (this.parallelogramAngleWidth / 2); // eslint-disable-line no-magic-numbers
    }

    /**
        Return the x-position of the right of the element at vertical-center.
        @method getRightAtVerticalCenter
        @return {Number} The x-position of the right of the element at vertical-center.
    */
    getRightAtVerticalCenter() {
        return this.getRight() - (this.parallelogramAngleWidth / 2); // eslint-disable-line no-magic-numbers
    }
}
