'use strict';

/* exported InputNode */
/* global SingleChildNode, evaluateAbstractSyntaxTree */

/**
    Node that gets the next input and stores to a memory cell.
    @class InputNode
    @extends SingleChildNode
*/
class InputNode extends SingleChildNode {

    /**
        Store next input in the memory cell.
        @method _nodeSpecificExecution
        @param {Object} context The relevant flowchart properties for execution.
        @return {void}
    */
    _nodeSpecificExecution(context) {
        evaluateAbstractSyntaxTree(this.expression.root, context).setValueDuringExecution(context.input.getNextInput());
    }

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'InputNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @return {InputNode} A clone of this node.
    */
    _nodeSpecificClone(expression) {
        return new InputNode(expression, this.expressionTokens.slice(), this.line);
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

            portedCode = `cin >> ${expression};`;
        }

        this.portedLine.line = portedCode;
    }
}
