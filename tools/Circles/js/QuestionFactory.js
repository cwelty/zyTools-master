/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER, Circle, createQuadraticForm */
/* exported buildQuestionFactoryPrototype */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Factory that makes {Question}s.
    @class QuestionFactory
    @extends singleInputQuestionProgressionTool.QuestionFactory
    @param {Number} id The ID of the tool.
    @constructor
*/
function QuestionFactory(id) {
    this.numberOfQuestions = 5;
    this.id = id;
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

    const latexEndLine = '\\\\[2pt]';
    const standardGraphingForm = envelopLatex('(x - h)^2 + (y - k)^2 = r^2');
    const centerFormula = '(h, k)';

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
        ];

        return new Question(levelIndexToQuestion[currentLevelIndex]());
    };

    /**
        Builds a question of level 1. Extract the center.
        Ex: Given (x - 4)^2 + (y + 2)^2 = 5^2, the center is (4, -2)
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const circle = new Circle();
        const inputPrefix = '(';
        const inputPostfix = ')';
        const placeholder = `Ex: ${pickNumberInRange(-5, 5, [ circle.hValue ])}, ${pickNumberInRange(-5, 5, [ circle.kValue ])}`;
        const prompt = `Enter the center for the given circle:${newLine}${circle.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POINT;

        const expectedAnswer = `${circle.center}`;
        const latexAnswer = envelopLatex(`(${expectedAnswer})`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard form of a circle: ${standardGraphingForm}${newLine}` +
                            `Center: ${envelopLatex(centerFormula)}${newLine}` +
                            `Substitute ${envelopLatex('h')} and ${envelopLatex('k')} to get the center: ${latexAnswer}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Calculate the radius.
        Ex: Given (x - 4)^2 + (y + 2)^2 = 5^2, the radius is 5.
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const circle = new Circle();
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const placeholder = `Ex: ${pickNumberInRange(-5, 5, [ 0, circle.radius ])}`;
        const prompt = `Calculate the radius for the given circle:${newLine}${circle.print()}`;
        const expectedAnswer = circle.radius;
        const calculateRadius = envelopLatex(`r = \\sqrt{r^2} = \\sqrt{${circle.radiusSquared}} = ${circle.radius}`);
        const answerLatex = envelopLatex(`r = ${circle.radius}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard form of a circle: ${standardGraphingForm}${newLine}` +
                            `Radius is ${envelopLatex('r')}:${newLine}` +
                            `${calculateRadius}${newLine}` +
                            `${answerLatex}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Find the standard form of a circle given it's center and radius.
        Ex: Center: (-5, -6), Radius: 6     Answer: (x + 5)^2 + (y + 6)^2 = 36
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const circle = new Circle();
        const validAnswerExplanation = VALID_ANSWER.EQUATION;
        const expectedAnswer = [ circle.print(false), `(y${circle.kSubtraction})^2+(x${circle.hSubtraction})^2=${circle.radiusSquared}` ];
        const placeholder = `Ex: ${new Circle().print(false)}`;
        const givenCenter = envelopLatex(`(${circle.center})`);
        const givenRadius = envelopLatex(circle.radius);
        const prompt = `Enter the standard graphing form of a circle given a center and radius:${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}${newLine}` +
                       `Center: ${givenCenter}${newLine}` +
                       `Radius: ${givenRadius}`;

        const calculateRadius = envelopLatex(`r = \\sqrt{r^2} = \\sqrt{${circle.radiusSquared}} = ${circle.radius}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}${newLine}` +
                            `Standard form of a circle: ${standardGraphingForm}${newLine}` +
                            `Center: ${envelopLatex(centerFormula)}${newLine}` +
                            `Radius: ${calculateRadius}${newLine}` +
                            `Substitute the values of the given center and radius:${newLine}` +
                            `${envelopLatex(expectedAnswer[0])}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Convert from quadratic form to the standard form of a circle.
        Ex: (x^2 - 8x) + (y^2 + 10y) = -25      Answer: (x - 4)^2 + (y + 5)^2 = 16
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const quadratic = createQuadraticForm();

        const stringHalfXCoefficient = utilities.stringifyConstantValue(quadratic.halfXCoefficient, false, true)
                                                .replace(utilities.subtractionSymbol, '-');
        const stringHalfXCoefficientSquared = utilities.stringifyConstantValue(quadratic.halfXCoefficientSquared, false, true)
                                                       .replace(utilities.subtractionSymbol, '-');
        const stringXCoefficient = utilities.stringifyConstantValue(quadratic.xCoefficient)
                                            .replace(utilities.subtractionSymbol, '-');

        const stringHalfYCoefficient = utilities.stringifyConstantValue(quadratic.halfYCoefficient, false, true)
                                                .replace(utilities.subtractionSymbol, '-');
        const stringHalfYCoefficientSquared = utilities.stringifyConstantValue(quadratic.halfYCoefficientSquared, false, true)
                                                       .replace(utilities.subtractionSymbol, '-');
        const stringYCoefficient = utilities.stringifyConstantValue(quadratic.yCoefficient)
                                            .replace(utilities.subtractionSymbol, '-');

        const nonStandardForm = `\\left(x^2${stringXCoefficient}x\\right) + \\left(y^2${stringYCoefficient}y\\right)` +
                                `= ${quadratic.constant}`;
        const step1Latex = `\\left(x^2${stringXCoefficient}x+${makeLatexFraction(quadratic.xCoefficient, 2, { small: true })}^2\\right)+` +
                           `\\left(y^2${stringYCoefficient}y+${makeLatexFraction(quadratic.yCoefficient, 2, { small: true })}^2\\right)=` +
                           `${quadratic.constant} + ${makeLatexFraction(quadratic.xCoefficient, 2, { small: true })}^2 + ` +
                           `${makeLatexFraction(quadratic.yCoefficient, 2, { small: true })}^2`;
        const step2Latex = `\\left(x^2${stringXCoefficient}x${stringHalfXCoefficientSquared}\\right) + ` +
                           `\\left(y^2${stringYCoefficient}y${stringHalfYCoefficientSquared}\\right) = ` +
                           `${quadratic.constant}${stringHalfXCoefficientSquared}${stringHalfYCoefficientSquared}`;
        const xFirstAnswer = `\\left(x${stringHalfXCoefficient}\\right)^2+\\left(y${stringHalfYCoefficient}\\right)^2 =` +
                             `${Math.pow(quadratic.radius, 2)}`;

        const latexAnswer = envelopLatex(`\\phantom{x}${latexEndLine}` +
                                        `(1) \\phantom{x} ${nonStandardForm}${latexEndLine}` +
                                        `(2) \\phantom{x} ${step1Latex}${latexEndLine}` +
                                        `(3) \\phantom{x} ${step2Latex}${latexEndLine}` +
                                        `(4) \\phantom{x} \\phantom{x} ${xFirstAnswer}`);
        const englishAnswer = `(1) Complete the square for the ${envelopLatex('x')} and ${envelopLatex('y')} terms${newLine}` +
                              `(2) Simplify${newLine}` +
                              `(3) Factor and simplify${newLine}` +
                              '(4) Answer';
        const expectedAnswer = [ `(x${stringHalfXCoefficient})^2+(y${stringHalfYCoefficient})^2=${Math.pow(quadratic.radius, 2)}`,
                                 `(y${stringHalfYCoefficient})^2+(x${stringHalfXCoefficient})^2=${Math.pow(quadratic.radius, 2)}` ];

        const prompt = `Convert to standard form of circle:${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}${newLine}` +
                       `${envelopLatex(nonStandardForm.replace(/&/g, ''))}`;
        const placeholder = `Ex: ${new Circle().print(false)}`;

        const validAnswerExplanation = VALID_ANSWER.EQUATION;
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}${newLine}` +
                            `${englishAnswer}${newLine}${latexAnswer}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Convert from quadratic form to the standard form of a circle.
        Ex: 5x^2 + 5y^2 - 10x + 20y = -5        Answer: (x-1)^2 + (y+2)^2 = 2
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const commonFactor = pickNumberInRange(2, 6);
        const quadratic = createQuadraticForm();

        const stringXSquaredCoefficient = utilities.stringifyConstantValue(commonFactor, true, false);
        const stringHalfXCoefficient = utilities.stringifyConstantValue(quadratic.halfXCoefficient, false, true)
                                                .replace(utilities.subtractionSymbol, '-');
        const stringHalfXCoefficientSquared = utilities.stringifyConstantValue(quadratic.halfXCoefficientSquared, false, true)
                                                       .replace(utilities.subtractionSymbol, '-');
        const stringXCoefficient = utilities.stringifyConstantValue(quadratic.xCoefficient)
                                            .replace(utilities.subtractionSymbol, '-');
        const stringXCoefficientTimesCommonFactor = utilities.stringifyConstantValue(quadratic.xCoefficient * commonFactor)
                                                             .replace(utilities.subtractionSymbol, '-');

        const stringYSquaredCoefficient = utilities.stringifyConstantValue(commonFactor, false, false);
        const stringHalfYCoefficient = utilities.stringifyConstantValue(quadratic.halfYCoefficient, false, true)
                                                .replace(utilities.subtractionSymbol, '-');
        const stringHalfYCoefficientSquared = utilities.stringifyConstantValue(quadratic.halfYCoefficientSquared, false, true)
                                                       .replace(utilities.subtractionSymbol, '-');
        const stringYCoefficient = utilities.stringifyConstantValue(quadratic.yCoefficient)
                                            .replace(utilities.subtractionSymbol, '-');
        const stringYCoefficientTimesCommonFactor = utilities.stringifyConstantValue(quadratic.yCoefficient * commonFactor)
                                                             .replace(utilities.subtractionSymbol, '-');

        const nonStandardForm = `${stringXSquaredCoefficient}x^2 ${stringYSquaredCoefficient}y^2 ` +
                                `${stringXCoefficientTimesCommonFactor}x ` +
                                `${stringYCoefficientTimesCommonFactor}y = ` +
                                `${quadratic.constant * commonFactor}`;
        const step1Latex = `x^2 + y^2 ${stringXCoefficient}x ${stringYCoefficient}y = ${quadratic.constant}`;
        const step2Latex = `(x^2${stringXCoefficient}x) + (y^2${stringYCoefficient}) = ${quadratic.constant}`;
        const step3Latex = `(x^2${stringXCoefficient}x${stringHalfXCoefficientSquared}) + ` +
                           `(y^2${stringYCoefficient}${stringHalfYCoefficientSquared}) = ` +
                           `${quadratic.constant}${stringHalfXCoefficientSquared}${stringHalfYCoefficientSquared}`;
        const xFirstAnswer = `(x${stringHalfXCoefficient})^2+(y${stringHalfYCoefficient})^2=${Math.pow(quadratic.radius, 2)}`;

        const expectedAnswer = [ xFirstAnswer,
                                `(y${stringHalfYCoefficient})^2+(x${stringHalfXCoefficient})^2=${Math.pow(quadratic.radius, 2)}` ];

        const prompt = `Convert to standard form of circle:${newLine}` +
                       `Use ^ for exponents. Ex: x^2 for ${envelopLatex('x^2')}${newLine}` +
                       `${envelopLatex(nonStandardForm.replace(/&/g, '').replace(utilities.subtractionSymbol, '-'))}`;
        const placeholder = `Ex: ${new Circle().print(false)}`;

        const latexAnswer = envelopLatex(`\\phantom{x}${latexEndLine}` +
                                        `(1) \\phantom{x} ${nonStandardForm}${latexEndLine}` +
                                        `(2) \\phantom{x} ${step1Latex}${latexEndLine}` +
                                        `(3) \\phantom{x} ${step2Latex}${latexEndLine}` +
                                        `(4) \\phantom{x} ${step3Latex}${latexEndLine}` +
                                        `(5) \\phantom{x} ${xFirstAnswer}`);
        const englishAnswer = `(1) Divide by common factor${newLine}` +
                              `(2) Group terms${newLine}` +
                              `(3) Complete the square for the ${envelopLatex('x')} and ${envelopLatex('y')} terms${newLine}` +
                              `(4) Factor and simplify${newLine}` +
                              '(5) Answer';

        const validAnswerExplanation = VALID_ANSWER.EQUATION;
        const explanation = `Expected: ${envelopLatex(expectedAnswer[0])}${newLine}` +
                            `${englishAnswer}${newLine}${latexAnswer}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };
}
