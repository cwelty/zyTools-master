'use strict';

/* exported FunctionCallNode */
/* global ProcessNode, evaluateAbstractSyntaxTree */

/**
    Node that executes one function call, which has no return value.
    @class FunctionCallNode
    @extends ProcessNode
*/
class FunctionCallNode extends ProcessNode {

    /**
        Execute the expression.
        @method _nodeSpecificExecution
        @param {ExecutionContext} context The relevant flowchart properties for execution.
        @return {void}
    */
    _nodeSpecificExecution(context) {
        if (this.expression.root) {
            evaluateAbstractSyntaxTree(this.expression.root, context);
        }
    }

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'FunctionCallNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @return {FunctionCallNode} A clone of this node.
    */
    _nodeSpecificClone(expression) {
        return new FunctionCallNode(expression, this.expressionTokens.slice(), this.line);
    }

    /**
        Make the node-specific |portedLine| for the given language.
        @method _nodeSpecificPortedLine
        @param {String} language The language to port to.
        @return {void}
    */
    _nodeSpecificPortedLine(language) {
        let portedCode = '';

        if (language === 'C++') {
            const expression = this.portExpression(language, this.expression, this.expressionTokens);

            portedCode = `${expression};`;
        }

        this.portedLine.line = portedCode;
    }
}
