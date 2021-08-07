/* exported Circle */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    A Circle, it's features and characteristics.
    @class Circle
*/
class Circle {

    /**
        Create a new Circle.
        Standard graphing form: (x - h)^2 + (y - k)^2 = r^2
        @constructor
    */
    constructor() {
        const pickNumberInRange = require('utilities').pickNumberInRange;

        this.hValue = pickNumberInRange(-6, 6, [ 0 ]);
        this.hAddition = this.stringify(this.hValue);
        this.hSubtraction = this.stringify(-1 * this.hValue);
        this.kValue = pickNumberInRange(-6, 6, [ 0, this.hValue ]);
        this.kAddition = this.stringify(this.kValue);
        this.kSubtraction = this.stringify(-1 * this.kValue);

        this.radius = pickNumberInRange(2, 7);
        this.radiusSquared = Math.pow(this.radius, 2);

        this.center = `${this.hValue},${this.kValue}`;
    }

    /**
        Returns the string that prints the circle in standard graphing form.
        @method print
        @param {Boolean} [useLatex=true] Set to true to return latex formatted string.
        @return {String}
    */
    print(useLatex = true) {
        const envelopLatex = require('utilities').envelopLatex;
        const printValue = `(x${this.hSubtraction})^2+(y${this.kSubtraction})^2=${this.radiusSquared}`;

        return (useLatex ? envelopLatex(printValue) : printValue);
    }

    /**
        Returns a stringified version of the constant. This method encapsulates the utilities.stringifyConstantValue
        and replaces the minus sign returned by it with a normal minus sign.
        @method stringify
        @param {Number} constant Constant value to return in string format.
        @return {String}
    */
    stringify(constant) {
        const utilities = require('utilities');

        return utilities.stringifyConstantValue(constant, false, true).replace(utilities.subtractionSymbol, '-');
    }
}
