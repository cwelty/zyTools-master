'use strict';

/* exported OutputNodeController */
/* global InputOrOutputNodeController */

/**
    Controller for rendering and controlling an output node.
    @class OutputNodeController
    @extends InputOrOutputNodeController
*/
class OutputNodeController extends InputOrOutputNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);

        this.nodeCode = `Put ${node.userExpression} to output`;

        if (node.precisionExpression) {
            this.nodeCode += ` with ${node.precisionExpression} decimal places`;
        }
    }
}
