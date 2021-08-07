/* global Question, buildQuestionFactoryPrototype */
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

    const pickNumberInRange = require('utilities').pickNumberInRange;
    const pickElementFromArray = require('utilities').pickElementFromArray;
    const makeLatexFraction = require('utilities').makeLatexFraction;
    const newLine = require('utilities').getNewline();

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    QuestionFactory.prototype.make = function(currentLevelIndex) {  // eslint-disable-line complexity
        const latexPrefix = '\\(';
        const latexPostfix = '\\)';
        const latexEndLine = '\\\\[3pt]';
        const multiplicationSymbol = '\\cdot';
        const beginAlign = '\\begin{align}';
        const endAlign = '\\end{align}';
        let placeholder = 'Ex: 9';
        let prompt = '';
        let promptLeftSide = '';
        let promptRightSide = '';
        let expectedAnswer = '';
        let explanation = '';
        let inputPrefix = '';
        let answerIsNumber = true;
        let possibleAnswers = [];

        switch (currentLevelIndex) {

            /* Functions with additions and subtractions when x is an integer number. Ex:
                f(x)     = x + 2
                g(x)     = x - 5
                f(g(-2)) =
            */
            case 0: {
                const subtraction = pickNumberInRange(1, 5);
                const addition = pickNumberInRange(1, 7, [ subtraction ]);
                const xValue = pickNumberInRange(-3, 3, [ -1 * subtraction, 0, addition ]);
                const gOfX = xValue - subtraction;

                inputPrefix = `${latexPrefix}f(g(${xValue})) = ${latexPostfix}`;
                expectedAnswer = (xValue - subtraction) + addition;
                answerIsNumber = true;

                promptLeftSide = this._leftSidePrompt();
                promptRightSide = `${latexPrefix}x +${addition}${latexEndLine}` +
                                    `x -${subtraction}${latexPostfix}`;

                explanation = `First solve ${latexPrefix}g(${xValue})${latexPostfix}, ` +
                            `then solve ${latexPrefix}f(g(${xValue}))${latexEndLine}${latexPostfix}:${newLine}` +
                            `${latexPrefix}${beginAlign}g(${xValue}) &=${xValue}-${subtraction}${latexEndLine}` +
                            `&=${gOfX}${latexEndLine}` +
                            `f(g(${xValue})) &= f(${gOfX})${latexEndLine}` +
                            `&=${gOfX}+${addition}${latexEndLine}` +
                            `&=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            /* Functions with additions, subtractions and products when x is an integer number. Ex:
                f(x)    = 2x - 6
                g(x)    = 3x + 5
                f(g(4)) =
            */
            case 1: {
                const fProduct = pickNumberInRange(2, 3);
                const gProduct = pickNumberInRange(2, 3, [ fProduct ]);
                const addition = pickElementFromArray([ 1, 4, 5 ]);
                const xValue = pickNumberInRange(1, 4, [ addition, fProduct, gProduct ]);
                const subtraction = pickNumberInRange(1, 7, [ fProduct, gProduct, addition, xValue ]);

                const gProductResult = gProduct * xValue;
                const gOfX = gProductResult + addition;
                const fProductResult = fProduct * gOfX;

                inputPrefix = `${latexPrefix}f(g(${xValue})) = ${latexPostfix}`;
                expectedAnswer = fProductResult - subtraction;
                answerIsNumber = true;

                promptLeftSide = this._leftSidePrompt();
                promptRightSide = `${latexPrefix}${fProduct}x -${subtraction}${latexEndLine}` +
                                `${gProduct}x +${addition}${latexPostfix}`;

                explanation = `First solve ${latexPrefix}g(${xValue})${latexPostfix}, ` +
                            `then solve ${latexPrefix}f(g(${xValue}))${latexEndLine}${latexPostfix}:${newLine}` +
                            `${latexPrefix}${beginAlign}g(${xValue}) &=` +
                            `${gProduct}${multiplicationSymbol}${xValue}+${addition}${latexEndLine}` +
                            `&=${gProductResult}+${addition}${latexEndLine}` +
                            `&=${gOfX}${latexEndLine}` +
                            `f(g(${xValue})) &= f(${gOfX})${latexEndLine}` +
                            `&=${fProduct}${multiplicationSymbol}${gOfX}-${subtraction}${latexEndLine}` +
                            `&=${fProductResult}-${subtraction}${latexEndLine}` +
                            `&=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            /* Functions with additions and subtractions when x is a constiable. Ex:
                f(x)    = x + 3
                g(x)    = x - 2
                f(g(t)) =
            */
            case 2: {
                const subtraction = pickNumberInRange(1, 5);
                const addition = pickNumberInRange(1, 7, [ subtraction ]);
                const sumResult = addition - subtraction;
                const placeholderSum = pickNumberInRange(1, 9, [ addition, subtraction, sumResult ]);

                inputPrefix = `${latexPrefix}f(g(t)) = ${latexPostfix}`;
                answerIsNumber = false;
                placeholder = 'Ex: t';
                placeholder += ((require('utilities').flipCoin()) ? (` + ${placeholderSum}`) : (` - ${placeholderSum}`));

                expectedAnswer = 't';
                if (sumResult < 0) {
                    expectedAnswer += sumResult;
                }
                else if (sumResult > 0) {
                    expectedAnswer += `+${sumResult}`;
                }

                possibleAnswers = [ expectedAnswer, `${sumResult}+t` ];

                promptLeftSide = this._leftSidePrompt();
                promptRightSide = `${latexPrefix}x +${addition}${latexEndLine}` +
                                `x -${subtraction}${latexPostfix}`;

                explanation = `First solve ${latexPrefix}g(t)${latexPostfix} by substituting x with t, ` +
                            `then solve ${latexPrefix}f(g(t))${latexEndLine}${latexPostfix} and simplify:${newLine}` +
                            `${latexPrefix}${beginAlign}g(t) &= t -${subtraction}${latexEndLine}` +
                            `f(g(t)) &= g(t) +${addition}${latexEndLine}` +
                            `&= (t - ${subtraction}) +${addition}${latexEndLine}` +
                            `&=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            /* Functions with additions, subtractions and products when x is a constiable. Ex:
                f(x)    = 5x - 6
                g(x)    = 3x + 2
                f(g(t)) =
            */
            case 3: {
                const fProduct = pickNumberInRange(2, 5);
                const gProduct = pickNumberInRange(2, 5, [ fProduct ]);
                const subtraction = pickNumberInRange(1, 5, [ fProduct, gProduct ]);
                const addition = pickNumberInRange(1, 7, [ subtraction, fProduct, gProduct ]);

                const products = fProduct * gProduct;
                const sum = fProduct * addition - subtraction;

                inputPrefix = `${latexPrefix}f(g(t)) = ${latexPostfix}`;
                answerIsNumber = false;

                const placeholderProduct = pickNumberInRange(1, 9, [ addition, subtraction, fProduct, gProduct, products, sum ]);
                const placeholderSum = pickNumberInRange(1, 9, [ addition, subtraction, fProduct, gProduct,
                                                                products, sum, placeholderProduct ]);

                placeholder = `Ex: ${placeholderProduct}t`;
                placeholder += ((require('utilities').flipCoin()) ? (` + ${placeholderSum}`) : (` - ${placeholderSum}`));

                expectedAnswer = `${products}t`;
                if (sum < 0) {
                    expectedAnswer += sum;
                }
                else if (sum > 0) {
                    expectedAnswer += `+${sum}`;
                }

                possibleAnswers = [ expectedAnswer, `${sum}+${products}t` ];

                expectedAnswer = (sum < 0) ? `${products}t${sum}` : `${products}t+${sum}`;

                promptLeftSide = this._leftSidePrompt();
                promptRightSide = `${latexPrefix}${fProduct}x -${subtraction}${latexEndLine}` +
                                `${gProduct}x +${addition}${latexPostfix}`;

                explanation = `First solve ${latexPrefix}g(t)${latexPostfix} by substituting x with t, ` +
                            `then solve ${latexPrefix}f(g(t))${latexEndLine}${latexPostfix} and simplify:${newLine}` +
                            `${latexPrefix}${beginAlign}g(t) &=${gProduct}t +${addition}${latexEndLine}` +
                            `f(g(t)) &= ${fProduct}${multiplicationSymbol} g(t) -${subtraction}${latexEndLine}` +
                            `&=${fProduct}${multiplicationSymbol}(${gProduct}t + ${addition}) -${subtraction}${latexEndLine}` +
                            `&=${fProduct}${multiplicationSymbol}${gProduct}t +` +
                            `${fProduct}${multiplicationSymbol}${addition}-${subtraction}${latexEndLine}` +
                            `&=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            /* Functions with fractions when x is an integer number. Ex:
                f(x)    = -2 / (x + 1)
                g(x)    =  3 / (x - 2)
                f(g(1)) =
            */
            case 4: {
                const gDenominator = pickNumberInRange(2, 5);
                const gNumerator = pickNumberInRange(2, 6, [ gDenominator ]);
                const xValue = pickNumberInRange(gDenominator - 1, gDenominator + 1, [ gDenominator, (gDenominator - gNumerator) ]);

                const gOfX = gNumerator / (xValue - gDenominator);
                const gOfXPlusOne = gOfX + 1;

                const posibleNumerators = [ -2 * gOfXPlusOne, -1 * gOfXPlusOne, gOfXPlusOne, 2 * gOfXPlusOne, 3 * gOfXPlusOne ];
                const fNumerator = pickElementFromArray(posibleNumerators);

                inputPrefix = `${latexPrefix}f(g(${xValue})) = ${latexPostfix}`;
                expectedAnswer = fNumerator / gOfXPlusOne;
                answerIsNumber = true;

                promptLeftSide = this._leftSidePrompt();
                promptRightSide = latexPrefix + makeLatexFraction(fNumerator, 'x+1', { large: true }) + latexEndLine +
                                makeLatexFraction(gNumerator, `x -${gDenominator}`, { large: true }) + latexPostfix;

                explanation = `First solve ${latexPrefix}g(${xValue})${latexPostfix}, ` +
                            `then solve ${latexPrefix}f(g(${xValue}))${latexEndLine}${latexPostfix} and simplify:${newLine}` +
                            `${latexPrefix}${beginAlign}g(${xValue}) &= ` +
                            `${makeLatexFraction(gNumerator, `${xValue}-${gDenominator}`, { small: true })}${latexEndLine}` +
                            `&=${gOfX}${latexEndLine}` +
                            `f(g(${xValue})) &= ${makeLatexFraction(fNumerator, `g(${xValue}) + 1`, { small: true })}${latexEndLine}` +
                            `&=${makeLatexFraction(fNumerator, `${gOfX}+ 1`, { small: true })}${latexEndLine}` +
                            `&=${expectedAnswer}${endAlign}${latexPostfix}`;
                break;
            }

            /* Domain of composed functions. Ex:
                f(x)    = 2 / (x + 1)
                g(x)    = 3 / (x - 5)
                f(g(x)) = 2 / (g(x) + 1)
                        = (2x - 10) / (x - 2)
                The domain of f(g(x)) is x != 2 and x !=
            */
            case 5: {
                const fNumerator = pickNumberInRange(2, 6);
                const gNumerator = pickNumberInRange(2, 6, [ fNumerator ]);
                const gDenominator = pickNumberInRange(2, 6, [ fNumerator, gNumerator ]);
                const product = fNumerator * gDenominator;
                const sum = gNumerator - gDenominator;
                const xSum = sum < 0 ? `x${sum}` : `x +${sum}`;

                inputPrefix = `The domain of ${latexPrefix}f(g(x))${latexPostfix} is: ` +
                                `${latexPrefix}x \\neq ${(-1 * sum)}${latexPostfix} and ${latexPrefix}x \\neq${latexPostfix}`;
                expectedAnswer = gDenominator;
                answerIsNumber = true;

                prompt = `${latexPrefix}${beginAlign}f(x) &= ${makeLatexFraction(fNumerator, 'x + 1', { small: true })}${latexEndLine}` +
                        `g(x) &= ${makeLatexFraction(gNumerator, `x - ${gDenominator}`, { small: true })}${latexEndLine}` +
                        `f(g(x)) &= ${makeLatexFraction(fNumerator, 'g(x) + 1', { small: true })}${latexEndLine}` +
                        `&= ${makeLatexFraction(`${fNumerator} x - ${product}`, xSum, { small: true })}${endAlign}${latexPostfix}`;

                explanation = `Domain rules restrict functions from dividing by zero.${newLine}` +
                            `The first domain restriction comes from ${latexPrefix}f(g(x))${latexPostfix}:${newLine}` +
                            `${latexPrefix}${beginAlign}${xSum} &= 0${latexEndLine}` +
                            `x &= ${(-1 * sum)}${endAlign}${latexPostfix}${newLine}` +
                            `The domain of the inside function ${latexPrefix}g(x)${latexPostfix} must also be included.${newLine}` +
                            `The second domain restriction comes from ${latexPrefix}g(x)${latexPostfix}:${newLine}` +
                            `${latexPrefix}${beginAlign}x - ${gDenominator} &= 0${latexEndLine}` +
                            `x &= ${gDenominator}${endAlign}${latexPostfix}`;
                break;
            }

            default: {
                throw new Error(`Level ${currentLevelIndex} does not exist`);
            }
        }

        return new Question(prompt, expectedAnswer, explanation, placeholder, inputPrefix, answerIsNumber,
                            possibleAnswers, promptLeftSide, promptRightSide);
    };

    /**
        Return a LaTeX with the left side of the prompt of most of the questions on the progression
        @method _leftSidePrompt
        @return {String} LaTeX with the left side of the prompt.
    */
    QuestionFactory.prototype._leftSidePrompt = function() {
        const latexPrefix = '\\(';
        const latexPostfix = '\\)';
        const latexEndLine = '\\\\[3pt]';
        const prompt = `${latexPrefix}f(x) =${latexEndLine}` +
                                    `g(x) =${latexPostfix}`;

        return prompt;
    };
}
