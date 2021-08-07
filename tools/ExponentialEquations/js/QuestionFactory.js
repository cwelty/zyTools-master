/* global Question, buildQuestionFactoryPrototype, */
/* exported buildQuestionFactoryPrototype */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Factory that makes {Question}s.
    @class QuestionFactory
    @extends singleInputQuestionProgressionTool.QuestionFactory
    @constructor
*/
function QuestionFactory() {
    this.numberOfQuestions = 5;
}

/**
    Build {QuestionFactory}'s prototype after dependencies have loaded.
    @method buildQuestionFactoryPrototype
    @return {void}
*/
function buildQuestionFactoryPrototype() {
    QuestionFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    QuestionFactory.prototype.constructor = QuestionFactory;

    const newLine = require('utilities').getNewline();
    const pickNumberInRange = require('utilities').pickNumberInRange;
    const pickElementFromArray = require('utilities').pickElementFromArray;
    const makeLatexFraction = require('utilities').makeLatexFraction;

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    QuestionFactory.prototype.make = function(currentLevelIndex) {
        const latexPrefix = '\\(';
        const latexPostfix = '\\)';
        const latexEndLine = '\\\\[3pt]';
        const beginAlign = '\\begin{align}';
        const endAlign = '\\end{align}';
        const inputPrefix = `${latexPrefix}x =${latexPostfix}`;
        const placeholder = 'Ex: 9';
        let promptLeftSide = '';
        let promptRightSide = '';
        let expectedAnswer = '';
        let explanation = '';

        switch (currentLevelIndex) {

            // Factorize to match bases. Ex: 3^x = 81 solves to x = 4
            case 0: {
                const base = pickNumberInRange(2, 4);
                const exponent = pickNumberInRange(2, 4, [ base ]);
                const rightSide = Math.pow(base, exponent);

                expectedAnswer = exponent;
                promptLeftSide = `${latexPrefix}${this._makeLatexExponent(base, 'x')}=${latexPostfix}`;
                promptRightSide = latexPrefix + rightSide + latexPostfix;

                // The '&' symbol indicates where should LaTeX align the equations.
                explanation = `Right side is factored to match left side's base. Equate the exponents, then solve for x:${newLine}` +
                            `${latexPrefix}${beginAlign}${this._makeLatexExponent(base, 'x')}&=${rightSide}${latexEndLine}` +
                            `${this._makeLatexExponent(base, 'x')}&=${this._makeLatexExponent(base, expectedAnswer)}${latexEndLine}` +
                            `x &=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            // Equate exponents, then solve. Ex: 4^(2x+8) = 4^12 solves to x = 2
            case 1: {
                const base = pickNumberInRange(2, 4);
                const product = pickNumberInRange(2, 4, [ base ]);
                const addition = pickNumberInRange(1, 8, [ base, product ]);
                const exponent = `${product}x +${addition}`;

                expectedAnswer = pickNumberInRange(2, 4);
                const rightSidePower = product * expectedAnswer + addition;

                promptLeftSide = `${latexPrefix}${this._makeLatexExponent(base, exponent)}=${latexPostfix}`;
                promptRightSide = latexPrefix + this._makeLatexExponent(base, rightSidePower) + latexPostfix;

                explanation = `The bases are already equal. Equate the exponents, then solve for x:${newLine}` +
                            `${latexPrefix}${beginAlign}${this._makeLatexExponent(base, exponent)}&=` +
                            `${this._makeLatexExponent(base, rightSidePower)}${latexEndLine}` +
                            `${exponent}&=${rightSidePower}${latexEndLine}` +
                            `${product}x &=${rightSidePower}-${addition}${latexEndLine}` +
                            `x &=${makeLatexFraction(rightSidePower - addition, product)}${latexEndLine}` +
                            `x &=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            // Power in denominator becomes negative power. Ex: 6^x = 1/36 solves to x = -2
            case 2: {
                const base = pickNumberInRange(2, 7);
                let exponent = 2;

                if (base === 2) {
                    exponent = pickNumberInRange(3, 5);
                }
                else if (base <= 4) {
                    exponent = pickNumberInRange(2, 3);
                }

                const rightSide = Math.pow(base, exponent);

                expectedAnswer = -1 * exponent;

                promptLeftSide = `${latexPrefix}${this._makeLatexExponent(base, 'x')}=${latexPostfix}`;
                promptRightSide = latexPrefix + makeLatexFraction(1, rightSide, { large: true }) + latexPostfix;

                explanation = 'An exponent in the bottom of a fraction becomes a negative power. ' +
                            `Match the bases, equate the exponents, then solve for x:${newLine}` +
                            `${latexPrefix}${beginAlign}${this._makeLatexExponent(base, 'x')}&=` +
                            `${makeLatexFraction(1, rightSide)}${latexEndLine}` +
                            `${this._makeLatexExponent(base, 'x')}&=` +
                            `${makeLatexFraction(1, this._makeLatexExponent(base, exponent))}${latexEndLine}` +
                            `${this._makeLatexExponent(base, 'x')}&=${this._makeLatexExponent(base, expectedAnswer)}${latexEndLine}` +
                            `x &=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            // Factorize left side. Ex: 4^x = 2^6 solves to x = 3
            case 3: {
                const base = pickNumberInRange(2, 4);
                const baseSquare = Math.pow(base, 2);

                expectedAnswer = pickNumberInRange(2, 5, [ base ]);
                const power = expectedAnswer * 2;

                promptLeftSide = `${latexPrefix}${this._makeLatexExponent(baseSquare, 'x')}=${latexPostfix}`;
                promptRightSide = latexPrefix + this._makeLatexExponent(base, power) + latexPostfix;

                explanation = `Left-side is factored to match bases. Once bases match, equate the exponents, then solve for x:${newLine}` +
                            `${latexPrefix}${beginAlign}${this._makeLatexExponent(baseSquare, 'x')}&=` +
                            `${this._makeLatexExponent(base, power)}${latexEndLine}` +
                            `${this._makeLatexExponent(base, '2x')}&=${this._makeLatexExponent(base, power)}${latexEndLine}` +
                            `2x &=${power}${latexEndLine}` +
                            `x &=${makeLatexFraction(power, 2)}${latexEndLine}` +
                            `x &=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            // Combination of levels 2 and 3. Ex: 5^(2x+3) = 1/5 solves to x = -2
            case 4: {
                const base = pickNumberInRange(2, 5);
                const product = pickNumberInRange(2, 5, [ base ]);
                const possibleAdditions = [ (product - 1), (2 * product - 1), (3 * product - 1) ];
                const index = possibleAdditions.indexOf(base);

                // Remove |base| from |possibleAdditions| to avoid repeating numbers
                if (index > -1) {
                    possibleAdditions.splice(index, 1);
                }
                const add = pickElementFromArray(possibleAdditions);
                const exponent = `${product}x +${add}`;

                expectedAnswer = (-1 - add) / product;
                promptLeftSide = `${latexPrefix}${this._makeLatexExponent(base, exponent)}=${latexPostfix}`;
                promptRightSide = latexPrefix + makeLatexFraction(1, base, { large: true }) + latexPostfix;

                explanation = `Match the bases, equate the exponents, then solve for x:${newLine}` +
                            `${latexPrefix}${beginAlign}${this._makeLatexExponent(base, exponent)}&=` +
                            `${makeLatexFraction(1, base)}${latexEndLine}` +
                            `${this._makeLatexExponent(base, exponent)}&=${this._makeLatexExponent(base, -1)}${latexEndLine}` +
                            `${exponent}&= -1${latexEndLine}` +
                            `${product}x &= -1 -${add}${latexEndLine}` +
                            `x &=${makeLatexFraction((-1 - add), product)}${latexEndLine}` +
                            `x &=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            default: {
                throw new Error(`Level ${currentLevelIndex} does not exist`);
            }
        }

        return new Question(promptLeftSide, promptRightSide, expectedAnswer, explanation, placeholder, inputPrefix);
    };

    /**
        Return LaTeX for an exponential.
        @method _makeLatexExponent
        @param {Number} base The base.
        @param {Object} exponent The exponent, may be a {Number} or a {String}.
        @return {String} LaTeX with base and exponent.
    */
    QuestionFactory.prototype._makeLatexExponent = function(base, exponent) {
        return `${base}^{${exponent}}`;
    };
}
