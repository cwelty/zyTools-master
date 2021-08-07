'use strict';

/* exported StartNodeController */
/* global FlowchartFirstOrLastNodeController */

/**
    Render and control a start node.
    @class StartNodeController
    @extends FlowchartFirstOrLastNodeController
*/
class StartNodeController extends FlowchartFirstOrLastNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);
        this.nodeCode = 'Start';
    }
}
