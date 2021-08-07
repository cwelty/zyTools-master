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

    const newLine = require('utilities').getNewline();
    const pickNumberInRange = require('utilities').pickNumberInRange;
    const envelopLatex = require('utilities').envelopLatex;

    const latexPostfix = '\\)';
    const latexPrefix = '\\(';

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    QuestionFactory.prototype.make = function(currentLevelIndex) {

        // {Question}'s parameters.
        let expectedAnswer = '';
        let explanation = '';
        let inputPrefix = '';
        let placeholder = 'Ex: 8';
        let prompt = '';

        // Auxiliary variables
        const beginAlign = '\\begin{align}';
        const endAlign = '\\end{align}';
        const latexEndLine = '\\\\[1pt]';
        const latexSpacing = `\\phantom{x}${latexEndLine}`;
        const multiplicationSymbol = '\\cdot';

        // Variables for the levels.
        let addition = 0;
        let additionString = '';
        let explanationOperations = '';
        let generalTerm = '';
        let joinedTerms = '';
        let max = 0;
        let min = 0;
        let termsToSum = 0;
        let termsToSumString = 'S_';
        let product = 0;
        let sequence = '';
        let summationExpression = '';
        let terms = [];

        switch (currentLevelIndex) {

            // Sum the first n terms of a given sequence. Ex: S_4 of {4, 6, 8, 10, 12, 14, 16, 18}. Answer is 28.
            case 0: {
                addition = pickNumberInRange(-2, 3, [ 0 ]);
                termsToSum = pickNumberInRange(3, 4);
                product = pickNumberInRange(1, 2);

                termsToSumString += termsToSum;
                terms = this._createSequence(8, product, addition);
                sequence = `{${terms.join(', ')}}`;

                inputPrefix = envelopLatex(`${termsToSumString}=`);
                prompt = `Enter ${envelopLatex(termsToSumString)} of ${sequence}.`;
                expectedAnswer = this._sum(terms, termsToSum);
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `${envelopLatex('S_n')} denotes the sum of the first n terms of a sequence`;
                break;
            }

            // Sum the first n terms of a given general term. Ex: S_2 of a_n = 2n + 2. Answer is 10.
            case 1: {
                addition = pickNumberInRange(1, 3, [ 0 ]);
                additionString = this._getAdditionString(addition);
                termsToSum = pickNumberInRange(2, 4);
                product = pickNumberInRange(2, 3);

                termsToSumString += termsToSum;
                generalTerm = `a_n = ${product}n${additionString}`;
                terms = this._createSequence(termsToSum, product, addition);

                inputPrefix = envelopLatex(`${termsToSumString}=`);

                explanationOperations = terms.map((term, index) =>
                    `a_${(index + 1)}&=${product}${multiplicationSymbol}${(index + 1)}${additionString}=${term}`
                );

                prompt = `Enter ${envelopLatex(termsToSumString)} of ${envelopLatex(generalTerm)}.`;
                expectedAnswer = this._sum(terms, termsToSum);
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `Calculate the first ${termsToSum} terms of the general term. Then, add the computed terms:${newLine}` +
                            `${latexPrefix}${latexSpacing}${beginAlign}${explanationOperations.join(latexEndLine)}${latexEndLine}` +
                            `S_${termsToSum}&=${this._joinAddedTerms(terms)}${endAlign}${latexPostfix}`;
                break;
            }

            // Given sequence and the value of S_n, calculate the value of n. Ex: {1, 2, 3, 4, 5, 6} S_n = 10 -> n = ? (4)
            case 2: {
                addition = pickNumberInRange(-3, 3);
                product = pickNumberInRange(1, 3);

                expectedAnswer = pickNumberInRange(2, 4);
                terms = this._createSequence(5, product, addition);
                sequence = `{${terms.join(', ')}}`;
                const sumString = this._joinAddedTerms(terms.slice(0, expectedAnswer));
                const sumValue = this._sum(terms, expectedAnswer);

                placeholder = 'Ex: 6';
                inputPrefix = 'n =';
                prompt = `Given the sequence ${sequence} and the value of ${envelopLatex(`S_n = ${sumValue}`)}, what is the value of n?`;
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `Sum the values of the sequence until you get to ${sumValue}` +
                            `, the index of the last term you summed is n:${newLine}` +
                            `${envelopLatex(`${latexSpacing}${sumString}=${sumValue}= S_${expectedAnswer}`)}`;
                break;
            }

            //  Summation with fixed min and max values. Ex: [Sigma]^4_n=1 n + 3
            case 3: {
                addition = pickNumberInRange(-3, 3, [ 0 ]);
                additionString = this._getAdditionString(addition);
                summationExpression = this._createSummationExpression(1, 4, `n ${additionString}`);
                terms = this._createSequence(4, 1, addition);
                joinedTerms = this._joinAddedTerms(terms);

                inputPrefix = envelopLatex(`${summationExpression}=`);
                prompt = `Enter the value of ${envelopLatex(summationExpression)}`;
                expectedAnswer = this._sum(terms, 4);
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `n=1 indicates the first term to sum, 4 refers to the last term to sum.${newLine}` +
                            `${latexPrefix}${latexSpacing}${beginAlign}${summationExpression}&=` +
                            `(1${additionString}) + (2${additionString}) + (3${additionString}` +
                            `) + (4${additionString})${latexEndLine}` +
                            `&=${joinedTerms}=${expectedAnswer}${endAlign}${latexSpacing}${latexPostfix}`;
                break;
            }

            // Summation with varying max value. Ex: [Sigma]^5_n=1 n + 3
            case 4: {
                addition = pickNumberInRange(-3, 3, [ 0 ]);
                additionString = this._getAdditionString(addition);
                max = pickNumberInRange(3, 5, [ 4 ]);

                summationExpression = this._createSummationExpression(1, max, `n ${additionString}`);
                terms = this._createSequence(max, 1, addition);
                explanationOperations = terms.map((term, index) => `(${(index + 1)}${additionString})`);
                joinedTerms = this._joinAddedTerms(terms);

                inputPrefix = envelopLatex(`${summationExpression}=`);
                prompt = `Enter the value of ${envelopLatex(summationExpression)}`;
                expectedAnswer = this._sum(terms, max);
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `n=1 indicates the first term to sum, ${max} refers to the last term to sum.${newLine}` +
                            `${latexPrefix}${latexSpacing}${beginAlign}${summationExpression}&=` +
                            `${explanationOperations.join('+')}${latexEndLine}` +
                            `&=${joinedTerms}=${expectedAnswer}${endAlign}${latexSpacing}${latexPostfix}`;
                break;
            }

            // Summation with varying min value. Ex: [Sigma]^5_n=3 2n + 3
            case 5: {
                min = pickNumberInRange(2, 3);
                addition = pickNumberInRange(-3, 3, [ 0, min ]);
                additionString = this._getAdditionString(addition);

                summationExpression = this._createSummationExpression(min, 5, `n ${additionString}`);
                terms = this._createSequence(5, 1, addition);
                terms = terms.slice(min - 1, 5);
                explanationOperations = terms.map((term, index) => `(${min + index}${additionString})`);
                joinedTerms = this._joinAddedTerms(terms);

                inputPrefix = envelopLatex(`${summationExpression}=`);
                prompt = `Enter the value of ${envelopLatex(summationExpression)}`;
                expectedAnswer = this._sum(terms);
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `n=${min} indicates the first term to sum, 5 refers to the last term to sum.${newLine}` +
                            `${latexPrefix}${latexSpacing}${beginAlign}${summationExpression}&=` +
                            `${explanationOperations.join('+')}${latexEndLine}` +
                            `&=${joinedTerms}=${expectedAnswer}${endAlign}${latexSpacing}${latexPostfix}`;
                break;
            }

            // Summation with varying min and max values. Ex: [Sigma]^5_n=3 2n + 3
            case 6: {
                max = pickNumberInRange(4, 6);
                min = pickNumberInRange(2, 3);
                product = pickNumberInRange(2, 3, [ min ]);
                addition = pickNumberInRange(-2, 1, [ 0 ]);
                additionString = this._getAdditionString(addition);

                summationExpression = this._createSummationExpression(min, max, `${product}n ${additionString}`);
                terms = this._createSequence(max, product, addition);
                terms = terms.slice(min - 1, max);
                explanationOperations = terms.map((term, index) =>
                    `(${product}${multiplicationSymbol}${(min + index)}${additionString})`
                );
                joinedTerms = this._joinAddedTerms(terms);

                inputPrefix = envelopLatex(`${summationExpression}=`);
                prompt = `Enter the value of ${envelopLatex(summationExpression)}`;
                expectedAnswer = this._sum(terms);
                explanation = `Expected: ${expectedAnswer}${newLine}` +
                            `n=${min} indicates the first term to sum, ${max} refers to the last term to sum.${newLine}` +
                            `${latexPrefix}${latexSpacing}${beginAlign}${summationExpression}&=` +
                            `${explanationOperations.join('+')}${latexEndLine}` +
                            `&=${joinedTerms}=${expectedAnswer}${endAlign}${latexSpacing}${latexPostfix}`;
                break;
            }

            default:
                throw new Error(`Level ${currentLevelIndex} does not exist`);
        }

        const question = new Question(expectedAnswer, explanation, inputPrefix, placeholder, prompt);

        return question;
    };

    /**
        Returns a sum of the values in the array |terms|.
        If |max| is passed, the sum is from array index 0 to |max|-1.
        @method _sum
        @private
        @param {Array} terms An {Array} of {Number} values.
        @param {Number} [max] The last index of |terms| to sum.
        @return {Number} The calculated sum.
    */
    QuestionFactory.prototype._sum = function(terms, max) {
        let sum = 0;
        const maxIndex = max || terms.length;

        for (let termIndex = 0; termIndex < maxIndex; termIndex++) {
            sum += terms[termIndex];
        }

        return sum;
    };

    /**
        Creates a sequence given a product and an addition as general term. Ex: 3n + 5.
        @method _createSequence
        @private
        @param {Number} numberOfTerms The number of terms that the sequence will contain.
        @param {Number} [optionalProductValue] The product by which n is multiplied. Ex: the 3 in the general term: 3n + 5.
        @param {Number} [optionalAdditionValue] The addition of the general term. Ex: the 5 in the general term: 3n + 5.
        @return {Array} of {Number} containing the terms of the sequence.
    */
    QuestionFactory.prototype._createSequence = function(numberOfTerms, optionalProductValue, optionalAdditionValue) {
        const product = optionalProductValue || 1;
        const addition = optionalAdditionValue || 0;

        return require('utilities').createArrayOfSizeN(numberOfTerms).map((term, index) => (product * (index + 1) + addition));
    };

    /**
        Creates a summation expression. Ex: [Sigma]^3_n=1 n+3.
        @method _createSummationExpression
        @private
        @param {Number} min The first term in the summation.
        @param {Number} max The last term in the summation
        @param {String} generalTerm The general term for the summation.
        @return {String} the summation expression in LaTeX format.
    */
    QuestionFactory.prototype._createSummationExpression = function(min, max, generalTerm) {
        return `\\sum\\limits_{n=${min}}^${max} ${generalTerm}`;
    };

    /**
        Returns a string with the addition of the formula. Inserts a '+' before positive numbers, or nothing in negative numbers.
        @method _getAdditionString
        @private
        @param {Number} addition The addition number.
        @return {String} The addition string.
    */
    QuestionFactory.prototype._getAdditionString = function(addition) {
        return (((addition > 0) ? '+' : '') + addition);
    };

    /**
        Joins the elements of the passed array with a plus sign. Ex: passing [ 1, 4, 7, 9 ], returns '1+4+7+9'
        @method _joinAddedTerms
        @private
        @param {Array} terms The array of terms to join.
        @return {String} The array elements joined with a plus sign.
    */
    QuestionFactory.prototype._joinAddedTerms = function(terms) {
        return terms.map((term, index) => {
            const positiveIndexAndNonNegativeTerm = ((index > 0) && (term >= 0));

            return (positiveIndexAndNonNegativeTerm ? `+ ${term}` : term);
        }).join('');
    };
}
