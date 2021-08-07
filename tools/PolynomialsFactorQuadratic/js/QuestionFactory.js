/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER, calculateFactors, getNonPrimeNumber */
/* exported buildQuestionFactoryPrototype */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Factory that makes {Question}s.
    @class QuestionFactory
    @extends singleInputQuestionProgressionTool.QuestionFactory
    @constructor
    @param {String} toolID Unique id for this tool.
*/
function QuestionFactory(toolID) {
    this.numberOfQuestions = 5;
    this.toolID = toolID;
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
        };

        return new Question(levelIndexToQuestion[currentLevelIndex](), this.toolID);
    };

    /**
        Builds a question of level 1. Enter all the factors of certain number.
        Ex: 20 ; Answer: (1, 20), (2, 10), (4, 5)
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const randomNumber = getNonPrimeNumber();
        const factors = calculateFactors(randomNumber, false);
        const expectedAnswer = factors.factorsArray;
        const factorsString = factors.factorsString;

        const placeholder = 'Ex: (1, 21), (3, 7)';
        const prompt = `Enter the positive factors of ${envelopLatex(randomNumber)}`;
        const validAnswerExplanation = VALID_ANSWER.FACTORS;
        const explanation = `Expected: ${factorsString}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Enter the factors that add to certain number.
        Ex: Factors of 10 that sum to -7 ; Answer: (-2, -5)
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const randomNumber = getNonPrimeNumber();
        const factors = calculateFactors(randomNumber);
        const factorsArray = factors.factorsArray;
        const factorsString = factors.factorsString;

        // Avoid the easy ones. Ex: Factors of 10 that sum to 11 or factors of 10 that sum to -11
        const chooseRandomly = pickNumberInRange(1, factorsArray.length - 1, [ factorsArray.length / 2 ]);
        const expectedAnswer = [ factorsArray[chooseRandomly] ];
        const expectedString = `${factorsArray[chooseRandomly][0]}, ${factorsArray[chooseRandomly][1]}`;
        const addTo = factorsArray[chooseRandomly][0] + factorsArray[chooseRandomly][1];

        const placeholder = 'Ex: (1, 9)';
        const prompt = `Enter the factors of ${envelopLatex(randomNumber)} that add to ${addTo}`;
        const validAnswerExplanation = VALID_ANSWER.FACTOR;
        const explanation = `Expected: (${expectedString})${newLine}` +
                            `Factors of ${randomNumber}: ${factorsString}${newLine}` +
                            `Factors that add to ${addTo}: (${expectedString})`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Enter one of the binomials that make a quadratic expression.
        Ex: x^2 - 12x + 10 -> (x - 2)(?) ; Answer: x - 10
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const randomNumber = getNonPrimeNumber();
        const factors = calculateFactors(randomNumber);
        const factorsArray = factors.factorsArray;
        const factorsString = factors.factorsString;

        // Avoid the easy ones. Ex: Factors of 10 that sum to 11 or factors of 10 that sum to -11
        const chooseRandomly = pickNumberInRange(1, factorsArray.length - 1, [ factorsArray.length / 2 ]);
        const addTo = factorsArray[chooseRandomly][0] + factorsArray[chooseRandomly][1];

        const quadratic = new Polynomial([ [ new Exponentiation('x', 2) ],
                                           [ new Exponentiation(addTo, 1), new Exponentiation('x', 1) ],
                                           [ new Exponentiation(randomNumber, 1) ] ]);
        const binomial1 = new Polynomial([ [ new Exponentiation('x', 1) ],
                                           [ new Exponentiation(factorsArray[chooseRandomly][0], 1) ] ]);
        const binomial2 = new Polynomial([ [ new Exponentiation('x', 1) ],
                                           [ new Exponentiation(factorsArray[chooseRandomly][1], 1) ] ]);

        const inputPrefix = envelopLatex(`(${binomial1.print({ latex: false, latexFormat: true })})(`);
        const expectedAnswer = binomial2.print({ latex: false });
        const placeholder = 'Ex: x + 12';
        const prompt = `Enter the missing binomial factoring the quadratic expression.${newLine}` +
                       `${quadratic.print()}`;
        const validAnswerExplanation = VALID_ANSWER.SIMPLE_POLYNOMIAL;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Expression of form ${envelopLatex('x^2 + bx + c')}${newLine}` +
                            `Find factors of c [c = ${randomNumber}]: ${factorsString}${newLine}` +
                            `Factors that add to b [b = ${addTo}]: ` +
                            `(${factorsArray[chooseRandomly][0]}, ${factorsArray[chooseRandomly][1]})${newLine}` +
                            `Rewrite factors as a product of binomials: (${binomial1.print()})(${binomial2.print()})`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix: ')', placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Factor into a product of binomials.
        Ex: x^2 - 6x + 8    ;   Answer: (x - 2)(x - 4)
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const randomNumber = getNonPrimeNumber();
        const factors = calculateFactors(randomNumber);
        const factorsArray = factors.factorsArray;
        const factorsString = factors.factorsString;

        // Avoid the easy ones. Ex: Factors of 10 that sum to 11 or factors of 10 that sum to -11
        const chooseRandomly = pickNumberInRange(1, factorsArray.length - 1, [ factorsArray.length / 2 ]);
        const addTo = factorsArray[chooseRandomly][0] + factorsArray[chooseRandomly][1];

        const quadratic = new Polynomial([ [ new Exponentiation('x', 2) ],
                                           [ new Exponentiation(addTo, 1), new Exponentiation('x', 1) ],
                                           [ new Exponentiation(randomNumber, 1) ] ]);
        const binomial1 = new Polynomial([ [ new Exponentiation('x', 1) ],
                                           [ new Exponentiation(factorsArray[chooseRandomly][0], 1) ] ]);
        const binomial2 = new Polynomial([ [ new Exponentiation('x', 1) ],
                                           [ new Exponentiation(factorsArray[chooseRandomly][1], 1) ] ]);

        const expectedAnswer = [ `(${binomial1.print({ latex: false })})(${binomial2.print({ latex: false })})`,
                                 `(${binomial2.print({ latex: false })})(${binomial1.print({ latex: false })})` ];
        const placeholder = 'Ex: (x + 3)(x - 7)';
        const prompt = `Factor the polynomial into a product of binomials.${newLine}` +
                       `${quadratic.print()}`;
        const validAnswerExplanation = VALID_ANSWER.BINOMIAL_PRODUCT;
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}${newLine}` +
                            `Expression of form ${envelopLatex('x^2 + bx + c')}${newLine}` +
                            `Find factors of c [c = ${randomNumber}]: ${factorsString}${newLine}` +
                            `Factors that add to b [b = ${addTo}]: ` +
                            `(${factorsArray[chooseRandomly][0]}, ${factorsArray[chooseRandomly][1]})${newLine}` +
                            `Rewrite factors as a product of binomials: (${binomial1.print()})(${binomial2.print()})`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Enter the greatest common factor.
        Ex: 6x^5 + 4x^4 + 10x^3 ; Answer: 2x^3
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const multiplyBy = pickNumberInRange(2, 6);
        const integers = [ 2, 3, 5 ];

        utilities.shuffleArray(integers);

        const terms = [ [ new Exponentiation(integers[0], 1), new Exponentiation('x', 2) ],
                        [ new Exponentiation(integers[1], 1), new Exponentiation('x', 1) ],
                        [ new Exponentiation(integers[2], 1) ] ];
        const polynomial = new Polynomial(terms);
        const randomVariableDegree = pickNumberInRange(1, 4);
        const multiplyResult = polynomial.multiplyTerm([ new Exponentiation(multiplyBy, 1),
                                                         new Exponentiation('x', randomVariableDegree) ]);
        const multipliedPolynomial = multiplyResult.polynomial;
        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;
        const steps = envelopLatex(`${gcf.print({ latex: false, latexFormat: true })}` +
                      `(${polynomial.print({ latex: false, latexFormat: true })})`);

        const placeholder = 'Ex: 8x^5';
        const prompt = `Factor out the GCF to convert the polynomial into a quadratic trinomial.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const expectedAnswer = gcf.print({ latex: false });
        const validAnswerExplanation = VALID_ANSWER.TERM;
        const explanation = `Expected: ${gcf.print()}${newLine}` +
                            `Largest common integer: ${multiplyBy}${newLine}` +
                            `Highest common x degree: ${randomVariableDegree}${newLine}` +
                            `${multipliedPolynomial.print()}${newLine}` +
                            `${steps}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };
}
