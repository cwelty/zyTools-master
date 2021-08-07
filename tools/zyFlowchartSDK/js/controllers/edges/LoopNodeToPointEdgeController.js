'use strict';

/* exported LoopNodeToPointEdgeController */
/* global FlowchartEdgeController, moveLabelInFalseBranchIntoPosition */

/**
    Control an edge from a loop node to a point.
    @class LoopNodeToPointEdgeController
    @extends FlowchartEdgeController
*/
class LoopNodeToPointEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {LoopNodeController} loopNodeController The controller of the loop node from which the edge starts.
        @param {PointController} pointNodeController The controller of the point from which the edge ends.
    */
    constructor(canvas, loopNodeController, pointNodeController) {
        super(canvas, 'false');

        /**
            The controller of the loop node from which the edge starts.
            @property loopNodeController
            @type {LoopNodeController}
        */
        this.loopNodeController = loopNodeController;

        /**
            The controller of the point from which the edge ends.
            @property pointNodeController
            @type {PointController}
        */
        this.pointNodeController = pointNodeController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const startX = this.loopNodeController.getHorizontalCenter();
        const startY = this.loopNodeController.getBottom();
        const endX = this.pointNodeController.getLeftAtVerticalCenter();
        const endY = this.pointNodeController.getVerticalCenter();

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
        moveLabelInFalseBranchIntoPosition(label, this.loopNodeController);
    }
}
