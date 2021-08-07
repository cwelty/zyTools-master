/* exported Exponentiation */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    An object that defines the raising of a number to the power of another.
    @class Exponentiation
*/
class Exponentiation {

    /**
        @constructor
        @param {Number} base The base of the Exponentiation.
        @param {Number} [exponent=1] The exponent of the Exponentiation.
    */
    constructor(base, exponent = 1) {
        this.base = base;
        this.exponent = exponent;
        this.isVariable = typeof base === 'string';
        this.isNumber = typeof base === 'number';
        this.degree = this.isVariable ? this.exponent : 0;
    }

    /**
        Multiply by another {Exponentiation}. Ex: x^2 * 2 = 2x^2
        @method multiply
        @param {Exponentiation} multiplier The {Exponentiation} by which to multiply this one.
        @return {Array} An Array of {Exponentiation} resulting from the multiplication. Ex: x^2 * 2 = [2, x^2]
    */
    multiply(multiplier) {
        const multipliedValue = [];

        if (this.basesAreNumbers(multiplier)) {
            multipliedValue.push(new Exponentiation(this.simplify() * multiplier.simplify(), 1));
        }
        else if (this.basesAreSameVariable(multiplier)) {
            if (this.base === multiplier.base) {
                multipliedValue.push(new Exponentiation(this.base, this.exponent + multiplier.exponent));
            }
        }
        else {
            multipliedValue.push(new Exponentiation(this.base, this.exponent));
            multipliedValue.push(new Exponentiation(multiplier.base, multiplier.exponent));
        }

        return multipliedValue;
    }

    /**
        Divide by another {Exponentiation}. Ex: x^2 / x = x
        @method divide
        @param {Exponentiation} divisor The {Exponentiation} by which to divide this one.
        @return {Array} An Array of {Exponentiation} resulting from the division. Ex: x^2 / 2 = [1/2, x^2]
    */
    divide(divisor) {
        const areNumbers = !this.isVariable && !divisor.isVariable;
        const areVariables = this.isVariable && divisor.isVariable;
        const areSameVariable = this.base === divisor.base;
        const dividedValue = [];

        if (areNumbers) {
            dividedValue.push(new Exponentiation(this.simplify() / divisor.simplify()));
        }
        else if (areVariables && areSameVariable) {
            if (this.exponent - divisor.exponent === 0) {
                dividedValue.push(new Exponentiation(1));
            }
            else {
                dividedValue.push(new Exponentiation(this.base, this.exponent - divisor.exponent));
            }
        }
        else {
            dividedValue.push(new Exponentiation(this.base, this.exponent));
            if (divisor.isVariable) {
                dividedValue.push(new Exponentiation(divisor.base, -1 * divisor.exponent));
            }
            else {
                dividedValue.push(new Exponentiation(1 / divisor.base));
            }
        }

        return dividedValue;
    }

    /**
        Returns the simplified value of the {Exponentiation}. Ex: 2^2 = 4, 5^3 = 125.
        Returns null if it's not possible to simplify.
        @return {Number}
    */
    simplify() {
        if (!this.isVariable) {
            return Math.pow(this.base, this.exponent === 0 ? 1 : this.exponent);
        }
        return null;
    }

    /**
        Returns the string that prints the exponentiation.
        @method print
        @param {Object} [args] Pass some arguments.
        @param {Boolean} [args.latexFormat=true] Set to true to return latex formatted string.
            Beware: The returned string still needs to be enveloped by the latex prefix and postfix.
        @return {String}
    */
    print(args = { latexFormat: true }) {
        const shouldPrintExponent = this.exponent !== 1;
        let printString = this.base;

        if (shouldPrintExponent) {
            printString += '^';
            printString += args.latexFormat ? `{${this.exponent}}` : `(${this.exponent})`;
        }

        return printString;
    }

    /**
        Returns whether |otherExponentiation.base| is the same variable as |this.base|.
        @method basesAreSameVariable
        @param {Exponentiation} otherExponentiation The other {Exponentiation} with which to compare |this.base|.
        @return {Boolean} True if both bases are the same variable. False if bases are different, or either one is not a variable.
    */
    basesAreSameVariable(otherExponentiation) {
        return this.isVariable ? this.base === otherExponentiation.base : false;
    }

    /**
        Returns wheter |otherExponentiation.base| and |this.base| are both numbers.
        @method basesAreNumbers
        @param {Exponentiation} otherExponentiation The other {Exponentiation} with which to compare |this.base|.
        @return {Boolean} True if both bases are numbers.
    */
    basesAreNumbers(otherExponentiation) {
        return this.isNumber && otherExponentiation.isNumber;
    }
}
