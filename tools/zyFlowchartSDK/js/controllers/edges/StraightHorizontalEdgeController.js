'use strict';

/* exported StraightHorizontalEdgeController */
/* global FlowchartEdgeController, moveLabelInTrueBranchIntoPosition */

/**
    Control a straight, horizontal edge.
    @class StraightHorizontalEdgeController
    @extends FlowchartEdgeController
*/
class StraightHorizontalEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {FlowchartNodeController} nodeController The controller of the node from which the edge starts.
        @param {FlowchartElementController} flowchartElementController The controller of the element from which the edge ends.
        @param {String} [labelText=''] The label's text for the edge.
    */
    constructor(canvas, nodeController, flowchartElementController, labelText = '') {
        super(canvas, labelText);

        /**
            The controller of the node from which the edge starts.
            @property nodeController
            @type {FlowchartNodeController}
        */
        this.nodeController = nodeController;

        /**
            The controller of the element from which the edge ends.
            @property flowchartElementController
            @type {FlowchartElementController}
        */
        this.flowchartElementController = flowchartElementController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const xCoordinate = this.nodeController.getRightAtVerticalCenter();
        const yCoordinate = this.nodeController.getVerticalCenter();
        const elementX = this.flowchartElementController.getLeftAtVerticalCenter();

        // Notation meanings: (M)ove to. (H)orizontal line to.
        return this.canvas.path(`M ${xCoordinate}, ${yCoordinate} H ${elementX}`);
    }

    /**
        Move the label into position.
        @method moveLabelIntoPosition
        @param {Object} label Reference to the label.
        @return {void}
    */
    moveLabelIntoPosition(label) {
        const verticalOffset = 9;

        moveLabelInTrueBranchIntoPosition(label, this.nodeController, verticalOffset);
    }
}
