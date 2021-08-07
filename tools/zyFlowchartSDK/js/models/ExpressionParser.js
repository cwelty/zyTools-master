'use strict';

/* exported ExpressionParser, parserGeneratedVariableName */
/* global AbstractSyntaxTree, Tokenizer, isValidIdentifier, isReservedWord, reservedWordsErrorMessages, VariableSymbol,
          IntegerVariable, FloatVariable, BinaryOperatorSymbol, conditionalOperatorExpression, FunctionCallSymbol,
          UnaryOperatorSymbol, SubscriptOperatorSymbol, MemoryCellSymbol, BooleanVariable, ExpressionParserResult,
          ExpressionParserError, makeSuggestionForInvalidWordFromSimilarWords */

const parserGeneratedVariableName = 'parserGeneratedVariable';

/**
    A parser for converting an expression into an abstract syntax tree.
    @class ExpressionParser
*/
class ExpressionParser {

    /**
        Convert an expression into an abstract syntax tree.
        @method parse
        @param {String} expression Or {Array} of {Tokens}. The expression to parse.
        @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
        @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
        @return {ExpressionParserResult} The result of parsing an expression.
    */
    parse(expression, arrayOfVariables, functions) {
        let tokens = expression;

        // Tokenize the string.
        if (typeof expression === 'string') {
            const tokenizer = new Tokenizer();
            const lines = tokenizer.tokenize(expression);

            // Combine the lines into 1 large list of tokens.
            tokens = lines.map(line => line.tokens)
                          .reduce((first, second) => first.concat(second), []);
        }

        // Remove all spaces.
        tokens = tokens.filter(token => [ 'indent', 'spaces' ].indexOf(token.name) === -1);

        const root = this.buildAbstractSymbolTree(tokens, arrayOfVariables, functions);

        return new ExpressionParserResult(
            new AbstractSyntaxTree(root),
            this.staticAnalysisErrorRunner(root)
        );
    }

    /**
        Build the abstract syntax tree from a list of tokens. This is an implementation of the shunting yard algorithm:
        http://www.engr.mun.ca/~theo/Misc/exp_parsing.htm#shunting_yard
        @method buildAbstractSymbolTree
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
        @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
        @return {TreeSymbol} The root of the abstract symbol tree.
    */
    buildAbstractSymbolTree(tokens, arrayOfVariables, functions) {
        const operandsStack = [];
        const operatorsStack = [];
        let previousSymbol = null;

        while (tokens.length) {
            const isPreviousSymbolAnOperand = this.isAnOperand(previousSymbol);
            const symbol = this.makeSymbol(tokens, isPreviousSymbolAnOperand, arrayOfVariables, functions);

            // Catches if two operators or two operands next to each other.
            this.throwErrorIfInputNotValid(symbol, previousSymbol);

            // Push an operand on the stack.
            if (symbol.isAnOperand()) {
                operandsStack.push(symbol);
            }
            else {

                // While the new operator is lower precedence than the top operator, then pop the operator.
                while (operatorsStack.length && this.doesAHaveLowerPrecedenceThanB(symbol, operatorsStack[operatorsStack.length - 1])) {
                    this.popOperator(operandsStack, operatorsStack);
                }
                operatorsStack.push(symbol);
            }

            previousSymbol = symbol;
        }

        // Catches if extra operator at end of expression.
        this.throwErrorIfInvalidEnding(previousSymbol);

        while (operatorsStack.length) {
            this.popOperator(operandsStack, operatorsStack);
        }

        if ((operandsStack.length !== 1) || operatorsStack.length !== 0) {
            this.throwGenericError();
        }

        return operandsStack[0];
    }

    /**
        Determine if expression violates expected input format, and throw error if so.
        @method throwErrorIfInputNotValid
        @param {TreeSymbol} currSymbol The symbol currently being parsed.
        @param {TreeSymbol} previousSymbol The symbol parsed previously to currSymbol.
        @return {void}
    */
    throwErrorIfInputNotValid(currSymbol, previousSymbol) {
        const currSymbolIsAnOperand = this.isAnOperand(currSymbol);
        const currSymbolClassName = currSymbol ? currSymbol.getClassName() : '';
        const previousSymbolIsAnOperand = this.isAnOperand(previousSymbol);

        // Error if two of the same symbol in a row.
        // Ex: 1 * * (operand, operator, operator)
        // Ex: 1 1 (operand, operand)
        // Exception; Unary operators: 3 + -2 (operand, binary operator, unary operator, operand)
        if ((currSymbolIsAnOperand === previousSymbolIsAnOperand) && (currSymbolClassName !== 'UnaryOperatorSymbol')) {
            let currSymbolDisplayName = '';

            // If current symbol is operand then use operand's most specific name
            if (currSymbolIsAnOperand) {
                currSymbolDisplayName = this.getSpecificSymbolName(currSymbol);
            }

            // If current symbol is not an operand, it is an operator
            else {
                currSymbolDisplayName = currSymbol.operator;
            }

            this.throwSpecificError(currSymbolDisplayName);
        }
    }

