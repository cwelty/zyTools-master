/* global Exponentiation */
/* exported Polynomial */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    A class that defines a polynomial.
    @class Polynomial
*/
class Polynomial {

    /**
        Creates a new Polynomial object.
        @constructor
        @param {Array} terms Array of array of {Exponentiation}, each subarray is a term, each {Exponentiation} is part of the term.
            Ex: [ [ new Exponentiation(2, 1), new Exponentiation('x', 3), new Exponentiation(4, 1) ],
                  [ new Exponentiation(y, 2), new Exponentiation(y, 1) ] ]
            Represents the polynomial: 2x^(3)4 + y^(2)y
    */
    constructor(terms = []) {
        this.emptyValue = new Exponentiation(1, 1);
        this.terms = [];
        this.addTerms(terms);
        this.degree = 1;
        this.collectedTerms = '';
        this.simplified = this.simplify();
    }

    /**
        Sets new terms for the polynomial, substituting the old ones.
        @method setTerms
        @param {Array} terms Array of array of {Exponentiation}, each subarray is a term, each {Exponentiation} is part of the term.
            See |addTerms| for an example.
        @return {Void}
    */
    setTerms(terms) {
        this.terms = terms;
        this.calculateDegree();
        this.simplified = this.simplify();
    }

    /**
        Updates the polynomial by adding new terms to it.
        @method addTerms
        @param {Array} terms Array of array of {Exponentiation}, each subarray is a term, each {Exponentiation} is part of the term.
            Ex: [ [ new Exponentiation(2, 1), new Exponentiation('x', 3), new Exponentiation(4, 1) ],
                  [ new Exponentiation(y, 2), new Exponentiation(y, 1) ],
                  [ new Exponentiation(-2, 'x') ],
                  [ new Exponentiation(7, 1) ] ]
            Represents the polynomial: 2x^(3)4 + y^(2)y - 2x + 7
        @return {Void}
    */
    addTerms(terms) {
        this.terms = this.terms.concat(terms);
        this.calculateDegree();
        this.simplified = this.simplify();
    }

    /**
        Updates the polynomial by adding a new term to it.
        @method addTerm
        @param {Array} term Array of {Exponentiation}, each element is part of the term.
            Ex: [ new Exponentiation(4, 1), new Exponentiation('x', 3) ]
            Represents: 4x^3
        @return {Void}
    */
    addTerm(term) {
        this.addTerms([ term ]);
    }

    /**
        Calculates the degree of the polynomial.
        @method calculateDegree
        @return {Void}
    */
    calculateDegree() {
        const degrees = this.terms.map(term =>
            term.reduce((previousValue, currentValue) => previousValue + currentValue.degree, 0)
        );

        this.degree = Math.max(...degrees);
    }

    /**
        Orders the values in each term alphabetically.
        @method sortAlphabetically
        @param {Array} [terms=this.terms] Array of the terms to sort.
        @return {Array} Array of terms sorted alphabetically.
    */
    sortAlphabetically(terms = this.terms) {
        return terms.map(term => {
            const variableDegreeMap = new Map();
            const variableOrder = [];
            let integerPart = 1;

            term.forEach(value => {
                if (value.isNumber) {
                    integerPart *= value.base;
                    return;
                }

                if (variableDegreeMap.has(value.base)) {
                    variableDegreeMap.set(value.base, variableDegreeMap.get(value.base) + value.exponent);
                }
                else {
                    variableDegreeMap.set(value.base, value.exponent);
                    variableOrder.push(value.base);
                }
            });
            variableOrder.sort();

            // Reorder terms to standarize.
            let termValues = [ new Exponentiation(integerPart, 1) ];

            if ((variableOrder.length > 0) && integerPart === 1) {
                termValues = [];
            }

            termValues = termValues.concat(variableOrder.map(variable => new Exponentiation(variable, variableDegreeMap.get(variable))));
            return termValues;
        });
    }

