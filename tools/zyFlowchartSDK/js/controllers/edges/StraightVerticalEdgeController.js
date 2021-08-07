'use strict';

/* exported StraightVerticalEdgeController */
/* global FlowchartEdgeController, moveLabelInFalseBranchIntoPosition */

/**
    Control a straight, vertical edge.
    @class StraightVerticalEdgeController
    @extends FlowchartEdgeController
*/
class StraightVerticalEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {FlowchartNodeController} startNodeController The controller of the node from which the edge starts.
        @param {FlowchartNodeController} endNodeController The controller of the node from which the edge ends.
        @param {String} [labelText=''] The label's text for the edge.
    */
    constructor(canvas, startNodeController, endNodeController, labelText = '') {
        super(canvas, labelText);

        /**
            The controller of the node from which the edge starts.
            @property startNodeController
            @type {FlowchartNodeController}
        */
        this.startNodeController = startNodeController;

        /**
            The controller of the node from which the edge ends.
            @property endNodeController
            @type {FlowchartNodeController}
        */
        this.endNodeController = endNodeController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const top = this.startNodeController.getBottom();
        const xCoordinate = this.startNodeController.getHorizontalCenter();
        const bottom = this.endNodeController.getTop();

        // Notation meanings: (M)ove to. (V)ertical line to.
        return this.canvas.path(`M ${xCoordinate}, ${top} V ${bottom}`);
    }

    /**
        Move the label into position.
        @method moveLabelIntoPosition
        @param {Object} label Reference to the label.
        @return {void}
    */
    moveLabelIntoPosition(label) {
        moveLabelInFalseBranchIntoPosition(label, this.startNodeController);
    }
}
