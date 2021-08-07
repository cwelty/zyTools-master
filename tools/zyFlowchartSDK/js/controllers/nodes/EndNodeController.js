'use strict';

/* exported EndNodeController */
/* global FlowchartFirstOrLastNodeController */

/**
    Render and control an end node.
    @class EndNodeController
    @extends FlowchartFirstOrLastNodeController
*/
class EndNodeController extends FlowchartFirstOrLastNodeController {

    /**
        @constructor
        @param {FlowchartNode} node The node to control.
        @param {Object} canvas Reference to the Raphael.js instance used to draw the flowchart.
    */
    constructor(node, canvas) {
        super(node, canvas);
        this.nodeCode = 'End';
    }
}
