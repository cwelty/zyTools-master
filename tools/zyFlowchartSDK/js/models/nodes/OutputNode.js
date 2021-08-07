'use strict';

/* exported OutputNode */
/* global SingleChildNode, evaluateAbstractSyntaxTree */

/**
    Node that prints a memory cell's value or string to output.
    @class OutputNode
    @extends SingleChildNode
*/
class OutputNode extends SingleChildNode {

    /**
        @constructor
        @param {AbstractSyntaxTree} expression The expression to execute.
        @param {Array} expressionTokens Array of {TokensOfLine}. The tokens that build the expression.
        @param {TokensOfLine} line The line associated with this node.
        @param {AbstractSyntaxTree} precisionTree The expression to determine the number of decimal places of precision.
        @param {Array} precisionTokens Array of {TokensOfLine}. The tokens that build the precision expression.
    */
    constructor(expression, expressionTokens, line, precisionTree, precisionTokens) {
        super(expression, expressionTokens, line);

        /**
            Whether the thing to output is a string.
            @property isString
            @type {Boolean}
        */
        this.isString = expressionTokens[0].name === 'string';

        /**
            The string to output with unescaped characters.
            @property stringToOutput
            @type {String}
            @default null
        */
        this.stringToOutput = this.isString ? this.unescape(this.userExpression) : null;

        /**
            The expression to determine the number of decimal places of precision.
            @property precisionTree
            @type {AbstractSyntaxTree}
        */
        this.precisionTree = precisionTree;

        /**
            The tokens that build the precision expression.
            @property precisionTokens
            @type {Array} of {TokensOfLine}
        */
        this.precisionTokens = this.fillInSpaceTokens(precisionTokens, line && line.allTokens);

        /**
            The precision as a string, as written by the user.
            @property precisionExpression
            @type {String}
        */
        this.precisionExpression = this.convertTokensToString(this.precisionTokens);
    }

    /**
        Print the |thingToOutput| to output.
        @method _nodeSpecificExecution
        @param {Object} context The relevant flowchart properties for execution.
        @return {void}
    */
    _nodeSpecificExecution(context) {
        let string = this.isString ?
                     this.stringToOutput :
                     evaluateAbstractSyntaxTree(this.expression.root, context).toString();

        if (this.precisionTree) {
            const decimalPlaces = evaluateAbstractSyntaxTree(this.precisionTree.root, context).getValue();
            const minDecimalPlaces = 0;
            const maxDecimalPlaces = 16;

            if ((decimalPlaces < minDecimalPlaces) || (decimalPlaces > maxDecimalPlaces)) {
                throw Error(
                    `Invalid number of decimal places given: ${decimalPlaces}. Valid range: ${minDecimalPlaces}-${maxDecimalPlaces}.`
                );
            }

            string = Number.parseFloat(string).toFixed(decimalPlaces);
        }

        context.output.toPrint(string);
    }

    /**
        Return the name of this node.
        @method getName
        @return {String} The name of this node.
    */
    getName() {
        return 'OutputNode';
    }

    /**
        Return a clone of this node.
        @method _nodeSpecificClone
        @param {AbstractSyntaxTree} expression The already cloned expression.
        @param {Array} arrayOfVariables Array of {Variables}. List of variables used for looking up memory cells.
        @return {OutputNode} A clone of this node.
    */
    _nodeSpecificClone(expression, arrayOfVariables) {
        const clonedPrecisionTree = this.precisionTree ? this.precisionTree.clone(arrayOfVariables) : this.precisionTree;

        return new OutputNode(
            expression, this.expressionTokens.slice(), this.line, clonedPrecisionTree, this.precisionTokens.slice()
        );
    }

    /**
        Unescape the characters such as \n to newline, \t to tab, \" to ", and \\ to \.
        @method unescape
        @param {String} string The string to unescape.
        @return {String} The unescaped string.
    */
    unescape(string) {
        let previousCharacterWasBackslash = false;
        let newString = '';
        const stringWithoutQuotes = string.slice(1, -1);

        for (let index = 0; index < stringWithoutQuotes.length; index++) {
            const currentCharacter = stringWithoutQuotes[index];

            if (previousCharacterWasBackslash) {
                if (currentCharacter === 'n') {
                    newString += '\n';
                }
                else if (currentCharacter === 't') {
                    newString += '\t';
                }
                else if (currentCharacter === '"') {
                    newString += '"';
                }
                else if (currentCharacter === '\\') {
                    newString += '\\';
                }
                else {

                    // Do nothing. Just consume this character.
                }

                previousCharacterWasBackslash = false;
            }
            else if (currentCharacter === '\\') {
                previousCharacterWasBackslash = true;
            }
            else {
                newString += currentCharacter;
                previousCharacterWasBackslash = false;
            }
        }

        if (previousCharacterWasBackslash) {
            throw new Error('Unexpected extra backslash');
        }

        return newString;
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
            const prefix = 'cout << ';
            const expression = this.portExpression(language, this.expression, this.expressionTokens);

            portedCode = `${prefix}${expression};`;
            this.addToPortIndices(prefix.length);

            if (this.precisionTokens.length) {
                throw new Error('Specifying output\'s number of decimal places is not supported when porting to C++.');
            }
        }

        this.portedLine.line = portedCode;
    }
}
