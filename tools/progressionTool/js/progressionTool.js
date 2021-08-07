'use strict';

/* global Spinner, Ember */

Handlebars.registerHelper('rangeOneIndexed', (number, block) => {

// Register the "range" helper for use in HandleBars templates.
// "range" works like range() in python, generating a sequence
// of integers from 0 to argument n-1.
//   Example Usage:
//   	{{range 10}}
//   		<div id="d{{this}}" />
//   	{{/range}}
//
//	The above outputs 10 divs having ids d0 - d9:
//		<div id="d0" />
//		<div id="d1" />
//		...
//		<div id="d9" />

    let accumulate = '';

    for (let index = 0; index < number; ++index) {
        accumulate += block.fn(index + 1);
    }
    return accumulate;
});

/**
    A progression tool template that stores standard behavior.
    @module ProgressionTool
    @return {void}
*/
function ProgressionTool() {
    this.feedbackMessage = '';
    this.explanationMessage = '';
    this.userAnswer = '';
    this.expectedAnswer = '';

    /**
        Whether the progression has been started.
        @property _hasStartedProgression
        @private
        @type Boolean
        @default false
    */
    this._hasStartedProgression = false;

    /**
        Whether the user has been shown the jump message.
        @property _shownJumpMessage
        @private
        @type Boolean
        @default false
    */
    this._shownJumpMessage = false;

    /**
        Whether to allow a student to show the solution.
        @property showSolution
        @type {Boolean}
        @default false
    */
    this.showSolution = false;

    /**
        The callback for when the solution should be shown.
        @property solutionCallback
        @type {Function}
        @default null
    */
    this.solutionCallback = null;

    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.numToWin = options.numToWin;
        this.toolSpecificStartButtonBehavior = options.start;
        this.toolSpecificResetButtonBehavior = options.reset;
        this.toolSpecificNextButtonBehavior = options.next;
        this.toolSpecificCheckWhetherAnswerIsCorrect = options.isCorrect;
        this.toolSpecificInitialize = options.initialize;
        this.showSolution = options.showSolution;
        this.useMultipleParts = ('useMultipleParts' in options) ? options.useMultipleParts : false;
        this.isExam = options.isExam;
        this.currentQuestionAnsweredCorrectly = false;

        // If multiple parts are used but this is not an exam, then support user jumping between levels.
        this.canLevelJump = this.useMultipleParts && !this.isExam;

        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.utilities = require('utilities');
        this.$tool = $(`#${this.id}`);

        if (this.isExam && (this.numToWin !== 1)) {
            this.$tool.text('Can only have 1 level in exam mode');
            return;
        }

        this.$tool.addClass('progressionTool');

        if (parentResource.needsAccessible && parentResource.needsAccessible() && options.accessibleViewForLevel) {

            // Generate indices from 0..(this.numToWin - 1)
            const levelIndices = this.utilities.createArrayOfSizeN(this.numToWin).map((_, index) => index); // eslint-disable-line id-length
            const promises = levelIndices.map(levelIndex => options.accessibleViewForLevel(levelIndex));

            // When all the levels are generated, build the accessible HTML.
            Ember.RSVP.all(promises).then(questionHTMLs => {
                const questionHTMLWithLevels = questionHTMLs.map((questionHTML, index) => `<p>Level ${index + 1}</p>${questionHTML}`);
                const accessibleHTML = questionHTMLWithLevels.join('');

                this.$tool.html(css + accessibleHTML);
            },
            errorMessage => {
                this.$tool.html(`<p>Error: ${errorMessage}</p>`);
                require('zyWebErrorManager').postError(errorMessage);
            });
        }
        else {
            this.checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);

            const html = this[this.name].progressionTool({
                canLevelJump: this.canLevelJump,
                isExam: this.isExam,
                numberOfSegments: this.numToWin,
                toolSpecificCSS: options.css,
                toolSpecificHTML: options.html,
            });

            this.$tool.html(css + html);

            this.currentQuestionNumber = 0;
            this.recordProgressionLevel();

            this.$startButton = this.$tool.find('.zyante-progression-start-button');
            this.$resetButton = this.$tool.find('.zyante-progression-reset-button');
            this.$questionArea = this.$tool.find('.zyante-progression-tool-specific-outlet');
            this.$nextButton = this.$tool.find('.zyante-progression-next-button');
            this.$tryAgainButton = this.$tool.find('.zyante-progression-try-again');
            this.$showSolutionButton = this.$tool.find('.zyante-progression-show-solution');
            this.$checkButton = this.$tool.find('.zyante-progression-check-button');
            this.$progressionBarSegments = this.$tool.find('.zyante-progression-status-bar div');
            this.$isDone = this.$tool.find('.zyante-progression-is-done');
            this.$xMark = this.$tool.find('.zyante-progression-x-mark');
            this.$checkmark = this.$tool.find('.zyante-progression-checkmark');
            this.$explanation = this.$tool.find('.zyante-progression-explanation');
            this.$explanationArea = this.$tool.find('.zyante-progression-explanation-area');
            this.$solutionArea = this.$tool.find('.zyante-progression-solution-area');
            this.$solution = this.$solutionArea.find('.solution');
            this.spinnerDiv = this.$tool.find('.zyante-progression-spinner')[0];

            this.$resetButton.hide();

            this.utilities.disableButton(this.$nextButton);
            this.utilities.disableButton(this.$tryAgainButton);
            if (this.numToWin === 1) {
                this.$nextButton.hide();
            }
            else {
                this.$tryAgainButton.hide();
            }

            this.utilities.disableButton(this.$showSolutionButton);
            if (!this.showSolution) {
                this.$showSolutionButton.hide();
            }
            this.$solutionArea.hide();

            if (this.isExam) {
                this.$checkButton.text('Submit');
            }

            this.utilities.disableButton(this.$checkButton);
            this.$isDone.hide();
            this.$xMark.hide();
            this.$checkmark.hide();
            this.$checkmark.attr('src', this.checkmarkImageURL);
            this._highlightCurrentLevel();

            this.$startButton.click(() => {
                this.startButtonClick();
                return false;
            });
            this.$resetButton.click(() => {
                this.resetButtonClick();
            });
            this.$nextButton.click(() => {
                this.nextButtonClick();
                return false;
            });
            this.$tryAgainButton.click(() => {
                this.tryAgainButtonClick();
                return false;
            });
            this.$checkButton.click(() => {
                this.checkButtonClick();
            });
            this.$showSolutionButton.click(() => {
                this.showSolutionButtonClick();
            });

            if (this.canLevelJump) {
                this._shownJumpMessage = parentResource.getLocalStore('shownJumpMessage');

                this.$progressionBarSegments.click(event => {
                    if (this._hasStartedProgression) {
                        const index = this.$progressionBarSegments.index(event.target);
                        const clickedLevel = index + 1;
                        const completedLevels = this.$progressionBarSegments.map((_index, segment) => $(segment).hasClass('filled'));
                        const tooFarForStudentIndex = index - 1;
                        const tooFarForStudent = (tooFarForStudentIndex >= 0) && !completedLevels[tooFarForStudentIndex];
                        const isStudent = parentResource.isStudent();
                        const title = 'Level jump';

                        // Students can only jump to a completed level, or the last completed level plus 1.
                        if (isStudent && tooFarForStudent) {

                            parentResource.alert(title, 'Must first complete all earlier levels.');
                        }

                        // If non-student has seen message, then just jump.
                        else if (!isStudent && this._shownJumpMessage) {
                            this._jumpToLevel(this.currentQuestionNumber, index);
                        }
                        else {

                            // Build confirm button of modal
                            const confirmButtonLabel = isStudent ? 'Yes, jump.' : 'Ok, got it.';
                            const confirmButton = {
                                keepOpen: false,
                                label: confirmButtonLabel,
                                decoration: 'button-blue',
                                callback: () => {
                                    this._jumpToLevel(this.currentQuestionNumber, index);
                                },
                            };

                            // Display jump modal.
                            if (isStudent) {
                                const studentJumpMessage = `Jump to level ${clickedLevel}? Completion is preserved.`;

                                this.parentResource.showModal(title, studentJumpMessage, confirmButton,
                                    {
                                        keepOpen: false,
                                        label: 'No, don\'t jump.',
                                        decoration: 'button-red',
                                    }
                                );
                            }

                            // Show instructor jump message only once.
                            else if (!this._shownJumpMessage) {
                                const instructorJumpMessage = 'Students can only jump to completed levels, or next uncompleted level.' +
                                                              ' Instructors are allowed to jump to any level.';

                                this.parentResource.showModal(title, instructorJumpMessage, confirmButton);
                            }

                            // Record that jump message has been shown.
                            this._shownJumpMessage = true;
                            this.parentResource.setLocalStore('shownJumpMessage', this._shownJumpMessage);
                        }
                    }
                });
            }

            this._fillCompletedLevels();

            let hadPreviousAnswer = false;

            if (this.toolSpecificInitialize) {
                hadPreviousAnswer = this.toolSpecificInitialize();
            }

            if (this.isExam) {
                this.startButtonClick();

                if (hadPreviousAnswer) {
                    this.checkButtonClick(true);
                }
            }
        }
    };

    /**
        Record data on a user action that is unrelated to assessment.
        @method recordUserAction
        @param {Object} metadata The data to record.
        @return {void}
    */
    this.recordUserAction = function(metadata) {
        this.parentResource.postEvent({
            part: this.currentQuestionNumber,
            complete: false,
            metadata,
        });
    };

    /**
        Jump to the level at the given index.
        @method jumpToLevelIndex
        @param {Integer} index The index of the level to jump to.
        @return {void}
    */
    this.jumpToLevelIndex = function(index) {
        this.currentQuestionNumber = index;
        this._loadNextQuestion();
    };

    /**
        Jump from one level to another.
        @method _jumpToLevel
        @private
        @param {Number} fromLevel The level from which we're jumping.
        @param {Number} toLevel The level to which we're jumping.
        @return {void}
    */
    this._jumpToLevel = function(fromLevel, toLevel) {
        this.recordUserAction({
            jumpedLevel: true,
            jumpedFromLevelIndex: fromLevel,
            jumpedToLevelIndex: toLevel,
        });
        this.jumpToLevelIndex(toLevel);
    };

    /**
        Fill in the already completed levels.
        @method _fillCompletedLevels
        @private
        @return {void}
    */
    this._fillCompletedLevels = function() {
        const activityCompletionResponse = this.parentResource.activityCompletion();

        if (activityCompletionResponse instanceof Ember.RSVP.Promise) {
            activityCompletionResponse.then(activityData => {
                this._processActivityCompletionObject(activityData);
            });
        }
        else {
            this._processActivityCompletionObject(activityCompletionResponse);
        }
    };

    /**
        Process the activity completion object returned by zyWeb.
        @method _processActivityCompletionObject
        @private
        @param {Array} activityData Array of {Object}. The activity completion object returned by zyWeb.
        @return {void}
    */
    this._processActivityCompletionObject = function(activityData) {
        const activityCompletion = activityData.partsCompletionStatus.map(status => (status.complete === 1));

        // Get the level indices of completed levels, then remove incomplete levels.
        const indicesOfCompletedLevels = activityCompletion.map((completed, index) => {
            let completedIndex = null;

            // Map index of completed activity.
            if (completed) {
                completedIndex = index;
            }

            return completedIndex;
        }).filter(completedIndex => completedIndex !== null);

        let indicesOfLevelsToFill = [];

        // For multiple-part progressions, fill each level separately.
        if (this.useMultipleParts) {
            indicesOfLevelsToFill = indicesOfCompletedLevels;
        }

        // For single-part progressions, fill all if complete. Otherwise, fill none.
        else if (indicesOfCompletedLevels[0] === 0) {
            indicesOfLevelsToFill = this.$progressionBarSegments.map(index => index).toArray();
        }

        // Fill completed levels.
        indicesOfLevelsToFill.forEach(levelIndex => {
            this.$progressionBarSegments.eq(levelIndex).addClass('filled');
        });
    };

    /**
        Behavior for when the start button is clicked.
        @method startButtonClick
        @private
        @return {void}
    */
    this.startButtonClick = function() {
        this._hasStartedProgression = true;
        this.recordUserAction({ startClicked: true });

        if (this.useMultipleParts) {
            this.$tool.addClass('progression-started');
        }

        this.$startButton.hide();
        this.$resetButton.show();
        this.utilities.enableButton(this.$checkButton);
        this.utilities.enableButton(this.$showSolutionButton);

        this.toolSpecificStartButtonBehavior();
    };

    /**
        Display reset modal.
        @method displayResetConfirmModal
        @private
        @return {void}
    */
    this.displayResetConfirmModal = function() {
        const title = 'Level jump';

        // Build confirm button of modal
        const confirmButton = {
            keepOpen: false,
            label: 'Yes, jump.',
            decoration: 'button-blue',
            callback: () => {
                this.reset();
            },
        };
        const messageEnd = this.canLevelJump ? ' Completion is preserved.<br/>Note: Can click a level to jump.' : '';
        const jumpMessage = `Jump to level 1?${messageEnd}`;

        this.parentResource.showModal(title, jumpMessage, confirmButton,
            {
                keepOpen: false,
                label: 'No, don\'t jump.',
                decoration: 'button-red',
            }
        );
    };

    /**
        Handle reset button click.
        @method resetButtonClick
        @private
        @return {void}
    */
    this.resetButtonClick = function() {

        // User has answered 1+ questions
        if (this.currentQuestionNumber > 0) {
            this.displayResetConfirmModal();
        }
        else {
            this.reset();
        }
    };

    /**
        Highlight the current level.
        @method _highlightCurrentLevel
        @private
        @return {void}
    */
    this._highlightCurrentLevel = function() {
        this.$progressionBarSegments.removeClass('highlighted').eq(this.currentQuestionNumber).addClass('highlighted');
    };

    /**
        Load the next question.
        @method _loadNextQuestion
        @private
        @return {void}
    */
    this._loadNextQuestion = function() {
        this.currentQuestionAnsweredCorrectly = false;
        this.recordProgressionLevel();
        this.utilities.disableButton(this.$nextButton);
        this.utilities.disableButton(this.$tryAgainButton);
        this.utilities.enableButton(this.$checkButton);
        this.utilities.enableButton(this.$showSolutionButton);
        this.$solutionArea.hide();
        this.$solution.html('');
        this.$isDone.hide();
        this.$xMark.hide();
        this.$checkmark.hide();
        this._highlightCurrentLevel();

        const builderMode = this.toolSpecificNextButtonBehavior(this.currentQuestionNumber) || false;
        const explanationHadContent = Boolean(this.$explanation.text());

        if (explanationHadContent && !builderMode) {

            // Set explanation area height to height of content.
            this.$explanationArea.css('height', this.$explanationArea.height());

            // Remove content.
            this.$explanation.text('');

            // Animate height back to 'auto' from original explanation height.
            this.$explanationArea.animate(
                { height: 0 },
                {
                    complete: () => {
                        this.$explanationArea.css('height', 'auto');
                    },
                }
            );
        }

        this.parentResource.scrollToTop();
    };

    /**
        Handle next button click by hiding explanation and showing next question.
        @method nextButtonClick
        @private
        @return {void}
    */
    this.nextButtonClick = function() {
        if (!this.$nextButton.hasClass('disabled')) {
            if (this.currentQuestionAnsweredCorrectly) {
                this.currentQuestionNumber++;
            }

            this.recordUserAction({
                nextClicked: true,

                // Boolean() needed b/c |this.currentQuestionAnsweredCorrectly| may be undefined and undefined is not recorded.
                nextLevel: Boolean(this.currentQuestionAnsweredCorrectly),
            });
            this._loadNextQuestion();
        }
    };

    /**
        Handle try again button click by hiding explanation and showing the question again.
        @method tryAgainButtonClick
        @private
        @return {void}
    */
    this.tryAgainButtonClick = function() {
        if (!this.$tryAgainButton.hasClass('disabled')) {
            this._loadNextQuestion();
            this.recordUserAction({ tryAgainClicked: true });
        }
    };

    /**
        Submit event of user activity.
        @method postUserAnswerAndExpectedAnswer
        @private
        @param {Boolean} isCorrect Whether the user's answer was correct.
        @param {Object} metadata Metadata on user activity to be recorded.
        @return {void}
    */
    this.postUserAnswerAndExpectedAnswer = function(isCorrect, metadata) {

        // If the progression tool has multiple parts, then submit the |this.currentQuestionNumber| and whether |isCorrect|.
        let isComplete = isCorrect;
        let part = this.currentQuestionNumber;

        // If not multiple parts, then |part| is always 0 and |completed| is true if the last question was answered correctly
        if (!this.useMultipleParts) {
            const onLastQuestion = ((this.currentQuestionNumber + 1) === this.numToWin);

            isComplete = isCorrect && onLastQuestion;
            part = 0;
        }

        const metadataToRecord = $.extend(metadata, {
            expectedAnswer: this.expectedAnswer,
        });

        this.parentResource.postEvent({
            answer: this.userAnswer,
            complete: isComplete ? 1 : 0,
            metadata: metadataToRecord,
            part,
        });
    };

    /**
        Start the spinner.
        @method startSpinner
        @private
        @return {void}
    */
    this.startSpinner = function() {
        const opts = {
            lines: 13,
            length: 5,
            width: 3,
            radius: 7,
            corners: 1,
            rotate: 0,
            direction: 1,
            color: '#CC6600',
            speed: 1,
            trail: 60,
            shadow: false,
            hwaccel: false,
            className: 'spinner',
            zIndex: 2e9,
            top: '50%',
            left: '50%',
        };

        this.spinner = new Spinner(opts).spin(this.spinnerDiv);
    };

    /**
        Stop the spinner.
        @method stopSpinner
        @private
        @return {void}
    */
    this.stopSpinner = function() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    };

    /**
        Handle the isCorrect function return value |toolCorrectness|.
        @method handleCorrectnessValue
        @private
        @param {Object} toolCorrectness Includes properties used to react to a user's response.
        Supports {Boolean} for whether the user's answer is correct.
        @param {String} toolCorrectness.explanationMessage An explanation message.
        @param {String} toolCorrectness.userAnswer The user's answer.
        @param {String} toolCorrectness.expectedAnswer The expected answer.
        @param {Boolean} toolCorrectness.isCorrect Whether the user's answer is correct.
        @param {Boolean} [toolCorrectness.latexChanged=false] Whether LaTex is in the explanation.
        @param {Function} [toolCorrectness.callbackFunction=null] A possible callback function after explanation is shown.
        @param {Object} [toolCorrectness.callbackParameters={}] An object containing parameters for the callback function.
        @param {Boolean} [toolCorrectness.showTryAgain=false] Whether to show Try Again instead of Next button.
        @param {Boolean} isAutoClickDuringExamLoad Whether the check button click was automatically done during exam loading.
        @return {void}
    */
    this.handleCorrectnessValue = function(toolCorrectness, isAutoClickDuringExamLoad) { // eslint-disable-line complexity
        let isCorrect = false;
        let latexChanged = false;
        let callbackFunction = null;
        let explanationAsText = false;
        let metadata = {};
        let showTryAgain = this.numToWin === 1;
        let callbackParameters = {};

        if (toolCorrectness instanceof Object) {
            this.explanationMessage = toolCorrectness.explanationMessage;
            this.userAnswer = toolCorrectness.userAnswer;
            this.expectedAnswer = toolCorrectness.expectedAnswer;

            if ('latexChanged' in toolCorrectness) {
                latexChanged = toolCorrectness.latexChanged;
            }

            if ('callbackFunction' in toolCorrectness) {
                callbackFunction = toolCorrectness.callbackFunction;
            }

            if ('callbackParameters' in toolCorrectness) {
                callbackParameters = toolCorrectness.callbackParameters;
            }

            if ('explanationAsText' in toolCorrectness) {
                explanationAsText = toolCorrectness.explanationAsText;
            }

            if ('metadata' in toolCorrectness) {
                metadata = toolCorrectness.metadata;
            }

            if ('showTryAgain' in toolCorrectness) {
                showTryAgain = toolCorrectness.showTryAgain;
            }

            isCorrect = toolCorrectness.isCorrect || this.isExam;
            showTryAgain = this.isExam || showTryAgain;
        }

        // Deprecated usage of the progressionTool, though most tools still use this interface.
        else {
            isCorrect = toolCorrectness;
        }

        if (!isAutoClickDuringExamLoad) {
            this.postUserAnswerAndExpectedAnswer(isCorrect, metadata);
        }

        if (!this.isExam) {
            if (isCorrect) {
                this.$progressionBarSegments.eq(this.currentQuestionNumber).addClass('filled');
                this.$checkmark.show();
            }
            else {
                this.$xMark.show();
            }
        }

        if (this.showSolution) {
            this.$checkmark.hide();
            this.$xMark.hide();
        }

        this.outputThenScrollToExplanation(this.explanationMessage, explanationAsText, isAutoClickDuringExamLoad);

        if (latexChanged) {
            this.parentResource.latexChanged();
        }

        if (isCorrect && ((this.currentQuestionNumber + 1) === this.numToWin)) {
            this.$isDone.show();
        }
        else {
            const $buttonToShow = showTryAgain ? this.$tryAgainButton : this.$nextButton;
            const $buttonToHide = showTryAgain ? this.$nextButton : this.$tryAgainButton;

            $buttonToHide.hide();
            $buttonToShow.show();
            this.utilities.enableButton($buttonToShow);

            if (!isAutoClickDuringExamLoad) {
                $buttonToShow.focus();
            }
        }

        this.currentQuestionAnsweredCorrectly = isCorrect;

        if (callbackFunction) {
            callbackFunction(callbackParameters);
        }
    };

    /**
        Output the explanation, then scroll to the explanation area.
        @method outputThenScrollToExplanation
        @private
        @param {String} explanationMessage The explanation message to output.
        @param {Boolean} explanationAsText Whether to set the explanation as text or HTML.
        @param {Boolean} [skipScroll=false] Whether to skip scrolling to the explanation.
        @return {void}
    */
    this.outputThenScrollToExplanation = function(explanationMessage, explanationAsText = false, skipScroll = false) {
        if (explanationAsText) {
            this.$explanation.text(explanationMessage);
        }
        else {
            this.$explanation.html(explanationMessage);
        }
        this.$explanationArea.hide().fadeIn();

        if (!skipScroll) {
            this.parentResource.scrollToBottom();
        }
    };

    /**
        Handel check button being clicked by asking tool to assess correctness.
        @method checkButtonClick
        @private
        @param {Boolean} [isAutoClickDuringExamLoad=false] Whether the check button click was automatically done during exam loading.
        @return {void}
    */
    this.checkButtonClick = function(isAutoClickDuringExamLoad = false) {
        if (!this.$checkButton.hasClass('disabled')) {
            this.utilities.disableButton(this.$checkButton);

            const toolReturnValue = this.toolSpecificCheckWhetherAnswerIsCorrect(this.currentQuestionNumber);

            // If tool returns a promise, then start the spinner.
            if (toolReturnValue instanceof Ember.RSVP.Promise) {
                this.startSpinner();

                toolReturnValue.then(
                    isCorrectReturnValue => {
                        this.stopSpinner();
                        this.handleCorrectnessValue(isCorrectReturnValue, isAutoClickDuringExamLoad);
                    },
                    errorMessage => {
                        this.stopSpinner();

                        // Enable Check button so the user can attempt the Next button again.
                        this.utilities.enableButton(this.$checkButton);

                        // Give tool specific error message showing in explanation area.
                        this.outputThenScrollToExplanation(errorMessage);
                    }
                );
            }
            else {
                this.handleCorrectnessValue(toolReturnValue, isAutoClickDuringExamLoad);
            }
        }
    };

    /**
        Handle when Show solution is clicked.
        @method showSolutionButtonClick
        @return {void}
    */
    this.showSolutionButtonClick = function() {
        this.parentResource.showModal(
            'Show solution then get a new problem?',
            '',
            {
                keepOpen: false,
                label: 'Yes, show/get.',
                decoration: 'button-blue',
                callback: () => {
                    this.confirmedShowSolution();
                },
            },
            {
                keepOpen: false,
                label: 'No, don\'t show/get.',
                decoration: 'button-red',
            }
        );
    };

    /**
        Show the solution.
        @method confirmedShowSolution
        @return {void}
    */
    this.confirmedShowSolution = function() {

        // Update buttons.
        this.utilities.disableButton(this.$checkButton);
        this.$nextButton.show();
        this.utilities.enableButton(this.$nextButton);
        this.$tryAgainButton.hide();
        this.utilities.disableButton(this.$tryAgainButton);
        this.utilities.disableButton(this.$showSolutionButton);

        // Show and scroll to solution.
        this.solutionCallback(this.$solution);
        this.$solutionArea.hide().fadeIn();
        this.parentResource.scrollToBottom();
    };

    /**
        Set the callback for when the solution should be shown.
        @method setSolutionCallback
        @param {String} solutionCallback The callback when the solution should be shown.
        @return {void}
    */
    this.setSolutionCallback = function(solutionCallback) {
        this.solutionCallback = solutionCallback;
    };

    /**
        Hook for zyWeb to reset this tool.
        @method reset
        @return {void}
    */
    this.reset = function() {
        this.$resetButton.show();
        this._jumpToLevel(this.currentQuestionNumber, 0);
    };

    /**
        Force a check button click.
        @method check
        @return {void}
    */
    this.check = function() {
        this.checkButtonClick();
    };

    /**
        Inform platform of the progression's current level.
        @method recordProgressionLevel
        @return {void}
    */
    this.recordProgressionLevel = function() {
        if (this.parentResource.setProgressionLevel) {
            this.parentResource.setProgressionLevel(this.currentQuestionNumber);
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

const progressionToolExport = {
    create: function() {
        return new ProgressionTool();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {

        <%= grunt.file.read(tests) %>
    },
};

module.exports = progressionToolExport;