    /**
        Orders the terms by descending degree.
        @method sortByDegree
        @param {Array} [terms=this.terms] Array of the terms to sort.
        @return {Array} Of terms sorted by descending degree.
    */
    sortByDegree(terms = this.terms) {
        const termAndDegrees = terms.map(term =>
            ({ degree: term.reduce((previousValue, currentValue) => previousValue + currentValue.degree, 0),
               term })
        );

        termAndDegrees.sort((termA, termB) => {
            const areDegreesEqual = termA.degree === termB.degree;
            let sortOrder = 0;

            // If degree is the same, order by the first variable name
            if (areDegreesEqual) {
                const filteredTermA = termA.term.filter(value => value.isVariable);
                const filteredTermB = termB.term.filter(value => value.isVariable);

                if (filteredTermA.length === 0) {
                    sortOrder = 1;
                }
                else if (filteredTermB.length === 0) {
                    sortOrder = -1;
                }
                else if (filteredTermB[0].base === '') {
                    sortOrder = -1;
                }
                else if (filteredTermA[0].base > filteredTermB[0].base) {
                    sortOrder = 1;
                }
                else if (filteredTermA[0].base < filteredTermB[0].base) {
                    sortOrder = -1;
                }
            }
            else {
                sortOrder = termA.degree > termB.degree ? -1 : sortOrder;
                sortOrder = termA.degree < termB.degree ? 1 : sortOrder;
            }
            return sortOrder;
        });

        return termAndDegrees.map(termAndDegree => termAndDegree.term);
    }

    /**
        Simplifies the polynomial and then reorders the terms as needed to write in standard form.
        @method standarize
        @return {Array} of terms in standard order.
    */
    standarize() {

        // Sort values in each term alphabetically
        const newTerms = this.sortAlphabetically(this.simplified);

        // Sort terms by descending degree
        return this.sortByDegree(newTerms);
    }

    /**
        Returns the same polynomial but simplified. Saves a version of the polynomial with like-terms collected in |this.collectedTerms|.
        Ex: 2x + 2 + 4x ; Simplified: 6x + 2 ; this.collectedTerms: '(2x + 4x) + (2)'
        @method simplify
        @return {Array} of simplified terms.
    */
    simplify() {
        const newTerms = [];

        // Saves the degree of certain variable. Ex: { 'x': 3, 'y': 2 }
        this.terms.forEach(term => {
            const variableDegreeMap = new Map();
            let termInteger = 1;

            // Calculate the value of the constant part for the simplified term. Ex: 4x2y = 8xy
            term.filter(value => value.isNumber).forEach(value => {
                termInteger *= value.simplify();
            });

            // Calculate the degree of each variable for the simplified term. Ex: 4x^(2)x = 4x^(3)
            term.filter(value => value.isVariable).forEach(value => {
                if (variableDegreeMap.has(value.base)) {
                    variableDegreeMap.set(value.base, variableDegreeMap.get(value.base) + value.exponent);
                }
                else {
                    variableDegreeMap.set(value.base, value.exponent);
                }
            });

            // Creates the new simplified term.
            let newValue = new Exponentiation(termInteger, 1);
            let termValues = [ newValue ];

            variableDegreeMap.forEach((degree, variable) => {
                newValue = new Exponentiation(variable, degree);
                if ((newValue.base !== 1) || (newValue.isVariable) || (newValue.exponent !== 1)) {
                    termValues.push(newValue);
                }
            });

            if (termValues.length > 1) {
                termValues = termValues.filter(value => !this.isEqualEmptyValue(value));
            }

            if (termValues.length > 0) {
                newTerms.push(termValues);
            }
        });

        /*
            Add like terms. Ex: 4x^(2)y + x^(2)y = 5x^(2)y
            And create a version of the polynomial with collected like-terms. Ex: 4xy + 2x + xy = (4xy + xy) + (2x)
        */
        const keys = [];
        const termsMap = new Map();
        const collectedTermsMap = new Map();
        const finalTerms = [];

        newTerms.forEach(term => {
            const variableValues = term.filter(value => value.isVariable);
            const nonVariableValues = term.filter(value => value.isNumber);
            const mapValue = [];
            let key = '';
            let collectedTermString = '';
            let integerValue = 1;

            // Multiply integer values
            nonVariableValues.forEach(value => {
                integerValue *= value.simplify();
            });

            // Do not print +1x or -1x (only +x or -x)
            if (integerValue === 1) {
                collectedTermString += variableValues.length > 0 ? '' : integerValue;
            }
            else if (integerValue === -1) {
                collectedTermString += variableValues.length > 0 ? '-' : integerValue;
            }
            else {
                collectedTermString += integerValue;
            }

            // Get all base and exponent of variables in the term
            mapValue.push([ integerValue, 1 ]);
            variableValues.forEach(value => {
                key += value.print({ latexFormat: false });
                mapValue.push([ value.base, value.exponent ]);
                collectedTermString += value.print();
            });

            // If a term with the same variables already exists, add this one to it.
            if (termsMap.has(key)) {
                let oldCollectedString = `${collectedTermsMap.get(key)} `;

                if (mapValue[0][0] > 0) {
                    oldCollectedString += '+ ';
                }

                // If the term has variables, do not print 1x.
                if (variableValues.length > 0) {
                    collectedTermString = collectedTermString === '1' ? oldCollectedString : `${oldCollectedString}${collectedTermString}`;
                }
                else {
                    collectedTermString = `${oldCollectedString}${collectedTermString}`;
                }
                collectedTermsMap.set(key, collectedTermString);

                // Add the integer values of like-terms
                mapValue[0][0] += termsMap.get(key)[0][0];
                termsMap.set(key, mapValue);
            }
            else {
                termsMap.set(key, mapValue);
                collectedTermsMap.set(key, collectedTermString);
                keys.push(key);
            }
        });

        /*
            Create simplified exponentiations and terms.
            And envelop collected lik-terms in parens.
        */
        keys.forEach((key, index) => {
            let finalTerm = [];

            termsMap.get(key).forEach(exponentiationArray => {
                finalTerm.push(new Exponentiation(exponentiationArray[0], exponentiationArray[1]));
            });
            if (finalTerm.length > 1) {
                finalTerm = finalTerm.filter(value => !this.isEqualEmptyValue(value));
            }
            finalTerms.push(finalTerm);

            if (index > 0) {
                this.collectedTerms += '+';
            }
            this.collectedTerms += `(${collectedTermsMap.get(key)})`;
        });

        return finalTerms;
    }

