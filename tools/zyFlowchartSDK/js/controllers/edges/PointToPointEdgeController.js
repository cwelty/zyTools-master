'use strict';

/* exported PointToPointEdgeController */
/* global FlowchartEdgeController */

/**
    Control an edge that goes from a point to another.
    @class PointToPointEdgeController
    @extends FlowchartEdgeController
*/
class PointToPointEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {PointController} startPointerController The controller of the pointer from which the edge starts.
        @param {PointController} endPointerController The controller of the pointer from which the edge ends.
    */
    constructor(canvas, startPointerController, endPointerController) {
        super(canvas);

        /**
            The controller of the pointer from which the edge starts.
            @property startPointerController
            @type {PointController}
        */
        this.startPointerController = startPointerController;

        /**
            The controller of the pointer from which the edge ends.
            @property endPointerController
            @type {PointController}
        */
        this.endPointerController = endPointerController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const startX = this.startPointerController.getHorizontalCenter();
        const startY = this.startPointerController.getBottom();
        const endX = this.endPointerController.getLeft();
        const endY = this.endPointerController.getVerticalCenter();

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to.
        return this.canvas.path(`M ${startX}, ${startY} V ${endY} H ${endX}`);
    }
}
