'use strict';

/* exported BackToLoopRenderingIndicator */
/* global RenderingIndicator */

/**
    Model of indicator to render an edge going back to a loop.
    @class BackToLoopRenderingIndicator
    @extends RenderingIndicator
*/
class BackToLoopRenderingIndicator extends RenderingIndicator {

    /**
        @constructor
        @param {FlowchartNode} loopNode The loop node to go back to.
        @param {FlowchartNode} nodeBeforeLoopNode The node before the loop node to go back to.
    */
    constructor(loopNode, nodeBeforeLoopNode) {
        super();

        /**
            The loop node to go back to.
            @property loopNode
            @type {FlowchartNode}
        */
        this.loopNode = loopNode;

        /**
            The node before the loop node to go back to.
            @property nodeBeforeLoopNode
            @type {FlowchartNode}
        */
        this.nodeBeforeLoopNode = nodeBeforeLoopNode;
    }

    /**
        Return the name of this indicator.
        @method getName
        @return {String} The name of this indicator.
    */
    getName() {
        return 'BackToLoopRenderingIndicator';
    }

    /**
        Return the column of this indicator.
        @method getColumn
        @param {Array} indicators Array of {RenderingIndicator}. The list of indicators that this indicator is in.
        @return {Integer} The column of this indicator.
    */
    getColumn(indicators) {
        return indicators.filter(indicator => indicator.getName() === 'NodeRenderingIndicator')
                         .find(indicator => indicator.node === this.loopNode)
                         .column;
    }
}
