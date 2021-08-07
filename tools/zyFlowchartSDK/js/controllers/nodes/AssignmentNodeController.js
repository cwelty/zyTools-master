'use strict';

/* exported AssignmentNodeController */
/* global ProcessNodeController */

/**
    Controller for rendering and controlling an assignment node.
    @class AssignmentNodeController
    @extends ProcessNodeController
*/
class AssignmentNodeController extends ProcessNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);
        this.nodeCode = `${node.userAssignedExpression} = ${node.userExpression}`;
    }
}