    /**
        Return a name to display in error message as specific as possible.
        @method getSpecificSymbolName
        @param {TreeSymbol} symbol The current symbol being parsed by buildAbstractSymbolTree, for which an error is being thrown in throwErrorIfInputNotValid().
        @return {String} The name to be used for symbol in the error message.
    */
    getSpecificSymbolName(symbol) {
        let currSymbolDisplayName = '';
        const currSymbolClassName = symbol.getClassName();

        // Need a way to refer to expressions inside parens e.g. (1 + 2).
        // Overrides any other name, because we want to use left-most character related to symbol, in this case the left-most parenthesy.
        if (symbol.isInsideParens) {
            currSymbolDisplayName = '(';
        }
        else {
            switch (currSymbolClassName) {
                case 'SubscriptOperatorSymbol':

                    // Use name of variable symbol to refer to subscript operators e.g.'nums' from nums[0]
                    currSymbolDisplayName = symbol.children[0].variable.name;
                    break;
                case 'VariableSymbol':

                    // We know currSymbol.variable is of type SingleVariable
                    //    because parsing errors for arrayVariables are caught by makeSymbol().
                    // So we can use SingleVariable.toString() method here.
                    currSymbolDisplayName = symbol.variable;

                    // If variable has a user generated variable name, use it.
                    if (currSymbolDisplayName.name !== parserGeneratedVariableName) {
                        currSymbolDisplayName = currSymbolDisplayName.name;
                    }
                    break;
                case 'FunctionCallSymbol':
                    currSymbolDisplayName = symbol.firstToken.value;
                    break;
                default:
                    this.throwGenericError();
            }
        }
        return currSymbolDisplayName;
    }

    /**
        Throw an error if an expression is empty or ends with an extra operator.
        @method throwErrorIfInvalidEnding
        @param {TreeSymbol} endingSymbol The last symbol in an expression being parsed by makeAbstractSymbolTree().
        @return {void}
    */
    throwErrorIfInvalidEnding(endingSymbol) {
        const endingSymbolIsAnOperand = this.isAnOperand(endingSymbol);
        const endingSymbolIsAnOperator = endingSymbol && endingSymbol.isAnOperator();

        // Being an operand and operator are not mutually exclusive, e.g. (1 + 2) is an operand, but its class is 'BinaryOperatorSymbol'
        // We want to only catch actual dangling operators, like in the case of x + 1 +
        if (!endingSymbolIsAnOperand && endingSymbolIsAnOperator) {
            this.throwSpecificError(endingSymbol.operator);
        }
        else if (!endingSymbol) {
            throw new ExpressionParserError('Expected expression');
        }
    }

    /**
        Check if symbol is not null and is an operand.
        @method isAnOperand
        @param {TreeSymbol} symbol The symbol to check.
        @return {Boolean}
    */
    isAnOperand(symbol) {
        return Boolean(symbol) && symbol.isAnOperand();
    }

    /**
        Throw a more specific parser error.
        @method throwSpecificError
        @param {String} errorStart The display value of symbol that starts the error.
        @return {void}
    */
    throwSpecificError(errorStart) {
        throw new ExpressionParserError(`Error parsing expression starting at ${errorStart}`);
    }

    /**
        Throw a generic error.
        @method throwGenericError
        @return {void}
    */
    throwGenericError() {
        throw new ExpressionParserError('Error parsing expression');
    }

