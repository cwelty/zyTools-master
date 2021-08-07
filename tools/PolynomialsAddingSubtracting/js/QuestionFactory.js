/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER */
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
    this.numberOfQuestions = 6;
}

/**
    Build {QuestionFactory}'s prototype after dependencies have loaded.
    @method buildQuestionFactoryPrototype
    @return {void}
*/
function buildQuestionFactoryPrototype() {
    QuestionFactory.prototype = require('singleInputQuestionProgressionTool').getNewQuestionFactory();
    QuestionFactory.prototype.constructor = QuestionFactory;

    const utilities = require('utilities');
    const newLine = utilities.getNewline();
    const pickNumberInRange = utilities.pickNumberInRange;
    const envelopLatex = utilities.envelopLatex;
    const shuffleArray = utilities.shuffleArray;

    const Polynomial = require('Polynomial').Polynomial;
    const Exponentiation = require('Polynomial').Exponentiation;

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    QuestionFactory.prototype.make = function(currentLevelIndex) {
        const levelIndexToQuestion = {
            0: this._levelOne,
            1: this._levelTwo,
            2: this._levelThree,
            3: this._levelFour,
            4: this._levelFive,
            5: this._levelSix,
        };

        return new Question(levelIndexToQuestion[currentLevelIndex]());
    };

    /**
        Builds a question of level 1. Adding single-variable polynomials.
        Ex: 3x^2 + 1 + 2x^2 ; Answer: 5x^2 + 1
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const integerOne = pickNumberInRange(1, 4);
        const integerTwo = pickNumberInRange(1, 4, [ integerOne ]);
        const variableDegree = pickNumberInRange(1, 4);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', variableDegree) ],
                        [ new Exponentiation(pickNumberInRange(1, 9), 1) ],
                        [ new Exponentiation(integerTwo, 1), new Exponentiation('x', variableDegree) ] ];

        const polynomial = new Polynomial(terms);
        const standardPolynomial = new Polynomial(polynomial.standarize());
        const placeholder = 'Ex: x^2 + 5';
        const prompt = `Combine like terms. Write in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.SIMPLE_POLYNOMIAL;
        const expectedAnswer = standardPolynomial.print({ latex: false, simplified: true });
        const expectedAnswerLatex = standardPolynomial.print({ latex: true, simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Like terms are collected and combined into a single term:${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${envelopLatex(polynomial.collectedTerms)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Adding single-variable polynomials.
        Ex: 9x^4 + 2x + 6x^4 + 4x^5 + 3x^5 ; Answer: 7x^5 + 15x^4 + 2x
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const degreeOne = pickNumberInRange(2, 5);
        const degreeTwo = pickNumberInRange(2, 5, [ degreeOne ]);
        const integerOne = pickNumberInRange(1, 9);
        const integerTwo = pickNumberInRange(1, 9, [ integerOne ]);
        const integerThree = pickNumberInRange(1, 9, [ integerOne, integerTwo ]);
        const integerFour = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree ]);
        const integerFive = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree, integerFour ]);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerThree, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerFour, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerFive, 1), new Exponentiation('x', 1) ] ];

        shuffleArray(terms);
        const polynomial = new Polynomial(terms);
        const standardPolynomial = new Polynomial(polynomial.standarize());
        const placeholder = 'Ex: 4x^6 + x^2 + x';
        const prompt = `Combine like terms. Write in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;
        const expectedAnswer = standardPolynomial.print({ latex: false, simplified: true });
        const expectedAnswerLatex = standardPolynomial.print({ latex: true, simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Like terms are collected and combined into a single term:${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${envelopLatex(polynomial.collectedTerms)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Adding and subtracting single-variable polynomials.
        Ex: 5 - 2x^2 + 2x^4 + 8x^2 - 6x^4 ; Answer: -4x^4 + 6x^2 + 5
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const degreeOne = pickNumberInRange(2, 5);
        const degreeTwo = pickNumberInRange(2, 5, [ degreeOne ]);
        const integerOne = pickNumberInRange(-9, -1);
        const integerTwo = pickNumberInRange(1, 9, [ -1 * integerOne ]);
        const integerThree = pickNumberInRange(-9, -1, [ integerOne ]);
        const integerFour = pickNumberInRange(1, 9, [ integerTwo, -1 * integerThree ]);
        const integerFive = pickNumberInRange(-6, 6, [ 0, integerOne, integerTwo, integerThree, integerFour ]);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerThree, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerFour, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerFive, 1) ] ];

        shuffleArray(terms);
        const polynomial = new Polynomial(terms);
        const standardPolynomial = new Polynomial(polynomial.standarize());
        const placeholder = 'Ex: 12x^3 + 9x^2 + 8';
        const prompt = `Combine like terms. Write in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;
        const expectedAnswer = standardPolynomial.print({ latex: false, simplified: true });
        const expectedAnswerLatex = standardPolynomial.print({ latex: true, simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Like terms are collected and combined into a single term:${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${envelopLatex(polynomial.collectedTerms)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Adding single-variable polynomials (combine more than 2 terms).
        Ex: 6x^3 + 5x^3 + 9x + 2x + 8x^3 + x ; Answer: 19x^3 + 12x
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const degreeOne = pickNumberInRange(1, 5);
        const degreeTwo = pickNumberInRange(1, 5, [ degreeOne ]);
        const integerOne = pickNumberInRange(1, 9);
        const integerTwo = pickNumberInRange(1, 9, [ integerOne ]);
        const integerThree = pickNumberInRange(1, 9, [ integerOne, integerTwo ]);
        const integerFour = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree ]);
        const integerFive = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree, integerFour ]);
        const integerSix = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree, integerFour, integerFive ]);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerThree, 1), new Exponentiation('x', degreeOne) ],
                        [ new Exponentiation(integerFour, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerFive, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerSix, 1), new Exponentiation('x', degreeTwo) ] ];

        shuffleArray(terms);
        const polynomial = new Polynomial(terms);
        const standardPolynomial = new Polynomial(polynomial.standarize());
        const placeholder = 'Ex: 12x^3 + 9x^2';
        const prompt = `Combine like terms. Write in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;
        const expectedAnswer = standardPolynomial.print({ latex: false, simplified: true });
        const expectedAnswerLatex = standardPolynomial.print({ latex: true, simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Like terms are collected and combined into a single term:${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${envelopLatex(polynomial.collectedTerms)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Adding multiple-variable polynomials
        Ex: 5x^2y + 7y + 8x^2 + 2x^2y + 9x^2y ; Answer: 16x^2y + 8x^2 + 7y
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const degreeX = pickNumberInRange(1, 2);
        const degreeY = pickNumberInRange(1, 2, [ degreeX ]);
        const integerOne = pickNumberInRange(1, 9);
        const integerTwo = pickNumberInRange(1, 9, [ integerOne ]);
        const integerThree = pickNumberInRange(1, 9, [ integerOne, integerTwo ]);
        const integerFour = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree ]);
        const integerFive = pickNumberInRange(1, 9, [ integerOne, integerTwo, integerThree, integerFour ]);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', degreeX), new Exponentiation('y', degreeY) ],
                        [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degreeX), new Exponentiation('y', degreeY) ],
                        [ new Exponentiation(integerThree, 1), new Exponentiation('x', degreeX), new Exponentiation('y', degreeY) ],
                        [ new Exponentiation(integerFour, 1), new Exponentiation('x', 2) ],
                        [ new Exponentiation(integerFive, 1), new Exponentiation('y', 1) ] ];

        shuffleArray(terms);
        const polynomial = new Polynomial(terms);
        const standardPolynomial = new Polynomial(polynomial.standarize());
        const placeholder = 'Ex: 3x^2y + 12x^2 + 9y';
        const prompt = `Combine like terms. Write in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE;
        const expectedAnswer = standardPolynomial.print({ latex: false, simplified: true });
        const expectedAnswerLatex = standardPolynomial.print({ latex: true, simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Like terms are collected and combined into a single term:${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${envelopLatex(polynomial.collectedTerms)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 6. Adding and subtracting multiple-variable polynomials.
        Ex: 7y + 6 − 3x^2y + 1 + 3x^2y − 5x^4 + 5x^2y ; Answer: −5x^4 + 5x^2y + 7y + 7
        @method _levelSix
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelSix = function() {
        const degreeOneX = pickNumberInRange(1, 2);
        const degreeOneY = pickNumberInRange(1, 2, [ degreeOneX ]);
        const degreeTwo = pickNumberInRange(1, 4, [ degreeOneX + degreeOneY ]);
        const degreeThree = pickNumberInRange(1, 4, [ degreeOneX + degreeOneY ]);
        const integerOne = pickNumberInRange(-9, 9, [ 0 ]);
        const integerTwo = pickNumberInRange(-9, 9, [ 0, integerOne ]);
        const integerThree = pickNumberInRange(-9, 9, [ 0, integerOne, integerTwo, -1 * (integerOne + integerTwo) ]);
        const integerFour = pickNumberInRange(-9, 9, [ 0, integerOne, integerTwo, integerThree ]);
        const integerFive = pickNumberInRange(-9, 9, [ 0, integerOne, integerTwo, integerThree, integerFour, -1 * integerFour ]);
        const integerSix = pickNumberInRange(-9, 9, [ 0, integerOne, integerTwo, integerThree, integerFour, integerFive ]);
        const integerSeven = pickNumberInRange(-9, 9, [ 0, integerOne, integerTwo, integerThree, integerFour, integerFive, integerSix ]);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', degreeOneX), new Exponentiation('y', degreeOneY) ],
                        [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degreeOneX), new Exponentiation('y', degreeOneY) ],
                        [ new Exponentiation(integerThree, 1), new Exponentiation('x', degreeOneX), new Exponentiation('y', degreeOneY) ],
                        [ new Exponentiation(integerFour, 1) ],
                        [ new Exponentiation(integerFive, 1) ],
                        [ new Exponentiation(integerSix, 1), new Exponentiation('x', degreeTwo) ],
                        [ new Exponentiation(integerSeven, 1), new Exponentiation('y', degreeThree) ] ];

        shuffleArray(terms);
        const polynomial = new Polynomial(terms);
        const standardPolynomial = new Polynomial(polynomial.standarize());
        const placeholder = 'Ex: 6xy^2 - 12x^2 + 9y - 2';
        const prompt = `Combine like terms. Write in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE;
        const expectedAnswer = standardPolynomial.print({ latex: false, simplified: true });
        const expectedAnswerLatex = standardPolynomial.print({ latex: true, simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Like terms are collected and combined into a single term:${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${envelopLatex(polynomial.collectedTerms)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };
}
