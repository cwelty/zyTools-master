'use strict';

/* exported CountAndNode */

/**
    Store a node and a counter.
    @class CountAndNode
*/
class CountAndNode {

    /**
        @constructor
        @param {FlowchartNode} node The node to count.
    */
    constructor(node) {

        /**
            The node to count.
            @property node
            @type {FlowchartNode}
        */
        this.node = node;

        /**
            The count of the node.
            @property count
            @type {Integer}
            @default 1
        */
        this.count = 1;
    }

    /**
        Return a clone of this instance.
        @method clone
        @return {CountAndNode} A clone of this instance.
    */
    clone() {
        const clone = new CountAndNode(this.node);

        clone.count = this.count;
        return clone;
    }
}
