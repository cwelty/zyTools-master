'use strict';

/* exported DecisionNode */
/* global FlowchartNode, evaluateAbstractSyntaxTree, convertCommentLineToString */

/**
    Abstract model for a decision node with two children.
    @class DecisionNode
    @extends FlowchartNode
*/
class DecisionNode extends FlowchartNode {

    /**
        @constructor
        @param {AbstractSyntaxTree} expression The expression to execute.
        @param {Array} expressionTokens Array of {Token}. The tokens that build the expression.
        @param {TokensOfLine} line The line associated with this node.
    */
    constructor(expression, expressionTokens, line) {
        super(expression, expressionTokens, line);

        // Decision nodes have two children.
        this.children.push(null, null);

        /**
            The else branch's comment tokens.
            @property elseCommentLines
            @type {Array} of {TokensOfLine}
            @default []
        */
        this.elseCommentLines = [];
    }

    /**
        Add the comments that are located just above the else-statement associated with this node's if-statement.
        @method addElseCommentLines
        @param {Array} commentLines Array of {TokensOfLine}. The comments to add.
        @return {void}
    */
    addElseCommentLines(commentLines) {
        this.elseCommentLines.push(...commentLines);
    }

    /**
        Return the comments as a single string.
        @method getCommentsAsString
        @return {String} The comments as a single string.
    */
    getCommentsAsString() {
        const trueComments = this.commentLines.map(line => convertCommentLineToString(line));
        const falseComments = this.elseCommentLines.map(line => convertCommentLineToString(line));

        // Special case: True and false branch have comments. Label first comment of both branches.
        if (trueComments[0] && falseComments[0]) {
            trueComments[0] = trueComments[0].replace('//', '// True:');
            falseComments[0] = falseComments[0].replace('//', '// False:');
        }

        const allComments = trueComments.concat(falseComments);

        return allComments.join('\n');
    }

    /**
        Set the child node for true.
        @method setChildNodeForTrue
        @param {FlowchartNode} childNodeForTrue The child node to take if the expression evaluates to true.
        @return {void}
    */
    setChildNodeForTrue(childNodeForTrue) {
        this.children[0] = childNodeForTrue;
    }

    /**
        Get the child node for true.
        @method getChildNodeForTrue
        @return {FlowchartNode} The child node to take if the expression evaluates to true.
    */
    getChildNodeForTrue() {
        return this.children[0];
    }

    /**
        Set the child node for false.
        @method setChildNodeForFalse
        @param {FlowchartNode} childNodeForFalse The child node to take if the expression evaluates to false.
        @return {void}
    */
    setChildNodeForFalse(childNodeForFalse) {
        this.children[1] = childNodeForFalse;
    }

    /**
        Get the child node for false.
        @method getChildNodeForFalse
        @return {FlowchartNode} The child node to take if the expression evaluates to false.
    */
    getChildNodeForFalse() {
        return this.children[1];
    }

    /**
        Perform node-specific execution, then return the child node.
        @method execute
        @param {ExecutionContext} context The relevant flowchart properties for execution.
        @return {FlowchartNode} The next node to execute after this one.
    */
    execute(context) {
        const expressionResult = evaluateAbstractSyntaxTree(this.expression.root, context);

        return expressionResult.getValue() ? this.getChildNodeForTrue() : this.getChildNodeForFalse();
    }
}
