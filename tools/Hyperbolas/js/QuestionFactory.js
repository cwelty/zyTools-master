/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER, Hyperbola */
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
    const makeLatexFraction = utilities.makeLatexFraction;

    const latexEndLine = '\\\\';
    const beginAlign = '\\begin{align}';
    const endAlign = '\\end{align}';

    const centerFormula = '(h, k)';
    const distanceFormula = 'c^2 &= a^2 - b^2';

    /**
        Make a new question for the given level.
        @method make
        @param {Number} currentLevelIndex The current level's index. Ranges from 0 .. |numberOfQuestions|-1.
        @return {Question} The new question.
    */
    QuestionFactory.prototype.make = function(currentLevelIndex) {
        const levelIndexToQuestion = [
            this._levelOne,
            this._levelTwo,
            this._levelThree,
            this._levelFour,
            this._levelFive,
            this._levelSix,
            this._levelSeven,
        ];

        return new Question(levelIndexToQuestion[currentLevelIndex]());
    };

    /**
        Builds a question of level 1. Enter the center.
        Ex: ((y - 3)^2 / 64) - ((x - 2)^2 / 4) = 1      Answer: (2, 3)
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const hyperbola = new Hyperbola();
        const inputPrefix = '(';
        const inputPostfix = ')';
        const placeholder = `Ex: ${pickNumberInRange(-6, 6, [ hyperbola.hValue ])}, ${pickNumberInRange(-6, 6, [ hyperbola.kValue ])}`;
        const prompt = `Enter the center for the given hyperbola:${newLine}${hyperbola.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POINT;
        const expectedAnswer = hyperbola.center;
        const latexAnswer = envelopLatex(`(${expectedAnswer})`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard graphing form of hyperbola:${newLine}` +
                            `${hyperbola.standardGraphingForm}${newLine}` +
                            `Center: ${envelopLatex(centerFormula)}${newLine}` +
                            `Substitute ${envelopLatex('h')} and ${envelopLatex('k')} to get the center: ${latexAnswer}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Calculate a vertex.
        Ex: ((y - 6)^2 / 25) - ((x - 2)^2 / 9) = 1      Answer = (1, 2) or (11, 2)
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const hyperbola = new Hyperbola();
        const inputPrefix = '(';
        const inputPostfix = ')';
        let placeholder = `Ex: ${pickNumberInRange(-6, 6, [ hyperbola.hValue ])}, ` +
                              `${pickNumberInRange(-6, 6, [ hyperbola.kValue + hyperbola.aValue, hyperbola.kValue - hyperbola.aValue ])}`;
        let calculateVertices = [ envelopLatex(`\\small{(${hyperbola.hValue}, ${hyperbola.kValue} + ${hyperbola.aValue})}`),
                                  envelopLatex(`\\small{(${hyperbola.hValue}, ${hyperbola.kValue} - ${hyperbola.aValue})}`) ];

        if (hyperbola.isHorizontal) {
            placeholder = `Ex: ${pickNumberInRange(-6, 6, [ hyperbola.hValue + hyperbola.aValue, hyperbola.hValue - hyperbola.aValue ])},` +
                             ` ${pickNumberInRange(-6, 6, [ hyperbola.kValue, hyperbola.kValue ])}`;
            calculateVertices = [ envelopLatex(`\\small{(${hyperbola.hValue} + ${hyperbola.aValue}, ${hyperbola.kValue})}`),
                                  envelopLatex(`\\small{(${hyperbola.hValue} - ${hyperbola.aValue}, ${hyperbola.kValue})}`) ];
        }
        const prompt = `Calculate either vertex for the given hyperbola:${newLine}${hyperbola.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POINT_ARRAY;
        const expectedAnswer = hyperbola.vertices;

        const vertexDistance = envelopLatex(`\\sqrt{a^2} = \\sqrt{${hyperbola.aSquared}} = \\pm${hyperbola.aValue}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])} or ${envelopLatex(expectedAnswer[1])}${newLine}` +
                            `Standard graphing form of hyperbola:${newLine}` +
                            `${hyperbola.standardGraphingForm}${newLine}` +
                            `Center: ${envelopLatex(`(${hyperbola.center})`)}${newLine}` +
                            `Distance from vertex: ${vertexDistance}${newLine}` +
                            `Vertices: ${calculateVertices[0]} and ${calculateVertices[1]}${newLine}` +
                            `Vertices: ${envelopLatex(`(${expectedAnswer[0]})`)} and ${envelopLatex(`(${expectedAnswer[1]})`)}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Calculate a asymptote's slope in a horizontal hyperbola.
        Ex: ((x - 1)^2 / 49) - ((y + 6)^2 / 25) = 1     Answers = 5/7, -5/7
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const hyperbola = new Hyperbola({ forceHorizontal: true });
        const placeholder = `Ex: ${pickNumberInRange(1, 8, [ hyperbola.aValue, hyperbola.bValue ])} / ` +
                            `${pickNumberInRange(1, 8, [ hyperbola.aValue, hyperbola.bValue ])}`;
        const prompt = `Calculate either asymptote's slope for the given hyperbola:${newLine}${hyperbola.print()}`;
        const validAnswerExplanation = VALID_ANSWER.FRACTION;
        const expectedAnswer = hyperbola.asymptotesValues;
        const yEquals = 'y =';
        const xMinusH = `(x${hyperbola.hSubtraction})`;
        const inputPrefix = envelopLatex(yEquals);
        const inputPostfix = envelopLatex(xMinusH);

        const asymptotesFormula = [ envelopLatex(`${yEquals}\\left(${makeLatexFraction('b', 'a', { large: true })}\\right)` +
                                                 `(x-h)${latexEndLine}`),
                                    envelopLatex(`${yEquals}\\left(${makeLatexFraction('-b', 'a', { large: true })}\\right)` +
                                                 `(x-h)${latexEndLine}`) ];

        const step1Fractions = [ makeLatexFraction(`\\sqrt{${hyperbola.bSquared}}`, `\\sqrt{${hyperbola.aSquared}}`, { large: true }),
                                 makeLatexFraction(`-\\sqrt{${hyperbola.bSquared}}`, `\\sqrt{${hyperbola.aSquared}}`, { large: true }) ];
        const step1 = [ envelopLatex(`${yEquals}\\left(${step1Fractions[0]}\\right)${xMinusH}${latexEndLine}`),
                        envelopLatex(`${yEquals}\\left(${step1Fractions[1]}\\right)${xMinusH}${latexEndLine}`) ];
        const latexAnswerFractions = [ makeLatexFraction(hyperbola.bValue, hyperbola.aValue, { large: true }),
                                       makeLatexFraction(-hyperbola.bValue, hyperbola.aValue, { large: true }) ];
        const latexAnswer = [ envelopLatex(`${yEquals}\\left(${latexAnswerFractions[0]}\\right)${xMinusH}`),
                              envelopLatex(`${yEquals}\\left(${latexAnswerFractions[1]}\\right)${xMinusH}`) ];

        const explanation = `Expected: ${envelopLatex(hyperbola.asymptotes[0])} or ${envelopLatex(hyperbola.asymptotes[1])}${newLine}` +
                            `The given hyperbola is horizontal, so the standard graphing form is:${newLine}` +
                            `${hyperbola.standardGraphingForm}${newLine}` +
                            `For horizontal hyperbolas:${newLine}` +
                            `${asymptotesFormula[0]} and ${asymptotesFormula[1]}${newLine}` +
                            `Substitute:${newLine}` +
                            `${step1[0]} and ${step1[1]}${newLine}` +
                            `Simplify:${newLine}` +
                            `${latexAnswer[0]} and ${latexAnswer[1]}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Calculate a asymptote's slope in a vertical hyperbola.
        Ex: ((y - 3)^2 / 49) - ((x + 1)^2 / 4) = 1
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const hyperbola = new Hyperbola({ forceVertical: true });
        const placeholder = `Ex: ${pickNumberInRange(1, 8, [ hyperbola.aValue, hyperbola.bValue ])} / ` +
                            `${pickNumberInRange(1, 8, [ hyperbola.aValue, hyperbola.bValue ])}`;
        const prompt = `Calculate either asymptote's slope for the given hyperbola:${newLine}${hyperbola.print()}`;
        const validAnswerExplanation = VALID_ANSWER.FRACTION;
        const expectedAnswer = hyperbola.asymptotesValues;
        const yEquals = 'y =';
        const xMinusH = `(x${hyperbola.hSubtraction})`;
        const inputPrefix = envelopLatex(yEquals);
        const inputPostfix = envelopLatex(xMinusH);

        const asymptotesFormula = [ envelopLatex(`${yEquals}\\left(${makeLatexFraction('a', 'b', { large: true })}\\right)` +
                                                 `(x-h)${latexEndLine}`),
                                    envelopLatex(`${yEquals}\\left(${makeLatexFraction('-a', 'b', { large: true })}\\right)` +
                                                 `(x-h)${latexEndLine}`) ];

        const step1Fractions = [ makeLatexFraction(`\\sqrt{${hyperbola.aSquared}}`, `\\sqrt{${hyperbola.bSquared}}`, { large: true }),
                                 makeLatexFraction(`-\\sqrt{${hyperbola.aSquared}}`, `\\sqrt{${hyperbola.bSquared}}`, { large: true }) ];
        const step1 = [ envelopLatex(`${yEquals}\\left(${step1Fractions[0]}\\right)${xMinusH}${latexEndLine}`),
                        envelopLatex(`${yEquals}\\left(${step1Fractions[1]}\\right)${xMinusH}${latexEndLine}`) ];
        const latexAnswerFractions = [ makeLatexFraction(hyperbola.aValue, hyperbola.bValue, { large: true }),
                                       makeLatexFraction(-hyperbola.aValue, hyperbola.bValue, { large: true }) ];
        const latexAnswer = [ envelopLatex(`${yEquals}\\left(${latexAnswerFractions[0]}\\right)${xMinusH}`),
                              envelopLatex(`${yEquals}\\left(${latexAnswerFractions[1]}\\right)${xMinusH}`) ];

        const explanation = `Expected: ${envelopLatex(hyperbola.asymptotes[0])} or ${envelopLatex(hyperbola.asymptotes[1])}${newLine}` +
                            `The given hyperbola is vertical, so the standard graphing form is:${newLine}` +
                            `${hyperbola.standardGraphingForm}${newLine}` +
                            `For vertical hyperbolas:${newLine}` +
                            `${asymptotesFormula[0]} and ${asymptotesFormula[1]}${newLine}` +
                            `Substitute:${newLine}` +
                            `${step1[0]} and ${step1[1]}${newLine}` +
                            `Simplify:${newLine}` +
                            `${latexAnswer[0]} and ${latexAnswer[1]}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Calculate either focus in a horizontal hyperbola.
        Ex: ((x - 1)^2 / 5) - ((y + 1)^2 / 76) = 1      Answers: (10, -1) or (-8, -1)
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const hyperbola = new Hyperbola({ integerDistance: true, forceHorizontal: true });
        const placeholder = `Ex: ${pickNumberInRange(-6, 6, [ hyperbola.hValue + hyperbola.distance,
                                                              hyperbola.hValue - hyperbola.distance ])},` +
                                `${pickNumberInRange(-6, 6, [ hyperbola.kValue ])}`;
        const prompt = `Calculate either focus for the given hyperbola:${newLine}${hyperbola.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POINT_ARRAY;
        const expectedAnswer = hyperbola.foci;
        const inputPrefix = '(';
        const inputPostfix = ')';
        const fociCalculations = [ `(${hyperbola.hValue} + ${hyperbola.distance},${hyperbola.kValue})`,
                                   `(${hyperbola.hValue} - ${hyperbola.distance},${hyperbola.kValue})` ];

        const latexDistance = envelopLatex(`${beginAlign}${distanceFormula}${latexEndLine}` +
                                           `c &= \\sqrt{${hyperbola.aSquared} + ${hyperbola.bSquared}} = \\pm${hyperbola.distance}` +
                                           `${endAlign}${latexEndLine}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])} or ${envelopLatex(expectedAnswer[1])}${newLine}` +
                            `The given hyperbola is horizontal, so the standard graphing form is:${newLine}` +
                            `${hyperbola.standardGraphingForm}${newLine}` +
                            `Center of hyperbola: ${envelopLatex(`${centerFormula}=(${hyperbola.center})`)}${newLine}` +
                            `Calculate the distance from the center to each focus:${newLine}` +
                            `${latexDistance}${newLine}` +
                            'The foci of a horizontal hyperbola are located in the x direction, ' +
                            `so ${envelopLatex('c')} is added to and subtracted from the x-coordinate of the center:${newLine}` +
                            `${envelopLatex(fociCalculations[0])} and ${envelopLatex(fociCalculations[1])}${newLine}` +
                            `Foci are: ${envelopLatex(`(${expectedAnswer[0]})`)} and ${envelopLatex(`(${expectedAnswer[1]})`)}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 6. Calculate either foci in a vertical hyperbola.
        Ex: ((y + 4)^2 / 5) - ((x + 1)^2 / 20) = 1      Answers: (-1, 1) or (-1, -9)
        @method _levelSix
        @private
        @return {Object} An object with the needed level 6 Question's parameters.
    */
    QuestionFactory.prototype._levelSix = function() {
        const hyperbola = new Hyperbola({ integerDistance: true, forceVertical: true });
        const placeholder = `Ex: ${pickNumberInRange(-6, 6, [ hyperbola.hValue ])},` +
                                `${pickNumberInRange(-6, 6, [ hyperbola.kValue + hyperbola.distance,
                                                              hyperbola.kValue - hyperbola.distance ])}`;
        const prompt = `Calculate either focus for the given hyperbola:${newLine}${hyperbola.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POINT_ARRAY;
        const expectedAnswer = hyperbola.foci;
        const inputPrefix = '(';
        const inputPostfix = ')';
        const fociCalculations = [ `(${hyperbola.hValue},${hyperbola.kValue} + ${hyperbola.distance})`,
                                   `(${hyperbola.hValue},${hyperbola.kValue} - ${hyperbola.distance})` ];

        const latexDistance = envelopLatex(`${beginAlign}${distanceFormula}${latexEndLine}` +
                                           `c &= \\sqrt{${hyperbola.aSquared} + ${hyperbola.bSquared}} = \\pm${hyperbola.distance}` +
                                           `${endAlign}${latexEndLine}`);

        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])} or ${envelopLatex(expectedAnswer[1])}${newLine}` +
                            `The given hyperbola is vertical, so the standard graphing form is:${newLine}` +
                            `${hyperbola.standardGraphingForm}${newLine}` +
                            `Center of hyperbola: ${envelopLatex(`${centerFormula}=(${hyperbola.center})`)}${newLine}` +
                            `Calculate the distance from the center to each focus:${newLine}` +
                            `${latexDistance}${newLine}` +
                            'The foci of a vertical hyperbola are located in the y direction, ' +
                            `so c is added to and subtracted from the y-coordinate of the center:${newLine}` +
                            `${envelopLatex(fociCalculations[0])} and ${envelopLatex(fociCalculations[1])}${newLine}` +
                            `Foci are: ${envelopLatex(`(${expectedAnswer[0]})`)} and ${envelopLatex(`(${expectedAnswer[1]})`)}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 7. Convert to standard form.
        Ex: 4x^2 + 32x - (y + 7)^2 = 0      Answer: ((x + 4)^2 / 16) - ((y + 7)^2 / 64) = 1
        @method _levelSeven
        @private
        @return {Object} An object with the needed level 7 Question's parameters.
    */
    QuestionFactory.prototype._levelSeven = function() {
        const xCommonFactor = pickNumberInRange(2, 4);
        const halfXCoefficient = pickNumberInRange(1, 5);
        const halfXCoefficientSquared = Math.pow(halfXCoefficient, 2);
        const halfXCoefficientSquaredTimesCommonFactor = halfXCoefficientSquared * xCommonFactor;
        const xCoefficient = halfXCoefficient * 2;
        const xCoefficientTimesCommonFactor = xCoefficient * xCommonFactor;

        const stringXCommonFactor = utilities.stringifyConstantValue(xCommonFactor, true);
        const stringHalfXCoefficient = utilities.stringifyConstantValue(halfXCoefficient, false, true);
        const stringHalfXCoefficientSquared = utilities.stringifyConstantValue(halfXCoefficientSquared, false, true);
        const stringHalfXCoefficientSquaredTimesCommonFactor = utilities.stringifyConstantValue(halfXCoefficientSquaredTimesCommonFactor,
                                                                                                false, true);
        const stringXCoefficient = utilities.stringifyConstantValue(xCoefficient, false, true);
        const stringXCoefficientTimesCommonFactor = utilities.stringifyConstantValue(xCoefficientTimesCommonFactor);

        const yConstant = pickNumberInRange(1, 9);
        const stringYConstant = utilities.stringifyConstantValue(yConstant, false, true);

        const constant = 0;
        const denominatorX = halfXCoefficientSquaredTimesCommonFactor / xCommonFactor;
        const denominatorY = halfXCoefficientSquaredTimesCommonFactor;

        const nonStandard = `${stringXCommonFactor}x^2${stringXCoefficientTimesCommonFactor}x - ` +
                            `(y${stringYConstant})^2 = ${constant}`;

        const placeholder = 'Ex: ((x - 1)^2) / 2 - ((y + 2)^2) / 4';
        const inputPostfix = '= 1';
        const prompt = `Convert to the standard form of a hyperbola.${newLine}` +
                       `${envelopLatex(nonStandard)}`;
        const validAnswerExplanation = VALID_ANSWER.EQUATION;

        const expectedAnswer = `((x${stringHalfXCoefficient})^2)/${denominatorX}-((y${stringYConstant})^2)/${denominatorY}`;

        const step1Latex = `(${stringXCommonFactor}x^2 ${stringXCoefficientTimesCommonFactor}x) - ` +
                           `(y ${stringYConstant})^2 = 0`;
        const step2Latex = `${stringXCommonFactor}(x^2 ${stringXCoefficient}x) - ` +
                           `(y ${stringYConstant})^2 = 0`;
        const step3Latex = `${stringXCommonFactor}(x^2 ${stringXCoefficient}x ${stringHalfXCoefficientSquared}) - ` +
                           `(y ${stringYConstant})^2 = 0 ${stringHalfXCoefficientSquaredTimesCommonFactor}`;
        const step4Latex = `${stringXCommonFactor}(x ${stringHalfXCoefficient})^2 - ` +
                           `(y ${stringYConstant})^2 = ${halfXCoefficientSquaredTimesCommonFactor}`;
        const step5Latex = `${makeLatexFraction(`(x ${stringHalfXCoefficient})^2`, denominatorX, { large: true })} - ` +
                           `${makeLatexFraction(`(y ${stringYConstant})^2`, denominatorY, { large: true })} = 1`;

        const latexAnswer = envelopLatex(`\\phantom{x}${latexEndLine}` +
                            `(1) \\phantom{x} ${nonStandard}${latexEndLine}` +
                            `(2) \\phantom{x} ${step1Latex}${latexEndLine}` +
                            `(3) \\phantom{x} ${step2Latex}${latexEndLine}` +
                            `(4) \\phantom{x} ${step3Latex}${latexEndLine}` +
                            `(5) \\phantom{x} ${step4Latex}${latexEndLine}` +
                            `(6) \\phantom{x} ${step5Latex}${latexEndLine}`);

        const englishAnswer = `(1) Non-standard form${newLine}` +
                              `(2) Prepare equation${newLine}` +
                              `(3) Factor out the coefficients${newLine}` +
                              `(4) Complete the square${newLine}` +
                              `(5) Rewrite as squared binomial${newLine}` +
                              `(6) Set equation equal to 1 and write in standard form${newLine}`;
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `${englishAnswer}` +
                            `${latexAnswer}`;

        return { expectedAnswer, explanation, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

}
