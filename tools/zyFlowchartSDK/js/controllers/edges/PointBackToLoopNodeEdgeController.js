'use strict';

/* exported PointBackToLoopNodeEdgeController */
/* global FlowchartEdgeController, globalConstants */

/**
    Control an edge that goes from a MergeFalse to BackToLoop.
    @class PointBackToLoopNodeEdgeController
    @extends FlowchartEdgeController
*/
class PointBackToLoopNodeEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {PointController} pointController The controller of the point from which the edge starts.
        @param {LoopNodeController} loopNodeController The controller of the loop node from which the edge ends.
        @param {NodeController} nodeBeforeLoopController The last node in the loop, so this edge goes downward enough.
        @param {EdgeController} previousEdgeController The edge controller before this edge controller.
    */
    constructor(canvas, pointController, loopNodeController, nodeBeforeLoopController, previousEdgeController) {
        super(canvas);

        /**
            The controller of the pointer from which the edge starts.
            @property pointController
            @type {PointController}
        */
        this.pointController = pointController;

        /**
            The controller of the loop node from which the edge ends.
            @property loopNodeController
            @type {LoopNodeController}
        */
        this.loopNodeController = loopNodeController;

        /**
            The last node in the loop, so this edge goes downward enough.
            @property nodeBeforeLoopController
            @type {NodeController}
        */
        this.nodeBeforeLoopController = nodeBeforeLoopController;

        /**
            The edge controller before this edge controller.
            @property previousEdgeController
            @type {EdgeController}
        */
        this.previousEdgeController = previousEdgeController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const startX = this.pointController.getHorizontalCenter();
        const startY = this.pointController.getBottom();
        const largestY = Math.max(this.nodeBeforeLoopController.getBottom(), this.previousEdgeController.getBottom());
        const largestYWithOffset = largestY + (3 * globalConstants.spaceBetweenRows / 4); // eslint-disable-line no-magic-numbers
        const loopRight = this.loopNodeController.getRight() + (globalConstants.spaceBetweenColumns / 2); // eslint-disable-line no-magic-numbers
        const endX = this.loopNodeController.getHorizontalHalfwayBetweenRightAndBottomCorners();
        const endY = this.loopNodeController.getVerticalHalfwayBetweenRightAndBottomCorners();

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to. (L)ine to.
        return this.canvas.path(`M ${startX}, ${startY} V ${largestYWithOffset} H ${loopRight} L ${endX}, ${endY}`);
    }
}
