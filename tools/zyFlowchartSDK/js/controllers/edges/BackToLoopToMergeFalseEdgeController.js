'use strict';

/* exported BackToLoopToMergeFalseEdgeController */
/* global FlowchartEdgeController, moveLabelInFalseBranchIntoPosition, globalConstants */

/**
    Control an edge that goes from a BackToLoop to a MergeFalse.
    @class BackToLoopToMergeFalseEdgeController
    @extends FlowchartEdgeController
*/
class BackToLoopToMergeFalseEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {LoopNodeController} loopNodeController The controller of the loop node from which the edge starts.
        @param {PointController} pointController The controller of the point from which the edge ends.
        @param {Number} largestBottomYOfPreviousEdges The largest bottom of previous edges.
        @param {Number} pointY The y-axis location of the next point.
    */
    constructor(canvas, loopNodeController, pointController, largestBottomYOfPreviousEdges, pointY) {
        super(canvas, 'false');

        /**
            The controller of the loop node from which the edge starts.
            @property loopNodeController
            @type {LoopNodeController}
        */
        this.loopNodeController = loopNodeController;

        /**
            The controller of the pointer from which the edge ends.
            @property pointController
            @type {PointController}
        */
        this.pointController = pointController;

        /**
            The largest bottom of previous edges.
            @property largestBottomYOfPreviousEdges
            @type {Number}
        */
        this.largestBottomYOfPreviousEdges = largestBottomYOfPreviousEdges;

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
        const startX = this.loopNodeController.getHorizontalCenter();
        const startY = this.loopNodeController.getBottom();
        const endX = this.pointController.getLeft();
        const bottomOffset = globalConstants.spaceBetweenRows / 2; // eslint-disable-line no-magic-numbers
        let endY = Math.max(startY, this.largestBottomYOfPreviousEdges) + bottomOffset;

        if (this.pointY) {
            endY = this.pointY;
        }

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
        const horizontalOffset = 5;
        const verticalOffset = -4;

        moveLabelInFalseBranchIntoPosition(label, this.loopNodeController, horizontalOffset, verticalOffset);
    }
}
