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
        Builds a question of level 1. Enter the degree of the polynomial.
        Ex: 3x^2 + 5x^6 - x ; Answer: 6
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const firstDegree = pickNumberInRange(1, 6);
        const secondDegree = pickNumberInRange(1, 6, [ firstDegree ]);
        const thirdDegree = pickNumberInRange(1, 6, [ firstDegree, secondDegree ]);

        const firstInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree ]);
        const secondInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree, firstInteger ]);
        const thirdInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree, firstInteger, secondInteger ]);

        const polynomial = new Polynomial();
        const terms = [ [ new Exponentiation(firstInteger, 1), new Exponentiation('x', firstDegree) ],
                        [ new Exponentiation(secondInteger, 1), new Exponentiation('x', secondDegree) ],
                        [ new Exponentiation(thirdInteger, 1), new Exponentiation('x', thirdDegree) ] ];

        polynomial.addTerms(terms);

        const placeholder = `Ex: ${pickNumberInRange(1, 6, [ polynomial.degree ])}`;
        const prompt = `Enter the degree of the polynomial:${newLine}${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const expectedAnswer = polynomial.degree;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            'The degree of a simplified single-variable polynomial is the largest variable exponent.';

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Enter the degree of the polynomial.
        Ex: -3x^(2)2x^(4) + 6x^(4)3x + x^(2) ; Answer: 6
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const firstTermFirstDegree = pickNumberInRange(1, 6);
        const firstTermSecondDegree = pickNumberInRange(1, 6, [ firstTermFirstDegree ]);
        const secondTermFirstDegree = pickNumberInRange(1, 6);
        let secondTermSecondDegree = pickNumberInRange(1, 6, [ secondTermFirstDegree ]);
        const thirdTermDegree = pickNumberInRange(1, 6);

        const firstTermFirstInteger = pickNumberInRange(-6, 6, [ 0 ]);
        const firstTermSecondInteger = pickNumberInRange(1, 6, [ firstTermFirstInteger ]);
        const secondTermFirstInteger = pickNumberInRange(-6, 6, [ 0, firstTermFirstInteger, firstTermSecondInteger ]);
        const secondTermSecondInteger = pickNumberInRange(1, 6, [ secondTermFirstInteger ]);
        const thirdInteger = pickNumberInRange(-6, 6, [ 0 ]);

        if ((firstTermFirstDegree + firstTermSecondDegree) === (secondTermFirstDegree + secondTermSecondDegree)) {
            secondTermSecondDegree += 1;
        }
        const polynomial = new Polynomial();
        const terms = [ [ new Exponentiation(firstTermFirstInteger, 1), new Exponentiation('x', firstTermFirstDegree),
                          new Exponentiation(firstTermSecondInteger, 1), new Exponentiation('x', firstTermSecondDegree) ],
                        [ new Exponentiation(secondTermFirstInteger, 1), new Exponentiation('x', secondTermFirstDegree),
                          new Exponentiation(secondTermSecondInteger, 1), new Exponentiation('x', secondTermSecondDegree) ],
                        [ new Exponentiation(thirdInteger, 1), new Exponentiation('x', thirdTermDegree) ] ];

        polynomial.addTerms(terms);

        const placeholder = `Ex: ${pickNumberInRange(1, 6, [ polynomial.degree ])}`;
        const prompt = `Enter the degree of the polynomial:${newLine}${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const expectedAnswer = polynomial.degree;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `First simplify, then find the largest variable exponent.${newLine}` +
                            `${polynomial.print({ latex: true, simplified: false })}${newLine}` +
                            `${polynomial.print()}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Enter the degree of the polynomial.
        Ex: -y^(6) + y^(2) - 4y^(5) + 4x^(3) ; Answer: 6
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const firstDegree = pickNumberInRange(1, 6);
        const secondDegree = pickNumberInRange(1, 6, [ firstDegree ]);
        const thirdDegree = pickNumberInRange(1, 6, [ firstDegree, secondDegree ]);
        const fourthDegree = pickNumberInRange(1, 6, [ firstDegree, secondDegree, thirdDegree ]);

        const firstInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree, fourthDegree ]);
        const secondInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree, fourthDegree, firstInteger ]);
        const thirdInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree, fourthDegree,
                                                        firstInteger, secondInteger ]);
        const fourthInteger = pickNumberInRange(-6, 6, [ 0, firstDegree, secondDegree, thirdDegree, fourthDegree,
                                                         firstInteger, secondInteger, thirdInteger ]);

        // This variable helps ensure we always have different variables.
        const polynomial = new Polynomial();
        const firstVariableIsX = utilities.flipCoin();
        const terms = [ [ new Exponentiation(firstInteger, 1), new Exponentiation(firstVariableIsX ? 'x' : 'y', firstDegree) ],
                        [ new Exponentiation(secondInteger, 1), new Exponentiation(firstVariableIsX ? 'y' : 'x', secondDegree) ],
                        [ new Exponentiation(thirdInteger, 1), new Exponentiation(utilities.flipCoin() ? 'x' : 'y', thirdDegree) ],
                        [ new Exponentiation(fourthInteger, 1), new Exponentiation(utilities.flipCoin() ? 'x' : 'y', fourthDegree) ] ];

        polynomial.addTerms(terms);

        const placeholder = `Ex: ${pickNumberInRange(1, 6, [ polynomial.degree ])}`;
        const prompt = `Enter the degree of the polynomial:${newLine}${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const expectedAnswer = polynomial.degree;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            'The degree of polynomial is the largest degree of any term.';

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Enter the degree of the polynomial.
        Ex: -y^(3) + y^(3)x^(4) - x^(4) ; Answer: 7
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const firstTermDegree = pickNumberInRange(1, 4);
        const secondTermFirstDegree = pickNumberInRange(2, 6);
        const secondTermSecondDegree = pickNumberInRange(2, 6, [ secondTermFirstDegree ]);
        const thirdTermDegree = pickNumberInRange(1, 4, [ firstTermDegree ]);

        const firstTermFirstInteger = pickNumberInRange(-5, 5, [ 0 ]);
        const firstTermSecondInteger = pickNumberInRange(1, 5, [ firstTermFirstInteger ]);
        const secondTermFirstInteger = pickNumberInRange(-5, 5, [ 0, firstTermFirstInteger, firstTermSecondInteger ]);
        const thirdInteger = pickNumberInRange(-5, 5, [ 0 ]);

        // This variable helps ensure we always have different variables.
        const polynomial = new Polynomial();
        const firstVariableIsX = utilities.flipCoin();
        const terms = [ [ new Exponentiation(firstTermFirstInteger, 1),
                          new Exponentiation(utilities.flipCoin() ? 'x' : 'y', firstTermDegree) ],
                        [ new Exponentiation(secondTermFirstInteger, 1),
                          new Exponentiation(firstVariableIsX ? 'x' : 'y', secondTermFirstDegree),
                          new Exponentiation(firstVariableIsX ? 'y' : 'x', secondTermSecondDegree) ],
                        [ new Exponentiation(thirdInteger, 1), new Exponentiation(utilities.flipCoin() ? 'x' : 'y', thirdTermDegree) ] ];

        polynomial.addTerms(terms);

        const placeholder = `Ex: ${pickNumberInRange(1, 6, [ polynomial.degree ])}`;
        const prompt = `Enter the degree of the polynomial:${newLine}${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const expectedAnswer = polynomial.degree;
        const variableTerms = polynomial.terms[1].filter(value => value.isVariable);
        const calculateDegree = envelopLatex(`${variableTerms[0].exponent} + ${variableTerms[1].exponent} = ` +
                                             `${polynomial.degree}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `In an expression with multiple variables the degree of a term is the sum of the term's exponents.${newLine}` +
                            `Degree of: ${polynomial.print({ latex: true, simplified: false, termToPrint: 1 })} is ` +
                            `${calculateDegree}${newLine}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Rewrite the polynomial in standard form.
        Ex: 3x^3 - x + 5x^4 - 2 ; Answer: 5x^4 + 3x^3 - x - 2
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const firstInteger = pickNumberInRange(-5, 5, [ 0 ]);
        const secondInteger = pickNumberInRange(-5, 5, [ 0, firstInteger ]);
        const thirdInteger = pickNumberInRange(-5, 5, [ 0, firstInteger, secondInteger ]);
        const fourthInteger = pickNumberInRange(-5, 5, [ 0, firstInteger, secondInteger, thirdInteger ]);

        const firstDegree = pickNumberInRange(2, 4);
        const thirdDegree = pickNumberInRange(3, 5, [ firstDegree ]);

        const polynomial = new Polynomial();
        const expectedPolynomial = new Polynomial();
        const terms = [ [ new Exponentiation(firstInteger, 1), new Exponentiation('x', firstDegree) ],
                        [ new Exponentiation(secondInteger, 1), new Exponentiation('x', 1) ],
                        [ new Exponentiation(thirdInteger, 1), new Exponentiation('x', thirdDegree) ],
                        [ new Exponentiation(fourthInteger, 1) ] ];

        polynomial.addTerms(terms);
        expectedPolynomial.addTerms(polynomial.standarize());

        const placeholder = 'Ex: -2x^3 - 6x^2 + 7x - 8';
        const prompt = `Rewrite the polynomial in standard form.${newLine}` +
                       `Use ^ for exponents: Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;

        const expectedAnswer = expectedPolynomial.print({ latex: false, simplified: false });
        const explanation = `Expected: ${expectedPolynomial.print({ latex: true, simplified: false })}${newLine}` +
                            'The standard form orders the terms by descending degree.';

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 6. Rewrite the polynomial in standard form.
        Ex: -2y^4 + yx - x^4 ; Answer: -x^4 - 2y^4 + xy
        @method _levelSix
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelSix = function() {
        const firstInteger = pickNumberInRange(-3, 3, [ 0 ]);
        const secondInteger = pickNumberInRange(-3, 3, [ 0, firstInteger ]);
        const thirdInteger = pickNumberInRange(-3, 3, [ 0, firstInteger, secondInteger ]);
        const degree = pickNumberInRange(3, 4);

        const polynomial = new Polynomial();
        const expectedPolynomial = new Polynomial();
        const terms = [ [ new Exponentiation(firstInteger, 1), new Exponentiation('y', degree) ],
                        [ new Exponentiation(secondInteger, 1), new Exponentiation('y', 1),
                          new Exponentiation('x', 1) ],
                        [ new Exponentiation(thirdInteger, 1), new Exponentiation('x', degree) ] ];

        polynomial.addTerms(terms);
        expectedPolynomial.addTerms(polynomial.standarize());

        const placeholder = 'Ex: -2x^3 - y^2 + 5';
        const prompt = `Rewrite the polynomial in standard form.${newLine}` +
                       `Use ^ for exponents: Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${polynomial.print({ latex: true, simplified: false })}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;
        const expectedAnswer = expectedPolynomial.print({ latex: false, simplified: false });
        const explanation = `Expected: ${expectedPolynomial.print({ latex: true, simplified: false })}${newLine}` +
                            'The standard form orders the terms by descending degree.';

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };
}
