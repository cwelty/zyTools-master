'use strict';

/* exported MergeNodePair */

/**
    Store an if-else node and the associated merge node.
    @class MergeNodePair
*/
class MergeNodePair {

    /**
        @constructor
        @param {DecisionNode} ifElseIfNode The if or elseif node.
        @param {FlowchartNode} mergeNode The associated merge node.
    */
    constructor(ifElseIfNode, mergeNode) {

        /**
            The if or elseif node.
            @property ifElseIfNode
            @type {DecisionNode}
        */
        this.ifElseIfNode = ifElseIfNode;

        /**
            The associated merge node.
            @property mergeNode
            @type {FlowchartNode}
        */
        this.mergeNode = mergeNode;
    }
}
