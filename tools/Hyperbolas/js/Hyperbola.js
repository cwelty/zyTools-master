/* exported Hyperbola */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    A hyperbola, it's features and characteristics.
    @class Hyperbola
*/
class Hyperbola {

    /**
        Create a new Hyperbola.
        Standard graphing form: ((x - h)^2 / a^2) - ((y - k)^2 / b^2) = 1 or ((y - k)^2 / a^2) - ((x - h)^2 / b^2) = 1
        @constructor
        @param {Object} [args] Set some arguments for the hyperbola.
        @param {Boolean} [args.integerDistance=false] Set to true to ensure that the distance is an integer number.
        @param {Boolean} [args.forceHorizontal=false] Make the hyperbola horizontal.
        @param {Boolean} [args.forceVertical=false] Make the hyperbola vertical.
    */
    constructor(args = { integerDistance: false, forceHorizontal: false, forceVertical: false }) {
        const utilities = require('utilities');
        const pickNumberInRange = utilities.pickNumberInRange;
        const makeLatexFraction = utilities.makeLatexFraction;

        this.isHorizontal = utilities.flipCoin();
        if (args.forceHorizontal) {
            this.isHorizontal = true;
        }
        else if (args.forceVertical) {
            this.isHorizontal = false;
        }

        this.hValue = pickNumberInRange(-6, 6, [ 0 ]);
        this.hSubtraction = utilities.stringifyConstantValue(-1 * this.hValue, false, true).replace(utilities.subtractionSymbol, '-');
        this.kValue = pickNumberInRange(-6, 6, [ 0, this.hValue ]);
        this.kSubtraction = utilities.stringifyConstantValue(-1 * this.kValue, false, true).replace(utilities.subtractionSymbol, '-');

        // Ensure a > b
        if (args.integerDistance) {
            const distanceSquare = [];

            for (let index = 5; index < 10; ++index) {
                distanceSquare.push(Math.pow(index, 2));
            }
            this.aSquared = pickNumberInRange(2, 24);
            this.bSquared = utilities.pickElementFromArray(distanceSquare) - this.aSquared;
            this.aValue = Math.sqrt(this.aSquared);
            this.bValue = Math.sqrt(this.bSquared);
        }
        else {
            const someValue = pickNumberInRange(2, 8, [ this.hValue, this.kValue ]);
            const someOtherValue = pickNumberInRange(2, 8, [ this.hValue, this.kValue, someValue ]);

            this.aValue = someValue > someOtherValue ? someValue : someOtherValue;
            this.bValue = someValue > someOtherValue ? someOtherValue : someValue;
            this.aSquared = Math.pow(this.aValue, 2);
            this.bSquared = Math.pow(this.bValue, 2);
        }

        this.center = `${this.hValue},${this.kValue}`;
        this.distance = Math.sqrt(this.aSquared + this.bSquared);
        this.distanceAddition = utilities.stringifyConstantValue(this.distance, false, true).replace(utilities.subtractionSymbol, '-');
        this.distanceSubtraction = utilities.stringifyConstantValue(-this.distance, false, true).replace(utilities.subtractionSymbol, '-');

        this.standardGraphingForm = `${makeLatexFraction('(y - k)^2', 'a^2', { large: true })} - ` +
                                    `${makeLatexFraction('(x - h)^2', 'b^2', { large: true })} = 1\\\\`;
        this.asymptotesValues = [ this.aValue / this.bValue, -this.aValue / this.bValue ];
        this.asymptotes = [ makeLatexFraction(this.aValue, this.bValue, { large: true }),
                            makeLatexFraction(-this.aValue, this.bValue, { large: true }) ];
        this.foci = [ `${this.hValue},${this.kValue + this.distance}`, `${this.hValue},${this.kValue - this.distance}` ];
        this.vertices = [ `${this.hValue},${this.kValue + this.aValue}`, `${this.hValue},${this.kValue - this.aValue}` ];

        if (this.isHorizontal) {
            this.standardGraphingForm = `${makeLatexFraction('(x - h)^2', 'a^2', { large: true })} - ` +
                                        `${makeLatexFraction('(y - k)^2', 'b^2', { large: true })} = 1\\\\`;
            this.asymptotesValues = [ this.bValue / this.aValue, -this.bValue / this.aValue ];
            this.asymptotes = [ makeLatexFraction(this.bValue, this.aValue, { large: true }),
                                makeLatexFraction(-this.bValue, this.aValue, { large: true }) ];
            this.foci = [ `${this.hValue + this.distance},${this.kValue}`, `${this.hValue - this.distance},${this.kValue}` ];
            this.vertices = [ `${this.hValue + this.aValue},${this.kValue}`, `${this.hValue - this.aValue},${this.kValue}` ];
        }
        this.standardGraphingForm = utilities.envelopLatex(this.standardGraphingForm);
    }

    /**
        Returns the LaTeX string that prints the hyperbola in standard graphing form.
        @method print
        @return {String}
    */
    print() {
        const envelopLatex = require('utilities').envelopLatex;
        const makeLatexFraction = require('utilities').makeLatexFraction;

        const numeratorX = `(x${this.hSubtraction})^2`;
        const numeratorY = `(y${this.kSubtraction})^2`;
        let firstFraction = makeLatexFraction(numeratorY, `${this.aSquared}`, { large: true });
        let secondFraction = makeLatexFraction(numeratorX, `${this.bSquared}`, { large: true });

        if (this.isHorizontal) {
            firstFraction = makeLatexFraction(numeratorX, `${this.aSquared}`, { large: true });
            secondFraction = makeLatexFraction(numeratorY, `${this.bSquared}`, { large: true });
        }

        return envelopLatex(`${firstFraction} - ${secondFraction} = 1`);
    }
}
