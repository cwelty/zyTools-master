'use strict';

/* exported FlowchartNode */
/* global VariableSymbol, findNonBuiltInFunctionCalls, TokensOfLine, convertCommentLineToString */

/**
    Abstract model of a node in the flowchart.
    @class FlowchartNode
*/
class FlowchartNode {

    /**
        @constructor
        @param {AbstractSyntaxTree} [expression=null] The expression to execute.
        @param {Array} [expressionTokens=[]] Array of {Token}. The tokens that build the expression.
        @param {TokensOfLine} [line=null] The line associated with this node.
    */
    constructor(expression = null, expressionTokens = [], line = null) {

        /**
            The expression to execute.
            @property expression
            @type {AbstractSyntaxTree}
        */
        this.expression = expression;

        /**
            The original version of the expression.
            @property originalExpression
            @type {AbstractSyntaxTree}
        */
        this.originalExpression = expression && expression.shallowCopy();

        /**
            The tokens that build the expression.
            @property expressionTokens
            @type {Array} of {Token}
        */
        this.expressionTokens = expressionTokens && this.fillInSpaceTokens(expressionTokens, line && line.allTokens);

        /**
            The line associated with this node.
            @property line
            @type {TokensOfLine}
        */
        this.line = line;

        /**
            The expression as a string, as written by the user.
            @property userExpression
            @type {String}
        */
        this.userExpression = this.convertTokensToString(this.expressionTokens);

        /**
            The children of this node.
            @property children
            @type {FlowchartNode}
            @default []
        */
        this.children = [];

        /**
            The comment tokens of the nodes.
            @property commentLines
            @type {Array} of {TokensOfLine}
            @default []
        */
        this.commentLines = [];

        /**
            The non-builtin function calls in the tree.
            @property nonBuiltInFunctionCalls
            @type {Array} of {FunctionCallSymbol}
            @default []
        */
        this.nonBuiltInFunctionCalls = [];

        /**
            Whether the node is the next to be executed.
            @property isNextToExecute
            @type {Boolean}
            @default false
        */
        this.isNextToExecute = false;

        /**
            The line for a ported line of code. Ex: Ported to C++.
            @property portedLine
            @type {TokensOfLine}
            @default null
        */
        this.portedLine = null;

        /**
            The amount of indentation used by this node.
            @property indentationAmount
            @type {Integer}
            @default 0
        */
        this.indentationAmount = 0;

        if (expression) {
            findNonBuiltInFunctionCalls(this.expression.root, this.nonBuiltInFunctionCalls);
        }
    }

    /**
        Add the comments that are located just above this node.
        @method addCommentLines
        @param {Array} commentLines Array of {TokensOfLine}. The comments to add.
        @return {void}
    */
    addCommentLines(commentLines) {
        this.commentLines.push(...commentLines);
    }

    /**
        Return the comments as a single string.
        @method getCommentsAsString
        @return {String} The comments as a single string.
    */
    getCommentsAsString() {
        return this.commentLines.map(line => convertCommentLineToString(line)).join('\n');
    }

    /**
        Add the space tokens back to the subset. Space tokens were removed during parsing.
        @method fillInSpaceTokens
        @param {Array} subset Array of {Token}. The tokens that don't have spaces.
        @param {Array} allTokens Array of {Token}. All the tokens in that line.
        @return {Array} of {Token} The subset tokens with spaces added back.
    */
    fillInSpaceTokens(subset, allTokens) {
        let filledTokens = null;

        if (allTokens) {
            const startIndex = allTokens.indexOf(subset[0]);
            const endIndex = allTokens.indexOf(subset[subset.length - 1]);

            filledTokens = allTokens.slice(startIndex, endIndex + 1);
        }

        return filledTokens;
    }

    /**
        Convert the given tokens to a string.
        @method convertTokensToString
        @param {Array} tokens Array of {Token}. The tokens to convert to a string.
        @return {String} The string from the tokens.
    */
    convertTokensToString(tokens) {
        return tokens ? tokens.map(token => token.value).join('') : '';
    }

