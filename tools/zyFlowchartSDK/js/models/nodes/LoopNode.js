'use strict';

/* exported LoopNode */
/* global DecisionNode */

/**
    A loop decision node.
    @class LoopNode
    @extends DecisionNode
*/
class LoopNode extends DecisionNode {

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'LoopNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @return {LoopNode} A clone of this node.
    */
    _nodeSpecificClone(expression) {
        return new LoopNode(expression, this.expressionTokens.slice(), this.line);
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
            portedCode = this.portExpression(language, this.expression, this.expressionTokens);

            if (!this.line.isFromForLoop) {
                const prefix = 'while (';

                portedCode = `${prefix}${portedCode}) {`;
                this.addToPortIndices(prefix.length);
            }
        }

        this.portedLine.line = portedCode;
    }
}