    /**
        The top operator is the parent of the top-most operand(s).
        @method popOperator
        @param {Array} operandsStack Array of {TreeSymbol}. The stack of operands.
        @param {Array} operatorsStack Array of {TreeSymbol}. The stack of operators.
        @return {void}
    */
    popOperator(operandsStack, operatorsStack) {
        const topOfStack = operatorsStack.pop();

        // Need at least 1 operand to add as a child.
        if (operandsStack.length < 1) {
            this.throwGenericError();
        }

        // Binary operator's have two children.
        if (topOfStack.getClassName() === 'BinaryOperatorSymbol') {
            topOfStack.children[1] = operandsStack.pop();
        }

        // Need at least 1 remaining operand to add as a child.
        if (operandsStack.length < 1) {
            this.throwGenericError();
        }

        topOfStack.children[0] = operandsStack.pop();

        operandsStack.push(topOfStack);
    }

    /**
        Return whether the first parameter is lower than the second.
        A larger precedence number has a lower precedence.
        @method doesAHaveLowerPrecedenceThanB
        @param {OperatorSymbol} first The first parameter.
        @param {OperatorSymbol} second The second parameter.
        @return {Boolean} Whether the first parameter is lower than the second.
    */
    doesAHaveLowerPrecedenceThanB(first, second) {
        let doesAHaveLowerPrecedenceThanB = first.getPrecedence() > second.getPrecedence();

        // If |first| is left associative, then equality also means lower precedence.
        if (first.isLeftAssociative()) {
            doesAHaveLowerPrecedenceThanB = first.getPrecedence() >= second.getPrecedence();
        }

        return doesAHaveLowerPrecedenceThanB;
    }

    /**
        Make a symbol from the given tokens.
        @method makeSymbol
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @param {Boolean} wasPreviousSymbolAnOperand Whether the previous symbol was an operand. Used to determine if new operator is binary or unary.
        @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
        @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
        @return {TreeSymbol} The symbol from the given tokens.
    */
    makeSymbol(tokens, wasPreviousSymbolAnOperand, arrayOfVariables, functions) { // eslint-disable-line complexity
        const token = tokens[0];
        let symbol = null;

        switch (token.name) {
            case 'word': {
                if (!isValidIdentifier(token.value)) {
                    const defaultError = `Invalid identifier: ${token.value}`;
                    const error = isReservedWord(token.value) ? reservedWordsErrorMessages[token.value] : defaultError;

                    throw new ExpressionParserError(error);
                }

                const foundVariable = arrayOfVariables.map(variables => variables.getVariable(token.value)).find(variable => variable);
                const foundFunction = functions.find(programFunction => programFunction.name === token.value);

                if (foundVariable) {
                    const variableNameToken = tokens.shift();
                    const variableSymbol = new VariableSymbol(foundVariable);

                    symbol = variableSymbol;

                    if (tokens.length) {

                        // Check if next token is "[", if so, add subscript operator.
                        if (tokens[0].name === 'openingBracket') {
                            symbol = this.makeSubscriptSymbol(variableSymbol, tokens, arrayOfVariables, functions);
                        }

                        // Else if check if next token is ".". If so, add member access operator.
                        else if (tokens[0].name === 'period') {
                            symbol = this.makeMemoryCellFromMemberAccess(foundVariable, tokens, variableNameToken);
                        }
                    }
                }
                else if (foundFunction) {

                    // Error if Main is called.
                    if (foundFunction.name === 'Main') {
                        throw new ExpressionParserError('Calling Main function is not allowed');
                    }

                    symbol = this.makeFuctionCallSymbol(tokens, foundFunction, arrayOfVariables, functions);
                }
                else {
                    const suggestionMessage = makeSuggestionForInvalidWordFromSimilarWords(token.value, arrayOfVariables, functions);

                    throw new ExpressionParserError(`Unknown word '${token.value}'`, suggestionMessage);
                }
                break;
            }
            case 'integerNumber':
            case 'floatNumber':
                symbol = this.makeVariableSymbolFromNumber(tokens);
                break;
            case 'arithmeticOperator':
            case 'conditionalOperator': {

                // If the previous symbol was an operand, then this operator is a binary operator. Ex: 4 + 5 => operand, operator, operand
                if (wasPreviousSymbolAnOperand) {
                    const operator = tokens.shift().value;

                    if (operator === 'not') {
                        throw new ExpressionParserError(`${operator} is not a binary operator`);
                    }

                    symbol = new BinaryOperatorSymbol(operator);
                }

                /*
                    If the previous symbol was not an operand, then this operator is a unary operator. Two examples:
                    1. -5 => operator (-) then operand (5)
                    2. 5 + -6 => operand (5), operator (+), operator (-), then operand (6). So, the - is a unary operator.
                */
                else {
                    const operator = tokens.shift().value;

                    if ([ 'not', '-', '+' ].indexOf(operator) === -1) {
                        throw new ExpressionParserError(`${operator} is not a unary operator`);
                    }

                    symbol = new UnaryOperatorSymbol(operator);
                }
                break;
            }
            case 'openingParens': {
                symbol = this.makeSymbolFromParens(tokens, arrayOfVariables, functions);
                symbol.isInsideParens = true;
                break;
            }
            default: {
                const defaultError = `Unexpected token ${token.value} in expression`;
                const error = isReservedWord(token.value) ? reservedWordsErrorMessages[token.value] : defaultError;

                throw new ExpressionParserError(error);
            }
        }

        return symbol;
    }

