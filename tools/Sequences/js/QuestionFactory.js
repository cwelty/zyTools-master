/* global Question, buildQuestionFactoryPrototype, ANSWER_TYPE */
/* exported buildQuestionFactoryPrototype */
/* eslint no-magic-numbers:0, linebreak-style:0 */

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

    var pickNumberInRange = require('utilities').pickNumberInRange;
    var newLine = require('utilities').getNewline();

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    QuestionFactory.prototype.make = function(currentLevelIndex) {
        var beginAlign = '\\begin{align}';
        var endAlign = '\\end{align}';
        var latexEndLine = '\\\\[1pt]';
        var latexPostfix = '\\)';
        var latexPrefix = '\\(';
        var latexSpacing = '\\phantom{x}' + latexEndLine;
        var multiplicationSymbol = '\\cdot';

        var answerType = ANSWER_TYPE.NUMBER;
        var expectedAnswer = '';
        var explanation = '';
        var inputPostfix = '';
        var inputPrefix = '';
        var placeholder = 'Ex: 3';
        var prompt = '';

        var addition = 0;
        var answers = [];
        var generalTerm = '';
        var product = 0;
        var sequence = '';
        var sequenceTerms = [];
        var subtraction = 0;
        var terms = [];

        switch (currentLevelIndex) {

            // Write the next number. Ex: The next number in the sequence of even numbers: {2, 4, 6, 8, 10, ?} 12
            case 0:
                var possibleSequences = [ 'even numbers', 'odd numbers', 'positive integers' ];
                var selection = pickNumberInRange(0, possibleSequences.length - 1);
                var sequenceName = possibleSequences[selection];

                var givenTerms = pickNumberInRange(3, 5);
                var possibleTerms = [ [ 2, 4, 6, 8, 10, 12 ], [ 1, 3, 5, 7, 9, 11 ], [ 1, 2, 3, 4, 5, 6 ] ];
                var selectedTerms = possibleTerms[selection];

                terms = selectedTerms.slice(0, givenTerms);

                inputPrefix = '{';
                inputPrefix += terms.join(', ') + ', ';
                inputPostfix = ', ...}';

                answerType = ANSWER_TYPE.NUMBER;
                prompt = 'Enter the next number in the sequence of ' + sequenceName + '.';
                expectedAnswer = selectedTerms[givenTerms];
                explanation = 'Expected: ' + expectedAnswer;
                break;

            // Enter the next three terms in a sequence.
            case 1:
                var firstNumber = pickNumberInRange(1, 3);

                addition = pickNumberInRange(2, 5);
                terms = [ firstNumber, firstNumber + addition, firstNumber + addition * 2, firstNumber + addition * 3,
                            firstNumber + addition * 4, firstNumber + addition * 5 ];

                inputPrefix = '{' + terms[0] + ', ' + terms[1] + ', ' + terms[2] + ', ';
                inputPostfix = ', ...}';
                placeholder = 'Ex: 3, 9, 15';

                answerType = ANSWER_TYPE.VARIOUS_NUMBERS;
                prompt = 'Enter the next three terms in the sequence that increases each term by ' + addition + '.';
                expectedAnswer = terms[3] + ', ' + terms[4] + ', ' + terms[5];
                explanation = 'Expected: ' + expectedAnswer + '.';
                break;

            // Write the first three terms given a general term. Ex: The first three terms of a_n = 2n + 1: {3, 5, 7}
            case 2:
                product = pickNumberInRange(2, 5);
                addition = pickNumberInRange(1, 3, [ product ]);
                generalTerm = 'a_n =' + product + 'n + ' + addition;
                answers = [ (product + addition), (product * 2 + addition), (product * 3 + addition) ];

                inputPrefix = '{';
                inputPostfix = ', ...}';
                placeholder = 'Ex: 1, 3, 5';

                answerType = ANSWER_TYPE.VARIOUS_NUMBERS;
                prompt = 'Enter the first three terms in ' + latexPrefix + generalTerm + latexPostfix + ', starting with n as 1.';
                expectedAnswer = answers[0] + ', ' + answers[1] + ', ' + answers[2];
                explanation = 'Expected: ' + expectedAnswer + newLine +
                            latexPrefix + latexSpacing + 'a_1 = ' + product + multiplicationSymbol + '1 + ' + addition + '=' +
                            answers[0] + latexEndLine +
                            'a_2 =' + product + multiplicationSymbol + '2 +' + addition + '=' + answers[1] + latexEndLine +
                            'a_3 =' + product + multiplicationSymbol + '3 +' + addition + '=' + answers[2] + latexPostfix;
                break;

            // Write the fourth term given a general term. Ex: The fourth term of a_n = 2n + 1: 9
            case 3:
                product = pickNumberInRange(2, 5);
                addition = pickNumberInRange(1, 3, [ product ]);
                generalTerm = 'a_n = ' + product + 'n + ' + addition;

                answerType = ANSWER_TYPE.NUMBER;
                prompt = 'Enter the fourth term in ' + latexPrefix + generalTerm + latexPostfix + '.';
                expectedAnswer = product * 4 + addition;
                explanation = 'Expected: ' + expectedAnswer + newLine +
                            latexPrefix + latexSpacing + 'a_4 = ' + product + multiplicationSymbol + '4+' + addition + '=' +
                            expectedAnswer + latexPostfix;
                break;

            // Three terms of an infinite sequence given a general term. Ex: a_n = 3n + 2: {5, 8, 11, ...}
            case 4:
                product = pickNumberInRange(2, 5);
                addition = pickNumberInRange(1, 3, [ product ]);
                generalTerm = 'a_n = ' + product + 'n + ' + addition;

                answers = [ (product + addition), (product * 2 + addition), (product * 3 + addition) ];
                placeholder = 'Ex: {1, 3, 5, ...}';

                answerType = ANSWER_TYPE.SEQUENCE;
                prompt = 'Enter the first three terms of the sequence for' + newLine +
                        latexPrefix + generalTerm + latexPostfix + ' in the form: ' +
                        latexPrefix + '\\{ a_1, a_2, a_3, ... \\}' + latexPostfix;
                expectedAnswer = '{' + answers[0] + ',' + answers[1] + ',' + answers[2] + ',...}';
                explanation = 'Expected: ' +
                            latexPrefix + '\\{' + answers[0] + ', ' + answers[1] + ', ' + answers[2] + ', ...\\}' + latexEndLine +
                            latexPostfix + newLine +
                            'The { and } enclose the sequence. The ... indicates an infinite sequence.';
                break;

            // Write the general term of the given sequence. Ex: {4, 5, 6, 7, ...}: a_n = n + 3
            case 5:
                addition = pickNumberInRange(2, 5);
                sequenceTerms = [ (1 + addition), (2 + addition), (3 + addition), (4 + addition), (5 + addition) ];
                sequence = '{' + sequenceTerms.join(', ') + ', ...}';

                inputPrefix = latexPrefix + 'a_n =' + latexPostfix;
                placeholder = 'Ex: n + 7';

                answerType = ANSWER_TYPE.GENERAL_TERM_NO_PRODUCT;
                prompt = 'Enter the general term of the sequence: ' + sequence + '.';
                expectedAnswer = 'n+' + addition;
                explanation = 'Expected: ' + latexPrefix + expectedAnswer + latexPostfix + newLine +
                            'Sequences grows by 1 each term, so:' + newLine +
                            latexPrefix + latexSpacing + beginAlign + 'a_n &= n + constant' + latexEndLine +
                            'a_1 &= 1 + constant' + latexEndLine +
                            'a_1 &= ' + sequenceTerms[0] + latexEndLine +
                            '1 + constant &=' + sequenceTerms[0] + latexEndLine +
                            'constant &=' + addition + endAlign + latexEndLine + latexPostfix + newLine +
                            'So, ' + latexPrefix + 'a_n = n +' + addition + latexPostfix;
                break;

            // Write the general term of the given sequence. Ex: {-2, 1, 4, 7, ...}: a_n = 3n - 5
            case 6:
                product = pickNumberInRange(2, 4);
                subtraction = pickNumberInRange(1, 3, [ product ]);

                sequenceTerms = [ (product - subtraction), (product * 2 - subtraction), (product * 3 - subtraction),
                                (product * 4 - subtraction), (product * 5 - subtraction) ];
                sequence = '{' + sequenceTerms.join(', ') + ', ...}';

                inputPrefix = latexPrefix + 'a_n = ' + latexPostfix;
                placeholder = 'Ex: 5n - 4';

                answerType = ANSWER_TYPE.GENERAL_TERM;
                prompt = 'Enter the general term of the sequence: ' + sequence + '.';
                expectedAnswer = product + 'n-' + subtraction;
                explanation = 'Expected: ' + latexPrefix + product + 'n -' + subtraction + latexPostfix + newLine +
                            'Sequences grows by ' + product + ' each term, so: ' + newLine +
                            latexPrefix + latexSpacing + beginAlign + 'a_n &= ' + product + 'n + constant' + latexEndLine +
                            'a_1 &=' + product + multiplicationSymbol + '1 + constant =' +
                            product + ' + constant' + latexEndLine +
                            'a_1 &= ' + sequenceTerms[0] + latexEndLine +
                            product + '+ constant &=' + sequenceTerms[0] + latexEndLine +
                            'constant &= ' + subtraction + endAlign + latexEndLine + latexPostfix + newLine +
                            'So, ' + latexPrefix + 'a_n =' + product + 'n -' + subtraction + latexPostfix + '.';
                break;

            default:
                throw new Error('Level ' + currentLevelIndex + ' does not exist');
        }

        var question = new Question(prompt, expectedAnswer, explanation, placeholder);

        question.setInputPrefixAndPostfix(inputPrefix, inputPostfix);
        question.setAnswerType(answerType);
        return question;
    };
}
