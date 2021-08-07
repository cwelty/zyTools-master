'use strict';

/* exported DistanceAndNode */

/**
    Store a node and a distance.
    @class DistanceAndNode
*/
class DistanceAndNode {

    /**
        @constructor
        @param {FlowchartNode} node The node to distance.
    */
    constructor(node) {

        /**
            The node to distance.
            @property node
            @type {FlowchartNode}
        */
        this.node = node;

        /**
            The distance of the node.
            @property distance
            @type {Integer}
            @default 0
        */
        this.distance = 0;
    }
}