    /**
        Make a variable symbol from a number.
        @method makeVariableSymbolFromNumber
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @return {VariableSymbol} The created variable symbol.
    */
    makeVariableSymbolFromNumber(tokens) {
        const token = tokens.shift();
        let variable = null;
        let value = null;

        if (token.name === 'integerNumber') {
            variable = new IntegerVariable(parserGeneratedVariableName);
            value = parseInt(token.value, 10);
        }
        else {
            variable = new FloatVariable(parserGeneratedVariableName);
            value = parseFloat(token.value);
        }

        variable.setValue(value);

        return new VariableSymbol(variable);
    }

    /**
        Make a symbol from a sub-expression created via parens.
        @method makeSymbolFromParens
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
        @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
        @return {TreeSymbol} The symbol created from the sub-expression inside the parens.
    */
    makeSymbolFromParens(tokens, arrayOfVariables, functions) {
        const subExpression = this.getSubExpressionInParens(tokens);

        if (!subExpression.length) {
            throw new ExpressionParserError('Unexpected closing parens');
        }

        return this.buildAbstractSymbolTree(subExpression, arrayOfVariables, functions);
    }

    /**
        Make a subscript symbol for the given variable.
        @method makeSubscriptSymbol
        @param {VariableSymbol} variableSymbol The variable associated with the subscript.
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
        @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
        @return {SubscriptSymbol} The symbol created from the variable symbol and tokens.
    */
    makeSubscriptSymbol(variableSymbol, tokens, arrayOfVariables, functions) {
        const subScript = this.getSubExpressionInsideParensOrBracket(tokens, 'bracket');
        const subScriptTree = this.buildAbstractSymbolTree(subScript, arrayOfVariables, functions);
        const symbol = new SubscriptOperatorSymbol();

        symbol.children[0] = variableSymbol;
        symbol.children[1] = subScriptTree;

        return symbol;
    }

    /**
        Make a member access symbol for the given variable.
        @method makeMemoryCellFromMemberAccess
        @param {Variable} foundVariable The variable associated with the member access.
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @param {Token} variableNameToken The token with the variable name.
        @return {MemoryCellSymbol} The symbol created from the given variable.
    */
    makeMemoryCellFromMemberAccess(foundVariable, tokens, variableNameToken) {

        // Remove the period.
        tokens.shift();

        const memberToken = tokens.shift();
        let symbol = null;

        if (memberToken) {
            const memoryCell = foundVariable.getMemoryCellByName(`${foundVariable.name}.${memberToken.value}`);

            symbol = new MemoryCellSymbol(memoryCell, variableNameToken, memberToken);
        }
        else {
            throw new ExpressionParserError('Unexpected period after variable');
        }

        return symbol;
    }

