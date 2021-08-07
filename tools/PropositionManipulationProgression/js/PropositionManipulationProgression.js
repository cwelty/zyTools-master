'use strict';

/* global TermSelectionExampleController, ExpressionAreaController, LawsAreaController,
          QuestionFactoryReduceOne, QuestionFactoryReduceTwo, QuestionFactoryReduceThree,
          QuestionFactoryDigitalReduceOne, QuestionFactoryDigitalReduceTwo, QuestionFactoryDigitalExpandOne */

/**
    Progression activity wherein the user manipulations a proposition to achieve a given goal.
    @module PropositionManipulationProgression
    @return {void}
*/
function PropositionManipulationProgression() {

    <%= grunt.file.read(hbs_output) %>
    const name = '<%= grunt.option("tool") %>';
    const templates = this[name];

    let moduleId = null;
    let expressionType = '';
    let questionCache = null;
    let progressionTool = null;
    let termSelectionExampleController = null;
    let expressionAreaController = null;
    let lawsAreaController = null;
    let currentQuestion = null;

    /**
        Initialize the progression.
        @method init
        @param {String} _id The unique identifier given to module.
        @param {Object} _parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} _options Options for a module instance.
        @param {String} _options.expressionType The type of expression to render.
        @param {String} _options.progressionType The type of progression to make.
        @return {void}
    */
    this.init = function(_id, _parentResource, _options) {
        moduleId = _id;
        expressionType = _options.expressionType;
        this.progressionType = _options.progressionType;

        let questionFactory = null;

        if (expressionType === 'proposition') {
            switch (this.progressionType) {
                case 'reduce1':
                    questionFactory = new QuestionFactoryReduceOne();
                    break;
                case 'reduce2':
                    questionFactory = new QuestionFactoryReduceTwo();
                    break;
                case 'reduce3':
                    questionFactory = new QuestionFactoryReduceThree();
                    break;
                default:
                    throw new Error(`Unrecognized progressionType option: ${this.progressionType}`);
            }
        }
        else if (expressionType === 'digital') {
            switch (this.progressionType) {
                case 'reduce1':
                    questionFactory = new QuestionFactoryDigitalReduceOne();
                    break;
                case 'reduce2':
                    questionFactory = new QuestionFactoryDigitalReduceTwo();
                    break;
                case 'expand':
                    questionFactory = new QuestionFactoryDigitalExpandOne();
                    break;
                default:
                    throw new Error(`Unrecognized progressionType option: ${this.progressionType}`);
            }
        }

        const maxQuestionsCached = 5;
        const utilities = require('utilities');

        utilities.addIfConditionalHandlebars();
        questionCache = utilities.getQuestionCache(questionFactory, maxQuestionsCached);

        progressionTool = require('progressionTool').create();
        let userGotAnswerCorrect = true;

        progressionTool.init(_id, _parentResource, {
            html: templates.questionArea({
                expressionAreaWidth: questionFactory.expressionAreaWidth,
            }),
            css: '<style><%= grunt.file.read(css_filename) %></style>',
            numToWin: questionFactory.numberOfLevels,
            useMultipleParts: true,
            start: () => {
                lawsAreaController.enable();
                expressionAreaController.start();
                this._getDOM('prompt').removeClass('disabled');
            },
            reset: () => {
                this._generateQuestionByLevelIndex(0);
                lawsAreaController.removeArrows();
                lawsAreaController.disable();
                this._getDOM('prompt').addClass('disabled');
            },
            next: questionLevelIndex => {
                if (userGotAnswerCorrect) {
                    this._generateQuestionByLevelIndex(questionLevelIndex);
                    expressionAreaController.start();
                }
                else {
                    expressionAreaController.promptLawSelection();
                }
                lawsAreaController.removeArrows();
                lawsAreaController.enable();
                this._getDOM('prompt').removeClass('disabled');
                userGotAnswerCorrect = true;
            },
            isCorrect: () => {
                expressionAreaController.disable();
                lawsAreaController.disable();
                lawsAreaController.removeArrows();
                this._getDOM('prompt').addClass('disabled');

                const userAnswer = this._makeUserAnswer();
                const sdk = require('PropositionalCalculusSDK').create();
                const expectedAnswer = sdk.makeExpression(expressionType, currentQuestion.expectedSymbols[0]).print();
                let explanationMessage = 'Correct';

                userGotAnswerCorrect = this._isUserAnswerCorrect();

                if (!userGotAnswerCorrect) {
                    explanationMessage = templates.wrongAnswerExplanation({
                        userAnswer,
                        expectedAnswer,
                        operatorsName: expressionType === 'digital' ? 'property' : 'law',
                        expressionOrProposition: expressionType === 'digital' ? 'expression' : 'proposition',
                    });
                }

                return {
                    explanationMessage,
                    expectedAnswer,
                    isCorrect: userGotAnswerCorrect,
                    userAnswer,
                    callbackFunction: () => this._getDOM('show-me-how').click(() => termSelectionExampleController.show()),
                };
            },
        });

        this._getDOM('prompt').addClass('disabled');

        termSelectionExampleController = new TermSelectionExampleController(
            _parentResource,
            templates,
            expressionType
        );

        lawsAreaController = new LawsAreaController({
            $dom: this._getDOM('laws-area-container'),
            expressionType,
            templates,
            setManipulationTerms: function(terms, lawSide, manipulationName) {
                expressionAreaController.setManipulationTerms(terms, lawSide, manipulationName);
            },
            rightArrowURL: _parentResource.getResourceURL('rightArrow.png', name),
            leftArrowURL: _parentResource.getResourceURL('leftArrow.png', name),
            lawPanels: questionFactory.lawPanels,
        });
        lawsAreaController.disable();

        expressionAreaController = new ExpressionAreaController({
            $dom: this._getDOM('expression-area-container'),
            expressionType,
            templates,
            lawsAreaController,
            infoButtonLink: _parentResource.getResourceURL('InfoBlue.png', name),
            checkIfLastExpressionIsExpectedAnswer: () => {
                if (this._isUserAnswerCorrect()) {
                    progressionTool.check();
                }
            },
            showTermSelectionExample: function() {
                termSelectionExampleController.show();
            },
        });

        this._generateQuestionByLevelIndex(0);
    };

    /**
        Return whether the user's answer is correct.
        @method _isUserAnswerCorrect
        @private
        @return {Boolean} Whether the user's answer is correct.
    */
    this._isUserAnswerCorrect = function() {
        const sdk = require('PropositionalCalculusSDK').create();
        const userAnswer = this._makeUserAnswer();

        return currentQuestion.expectedSymbols.some(expectedSymbl =>
            sdk.makeExpression(expressionType, expectedSymbl).print() === userAnswer
        );
    };

    /**
        Return the user's answer as an expression.
        @method _makeUserAnswer
        @private
        @return {String} The user's answer as an expression.
    */
    this._makeUserAnswer = function() {
        return require('PropositionalCalculusSDK').create().makeExpression(expressionType,
            expressionAreaController.expressionArea.getLastExpressionContainer().symbol
        ).print();
    };

    /**
        Generate a question based on the |questionLevelIndex|.
        @method _generateQuestionByLevelIndex
        @private
        @param {Number} questionLevelIndex For which level index to create a question.
        @return {void}
    */
    this._generateQuestionByLevelIndex = function(questionLevelIndex) {
        currentQuestion = questionCache.makeQuestion(questionLevelIndex);
        const sdk = require('PropositionalCalculusSDK').create();
        const initialExpression = sdk.makeExpression(expressionType, currentQuestion.initialSymbol);
        const expectedExpression = sdk.makeExpression(expressionType, currentQuestion.expectedSymbols[0]);
        let printedExpectedExpression = expectedExpression.print();

        // Remove parenthesis in prompt for the Digital Design expand to sum-of-minterms case.
        if (this.progressionType === 'expand') {
            printedExpectedExpression = printedExpectedExpression.replace(/[\(\)]/g, '');
        }

        // Render the prompt.
        const prompt = templates.simplifyPrompt({
            initialExpression: initialExpression.print(),
            finalExpression: printedExpectedExpression,
            type: this.progressionType,
        });

        this._getDOM('prompt').html(prompt);

        expressionAreaController.setInitialSymbolicExpression(currentQuestion.initialSymbol);
    };

    /**
        Make a jQuery reference to the given class name's DOM element.
        @method _getDOM
        @private
        @param {String} className The name of the class to make.
        @return {Object}
    */
    this._getDOM = function(className) {
        return $(`#${moduleId} .${className}`);
    };

    /**
        Reset the tool.
        @method reset
        @return {void}
    */
    this.reset = function() {
        progressionTool.reset();
    };
}

module.exports = {
    create: function() {
        return new PropositionManipulationProgression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {

        <%= grunt.file.read(tests) %>
    },
};
