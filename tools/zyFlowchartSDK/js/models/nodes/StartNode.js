'use strict';

/* exported StartNode */
/* global SingleChildNode */

/**
    The first node in a flowchart.
    @class StartNode
    @extends SingleChildNode
*/
class StartNode extends SingleChildNode {

    /**
        Nothing to execute.
        @method _nodeSpecificExecution
        @return {void}
    */
    _nodeSpecificExecution() {} // eslint-disable-line no-empty-function

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'StartNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @return {StartNode} A clone of this node.
    */
    _nodeSpecificClone() {
        return new StartNode();
    }

    /**
        Make the node-specific |portedLine| for the given language.
        @method _nodeSpecificPortedLine
        @return {void}
    */
    _nodeSpecificPortedLine() {
        return;
    }
}
