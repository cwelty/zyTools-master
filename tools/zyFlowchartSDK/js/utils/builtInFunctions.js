'use strict';

/* exported builtInFunctions, builtInMathFunctionNames, builtInFunctionNames, builtInRandomFunctionNames */
/* global BuiltInProgramFunction, Variables, FloatVariable, Flowchart, StartNode, EndNode, IntegerVariable */

// Dummy flowchart cloned by the built-in functions below.
const startNode = new StartNode();
const endNode = new EndNode();

startNode.setChildNode(endNode);

const flowchart = new Flowchart(startNode);

// Function RaiseToPower accepts two float variables (x and y) and returns one float variable (z).
const raiseToPowerParameters = new Variables('Parameters');
const raiseToPowerReturn = new Variables('Return');

raiseToPowerParameters.push(new FloatVariable('x'), new FloatVariable('y'));
raiseToPowerReturn.push(new FloatVariable('z'));

const raiseToPowerBuiltInFunction = new BuiltInProgramFunction(
    'RaiseToPower', flowchart.clone(), new Variables('Locals'), raiseToPowerParameters, raiseToPowerReturn,
    (parameters, returnVariables) => {
        const first = parameters.getMemoryCell('x').getValue();
        const second = parameters.getMemoryCell('y').getValue();
        const result = Math.pow(first, second);

        returnVariables.getMemoryCell('z').setValue(result);
    }
);

// Function SquareRoot accepts one float variable (x) and returns one float variable (y).
const squareRootParameters = new Variables('Parameters');
const squareRootReturn = new Variables('Return');

squareRootParameters.push(new FloatVariable('x'));
squareRootReturn.push(new FloatVariable('y'));

const squareRootBuiltInFunction = new BuiltInProgramFunction(
    'SquareRoot', flowchart.clone(), new Variables('Locals'), squareRootParameters, squareRootReturn,
    (parameters, returnVariables) => {
        const result = Math.sqrt(parameters.getMemoryCell('x').getValue());

        returnVariables.getMemoryCell('y').setValue(result);
    }
);

// Function RandomNumber accepts two integer variables (x and y) and returns one integer variable (z).
const randomNumberParameters = new Variables('Parameters');
const randomNumberReturn = new Variables('Return');

randomNumberParameters.push(new IntegerVariable('x'), new IntegerVariable('y'));
randomNumberReturn.push(new IntegerVariable('z'));

const randomNumberBuiltInFunction = new BuiltInProgramFunction(
    'RandomNumber', flowchart.clone(), new Variables('Locals'), randomNumberParameters, randomNumberReturn,
    (parameters, returnVariables, context) => {
        const randomNumber = context.randomizer.getNumber();
        const xValue = parameters.getMemoryCell('x').getValue();
        const divisor = parameters.getMemoryCell('y').getValue() - xValue + 1;

        if (divisor <= 0) {
            throw new Error('RandomNumber cannot have second parameter smaller than first parameter');
        }

        const result = (randomNumber % divisor) + xValue;

        returnVariables.getMemoryCell('z').setValue(result);
    }
);

// Function SeedRandomNumbers accepts one integer variable and returns nothing.
const seedRandomNumbersParameters = new Variables('Parameters');

seedRandomNumbersParameters.push(new IntegerVariable('x'));

const seedRandomNumbersBuiltInFunction = new BuiltInProgramFunction(
    'SeedRandomNumbers', flowchart.clone(), new Variables('Locals'), seedRandomNumbersParameters, new Variables('Return'),
    (parameters, returnVariables, context) => {
        context.randomizer.setSeed(parameters.getMemoryCell('x').getValue());
    }
);

// Function AbsoluteValue accepts a float variable and returns a float variable.
const absoluteValueParameters = new Variables('Parameters');
const absoluteValueReturn = new Variables('Return');

absoluteValueParameters.push(new FloatVariable('x'));
absoluteValueReturn.push(new FloatVariable('y'));

const absoluteValueBuiltInFunction = new BuiltInProgramFunction(
    'AbsoluteValue', flowchart.clone(), new Variables('Locals'), absoluteValueParameters, absoluteValueReturn,
    (parameters, returnVariables) => {
        const absoluteValue = Math.abs(parameters.getMemoryCell('x').getValue());

        returnVariables.getMemoryCell('y').setValue(absoluteValue);
    }
);

const builtInMathFunctions = [
    absoluteValueBuiltInFunction,
    raiseToPowerBuiltInFunction,
    squareRootBuiltInFunction,
];
const builtInRandomFunctions = [
    randomNumberBuiltInFunction,
    seedRandomNumbersBuiltInFunction,
];
const builtInFunctions = builtInMathFunctions.concat(builtInRandomFunctions);
const builtInMathFunctionNames = builtInMathFunctions.map(builtInFunction => builtInFunction.name);
const builtInRandomFunctionNames = builtInRandomFunctions.map(builtInFunction => builtInFunction.name);
const builtInFunctionNames = builtInFunctions.map(builtInFunction => builtInFunction.name);
