'use strict';

/* exported FirstChildOfIfElseFalseBranchEdgeController */
/* global FlowchartEdgeController, moveLabelInFalseBranchIntoPosition */

/**
    Controller for the false-branch edge from an if-else node to the first child of the false-branch.
    @class FirstChildOfIfElseFalseBranchEdgeController
    @extends FlowchartEdgeController
*/
class FirstChildOfIfElseFalseBranchEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {IfNodeController} ifNodeController The controller of the node from which the edge starts.
        @param {FlowchartNodeController} childNodeController The child of the if-else node.
    */
    constructor(canvas, ifNodeController, childNodeController) {
        super(canvas, 'false');

        /**
            The controller of the node from which the edge starts.
            @property startNodeController
            @type {IfNodeController}
        */
        this.ifNodeController = ifNodeController;

        /**
            The child of the if-else node.
            @property childNodeController
            @type {FlowchartNodeController}
        */
        this.childNodeController = childNodeController;
    }

    /**
        Make the edge.
        @method makeEdge
        @return {Object} Reference to a Raphael shape.
    */
    makeEdge() {
        const top = this.ifNodeController.getBottom();
        const xCoordinate = this.ifNodeController.getHorizontalCenter();
        const yCoordinate = this.childNodeController.getVerticalCenter();
        const left = this.childNodeController.getLeftAtVerticalCenter();

        // Notation meanings: (M)ove to. (V)ertical line to. (H)orizontal line to.
        return this.canvas.path(`M ${xCoordinate}, ${top} V ${yCoordinate} H ${left}`);
    }

    /**
        Move the label into position.
        @method moveLabelIntoPosition
        @param {Object} label Reference to the label.
        @return {void}
    */
    moveLabelIntoPosition(label) {
        moveLabelInFalseBranchIntoPosition(label, this.ifNodeController);
    }
}
