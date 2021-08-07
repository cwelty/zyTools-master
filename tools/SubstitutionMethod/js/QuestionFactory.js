/* global Question, buildQuestionFactoryPrototype, ANSWER_TYPE */
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

    const beginAlign = '\\begin{align}';
    const endAlign = '\\end{align}';
    const latexEndLine = '\\\\[3pt]';
    const latexPostfix = '\\)';
    const latexPrefix = '\\(';
    const latexSpacing = `\\phantom{x}${latexEndLine}`;
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

        // {Question}'s parameters.
        let answerType = ANSWER_TYPE.ISOLATE;
        let expectedAnswer = '';
        let explanation = '';
        let inputPostfix = '';
        let inputPrefix = '';
        let placeholder = 'Ex: 8';
        let prompt = '';

        // Auxiliary variables
        const multiplicationSymbol = '\\cdot';
        const latexX = envelopLatex('x');
        const latexY = envelopLatex('y');

        let system = this.createOrUpdateASystemOfEquations();

        switch (currentLevelIndex) {

            // Isolate x in the first equation
            case 0: {
                prompt = `${this.makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}${newLine}` +
                        `Isolate ${latexX} in the first equation`;
                inputPrefix = envelopLatex('x =');
                placeholder = 'Ex: 14 - 4y';

                const answer1 = system.firstRightSide + system.isolateFirstYProduct;
                let answer2 = this.manageYAddition(-1 * system.firstYProduct, '');

                answer2 += system.firstRightSide > 0 ? `+${system.firstRightSide}` : system.firstRightSide;

                const expectedAnswerLatex = [ envelopLatex(`${answer1}\\ `), envelopLatex(`\\ ${answer2}`) ];

                expectedAnswer = [ answer1, answer2 ];
                explanation = `Expected: ${expectedAnswerLatex[0]} or ${expectedAnswerLatex[1]}${newLine}` +
                            `Isolation yields: ${envelopLatex(system.isolateFirstEquation)}`;
                break;
            }

            // Substitute the second equation
            case 1: {
                prompt = `${this.makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)} ${newLine}` +
                        `Isolate ${latexX} in the first equation, then substitute in the second equation`;
                placeholder = 'Ex: 14 - 4y';

                const latexInputPrefix = `${system.secondXProduct}(`;
                const latexInputPostfix = `)${system.addSecondYProduct}=${system.secondRightSide}`;

                inputPrefix = envelopLatex(latexInputPrefix);
                inputPostfix = envelopLatex(latexInputPostfix);

                const answer1 = system.firstRightSide + system.isolateFirstYProduct;
                let answer2 = this.manageYAddition(-1 * system.firstYProduct, '');

                answer2 += system.firstRightSide > 0 ? `+${system.firstRightSide}` : system.firstRightSide;

                const expectedAnswerLatex = [ envelopLatex(`${answer1}\\ `), envelopLatex(`\\ ${answer2}`) ];

                expectedAnswer = [ answer1, answer2 ];
                explanation = `Expected: ${expectedAnswerLatex[0]} or ${expectedAnswerLatex[1]}${newLine}` +
                            `Isolation yields: ${envelopLatex(system.isolateFirstEquation)}`;
                break;
            }

            // Solve the second equation after substitution
            case 2: {
                expectedAnswer = pickNumberInRange(-2, 2, [ 0 ]);
                system.firstRightSide *= expectedAnswer;
                system.secondRightSide *= expectedAnswer;
                system = this.createOrUpdateASystemOfEquations(system);

                prompt = `${this.makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)} ${newLine}` +
                        `After isolation and substitution: ${newLine}` +
                        `${this.makeLatexSystemOfEquations(system.isolateFirstEquation, system.substitutedSecondEquation)}` +
                        `${newLine}Solve for ${latexY}:`;

                const latexAnswer = envelopLatex(`${beginAlign}${system.substitutedSecondEquation}${latexEndLine}` +
                                                    `${system.solveForY}${latexEndLine}` +
                                                    `${system.simplifiedSolveForY}${latexEndLine}` +
                                                    `y &= ${expectedAnswer}${endAlign}`);

                answerType = ANSWER_TYPE.NUMBER;
                inputPrefix = envelopLatex('y =');
                explanation = `Expected: ${envelopLatex(expectedAnswer)} ${newLine}` +
                            `Solve for ${latexY} :${newLine}` +
                            `${latexAnswer}`;
                break;
            }

            //  Solve for x once y is known
            case 3: {
                const yValue = pickNumberInRange(-2, 3, [ 0 ]);
                const yEquals = `y = ${yValue}`;

                system.firstRightSide *= yValue;
                system.secondRightSide *= yValue;
                system = this.createOrUpdateASystemOfEquations(system);

                answerType = ANSWER_TYPE.NUMBER;
                inputPrefix = envelopLatex('x =');
                expectedAnswer = system.firstRightSide - (system.firstYProduct * yValue);
                placeholder = `Ex: ${pickNumberInRange(-10, 10, [ expectedAnswer ])}`;


                prompt = `${this.makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)} ${newLine}` +
                        `After isolation, substitution, and solving for ${latexY}:${newLine}` +
                        `${envelopLatex(yEquals)}${newLine}` +
                        `Solve for ${latexX}`;

                const solveForX = `x${this.plusOrMinus(system.firstYProduct)}` +
                                `(${Math.abs(system.firstYProduct)}${multiplicationSymbol}${yValue}) &= ${system.firstRightSide}`;
                const simplifiedSolveForX = `x${this.plusOrMinus(system.firstYProduct * yValue)}` +
                                            `${Math.abs(system.firstYProduct * yValue)} &= ${system.firstRightSide}`;
                const latexAnswer = `x &= ${expectedAnswer}`;

                explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Solving for ${latexX} in the first equation gives: ${newLine}` +
                            `${envelopLatex(beginAlign + solveForX + latexEndLine +
                                                simplifiedSolveForX + latexEndLine +
                                                latexAnswer + endAlign)}`;
                break;
            }

            // Solve for y
            case 4: {
                expectedAnswer = pickNumberInRange(-2, 3, [ 0 ]);
                system.firstRightSide *= expectedAnswer;
                system.secondRightSide *= expectedAnswer;
                system = this.createOrUpdateASystemOfEquations(system);

                answerType = ANSWER_TYPE.NUMBER;
                inputPrefix = envelopLatex('y =');

                const answer = `y &= ${expectedAnswer}`;

                prompt = `Solve for ${latexY}: ${newLine}${this.makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}`;
                explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +

                            `Isolate the variable ${latexX} in the first equation:${newLine}` +
                            `${envelopLatex(system.isolateFirstEquation + latexSpacing)}${newLine}` +

                            `Substitute ${latexX} in the second equation:${newLine}` +
                            `${envelopLatex(beginAlign + system.substitutedSecondEquation + endAlign + latexSpacing)}${newLine}` +

                            `Solve for ${latexY}:${newLine}` +
                            `${envelopLatex(beginAlign + system.solveForY + latexEndLine +
                                                system.simplifiedSolveForY + latexEndLine +
                                                answer + endAlign)}`;
                break;
            }

            // Solve the system
            case 5: {
                const yValue = pickNumberInRange(-2, 3, [ 0 ]);

                placeholder = 'Ex: 2, 5';
                system.firstRightSide *= yValue;
                system.secondRightSide *= yValue;
                system = this.createOrUpdateASystemOfEquations(system);

                prompt = `Solve the system of equations: ${newLine}` +
                        `${this.makeLatexSystemOfEquations(system.firstEquation, system.secondEquation)}`;

                const solveForX = envelopLatex(`x=${system.firstRightSide}${this.plusOrMinus(system.firstYProduct)}` +
                                                    `(${-1 * system.firstYProduct}${multiplicationSymbol}${yValue})`);

                const xValue = system.firstRightSide - (system.firstYProduct * yValue);
                const latexXValue = envelopLatex(`x = ${xValue}`);

                expectedAnswer = `${xValue},${yValue}`;
                inputPrefix = '(';
                inputPostfix = ')';
                answerType = ANSWER_TYPE.PAIR;

                const latexAnswer = envelopLatex(`(${expectedAnswer})`);
                const yEquals = `y&=${yValue}`;

                explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Isolate ${latexX} in the first equation:${newLine}` +
                            `${envelopLatex(system.isolateFirstEquation + latexSpacing)}${newLine}` +

                            `Substitute ${latexX} in the second equation:${newLine}` +
                            `${envelopLatex(beginAlign + system.substitutedSecondEquation + endAlign + latexSpacing)}${newLine}` +

                            `Solve for ${latexY} in the substituted equation:${newLine}` +
                            `${envelopLatex(beginAlign + system.solveForY + latexEndLine +
                                                yEquals + endAlign + latexSpacing)}${newLine}` +

                            `With the value of ${latexY}, solve for ${latexX} in the first equation:${newLine}` +
                            `${solveForX}${newLine}` +
                            `${latexXValue}${envelopLatex(latexSpacing)}${newLine}` +

                            `Give the answer in an ordered pair format: ${latexAnswer}`;
                break;
            }

            default: {
                throw new Error(`Level ${currentLevelIndex} does not exist`);
            }
        }

        const question = new Question(expectedAnswer, explanation, placeholder, prompt);

        question.setInputPrefixAndPostfix(inputPrefix, inputPostfix);
        question.setAnswerType(answerType);

        return question;
    };

    /**
        Creates a system of equations with integer results, or recalculates it's values.
        @method createOrUpdateASystemOfEquations
        @private
        @param {Object} [system] A system to update
        @return {Object} A new object containing all the variables needed in the system.
    */
    QuestionFactory.prototype.createOrUpdateASystemOfEquations = function(system = null) {
        const multiplicationSymbol = '\\cdot';

        let newSystem = system;

        // Recalculate the values of the system of equations
        if (newSystem === null) {
            const firstXProduct = 1;
            const secondXProduct = pickNumberInRange(2, 4);
            const ratio = secondXProduct / firstXProduct;

            const firstYProduct = pickNumberInRange(-5, 5, [ 0, firstXProduct, secondXProduct ]);
            const secondYProduct = pickNumberInRange(-5, 5, [ 0, firstXProduct, secondXProduct, firstYProduct, firstYProduct * ratio ]);

            const firstRightSide = pickNumberInRange(-5, 5, [ 0, firstXProduct, firstYProduct ]);
            const secondRightSide = (secondXProduct * firstYProduct * -1) + secondYProduct - (secondXProduct * firstRightSide * -1);

            newSystem = {
                firstXProduct, firstYProduct, firstRightSide,
                secondXProduct, secondYProduct, secondRightSide,
            };
        }

        newSystem.addFirstYProduct = this.manageYAddition(newSystem.firstYProduct);
        newSystem.addSecondYProduct = this.manageYAddition(newSystem.secondYProduct);

        newSystem.isolateFirstYProduct = this.manageYAddition(-1 * newSystem.firstYProduct);
        newSystem.firstEquation = `x ${newSystem.addFirstYProduct} &= ${newSystem.firstRightSide}`;
        newSystem.secondEquation = `${newSystem.secondXProduct}x ${newSystem.addSecondYProduct} &= ${newSystem.secondRightSide}`;

        newSystem.isolateFirstEquation = `x = ${newSystem.firstRightSide} ${newSystem.isolateFirstYProduct}`;
        newSystem.substitutedSecondEquation = `${newSystem.secondXProduct}${multiplicationSymbol} ( ${newSystem.firstRightSide}` +
                                                `${newSystem.isolateFirstYProduct} )${newSystem.addSecondYProduct}` +
                                                `&= ${newSystem.secondRightSide}`;
        newSystem.substitutedSecondEquationY = (newSystem.secondXProduct * -1 * newSystem.firstYProduct) + newSystem.secondYProduct;
        newSystem.susbtitutedSecondEquationConstants = newSystem.secondXProduct * newSystem.firstRightSide;

        const substitutedY = newSystem.secondXProduct * newSystem.firstYProduct * -1;
        const substitutedRightSide = newSystem.secondXProduct * newSystem.firstRightSide;
        let solveForY = `${substitutedRightSide}`;

        if (newSystem.secondXProduct * newSystem.firstYProduct * -1 >= 0) {
            solveForY += '+';
        }

        solveForY += `${substitutedY}y${newSystem.addSecondYProduct}` +
                    `&=${newSystem.secondRightSide}`;
        newSystem.solveForY = solveForY;

        const simplifiedSolveForY = `${substitutedY + newSystem.secondYProduct}y &=` +
                                    `${-1 * substitutedRightSide + newSystem.secondRightSide}`;

        newSystem.simplifiedSolveForY = simplifiedSolveForY;

        return newSystem;
    };

    /**
        Checks if a number is positive or negative to add a '+' sign. If the number is 1 or -1 it just returns 'y' or '-y'.
        @method manageYAddition
        @private
        @param {Number} yAddition The number that multiplies y.
        @param {String} [sign='+'] The sign of the addition
        @return {String} A string containing the addition.
    */
    QuestionFactory.prototype.manageYAddition = function(yAddition, sign = '+') {
        if (yAddition > 1) {
            return `${sign}${yAddition}y`;
        }
        else if (yAddition === 1) {
            return `${sign}y`;
        }
        else if (yAddition === -1) {
            return '-y';
        }
        return `${yAddition}y`;
    };

    /**
        Return a LaTeX system of equations.
        @method makeLatexSystemOfEquations
        @private
        @param {String} firstEquation The first equation in a LaTeX formatted string.
        @param {String} secondEquation The second equation in a LaTeX formatted string.
        @return {String} The system of equations in a LaTeX string.
    */
    QuestionFactory.prototype.makeLatexSystemOfEquations = function(firstEquation, secondEquation) {
        return envelopLatex(`\\begin{matrix} ${beginAlign} ${firstEquation} \\\\` +
                                `${secondEquation}${endAlign}\\end{matrix}\\`);
    };

    /**
        Envelops a LaTeX formatted string with a LaTeX prefix and postfix.
        @method envelopLatex
        @private
        @param {String} latex The latex formatted string.
        @return {String} The same |latex| string enveloped with the prefix and postfix.
    */
    QuestionFactory.prototype.envelopLatex = function(latex) {
        return `${latexPrefix} ${latex} ${latexPostfix}`;
    };

    /**
        Returns a plus or minus sign depending on the passed value.
        @method plusOrMinus
        @private
        @param {Number} value The value to check.
        @return {String} A '+' or '-' sign.
    */
    QuestionFactory.prototype.plusOrMinus = function(value) {
        return (value >= 0 ? '+' : '-');
    };
}
