'use strict';

/* exported MergeTrueRenderingIndicator */
/* global MergeRenderingIndicator */

/**
    Model of indicator to render an edge from the last node of an if-else node's true branch.
    @class MergeTrueRenderingIndicator
    @extends MergeRenderingIndicator
*/
class MergeTrueRenderingIndicator extends MergeRenderingIndicator {

    /**
        @constructor
        @param {Integer} row The node's row during rendering.
        @param {Integer} column The node's column during rendering.
        @param {FlowchartNode} ifElseIfNode The if-else node that was merged.
    */
    constructor(row, column, ifElseIfNode) {
        super(ifElseIfNode);

        /**
            The node's row during rendering.
            @property row
            @type {Integer}
        */
        this.row = row;

        /**
            The node's column during rendering.
            @property column
            @type {Integer}
        */
        this.column = column;
    }

    /**
        Return the name of this indicator.
        @method getName
        @return {String} The name of this indicator.
    */
    getName() {
        return 'MergeTrueRenderingIndicator';
    }
}