    /**
        Multiplies the polynomial by the given {Exponentiation}.
        Returns an object containing:
        * The resulting polynomial in a new {Polynomial} object.
        * A string representing the steps taken. Ex: 3(x + 2) returns: '3(x) + 3(2)' ; y(x + 2) returns: 'y(x) + y(2)'
        @method multiplyExponentiation
        @param {Exponentiation} multiplierExponentiation The {Exponentiation} by which to multiply the polynomial.
        @return {Object} Returns an object with the resulting polynomial and a string representing the steps taken.
    */
    multiplyExponentiation(multiplierExponentiation) {
        const multiplier = multiplierExponentiation.print({ latexFormat: false });
        const multiplierIsVariable = multiplierExponentiation.isVariable;
        const multiplierIsNumber = multiplierExponentiation.isNumber;
        const appendPlus = (multiplierIsVariable) || ((multiplierIsNumber) && (multiplierExponentiation.base >= 0));

        const multipliedTerms = this.simplified.map(term => {
            const basesAreNumbers = term.some(value => value.basesAreNumbers(multiplierExponentiation));
            const basesAreSameVariable = term.some(value => value.basesAreSameVariable(multiplierExponentiation));
            let nonMultiplied = term.slice(1);
            let multiplyValue = term[0];

            if (basesAreSameVariable) {
                multiplyValue = term.filter(value => value.basesAreSameVariable(multiplierExponentiation))[0];
                nonMultiplied = term.filter(value => !value.basesAreSameVariable(multiplierExponentiation));
            }
            else if (basesAreNumbers) {
                multiplyValue = term.filter(value => value.isNumber)[0];
                nonMultiplied = term.filter(value => value.isVariable);
            }

            return multiplyValue.multiply(multiplierExponentiation).concat(nonMultiplied);
        });

        const steps = this.simplified.map((term, termIndex) => {
            let step = '';

            if ((termIndex > 0) && (appendPlus)) {
                step += '+';
            }
            step += `${multiplier}(${this.print({ latex: false, latexFormat: true, simplified: true, termToPrint: termIndex })})`;

            return step;
        }).join('');

        const polynomial = new Polynomial(this.sortAlphabetically(multipliedTerms));

        return { polynomial, steps };
    }

