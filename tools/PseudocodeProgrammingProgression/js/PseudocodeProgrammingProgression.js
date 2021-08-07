/* global QuestionFactory, Level, Ember, Question, ace */
/* exported PseudocodeProgrammingProgression */
'use strict';

/**
    Progression of randomly generated programming problems where the students have to write part of a pseudocode program.
    @module PseudocodeProgrammingProgression
*/
class PseudocodeProgrammingProgression {

    /**
        Initialize the properties.
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique ID assigned to this module.
            @property id
            @type {String}
            @default ''
        */
        this.id = '';

        /**
            A question cache of already-generated questions.
            @property questionCache
            @type {QuestionFache}
            @default null
        */
        this.questionCache = null;

        /**
            The progression's currently shown question.
            @property currentQuestion
            @type {Question}
            @default null
        */
        this.currentQuestion = null;

        /**
            The progression's currently shown level as an index.
            @property currentLevelIndex
            @type {Number}
            @default 0
        */
        this.currentLevelIndex = 0;

        /**
            Dictionary of handlebars templates.
            @property hbsTemplates
            @type {Object}
        */
        this.hbsTemplates = this['<%= grunt.option("tool") %>'];

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            The executor controller for the flowchart program.
            @property executorController
            @type {ExecutorController}
            @default null
        */
        this.executorController = null;

        /**
            Reference to the progressionTool instance.
            @property progressionTool
            @type {ProgressionTool}
        */
        this.progressionTool = require('progressionTool').create();

        /**
            Whether the solution is being shown.
            @property isSolutionShown
            @type {Boolean}
            @default false
        */
        this.isSolutionShown = false;

