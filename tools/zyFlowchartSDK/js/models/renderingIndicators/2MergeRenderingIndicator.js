'use strict';

/* exported MergeRenderingIndicator */
/* global RenderingIndicator */

/**
    Abstract model of indicator to render an edge from the last node of an if-else node's branch.
    @class MergeRenderingIndicator
    @extends RenderingIndicator
*/
class MergeRenderingIndicator extends RenderingIndicator {

    /**
        @constructor
        @param {DecisionNode} ifElseIfNode The if or elseif node that was merged.
    */
    constructor(ifElseIfNode) {
        super();

        /**
            The if or elseif node that was merged.
            @property ifElseIfNode
            @type {DecisionNode}
        */
        this.ifElseIfNode = ifElseIfNode;
    }

    /**
        Return the column of this indicator.
        @method getColumn
        @param {Array} indicators Array of {RenderingIndicator}. The list of indicators that this indicator is in.
        @return {Integer} The column of this indicator.
    */
    getColumn(indicators) {
        return indicators.find(indicator => indicator.node === this.ifElseIfNode).column;
    }
}
