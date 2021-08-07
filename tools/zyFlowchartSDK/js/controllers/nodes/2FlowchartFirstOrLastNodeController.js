'use strict';

/* exported FlowchartFirstOrLastNodeController */
/* global FlowchartNodeController */

/**
    Abstract controller for rendering and controlling a first or last node in a flowchart.
    @class FlowchartFirstOrLastNodeController
    @extends FlowchartNodeController
*/
class FlowchartFirstOrLastNodeController extends FlowchartNodeController {

    /**
        Return a reference to a Raphael shape.
        @method makeNodeShape
        @param {Number} textWidth The width of the text.
        @param {Number} textHeight The height of the text.
        @return {Object} Reference to a Raphael shape.
    */
    makeNodeShape(textWidth, textHeight) {
        const radius = textWidth;

        return this.canvas.rect(0, 0, textWidth, textHeight, radius);
    }
}
