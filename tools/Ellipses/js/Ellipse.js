/* exported Ellipse */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    An Ellipse, it's features and characteristics.
    @class Ellipse
*/
class Ellipse {

    /**
        Create a new Ellipse.
        Standard graphing form: ((x - h)^2 / a^2) + ((y - k)^2 / b^2) = 1 or ((x - h)^2 / b^2) + ((y - k)^2 / a^2) = 1
        @constructor
        @param {Boolean} [integerDistance=false] Set to true to ensure that the distance is an integer number.
        @param {Number} [hValue=null] The value of h in the Ellipse. It will be random if it's equal to null.
        @param {Number} [kValue=null] The value of k in the Ellipse. It will be random if it's equal to null.
    */
    constructor(integerDistance = false, hValue = null, kValue = null) {
        const utilities = require('utilities');
        const pickNumberInRange = utilities.pickNumberInRange;
        const makeLatexFraction = utilities.makeLatexFraction;

        const xNumerator = '(x - h)^2';
        const yNumerator = '(y - k)^2';

        this.standardGraphingForm = `${makeLatexFraction(xNumerator, 'b^2', { large: true })} + ` +
                                    `${makeLatexFraction(yNumerator, 'a^2', { large: true })} = 1\\\\`;
        this.isHorizontal = utilities.flipCoin();
        if (this.isHorizontal) {
            this.standardGraphingForm = `${makeLatexFraction(xNumerator, 'a^2', { large: true })} + ` +
                                        `${makeLatexFraction(yNumerator, 'b^2', { large: true })} = 1\\\\`;
        }
        this.standardGraphingForm = utilities.envelopLatex(this.standardGraphingForm);

        // Get random values
        if (hValue === null) {
            this.hValue = pickNumberInRange(-4, 4, [ 0 ]);
            this.kValue = pickNumberInRange(-4, 4, [ 0, this.hValue ]);
        }
        else {
            this.hValue = hValue;
            this.kValue = kValue;
        }
        this.hSubtraction = utilities.stringifyConstantValue(-1 * this.hValue, false, true).replace(utilities.subtractionSymbol, '-');
        this.kSubtraction = utilities.stringifyConstantValue(-1 * this.kValue, false, true).replace(utilities.subtractionSymbol, '-');

        // Ensure a > b
        if (integerDistance) {
            const distanceSquare = [];

            for (let index = 2; index < 4; ++index) {
                distanceSquare.push(Math.pow(index, 2));
            }
            this.aSquared = pickNumberInRange(17, 40);
            this.bSquared = this.aSquared - utilities.pickElementFromArray(distanceSquare);
            this.aValue = Math.sqrt(this.aSquared);
            this.bValue = Math.sqrt(this.bSquared);
        }
        else {
            const someValue = pickNumberInRange(2, 6, [ this.hValue, this.kValue ]);
            const someOtherValue = pickNumberInRange(2, 6, [ this.hValue, this.kValue, someValue ]);

            this.aValue = someValue > someOtherValue ? someValue : someOtherValue;
            this.bValue = someValue > someOtherValue ? someOtherValue : someValue;
            this.aSquared = Math.pow(this.aValue, 2);
            this.bSquared = Math.pow(this.bValue, 2);
        }

        this.center = `${this.hValue},${this.kValue}`;
        this.semiMajorAxis = this.aValue;
        this.semiMinorAxis = this.bValue;
        this.distance = Math.sqrt(this.aSquared - this.bSquared);

        this.foci = [];
        if (this.isHorizontal) {
            this.foci = [ `${this.hValue + this.distance},${this.kValue}`, `${this.hValue - this.distance},${this.kValue}` ];
        }
        else {
            this.foci = [ `${this.hValue},${this.kValue + this.distance}`, `${this.hValue},${this.kValue - this.distance}` ];
        }

        this.vertex = [];

        // Semi major axis in x-coordinate
        if (this.isHorizontal) {
            this.vertex = [ `${this.hValue - this.semiMajorAxis},${this.kValue}`, `${this.hValue + this.semiMajorAxis},${this.kValue}`,
                            `${this.hValue},${this.kValue - this.semiMinorAxis}`, `${this.hValue},${this.kValue + this.semiMinorAxis}` ];
        }

        // Semi major axis in y-coordinate
        else {
            this.vertex = [ `${this.hValue - this.semiMinorAxis},${this.kValue}`, `${this.hValue + this.semiMinorAxis},${this.kValue}`,
                            `${this.hValue},${this.kValue - this.semiMajorAxis}`, `${this.hValue},${this.kValue + this.semiMajorAxis}` ];
        }

        /**
            Converts the given axis value to the width needed to graph the ellipse.
            @method _axisToWidth
            @param {Number} value The value of the axis.
            @return {Number} The width value needed to graph the ellipse with bezier curves.
        */
        this._axisToWidth = function(value) {
            return (((value * 2) / 0.75) / 2);
        };
    }

    /**
        Returns the LaTeX string that prints the ellipse in standard graphing form.
        @method print
        @return {String}
    */
    print() {
        const envelopLatex = require('utilities').envelopLatex;
        const makeLatexFraction = require('utilities').makeLatexFraction;

        const numeratorX = `(x${this.hSubtraction})^2`;
        const numeratorY = `(y${this.kSubtraction})^2`;
        let firstFraction = makeLatexFraction(numeratorX, `${this.bSquared}`, { large: true });
        let secondFraction = makeLatexFraction(numeratorY, `${this.aSquared}`, { large: true });

        if (this.isHorizontal) {
            firstFraction = makeLatexFraction(numeratorX, `${this.aSquared}`, { large: true });
            secondFraction = makeLatexFraction(numeratorY, `${this.bSquared}`, { large: true });
        }

        return envelopLatex(`${firstFraction} + ${secondFraction} = 1`);
    }

    /**
        Returns points for 2 bezier curves than represent the ellipse in a graph.
        Follows this method for the bezier curves: http://stackoverflow.com/a/14171221/3290971
        @method graphPoints
        @return {Array}
    */
    graphPoints() {
        const width = this.isHorizontal ? this._axisToWidth(this.semiMajorAxis) : this._axisToWidth(this.semiMinorAxis);
        const height = this.isHorizontal ? this.semiMinorAxis : this.semiMajorAxis;

        /*  This is supposed to represent an ellipse. My ascii-art habilities go as far as this.
            The first half goes from point A1 to A2, it does not reach C1 and C2, but those points define the curve.
            The second half goes from points A2 to A1, it does not reach C3 and C4, but those points define the curve.
                    A2
                    __
        C3   -> *  /  \  * <-  C2
                  |    |
                  |    |
        C4   -> *  \__/  * <-  C1
                    A1
        */
        //                |___A1___|      |_____C1_____|  |_____C2____|  |___A2__|
        const half1 = [ [ 0, -height ], [ width, -height, width, height, 0, height ] ];

        //                |___A2__|      |_____C3_____|  |______C4_____|  |___A1___|
        const half2 = [ [ 0, height ], [ -width, height, -width, -height, 0, -height ] ];

        // Move ellipse to it's real position (center is not 0,0)
        half1[0][0] += this.hValue;
        half1[0][1] += this.kValue;
        half2[0][0] += this.hValue;
        half2[0][1] += this.kValue;
        for (let index = 0; index < 5; index += 2) {
            half1[1][index] += this.hValue;
            half1[1][index + 1] += this.kValue;
            half2[1][index] += this.hValue;
            half2[1][index + 1] += this.kValue;
        }

        return [ half1, half2 ];
    }
}
