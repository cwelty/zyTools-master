/* global Question, buildQuestionFactoryPrototype, VALID_ANSWER, Ellipse */
/* exported buildQuestionFactoryPrototype */
/* eslint no-magic-numbers:0 */
'use strict';

/**
    Factory that makes {Question}s.
    @class QuestionFactory
    @extends singleInputQuestionProgressionTool.QuestionFactory
    @constructor
    @param {Function} explanationTemplate The template for the explanation.
    @param {String} toolID Unique id for this tool.
*/
function QuestionFactory(explanationTemplate, toolID) {
    this.numberOfQuestions = 5;
    this._explanationTemplate = explanationTemplate;
    this.toolID = toolID;
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

    const beginAlign = '\\begin{align}';
    const endAlign = '\\end{align}';
    const latexEndLine = '\\\\';

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
        ];

        return new Question(levelIndexToQuestion[currentLevelIndex](), this._explanationTemplate, this.toolID);
    };

    /**
        Builds a question of level 1. Enter the center.
        Ex: ((x + 3)^2 / 36) + ((y + 5)^2 / 9) = 1      Answer: (-3, -5)
        @method _levelOne
        @private
        @return {Object} An object with the needed level 1 Question's parameters.
    */
    QuestionFactory.prototype._levelOne = function() {
        const hValue = pickNumberInRange(-6, 6, [ 0 ]);
        let kValue = pickNumberInRange(-6, 6, [ 0, hValue ]);

        // Always have a negative in the center vertex.
        if (hValue >= 0 && kValue >= 0) {
            kValue *= -1;
        }
        else if (hValue < 0 && kValue < 0) {
            kValue *= -1;
        }

        const ellipse = new Ellipse(false, hValue, kValue);
        const inputPrefix = '(';
        const inputPostfix = ')';
        const placeholder = `Ex: ${pickNumberInRange(-6, 6, [ ellipse.hValue ])}, ${pickNumberInRange(-6, 6, [ ellipse.kValue ])}`;
        const prompt = `Enter the center for the given ellipse:${newLine}${ellipse.print()}`;
        const validAnswerExplanation = VALID_ANSWER.POINT;
        const expectedAnswer = `${ellipse.center}`;
        const latexAnswer = envelopLatex(`\\small{(${expectedAnswer})}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard form of ellipse:${newLine}` +
                            `${ellipse.standardGraphingForm}${newLine}` +
                            `Center: ${envelopLatex(centerFormula)}${newLine}` +
                            `Substitute ${envelopLatex('h')} and ${envelopLatex('k')} to get the center: ${latexAnswer}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 2. Calculate the semi-major axis.
        Ex: ((x - 3)^2/16) + ((y + 3)^2/4) = 1      Answer: 4
        @method _levelTwo
        @private
        @return {Object} An object with the needed level 2 Question's parameters.
    */
    QuestionFactory.prototype._levelTwo = function() {
        const ellipse = new Ellipse();
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const placeholder = `Ex: ${pickNumberInRange(2, 8, [ ellipse.semiMajorAxis ])}`;
        const prompt = `Calculate the semi-major axis for the given ellipse:${newLine}${ellipse.print()}`;
        const expectedAnswer = ellipse.semiMajorAxis;
        const calculateSemiMajorAxis = envelopLatex(`\\sqrt{a^2}=\\sqrt{${ellipse.aSquared}}=${ellipse.aValue}`);
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard form of ellipse:${newLine}` +
                            `${ellipse.standardGraphingForm}${newLine}` +
                            `The larger denominator corresponds to the semi-major axis:${newLine}` +
                            `${calculateSemiMajorAxis}`;

        return { expectedAnswer, explanation, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 3. Calculate the distance from the center of the ellipse to a focus
        Ex: ((y - 4)^2 / 36) + ((x + 1)^2 / 4) = 1
        @method _levelThree
        @private
        @return {Object} An object with the needed level 3 Question's parameters.
    */
    QuestionFactory.prototype._levelThree = function() {
        const ellipse = new Ellipse(true);
        const validAnswerExplanation = VALID_ANSWER.NUMBER;
        const needScratchPad = true;
        const expectedAnswer = ellipse.distance;
        const placeholder = `Ex: ${pickNumberInRange(1, 8, [ ellipse.distance ])}`;
        const prompt = `Calculate the distance from the center of the ellipse to a focus:${newLine}${ellipse.print()}`;
        const latexAnswer = envelopLatex(`${beginAlign}${distanceFormula}${latexEndLine}` +
                                         `c^2 &= ${ellipse.aSquared} - ${ellipse.bSquared}${latexEndLine}` +
                                         `c &= \\sqrt{${ellipse.aSquared - ellipse.bSquared}} = ${ellipse.distance}${endAlign}`);

        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard form of ellipse:${newLine}` +
                            `${ellipse.standardGraphingForm}${newLine}` +
                            `Calculate distance:${newLine}` +
                            `${latexAnswer}`;

        return { expectedAnswer, explanation, needScratchPad, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 4. Calculate either foci.
        Ex: ((x - 3)^2 / 42) + ((y + 3)^2 / 17) = 1     Answer: (8, -3) or (-2, -3)
        @method _levelFour
        @private
        @return {Object} An object with the needed level 4 Question's parameters.
    */
    QuestionFactory.prototype._levelFour = function() {
        const ellipse = new Ellipse(true);
        const inputPrefix = '(';
        const inputPostfix = ')';
        const placeholder = `Ex: ${pickNumberInRange(-6, 6, [ ellipse.hValue,
                                                              ellipse.hValue + ellipse.distance,
                                                              ellipse.hValue - ellipse.distance ])}, ` +
                                `${pickNumberInRange(-6, 6, [ ellipse.kValue,
                                                              ellipse.kValue + ellipse.distance,
                                                              ellipse.kValue - ellipse.distance ])}`;
        const validAnswerExplanation = VALID_ANSWER.POINT_ARRAY;
        const needScratchPad = true;
        const expectedAnswer = ellipse.foci;
        const prompt = `Calculate either focus:${newLine}${ellipse.print()}`;
        let fociFormula = '';
        let calculateFoci = '';

        if (ellipse.isHorizontal) {
            fociFormula = [ '(h + c, k)', '(h - c, k)' ];
            calculateFoci = [ `(${ellipse.hValue}+${ellipse.distance}, ${ellipse.kValue})`,
                              `(${ellipse.hValue}-${ellipse.distance}, ${ellipse.kValue})` ];
        }
        else {
            fociFormula = [ '(h, k + c)', '(h, k - c)' ];
            calculateFoci = [ `(${ellipse.hValue}, ${ellipse.kValue}+${ellipse.distance})`,
                              `(${ellipse.hValue}, ${ellipse.kValue}-${ellipse.distance})` ];
        }
        const latexDistance = envelopLatex(`${beginAlign}${distanceFormula}${latexEndLine}` +
                                           `c &= \\sqrt{${ellipse.aSquared} - ${ellipse.bSquared}} = ${ellipse.distance}${endAlign}\\\\`);
        const explanation = `Expected: ${envelopLatex(ellipse.foci[0])} or ${envelopLatex(ellipse.foci[1])}${newLine}` +
                            `Standard form of ellipse:${newLine}` +
                            `${ellipse.standardGraphingForm}${newLine}` +
                            `Obtain the center: ${envelopLatex(`\\small{${centerFormula} = (${ellipse.center})}`)}${newLine}` +
                            `Calculate the distance:${newLine}` +
                            `${latexDistance}${newLine}` +
                            `Foci are located on the major axis:${newLine}` +
                            `${envelopLatex(`\\small{${fociFormula[0]}}`)} and ${envelopLatex(`\\small{${fociFormula[1]}}`)}${newLine}` +
                            `${envelopLatex(`\\small{${calculateFoci[0]}}`)} and ` +
                            `${envelopLatex(`\\small{${calculateFoci[1]}}\\\\`)}${newLine}` +
                            `Foci: ${envelopLatex(`\\small{(${ellipse.foci[0]})}`)} and ${envelopLatex(`\\small{(${ellipse.foci[1]})}`)}`;

        return { expectedAnswer, explanation, inputPrefix, inputPostfix, needScratchPad, placeholder, prompt, validAnswerExplanation };
    };

    /**
        Builds a question of level 5. Calculate the vertex with the lowest x value.
        Ex: ((x - 2)^2 / 16) + ((y - 5)^2 / 9) = 1        Answer: (-6, -5)
        @method _levelFive
        @private
        @return {Object} An object with the needed level 5 Question's parameters.
    */
    QuestionFactory.prototype._levelFive = function() {
        const ellipse = new Ellipse();
        const inputPrefix = '(';
        const inputPostfix = ')';
        const placeholder = `Ex: ${pickNumberInRange(-6, 6, [ ellipse.hValue,
                                                              ellipse.hValue + ellipse.distance,
                                                              ellipse.hValue - ellipse.distance ])}, ` +
                                `${pickNumberInRange(-6, 6, [ ellipse.kValue,
                                                              ellipse.kValue + ellipse.distance,
                                                              ellipse.kValue - ellipse.distance ])}`;
        const validAnswerExplanation = VALID_ANSWER.POINT;
        const needScratchPad = true;
        const expectedAnswer = ellipse.vertex[0];
        const prompt = `Calculate the vertex with the lowest ${envelopLatex('x')} value:${newLine}${ellipse.print()}`;

        const semiMajorAxis = `\\sqrt{a^2} = \\sqrt{${ellipse.aSquared}} = ${ellipse.aValue}`;
        const semiMinorAxis = `\\sqrt{b^2} = \\sqrt{${ellipse.bSquared}} = ${ellipse.bValue}`;
        const vertices = [ envelopLatex(`(${ellipse.vertex[0]})`), envelopLatex(`(${ellipse.vertex[1]})`),
                           envelopLatex(`(${ellipse.vertex[2]})`), envelopLatex(`(${ellipse.vertex[3]})`) ];
        const explanation = `Expected: ${envelopLatex(expectedAnswer)}${newLine}` +
                            `Standard form of ellipse:${newLine}` +
                            `${ellipse.standardGraphingForm}${newLine}` +
                            `Obtain the center: ${envelopLatex(`\\small{${centerFormula} = (${ellipse.center})}`)}${newLine}` +
                            `Obtain the major and minor axis:${newLine}` +
                            `* Semi-major axis: ${envelopLatex(semiMajorAxis)} and ${envelopLatex(`\\small{${-ellipse.aValue}}`)}` +
                            `${newLine}` +
                            `* Semi-minor axis: ${envelopLatex(semiMinorAxis)} and ${envelopLatex(`\\small{${-ellipse.bValue}}`)}` +
                            `${newLine}` +
                            `Find the vertices by adding and subtracting the major and minor axis to the center.${newLine}` +
                            `Vertices: ${vertices[0]}, ${vertices[1]}, ${vertices[2]}, ${vertices[3]}${newLine}` +
                            `Vertex with lowest ${envelopLatex('x')} value: ${envelopLatex(`(${expectedAnswer})`)}`;
        const shouldRenderGraph = true;

        return { ellipse, expectedAnswer, explanation, inputPrefix, inputPostfix, needScratchPad,
                 placeholder, prompt, shouldRenderGraph, validAnswerExplanation };
    };
}
