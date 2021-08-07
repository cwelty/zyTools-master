/* global Question, buildQuestionFactoryPrototype, ANSWER_TYPE, System,
    plusOrMinus, manageAddition, makeLatexSystemOfEquations */
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

    const beginAlign = '\\begin{align}';
    const endAlign = '\\end{align}';
    const latexEndLine = '\\\\[2pt]';
    const latexPostfix = '\\)';
    const latexPrefix = '\\(';
    const latexSpacing = `${latexEndLine}\\phantom{x}`;
    const latexX = `${latexPrefix}x${latexPostfix}`;
    const multiplicationSymbol = '\\cdot';

    const newLine = require('utilities').getNewline();
    const pickNumberInRange = require('utilities').pickNumberInRange;
    const envelopLatex = require('utilities').envelopLatex;

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
        const levelQuestion = levelIndexToQuestion[currentLevelIndex]();

        const question = new Question(levelQuestion.expectedAnswer, levelQuestion.explanation,
                                    levelQuestion.placeholder, levelQuestion.prompt);

        question.setInputPrefixAndPostfix(levelQuestion.inputPrefix, levelQuestion.inputPostfix);
        question.setAnswerType(levelQuestion.answerType);

        return question;
    };

    /**
        Builds a question of level 1.
        We ask the student to add equations together, but not simplify.
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const system = new System();
        const selected = pickNumberInRange(0, 1) === 0 ? 'x' : 'y';
        const rightSideSum = system.firstRightSide + system.secondRightSide;
        let latexExpectedAnswer = '';
        let sum = 0;
        let sumAndVariable = '';
        let expectedAnswer = [];

        if (selected === 'y') {
            system.firstXProduct = system.secondXProduct * -1;
            sum = system.firstYProduct + system.secondYProduct;
            sumAndVariable = manageAddition(sum, selected, '');
        }
        else {
            system.firstYProduct = system.secondYProduct * -1;
            sum = system.firstXProduct + system.secondXProduct;
            sumAndVariable = manageAddition(system.firstXProduct + system.secondXProduct, selected, '');
        }

        latexExpectedAnswer = `${sumAndVariable}&=${rightSideSum}`;
        expectedAnswer = [ latexExpectedAnswer.replace('&', ''), `${sum}${selected}=${rightSideSum}` ];
        system.update();
        const prompt = `Add the equations together. Do not simplify.${newLine}` +
                        `${makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}`;

        const placeholder = `Ex: ${pickNumberInRange(-4, 4, [ 0, (system.firstXProduct + system.secondXProduct) ])}${selected}` +
                            ` = ${pickNumberInRange(-10, 10, [ 0, (system.firstRightSide + system.secondRightSide) ])}`;
        const answerType = ANSWER_TYPE.EQUATION;
        const latexAnswer = beginAlign + system.addingEquations + latexEndLine + system.addedEquations +
                            latexEndLine + latexExpectedAnswer + endAlign;
        const expected = '<div class="expected">Expected: ' +
                        `${envelopLatex(latexSpacing + beginAlign + latexExpectedAnswer + endAlign)}</div>`;
        const explanation = `${expected}${newLine}Adding the equation together yields:${newLine}` +
                            `${envelopLatex(latexAnswer)}`;

        return { answerType, expectedAnswer, explanation, placeholder, prompt };
    };

    /**
        Builds a question of level 2.
        We ask the student to add the equations together and simplify.
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const system = new System();
        const denominator = system.firstXProduct + system.secondXProduct;

        system.firstYProduct = system.secondYProduct * -1;
        system.secondRightSide = (system.secondXProduct * system.firstYProduct * -1) +
                                 system.secondYProduct - (system.secondXProduct * system.firstRightSide * -1);

        const rightSideSum = system.firstRightSide + system.secondRightSide;
        const xEquals = 'x &=';

        system.update();

        const answerType = ANSWER_TYPE.NUMBER;
        const expectedAnswer = rightSideSum / denominator;
        const inputPrefix = envelopLatex(beginAlign + xEquals + endAlign);
        const placeholder = `Ex: ${pickNumberInRange(-4, 4, [ expectedAnswer ])}`;
        const prompt = `Add the equations together, then simplify:${newLine}` +
                        `${makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}`;
        const latexAnswer = `${beginAlign}${system.addingEquations}${latexEndLine}` +
                            `${system.addedEquations}${latexEndLine}` +
                            `${denominator}${xEquals}${rightSideSum}${latexEndLine}` +
                            `${xEquals}${expectedAnswer}${endAlign}`;
        const expected = `<div class="expected">Expected: ${envelopLatex(expectedAnswer)}</div>`;
        const explanation = `${expected}${newLine}Adding the equation together yields:${newLine}` +
                            `${envelopLatex(latexAnswer)}`;

        return { answerType, expectedAnswer, explanation, inputPrefix, placeholder, prompt };
    };

    /**
        Builds a question of level 3.
        We ask the student multiply an equation to eliminate a variable on adding.
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const system = new System();
        const prompt = `${makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}${newLine}` +
                        `To eliminate the variable ${latexX} in the system, the first equation is multiplied by:`;

        const inputPostfix = envelopLatex(`${beginAlign}${multiplicationSymbol}(${system.firstEquation})${endAlign}`);
        const expectedAnswer = system.secondXProduct * -1;

        const multiplicationLatex = `${beginAlign}${expectedAnswer}${multiplicationSymbol}(` +
                                    `${system.addFirstXProduct}${system.addFirstYProduct}) &= ` +
                                    `${expectedAnswer}${multiplicationSymbol}${system.firstRightSide}${latexEndLine}` +
                                    `${expectedAnswer * system.firstXProduct}x ` +
                                    `${manageAddition(expectedAnswer * system.firstYProduct, 'y')} &= ` +
                                    `${expectedAnswer * system.firstRightSide}${endAlign}`;

        system.firstXProduct *= expectedAnswer;
        system.firstYProduct *= expectedAnswer;
        system.firstRightSide *= expectedAnswer;
        system.update();

        const yEquals = 'y &=';
        const yValue = (system.firstYProduct + system.secondYProduct) / (system.firstRightSide + system.secondRightSide);
        const addingEquationsLatex = beginAlign + system.addingEquations + latexEndLine + system.addedEquations +
                                    latexEndLine + yEquals + yValue + endAlign;

        const answerType = ANSWER_TYPE.NUMBER;
        const expected = `<div class="expected">Expected: ${envelopLatex(expectedAnswer)}</div>`;
        const explanation = `${expected}${newLine}` +
                            `Multiply by the number that makes the sum of the coefficients equal to ${envelopLatex(0)} ` +
                            `for ${latexX}:${newLine}` +
                            `${envelopLatex(multiplicationLatex + latexSpacing)}${newLine}` +
                            `Adding the equations now elimiates the ${latexX} variable from the system:${newLine}` +
                            `${envelopLatex(addingEquationsLatex)}`;

        return { answerType, expectedAnswer, explanation, inputPostfix, prompt };
    };

    /**
        Builds a question of level 4.
        We ask the student to multiply both equations to eliminate a variable on adding.
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        let system = null;
        let eliminate = '';
        let repeat = false;

        do {
            system = new System();
            eliminate = pickNumberInRange(0, 1) === 0 ? 'x' : 'y';

            if (eliminate === 'x') {
                system.firstXProduct = pickNumberInRange(-5, 5, [ 0 ]);
                system.firstYProduct *= system.firstXProduct;
                system.firstRightSide *= system.firstXProduct;
                system.update();
            }

            /*
            Ensure firstXProduct and secondXProduct are not multiple.
            To eliminate x in the system: 2x -3y = 4  | -4x -2y = 6 you don't need to multiply both equations because 2 and -4 are multiple.
            We want the student to multiply both equations, so we need to ensure that some numbers are not multiple.
            */
            repeat = (system.firstXProduct % system.secondXProduct === 0) || (system.secondXProduct % system.firstXProduct === 0) ||
                    (system.firstYProduct % system.secondYProduct === 0) || (system.secondYProduct % system.firstYProduct === 0);
        } while (repeat);

        const inputPostfix = envelopLatex(`${beginAlign}${multiplicationSymbol}(${system.secondEquation})${endAlign}`);
        const firstEquationMultipliedBy = eliminate === 'x' ? system.secondXProduct : system.secondYProduct;

        const prompt = `${makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}${newLine}` +
                        `To eliminate ${envelopLatex(eliminate)} in the system, the first equation is multiplied by ` +
                        `${envelopLatex(firstEquationMultipliedBy)} and the second equation must be multiplied by:`;

        const expectedAnswer = eliminate === 'x' ? -1 * system.firstXProduct : -1 * system.firstYProduct;
        const answerType = ANSWER_TYPE.NUMBER;
        const multipliedFirstEquation = `${system.firstXProduct * firstEquationMultipliedBy}x` +
                                        `${manageAddition(system.firstYProduct * firstEquationMultipliedBy, 'y')} &=` +
                                        `${system.firstRightSide * firstEquationMultipliedBy}`;
        const multiplyingSecondEquation = `${expectedAnswer}${multiplicationSymbol}(${system.secondXProduct}x` +
                                            `${manageAddition(system.secondYProduct, 'y')}) &=` +
                                            `${expectedAnswer}${multiplicationSymbol}${system.secondRightSide}`;
        const multipliedSecondEquation = `${expectedAnswer * system.secondXProduct}x` +
                                            `${manageAddition(expectedAnswer * system.secondYProduct, 'y')} &=` +
                                            `${expectedAnswer * system.secondRightSide}`;

        const explanationPart1 = `Once the first equation is multiplied by ${envelopLatex(firstEquationMultipliedBy)} ` +
                                `we have:${newLine}` +
                                `${makeLatexSystemOfEquations(multipliedFirstEquation,
                                                                system.secondEquation + latexSpacing)}${newLine}`;
        const explanationPart2 = 'Multiply the second equation by the number that makes the sum of the coefficients equal to ' +
                                `${envelopLatex(0)} for ${envelopLatex(eliminate)}:${newLine}` +
                                `${makeLatexSystemOfEquations(multiplyingSecondEquation,
                                                                multipliedSecondEquation + latexSpacing)}${newLine}`;

        system.firstXProduct *= firstEquationMultipliedBy;
        system.firstYProduct *= firstEquationMultipliedBy;
        system.firstRightSide *= firstEquationMultipliedBy;
        system.secondXProduct *= expectedAnswer;
        system.secondYProduct *= expectedAnswer;
        system.secondRightSide *= expectedAnswer;
        system.update();

        const explanationPart3 = `Adding the equations together now yields a coefficient of ${envelopLatex('0')} for the ` +
                                `${envelopLatex(eliminate)} variable:${newLine}` +
                                `${makeLatexSystemOfEquations(system.addingEquations, system.addedEquations)}`;

        const expected = `<div class="expected">Expected: ${envelopLatex(expectedAnswer)}</div>`;
        const explanation = `${expected}${newLine}` +
                            `${explanationPart1}${explanationPart2}${explanationPart3}`;

        return { answerType, expectedAnswer, explanation, inputPostfix, prompt };
    };

    /**
        Builds a question of level 5.
        We ask the student to fully solve a system via elimination method.
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const system = new System();
        const yValue = pickNumberInRange(-2, 3, [ 0 ]);
        const yEquals = `y&=${yValue}`;
        const placeholder = 'Ex: 2, 7';

        system.firstRightSide *= yValue;
        system.secondRightSide *= yValue;
        system.update();

        const multiplyFirstEquationBy = -1 * Math.abs(system.secondXProduct);
        const multiplyFirstEquation = envelopLatex(`${beginAlign}${multiplyFirstEquationBy}${multiplicationSymbol}(` +
                                                    `${system.addFirstXProduct}${system.addFirstYProduct}) &= ` +
                                                    `${multiplyFirstEquationBy}${multiplicationSymbol}${system.firstRightSide}` +
                                                    `${latexEndLine}${multiplyFirstEquationBy * system.firstXProduct}x ` +
                                                    `${manageAddition(multiplyFirstEquationBy * system.firstYProduct, 'y')} &= ` +
                                                    `${multiplyFirstEquationBy * system.firstRightSide}${endAlign}${latexSpacing}`);

        const xValue = system.firstRightSide - (system.firstYProduct * yValue);
        const prompt = `Solve the system of equations via elimination method: ${newLine}` +
                        `${makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}`;
        const expectedAnswer = `${xValue},${yValue}`;
        const inputPrefix = '(';
        const inputPostfix = ')';
        const answerType = ANSWER_TYPE.PAIR;

        const latexAnswer = envelopLatex(`(${expectedAnswer})`);
        const solveForX = envelopLatex(`${beginAlign}${system.firstEquation}${latexEndLine}` +
                                        `${system.addFirstXProduct} &= ${system.firstRightSide}` +
                                        `${plusOrMinus(system.firstYProduct * -1)}${Math.abs(system.firstYProduct)}` +
                                        `${multiplicationSymbol}${yValue}${latexEndLine}` +
                                        `x &= ${xValue}${endAlign}${latexSpacing}`);

        system.firstXProduct *= multiplyFirstEquationBy;
        system.firstYProduct *= multiplyFirstEquationBy;
        system.firstRightSide *= multiplyFirstEquationBy;
        system.update();

        const addingEquationsLatex = envelopLatex(beginAlign + system.addingEquations + latexEndLine +
                                    system.addedEquations + latexEndLine + yEquals + endAlign + latexSpacing);

        const expected = `<div class="expected">Expected: ${envelopLatex(expectedAnswer)}</div>`;
        const explanation = `${expected}${newLine}` +
                            'Multiply the first equation by the number that makes the sum of the coefficients equal to ' +
                            `${envelopLatex(0)} for ${latexX}:${newLine}` +
                            `${multiplyFirstEquation}${newLine}` +
                            `Adding the equations now eliminates the ${latexX} variable from the system:${newLine}` +
                            `${addingEquationsLatex}${newLine}` +
                            `Back substitute and solve for ${latexX}:${newLine}` +
                            `${solveForX}${newLine}` +
                            `Give the answer in an ordered pair format: ${latexAnswer}`;

        return { answerType, expectedAnswer, explanation, inputPostfix, inputPrefix, placeholder, prompt };
    };
}
