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
    this.numberOfQuestions = 6;
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
            5: this._levelSix,
        };

        return new Question(levelIndexToQuestion[currentLevelIndex](), this.toolID);
    };

    /**
        Builds a question of level 1. Multiply single-variable polynomials by positive constant.
        Ex: 4(2x^2 + 1) ; Answer: 8x^2 + 4
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const integerOne = pickNumberInRange(1, 4);
        const integerTwo = pickNumberInRange(1, 4, [ integerOne ]);
        const multiplyFactor = pickNumberInRange(2, 5, [ integerOne, integerTwo ]);
        const variableDegree = pickNumberInRange(1, 2);
        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation('x', variableDegree) ],
                        [ new Exponentiation(integerTwo, 1) ] ];

        const exponentiationMultiplier = new Exponentiation(multiplyFactor, 1);
        const polynomial = new Polynomial(terms);
        const expectedPolynomial = polynomial.multiplyExponentiation(exponentiationMultiplier).polynomial;
        const placeholder = 'Ex: x^2 + 5';
        const prompt = `Multiply.${newLine}` +
                       `${envelopLatex(`${multiplyFactor}(`)}${polynomial.print({ simplified: false })}${envelopLatex(')')}`;
        const validAnswerExplanation = VALID_ANSWER.SIMPLE_POLYNOMIAL;
        const expectedAnswer = expectedPolynomial.print({ latex: false });
        const expectedAnswerLatex = expectedPolynomial.print({ simplified: true });
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            'Multiply the single term with each polynomial term.';

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Multiply single-variable polynomials by negative constant.
        Ex: 3x^3 − 3(2x^3 − 2) ; Answer: -3x^3 + 6
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const degree = pickNumberInRange(1, 3);
        const multiplyFactor = pickNumberInRange(-1, -4);
        const integerOne = pickNumberInRange(2, 9);
        const integerTwo = pickNumberInRange(1, 5, [ multiplyFactor, integerOne, -1 * (integerOne / multiplyFactor) ]);
        const integerThree = pickNumberInRange(-1, -5, [ multiplyFactor, integerOne, integerTwo ]);
        const standaloneTerm = [ new Exponentiation(integerOne, 1), new Exponentiation('x', degree) ];
        const terms = [ [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degree) ],
                        [ new Exponentiation(integerThree, 1) ] ];

        const exponentiationMultiplier = new Exponentiation(multiplyFactor, 1);
        const polynomial = new Polynomial(terms);
        const expectedPolynomial = new Polynomial([ standaloneTerm ]);
        const multiplySteps = polynomial.multiplyExponentiation(exponentiationMultiplier).steps;

        expectedPolynomial.addTerms(polynomial.multiplyExponentiation(exponentiationMultiplier).polynomial.terms);

        const standaloneTermString = standaloneTerm[0].print() + standaloneTerm[1].print();
        const fullPolynomialPrint = envelopLatex(`${standaloneTermString}${multiplyFactor}(` +
                                                 `${polynomial.print({ latex: false, latexFormat: true })})`);
        const placeholder = 'Ex: x^2 + 2';
        const prompt = `Multiply and simplify${newLine}` +
                       `${fullPolynomialPrint}`;
        const validAnswerExplanation = VALID_ANSWER.SIMPLE_POLYNOMIAL;
        const expectedAnswer = expectedPolynomial.print({ latex: false });
        const expectedAnswerLatex = expectedPolynomial.print();
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Multiply the negative term with each polynomial term:${newLine}` +
                            `${fullPolynomialPrint}${newLine}` +
                            `${envelopLatex(standaloneTermString + multiplySteps)}${newLine}` +
                            `${expectedPolynomial.print({ simplified: false })}${newLine}` +
                            `Combine like terms and write in standard form.${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Multiply single-variable polynomials by variable.
        Ex: 3x^2 + 4x(2x + 5) − 4 ; Answer: 11x^2 + 20x - 4
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const degree = pickNumberInRange(2, 3);
        const multiplyFactor = pickNumberInRange(2, 4);
        const integerOne = pickNumberInRange(-5, 5, [ 0, multiplyFactor ]);
        const integerTwo = pickNumberInRange(-5, 5, [ 0, multiplyFactor, integerOne, -1 * (integerOne / multiplyFactor) ]);
        const integerThree = pickNumberInRange(-5, 5, [ 0, multiplyFactor, integerOne, integerTwo ]);
        const addingConstant = pickNumberInRange(-9, 9, [ 0, multiplyFactor, integerOne, integerTwo,
                                                          integerThree, -1 * (integerThree / multiplyFactor) ]);
        const addingExponentiation = new Exponentiation(addingConstant, 1);
        const standaloneTerm = [ new Exponentiation(integerOne, 1), new Exponentiation('x', degree) ];
        const multiplierTerm = [ new Exponentiation(multiplyFactor, 1), new Exponentiation('x', 1) ];
        const terms = [ [ new Exponentiation(integerTwo, 1), new Exponentiation('x', degree - 1) ],
                        [ new Exponentiation(integerThree, 1) ] ];

        const multiplicandPolynomial = new Polynomial(terms);
        const nonMultiplyPolynomial = new Polynomial([ standaloneTerm ]);
        const multiplierPolynomial = new Polynomial([ multiplierTerm ]);

        // Creates the full polynomial. Ex: 2x^2 + 2x(x + 4) + 2
        const addConstant = addingConstant >= 0 ? `+ ${addingConstant}` : `${addingConstant}`;
        const fullPolynomialPrint = envelopLatex(`${nonMultiplyPolynomial.print({ latex: false, latexFormat: true })}` +
                                                 `+${multiplierPolynomial.print({ latex: false, latexFormat: true })}` +
                                                 `(${multiplicandPolynomial.print({ latex: false, latexFormat: true })}` +
                                                 `) ${addConstant}`);
        const fullNonLatexPolynomialPrint = `${nonMultiplyPolynomial.print({ latex: false }).replace(/[()]/g, '')}` +
                                            `+${multiplierPolynomial.print({ latex: false }).replace(/[()]/g, '')}` +
                                            `(${multiplicandPolynomial.print({ latex: false }).replace(/[()]/g, '')}` +
                                            `) ${addConstant}`;
        const multipliedResult = multiplicandPolynomial.multiplyTerm(multiplierTerm);
        const multipliedPolynomial = new Polynomial([ standaloneTerm ]);

        multipliedPolynomial.addTerms(multipliedResult.polynomial.terms);
        multipliedPolynomial.addTerm([ addingExponentiation ]);
        const placeholder = 'Ex: 12x^3 + 9x^2 + 8';
        const prompt = `Multiply and simplify${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${fullPolynomialPrint}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;
        const expectedAnswer = multipliedPolynomial.print({ latex: false });
        const expectedAnswerLatex = multipliedPolynomial.print();
        let multiplySteps = `${nonMultiplyPolynomial.print({ latex: false, latexFormat: true })} + ${multipliedResult.steps}`;

        multiplySteps += addingConstant >= 0 ? ' + ' : ' ';
        multiplySteps += addingConstant;

        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Multiply the single term with each polynomial term:${newLine}` +
                            `${fullPolynomialPrint}${newLine}` +
                            `${envelopLatex(multiplySteps)}${newLine}` +
                            `${multipliedPolynomial.print({ simplified: false })}${newLine}` +
                            `Combine like terms and write in standard form:${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, polynomial: fullNonLatexPolynomialPrint, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Multiply multiple-variable polynomials by variable.
        Ex: 5y^4 + 2y(−2xy + y) ; Answer: 5y^4 - 4xy^2 + 2y^2
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const randomVariable = utilities.flipCoin() ? 'x' : 'y';
        const multiplyFactor = pickNumberInRange(2, 4);
        const integerOne = pickNumberInRange(-5, 5, [ 0, multiplyFactor, -1 * multiplyFactor ]);
        const integerTwo = pickNumberInRange(-2, 2, [ 0, multiplyFactor, integerOne ]);
        const integerThree = pickNumberInRange(-2, 2, [ 0, multiplyFactor, integerOne, integerTwo ]);
        const standaloneTerm = [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, 2) ];
        const multiplierTerm = [ new Exponentiation(multiplyFactor, 1), new Exponentiation(randomVariable, 1) ];
        const terms = [ [ new Exponentiation(integerTwo, 1), new Exponentiation('x', 1), new Exponentiation('y', 1) ],
                        [ new Exponentiation(integerThree, 1), new Exponentiation(randomVariable, 1) ] ];

        const multiplicandPolynomial = new Polynomial(terms);
        const nonMultiplyPolynomial = new Polynomial([ standaloneTerm ]);
        const multiplierPolynomial = new Polynomial([ multiplierTerm ]);

        // Creates the full polynomial. Ex: 2x^2 + 2x(xy + y)
        const fullPolynomialPrint = envelopLatex(`${nonMultiplyPolynomial.print({ latex: false, latexFormat: true })}` +
                                                 `+${multiplierPolynomial.print({ latex: false, latexFormat: true })}` +
                                                 `(${multiplicandPolynomial.print({ latex: false, latexFormat: true })})`);
        const fullNonLatexPolynomialPrint = `${nonMultiplyPolynomial.print({ latex: false }).replace(/[()]/g, '')}` +
                                            `+${multiplierPolynomial.print({ latex: false }).replace(/[()]/g, '')}` +
                                            `(${multiplicandPolynomial.print({ latex: false }).replace(/[()]/g, '')})`;
        const multipliedResult = multiplicandPolynomial.multiplyPolynomial(multiplierPolynomial);
        const multipliedPolynomial = new Polynomial([ standaloneTerm ]);

        multipliedPolynomial.addTerms(multipliedResult.polynomial.terms);
        const multipliedStandardPolynomial = new Polynomial(multipliedPolynomial.standarize());
        const placeholder = 'Ex: 12x^3 + 9xy + 8y';
        const prompt = `Multiply and simplify${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${fullPolynomialPrint}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE;
        const expectedAnswer = multipliedStandardPolynomial.print({ latex: false });
        const expectedAnswerLatex = multipliedStandardPolynomial.print();
        const multiplySteps = `${nonMultiplyPolynomial.print({ latex: false, latexFormat: true })} + ${multipliedResult.steps}`;

        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Multiply the single term with each polynomial term. Write in standard form:${newLine}` +
                            `${fullPolynomialPrint}${newLine}` +
                            `${envelopLatex(multiplySteps)}${newLine}` +
                            `${multipliedPolynomial.print({ simplified: false })}${newLine}` +
                            `Combine like terms and write in standard form:${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, polynomial: fullNonLatexPolynomialPrint, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Multiply single-variable polynomials by polynomial.
        Ex: (x + 3)(x + 1) ; Answer: x^2 + 4x + 3
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const integerOne = pickNumberInRange(-5, 5, [ 0 ]);
        const integerTwo = pickNumberInRange(-5, 5, [ 0, integerOne ]);
        const multiplierPolynomial = new Polynomial([ [ new Exponentiation('x', 1) ], [ new Exponentiation(integerOne, 1) ] ]);
        const multiplicandPolynomial = new Polynomial([ [ new Exponentiation('x', 1) ], [ new Exponentiation(integerTwo, 1) ] ]);

        // Creates the full polynomial. Ex: 2x^2 + 2x(xy + y)
        const fullPolynomialPrint = envelopLatex(`(${multiplierPolynomial.print({ latex: false, latexFormat: true })})` +
                                                 `(${multiplicandPolynomial.print({ latex: false, latexFormat: true })})`);
        const fullNonLatexPolynomialPrint = `(${multiplierPolynomial.print({ latex: false }).replace(/[()]/g, '')})` +
                                            `(${multiplicandPolynomial.print({ latex: false }).replace(/[()]/g, '')})`;
        const multipliedResult = multiplicandPolynomial.multiplyPolynomial(multiplierPolynomial);
        const multipliedPolynomial = multipliedResult.polynomial;
        const multipliedStandardPolynomial = new Polynomial(multipliedPolynomial.standarize());

        const placeholder = 'Ex: 12x^2 + 9x + 8';
        const prompt = `Multiply and simplify${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${fullPolynomialPrint}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE;
        const expectedAnswer = multipliedStandardPolynomial.print({ latex: false });
        const expectedAnswerLatex = multipliedStandardPolynomial.print();
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Multiply each term in the first polynomial with the second polynomial:${newLine}` +
                            `${fullPolynomialPrint}${newLine}` +
                            `${envelopLatex(multipliedResult.steps)}${newLine}` +
                            `${multipliedPolynomial.print({ simplified: false })}${newLine}` +
                            `Combine like terms and write in standard form:${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, polynomial: fullNonLatexPolynomialPrint, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 6. Multiply multiple-variable polynomials by polynomial.
        Ex: (4x + xy)(3x + y) ; Answer: 3x^2y + xy^2 + 12x^2 + 4xy
        @method _levelSix
        @private
        @return {Object} An object with the needed level 6 Question's parameters.
    */
    QuestionFactory.prototype._levelSix = function() {
        const randomVariable = utilities.flipCoin() ? 'x' : 'y';
        const otherVariable = randomVariable === 'x' ? 'y' : 'x';
        const randomVariableDegree = utilities.flipCoin() ? 1 : 2;
        const otherVariableDegree = randomVariableDegree === 1 ? 2 : 1;
        const integerOne = pickNumberInRange(-5, 5, [ 0 ]);
        const integerTwo = pickNumberInRange(-5, 5, [ 0, integerOne ]);
        const integerThree = pickNumberInRange(-5, 5, [ 0, integerOne, integerTwo ]);
        let multiplierPolynomial = new Polynomial([ [ new Exponentiation(randomVariable, randomVariableDegree),
                                                      new Exponentiation(otherVariable, otherVariableDegree) ],
                                                    [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, 1) ] ]);
        let multiplicandPolynomial = new Polynomial([ [ new Exponentiation(integerTwo, 1), new Exponentiation(randomVariable, 1) ],
                                                      [ new Exponentiation(integerThree, 1) ] ]);

        multiplierPolynomial = new Polynomial(multiplierPolynomial.standarize());
        multiplicandPolynomial = new Polynomial(multiplicandPolynomial.standarize());

        // Creates the full polynomial. Ex: 2x^2 + 2x(xy + y)
        const fullPolynomialPrint = envelopLatex(`(${multiplierPolynomial.print({ latex: false, latexFormat: true })})` +
                                                 `(${multiplicandPolynomial.print({ latex: false, latexFormat: true })})`);
        const fullNonLatexPolynomialPrint = `(${multiplierPolynomial.print({ latex: false }).replace(/[()]/g, '')})` +
                                            `(${multiplicandPolynomial.print({ latex: false }).replace(/[()]/g, '')})`;
        const multipliedResult = multiplicandPolynomial.multiplyPolynomial(multiplierPolynomial);
        const multipliedPolynomial = multipliedResult.polynomial;
        const multipliedStandardPolynomial = new Polynomial(multipliedPolynomial.standarize());

        const placeholder = 'Ex: 2x^2y + 9xy^2 + 4x^2 + 2xy';
        const prompt = `Multiply and simplify${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${fullPolynomialPrint}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL_MULTIVARIABLE;
        const expectedAnswer = multipliedStandardPolynomial.print({ latex: false });
        const expectedAnswerLatex = multipliedStandardPolynomial.print();
        const explanation = `Expected: ${expectedAnswerLatex}${newLine}` +
                            `Multiply each term in the first polynomial with the second polynomial. Write in standard form:${newLine}` +
                            `${fullPolynomialPrint}${newLine}` +
                            `${envelopLatex(multipliedResult.steps)}${newLine}` +
                            `${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, placeholder, polynomial: fullNonLatexPolynomialPrint, prompt, validAnswerExplanation };
    };
}
