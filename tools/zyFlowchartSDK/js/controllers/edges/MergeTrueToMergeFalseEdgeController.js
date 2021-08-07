'use strict';

/* exported MergeTrueToMergeFalseEdgeController */
/* global FlowchartEdgeController, moveLabelInFalseBranchIntoPosition, globalConstants */

/**
    Control an edge from a merge true to a merge false.
    @class MergeTrueToMergeFalseEdgeController
    @extends FlowchartEdgeController
*/
class MergeTrueToMergeFalseEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {IfNodeController} ifNodeController The controller of the node from which the edge starts.
        @param {PointerController} pointController The controller of the node from which the edge ends.
        @param {Number} verticalOffset The bottom of the node before the merge true to ensure the edge goes downward enough.
        @param {Number} pointY The y-axis location of the next point.
    */
    constructor(canvas, ifNodeController, pointController, verticalOffset, pointY) {
        super(canvas, 'false');

        /**
            The controller of the node from which the edge starts.
            @property ifNodeController
            @type {IfNodeController}
        */
        this.ifNodeController = ifNodeController;

        /**
            The controller of the node from which the edge ends.
            @property pointController
            @type {PointController}
        */
        this.pointController = pointController;

        /**
            The bottom of the node before the merge true to ensure the edge goes downward enough.
            @property verticalOffset
            @type {Number}
        */
        this.verticalOffset = verticalOffset;

        /**
            The y-axis location of the next point.
            @property pointY
            @type {Number}
        */
        this.pointY = pointY;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const startY = this.ifNodeController.getBottom();
        const startX = this.ifNodeController.getHorizontalCenter();
        const totalVerticalOffset = this.verticalOffset + (globalConstants.spaceBetweenRows / 2); // eslint-disable-line no-magic-numbers
        const belowPointByHalfSpaceBetweenRows = this.pointController.getBottom() + (globalConstants.spaceBetweenRows / 2); // eslint-disable-line no-magic-numbers
        const endY = Math.max(totalVerticalOffset, belowPointByHalfSpaceBetweenRows, this.pointY);
        const endX = this.pointController.getLeft();

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to.
        return this.canvas.path(`M ${startX}, ${startY} V ${endY} H ${endX}`);
    }

    /**
        Move the label into position.
        @method moveLabelIntoPosition
        @param {Object} label Reference to the label.
        @return {void}
    */
    moveLabelIntoPosition(label) {
        const horizontalOffset = 7;
        const verticalOffset = -6;

        moveLabelInFalseBranchIntoPosition(label, this.ifNodeController, horizontalOffset, verticalOffset);
    }
}
