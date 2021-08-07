'use strict';

/* exported SingleChildNode */
/* global FlowchartNode */

/**
    Abstract model for a node with a single child.
    @class SingleChildNode
    @extends FlowchartNode
*/
class SingleChildNode extends FlowchartNode {

    /**
        @constructor
        @param {AbstractSyntaxTree} expression The expression to execute.
        @param {Array} expressionTokens Array of {Token}. The tokens that build the expression.
        @param {TokensOfLine} line The line associated with this node.
    */
    constructor(expression, expressionTokens, line) {
        super(expression, expressionTokens, line);

        // Add the single child.
        this.children.push(null);
    }

    /**
        Set the child node.
        @method setChildNode
        @param {FlowchartNode} childNode The child to set for this node.
        @return {void}
    */
    setChildNode(childNode) {
        this.children[0] = childNode;
    }

    /**
        Return the child node.
        @method getChildNode
        @return {FlowchartNode} The child node.
    */
    getChildNode() {
        return this.children[0];
    }

    /**
        Perform node-specific execution, then return the child node.
        @method execute
        @param {Object} context The relevant flowchart properties for execution.
        @return {FlowchartNode} The next node to execute after this one.
    */
    execute(context) {
        this._nodeSpecificExecution(context);

        return this.getChildNode();
    }

    /**
        Perform node-specific execution. Inheriting models must override.
        @method _nodeSpecificExecution
        @param {Object} context The relevant flowchart properties for execution.
        @return {void}
    */
    _nodeSpecificExecution(context) { // eslint-disable-line no-unused-vars
        throw new Error('SingleChildNode\'s _nodeSpecificExecution function should be overridden');
    }
}
