'use strict';

/* exported InputNodeController */
/* global InputOrOutputNodeController */

/**
    Controller for rendering and controlling an input node.
    @class InputNodeController
    @extends InputOrOutputNodeController
*/
class InputNodeController extends InputOrOutputNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);

        this.nodeCode = `${node.userExpression} = Get next input`;
    }
}
