'use strict';

/* exported PointToNodeEdgeController */
/* global FlowchartEdgeController, globalConstants */

/**
    Control the edge from a point to a node.
    @class PointToNodeEdgeController
    @extends FlowchartEdgeController
*/
class PointToNodeEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {PointController} pointController The controller of the point from which the edge starts.
        @param {FlowchartNodeController} nodeController The controller of the node from which the edge ends.
    */
    constructor(canvas, pointController, nodeController) {
        super(canvas);

        /**
            The controller of the point from which the edge starts.
            @property pointController
            @type {PointController}
        */
        this.pointController = pointController;

        /**
            The controller of the node from which the edge ends.
            @property nodeController
            @type {FlowchartNodeController}
        */
        this.nodeController = nodeController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const startX = this.pointController.getHorizontalCenter();
        const startY = this.pointController.getBottom();
        const endX = this.nodeController.getHorizontalCenter();
        const endY = this.nodeController.getTop();

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to.
        return this.canvas.path(`M ${startX}, ${startY} V ${endY - globalConstants.spaceBetweenRows} H ${endX} V ${endY}`);
    }
}
