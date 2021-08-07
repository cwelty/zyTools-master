/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER */
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
        Builds a question of level 1. Factor each group.
        Ex: (9xy + 24x) + (12y + 32)    ;   Answer: 3x(3y + 8) + 4(3y + 8)
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const variable = utilities.flipCoin() ? 'x' : 'y';
        const otherVariable = variable === 'x' ? 'y' : 'x';
        const firstInteger = pickNumberInRange(1, 5);
        const secondInteger = pickNumberInRange(1, 10, [ firstInteger ]);
        const multiplyFirstInteger = pickNumberInRange(2, 4);
        const multiplySecondInteger = pickNumberInRange(2, 4, [ multiplyFirstInteger ]);

        const polynomial = new Polynomial([ [ new Exponentiation(firstInteger), new Exponentiation(variable) ],
                                            [ new Exponentiation(secondInteger) ] ]);
        const multiplyTerm1 = [ new Exponentiation(multiplyFirstInteger), new Exponentiation(otherVariable) ];
        const multiplyTerm2 = [ new Exponentiation(multiplySecondInteger) ];

        const multiplied1 = polynomial.multiplyTerm(multiplyTerm1).polynomial;
        const multiplied2 = polynomial.multiplyTerm(multiplyTerm2).polynomial;
        const gcf1 = multiplied1.getGreatestCommonFactor().polynomial;
        const gcf2 = multiplied2.getGreatestCommonFactor().polynomial;
        const promptPolynomial = envelopLatex(`(${multiplied1.print({ latex: false, latexFormat: true })}) +` +
                                              `(${multiplied2.print({ latex: false, latexFormat: true })})`);
        const nonLatexPolynomial = `(${multiplied1.print({ latex: false })}) +` +
                                   `(${multiplied2.print({ latex: false })})`;

        const expectedAnswer = [ `${gcf1.print({ latex: false })}` +
                                 `(${multiplied1.divideTerm(gcf1.terms[0]).polynomial.print({ latex: false })})+` +
                                 `${gcf2.print({ latex: false })}` +
                                 `(${multiplied2.divideTerm(gcf2.terms[0]).polynomial.print({ latex: false })})`,
                                 `${gcf2.print({ latex: false })}` +
                                 `(${multiplied1.divideTerm(gcf1.terms[0]).polynomial.print({ latex: false })})+` +
                                 `${gcf1.print({ latex: false })}` +
                                 `(${multiplied2.divideTerm(gcf2.terms[0]).polynomial.print({ latex: false })})` ];
        const placeholder = 'Ex: 2x(6y + 1) + 5(6y + 1)';
        const prompt = `Find the greatest common factor of each grouping.${newLine}` +
                       `${promptPolynomial}`;
        const validAnswerExplanation = VALID_ANSWER.GROUPING_GCF;
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}`;

        return { expectedAnswer, explanation, placeholder, polynomial: nonLatexPolynomial, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Factor across groups.
        Ex: 5x(7y + 2) - 2(7y + 2)  ;   Answer: (7y + 2)(5x - 2)
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const variable = utilities.flipCoin() ? 'x' : 'y';
        const otherVariable = variable === 'x' ? 'y' : 'x';
        const integers = utilities.pickNElementsFromArray([ 1, 2, 3, 5, 7 ], 2);
        const multiplyFirstInteger = pickNumberInRange(2, 6);
        const multiplySecondInteger = pickNumberInRange(-6, -2);

        const multiplyTerm1 = new Polynomial([ [ new Exponentiation(multiplyFirstInteger), new Exponentiation(otherVariable) ] ]);
        const multiplyTerm2 = new Polynomial([ [ new Exponentiation(multiplySecondInteger) ] ]);

        const binomial1 = new Polynomial([ [ new Exponentiation(integers[0]), new Exponentiation(variable) ],
                                           [ new Exponentiation(integers[1]) ] ]);
        const binomial2 = new Polynomial([ [ new Exponentiation(multiplyFirstInteger), new Exponentiation(otherVariable) ],
                                           [ new Exponentiation(multiplySecondInteger) ] ]);

        const promptPolynomial = envelopLatex(`${multiplyTerm1.print({ latex: false, latexFormat: true })}` +
                                              `(${binomial1.print({ latex: false, latexFormat: true })})` +
                                              `${multiplyTerm2.print({ latex: false, latexFormat: true })}` +
                                              `(${binomial1.print({ latex: false, latexFormat: true })})`);
        const nonLatexPolynomial = `${multiplyTerm1.print({ latex: false })}` +
                                   `(${binomial1.print({ latex: false })})` +
                                   `${multiplyTerm2.print({ latex: false })}` +
                                   `(${binomial1.print({ latex: false })})`;

        const expectedAnswer = [ `(${binomial1.print({ latex: false })})(${binomial2.print({ latex: false })})`,
                                 `(${binomial2.print({ latex: false })})(${binomial1.print({ latex: false })})` ];
        const placeholder = 'Ex: (6y + 1)(2x + 5)';
        const prompt = `Factor GCF across groups.${newLine}` +
                       `${promptPolynomial}`;
        const validAnswerExplanation = VALID_ANSWER.BINOMIAL_PRODUCT;
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}`;

        return { expectedAnswer, explanation, placeholder, polynomial: nonLatexPolynomial, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Factor the polynomial.
        Ex: 6xy - 12y - 4x + 8  ;   Answer: (x - 2)(6y - 4)
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const mainVariable = utilities.flipCoin() ? 'x' : 'y';
        const secondaryVariable = mainVariable === 'x' ? 'y' : 'x';
        const numbers = utilities.pickNNumbersInRange(2, 6, 4).map(number => {   // eslint-disable-line arrow-body-style
            return utilities.flipCoin() ? number : -1 * number;
        });

        let binomial1 = new Polynomial([ [ new Exponentiation(numbers[0]), new Exponentiation(mainVariable) ],
                                         [ new Exponentiation(numbers[1]) ] ]);
        let binomial2 = new Polynomial([ [ new Exponentiation(numbers[2]), new Exponentiation(secondaryVariable) ],
                                         [ new Exponentiation(numbers[3]) ] ]);

        const polynomial = binomial1.multiplyPolynomial(binomial2).polynomial;

        const pairs = [ new Polynomial([ polynomial.terms[0], polynomial.terms[1] ]),
                        new Polynomial([ polynomial.terms[2], polynomial.terms[3] ]) ];

        const gcf1 = pairs[0].getGreatestCommonFactor().polynomial;
        const gcf2 = pairs[1].getGreatestCommonFactor().polynomial;

        binomial1 = pairs[0].divideTerm(gcf1.terms[0]).polynomial;
        binomial2 = new Polynomial([ gcf1.terms[0], gcf2.terms[0] ]);

        const negativeBinomial1 = binomial1.multiplyExponentiation(new Exponentiation(-1)).polynomial;
        const negativeBinomial2 = binomial2.multiplyExponentiation(new Exponentiation(-1)).polynomial;
        const expectedAnswer = [ `(${binomial1.print({ latex: false })})(${binomial2.print({ latex: false })})`,
                                 `(${binomial2.print({ latex: false })})(${binomial1.print({ latex: false })})`,
                                 `(${negativeBinomial1.print({ latex: false })})(${negativeBinomial2.print({ latex: false })})`,
                                 `(${negativeBinomial2.print({ latex: false })})(${negativeBinomial1.print({ latex: false })})` ];

        const groupPairs = envelopLatex(`(${pairs[0].print({ latex: false, latexFormat: true })})+` +
                                        `(${pairs[1].print({ latex: false, latexFormat: true })})`);

        const addPlus = gcf2.terms[0][0].base >= 0 ? '+' : '';
        const gcfFromPairs = envelopLatex(`${gcf1.print({ latex: false, latexFormat: true })}` +
                                          `(${binomial1.print({ latex: false, latexFormat: true })})` +
                                          `${addPlus}${gcf2.print({ latex: false, latexFormat: true })}` +
                                          `(${binomial1.print({ latex: false, latexFormat: true })})`);

        const placeholder = 'Ex: (6y + 1)(2x + 5)';
        const prompt = `Factor the polynomial by grouping.${newLine}` +
                       `${polynomial.print()}`;
        const validAnswerExplanation = VALID_ANSWER.BINOMIAL_PRODUCT;
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}${newLine}` +
                            `${polynomial.print()}${newLine}` +
                            `Group terms into pairs:${newLine}` +
                            `${groupPairs}${newLine}` +
                            `Find GCF from each pair:${newLine}` +
                            `${gcfFromPairs}${newLine}` +
                            `Factor GCF across groups:${newLine}` +
                            `${envelopLatex(expectedAnswer[0])}`;

        return { expectedAnswer, explanation, placeholder, polynomial: polynomial.print({ latex: false }), prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Factor high order polynomial.
        Ex: 3y^3 + 5y^2 + 12y + 20  ;   Answer: (3y + 5)(y^2 + 4)
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const variable = utilities.flipCoin() ? 'x' : 'y';
        const numbers = utilities.pickNNumbersInRange(2, 6, 4);

        let binomial1 = new Polynomial([ [ new Exponentiation(numbers[0]), new Exponentiation(variable) ],
                                         [ new Exponentiation(numbers[1]) ] ]);
        let binomial2 = new Polynomial([ [ new Exponentiation(numbers[2]), new Exponentiation(variable, 2) ],
                                         [ new Exponentiation(numbers[3]) ] ]);

        const polynomial = binomial1.multiplyPolynomial(binomial2).polynomial;

        const pairs = [ new Polynomial([ polynomial.terms[0], polynomial.terms[1] ]),
                        new Polynomial([ polynomial.terms[2], polynomial.terms[3] ]) ];

        const gcf1 = pairs[0].getGreatestCommonFactor().polynomial;
        const gcf2 = pairs[1].getGreatestCommonFactor().polynomial;

        binomial1 = pairs[0].divideTerm(gcf1.terms[0]).polynomial;
        binomial2 = new Polynomial([ gcf1.terms[0], gcf2.terms[0] ]);

        const expectedAnswer = [ `(${binomial1.print({ latex: false })})(${binomial2.print({ latex: false }).replace(/[()]/g, '')})`,
                                 `(${binomial2.print({ latex: false }).replace(/[()]/g, '')})(${binomial1.print({ latex: false })})` ];
        const expectedAnswerLatex = envelopLatex(`(${binomial1.print({ latex: false, latexFormat: true })})` +
                                                 `(${binomial2.print({ latex: false, latexFormat: true })})`);

        const groupPairs = envelopLatex(`(${pairs[0].print({ latex: false, latexFormat: true })})+` +
                                        `(${pairs[1].print({ latex: false, latexFormat: true })})`);

        const addPlus = gcf2.terms[0][0].base >= 0 ? '+' : '';
        const gcfFromPairs = envelopLatex(`${gcf1.print({ latex: false, latexFormat: true })}` +
                                          `(${binomial1.print({ latex: false, latexFormat: true })})` +
                                          `${addPlus}${gcf2.print({ latex: false, latexFormat: true })}` +
                                          `(${binomial1.print({ latex: false, latexFormat: true })})`);

        const placeholder = `Ex: ${'(8x + 4)(7x^2 + 1)'.replace('x', variable)}`;
        const prompt = `Factor the polynomial by grouping.${newLine}` +
                       `${polynomial.print()}`;
        const validAnswerExplanation = VALID_ANSWER.FACTOR_HIGH_ORDER;
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `${polynomial.print()}${newLine}` +
                            `Group terms into pairs:${newLine}` +
                            `${groupPairs}${newLine}` +
                            `Find GCF from each pair:${newLine}` +
                            `${gcfFromPairs}${newLine}` +
                            `Factor GCF across groups:${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, polynomial: polynomial.print({ latex: false }), prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Factor high order polynomial.
        Ex: 20x^3 - 4x^2 - 15x + 3  ;   Answer: (5x - 1)(4x^2 - 3)
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const variable = utilities.flipCoin() ? 'x' : 'y';
        const numbers = utilities.pickNNumbersInRange(2, 6, 4).map(number => {   // eslint-disable-line arrow-body-style
            return utilities.flipCoin() ? number : -1 * number;
        });

        let binomial1 = new Polynomial([ [ new Exponentiation(numbers[0]), new Exponentiation(variable) ],
                                         [ new Exponentiation(numbers[1]) ] ]);
        let binomial2 = new Polynomial([ [ new Exponentiation(numbers[2]), new Exponentiation(variable, 2) ],
                                         [ new Exponentiation(numbers[3]) ] ]);

        const polynomial = binomial1.multiplyPolynomial(binomial2).polynomial;

        const pairs = [ new Polynomial([ polynomial.terms[0], polynomial.terms[1] ]),
                        new Polynomial([ polynomial.terms[2], polynomial.terms[3] ]) ];

        const gcf1 = pairs[0].getGreatestCommonFactor().polynomial;
        const gcf2 = pairs[1].getGreatestCommonFactor().polynomial;

        binomial1 = pairs[0].divideTerm(gcf1.terms[0]).polynomial;
        binomial2 = new Polynomial([ gcf1.terms[0], gcf2.terms[0] ]);

        const negativeBinomial1 = binomial1.multiplyExponentiation(new Exponentiation(-1)).polynomial;
        const negativeBinomial2 = binomial2.multiplyExponentiation(new Exponentiation(-1)).polynomial;
        const expectedAnswer = [ `(${binomial1.print({ latex: false })})(${binomial2.print({ latex: false }).replace(/[()]/g, '')})`,
                                 `(${binomial2.print({ latex: false }).replace(/[()]/g, '')})(${binomial1.print({ latex: false })})`,

                                 `(${negativeBinomial1.print({ latex: false })})` +
                                 `(${negativeBinomial2.print({ latex: false }).replace(/[()]/g, '')})`,

                                 `(${negativeBinomial2.print({ latex: false }).replace(/[()]/g, '')})` +
                                 `(${negativeBinomial1.print({ latex: false })})` ];

        const expectedAnswerLatex = envelopLatex(`(${binomial1.print({ latex: false, latexFormat: true })})` +
                                                 `(${binomial2.print({ latex: false, latexFormat: true })})`);

        const groupPairs = envelopLatex(`(${pairs[0].print({ latex: false, latexFormat: true })})+` +
                                        `(${pairs[1].print({ latex: false, latexFormat: true })})`);

        const addPlus = gcf2.terms[0][0].base >= 0 ? '+' : '';
        const gcfFromPairs = envelopLatex(`${gcf1.print({ latex: false, latexFormat: true })}` +
                                          `(${binomial1.print({ latex: false, latexFormat: true })})` +
                                          `${addPlus}${gcf2.print({ latex: false, latexFormat: true })}` +
                                          `(${binomial1.print({ latex: false, latexFormat: true })})`);

        const placeholder = `Ex: ${'(8x + 4)(7x^2 + 1)'.replace('x', variable)}`;
        const prompt = `Factor the polynomial by grouping.${newLine}` +
                       `${polynomial.print()}`;
        const validAnswerExplanation = VALID_ANSWER.FACTOR_HIGH_ORDER;
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `${polynomial.print()}${newLine}` +
                            `Group terms into pairs:${newLine}` +
                            `${groupPairs}${newLine}` +
                            `Find GCF from each pair:${newLine}` +
                            `${gcfFromPairs}${newLine}` +
                            `Factor GCF across groups:${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, polynomial: polynomial.print({ latex: false }), prompt, validAnswerExplanation };
    };
}