    /**
        Multiplies the polynomial by the given terms.
        Returns an object containing:
        * The resulting polynomial in a new {Polynomial} object.
        * A string representing the steps taken. Ex: xy(x + 2) returns: 'xy(x) + xy(2)'
        @method multiplyTerm
        @param {Array} multipliers The {Exponentiation} objects by which to multiply the polynomial.
        @return {Object} Returns an object with the resulting polynomial and a string representing the steps taken.
    */
    multiplyTerm(multipliers) {
        const isNegativeMultiplier = multipliers.filter(multiplier => multiplier.isNumber).some(multiplier => multiplier.base < 0);
        const exponentiationsPrint = multipliers.map(exponentiation => exponentiation.print({ latexFormat: true }));
        const multiplierString = exponentiationsPrint.join('');
        const multipliedPolynomial = new Polynomial(this.simplified);

        multipliers.forEach(multiplier => {
            multipliedPolynomial.setTerms(multipliedPolynomial.multiplyExponentiation(multiplier).polynomial.sortAlphabetically());
        });

        const steps = this.simplified.map((term, termIndex) => {
            let step = '';

            if (termIndex > 0) {
                step += isNegativeMultiplier ? '' : '+';
            }
            step += `${multiplierString}(${this.print({ latex: false, latexFormat: true, termToPrint: termIndex })})`;

            return step;
        }).join('');

        return { polynomial: multipliedPolynomial, steps };
    }

    /**
        Multiplies the polynomial by the given {Polynomial}.
        Returns an object containing:
        * The resulting polynomial in a new {Polynomial} object
        * A string representing the steps taken. Ex: (x + 2)(y + 2) returns 'x(y) + x(2) + 2(y) + 2(2)'
        @method multiplyPolynomial
        @param {Polynomial} multiplier The {Polynomial} object by which to multiply the polynomial.
        @return {Object} An object with the resulting polynomial and a string representing the steps taken.
    */
    multiplyPolynomial(multiplier) {
        const polynomial = new Polynomial();
        const multipliedPolynomial = new Polynomial(this.simplified);

        multiplier.terms.forEach(termMultiplier => {
            polynomial.addTerms(multipliedPolynomial.multiplyTerm(termMultiplier).polynomial.terms);
        });

        const steps = multiplier.terms.map((termMultiplier, index) => {
            let step = '';
            const isNegativeMultiplier = termMultiplier.filter(exponentiation => exponentiation.isNumber)
                                                       .some(exponentiation => exponentiation.base < 0);

            if (index > 0) {
                step += isNegativeMultiplier ? '' : '+';
            }
            step += multipliedPolynomial.multiplyTerm(termMultiplier).steps;

            return step;
        }).join('');

        return { polynomial, steps };
    }

    /**
        Divides the polynomial by the given {Exponentiation}.
        Returns an object containing:
        * The resulting polynomial in a new {Polynomial} object.
        * A string representing the steps taken. Ex: 3x/x returns: '3x/x'
        @method divideExponentiation
        @param {Exponentiation} divisorExponentiation The {Exponentiation} by which to divide the polynomial.
        @return {Object} Returns an object with the resulting polynomial and a string representing the steps taken.
    */
    divideExponentiation(divisorExponentiation) {
        let steps = '';
        const divisor = divisorExponentiation.print({ latexFormat: false });
        const divisorIsVariable = divisorExponentiation.isVariable;

        const dividedTerms = this.simplified.map((term, termIndex) => {
            const hasInteger = term.some(value => !value.isVariable);
            const hasSameVariable = term.some(value => value.base === divisorExponentiation.base);
            let nonDivided = term.filter((value, index) => index !== 0);
            let divideValue = term[0];

            if (divisorIsVariable && hasSameVariable) {
                divideValue = term.find(value => value.base === divisorExponentiation.base);
                nonDivided = term.filter(value => value.base !== divisorExponentiation.base);
            }
            else if (!divisorIsVariable && hasInteger) {
                divideValue = term.find(value => !value.isVariable);
                nonDivided = term.filter(value => value.isVariable);
            }

            const dividedValues = divideValue.divide(divisorExponentiation).concat(nonDivided);

            steps += termIndex > 0 ? '+' : '';
            steps += `(${this.print({ latex: false, latexFormat: true, simplified: true, termToPrint: termIndex })})/${divisor}`;
            return dividedValues;
        });

        const polynomial = new Polynomial(dividedTerms);

        return { polynomial, steps };
    }

