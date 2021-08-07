'use strict';

/* exported EndNode */
/* global FlowchartNode */

/**
    The last node in a flowchart. Used to indicate a program is at the end.
    @class EndNode
    @extends FlowchartNode
*/
class EndNode extends FlowchartNode {

    /**
        EndNode does nothing then returns null.
        @method execute
        @param {Object} context The relevant flowchart properties for execution.
        @return {FlowchartNode} Null reference.
    */
    execute(context) { // eslint-disable-line no-unused-vars
        return null;
    }

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'EndNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @return {EndNode} A clone of this node.
    */
    _nodeSpecificClone() {
        return new EndNode(null, null, this.line);
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