        /**
            Whether to load as an exam, or as a CA.
            @property isExam
            @type {Boolean}
            @default false
        */
        this.isExam = false;
    }

    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) {
        this.id = id;
        this.parentResource = parentResource;
        this.isExam = options.exam;

        const levels = options.levels.map(levelJSON => new Level(levelJSON));
        const questionFactory = new QuestionFactory(levels);
        const maxQuestionsToCache = 10;

        this.questionCache = require('utilities').getQuestionCache(questionFactory, maxQuestionsToCache);

        const css = `<style><%= grunt.file.read(css_filename) %></style>${require('zyFlowchartSDK').create().css}`;
        const html = this.hbsTemplates.PseudocodeProgrammingProgression(); // eslint-disable-line new-cap

        $(`#${id}`).html(css + html).addClass('zyFlowchartSDK');

        let didUserAnswer = false;

        this.progressionTool.init(id, parentResource, {
            html,
            css,
            numToWin: levels.length,
            useMultipleParts: true,
            showSolution: options.showSolution,
            isExam: this.isExam,
            start: () => {
                this.enable();
                if (!this.isExam) {
                    this.executorController.focusOnFunction();
                }
            },
            reset: () => {
                this.displayNewLevel(0);
                this.disable();
            },
            next: levelIndex => {
                const createNewLevel = (levelIndex !== this.currentLevelIndex) || !didUserAnswer || this.isSolutionShown;

                if (createNewLevel) {
                    this.displayNewLevel(levelIndex);
                }

                didUserAnswer = false;
                this.isSolutionShown = false;
                this.enable();
                this.executorController.focusOnFunction();
            },
            isCorrect: levelIndex => {
                didUserAnswer = true;
                this.disable();

                // Check that the user provided some new code.
                const userAnswer = this.executorController.getPseudocode();
                const initialCode = this.currentQuestion.getInitialCode();

                if ((userAnswer.trim() === '') || (userAnswer.trim() === initialCode.trim())) {
                    return {
                        explanationMessage: 'No code was provided',
                        isCorrect: false,
                        showTryAgain: true,
                    };
                }

                // Cache answer.
                if (this.isExam) {
                    this.parentResource.setLocalStore(`user-answer-${this.id}`, this.executorController.restrictedCode.placeholder);
                }

                // Check for compilation errors.
                const expectedAnswer = this.currentQuestion.getSolutionProgram();

                try {
                    require('zyFlowchartSDK').create().makeExecutor(userAnswer, '', true);
                }
                catch (error) {
                    this.submitCompilationError(error.message, levelIndex);
                    return {
                        explanationMessage: `Error: ${error.message}`,
                        userAnswer,
                        expectedAnswer,
                        isCorrect: false,
                        showTryAgain: true,
                    };
                }

                // Check the correctness of the user's code.
                const results = this.currentQuestion.tests.map(test => {
                    const input = test.input;
                    const points = test.points;
                    let userOutput = null;
                    let userCodeHadError = false;

                    try {
                        userOutput = this.runCode(userAnswer, input);
                    }
                    catch (error) {
                        userCodeHadError = true;
                        userOutput = error.message;
                    }

                    const solutionOutput = this.runCode(expectedAnswer, input);
                    const isCorrect = userOutput === solutionOutput;
                    const moreData = { input, userCodeHadError, points };

                    return require('utilities').getTestResult(userOutput, solutionOutput, isCorrect, moreData);
                });

                return new Ember.RSVP.Promise(resolve => {
                    const promises = results.map(result => result.buildOutputDifference(parentResource));
                    const isCorrect = results.every(result => result.isCorrect);
                    const metadata = {};
                    let pointsAwarded = -1;
                    let pointsPossible = -1;

                    if (this.isExam) {
                        metadata.question = this.currentQuestion;
                        metadata.testCases = results.map(result =>
                            ({
                                input: result.moreData.input,
                                userOutput: result.userAnswer,
                                expectedOutput: result.expectedAnswer,
                                pointsAwarded: result.isCorrect ? result.moreData.points : 0,
                                pointsPossible: result.moreData.points,
                            })
                        );
                        pointsAwarded = metadata.testCases.map(test => test.pointsAwarded).reduce(this.sum);
                        pointsPossible = metadata.testCases.map(test => test.pointsPossible).reduce(this.sum);
                    }

                    Ember.RSVP.all(promises).then(() => {
                        resolve({
                            explanationMessage: this.hbsTemplates.Explanation({ // eslint-disable-line new-cap
                                results,
                                explanation: this.currentQuestion.explanation,
                                pointsAwarded,
                                pointsPossible,
                                isExam: this.isExam,
                            }),
                            userAnswer,
                            expectedAnswer,
                            isCorrect,
                            metadata,
                            showTryAgain: !isCorrect,
                            callbackFunction: () => {
                                const $legendButton = $(`#${id} .special-character-legend`);

                                if (parentResource.showSpecialCharacterLegendModal) {
                                    $legendButton.click(() => parentResource.showSpecialCharacterLegendModal());
                                }
                                else {
                                    $legendButton.hide();
                                }
                            },
                        });
                    });
                });
            },
            accessibleViewForLevel: levelIndex => {
                const question = this.questionCache.makeQuestion(levelIndex);

                return this.hbsTemplates.QuestionAccessible({ question }); // eslint-disable-line new-cap
            },
            initialize: () => {
                const hadPreviousAnswer = this.displayNewLevel(0);

                this.disable();

                return hadPreviousAnswer;
            },
        });
    }

    /**
        Return the sum of the two values.
        @method sum
        @param {Number} first The first value.
        @param {Number} second The second value.
        @return {Number} Result of summing the two values.
    */
    sum(first, second) {
        return first + second;
    }

    /**
        Run the given code with the given input and return the output.
        @method runCode
        @param {String} code The code to run.
        @param {String} input The input to pass to the program.
        @return {String} The output of the program.
    */
    runCode(code, input) {
        const executor = require('zyFlowchartSDK').create().makeExecutor(code, input, true);
        const maxNumberOfExecutions = 10000;
        let executionCounter = 0;

        executor.enterExecution();

        // Execute until program done.
        while (!executor.isExecutionDone()) {
            executor.execute();
            executionCounter++;

            if (executionCounter > maxNumberOfExecutions) {
                throw new Error('Test did not finish executing with your code (may be due to an infinite loop).');
            }
        }

        return executor.output.output;
    }

    /**
        Enable the interactive content.
        @method enable
        @return {void}
    */
    enable() {
        this.executorController.setIsPseudocodeEditable(true);
        this.executorController.hadErrorCompiling();
        this.executorController.render();
    }

    /**
        Disable the interactive content.
        @method disable
        @return {void}
    */
    disable() {
        this.executorController.setIsPseudocodeEditable(false);
        this.executorController.hadErrorCompiling();
        this.executorController.render();
    }

    /**
        Display a new level given the |levelIndex|.
        @method displayNewLevel
        @param {Integer} levelIndex The index of the level to show.
        @return {Boolean} Whether there was a previous answer.
    */
    displayNewLevel(levelIndex) {
        this.currentLevelIndex = levelIndex;

        this.currentQuestion = require('utilities').makeQuestionFromCacheOrLocalStore({
            id: this.id,
            isExam: this.isExam,
            levelIndex,
            parentResource: this.parentResource,
            questionCache: this.questionCache,

            /**
                Make a Question from the given JSON.
                @method makeQuestionFromJSON
                @param {Object} questionJSON The JSON from which to make a question.
                @return {Question} The question made from the JSON.
            */
            makeQuestionFromJSON: questionJSON => new Question(
                questionJSON.parameters, questionJSON.prompt, questionJSON.code,
                questionJSON.solution, questionJSON.tests, questionJSON.explanation
            ),
        });

        this.parentResource.setSolution(this.currentQuestion.solution, 'zyPseudocode');
        this.progressionTool.setSolutionCallback($solutionContainer => {
            this.disable();
            this.isSolutionShown = true;

            const solutionId = `solution-${this.id}`;

            $solutionContainer.html(this.hbsTemplates.solution({ id: solutionId }));

            const $solution = $(`#${solutionId}`);
            const editor = ace.edit(solutionId);

            require('utilities').aceBaseSettings(editor, 'coral');

            editor.setOptions({
                minLines: 1,
                maxLines: 100,
            });
            editor.setValue(this.currentQuestion.solution, 1);
            editor.renderer.setShowGutter(false);
            editor.setReadOnly(true);
            editor.resize(true);
            $solution.hide().show();
        });

        const questionHTML = this.hbsTemplates.Question({ prompt: this.currentQuestion.prompt }); // eslint-disable-line new-cap

        $(`#${this.id} .question-container`).html(questionHTML);

        let executor = null;
        const zyFlowchartSDK = require('zyFlowchartSDK').create();
        let hadError = false;

        try {
            executor = zyFlowchartSDK.makeExecutor(this.currentQuestion.getInitialCode());
        }
        catch (error) {
            $(`#${this.id}`).text(`Question's initial code has an error: ${error}`);
            hadError = true;
        }

        let hadPreviousAnswer = false;

        if (!hadError) {
            let placeholder = this.currentQuestion.code.placeholder;

            if (this.isExam) {
                const userAnswer = this.parentResource.getLocalStore(`user-answer-${this.id}`);

                if (userAnswer) {
                    placeholder = userAnswer;
                    hadPreviousAnswer = true;
                }
            }

            const maxExecutorHeight = 550;
            const maxExecutorWidth = 870;

            this.executorController = zyFlowchartSDK.makeExecutorController(executor, $(`#${this.id} .code-editor`));
            this.executorController.setIsPseudocodeEditable(true);
            this.executorController.setIsPseudocodeEditingRestricted(
                true, this.currentQuestion.code.pre, placeholder, this.currentQuestion.code.post
            );
            this.executorController.setLanguagesToShow('both');
            this.executorController.setIsCompact(true, maxExecutorHeight, maxExecutorWidth);
            this.executorController.setCompilationErrorCallback(errorMessage => this.submitCompilationError(errorMessage, levelIndex));
            this.executorController.render();
            this.parentResource.latexChanged();
        }

        return hadPreviousAnswer;
    }

    /**
        Submit the compilation error message for recording.
        @method submitCompilationError
        @param {String} errorMessage The error message to submit.
        @param {Integer} levelIndex The level to record for.
        @return {void}
    */
    submitCompilationError(errorMessage, levelIndex) {
        this.parentResource.postEvent({
            answer: this.executorController.getPseudocode(),
            complete: false,
            part: levelIndex,
            metadata: {
                errorMessage,
            },
        });
    }
}

module.exports = {
    create: function() {
        return new PseudocodeProgrammingProgression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};
