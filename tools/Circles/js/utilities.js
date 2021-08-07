/* exported createQuadraticForm */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Creates a quadratic equation that represents a circle.
    @method createQuadraticForm
    @private
    @return {Object} An object with information to build a quadratic equation.
*/
function createQuadraticForm() {
    const pickNumberInRange = require('utilities').pickNumberInRange;
    const halfXCoefficient = pickNumberInRange(-5, 5, [ 0 ]);
    const halfXCoefficientSquared = Math.pow(halfXCoefficient, 2);
    const xCoefficient = halfXCoefficient * 2;

    const halfYCoefficient = pickNumberInRange(-5, 5, [ 0, halfXCoefficient ]);
    const halfYCoefficientSquared = Math.pow(halfYCoefficient, 2);
    const yCoefficient = halfYCoefficient * 2;

    // Ensure the constant has exact square root.
    const possibleConstants = [];

    for (let possibleConstant = 2; possibleConstant <= 6; possibleConstant++) {
        possibleConstants.push(Math.pow(possibleConstant, 2) - Math.pow(halfXCoefficient, 2) - Math.pow(halfYCoefficient, 2));
    }

    // const possibleConstants = [ 4 - Math.pow(halfXCoefficient, 2) - Math.pow(halfYCoefficient, 2),
    //                             9 - Math.pow(halfXCoefficient, 2) - Math.pow(halfYCoefficient, 2),
    //                             16 - Math.pow(halfXCoefficient, 2) - Math.pow(halfYCoefficient, 2),
    //                             25 - Math.pow(halfXCoefficient, 2) - Math.pow(halfYCoefficient, 2),
    //                             36 - Math.pow(halfXCoefficient, 2) - Math.pow(halfYCoefficient, 2) ];
    const constant = require('utilities').pickElementFromArray(possibleConstants);
    const radius = Math.sqrt(constant + halfXCoefficientSquared + halfYCoefficientSquared);

    return { halfXCoefficient, halfXCoefficientSquared, xCoefficient, constant,
             halfYCoefficient, halfYCoefficientSquared, yCoefficient, radius };
}
