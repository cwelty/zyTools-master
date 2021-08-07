'use strict';

/* exported AssignmentNode */
/* global ProcessNode, evaluateAbstractSyntaxTree, findNonBuiltInFunctionCalls, isGivenSymbolInAbstractSyntaxTree */

/**
    Node that executes an assignment operation.
    @class AssignmentNode
    @extends ProcessNode
*/
class AssignmentNode extends ProcessNode {

    /**
        @constructor
        @param {AbstractSyntaxTree} assignedTree An AST for where to assign the expression's result.
        @param {AbstractSyntaxTree} expression The expression to execute.
        @param {Array} assignedTokens Array of {Token}. The tokens that build the assigned tree.
        @param {Array} expressionTokens Array of {Token}. The tokens that build the expression.
        @param {TokensOfLine} line The line associated with this node.
    */
    constructor(assignedTree, expression, assignedTokens, expressionTokens, line) {
        super(expression, expressionTokens, line);

        /**
            An AST for where to assign the expression's result.
            @property assignedTree
            @type {AbstractSyntaxTree}
        */
        this.assignedTree = assignedTree;

        /**
            The original version of the assigned expression.
            @property originalAssignedTree
            @type {AbstractSyntaxTree}
        */
        this.originalAssignedTree = assignedTree && assignedTree.shallowCopy();

        /**
            The tokens that build the assigned tree.
            @property assignedTokens
            @type {Array} of {Token}
        */
        this.assignedTokens = this.fillInSpaceTokens(assignedTokens, line && line.allTokens);

        /**
            The user-written assigned part of the assignment statement.
            @property userAssignedExpression
            @type {String}
        */
        this.userAssignedExpression = this.convertTokensToString(this.assignedTokens);

        if (this.assignedTree) {
            findNonBuiltInFunctionCalls(this.assignedTree.root, this.nonBuiltInFunctionCalls);
        }
    }

    /**
        Resolve a function call by assigning the return variable.
        @method resolveFunctionCall
        @param {Variable} returnVariable The return variable from a function call.
        @return {void}
    */
    resolveFunctionCall(returnVariable) {
        const symbol = this.nonBuiltInFunctionCalls.shift();

        if (isGivenSymbolInAbstractSyntaxTree(symbol, this.assignedTree.root)) {
            this.resolveFunctionCallInTree(this.assignedTree, symbol, returnVariable);
        }
        else {
            this.resolveFunctionCallInTree(this.expression, symbol, returnVariable);
        }
    }

    /**
        Execute the expression.
        @method _nodeSpecificExecution
        @param {ExecutionContext} context The relevant flowchart properties for execution.
        @return {void}
    */
    _nodeSpecificExecution(context) {
        const expressionResult = evaluateAbstractSyntaxTree(this.expression.root, context);
        const assignedLocation = evaluateAbstractSyntaxTree(this.assignedTree.root, context);

        // If the value is an array, then copy each value.
        if ((assignedLocation.getClassName() !== 'MemoryCell') && assignedLocation.isArray()) {
            expressionResult.copyMemoryCellValuesTo(assignedLocation, true);
        }
        else {
            assignedLocation.setValueDuringExecution(expressionResult.getValue(context.arrayOfVariables));
        }
    }

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'AssignmentNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up memory cells.
        @return {AssignmentNode} A clone of this node.
    */
    _nodeSpecificClone(expression, arrayOfVariables) {
        const clonedAssignedTree = this.assignedTree.clone(arrayOfVariables);

        return new AssignmentNode(
            clonedAssignedTree, expression, this.assignedTokens.slice(), this.expressionTokens.slice(), this.line
        );
    }

    /**
        Reset the expression and re-build the non-built-in function calls.
        @method reset
        @return {void}
    */
    reset() {
        super.reset();

        if (this.assignedTree) {
            this.assignedTree = this.originalAssignedTree.shallowCopy();
            findNonBuiltInFunctionCalls(this.assignedTree.root, this.nonBuiltInFunctionCalls);
        }
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
            const assignedFunctions = this.nonBuiltInFunctionCalls.filter(call => this.assignedTree.has(call));
            const assigneeFunctions = this.nonBuiltInFunctionCalls.filter(call => this.expression.has(call));
            const assigned = this.portExpression(language, this.assignedTree, this.assignedTokens, assignedFunctions);
            const assignee = this.portExpression(language, this.expression, this.expressionTokens, assigneeFunctions);
            const preAssignee = `${assigned} = `;

            this.addToPortIndices(preAssignee.length, assigneeFunctions);

            portedCode = `${preAssignee}${assignee}`;
            if (!this.line.isFromForLoop) {
                portedCode += ';';
            }
        }

        this.portedLine.line = portedCode;
    }
}
