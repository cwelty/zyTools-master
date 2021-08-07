'use strict';

/* exported evaluateAbstractSyntaxTree */
/* global FloatVariable, IntegerVariable, BooleanVariable, lookupMemoryCellFromVariableLists */

const evaluatorGeneratedVariableName = 'evaluatorGeneratedVariable';

/**
    Return whether the given variable is an IntegerVariable, or MemoryCell of type 'integer'.
    @method isIntegerVariable
    @param {Variable} variable The variable to check.
    @return {Boolean} Whether the variable is an integer.
*/
function isIntegerVariable(variable) {
    return (variable.getClassName() === 'IntegerVariable') || ((variable.getClassName() === 'MemoryCell') && (variable.type === 'integer'));
}

/**
    Make a variable for the result of an arithmetic operation on |first| and |second|.
    @method makeArithmeticVariable
    @param {Variable} first The first parameter.
    @param {Variable} second The second parameter.
    @return {Variable} The variable type that is the data type of the operation.
*/
function makeArithmeticVariable(first, second) {
    let variable = new FloatVariable(evaluatorGeneratedVariableName);

    // If both variables are integer, then the result is integer. Otherwise, the result is a float.
    if (isIntegerVariable(first) && isIntegerVariable(second)) {
        variable = new IntegerVariable(evaluatorGeneratedVariableName);
    }

    return variable;
}

/**
    Make a result for the calculation "first O second", where "first" is the first parameter, "O" is the operator and "second" is the second parameter.
    @method makeBinaryOperatorResult
    @param {TreeSymbol} symbol The root symbol from which to evaluate.
    @param {ExecutionContext} context The relevant flowchart properties for execution.
    @return {Variable} The result of the binary operation.
*/
function makeBinaryOperatorResult(symbol, context) { // eslint-disable-line complexity
    const arrayOfVariables = context.arrayOfVariables;
    let result = null;
    let first = null;
    let second = null;

    // AND and OR will short circuit the evaluation. Ex: For AND, if the first child is false, then the second child will not be evaluated.
    if ([ 'and', 'or' ].indexOf(symbol.operator) === -1) {
        first = evaluateAbstractSyntaxTree(symbol.children[0], context); // eslint-disable-line no-use-before-define
        second = evaluateAbstractSyntaxTree(symbol.children[1], context); // eslint-disable-line no-use-before-define
    }

    switch (symbol.operator) {
        case '+':
            result = makeArithmeticVariable(first, second);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) + second.getValue(arrayOfVariables)
            );
            break;
        case '-':
            result = makeArithmeticVariable(first, second);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) - second.getValue(arrayOfVariables)
            );
            break;
        case '*':
            result = makeArithmeticVariable(first, second);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) * second.getValue(arrayOfVariables)
            );
            break;
        case '/':
            result = makeArithmeticVariable(first, second);

            // Catch divide by 0 error for integers.
            if ((result.getClassName() === 'IntegerVariable') && (second.getValue() === 0)) {
                throw new Error('Cannot divide by zero with integer division');
            }

            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) / second.getValue(arrayOfVariables)
            );
            break;
        case '%':
            result = makeArithmeticVariable(first, second);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) % second.getValue(arrayOfVariables)
            );
            break;
        case '>':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) > second.getValue(arrayOfVariables)
            );
            break;
        case '<':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) < second.getValue(arrayOfVariables)
            );
            break;
        case '>=':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) >= second.getValue(arrayOfVariables)
            );
            break;
        case '<=':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) <= second.getValue(arrayOfVariables)
            );
            break;
        case '==':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) === second.getValue(arrayOfVariables)
            );
            break;
        case '!=':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                first.getValue(arrayOfVariables) !== second.getValue(arrayOfVariables)
            );
            break;

        // Use short circuit evaluation. If first child is false, then don't execute second child.
        case 'and':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                evaluateAbstractSyntaxTree(symbol.children[0], context).getValue(arrayOfVariables) && // eslint-disable-line no-use-before-define
                evaluateAbstractSyntaxTree(symbol.children[1], context).getValue(arrayOfVariables) // eslint-disable-line no-use-before-define
            );
            break;

        // Use short circuit evaluation. If first child is true, then don't execute second child.
        case 'or':
            result = new BooleanVariable(evaluatorGeneratedVariableName);
            result.setValueDuringExecution(
                evaluateAbstractSyntaxTree(symbol.children[0], context).getValue(arrayOfVariables) || // eslint-disable-line no-use-before-define
                evaluateAbstractSyntaxTree(symbol.children[1], context).getValue(arrayOfVariables) // eslint-disable-line no-use-before-define
            );
            break;
        default:
            throw new Error(`Unrecognized binary operator ${symbol.operator}`);
    }

    return result;
}

