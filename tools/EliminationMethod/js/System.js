/* exported System */
/* global plusOrMinus, manageAddition */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    A System stores information about a system of equations.
    @class System
*/
class System {

    /**
        Create a new system of equations.
        @constructor
    */
    constructor() {
        const pickNumberInRange = require('utilities').pickNumberInRange;

        this.firstXProduct = 1;
        this.secondXProduct = pickNumberInRange(2, 4);
        const ratio = this.secondXProduct / this.firstXProduct;

        this.firstYProduct = pickNumberInRange(-5, 5, [ 0, this.firstXProduct, this.secondXProduct ]);
        this.secondYProduct = pickNumberInRange(-5, 5, [ 0, this.firstXProduct, this.secondXProduct, this.firstYProduct,
                                                        this.firstYProduct * ratio, this.firstYProduct * -1 ]);

        this.firstRightSide = pickNumberInRange(-5, 5, [ 0, this.firstXProduct, this.firstYProduct ]);
        this.secondRightSide = (this.secondXProduct * this.firstYProduct * -1) + this.secondYProduct -
                                (this.secondXProduct * this.firstRightSide * -1);

        this.update();
    }

    /**
        Updates a system of equations.
        When some values have been changed, the system has to recalculate the strings.
        @method update
        @return {void}
    */
    update() {
        const multiplicationSymbol = '\\cdot';

        this.addFirstXProduct = manageAddition(this.firstXProduct, 'x', '');
        this.addSecondXProduct = manageAddition(this.secondXProduct, 'x');
        this.addSecondXProductNoSign = manageAddition(this.secondXProduct, 'x', '');
        this.addFirstYProduct = manageAddition(this.firstYProduct, 'y');
        this.addSecondYProduct = manageAddition(this.secondYProduct, 'y');
        this.addFirstRightSide = manageAddition(this.firstRightSide, '');
        this.addSecondRightSide = manageAddition(this.secondRightSide, '');

        this.addingEquations = `${this.addFirstXProduct} ${this.addSecondXProduct}` +
                               `${this.addFirstYProduct} ${this.addSecondYProduct} &=` +
                               `${this.firstRightSide} ${this.addSecondRightSide}`;

        this.addedEquations = `${this.firstXProduct + this.secondXProduct}x` +
                                `${manageAddition(this.firstYProduct + this.secondYProduct, 'y')} &=` +
                                `${this.firstRightSide + this.secondRightSide}`;

        this.isolateFirstYProduct = manageAddition(-1 * this.firstYProduct, 'y');
        this.firstEquation = `${this.addFirstXProduct} ${this.addFirstYProduct} &= ${this.firstRightSide}`;
        this.secondEquation = `${this.addSecondXProductNoSign} ${this.addSecondYProduct} &= ${this.secondRightSide}`;

        this.isolateFirstEquation = `x = ${this.firstRightSide} ${this.isolateFirstYProduct}`;
        this.substitutedSecondEquation = `${this.secondXProduct}${multiplicationSymbol} ( ${this.firstRightSide}` +
                                        `${this.isolateFirstYProduct} )${this.addSecondYProduct}` +
                                        `&= ${this.secondRightSide}`;
        this.substitutedSecondEquationY = (this.secondXProduct * -1 * this.firstYProduct) + this.secondYProduct;
        this.susbtitutedSecondEquationConstants = this.secondXProduct * this.firstRightSide;

        const substitutedY = this.secondXProduct * this.firstYProduct * -1;
        const substitutedRightSide = this.secondXProduct * this.firstRightSide;
        const solveForY = `${substitutedRightSide}${plusOrMinus(substitutedY)}${Math.abs(substitutedY)}y` +
                            `${this.addSecondYProduct}&=${this.secondRightSide}`;

        this.solveForY = solveForY;

        const simplifiedSolveForY = `${substitutedY + this.secondYProduct}y &=` +
                                    `${-1 * substitutedRightSide + this.secondRightSide}`;

        this.simplifiedSolveForY = simplifiedSolveForY;
    }
}
