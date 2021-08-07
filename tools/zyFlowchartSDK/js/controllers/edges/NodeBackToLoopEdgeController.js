'use strict';

/* exported NodeBackToLoopEdgeController */
/* global FlowchartEdgeController, moveLabelInFalseBranchIntoPosition, globalConstants */

/**
    Control the edge from a node inside a loop back to the loop node.
    @class NodeBackToLoopEdgeController
    @extends FlowchartEdgeController
*/
class NodeBackToLoopEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {FlowchartNodeController} startNodeController The controller of the node from which the edge starts.
        @param {FlowchartNodeController} loopNodeController The controller of the node from which the edge ends, which is a loop node.
        @param {String} [labelText=''] The label's text for the edge.
    */
    constructor(canvas, startNodeController, loopNodeController, labelText = '') {
        super(canvas, labelText);

        /**
            The controller of the node from which the edge starts.
            @property startNodeController
            @type {FlowchartNodeController}
        */
        this.startNodeController = startNodeController;

        /**
            The controller of the node from which the edge ends, which is a loop node.
            @property loopNodeController
            @type {FlowchartNodeController}
        */
        this.loopNodeController = loopNodeController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const bottomOfNode = this.startNodeController.getBottom();
        const horizontalCenterOfNode = this.startNodeController.getHorizontalCenter();
        const startPosition = `${horizontalCenterOfNode}, ${bottomOfNode}`;
        const downwardEdgeLength = globalConstants.spaceBetweenRows / 2; // eslint-disable-line no-magic-numbers
        const loopNodeRight = this.loopNodeController.getRight() + (globalConstants.spaceBetweenColumns / 2); // eslint-disable-line no-magic-numbers
        const bottomOfText = this.loopNodeController.getVerticalHalfwayBetweenRightAndBottomCorners();
        const rightOfText = this.loopNodeController.getHorizontalHalfwayBetweenRightAndBottomCorners();
        const endPosition = `${rightOfText}, ${bottomOfText}`;

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to. (L)ine to.
        return this.canvas.path(`M ${startPosition} V ${bottomOfNode + downwardEdgeLength} H ${loopNodeRight} L ${endPosition}`);
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