/**
    Make a result of a unary operation. Ex: -100 or !x
    @method makeUnaryOperatorResult
    @param {String} operator The operator to make a result for.
    @param {Variable} child The child of the operator.
    @param {Array} arrayOfVariables Array of {Variables}. List of variables in the current function.
    @return {Variable} The result of the unary operation.
*/
function makeUnaryOperatorResult(operator, child, arrayOfVariables) {
    const result = child.clone();

    result.name = evaluatorGeneratedVariableName;

    switch (operator) {
        case '+':

            // Do nothing.
            break;
        case '-':
            result.setValueDuringExecution(-child.getValue(arrayOfVariables));
            break;
        case 'not':
            result.setValueDuringExecution(!child.getValue(arrayOfVariables));
            break;
        default:
            throw new Error(`Unrecognized unary operator ${operator}`);
    }

    return result;
}

/**
    Evaluate the given abstract syntax tree.
    @method evaluateAbstractSyntaxTree
    @param {TreeSymbol} symbol The current symbol in the tree to evaluate.
    @param {ExecutionContext} context The relevant flowchart properties for execution.
    @return {Variable} The result of the abstract syntax tree.
*/
function evaluateAbstractSyntaxTree(symbol, context) { // eslint-disable-line complexity
    let result = null;

    switch (symbol.getClassName()) {
        case 'VariableSymbol':
            result = symbol.variable;
            break;
        case 'MemoryCellSymbol':
            result = symbol.memoryCell;
            break;

        // These are only the built-in functions. User-defined functions are handled by the Executor.
        case 'FunctionCallSymbol': {
            const argumentList = symbol.children.map(child => evaluateAbstractSyntaxTree(child, context));

            // Copy arguments to parameters.
            symbol.function.parameters.forEach((parameter, index) => {
                const argument = argumentList[index];

                parameter.setValueDuringExecution(argument.getValue(context.arrayOfVariables));
            });

            // Execute the built-in function.
            symbol.function.execute(context);

            // Store the return value to result.
            if (symbol.function.return.length) {
                result = symbol.function.return[0].clone();
                result.name = evaluatorGeneratedVariableName;
            }
            break;
        }
        case 'BinaryOperatorSymbol': {
            result = makeBinaryOperatorResult(symbol, context);
            break;
        }
        case 'UnaryOperatorSymbol': {
            const child = evaluateAbstractSyntaxTree(symbol.children[0], context);

            result = makeUnaryOperatorResult(symbol.operator, child, context.arrayOfVariables);
            break;
        }
        case 'SubscriptOperatorSymbol': {
            const array = symbol.children[0].variable;
            const arrayIndex = evaluateAbstractSyntaxTree(symbol.children[1], context).getValue(
                context.arrayOfVariables
            );
            const maxIndexAllowed = array.arrayCells.length - 1;

            // Verify array has defined length.
            if (maxIndexAllowed < 0) {
                throw new Error('Set the array\'s size before accessing an element.');
            }

            // Verify no out-of-bounds array access.
            let smallOrLarge = '';

            if (arrayIndex < 0) {
                smallOrLarge = 'small';
            }
            else if (arrayIndex > maxIndexAllowed) {
                smallOrLarge = 'large';
            }

            if (smallOrLarge) {
                throw new Error(
                    `An array index of ${arrayIndex} is too ${smallOrLarge}; valid range of ${array.name}: 0 - ${maxIndexAllowed}`
                );
            }

            result = lookupMemoryCellFromVariableLists(`${array.name}[${arrayIndex}]`, context.arrayOfVariables);
            break;
        }
        default:
            throw new Error('Unsupported tree symbol. Please report this error to a developer.');
    }

    return result;
}
