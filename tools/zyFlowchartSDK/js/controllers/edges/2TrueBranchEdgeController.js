'use strict';

/* exported TrueBranchEdgeController */
/* global FlowchartEdgeController, moveLabelInTrueBranchIntoPosition */

/**
    Abstract controller for the true-branch edge from a decision node.
    @class TrueBranchEdgeController
    @extends FlowchartEdgeController
*/
class TrueBranchEdgeController extends FlowchartEdgeController {

    /**
        @constructor
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
        @param {FlowchartNodeController} loopNodeController The controller of the node from which the edge starts and ends.
    */
    constructor(canvas, loopNodeController) {
        super(canvas, 'true');

        /**
            The controller of the node from which the edge starts and ends.
            @property startNodeController
            @type {FlowchartNodeController}
        */
        this.loopNodeController = loopNodeController;
    }

    /**
        Move the label into position.
        @method moveLabelIntoPosition
        @param {Object} label Reference to the label.
        @return {void}
    */
    moveLabelIntoPosition(label) {
        moveLabelInTrueBranchIntoPosition(label, this.loopNodeController);
    }
}
