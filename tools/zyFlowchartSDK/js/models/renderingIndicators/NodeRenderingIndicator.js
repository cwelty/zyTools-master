'use strict';

/* exported NodeRenderingIndicator */
/* global RenderingIndicator */

/**
    Model of node rendering information, including the node, and which column and row the node should be rendered in.
    @class NodeRenderingIndicator
    @extends RenderingIndicator
*/
class NodeRenderingIndicator extends RenderingIndicator {

    /**
        @constructor
        @param {Integer} row The node's row during rendering.
        @param {Integer} column The node's column during rendering.
        @param {FlowchartNode} node The node to render.
    */
    constructor(row, column, node) {
        super();

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

        /**
            The node to render.
            @property node
            @type {FlowchartNode}
        */
        this.node = node;
    }

    /**
        Return the name of this indicator.
        @method getName
        @return {String} The name of this indicator.
    */
    getName() {
        return 'NodeRenderingIndicator';
    }

    /**
        Return the column of this indicator.
        @method getColumn
        @return {Integer} The column of this indicator.
    */
    getColumn() {
        return this.column;
    }
}
