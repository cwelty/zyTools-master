/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER, Parabola */
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
    const makeLatexFraction = require('utilities').makeLatexFraction;
    const envelopLatex = require('utilities').envelopLatex;
    const utilities = new (require('utilities').constructor);

    const latexEndLine = '\\\\[2pt]';
    const multiplicationSymbol = '\\cdot';

    const pFormula = `p = ${makeLatexFraction(1, '4a')}`;
    const standardGraphingForm = envelopLatex(`y = a(x - h)^{2} + k${latexEndLine}`);
    const vertexFormula = '(h, k)';


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
        Builds a question of level 1. Extract the axis of symmetry of given parabola.
        Ex: Given: y = -1/4(x + 2)^2 + 3 Answer: -2
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const axisOfSymmetryFormula = 'x = h';
        const parabola = new Parabola();
        const prompt = `Enter the axis of symmetry for the given parabola.${newLine}${parabola.print()}`;
        const placeholder = 'Ex: 6';
        const inputPrefix = envelopLatex('x =');
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const expectedAnswer = parabola.axisOfSymmetry;
        const axisOfSymmetry = envelopLatex(`x = ${expectedAnswer}`);

        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard graphing form of vertical parabola:${newLine}` +
                            `${standardGraphingForm}${newLine}` +
                            `Vertical parabola's axis of symmetry: ${envelopLatex(axisOfSymmetryFormula)}${newLine}` +
                            `Thus, axis of symmetry is: ${axisOfSymmetry}`;

        return { expectedAnswer, explanation, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2.
        Obtain the vertex. Ex: y = -1/4(x + 2)^2 + 3. Vertex: (-2, 3)
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const parabola = new Parabola();
        const vertexLatex = envelopLatex(vertexFormula);
        const validAnswerExplanation = VALID_ANSWER.POINT;
        const inputPrefix = '(';
        const inputPostfix = ')';
        const placeholder = 'Ex: 7, -5';
        const prompt = `Enter the vertex for the given parabola.${newLine}${parabola.print()}`;
        const expectedAnswer = parabola.vertex;
        const expectedAnswerLatex = envelopLatex(`(${expectedAnswer})`);
        const explanation = `Expected ${envelopLatex(expectedAnswer)}${newLine}` +
                      `Standard graphing form of vertical parabola:${newLine}` +
                      `${standardGraphingForm}${newLine}` +
                      `Vertex of parabola: ${vertexLatex}${newLine}` +
                      `Substitute h and k to get vertex: ${expectedAnswerLatex}`;

        return { expectedAnswer, explanation, inputPostfix, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3.
        Calculate the directrix. Ex: y = 1/4(x + 2)^2 + 3. Directrix = 4
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const parabola = new Parabola({ ensureIntegerP: true });

        // p = 1/(4a)
        const pDenominatorLatex = makeLatexFraction(1, `4${multiplicationSymbol}(${parabola.aLatex})`);
        const solvePFormula = envelopLatex(`${pFormula}${latexEndLine}` +
                                            `p = ${pDenominatorLatex}${latexEndLine}` +
                                            `p = ${parabola.pValue}${latexEndLine}`);

        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const expectedAnswer = parabola.directrix;
        const latexAnswer = envelopLatex(`y = ${parabola.kValue} ${parabola.pSubtraction} = ${expectedAnswer}`);
        const placeholder = `Ex: ${pickNumberInRange(-5, 5, [ 0, expectedAnswer ])}`;
        const inputPrefix = 'y =';
        const prompt = `Calculate the directrix for the given parabola.${newLine}${parabola.print()}`;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard graphing form of vertical parabola:${newLine}` +
                            `${standardGraphingForm}${newLine}` +
                            `Vertical parabola's directrix: ${envelopLatex('y=k-p')}${newLine}` +
                            `First calculate ${envelopLatex('p')} :${newLine}` +
                            `${solvePFormula}${newLine}` +
                            `Then calculate directrix:${newLine}` +
                            `${latexAnswer}`;

        return { expectedAnswer, explanation, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4.
        Calculate the focus. Ex: y = 1/4(x + 2)^2 + 3. Focus = (-2, 2)
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const focusFormula = '(h, k + p)';
        const parabola = new Parabola({ ensureIntegerP: true });

        const pDenominatorLatex = makeLatexFraction(1, `4${multiplicationSymbol}(${parabola.aLatex})`);
        const solvePFormula = envelopLatex(`${pFormula}${latexEndLine}` +
                                            `p = ${pDenominatorLatex}${latexEndLine}` +
                                            `p = ${parabola.pValue}${latexEndLine}`);

        const validAnswerExplanation = VALID_ANSWER.POINT;
        const expectedAnswer = parabola.focus;
        const latexAnswer = envelopLatex(`${focusFormula} = (${parabola.hValue}, ${parabola.kValue}${parabola.pAddition})` +
                                        ` = (${expectedAnswer})`);
        const placeholder = `Ex: ${pickNumberInRange(-5, 5, [ parabola.hValue ])}, ` +
                            `${pickNumberInRange(-5, 5, [ parabola.kValue - parabola.pValue ])}`;
        const inputPostfix = ')';
        const inputPrefix = '(';
        const prompt = `Calculate the focus for the given parabola.${newLine}${parabola.print()}`;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard graphing form of horizontal parabola:${newLine}` +
                            `${standardGraphingForm}${newLine}` +
                            `Horizontal parabola's focus: ${envelopLatex(focusFormula)}${newLine}` +
                            `First calculate ${envelopLatex('p')} :${newLine}` +
                            `${solvePFormula}${newLine}` +
                            `Then calculate focus:${newLine}` +
                            `${latexAnswer}`;

        return { expectedAnswer, explanation, inputPostfix, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5.
        Enter the standard graphing form of the vertical parabola for the given vertex and point.
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const parabola = new Parabola({ ensureIntegerA: true });
        const vertex = `(${parabola.vertex})`;

        // Avoid the point very far from h, so we don't have big squared numbers.
        const xRange = [ parabola.hValue - 3, parabola.hValue + 3 ];
        const pointX = pickNumberInRange(xRange[0], xRange[1], [ parabola.hValue ]);
        const solvedSquare = Math.pow(pointX - parabola.hValue, 2);
        const pointY = parabola.aValue * solvedSquare + parabola.kValue;
        const point = `(${pointX},${pointY})`;
        const latexA = envelopLatex('a');
        const latexX = envelopLatex('x');
        const latexY = envelopLatex('y');

        // The expected answer is parabola.print without the 'y=' part.
        const expectedAnswer = parabola.print({ latex: false }).substring(2);
        const validAnswerExplanation = VALID_ANSWER.EQUATION;
        const prompt = `Enter the standard graphing form of the <em>vertical</em> parabola for the given vertex and point.${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}${newLine}` +
                       `Vertex: ${envelopLatex(vertex)}${newLine}` +
                       `Point: ${envelopLatex(point)}`;
        const inputPrefix = envelopLatex('y=');
        const placeholder = `Ex: ${new Parabola({ ensureIntegerA: true }).print({ latex: false }).substring(2)}`;

        const substitutedVertex = envelopLatex(`y = a(x ${parabola.hSubtraction})^2 ${parabola.kAddition}${latexEndLine}`);
        const substitutedPoint = envelopLatex(`${pointY} = a(${pointX} ${parabola.hSubtraction})^2 ${parabola.kAddition}`);
        const simplify = envelopLatex(`${pointY - parabola.kValue} = ${solvedSquare}a`);
        const solveForA = envelopLatex(`${(pointY - parabola.kValue) / (solvedSquare)} = a${latexEndLine}`);

        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard graphing form of vertical parabola:${newLine}` +
                            `${standardGraphingForm}${newLine}` +
                            `Vertex: ${envelopLatex(vertexFormula)}${newLine}` +
                            `Substitute the values of the given vertex:${newLine}` +
                            `${substitutedVertex}${newLine}` +
                            `Find ${latexA} using the point. Substitute ${latexX} and ${latexY} and solve for ${latexA}:${newLine}` +
                            `${substitutedPoint}${newLine}` +
                            `${simplify}${newLine}` +
                            `${solveForA}${newLine}` +
                            `Complete the equation:${newLine}` +
                            `${envelopLatex(parabola.print({ latex: false }))}`;

        return { expectedAnswer, explanation, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 6.
        Enter the standard graphing form of the horizontal parabola for the given vertex and directrix.
        @method _levelSix
        @private
        @return {Object} An object with the needed level 6 Question's parameters.
    */
    QuestionFactory.prototype._levelSix = function() {
        const standardGraphingFormHorizontal = envelopLatex(`x = a(y - k)^{2} + h${latexEndLine}`);
        const parabola = new Parabola({ ensureIntegerA: true });
        const vertex = `(${parabola.vertex})`;
        const directrix = `x = ${parabola.hValue} - ${parabola.pLatexFraction}`;
        const latexA = envelopLatex('a');
        const latexP = envelopLatex('p');
        const oneOverA = makeLatexFraction(1, 'a');
        const latusRectumLength = envelopLatex(`${oneOverA}=4p`);

        const validAnswerExplanation = VALID_ANSWER.EQUATION;
        const expectedAnswer = parabola.print({ latex: false, horizontal: true }).substring(2);
        const prompt = 'Enter the standard graphing form of the <em>horizontal</em> parabola for the given vertex and directrix.' +
                       `${newLine}Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}${newLine}` +
                       `Vertex: ${envelopLatex(vertex)}${newLine}` +
                       `Directrix: ${envelopLatex(directrix)}`;
        const inputPrefix = envelopLatex('x=');
        const placeholder = `Ex: ${new Parabola({ ensureIntegerA: true }).print({ latex: false, horizontal: true }).substring(2)}`;

        const substitutedVertex = envelopLatex(`x = a(y ${parabola.kSubtraction})^2 ${parabola.hAddition}${latexEndLine}`);
        const latexPValue = envelopLatex(`p = ${parabola.pLatexFraction}`);
        const directrixSubstitute = envelopLatex(`${oneOverA} = 4${multiplicationSymbol}${parabola.pLatexFraction}`);
        const simplify = envelopLatex(`${oneOverA} = ${parabola.fourPLatexFraction}`);
        const solveForA = envelopLatex(`a = ${parabola.aValue}${latexEndLine}`);

        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard graphing form of horizontal parabola:${newLine}` +
                            `${standardGraphingFormHorizontal}${newLine}` +
                            `Vertex: ${envelopLatex(vertexFormula)}${newLine}` +
                            `Substitute the values of the given vertex:${newLine}` +
                            `${substitutedVertex}${newLine}` +
                            `Find ${latexA} with ${latusRectumLength}. Get ${latexP} from the directrix:${newLine}` +
                            `Horizontal parabola's directrix: ${envelopLatex('x=h-p')}${newLine}` +
                            `${latexPValue}${newLine}` +
                            `${directrixSubstitute}${newLine}` +
                            `${simplify}${newLine}` +
                            `${solveForA}${newLine}` +
                            `Complete the equation:${newLine}` +
                            `${envelopLatex(parabola.print({ latex: false, horizontal: true }))}`;

        return { expectedAnswer, explanation, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 7.
        Convert the given quadratic function form to standard graphing form.
        @method _levelSeven
        @private
        @return {Object} An object with the needed level 7 Question's parameters.
    */
    QuestionFactory.prototype._levelSeven = function() {

        // Ensure easy solution
        // quadraticCoefficient is 3 in '3x^2 + 12x + 5'
        // middleCoefficient is 12 in '3x^2 + 12x + 5'
        // multiplyMiddle is the 4 in '3(x^2 + 4x) + 5', and that's the previous equation with 3 factored out.
        // constant is the 5 in '3(x^2 + 4x) + 5'
        const multiplyMiddle = require('utilities').flipCoin() ? 4 : -4;
        const quadraticCoefficient = pickNumberInRange(-3, 3, [ -1, 0, 1 ]);
        const middleCoefficient = multiplyMiddle * quadraticCoefficient;
        const constant = pickNumberInRange(-5, 5, [ -4, -2, 0, 2, 4, multiplyMiddle ]) * quadraticCoefficient;

        const middleAddition = utilities.stringifyConstantValue(middleCoefficient, false, false).replace(utilities.subtractionSymbol, '-');
        const multiplyMiddleAddition = utilities.stringifyConstantValue(multiplyMiddle, false, false)
                                                .replace(utilities.subtractionSymbol, '-');
        const constantAddition = utilities.stringifyConstantValue(constant, false, true).replace(utilities.subtractionSymbol, '-');

        const quadraticEquation = `y = ${quadraticCoefficient}x^2 ${middleAddition}x ${constantAddition}`;
        const quadraticEquationLatex = envelopLatex(quadraticEquation);

        const halfMiddle = multiplyMiddle / 2;
        const halfMiddleLatex = makeLatexFraction(multiplyMiddle, 2);
        const halfMiddleSquared = Math.pow(halfMiddle, 2);
        const halfMiddleSquaredAddition = utilities.stringifyConstantValue(halfMiddleSquared, false, true)
                                                   .replace(utilities.subtractionSymbol, '-');
        const negativeHalfMiddleSquaredTimesCoefficientAddition = utilities.stringifyConstantValue(
                                                                            -1 * (halfMiddleSquared * quadraticCoefficient), false, true)
                                                                            .replace(utilities.subtractionSymbol, '-');
        const sqrootMiddle = Math.sqrt(Math.abs(multiplyMiddle));

        const multiplyMiddleSign = (multiplyMiddle >= 0 ? '+' : '-');
        const expectedAnswer = `${quadraticCoefficient}(x${multiplyMiddleSign}${sqrootMiddle})^2` +
                                `${utilities.stringifyConstantValue(constant - (quadraticCoefficient * halfMiddleSquared), false, true)
                                            .replace(utilities.subtractionSymbol, '-')}`;

        const step1 = envelopLatex(`y = ${quadraticCoefficient}(x^2${multiplyMiddleAddition}x)${constantAddition}${latexEndLine}`);
        const step2 = envelopLatex(`y = ${quadraticCoefficient}(x^2${multiplyMiddleAddition}x+${halfMiddleLatex}^2)` +
                                    `${constantAddition}-${Math.abs(quadraticCoefficient)}${multiplicationSymbol}${halfMiddleLatex}^2`);
        const step3 = envelopLatex(`y = ${quadraticCoefficient}(x^2${multiplyMiddleAddition}${halfMiddleSquaredAddition})` +
                                    `${constantAddition}${negativeHalfMiddleSquaredTimesCoefficientAddition}${latexEndLine}`);
        const step4 = envelopLatex(`y=${expectedAnswer}`);

        const validAnswerExplanation = VALID_ANSWER.EQUATION;
        const prompt = `Convert the given quadratic function form to standard graphing form.${newLine}` +
                        `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}${newLine}` +
                        `${quadraticEquationLatex}`;
        const inputPrefix = envelopLatex('y=');
        const placeholder = `Ex: ${new Parabola({ ensureIntegerA: true }).print({ latex: false }).substring(2)}`;

        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `The coefficient of the quadratic term is factored out from the first two terms:${newLine}` +
                            `${step1}${newLine}` +
                            'Add the square of half the middle coefficient to the inside of the parentheses, ' +
                            `and substract outside multiplied by the coefficient of the parentheses.${newLine}` +
                            `${step2}${newLine}` +
                            `${step3}${newLine}` +
                            `Factor the inside of the parentheses and simplify:${newLine}` +
                            `${step4}`;

        return { expectedAnswer, explanation, inputPrefix, placeholder, prompt, validAnswerExplanation };
    };
}
