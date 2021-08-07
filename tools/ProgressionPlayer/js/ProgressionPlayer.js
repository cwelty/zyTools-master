'use strict';

/* global buildProgressionPlayerElementControllerPrototype,
    buildElementImageControllerPrototype,
    buildElementTextControllerPrototype,
    buildElementDropdownControllerPrototype,
    buildElementShortAnswerControllerPrototype,
    buildElementTableControllerPrototype,
    buildElementCheckboxControllerPrototype,
    Controllers,
    ProgressionQuestionFactory,
    unescapeHTMLFromJSON,
    ProgressionQuestion,
    ProgressionQuestionElements */

/**
    Run a progression instance based on specified options.
    @module ProgressionPlayer
    @return {void}
*/
function ProgressionPlayer() {

    /**
        The name of the module.
        @property _name
        @private
        @type String
    */
    this._name = '<%= grunt.option("tool") %>';

    /**
        Dictionary of templates for this module.
        @property _templates
        @private
        @type Object
    */
    this._templates = this[this._name];

    /**
        The unique id given to this module.
        @property _id
        @private
        @type String
        @default null
    */
    this._id = null;

    /**
        Whether the progression is in builder mode (being tested in ProgressionBuilder).
        @property _inBuilderMode
        @private
        @type {Boolean}
        @default false
    */
    this._inBuilderMode = false;

    /**
        The controllers for the displayed elements. Each controller maps to one element.
        @property _controllers
        @private
        @type Controllers
    */
    this._controllers = new Controllers();

    /**
        Reference to the question DOM, which is regularly accessed.
        @property _$question
        @private
        @type jQuery
        @default null
    */
    this._$question = null;

    /**
        The question currently being given.
        @property _currentQuestion
        @private
        @type ProgressionQuestion
        @default null
    */
    this._currentQuestion = null;

    /**
        Reference to the parent of this module.
        @property _parentResource
        @private
        @type Object
        @default null
    */
    this._parentResource = null;

    /**
        Cache of questions already given to user.
        @property _questionCache
        @private
        @type QuestionCache
        @default null
    */
    this._questionCache = null;

    /**
        Reference to the {ProgressionTool} module.
        @property _progressionTool
        @private
        @type {ProgressionTool}
        @default null
    */
    this._progressionTool = null;

    /**
        Whether to load as an exam, or as a CA.
        @property _isExam
        @private
        @type {Boolean}
        @default false
    */
    this._isExam = false;

    /**
        Whether to load a given exam question and response.
        @property _isExamResponse
        @private
        @type {Boolean}
        @default false
    */
    this._isExamResponse = false;

    /**
        Render and initialize a progression instance.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @param {Object} options.progression JSON structure that models the progression.
        @param {Boolean} [options.inBuilderMode=false] Whether this ProgressionPlayer instance was loaded by the ProgressionBuilder.
        @return {void}
    */
    this.init = function(id, parentResource, options) {
        this._id = id;
        this._parentResource = parentResource;
        this._isExamResponse = options.showExamResponse || false;

        let numToWin = 1;

        if (this._isExamResponse) {
            this._isExam = true;
            this._currentQuestion = this._makeQuestionFromJSON(options.question.levelIndex, options.question);
        }
        else {
            this._inBuilderMode = options.inBuilderMode || false;

            const progressionJSON = this._inBuilderMode ? options.progression : unescapeHTMLFromJSON(options.progression);

            this._isExam = !this._inBuilderMode && progressionJSON.isExam;

            const progressionQuestionFactory = new ProgressionQuestionFactory(progressionJSON, this._inBuilderMode);

            this._questionCache = require('utilities').getQuestionCache(progressionQuestionFactory, 5); // eslint-disable-line no-magic-numbers
            numToWin = progressionQuestionFactory.numberOfLevels();
        }

        // Add ProgressionUtilities templates.
        const progressionUtilities = require('ProgressionUtilities').create();

        this._templates = progressionUtilities.templates;

        const self = this;
        let userEnteredInvalidAnswer = false;

        this._progressionTool = require('progressionTool').create();
        this._progressionTool.init(id, parentResource, {
            html: this._templates.QuestionArea(), // eslint-disable-line new-cap
            css: `<style><%= grunt.file.read(css_filename) %></style>${progressionUtilities.css}`,
            numToWin,
            useMultipleParts: true,
            isExam: this._isExam,
            start: () => {
                this._controllers.enable();
                if (!this._isExam) {
                    this._controllers.focus();
                }
                userEnteredInvalidAnswer = false;
            },
            reset: function() {
                self._generateQuestion(0);
                self._controllers.disable();
            },
            next: currentLevel => {
                if (userEnteredInvalidAnswer && (this._currentQuestion.levelIndex === currentLevel)) {
                    this._controllers.removeInvalidAnswerStatus();
                    this._controllers.enable();
                }
                else {
                    this._generateQuestion(currentLevel);
                }
                this._controllers.focus();
                userEnteredInvalidAnswer = false;
                this.showExplanationInBuilder();

                return this._inBuilderMode;
            },
            isCorrect: levelIndex => {
                this._controllers.disable();

                let explanation = '';
                let isCorrect = false;
                const userAnswer = JSON.stringify(this._controllers.userAnswer());

                userEnteredInvalidAnswer = this._controllers.isInvalidAnswer();
                if (userEnteredInvalidAnswer) {
                    let tmpExplanation = 'Set an answer for each input. See highlighted.';

                    if (this._inBuilderMode) {
                        tmpExplanation += `\n${this._currentQuestion.explanation}`;
                    }
                    explanation = progressionUtilities.processExplanation(parentResource, tmpExplanation);
                }

                // User answer is valid and in CA mode.
                else {
                    isCorrect = this._controllers.isCorrect(!this._isExam);

                    // In exam mode, explanation is always the same.
                    if (this._isExam) {
                        explanation = `<big>Submission received.</big>
If you like, submit a different answer via Try again. Score will be based only on the latest submission.`;
                    }
                    else {
                        const numberOfElementsAssessed = this._controllers.getControllersAssessedForCorrectness().length;
                        let tmpExplanation = '';

                        if (!isCorrect && (numberOfElementsAssessed > 1)) {
                            tmpExplanation = 'Each incorrect answer is highlighted.\n';
                        }

                        tmpExplanation += this._currentQuestion.explanation;
                        explanation = progressionUtilities.processExplanation(parentResource, tmpExplanation);
                    }
                }

                const metadata = { question: this._currentQuestion.toJSON() };

                // Exam mode stores the user answer and whether the answer was correct.
                if (this._isExam) {
                    parentResource.setLocalStore(`user-answer-${this._id}-${levelIndex}`, userAnswer);
                    metadata.isCorrect = isCorrect;
                }

                return {
                    expectedAnswer: this._controllers.expectedAnswer(),
                    isCorrect: isCorrect && !this._isExam,
                    explanationAsText: true,
                    explanationMessage: explanation,
                    metadata,
                    userAnswer,
                    showTryAgain: userEnteredInvalidAnswer,
                    callbackFunction: progressionUtilities.postProcessExplanation,
                    callbackParameters: { id: this._id, parentResource },
                };
            },
            initialize: () => {
                const $this = $(`#${id}`);

                $this.find('.zyante-progression-explanation').addClass('white-space-pre');
                this._$question = $this.find('.question-area');
                this._generateQuestion(0);
                this._controllers.disable();

                // Auto press "Start" when in builder mode.
                if (this._inBuilderMode) {
                    $('.zyante-progression-start-button').trigger('click');
                }

                // In exam mode, reload the previous submission, if one exists.
                let hadPreviousAnswer = false;

                if (this._isExamResponse) {
                    this._controllers.setAnswers(options.response);
                    hadPreviousAnswer = true;
                }
                else if (this._isExam) {
                    const currentLevel = 0;
                    const userAnswer = this._parentResource.getLocalStore(`user-answer-${this._id}-${currentLevel}`);

                    if (userAnswer) {
                        this._controllers.setAnswers(JSON.parse(userAnswer));
                        hadPreviousAnswer = true;
                    }
                }

                return hadPreviousAnswer;
            },
        });
    };

    /**
        Shows the explanation if it's in builder mode.
        @method showExplanationInBuilder
        @return {void}
    */
    this.showExplanationInBuilder = function() {
        if (this._inBuilderMode) {
            const progressionUtilities = require('ProgressionUtilities').create();
            const explanation = progressionUtilities.processExplanation(this._parentResource, this._currentQuestion.explanation, true);
            const explanationAsText = false;
            const skipScroll = true;

            this._progressionTool.outputThenScrollToExplanation(explanation, explanationAsText, skipScroll);
        }
    };

    /**
        Jump to the level at the given index.
        @method jumpToLevelIndex
        @param {Integer} index The index of the level to jump to.
        @return {void}
    */
    this.jumpToLevelIndex = function(index) {
        this._progressionTool.jumpToLevelIndex(index);
    };

    /**
        Focus on the top-most interactive element.
        @method focus
        @return {void}
    */
    this.focus = function() {
        this._controllers.focus();
    };

    /**
        Make a Question from the given JSON.
        @method _makeQuestionFromJSON
        @param {Number} currentLevel The current level the user is on, from 0 to n - 1.
        @param {Object} questionJSON The JSON from which to make a question.
        @return {Question} The question made from the JSON.
    */
    this._makeQuestionFromJSON = function(currentLevel, questionJSON) {
        const elements = new ProgressionQuestionElements();

        elements.fromJSON(questionJSON.elements);

        return new ProgressionQuestion(
            elements, questionJSON.explanation, questionJSON.height, questionJSON.width, currentLevel
        );
    };

    /**
        Generate and render a {ProgressionQuestion} based on |currentLevel|.
        @method generateQuestion
        @param {Number} currentLevel The current level the user is on, from 0 to n - 1.
        @return {void}
    */
    this._generateQuestion = function(currentLevel) {
        const enableControllers = this._currentQuestion && this._isExam && !this._isExamResponse;
        const needQuestion = !this._currentQuestion || !this._isExam;
        const noQuestionRendered = !this._controllers.length;
        const renderQuestion = needQuestion || (this._isExamResponse && noQuestionRendered);

        // Either simply enable the controllers or make a question.
        if (enableControllers) {
            this._controllers.enable();
        }
        else if (needQuestion) {
            this._controllers.empty();

            // Get the next question.
            this._currentQuestion = require('utilities').makeQuestionFromCacheOrLocalStore({
                id: this._id,
                isExam: this._isExam,
                levelIndex: currentLevel,
                parentResource: this._parentResource,
                questionCache: this._questionCache,

                /**
                    Make a Question from the given JSON.
                    @method makeQuestionFromJSON
                    @param {Object} questionJSON The JSON from which to make a question.
                    @return {Question} The question made from the JSON.
                */
                makeQuestionFromJSON: questionJSON => this._makeQuestionFromJSON(currentLevel, questionJSON),
            });
        }

        if (renderQuestion) {

            // Update the question DOM's height and width.
            this._$question.height(this._currentQuestion.height).width(this._currentQuestion.width);

            $(`#${this._id}`).width(this._currentQuestion.width);

            // Update the explanation's width.
            const $explanation = $(`#${this._id} .zyante-progression-explanation-area`);

            $explanation.width(this._currentQuestion.width);

            // Build controller for each element. Render in reverse so low-index elements are on top.
            const progressionUtilities = require('ProgressionUtilities').create();

            this._currentQuestion.elements.slice().reverse().forEach(element => {
                const elementClassName = progressionUtilities.getElementClassNameByType(element.type);
                const controllerClassName = `${elementClassName}Controller`;

                // Convert |className| to the class constructor of the same name.
                const ControllerClass = eval(controllerClassName); // eslint-disable-line no-eval

                this._controllers.push(new ControllerClass(
                    element,
                    this._$question,
                    this._templates,
                    this._parentResource,
                    this._progressionTool
                ));
            });

            // Set the solution for instructors if the platform supports it.
            if (needQuestion && this._parentResource.setSolution) {
                const explanation = progressionUtilities.processExplanation(this._parentResource, this._currentQuestion.explanation, true);
                const shouldRenderAsHTML = true;

                this._parentResource.setSolution(explanation, 'text', shouldRenderAsHTML);
            }
            this.showExplanationInBuilder();
            this._parentResource.latexChanged();
        }
    };
}

/**
    Build prototypes that were delayed while waiting for dependencies to be loaded.
    @method buildDelayedPrototypes
    @return {void}
*/
function buildDelayedPrototypes() {
    if (!this.hasBeenBuilt) {
        buildProgressionPlayerElementControllerPrototype();
        buildElementImageControllerPrototype();
        buildElementTextControllerPrototype();
        buildElementDropdownControllerPrototype();
        buildElementShortAnswerControllerPrototype();
        buildElementTableControllerPrototype();
        buildElementCheckboxControllerPrototype();
        this.hasBeenBuilt = true;
    }
}

module.exports = {
    create: function() {
        buildDelayedPrototypes();
        return new ProgressionPlayer();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        buildDelayedPrototypes();
        <%= grunt.file.read(tests) %>
    },
};