    /**
        Divides the polynomial by the given terms.
        Returns an object containing:
        * The resulting polynomial in a new {Polynomial} object.
        * A string representing the steps taken. Ex: (x + 2)/xy returns: '(x)/(xy) + (2)/(xy)'
        @method divideTerm
        @param {Array} dividers The {Exponentiation} objects by which to divide the polynomial.
        @return {Object} Returns an object with the resulting polynomial and a string representing the steps taken.
    */
    divideTerm(dividers) {
        const exponentiationsPrint = dividers.map(exponentiation => exponentiation.print({ latexFormat: true }));
        const dividerString = exponentiationsPrint.join('');
        let polynomial = new Polynomial(this.simplified);

        // Divide the |polynomial| by each Exponentiation in the |dividers| array.
        dividers.forEach(divider => {
            const dividedPolynomial = polynomial.divideExponentiation(divider).polynomial;

            polynomial = new Polynomial(dividedPolynomial.sortAlphabetically());
        });

        const steps = this.simplified.map((term, termIndex) => {
            const prefix = termIndex > 0 ? '+' : '';

            return `${prefix}(${this.print({ latex: false, latexFormat: true, termToPrint: termIndex })})/(${dividerString})`;
        }).join('');

        return { polynomial, steps };
    }

    /**
        Returns the greatest common factor of the polynomial.
        @method getGreatestCommonFactor
        @return {Polynomial} representing the greatest common factor.
    */
    getGreatestCommonFactor() {

        // Get largest common integer
        let commonFactors = [ 1 ];
        const factorsMap = new Map();
        const doAllTermsHaveInteger = this.simplified.every(term => term.some(value => !value.isVariable));

        // Look for common integer factor among terms
        if (doAllTermsHaveInteger) {
            const integerFactors = new Map();
            const nonVariableValues = this.simplified.map(term => term.find(value => !value.isVariable));
            const makeNegative = nonVariableValues[0].base < 0;

            /* Calculate the factors of each of the integers of the polynomial.
               12x^2 + 4x + 6: Factors of 12: 1, 2, 3, 4, 6, 12; Factors of 4: 1, 2, 4; Factors of 6: 1, 2, 3, 6
               These factors are saved in the |integerFactors| map:
               12: [ 1, 2, 3, 4, 6, 12 ]
               4: [ 1, 2, 4 ]
               6: [ 1, 2, 3, 6 ]
            */
            nonVariableValues.forEach(exponentiation => {
                if (!integerFactors.has(exponentiation.base)) {
                    const factors = [];
                    const positiveBase = Math.abs(exponentiation.base);

                    /* Find the factors of a number. Negative numbers have the same factors as their absolute value in negative form.
                        Factors of 6: 6, 3, 2, 1
                        1. 6 % 6 = 0 -> 6 is factor of 6.
                        2. 6 % 5 = 1 -> 5 is not a factor of 6.
                        3. 6 % 4 = 2 -> 4 is not a factor of 6.
                        4. 6 % 3 = 0 -> 3 is factor of 6
                        5. 6 % 2 = 0 -> 2 is factor of 6.
                        6. 6 % 1 = 0 -> 1 is factor of 6.
                        Factors of -6 will be: -6, -3, -2, -1
                    */
                    for (let factor = positiveBase; factor > 0; factor--) {
                        if (positiveBase % factor === 0) {
                            const addFactor = makeNegative ? (-1 * factor) : factor;

                            factors.push(addFactor);
                        }
                    }

                    if (factors.length !== 0) {
                        integerFactors.set(exponentiation.base, factors);
                        factorsMap.set(exponentiation.base, factors);
                    }
                }
            });

            // First get the factors of the first term, and then delete the non-common factors to the other terms.
            commonFactors = integerFactors.get(nonVariableValues[0].base);
            integerFactors.forEach(factors => {
                commonFactors = commonFactors.filter(factor => (factors.indexOf(factor) !== -1));
            });
        }

        /* Get largest common variable degree
           Get the first term variables, and build from there */
        let allCommonVariables = this.simplified[0].filter(value => value.isVariable).map(variable => variable.base);

        this.simplified.forEach(term => {
            const termVariables = term.filter(value => value.isVariable).map(variable => variable.base);

            allCommonVariables = allCommonVariables.filter(variable => (termVariables.indexOf(variable) !== -1));
        });

        // Get lowest degree from common variables
        const variableDegrees = new Map();

        allCommonVariables.forEach(variable => {
            this.simplified.forEach(term => {
                term.forEach(value => {
                    if (value.base === variable) {
                        const exponent = variableDegrees.has(variable) ?
                                        Math.min(variableDegrees.get(variable), value.exponent) : value.exponent;

                        variableDegrees.set(variable, exponent);
                    }
                });
            });
        });

        const greatestCommonFactor = [];
        const positiveCommonFactor = commonFactors.every(factor => factor >= 0);
        const integerGCF = positiveCommonFactor ? Math.max(...commonFactors) : Math.min(...commonFactors);

        greatestCommonFactor.push(new Exponentiation(integerGCF, 1));
        variableDegrees.forEach((degree, variable) => {
            greatestCommonFactor.push(new Exponentiation(variable, degree));
        });

        return { polynomial: new Polynomial([ greatestCommonFactor ]), factors: factorsMap };
    }

