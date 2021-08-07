/* exported Parabola */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    A Parabola the features and characteristics of a Parabola.
    @class Parabola
*/
class Parabola {

    /**
        Create a new Parabola.
        Standard graphing form: y = a(x - h)^2 + k
        p is the distance from the vertex to the focus. Also, p = 1/4a
        @constructor
        @param {Object} [args] Arguments that define some of the parabola's features.
        @param {Boolean} [args.ensureIntegerP=false] Set to true if the created parabola has to have an integer value for p.
        @param {Boolean} [args.ensureIntegerA=false] Set to true if the created parabola has to have an integer value for a.
    */
    constructor(args = { ensureIntegerP: false, ensureIntegerA: false }) {
        const pickNumberInRange = require('utilities').pickNumberInRange;
        const makeLatexFraction = require('utilities').makeLatexFraction;
        const utilities = new (require('utilities').constructor);

        this.aDenominator = pickNumberInRange(-4, 4, [ -1, 0, 1 ]);
        this.aNumerator = 1;
        if (args.ensureIntegerP) {
            this.aDenominator = require('utilities').pickElementFromArray([ -16, -12, -8, -4, 4, 8, 12, 16 ]);
        }
        else if (args.ensureIntegerA) {
            this.aDenominator = 1;
            this.aNumerator = pickNumberInRange(-4, 4, [ -1, 0, 1 ]);
        }
        this.aLatex = makeLatexFraction(this.aNumerator, this.aDenominator);
        this.aValue = this.aNumerator / this.aDenominator;

        this.kValue = pickNumberInRange(-4, 4, [ 0, this.aDenominator ]);
        this.kAddition = utilities.stringifyConstantValue(this.kValue, false, true).replace(utilities.subtractionSymbol, '-');
        this.kSubtraction = utilities.stringifyConstantValue((-1) * this.kValue, false, true).replace(utilities.subtractionSymbol, '-');

        this.hValue = pickNumberInRange(-4, 4, [ 0, this.aDenominator, this.kValue ]);
        this.hAddition = utilities.stringifyConstantValue(this.hValue, false, true).replace(utilities.subtractionSymbol, '-');
        this.hSubtraction = utilities.stringifyConstantValue((-1) * this.hValue, false, true).replace(utilities.subtractionSymbol, '-');

        this.axisOfSymmetry = this.hValue;
        this.vertex = `${this.hValue},${this.kValue}`;
        this.pValue = 1 / (4 * (this.aNumerator / this.aDenominator));
        this.pLatexFraction = makeLatexFraction(1, (4 * (this.aNumerator / this.aDenominator)));
        this.fourPLatexFraction = makeLatexFraction(1, this.aValue);
        this.pAddition = utilities.stringifyConstantValue(this.pValue, false, true).replace(utilities.subtractionSymbol, '-');
        this.pSubtraction = utilities.stringifyConstantValue((-1) * this.pValue, false, true).replace(utilities.subtractionSymbol, '-');
        this.directrix = this.kValue - this.pValue;
        this.focus = `${this.hValue},${this.kValue + this.pValue}`;
    }

    /**
        Returns the string that prints the parabola.
        @method print
        @param {Object} [args] Pass some arguments.
        @param {Boolean} [args.latex=true] Set to true to return latex formatted string.
        @param {Boolean} [args.horizontal=false] Whether this is a horizontal parabola.
        @return {String}
    */
    print(args = { latex: true, horizontal: false }) {
        const envelopLatex = require('utilities').envelopLatex;
        let printValue = `${args.horizontal ? 'x' : 'y'}=`;

        printValue += args.latex ? this.aLatex : this.aValue;
        printValue += args.horizontal ? `(y${this.kSubtraction})^2${this.hAddition}` : `(x${this.hSubtraction})^2${this.kAddition}`;

        return args.latex ? envelopLatex(printValue) : printValue;
    }
}
