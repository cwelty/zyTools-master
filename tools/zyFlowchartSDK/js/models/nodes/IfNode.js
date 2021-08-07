'use strict';

/* exported IfNode */
/* global DecisionNode */

/**
    An if-else decision node.
    @class IfNode
    @extends DecisionNode
*/
class IfNode extends DecisionNode {

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'IfNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @return {IfNode} A clone of this node.
    */
    _nodeSpecificClone(expression) {
        const clone = new IfNode(expression, this.expressionTokens.slice(), this.line);

        clone.addElseCommentLines(this.elseCommentLines);

        return clone;
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
            const prefix = 'if (';

            portedCode = `${prefix}${expression}) {`;
            this.addToPortIndices(prefix.length);
        }

        this.portedLine.line = portedCode;
    }
}
