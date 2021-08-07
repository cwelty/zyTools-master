/* exported buildQuestionPrototype */
'use strict';

const VALID_ANSWER = {
    NUMBER: 'A valid answer is a number.',
    POINT: 'A valid answer format is: 5, 8',
    POINT_ARRAY: 'A valid answer format is: -4, 1',
};

/**
    A question about ellipses.
    @class Question
    @extends singleInputQuestionProgressionTool.Question
    @constructor
    @param {Object} args={} Some arguments that define the Question.
    @param {String} args.expectedAnswer The expected answer to this question.
    @param {String} args.explanation The explanation to this question's answer.
    @param {String} args.placeholder The input's placeholder text.
    @param {String} args.prompt The prompt of this question.
    @param {String} [args.inputPostfix=''] The input box's postfix.
    @param {String} [args.inputPrefix=''] The input box's prefix.
    @param {Boolean} [args.needScratchPad=false] Whether the question would benefit from having a scratchpad for calculations.
    @param {VALID_ANSWER} [args.validAnswerExplanation=''] The explanation on how a valid answer has to be formatted.
    @param {Boolean} [args.shouldRenderGraph=false] Whether to render the graph in the explanation.
    @param {Function} explanationTemplate The template for the explanation.
    @param {String} toolID Unique id for this tool.
*/
function Question(args, explanationTemplate, toolID) {
    this.expectedAnswer = args.expectedAnswer;
    this.explanation = args.explanation;
    this.placeholder = args.placeholder;
    this.prompt = args.prompt;
    this.inputPostfix = 'inputPostfix' in args ? args.inputPostfix : '';
    this.inputPrefix = 'inputPrefix' in args ? args.inputPrefix : '';
    this.validAnswerExplanation = 'validAnswerExplanation' in args ? args.validAnswerExplanation : VALID_ANSWER.NUMBER;
    this.ellipse = 'ellipse' in args ? args.ellipse : [];
    this.needScratchPad = Boolean(args.needScratchPad);
    this.shouldRenderGraph = Boolean(args.shouldRenderGraph);
    this._explanationTemplate = explanationTemplate;
    this.toolID = toolID;
    this.utilities = require('utilities');
    $('.graph-container').hide();
}

/**
    Build {Question}'s prototype after dependencies have loaded.
    @method buildQuestionPrototype
    @return {void}
*/
function buildQuestionPrototype() {
    Question.prototype = require('singleInputQuestionProgressionTool').getNewQuestion();
    Question.prototype.constructor = Question;

    /**
        Return whether the user's answer is in a valid format.
        @method isInputFormatValid
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is in a valid format.
    */
    Question.prototype.isInputFormatValid = function(userAnswer) {
        let isValid = false;

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.NUMBER: {
                isValid = (!isNaN(userAnswer) && (userAnswer !== ''));
                break;
            }
            case VALID_ANSWER.POINT_ARRAY:
            case VALID_ANSWER.POINT: {
                const userNoWhitespace = this.utilities.removeWhitespace(userAnswer);

                isValid = new RegExp('[-]{0,1}[\\d]+,[-]{0,1}[\\d]+').test(userNoWhitespace);
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }

        return isValid;
    };

    /**
        Return whether the user's answer is the expected answer.
        @method isCorrect
        @param {String} userAnswer The user's answer.
        @return {Boolean} Whether the user's answer is the expected answer.
    */
    Question.prototype.isCorrect = function(userAnswer) {
        let correctAnswer = false;
        const userNoWhitespace = this.utilities.removeWhitespace(userAnswer);

        switch (this.validAnswerExplanation) {
            case VALID_ANSWER.POINT: {
                correctAnswer = userNoWhitespace === this.expectedAnswer;
                break;
            }
            case VALID_ANSWER.NUMBER: {
                correctAnswer = (parseInt(userAnswer, 10) === parseInt(this.expectedAnswer, 10));
                break;
            }
            case VALID_ANSWER.POINT_ARRAY: {
                correctAnswer = this.expectedAnswer.indexOf(userNoWhitespace) !== -1;
                break;
            }
            default: {
                throw new Error('Answer type not supported');
            }
        }

        return correctAnswer;
    };

    /**
        Return the explanation.
        @method getExplanation
        @return {String} The explanation.
    */
    Question.prototype.getExplanation = function() {
        return this._explanationTemplate({
            explanation: this.explanation,
            shouldRenderGraph: this.shouldRenderGraph,
            toolID: this.toolID,
        });
    };

    /**
        Draw the graph if the graph was rendered.
        @method explanationPostProcess
        @return {void}
    */
    Question.prototype.explanationPostProcess = function() {
        if (this.shouldRenderGraph) {

            // Get Bezier curve points for graph and vertices for painting
            const plotsToGraph = this.ellipse.graphPoints();
            const leftMostVertex = [ this.ellipse.hValue, this.ellipse.kValue ];
            const vertices = [ [ this.ellipse.hValue, this.ellipse.kValue ],
                               [ this.ellipse.hValue, this.ellipse.kValue ],
                               [ this.ellipse.hValue, this.ellipse.kValue ] ];

            if (this.ellipse.isHorizontal) {
                leftMostVertex[0] -= this.ellipse.semiMajorAxis;
                vertices[0][0] += this.ellipse.semiMajorAxis;
                vertices[1][1] -= this.ellipse.semiMinorAxis;
                vertices[2][1] += this.ellipse.semiMinorAxis;
            }
            else {
                leftMostVertex[0] -= this.ellipse.semiMinorAxis;
                vertices[0][0] += this.ellipse.semiMinorAxis;
                vertices[1][1] -= this.ellipse.semiMajorAxis;
                vertices[2][1] += this.ellipse.semiMajorAxis;
            }

            const graphOptions = {
                height: 380,
                width: 380,
                seriesColors: [ this.utilities.zyanteOrange, this.utilities.zyanteOrange,
                                this.utilities.zyanteDarkBlue, this.utilities.zyanteLighterBlue ],
                seriesDefaults: {
                    renderer: $.jqplot.LineRenderer,
                    showLine: false,
                    fill: false,
                },
                series: [ {
                    renderer: $.jqplot.BezierCurveRenderer,
                    showLine: true,
                }, {
                    renderer: $.jqplot.BezierCurveRenderer,
                    showLine: true,
                }, {}, {} ],
                axes: {
                    xaxis: {
                        label: 'x',
                        min: -10,
                        max: 10,
                        tickInterval: 1,
                    },
                    yaxis: {
                        label: 'y',
                        min: -10,
                        max: 10,
                        tickInterval: 1,
                    },
                },
                sortData: false,
            };

            // Left vertex has different color than other vertices
            plotsToGraph.push([ leftMostVertex, leftMostVertex ]);
            plotsToGraph.push(vertices);

            $.jqplot(`ellipse-graph-${this.toolID}`, plotsToGraph, graphOptions);
        }
    };
}
