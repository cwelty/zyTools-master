/* global Level, QuestionFactory, FileEditorController, Ember, JavaScriptInfiniteLoopTest, TimeoutError, WebpageError */
/* exported WebProgrammingProgression */
'use strict';

/**
    Progression of randomly generated programming problems where the students have to write part of a program.
    @module WebProgrammingProgression
*/
class WebProgrammingProgression {

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
            List of each {FileEditorController} wherein the student writes codes.
            @property fileEditorControllers
            @type {Array}
            @default []
        */
        this.fileEditorControllers = [];

        /**
            Reference to the segmented control used for switching between file editors.
            @property segmentedControl
            @type {SegmentedControl}
            @default null
        */
        this.segmentedControl = null;

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
            Whether to show the user and expected webpage in the explanation.
            @property shouldShowWebpage
            @type {Boolean}
            @default false
        */
        this.shouldShowWebpage = false;
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

        this.shouldShowWebpage = !options.doNotShowWebpage;

        const levels = options.levels.map(levelJSON => new Level(levelJSON));
        const questionFactory = new QuestionFactory(levels);

        // Future selves, this is just an estimate, could be changed if needed :-)
        const maxQuestionsToCache = 10;

        this.questionCache = require('utilities').getQuestionCache(questionFactory, maxQuestionsToCache);

        const css = `<style><%= grunt.file.read(css_filename) %></style>${require('WebpageUtilities').css}`;
        const html = this.hbsTemplates.WebProgrammingProgression(); // eslint-disable-line new-cap

        $(`#${id}`).html(css + html);

        let didUserAnswer = false;

        require('progressionTool').create().init(id, parentResource, {
            html,
            css,
            numToWin: levels.length,
            useMultipleParts: true,
            start: () => {
                this.enable();
            },
            reset: () => {
                this.displayNewLevel(0);
                this.disable();
            },
            next: levelIndex => {
                const createNewLevel = (levelIndex !== this.currentLevelIndex) || !didUserAnswer;

                if (createNewLevel) {
                    this.displayNewLevel(levelIndex);
                }

                didUserAnswer = false;
                this.enable();
            },
            isCorrect: () => {
                didUserAnswer = true;
                this.disable();

                // Check that the user provided some new code.
                const fileStudentEdits = this.currentQuestion.getFileThatStudentEdits();
                const indexOfFileStudentEdits = this.currentQuestion.getShownFiles().indexOf(fileStudentEdits);
                const userAnswer = this.fileEditorControllers[indexOfFileStudentEdits].getStudentCode();
                const placeholder = fileStudentEdits.placeholder;

                if ((userAnswer.trim() === '') || (userAnswer.trim() === placeholder.trim())) {
                    return {
                        explanationMessage: 'No code was provided',
                        isCorrect: false,
                        showTryAgain: true,
                    };
                }

                return new Ember.RSVP.Promise(resolve => {

                    // Remove the iframes used for unit testing.
                    this.getUnitTestIFramesContainer().empty();

                    // If there is only 1 JS file, then test the JS for infinite loops.
                    const justOneJSFile = (this.currentQuestion.initialQuestionFiles.length === 1) &&
                                          (this.currentQuestion.initialQuestionFiles[0].language === 'js');

                    if (justOneJSFile) {
                        const userCode = this.fileEditorControllers[0].getCode();
                        const tester = new JavaScriptInfiniteLoopTest(userCode);

                        // Check for infinite loops in user's code with shown code.
                        tester.run().then(() => {
                            const unitTests = this.currentQuestion.getUserUnitTests(userAnswer);
                            const testers = unitTests.map(unitTest => new JavaScriptInfiniteLoopTest(unitTest));
                            const promises = testers.map(test => test.run());

                            // Check for infinite loops in user's code with unit test code.
                            Promise.all(promises).then(() => {
                                this.buildUnitTestResults(userAnswer).then(results => {
                                    resolve(results);
                                });
                            },
                            () => {
                                const isCorrect = false;

                                resolve({
                                    explanationMessage: 'Tests did not finish executing with your code (may be due to an infinite loop).',
                                    userAnswer,
                                    expectedAnswer: this.currentQuestion.solution,
                                    isCorrect,
                                    showTryAgain: !isCorrect,
                                });
                            });
                        },
                        () => {
                            const isCorrect = false;

                            resolve({
                                explanationMessage: 'Your code did not finish executing (may be due to an infinite loop).',
                                userAnswer,
                                expectedAnswer: this.currentQuestion.solution,
                                isCorrect,
                                showTryAgain: !isCorrect,
                            });
                        });
                    }
                    else {
                        this.buildUnitTestResults(userAnswer).then(results => {
                            resolve(results);
                        });
                    }
                });
            },
            accessibleViewForLevel: levelIndex => {
                const question = this.questionCache.makeQuestion(levelIndex);

                return this.hbsTemplates.QuestionAccessible({ question }); // eslint-disable-line new-cap
            },
        });