    /**
        Make a function call symbol from the given tokens.
        @method makeFuctionCallSymbol
        @param {Array} tokens Array of {Token}. The list of tokens to parse.
        @param {ProgramFunction} programFunction The function to call.
        @param {Array} arrayOfVariables Array of {Variables}. The variables in this expression's function.
        @param {Array} functions Array of {ProgramFunction}. The functions in this expression's program.
        @return {FunctionCallSymbol} The function call symbol from the given tokens.
    */
    makeFuctionCallSymbol(tokens, programFunction, arrayOfVariables, functions) {
        const firstToken = tokens.shift();
        let lastToken = tokens[tokens.length - 1];
        const functionName = firstToken.name;
        const tokensCopy = tokens.slice();

        if (tokens[0].name !== 'openingParens') {
            throw new ExpressionParserError(`Expected opening parens for ${functionName} function call`);
        }

        // Get the list of tokens inside the function call. Ex: GetInput(x + 1, 4) return x + 1, 4
        const argumentTokens = this.getSubExpressionInParens(tokens);
        const argumentList = [];
        let parensCounter = 0;
        let subSubExpression = [];

        if (argumentTokens.length) {

            // Consume the first element
            while (argumentTokens.length) {
                const nextToken = argumentTokens.shift();

                // Found a comma separating two arguments; store the current sub-subexpression.
                if ((nextToken.name === 'comma') && !parensCounter) {
                    argumentList.push(subSubExpression);
                    subSubExpression = [];
                }
                else {

                    // Handle parens. Increment if opening; decrement if closing.
                    if (nextToken.name === 'openingParens') {
                        parensCounter++;
                    }
                    else if (nextToken.name === 'closingParens') {
                        parensCounter--;
                    }

                    subSubExpression.push(nextToken);
                }
            }

            // Grab the last argument.
            argumentList.push(subSubExpression);

            // Cannot have an empty argument.
            if (argumentList.find(argument => !argument.length)) {
                throw new ExpressionParserError(`An argument in ${functionName} is empty, but shouldn't be.`);
            }
        }

        // If tokens remain, then the end index to highlight should be from the last removed token.
        if (tokens.length) {
            const indexOfPriorToken = tokensCopy.indexOf(tokens[0]) - 1;

            lastToken = tokensCopy[indexOfPriorToken];
        }

        const symbol = new FunctionCallSymbol(programFunction, firstToken, lastToken);

        symbol.children.push(...argumentList.map(argument => this.buildAbstractSymbolTree(argument, arrayOfVariables, functions)));

        return symbol;
    }

    /**
        Remove the sub-expression inside the parens.
        @method getSubExpressionInParens
        @param {Array} tokens Array of {Token} List of tokens from which to extract the parens and subexpression.
        @return {Array} of {Token} The sub-expression inside the parens.
    */
    getSubExpressionInParens(tokens) {
        return this.getSubExpressionInsideParensOrBracket(tokens, 'parens');
    }

    /**
        Remove the sub-expression inside the parens or bracket.
        @method getSubExpressionInsideParensOrBracket
        @param {Array} tokens Array of {Token} List of tokens from which to extract the parens and subexpression.
        @param {String} parensOrBracket The string 'parens' or 'bracket'.
        @return {Array} of {Token} The sub-expression inside the parens or bracket.
    */
    getSubExpressionInsideParensOrBracket(tokens, parensOrBracket) {
        const allLowerCase = parensOrBracket.toLowerCase();
        const initialUpperCase = allLowerCase.charAt(0).toUpperCase() + allLowerCase.slice(1);

        // Remove the opening parens.
        tokens.shift();

        // Initialize to 1 to account for the opening parens.
        let counter = 1;
        const subExpression = [];

        // Remove the sub-expression inside the outer-parens. Ex: ((x + 4) * y) - 2 yields (x + 4) * y
        while (tokens.length) {
            const topToken = tokens.shift();

            // Keep track of number of parens.
            if (topToken.name === `opening${initialUpperCase}`) {
                counter++;
            }
            else if (topToken.name === `closing${initialUpperCase}`) {
                counter--;
            }

            // When counter is 0, then we've found the associated closing parens to the original opening parens.
            if (counter === 0) {
                break;
            }
            else {
                subExpression.push(topToken);
            }
        }

        if (counter) {
            throw new ExpressionParserError(`Expected a closing ${allLowerCase}`);
        }

        return subExpression;
    }

