/* exported calculateFactors, getNonPrimeNumber */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Calculates the factors of |number|.
    Ex: calculateFactors(9) -> array: [ [ 1, 9 ], [ 3, 3 ] ] ; string: '(1, 9), (3, 3)'
    @method calculateFactors
    @param {Number} number The number to calculate factors from.
    @param {Boolean} [addNegatives=true] Wheter to return negative factors also or not.
    @return {Object} An {Array} containing the pairs of factors and a string showing all the factors.
*/
function calculateFactors(number, addNegatives = true) {
    const factorsArray = [];

    for (let factor = 1; factor < Math.ceil(number / 2); factor++) {
        if (number % factor === 0) {
            const add = !factorsArray.some(factorPair => factorPair[0] === number / factor);

            if (add) {
                factorsArray.push([ factor, number / factor ]);
            }
        }
    }

    if (addNegatives) {
        for (let factor = -1; Math.abs(factor) < Math.floor(number / 2); factor--) {
            if (number % factor === 0) {
                const add = !factorsArray.some(factorPair => factorPair[0] === number / factor);

                if (add) {
                    factorsArray.push([ factor, number / factor ]);
                }
            }
        }
    }

    let factorsString = '';

    factorsArray.forEach((factor, index) => {
        factorsString += `(${factor[0]}, ${factor[1]})`;
        factorsString += index < factorsArray.length - 1 ? ', ' : '';
    });

    return { factorsArray, factorsString };
}

/**
    Returns a non-prime random number between 6 and 20.
    @method getNonPrimeNumber
    @return {Number} A non-prime number between 6 and 20.
*/
function getNonPrimeNumber() {
    return require('utilities').pickNumberInRange(6, 20, [ 7, 11, 13, 17, 19 ]);
}
