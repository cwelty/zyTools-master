'use strict';

/* exported ProcessNodeController */
/* global FlowchartNodeController */

/**
    Controller for rendering and controlling a process node.
    @class ProcessNodeController
    @extends FlowchartNodeController
*/
class ProcessNodeController extends FlowchartNodeController {

    /**
        Return a reference to a Raphael shape.
        @method makeNodeShape
        @param {Number} textWidth The width of the text.
        @param {Number} textHeight The height of the text.
        @return {Object} Reference to a Raphael shape.
    */
    makeNodeShape(textWidth, textHeight) {
        return this.canvas.rect(0, 0, textWidth, textHeight);
    }
}