        this.displayNewLevel(0);
        this.disable();
    }

    /**
        Build unit test results.
        @method buildUnitTestResults
        @param {String} userAnswer The user's answer.
        @return {Promise} Resolves once the unit tests completed and results have been built.
    */
    buildUnitTestResults(userAnswer) {

        // Build unit test webpages.
        const userWebpage = this.buildUserWebpage();
        const expectedWebpage = this.buildExpectedWebpage();
        const userUnitTestWebpage = this.hbsTemplates.UnitTestWebpage({ // eslint-disable-line new-cap
            unitTests: this.currentQuestion.getUserUnitTests(userAnswer),
            webpage: userWebpage,
            webpageAsString: this.convertWebpageToOneLineString(userWebpage),
            webpageName: 'userWebpage',
        });
        const expectedUnitTestWebpage = this.hbsTemplates.UnitTestWebpage({ // eslint-disable-line new-cap
            unitTests: this.currentQuestion.getExpectedUnitTests(),
            webpage: expectedWebpage,
            webpageAsString: this.convertWebpageToOneLineString(expectedWebpage),
            webpageName: 'expectedWebpage',
        });

        return new Ember.RSVP.Promise(resolve => {
            this.runUnitTests(userUnitTestWebpage, expectedUnitTestWebpage).then(testResults => {

                // Build explanation message.
                const isCorrect = testResults.every(testResult => testResult.isCorrect);
                let suppressRemainingTests = false;
                const testResultsToShow = testResults.filter(testResult => {
                    const shouldKeep = !suppressRemainingTests;

                    suppressRemainingTests = suppressRemainingTests || (!testResult.isCorrect && testResult.moreData.suppressAfterIfFail);

                    return shouldKeep;
                });
                const explanationMessage = this.hbsTemplates.Explanation({ // eslint-disable-line new-cap
                    checkmarkImageURL: require('utilities').getCheckmarkImageURL(this.parentResource),
                    isCorrect,
                    shouldShowWebpage: this.shouldShowWebpage,
                    testResultsToShow,
                    whetherTestsWereSuppressed: testResultsToShow.length !== testResults.length,
                });

                resolve({
                    explanationMessage,
                    userAnswer,
                    expectedAnswer: this.currentQuestion.solution,
                    isCorrect,
                    showTryAgain: !isCorrect,
                    callbackFunction: () => {
                        const $legendButton = $(`#${this.id} .special-character-legend`);

                        if (this.parentResource.showSpecialCharacterLegendModal) {
                            $legendButton.click(() => this.parentResource.showSpecialCharacterLegendModal());
                        }
                        else {
                            $legendButton.hide();
                        }

                        if (this.shouldShowWebpage) {

                            // Show the user's webpage.
                            const userIframe = $(`#${this.id} iframe.user-webpage`)[0];

                            require('WebpageUtilities').updateIFrame(userIframe, userWebpage);

                            // If user's answer is incorrect, also show the expected webpage.
                            if (!isCorrect) {
                                const expectedIframe = $(`#${this.id} iframe.expected-webpage`)[0];

                                require('WebpageUtilities').updateIFrame(expectedIframe, expectedWebpage);
                            }
                        }
                    },
                });
            },
            error => {
                const isCorrect = false;
                let explanationMessage = '';

                if (error.type === 'timeout') {
                    explanationMessage = error.message;
                }
                else if (error.type === 'webpage') {
                    const messageEnding = ' The code editor above may provide more details for this error.';

                    /*
                        Make sure a period separates the |error.message| from |messageEnding|.
                        Sometimes Safari adds the period automatically. Chrome/Firefox usually don't add the period.
                    */
                    const isLastCharPeriod = error.message[error.message.length - 1] === '.';

                    explanationMessage = `${error.message}${isLastCharPeriod ? '' : '.'}${messageEnding}`;

                    const fileStudentEdits = this.currentQuestion.getFileThatStudentEdits();
                    const indexOfFileStudentEdits = this.currentQuestion.getShownFiles().indexOf(fileStudentEdits);
                    const code = this.fileEditorControllers[indexOfFileStudentEdits].getCode();
                    const showErrorMessageHint = this.parentResource.showErrorMessageHintAboutLineNumbers &&
                                                 this.parentResource.showErrorMessageHintAboutLineNumbers(
                        error.message.toString(), userAnswer, code, fileStudentEdits.language
                    );

                    if (showErrorMessageHint) {
                        explanationMessage += require('utilities').getNewline();
                        explanationMessage += 'Note: Although the reported line number is in the uneditable part of the code, the error actually exists in your code. Tools often don\'t recognize the problem until reaching a later line.'; // eslint-disable-line max-len
                    }
                }

                resolve({
                    explanationMessage,
                    userAnswer,
                    expectedAnswer: this.currentQuestion.solution,
                    isCorrect,
                    showTryAgain: !isCorrect,
                });
            });
        });
    }

    /**
        Convert the given webpage to a single-line string that will be placed on a webpage.
        @method convertWebpageToOneLineString
        @param {String} webpage The webpage to convert to a single-line.
        @return {String} The webpage as a single-line.
    */
    convertWebpageToOneLineString(webpage) {

        // Escape the single-quotes, newlines, and forward slashes.
        return webpage.replace(/\\/g, '\\\\').replace(/'/g, '\\\'').replace(/\n/g, '\\n').replace(/\//g, '\\/');
    }

    /**
        Return the user's webpage.
        @method buildUserWebpage
        @return {String} The user's webpage.
    */
    buildUserWebpage() {
        const filesShown = this.currentQuestion.getShownFiles();
        const userWebpageFiles = this.currentQuestion.initialQuestionFiles.map(file => {
            let contents = file.toContents();

            // Get contents of shown files from the file editor.
            if (!file.isHidden) {
                const controllerIndex = filesShown.indexOf(file);

                contents = this.fileEditorControllers[controllerIndex].getCode();
            }

            return require('WebpageUtilities').makeWebpageFile(file.language, file.filename, contents);
        });

        return require('WebpageUtilities').buildWebpageFromFiles(userWebpageFiles);
    }

    /**
        Return the expected webpage.
        @method buildExpectedWebpage
        @return {String} The expected webpage.
    */
    buildExpectedWebpage() {
        const expectedWebpageFiles = this.currentQuestion.expectedQuestionFiles.map(
            file => require('WebpageUtilities').makeWebpageFile(file.language, file.filename, file.toContents())
        );

        return require('WebpageUtilities').buildWebpageFromFiles(expectedWebpageFiles);
    }

    /**
        Promise to return unit test results for the user and expected webpage's unit tests.
        @method runUnitTests
        @param {String} userUnitTestWebpage The unit test webpage for the user's solution.
        @param {String} expectedUnitTestWebpage The unit test webpage for the expected solution.
        @return {Promise} Resolves once test results are back.
    */
    runUnitTests(userUnitTestWebpage, expectedUnitTestWebpage) {
        return new Ember.RSVP.Promise((resolve, reject) => {

            // Build the message event for cross-browser support.
            const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
            const eventer = window[eventMethod];
            const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

            // Create message event to capture finished unit tests.
            let userWebpageUnitTestResults = null;
            let expectedWebpageUnitTestResults = null;

            // Give unit tests 5 seconds to finish.
            const maxUnitTestTime = 5000;
            const unitTestTimer = setTimeout(() => {
                const alternativeExplanation = expectedWebpageUnitTestResults ? 'infinite loop or ' : '';

                reject(
                    new TimeoutError(
                        `Tests did not finish in 5 seconds (may be due to an ${alternativeExplanation}Internet connection issue)`
                    )
                );
            }, maxUnitTestTime);

            eventer(messageEvent, event => {

                // Unit tests for user's webpage finished.
                if (event.data.webpageName === 'userWebpage') {
                    userWebpageUnitTestResults = event.data.results;
                }

                // Unit tests for expected webpage finished.
                if (event.data.webpageName === 'expectedWebpage') {
                    expectedWebpageUnitTestResults = event.data.results;
                }

                // Both unit tests have finished.
                if ((userWebpageUnitTestResults !== null) && (expectedWebpageUnitTestResults !== null)) {

                    // Clear unit test timer.
                    clearTimeout(unitTestTimer);

                    let testResults = null;

                    try {
                        testResults = this.computeTestResults(userWebpageUnitTestResults, expectedWebpageUnitTestResults);
                    }
                    catch (errorMessage) {
                        reject(new WebpageError(errorMessage));
                        return;
                    }

                    const promises = testResults.map(result => result.buildOutputDifference(this.parentResource));

                    Ember.RSVP.all(promises).then(() => {
                        resolve(testResults);
                    });
                }
            });

            // Create unit test iframes.
            this.getUnitTestIFramesContainer().html(this.hbsTemplates.UnitTestIFrames()); // eslint-disable-line new-cap

            // Start the unit tests.
            const userUnitTestIFrame = $(`#${this.id} .user-unit-test`)[0];
            const expectedUnitTestIFrame = $(`#${this.id} .expected-unit-test`)[0];

            require('WebpageUtilities').updateIFrame(userUnitTestIFrame, userUnitTestWebpage);
            require('WebpageUtilities').updateIFrame(expectedUnitTestIFrame, expectedUnitTestWebpage);

            // Catch parsing errors in the unit test webpages.
            userUnitTestIFrame.contentWindow.onerror = function(errorMessage) {
                reject(new WebpageError(errorMessage));
            };
            expectedUnitTestIFrame.contentWindow.onerror = function(errorMessage) {
                reject(new WebpageError(errorMessage));
            };
        });
    }

    /**
        Return the jQuery reference to the container for the unit test iframes.
        @method getUnitTestIFramesContainer
        @return {Object} jQuery reference to the container for the unit test iframes.
    */
    getUnitTestIFramesContainer() {
        return $(`#${this.id} .unit-test-iframe-container`);
    }

    /**
        Compute the test results by comparing each unit test between the user's and expected unit tests.
        @method computeTestResults
        @param {Array} userWebpageResults List of each of the user's unit tests.
        @param {Array} expectedWebpageResults List of each of the expected unit tests.
        @return {Array} List of {TestResult} for each unit test between the user's and expected unit tests.
    */
    computeTestResults(userWebpageResults, expectedWebpageResults) {

        // Catch runtime errors in the expected unit test webpage.
        const expectedWebpageError = expectedWebpageResults.find(expectedWebpageResult => expectedWebpageResult.hadError);

        if (expectedWebpageError) {
            throw new Error(expectedWebpageError.errorMessage);
        }

        const userWebpageError = userWebpageResults.find(userWebpageResult => userWebpageResult.hadError);

        if (userWebpageError) {
            throw new Error(userWebpageError.errorMessage);
        }

        // Verify all messages have content.
        const expectedMessages = expectedWebpageResults.map(expectedWebpageResult => expectedWebpageResult.message);
        const messagesWithoutContent = expectedMessages.filter(message => !message);

        if (messagesWithoutContent.length) {
            const doOrDoes = messagesWithoutContent.length === 1 ? 'does' : 'do';

            throw new Error(`Each unit test must have a message, but ${messagesWithoutContent.length} ${doOrDoes} not`);
        }

        // Verify no duplicate messages in expected unit tests.
        expectedMessages.sort();

        const messagesAreUnique = expectedMessages.every((message, index) => {
            const isLastElement = index === (expectedMessages.length - 1);
            const nextMessageIsDifferent = message !== expectedMessages[index + 1];

            return isLastElement || nextMessageIsDifferent;
        });

        if (!messagesAreUnique) {
            throw new Error('Unit test messages are not unique, but should be');
        }

        // Verify each user message matches to some expected message.
        const userMessages = userWebpageResults.map(userWebpageResult => userWebpageResult.message);

        userMessages.sort();

        const messageLengthAreSame = (userMessages.length === expectedMessages.length);
        const messagesAreSame = messageLengthAreSame && userMessages.every((userMessage, index) => userMessage === expectedMessages[index]);

        if (!messagesAreSame) {
            throw new Error('User message not same as expected messages');
        }

        // Zip the user and expected webpage test results.
        const testResults = userWebpageResults.map(userWebpageResult => {

            // Find the expected result that matches the given user result.
            const matchingExpectedResult = expectedWebpageResults.find(expectedWebpageResult => { // eslint-disable-line arrow-body-style
                return userWebpageResult.message === expectedWebpageResult.message;
            });
            const userResult = String(userWebpageResult.value);
            const expectedResult = String(matchingExpectedResult.value);
            const isCorrect = userWebpageResult.value === matchingExpectedResult.value;
            const moreData = {
                message: userWebpageResult.message,
                suppressAfterIfFail: userWebpageResult.suppressAfterIfFail,
                isConsoleTest: userWebpageResult.isConsoleTest,
            };

            return require('utilities').getTestResult(userResult, expectedResult, isCorrect, moreData);
        });

        return testResults;
    }

    /**
        Enable the interactive content.
        @method enable
        @return {void}
    */
    enable() {
        this.fileEditorControllers.forEach(fileEditorController => {
            fileEditorController.enable();
        });

        if (this.segmentedControl) {
            this.segmentedControl.enable();
        }
    }

    /**
        Disable the interactive content.
        @method disable
        @return {void}
    */
    disable() {
        this.fileEditorControllers.forEach(fileEditorController => {
            fileEditorController.disable();
        });

        if (this.segmentedControl) {
            this.segmentedControl.disable();
        }
    }

    /**
        Show the file editor by index.
        @method showFileEditorByIndex
        @param {Integer} index The index of the file editor to show.
        @return {void}
    */
    showFileEditorByIndex(index) {

        // Hide all editors.
        this.fileEditorControllers.forEach(fileEditorController => {
            fileEditorController.hide();
        });

        // Show editor of given index to show.
        this.fileEditorControllers[index].show();

        // Re-render the shown editor.
        this.fileEditorControllers[index].forceRerender();
    }

    /**
        Display a new level given the |levelIndex|.
        @method displayNewLevel
        @param {Integer} levelIndex The index of the level to show.
        @return {void}
    */
    displayNewLevel(levelIndex) {
        this.currentLevelIndex = levelIndex;
        this.currentQuestion = this.questionCache.makeQuestion(levelIndex);

        // Set the solution if the platform supports.
        if (this.parentResource.setSolution) {
            const fileStudentEdits = this.currentQuestion.getFileThatStudentEdits();

            this.parentResource.setSolution(this.currentQuestion.solution, fileStudentEdits.language);
        }

        const filesToShow = this.currentQuestion.getShownFiles();
        const numberOfFiles = filesToShow.length;
        const hasMultipleFilesToShow = numberOfFiles > 1;
        const questionHTML = this.hbsTemplates.Question({ // eslint-disable-line new-cap
            hasMultipleFiles: hasMultipleFilesToShow,
            id: this.id,
            numberOfFiles,
            prompt: this.currentQuestion.prompt,
            shouldShowWebpage: this.shouldShowWebpage,
        });

        $(`#${this.id} .question-container`).html(questionHTML);

        // Build file editor controllers for the shown files.
        this.fileEditorControllers = filesToShow.map(
            (file, index) => new FileEditorController(`editor-${index}-${this.id}`, file)
        );

        // Initialize segmented control, if needed.
        if (hasMultipleFilesToShow) {
            const fileNames = filesToShow.map(file => file.filename);

            this.segmentedControl = require('segmentedControl').create();
            this.segmentedControl.init(fileNames, `segmented-control-${this.id}`, index => {
                this.showFileEditorByIndex(index);
                this.fileEditorControllers[index].focus();
            });
        }

        this.showFileEditorByIndex(0);

        $(`#${this.id} .show-me`).click(() => {
            const modal = this.hbsTemplates.ShowMeModal({ encodedWebpage: encodeURIComponent(this.buildExpectedWebpage()) }); // eslint-disable-line new-cap

            this.parentResource.alert('Expected webpage', modal);
        });
    }
}

module.exports = {
    create: function() {
        return new WebProgrammingProgression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};