    /**
        Resolve a function call by assigning the return variable.
        @method resolveFunctionCall
        @param {Variable} returnVariable The return variable from a function call.
        @return {void}
    */
    resolveFunctionCall(returnVariable) {
        const symbol = this.nonBuiltInFunctionCalls.shift();

        this.resolveFunctionCallInTree(this.expression, symbol, returnVariable);
    }

    /**
        Resolve a function call by assigning the return variable and removing the function call from the tree.
        @method resolveFunctionCallInTree
        @param {AbstractSyntaxTree} tree The tree from which to resolve the function call.
        @param {FunctionCallSymbol} symbol The symbol to remove from the tree.
        @param {Variable} returnVariable The return variable from a function call.
        @return {void}
    */
    resolveFunctionCallInTree(tree, symbol, returnVariable) {

        // Replace the function call symbol with the returned value.
        if (returnVariable) {
            const variableSymbol = new VariableSymbol(returnVariable.clone());

            if (tree.root === symbol) {
                tree.root = variableSymbol;
            }
            else {
                this.replaceFunctionCallSymbolWithVariable(tree.root, symbol, variableSymbol);
            }
        }

        // The function returned nothing and is the top of the tree, so remove the function from the tree.
        else if (tree.root === symbol) {
            tree.root = null;
        }
        else {
            throw new Error('There is no return value, but a return value was expected.');
        }
    }

    /**
        Recursively find and replace the given symbol in the tree.
        @method replaceFunctionCallSymbolWithVariable
        @param {TreeSymbol} currentSymbol The currently traversed symbol.
        @param {FunctionCallSymbol} symbolToReplace The function call symbol to replace.
        @param {VariableSymbol} variable The variable symbol to replace the function call symbol with.
        @return {void}
    */
    replaceFunctionCallSymbolWithVariable(currentSymbol, symbolToReplace, variable) {
        currentSymbol.children.forEach((child, index) => {
            if (child === symbolToReplace) {
                currentSymbol.children[index] = variable;
            }
            else {
                this.replaceFunctionCallSymbolWithVariable(child, symbolToReplace, variable);
            }
        });
    }

    /**
        Execute the code in this node. Inheriting models must overwrite.
        @method execute
        @param {Object} context The relevant flowchart properties for execution.
        @return {FlowchartNode} The next node to execute after this one.
    */
    execute(context) { // eslint-disable-line no-unused-vars
        throw new Error('FlowchartNode\'s execute function should be overridden');
    }

    /**
        Return the name of this node. Inheriting objects must override.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        throw new Error('FlowchartNode\'s getName function should be overridden');
    }

    /**
        Return a clone of this node.
        @method clone
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up memory cells.
        @return {FlowchartNode} A clone of the node.
    */
    clone(arrayOfVariables) {
        const clonedExpression = this.expression ? this.expression.clone(arrayOfVariables) : this.expression;
        const clone = this._nodeSpecificClone(clonedExpression, arrayOfVariables);

        clone.addCommentLines(this.commentLines);
        clone.indentationAmount = this.indentationAmount;
        clone.portedLine = this.portedLine;

        return clone;
    }

    /**
        Return a clone of the specific node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up memory cells.
        @return {FlowchartNode} A clone of the specific node.
    */
    _nodeSpecificClone(expression, arrayOfVariables) { // eslint-disable-line no-unused-vars
        throw new Error('FlowchartNode\'s _nodeSpecificClone function should be overridden');
    }

    /**
        Reset the expression and re-build the non-built-in function calls.
        @method reset
        @return {void}
    */
    reset() {
        if (this.expression) {
            this.expression = this.originalExpression.shallowCopy();

            findNonBuiltInFunctionCalls(this.expression.root, this.nonBuiltInFunctionCalls);
        }
    }

    /**
        Make the |portedLine| for the given language.
        @method makePortedLine
        @param {String} language The language to port to.
        @return {void}
    */
    makePortedLine(language) {
        if (!this.portedLine) {
            this.portedLine = new TokensOfLine();
            this._nodeSpecificPortedLine(language);
        }
    }