    /**
        Traverse the tree to check for errors in the parent-child symbols.
        @method staticAnalysisErrorRunner
        @param {TreeSymbol} symbol The current symbol being traversed.
        @return {String} The data type being returned.
    */
    staticAnalysisErrorRunner(symbol) { // eslint-disable-line complexity
        const childDataTypes = symbol.children.map(child => this.staticAnalysisErrorRunner(child));

        if (childDataTypes.some(child => !child)) {
            let errorMessage = 'Function call returns nothing. ';

            if (symbol.getClassName() === 'FunctionCallSymbol') {
                errorMessage += 'Cannot pass nothing to next function call';
            }
            else {
                errorMessage += 'Cannot perform operation on nothing';
            }

            throw new ExpressionParserError(errorMessage);
        }

        let symbolDataType = null;
        const numericalVariable = [ 'IntegerVariable', 'FloatVariable' ];

        switch (symbol.getClassName()) {

            // Just return the variable itself.
            case 'VariableSymbol':
                symbolDataType = symbol.variable;
                break;

            // Return the memory cell as a variable.
            case 'MemoryCellSymbol':
                symbolDataType = this.makeVariableFromType(symbol.memoryCell.type);
                break;

            // The first child must be an array. The second child must be an integer. Return a variable of the type of array.
            case 'SubscriptOperatorSymbol':
                if (!childDataTypes[0].isArray()) {
                    throw new ExpressionParserError('Cannot subscript a non-array variable');
                }
                if (childDataTypes[1].getClassName() !== 'IntegerVariable') {
                    throw new ExpressionParserError('Subscript value must be an integer');
                }
                symbolDataType = this.makeVariableFromType(childDataTypes[0].type);
                break;

            // Conditional operators return a boolean variable. Arithmetic operators return either an integer or float.
            case 'UnaryOperatorSymbol':
            case 'BinaryOperatorSymbol': {
                const areChildrenNumbers = childDataTypes.every(
                    child => numericalVariable.indexOf(child.getClassName() >= 0)
                );

                // Conditional operators return a boolean.
                if (conditionalOperatorExpression.test(symbol.operator)) {
                    const isBooleanOperator = [ 'not', 'and', 'or' ].indexOf(symbol.operator) >= 0;
                    const areChildrenBoolean = childDataTypes.every(child => child.getClassName() === 'BooleanVariable');

                    // Boolean operators can only have boolean children, and return a boolean.
                    if (isBooleanOperator && !areChildrenBoolean) {
                        throw new ExpressionParserError(`${symbol.operator} must be connected to a conditional operator`);
                    }

                    // Must have integer or float children.
                    if (!isBooleanOperator && !areChildrenNumbers) {
                        throw new ExpressionParserError(`${symbol.operator} must relate numbers`);
                    }
                    symbolDataType = this.makeVariableFromType('boolean');
                }

                // Non-boolean operators must have children that are numbers, and return either a float or integer.
                else {
                    if (!areChildrenNumbers) {
                        throw new ExpressionParserError(`${symbol.operator} must operate on numbers`);
                    }

                    // If both are integers, return an integer. Otherwise, return a float.
                    const hasNonInteger = childDataTypes.some(child => child.getClassName() !== 'IntegerVariable');

                    symbolDataType = this.makeVariableFromType(hasNonInteger ? 'float' : 'integer');
                }
                break;
            }

            // Verify the arguments and parameters match data types. Return the functions return variable.
            case 'FunctionCallSymbol': {
                const parameters = symbol.function.parameters;

                if (symbol.children.length !== parameters.length) {
                    const functionName = symbol.function.name;

                    throw new ExpressionParserError(
                        `Expected call to ${functionName} to have ${parameters.length} arguments but found ${symbol.children.length}`
                    );
                }

                // Arguments should match the parameter data types.
                childDataTypes.forEach((argument, index) => {
                    const numericalArrays = [ 'IntegerArray', 'FloatArray' ];
                    const parameterIsNumericalArray = numericalArrays.indexOf(parameters[index].getClassName()) >= 0;
                    const argumentIsNumericalArray = numericalArrays.indexOf(argument.getClassName()) >= 0;
                    const parameterIsNumber = numericalVariable.indexOf(parameters[index].getClassName()) >= 0;
                    const argumentIsNumber = numericalVariable.indexOf(argument.getClassName()) >= 0;

                    // If they are both numerical arrays, then that's fine.
                    if (parameterIsNumericalArray && !argumentIsNumericalArray) {
                        throw new ExpressionParserError(
                            `${symbol.function.name} call expected an array argument but found a non-array argument`
                        );
                    }

                    if (parameterIsNumber && !argumentIsNumber) {
                        throw new ExpressionParserError(
                            `${symbol.function.name} call expected a number argument but found a non-number argument`
                        );
                    }
                });

                // Use the return variable, if one exists.
                symbolDataType = symbol.function.return.length ? symbol.function.return[0] : symbolDataType;
                break;
            }
            default:
                break;
        }

        return symbolDataType;
    }

    /**
        Make a variable for the given type.
        @method makeVariableFromType
        @param {String} type The type of variable to make.
        @return {Variable} Made from the given type.
    */
    makeVariableFromType(type) {
        let variable = null;

        if (type === 'integer') {
            variable = new IntegerVariable(parserGeneratedVariableName);
        }
        else if (type === 'float') {
            variable = new FloatVariable(parserGeneratedVariableName);
        }
        else if (type === 'boolean') {
            variable = new BooleanVariable(parserGeneratedVariableName);
        }

        return variable;
    }
}
