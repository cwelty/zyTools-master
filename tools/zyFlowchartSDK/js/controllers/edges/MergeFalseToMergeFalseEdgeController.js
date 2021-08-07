'use strict';

/* exported MergeFalseToMergeFalseEdgeController */
/* global FlowchartEdgeController */

/**
    Control an edge that goes from one MergeFalse to another.
    @class MergeFalseToMergeFalseEdgeController
    @extends FlowchartEdgeController
*/
class MergeFalseToMergeFalseEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {PointController} startPointerController The controller of the pointer from which the edge starts.
        @param {PointController} endPointerController The controller of the pointer from which the edge ends.
        @param {Number} endYOfPreviousEdge The end of the previous edge's y-position.
    */
    constructor(canvas, startPointerController, endPointerController, endYOfPreviousEdge) {
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

        /**
            The end of the previous edge's y-position.
            @property endYOfPreviousEdge
            @type {Number}
        */
        this.endYOfPreviousEdge = endYOfPreviousEdge;
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
        const endY = this.endYOfPreviousEdge;

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to.
        return this.canvas.path(`M ${startX}, ${startY} V ${endY} H ${endX}`);
    }
}