    /**
        Make the node-specific |portedLine| for the given language.
        @method _nodeSpecificPortedLine
        @param {String} language The language to port to.
        @return {void}
    */
    _nodeSpecificPortedLine(language) { // eslint-disable-line no-unused-vars
        throw new Error('FlowchartNode\'s _nodeSpecificPortedLine function should be overridden');
    }

    /**
        Add the amount of indentation.
        @method addIndentationAmount
        @param {Integer} indentation The amount of indentation of this node.
        @return {void}
    */
    addIndentationAmount(indentation) {
        this.indentationAmount = indentation;
    }

    /**
        Add the given amount to the port highlight indices.
        @method addToPortIndices
        @param {Integer} amount The amount to increment.
        @param {Array} [functionCalls=null] Array of {FunctionCallSymbol}. List of function calls in the expression.
        @return {void}
    */
    addToPortIndices(amount, functionCalls = null) {
        const calls = functionCalls || this.nonBuiltInFunctionCalls;

        calls.forEach(call => call.addToPortIndices(amount));
    }

    /**
        Port the given token to the given after value. Port the function calls to match.
        @method portToken
        @param {Token} token The token to port.
        @param {Array} expressionTokens Array of {TokensOfLine} The tokens for the expression to port.
        @param {String} after The ported value of the token.
        @param {Array} calls Array of {FunctionCallSymbol}. List of function calls in the expression.
        @return {void}
    */
    portToken(token, expressionTokens, after, calls) {
        const before = token.value;
        const lengthReduction = before.length - after.length;
        const startIndex = expressionTokens.indexOf(token);
        const tokensToUpdate = expressionTokens.slice(startIndex);
        const callsFromFirst = calls.filter(call => tokensToUpdate.includes(call.firstToken));
        const callsFromLast = calls.filter(call => tokensToUpdate.includes(call.lastToken));

        // Adjust ported highlighting indices, if the indices are impacted by the porting.
        callsFromFirst.forEach(call => {
            call.portedStartIndexToHighlight -= lengthReduction;
        });
        callsFromLast.forEach(call => {
            call.portedEndIndexToHighlight -= lengthReduction;
        });
    }

    /**
        Port the given expression to the given language.
        @method portExpression
        @param {String} language The language to port the expression to.
        @param {AbstractSyntaxTree} expression The expression to port.
        @param {Array} expressionTokens Array of {TokensOfLine} The tokens for the expression to port.
        @param {Array} [functionCalls=null] Array of {FunctionCallSymbol}. List of function calls in the expression.
        @return {String} The ported expression.
    */
    portExpression(language, expression, expressionTokens, functionCalls = null) {
        const calls = functionCalls || this.nonBuiltInFunctionCalls;
        const startIndex = expressionTokens[0].startIndexInTheLine;
        let ported = '';

        // Start re-aligning the function highlighting indices.
        this.addToPortIndices(-startIndex, calls);

        if (language === 'C++') {
            ported = expressionTokens.map(token => {
                const value = token.value;
                let portedValue = value;

                const conditionMap = {
                    and: '&&',
                    not: '!',
                    or: '||',
                };
                const functionMap = {
                    SquareRoot: 'sqrt',
                    RaiseToPower: 'pow',
                    AbsoluteValue: 'fabs',
                };

                switch (token.name) {
                    case 'conditionalOperator':
                        if (value in conditionMap) {
                            portedValue = conditionMap[value];
                        }
                        break;

                    // Port Coral array syntax, [0], to C++ vector syntax, .at(0).
                    case 'openingBracket':
                        portedValue = '.at(';
                        break;
                    case 'closingBracket':
                        portedValue = ')';
                        break;

                    case 'word':
                        if (value in functionMap) {
                            portedValue = functionMap[value];
                        }
                        else if ((value === 'size') && expression.root.memoryCellHasToken(token, expressionTokens)) {
                            portedValue = 'size()';
                        }
                        break;
                    default:
                        break;
                }

                this.portToken(token, expressionTokens, portedValue, calls);

                return portedValue;
            }).join('');
        }

        return ported;
    }
}
