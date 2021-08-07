/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER, greatestCommonDivisor, numbersForLevels124And5 */
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
    this.numberOfQuestions = 7;
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
            6: this._levelSeven,
        };

        return new Question(levelIndexToQuestion[currentLevelIndex]());
    };

    /**
        Builds a question of level 1. Greatest common factor.
        Ex: 12x + 15 turns to: 4x + 5; Answer: 3
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const numbers = numbersForLevels124And5();
        const randomVariable = numbers.randomVariable;
        const multiplyBy = numbers.multiplyBy;
        const integerOne = numbers.integerOne;
        const integerTwo = numbers.integerTwo;

        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, 1) ],
                        [ new Exponentiation(integerTwo, 1) ] ];
        const polynomial = new Polynomial(terms);
        const multiplyResult = polynomial.multiplyExponentiation(new Exponentiation(multiplyBy, 1));
        const multipliedPolynomial = multiplyResult.polynomial;

        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;

        const inputPostfix = `(${polynomial.print()})`;
        const placeholder = 'Ex: 7';
        const prompt = `Enter the greatest common factor.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const explanation = `Expected: ${gcf.print()}${newLine}` +
                            `${multipliedPolynomial.print()}${newLine}` +
                            `${envelopLatex(multiplyResult.steps)}${newLine}` +
                            `${gcf.print()}(${polynomial.print()})`;

        return { expectedAnswer: gcf.print({ latex: false }), explanation, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Resulting polynomial.
        Ex: 24y + 20 GCF = 4 ; Answer: 6y + 5
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const numbers = numbersForLevels124And5();
        const randomVariable = numbers.randomVariable;
        const multiplyBy = numbers.multiplyBy;
        const integerOne = numbers.integerOne;
        const integerTwo = numbers.integerTwo;
        const termDegree = pickNumberInRange(1, 2);

        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, termDegree) ],
                        [ new Exponentiation(integerTwo, 1) ] ];
        const polynomial = new Polynomial(terms);
        const multiplyResult = polynomial.multiplyExponentiation(new Exponentiation(multiplyBy, 1));
        const multipliedPolynomial = multiplyResult.polynomial;

        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;

        const inputPrefix = `${gcf.print()}(`;
        const inputPostfix = ')';
        const placeholder = `Ex: 8${randomVariable} + 4`;
        const prompt = `Enter the resulting polynomial in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const expectedAnswer = polynomial.print({ latex: false });
        const validAnswerExplanation = VALID_ANSWER.SIMPLE_POLYNOMIAL;
        const explanation = `Expected: ${polynomial.print()}${newLine}` +
                            `${multipliedPolynomial.print()}${newLine}` +
                            `${envelopLatex(multiplyResult.steps)}${newLine}` +
                            `${gcf.print()}(${polynomial.print()})`;

        return { expectedAnswer, explanation, inputPostfix, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Greatest common factor, make highest degree positive.
        Ex: -6y + 12 turns to: y - 2 ; Answer: -6
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const randomVariable = utilities.flipCoin() ? 'x' : 'y';
        const multiplyBy = pickNumberInRange(-6, -2);
        const integerOne = pickNumberInRange(2, 6);
        let integerTwo = pickNumberInRange(2, 7, [ -1 * multiplyBy, integerOne ]);

        while (greatestCommonDivisor(integerOne, integerTwo) !== 1) {
            integerTwo = pickNumberInRange(2, 7, [ -1 * multiplyBy, integerOne ]);
        }

        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, 1) ],
                        [ new Exponentiation(integerTwo, 1) ] ];
        const polynomial = new Polynomial(terms);
        const multiplyResult = polynomial.multiplyExponentiation(new Exponentiation(multiplyBy, 1));
        const multipliedPolynomial = multiplyResult.polynomial;

        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;

        const inputPostfix = `(${polynomial.print()})`;
        const placeholder = 'Ex: -8';
        const prompt = `Enter the greatest common factor.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const explanation = `Expected: ${envelopLatex(multiplyBy)}${newLine}` +
                            `${multipliedPolynomial.print()}${newLine}` +
                            `${envelopLatex(multiplyResult.steps)}${newLine}` +
                            `${gcf.print()}(${polynomial.print()})`;

        return { expectedAnswer: multiplyBy, explanation, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Greatest common factor.
        Ex: 15y^3 + 10y     ; Answer: 5y
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const numbers = numbersForLevels124And5();
        const randomVariable = numbers.randomVariable;
        const otherVariable = numbers.otherVariable;
        const multiplyBy = numbers.multiplyBy;
        const integerOne = numbers.integerOne;
        const integerTwo = numbers.integerTwo;
        const termDegree = numbers.termDegree;

        const multipliedOne = integerOne * multiplyBy;
        const multipliedTwo = integerTwo * multiplyBy;

        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, termDegree) ],
                        [ new Exponentiation(integerTwo, 1) ] ];
        const polynomial = new Polynomial(terms);
        const multiplyPolynomial = new Polynomial([ [ new Exponentiation(multiplyBy, 1), new Exponentiation(randomVariable, 1) ] ]);
        const multiplyResult = polynomial.multiplyPolynomial(multiplyPolynomial);
        const multipliedPolynomial = multiplyResult.polynomial;

        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;
        const factors = multipliedPolynomial.getGreatestCommonFactor().factors;

        let factorsOfOne = envelopLatex(factors.get(multipliedOne).reverse().join(', '));
        let factorsOfTwo = envelopLatex(factors.get(multipliedTwo).reverse().join(', '));

        factorsOfOne = factorsOfOne.replace(`${multiplyBy}`, `\\mathbf{${multiplyBy}}`);
        factorsOfTwo = factorsOfTwo.replace(`${multiplyBy}`, `\\mathbf{${multiplyBy}}`);

        let variableFactors = `Factors of ${envelopLatex(randomVariable)}: 1, ${envelopLatex(`\\mathbf{${randomVariable}}`)}${newLine}` +
                       `Factors of ${envelopLatex(`${randomVariable}^${termDegree}`)}: 1, ${envelopLatex(`\\mathbf{${randomVariable}}`)}, `;

        for (let index = 2; index <= termDegree; index++) {
            variableFactors += `${envelopLatex(`x^${index}`)}`;
            variableFactors += index === termDegree ? `${newLine}` : ', ';
        }

        const placeholder = `Ex: 3${otherVariable}`;
        const prompt = `Enter the greatest common factor.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const expectedAnswer = gcf.print({ latex: false });
        const validAnswerExplanation = VALID_ANSWER.SIMPLE_POLYNOMIAL;
        const explanation = `Expected: ${gcf.print()}${newLine}` +
                            `Factors of ${multipliedOne}: ${factorsOfOne}${newLine}` +
                            `Factors of ${multipliedTwo}: ${factorsOfTwo}${newLine}` +
                            `Largest common integer: ${envelopLatex(`${multiplyBy}\\\\`)}${newLine}` +
                            `${variableFactors}` +
                            `Highest common ${envelopLatex(randomVariable)} degree: ${envelopLatex('1\\\\')}${newLine}` +
                            `Greatest common factor: ${gcf.print()}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Greatest common factor.
        Ex: 18x^3y + 15xy ; Answer: 3xy
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const numbers = numbersForLevels124And5();
        const randomVariable = numbers.randomVariable;
        const otherVariable = numbers.otherVariable;
        const multiplyBy = numbers.multiplyBy;
        const integerOne = numbers.integerOne;
        const integerTwo = numbers.integerTwo;
        const termDegree = numbers.termDegree;

        const terms = [ [ new Exponentiation(integerOne, 1), new Exponentiation(randomVariable, termDegree) ],
                        [ new Exponentiation(integerTwo, 1) ] ];
        const polynomial = new Polynomial(terms);
        const randomVariableDegree = utilities.flipCoin() ? 1 : 2;
        const multiplyResult = polynomial.multiplyTerm([ new Exponentiation(multiplyBy, 1),
                                                         new Exponentiation(randomVariable, randomVariableDegree),
                                                         new Exponentiation(otherVariable, 1) ]);
        const multipliedPolynomial = multiplyResult.polynomial;
        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;

        const placeholder = 'Ex: 8xy';
        const prompt = `Enter the greatest common factor.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const expectedAnswer = gcf.print({ latex: false });
        const validAnswerExplanation = VALID_ANSWER.TERM_MULTIVARIABLE;
        const explanation = `Expected: ${gcf.print()}${newLine}` +
                            `Largest common integer: ${multiplyBy}${newLine}` +
                            `Highest common ${randomVariable} degree: ${randomVariableDegree}${newLine}` +
                            `Highest common ${otherVariable} degree: 1${newLine}` +
                            `Greatest common factor: ${gcf.print()}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 6. Greatest common factor.
        Ex: x^13y + x^11y^2 + x^8 ; Answer: x^8
        @method _levelSix
        @private
        @return {Object} An object with the needed level 6 Question's parameters.
    */
    QuestionFactory.prototype._levelSix = function() {
        const randomVariable = utilities.flipCoin() ? 'x' : 'y';
        const otherVariable = randomVariable === 'x' ? 'y' : 'x';
        const degreeOne = pickNumberInRange(4, 8);
        const degreeTwo = pickNumberInRange(2, 8, [ degreeOne ]);
        const degreeThree = pickNumberInRange(2, 8, [ degreeOne, degreeTwo ]);
        const terms = [ [ new Exponentiation(randomVariable, degreeOne) ],
                        [ new Exponentiation(randomVariable, degreeTwo), new Exponentiation(otherVariable, 2) ],
                        [ new Exponentiation(randomVariable, degreeThree), new Exponentiation(otherVariable, 1) ] ];
        let polynomial = new Polynomial(terms);

        polynomial = new Polynomial(polynomial.standarize());
        const multiplyDegree = pickNumberInRange(2, 6);
        const multiplyResult = polynomial.multiplyExponentiation(new Exponentiation(randomVariable, multiplyDegree));
        const multipliedPolynomial = multiplyResult.polynomial;
        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;
        const minDegree = Math.min(...[ degreeOne, degreeTwo, degreeThree ]);

        const placeholder = `Ex: x^${pickNumberInRange(2, 8, [ minDegree + multiplyDegree ])}`;
        const prompt = `Enter the greatest common factor.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const expectedAnswer = gcf.print({ latex: false });
        const validAnswerExplanation = VALID_ANSWER.VARIABLE_TERM;
        const explanation = `Expected: ${gcf.print()}${newLine}` +
                            `Largest common integer: 1${newLine}` +
                            `Highest common ${randomVariable} degree: ${minDegree + multiplyDegree}${newLine}` +
                            `Highest common ${otherVariable} degree: 0${newLine}` +
                            `Greatest common factor: ${gcf.print()}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 7. Resulting polynomial.
        Ex: 10y^7 + 15y^4 + 25y^3   ;   Answer: 5y^3(2y^4 + 3y + 5)
        @method _levelSeven
        @private
        @return {Object} An object with the needed level 7 Question's parameters.
    */
    QuestionFactory.prototype._levelSeven = function() {
        const randomVariable = utilities.flipCoin() ? 'x' : 'y';
        const multiplyBy = pickNumberInRange(2, 6);
        const multiplyDegree = pickNumberInRange(2, 4);
        const integers = [ 2, 3, 5 ];
        const degrees = utilities.pickNNumbersInRange(1, 5, 2);

        utilities.shuffleArray(integers);
        const terms = [ [ new Exponentiation(integers[0], 1), new Exponentiation(randomVariable, degrees[0]) ],
                        [ new Exponentiation(integers[1], 1), new Exponentiation(randomVariable, degrees[1]) ],
                        [ new Exponentiation(integers[2], 1) ] ];
        let polynomial = new Polynomial(terms);

        polynomial = new Polynomial(polynomial.standarize());
        const multiplyResult = polynomial.multiplyTerm([ new Exponentiation(multiplyBy, 1),
                                                         new Exponentiation(randomVariable, multiplyDegree) ]);
        const multipliedPolynomial = multiplyResult.polynomial;
        const gcf = multipliedPolynomial.getGreatestCommonFactor().polynomial;
        const gcfLatexFormat = gcf.print({ latex: false, latexFormat: true });
        const finalPolynomial = envelopLatex(`${gcf.print({ latex: false, latexFormat: true })}(` +
                                             `${polynomial.print({ latex: false, latexFormat: true })})`);

        const firstTerm = multipliedPolynomial.print({ latex: false, latexFormat: true, termToPrint: 0 });
        const secondTerm = multipliedPolynomial.print({ latex: false, latexFormat: true, termToPrint: 1 });
        const thirdTerm = multipliedPolynomial.print({ latex: false, latexFormat: true, termToPrint: 2 });
        const firstTermFraction = utilities.makeLatexFraction(firstTerm, gcfLatexFormat, { large: true });
        const secondTermFraction = utilities.makeLatexFraction(secondTerm, gcfLatexFormat, { large: true });
        const thirdTermFraction = utilities.makeLatexFraction(thirdTerm, gcfLatexFormat, { large: true });
        const steps = envelopLatex(`${gcfLatexFormat}\\left(${firstTermFraction}\\right) + ` +
                                   `${gcfLatexFormat}\\left(${secondTermFraction}\\right) + ` +
                                   `${gcfLatexFormat}\\left(${thirdTermFraction}\\right)`);

        const inputPrefix = envelopLatex(`${gcfLatexFormat}(`);
        const inputPostfix = envelopLatex(')');
        const placeholder = 'Ex: x^2 + 3x - 7';
        const prompt = `Enter the resulting polynomial in standard form.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}.${newLine}` +
                       `${multipliedPolynomial.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POLYNOMIAL;
        const expectedAnswer = polynomial.print({ latex: false });
        const explanation = `Expected: ${polynomial.print()}${newLine}` +
                            `${multipliedPolynomial.print()}${newLine}` +
                            `${steps}${newLine}` +
                            `${finalPolynomial}`;

        return { expectedAnswer, explanation, inputPostfix, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };
}
