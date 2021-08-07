'use strict';

/* exported ElseIfNode */
/* global DecisionNode */

/**
    An elseif decision node.
    @class ElseIfNode
    @extends DecisionNode
*/
class ElseIfNode extends DecisionNode {

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'ElseIfNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @return {ElseIfNode} A clone of this node.
    */
    _nodeSpecificClone(expression) {
        return new ElseIfNode(expression, this.expressionTokens.slice(), this.line);
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
            const prefix = 'else if (';

            portedCode = `${prefix}${expression}) {`;
            this.addToPortIndices(prefix.length);
        }

        this.portedLine.line = portedCode;
    }
}