    /**
        Returns whether a value in the polynomial is equal to |this.emptyValue|.
        @method isEqualEmptyValue
        @param {Exponentiation} value The value to check.
        @return {Boolean} True if |value| is equal to |this.emptyValue|.
    */
    isEqualEmptyValue(value) {
        const areBaseEqual = (value.base === this.emptyValue.base);
        const areExponentEqual = (value.exponent === this.emptyValue.exponent);

        return (areBaseEqual && areExponentEqual);
    }

    /**
        Returns the string that prints the polynomial.
        @method print
        @param {Object} [args={}] Pass some arguments.
        @param {Boolean} [args.latex=true] Set to true to return a MathJax latex string.
        @param {Boolean} [args.latexFormat=args.latex] Set to true to return a latex formatted string.
        @param {Boolean} [args.simplified=true] Wheter to print the simplified polynomial or the original one.
        @return {String}
    */
    print(args = {}) {
        args.latex = 'latex' in args ? args.latex : true;
        args.latexFormat = 'latexFormat' in args ? args.latexFormat : args.latex;
        args.simplified = 'simplified' in args ? args.simplified : true;
        args.termToPrint = 'termToPrint' in args ? args.termToPrint : -1;

        const envelopLatex = require('utilities').envelopLatex;
        let toPrint = args.simplified ? this.simplified.slice() : this.terms.slice();

        if (args.termToPrint !== -1) {
            toPrint = [ toPrint[args.termToPrint] ];
        }
        let printString = '';

        toPrint.forEach((term, termIndex) => {
            const multipliesByZero = term.some(value => value.base === 0);

            if (!multipliesByZero) {
                const hasVariable = term.some(value => value.isVariable);
                let negativeMultiplication = false;
                let previousIsStandaloneNumber = false;

                term.forEach((value, index) => {
                    const standaloneNumber = value.isNumber;
                    const notFirstTerm = termIndex !== 0;
                    const firstValue = index === 0;
                    const positiveValue = (value.isNumber && value.base > 0);

                    // Adds the '+' between terms
                    if (notFirstTerm && firstValue && (positiveValue || value.isVariable)) {
                        printString += '+';
                    }

                    // Do not print things like 1x or 1*1 or the like.
                    if ((!firstValue || (firstValue && hasVariable)) && (this.isEqualEmptyValue(value))) {
                        return;
                    }

                    // If previous value was a standalone number, then multiply with the next one.
                    if ((previousIsStandaloneNumber) && (value.isNumber) && (value.base !== 1)) {
                        printString += args.latexFormat ? '\\cdot' : '*';
                    }

                    // Do not print '-1x', only '-x'
                    if ((standaloneNumber) && (value.base === -1) && (hasVariable)) {
                        if (!firstValue) {
                            printString += '(';
                            negativeMultiplication = true;
                        }
                        printString += '-';
                    }
                    else {
                        printString += value.print({ latexFormat: args.latexFormat });
                        printString += negativeMultiplication ? ')' : '';
                        negativeMultiplication = false;
                    }

                    previousIsStandaloneNumber = standaloneNumber;
                });
            }
        });

        return args.latex ? envelopLatex(printString) : printString;
    }
}

const PolynomialExport = {
    Exponentiation,
    Polynomial,
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
};

module.exports = PolynomialExport;
