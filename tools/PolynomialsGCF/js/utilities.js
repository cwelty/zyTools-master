/* exported greatestCommonDivisor, numbersForLevels124And5 */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Returns the greatest common divisor of two numbers.
    @method greatestCommonDivisor
    @param {Number} number1 First number.
    @param {Number} number2 Second number.
    @return {Number} The greatest common divisor.
*/
function greatestCommonDivisor(number1, number2) {
    return number2 === 0 ? number1 : greatestCommonDivisor(number2, number1 % number2);
}

/**
    Calculates some values that can be used in levels 1, 2, 4 and 5.
    @method _numbersForLevels124And5
    @private
    @return {Object} An object containing some values.
*/
function numbersForLevels124And5() {
    const randomVariable = require('utilities').flipCoin() ? 'x' : 'y';
    const pickNumberInRange = require('utilities').pickNumberInRange;

    const otherVariable = randomVariable === 'x' ? 'y' : 'x';
    const multiplyBy = pickNumberInRange(2, 6);
    const integerOne = pickNumberInRange(2, 6, [ multiplyBy ]);
    const termDegree = pickNumberInRange(2, 3);
    let integerTwo = null;

    do {
        integerTwo = pickNumberInRange(2, 7, [ multiplyBy, integerOne ]);
    } while (greatestCommonDivisor(integerOne, integerTwo) !== 1);

    return { randomVariable, otherVariable, multiplyBy, integerOne, termDegree, integerTwo };
}
