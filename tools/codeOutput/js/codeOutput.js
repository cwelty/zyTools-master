/* global Level, Ember, isLanguageAZyFlowchart, zyFlowchartRenderTypeMap, QuestionFactory */
/* exported CodeOutput */
'use strict';

/**
    Progression that generates problems where the students have to write the output of a generated program.
    @module CodeOutput
    @return {void}
*/
class CodeOutput {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique ID assigned to this instance of the module.
            @property id
            @type {Number}
            @default null
        */
        this.id = null;

        /**
            The instance of a progression tool used for this instance of the module.
            @property progressionTool
            @type {ProgressionTool}
            @default null
        */
        this.progressionTool = null;

        /**
            The instance of a segmented control tool used for this instance of the module.
            @property segmentedControl
            @type {SegmentedControl}
            @default null
        */
        this.segmentedControl = null;

        /**
            The height of a character in the output.
            @property characterHeight
            @type {Number}
            @default null
        */
        this.characterHeight = null;

        /**
            The width of a character in the output.
            @property characterWidth
            @type {Number}
            @default null
        */
        this.characterWidth = null;

        /**
            Stores the currently shown question.
            @property currentQuestion
            @type {Question}
            @default null
        */
        this.currentQuestion = null;

        /**
            Whether the previous question's issue was minor.
            @property previousQuestionNearlyCorrect
            @type {Boolean}
            @default false
        */
        this.previousQuestionNearlyCorrect = false;

        /**
            The index of the previous question.
            @property previousQuestionIndex
            @type {Number}
            @default null
        */
        this.previousQuestionIndex = null;

        /**
            Whether the code is zyFlowchart.
            @property isCodeZyFlowchart
            @type {Boolean}
            @default null
        */
        this.isCodeZyFlowchart = null;

        /**
            The type of zyFlowchart to render. Valid values: 'flowchart', 'pseudocode', or 'both' (as defined by the ExecutorController in zyFlowchartSDK).
            @property zyFlowchartRenderType
            @type {String}
            @default null
        */
        this.zyFlowchartRenderType = null;

        /**
            The executor controller used for flowchart and pseudocode.
            @property executorController
            @type {ExecutorController}
            @default null
        */
        this.executorController = null;

        /**
            Used to generate a specific question for a given level number.
            @property questionFactory
            @type {Array of QuestionFactory}
            @default null
        */
        this.questionFactory = null;

        /**
            A question cache of already-generated questions.
            @property questionCache
            @type {QuestionCache}
            @default null
        */
        this.questionCache = null;

        /**
            The handlebars templates for rendering HTML.
            @property templates
            @type {Object}
            @default null
        */
        this.templates = null;

        /**
            A dictionary of functions given by the parent resource.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            Whether to highlight lines of code that contain "New".
            @property highlightNew
            @type {Boolean}
            @default false
        */
        this.highlightNew = false;
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
        this.progressionTool = require('progressionTool').create();
        this.parentResource = parentResource;

        this.highlightNew = options && options.highlightNew;

        const isExam = parentResource.isExam && parentResource.isExam();
        const levels = (options.levels || options.questions).map(level => {
            const explanation = level.explanation || '';
            const input = level.input || '';
            const outputFilename = level.outputFilename || '';

            return new Level(level.template, level.parameters, explanation, options.language, input, outputFilename);
        });
        const maxQuestionsToCache = 5;
        const globalCode = options.globalCode || '';

        this.questionFactory = new QuestionFactory(levels, globalCode);
        this.questionCache = require('utilities').getQuestionCache(this.questionFactory, maxQuestionsToCache);

        this.isCodeZyFlowchart = isLanguageAZyFlowchart(options.language);
        if (this.isCodeZyFlowchart) {
            this.zyFlowchartRenderType = zyFlowchartRenderTypeMap[options.language];
        }

        let css = '<style><%= grunt.file.read(css_filename) %></style>';

        if (this.isCodeZyFlowchart) {
            css += require('zyFlowchartSDK').create().css;
            $(`#${id}`).addClass('zyFlowchartSDK');
        }

        this.templates = this['<%= grunt.option("tool") %>'];
        const html = this.templates.codeOutput({ id, isCodeZyFlowchart: this.isCodeZyFlowchart });

        let previousQuestion = 0;

        this.progressionTool.init(id, parentResource, {
            html,
            css,
            numToWin: levels.length,
            useMultipleParts: true,
            start: () => {
                this.makeLevel(0);
                this.lookupClass('console').focus();

                // Enable the language controls.
                if (this.isCodeZyFlowchart) {
                    this.executorController.setIsSegmentedLanguageControlEnabled(true);
                }
            },
            reset: () => {
                this.makeLevel(0, true);
                this.lookupClass('console').attr('disabled', true);
            },
            next: currentQuestion => {

                // Make a new level if not an exam. If it is an exam, then make a new question when the level changes.
                if (!isExam || (currentQuestion !== previousQuestion)) {
                    this.makeLevel(currentQuestion);
                }
                else {
                    this.lookupClass('console').attr('disabled', false);
                }
                this.lookupClass('console').focus();

                // Enable the language controls.
                if (this.isCodeZyFlowchart) {
                    this.executorController.setIsSegmentedLanguageControlEnabled(true);
                }
                previousQuestion = currentQuestion;
            },
            isCorrect: currentQuestionIndex => {

                // Disable the language controls.
                if (this.isCodeZyFlowchart) {
                    this.executorController.setIsSegmentedLanguageControlEnabled(false);
                }

                // If the server request for the expected answer was rejected, then try again.
                if (this.currentQuestion.isServerRequestRejected()) {
                    this.currentQuestion.setExpectedAnswer(this.parentResource);
                }

                return new Ember.RSVP.Promise((resolve, reject) => {
                    this.currentQuestion.serverRequestPromise.then(() => {
                        const userAnswer = this.lookupClass('console').val();
                        const expectedAnswer = this.currentQuestion.expectedAnswer;
                        const isAnswerCorrect = userAnswer === expectedAnswer;

                        this.lookupClass('console').attr('disabled', true);

                        if (parentResource.buildStringDifferenceObject) {
                            parentResource.buildStringDifferenceObject(expectedAnswer, userAnswer).then(stringDifferenceObject => {
                                const expectedDifferences = stringDifferenceObject.expectedAnswerDiffIndices.map(
                                    index => expectedAnswer[index]
                                );
                                const wasNewlineExpectedButMissing = expectedDifferences.some(difference => (/\n/).test(difference));

                                this.resolveIsCorrect({
                                    currentQuestionIndex,
                                    expectedAnswer,
                                    expectedOutput: stringDifferenceObject.expectedAnswerHTML,
                                    expectedOutputDiffIndices: stringDifferenceObject.expectedAnswerDiffIndices,
                                    isCorrect: isAnswerCorrect,
                                    isExam,
                                    parentResource,
                                    resolve,
                                    showSpecialCharacterLegendButton: stringDifferenceObject.isReplacementADifference ||
                                                                      stringDifferenceObject.isWhitespaceADifference,
                                    userAnswer,
                                    userOutput: stringDifferenceObject.userAnswerHTML,
                                    wasNewlineExpectedButMissing,
                                });
                            });
                        }

                        // Kept for 1.0 platform support.
                        else {
                            const diffData = require('utilities').manageDiffHighlighting(parentResource, expectedAnswer, userAnswer);

                            this.resolveIsCorrect({
                                currentQuestionIndex,
                                expectedAnswer,
                                expectedOutput: diffData.highlightedExpectedOutput,
                                expectedOutputDiffIndices: diffData.expectedOutputDiffIndices,
                                isCorrect: isAnswerCorrect,
                                parentResource,
                                resolve,
                                showSpecialCharacterLegendButton: false,
                                userAnswer,
                                userOutput: diffData.highlightedActualOutput,
                                wasNewlineExpectedButMissing: diffData.wasNewlineExpectedButMissing,
                            });
                        }
                    },
                    errorMessage => {
                        reject(errorMessage);
                    });
                });
            },
            accessibleViewForLevel: levelIndex => {
                const question = this.questionCache.makeQuestion(levelIndex);
                const hasMultipleFiles = question.files.length > 1;

                question.setExpectedAnswer(this.parentResource);

                return new Ember.RSVP.Promise((resolve, reject) => {
                    question.serverRequestPromise.then(() => {
                        const accessibleHTML = this.templates.codeOutputAccessible({ hasMultipleFiles, question });

                        resolve(accessibleHTML);
                    },
                    errorMessage => {
                        reject(errorMessage);
                    });
                });
            },
        });

        const useAccessibleView = parentResource.needsAccessible && parentResource.needsAccessible();

        if (!useAccessibleView) {

            // Compute exact size of a single character for use in |adjustConsoleSize|.
            const $characterSizing = this.lookupClass('character-sizing');
            const characterSizingBoundingRect = $characterSizing.get(0).getBoundingClientRect();

            this.characterHeight = characterSizingBoundingRect.height;
            this.characterWidth = characterSizingBoundingRect.width;
            $characterSizing.remove();

            // Initialize a level.
            this.makeLevel(0, true);
            this.lookupClass('console').attr('disabled', true);

            if (!this.isCodeZyFlowchart) {
                this.lookupClass('console').on('input', () => this.adjustConsoleSize());
            }
        }
    }

    /**
        Resolve the isCorrect function call.
        @method resolveIsCorrect
        @param {Object} parameters A dictionary of parameters for resolving the isCorrect function call.
        @param {Integer} parameters.currentQuestionIndex The index of the current level.
        @param {String} parameters.expectedAnswer The expected answer.
        @param {String} parameters.expectedOutput The output of the expected program.
        @param {Array} parameters.expectedOutputDiffIndices Array of {Integers}. The indices of the differences in the expected output.
        @param {Boolean} parameters.isCorrect Whether the user's answer was correct.
        @param {Boolean} parameters.isExam Whether to treat as an exam.
        @param {Object} parameters.parentResource A dictionary of functions given by the parent resource.
        @param {Function} parameters.resolve Function to call to finish the resolving.
        @param {Boolean} parameters.showSpecialCharacterLegendButton Whether to show the special character legend button.
        @param {String} parameters.userAnswer The user's answer.
        @param {String} parameters.userOutput The output of the user's program.
        @param {Boolean} parameters.wasNewlineExpectedButMissing Whether a newline was expected but is missing.
        @return {void}
    */
    resolveIsCorrect(parameters) {
        let newlineMessaging = '';

        if (parameters.wasNewlineExpectedButMissing) {

            /**
                Return the indices that correspond to a newline in the expected answer.
                @method getNewlineIndices
                @param {Array} indices Array of {Integer}. List of indices.
                @return {Array} of {Integer}. The indices that correspond to a newline in the expected output.
            */
            const getNewlineIndices = indices => indices.filter(index => (/[\n|\r]/).test(parameters.expectedAnswer[index]));

            // Find only indices for highlighted newlines in the expected output.
            const highlightedExpectedNewlineIndices = getNewlineIndices(parameters.expectedOutputDiffIndices);

            // Find all indices for newlines in the expected output.
            const expectedOutputIndices = parameters.expectedAnswer.split('').map((character, index) => index);
            const expectedNewlineIndices = getNewlineIndices(expectedOutputIndices);

            // Build the messaging. Each line of the messaging is either blank or states that a newline is missing on this line.
            const newlineMessage = '<span class="newline-message">You are missing a newline here.</span>';
            const newlineMessageFirstMissing = '<span class="newline-message">Create your missing newline by pressing Enter on your keyboard.</span>'; // eslint-disable-line max-len
            const lastLineNewlineMessage = '<span class="newline-message">You are missing a newline on the last line of your output.</span>'; // eslint-disable-line max-len
            let haveSeenFirstMissingNewline = false;

            newlineMessaging = expectedNewlineIndices.map(expectedNewlineIndex => {
                let messagingThisLine = '';

                if (highlightedExpectedNewlineIndices.includes(expectedNewlineIndex)) {
                    if (haveSeenFirstMissingNewline) {
                        messagingThisLine = (expectedNewlineIndex === (parameters.expectedAnswer.length - 1)) ?
                                            lastLineNewlineMessage :
                                            newlineMessage;
                    }
                    else {
                        messagingThisLine = newlineMessageFirstMissing;
                        haveSeenFirstMissingNewline = true;
                    }
                }

                return `${messagingThisLine}
`;
            }).join('');
        }

        let hintMessage = '';

        if (!parameters.isCorrect) {
            const expectedWithoutWhitespace = require('utilities').removeWhitespace(parameters.expectedAnswer);
            const userWithoutWhitespace = require('utilities').removeWhitespace(parameters.userAnswer);
            const isWhitespaceTheOnlyDifference = expectedWithoutWhitespace === userWithoutWhitespace;
            const isCaseTheOnlyDifference = parameters.expectedAnswer.toLowerCase() === parameters.userAnswer.toLowerCase();
            const isNearlyCorrect = expectedWithoutWhitespace.toLowerCase() === userWithoutWhitespace.toLowerCase();

            if (isNearlyCorrect) {
                hintMessage = 'Output is nearly correct. ';

                if (isWhitespaceTheOnlyDifference) {
                    hintMessage += 'Whitespace differs';
                }
                else if (isCaseTheOnlyDifference) {
                    hintMessage += 'Capitalization differs';
                }
                else {
                    hintMessage += 'Whitespace and capitalization differ';
                }

                hintMessage += '.';
            }
        }

        const explanationHTML = this.templates.explanation({
            expectedOutput: parameters.expectedOutput,
            explanation: this.currentQuestion.explanation,
            hintMessage,
            newlineMessaging,
            showSpecialCharacterLegendButton: parameters.showSpecialCharacterLegendButton,
            userOutput: parameters.userOutput,
        });
        const explanationMessage = explanationHTML + require('utilities').getNewline();
        const toolWidth = this.lookupClass('tool-container').width();

        parameters.resolve({
            explanationMessage: parameters.isExam ? '' : explanationMessage,
            userAnswer: parameters.userAnswer,
            expectedAnswer: parameters.expectedAnswer,
            isCorrect: parameters.isCorrect,
            callbackFunction: () => {
                this.lookupClass('zyante-progression-explanation-area').width(toolWidth);
                this.lookupClass('special-character-legend').click(() => {
                    if (parameters.parentResource.showSpecialCharacterLegendModal) {
                        parameters.parentResource.showSpecialCharacterLegendModal();
                    }
                });
            },
        });

        this.previousQuestionNearlyCorrect = hintMessage;
        this.previousQuestionIndex = parameters.currentQuestionIndex;
    }

    /**
        Resize |$console| textarea to match contents.
        @method adjustConsoleSize
        @return {void}
    */
    adjustConsoleSize() {
        const $console = this.lookupClass('console');
        const consoleText = $console.val();

        // Adding guard in case console text is undefined.
        const eachLine = (consoleText || '').split('\n');

        // Compute the height of |$console| by the number of lines and height of a character.
        $console.css('height', this.characterHeight * eachLine.length);

        /*
            Compute the width of |$console| by the longest line and width of a character.
            |charactersInWidestLine| must be at least 1.
        */
        const lineLengths = eachLine.map(thisLine => thisLine.length);
        const charactersInWidestLine = Math.max(1, ...lineLengths);

        // Safari Mobile browsers require an additional 6px.
        const widthFudgeFactor = (navigator.userAgent.match(/(iphone|ipod|ipad)/i)) ? 6 : 0; // eslint-disable-line no-magic-numbers

        // Windows 10 and IE 11 rounds down to the nearest 100th. Instead, round up.
        const adjustedWidth = Math.ceil((this.characterWidth * charactersInWidestLine) + widthFudgeFactor);

        $console.css('width', adjustedWidth);
    }

    /**
        Update the text in |$console| to be |newText|.
        @method updateConsoleText
        @param {String} newText The new console text.
        @return {void}
    */
    updateConsoleText(newText) {
        this.lookupClass('console').val(newText);
        this.adjustConsoleSize();
    }

    /**
        Return the code after being colorized and highlighted.
        @method makeColorizedAndHighlightedCode
        @param {String} code The code to colorize and highlight.
        @param {Integer} currentQuestionIndex The level of the current question.
        @return {String} The colorized and highlighted code.
    */
    makeColorizedAndHighlightedCode(code, currentQuestionIndex) {
        let codeToColorize = code;
        let indicesToHighlight = [];

        // Need at least 2 lines to highlight: The top-most line + any other line.
        const minIndicesForHighlighting = 2;

        // Highlight lines with "New" on levels 2+.
        if (this.highlightNew && (currentQuestionIndex > 0)) {
            const lines = code.split('\n');

            // Convert language to the preferred comment syntax.
            let preferredCommentSyntax = '';

            switch (this.currentQuestion.language) {
                case 'c':
                case 'cpp':
                case 'java':
                    preferredCommentSyntax = '//';
                    break;
                case 'python':
                case 'python3':
                    preferredCommentSyntax = '#';
                    break;
                default:
                    break;
            }

            // Add top-most line explaining what New indicates.
            lines.unshift(`${preferredCommentSyntax} "New" means new compared to previous level`);

            // Get indices for lines that include "New".
            indicesToHighlight = lines.map((line, index) => ({ line, index }))
                                      .filter(obj => (/New/).test(obj.line))
                                      .map(obj => obj.index);

            if (indicesToHighlight.length >= minIndicesForHighlighting) {
                codeToColorize = lines.join('\n');
            }
        }

        // Map |this.language| to the language expected by highlightjs.
        const language = (this.currentQuestion.language === 'python3') ? 'python' : this.currentQuestion.language;

        let colorizedCode = this.parentResource.highlightCode(codeToColorize, language);

        // Add highlighting if needed.
        if (indicesToHighlight.length >= minIndicesForHighlighting) {
            const colorizedLines = colorizedCode.split('\n');

            indicesToHighlight.forEach(index => {
                colorizedLines[index] = this.templates.highlightedLine({ code: colorizedLines[index] });
            });

            colorizedCode = colorizedLines.join('\n');
        }

        return colorizedCode;
    }

    /**
        Display an equation given the |currentQuestionIndex|.
        @method makeLevel
        @param {Integer} currentQuestionIndex The index of the level of the question to build.
        @param {Boolean} [shouldSetConsole=false] If true, set the console with the expected output.
        @return {void}
    */
    makeLevel(currentQuestionIndex, shouldSetConsole = false) {

        // Enable input.
        this.lookupClass('console').attr('disabled', false);

        // If this is the same level and the previous attempt only had whitespace differences, then allow a retry.
        const shouldRetryQuestion = this.previousQuestionNearlyCorrect && (this.previousQuestionIndex === currentQuestionIndex);

        this.previousQuestionNearlyCorrect = false;

        if (!shouldRetryQuestion) {

            // Stop server requests by the previous question.
            if (this.currentQuestion) {
                this.currentQuestion.stopServerRequest();
            }

            this.currentQuestion = this.questionCache.makeQuestion(currentQuestionIndex);
            this.currentQuestion.setExpectedAnswer(this.parentResource);

            let whatToType = 'program\'s output';

            if (this.currentQuestion.useOutputFile) {
                whatToType = `contents of ${this.currentQuestion.outputFilename}`;
            }

            $(`#${this.id} p#prompt`).text(`Type the ${whatToType}`);

            this.currentQuestion.files.forEach(file => {
                if (this.isCodeZyFlowchart) {
                    file.programToShow = require('utilities').escapeHTML(file.program);
                }
                else {
                    file.programToShow = this.makeColorizedAndHighlightedCode(file.program, currentQuestionIndex);
                }
            });

            const parameters = this.questionFactory.levels[currentQuestionIndex].parameters;
            const permutations = typeof parameters === 'string' ? 'unknown' : require('utilities').getNumberOfPermutations(parameters);

            if (this.parentResource.setPermutationsShownAndTotal) {
                this.parentResource.setPermutationsShownAndTotal({
                    shown: this.questionFactory.shownLevels[currentQuestionIndex].size,
                    total: permutations,
                });
            }

            if (this.isCodeZyFlowchart) {
                this.displayZyFlowchartCurrentQuestion();
            }
            else {
                this.displayTextualCodeCurrentQuestion();

                const $inputDiv = this.lookupClass('input-div');
                const $ioLabel = this.lookupClass('IO-label');
                const $inputContainer = this.lookupClass('input-container');

                if (this.currentQuestion.hasInput) {
                    $inputContainer.show();
                    $ioLabel.show();
                    $inputDiv.text(this.currentQuestion.input);

                    // Set a maximum width for the input box based on the width of the code.
                    const codeWidth = this.lookupClass('code').width();
                    const maxToolWidth = 960;
                    const margin = 50;
                    const maxWidth = maxToolWidth - codeWidth - margin;

                    $inputDiv.css('maxWidth', maxWidth);
                }
                else {
                    $inputContainer.hide();
                    $ioLabel.hide();
                }
            }

            this.updateConsoleText('');
            this.parentResource.setSolution(' ');
        }

        // Set the console with |expectedAnswer| once computed, if |shouldSetConsole| is true.
        if (shouldSetConsole) {
            this.currentQuestion.serverRequestPromise.then(() => {
                this.updateConsoleText(this.currentQuestion.expectedAnswer);
            });
        }

        // Set the solution, if supported.
        if (this.parentResource.setSolution) {
            this.currentQuestion.serverRequestPromise.then(() => {
                this.parentResource.setSolution(this.currentQuestion.expectedAnswer);
            });
        }
    }

    /**
        Make a zyFlowchart level from the already generated |this.currentQuestion|.
        @method displayZyFlowchartCurrentQuestion
        @return {void}
    */
    displayZyFlowchartCurrentQuestion() {
        let executor = null;
        const zyFlowchartSDK = require('zyFlowchartSDK').create();

        try {
            executor = zyFlowchartSDK.makeExecutor(this.currentQuestion.code, this.currentQuestion.input || null, true);
        }
        catch (error) {
            return;
        }

        const $programContainer = this.lookupClass('program-container');
        const maxHeight = 550;
        const maxWidth = 900;

        this.executorController = zyFlowchartSDK.makeExecutorController(executor, $programContainer);
        this.executorController.setIsCompact(true, maxHeight, maxWidth);
        this.executorController.setIsOutputEditable(true, () => this.adjustConsoleSize());
        this.executorController.setIsInputEditable(false);
        this.executorController.setLanguagesToShow(this.zyFlowchartRenderType);
        this.executorController.setIsSegmentedLanguageControlEnabled(false);
        this.executorController.render();
        $(`#${this.id} .function-container`).css('pointer-events', 'auto');
    }

    /**
        Make a textual-code level from the already generated |this.currentQuestion|.
        @method displayTextualCodeCurrentQuestion
        @return {void}
    */
    displayTextualCodeCurrentQuestion() {
        const segmentedControllerID = this.getSegmentedControllerContainerID();
        const $segmentedControllerContainer = $(`#${segmentedControllerID}`);

        if (this.currentQuestion.files.length > 1) {
            $segmentedControllerContainer.show();
        }
        else {
            $segmentedControllerContainer.hide();
        }

        const $codeDiv = this.lookupClass('code');
        const fileNames = this.currentQuestion.files.map(file => file.filename);

        $codeDiv.width('auto');
        this.segmentedControl = require('segmentedControl').create();
        this.segmentedControl.init(fileNames, segmentedControllerID, (index, title) => {
            const foundFile = this.currentQuestion.files.find(file => file.filename === title);

            $codeDiv.html(foundFile.programToShow);
        });
        $segmentedControllerContainer.click(() => this.lookupClass('console').focus());

        // Get the widest code and set it to be the width of |$codeDiv|
        const codeWidths = fileNames.map(segmentTitle => {
            this.segmentedControl.selectSegmentByTitle(segmentTitle);
            return $codeDiv.width();
        });
        const maxCodeWidth = Math.max(...codeWidths);

        $codeDiv.width(maxCodeWidth);
        this.segmentedControl.selectSegmentByTitle(this.currentQuestion.files.find(file => file.main).filename);
    }

    /**
        Return the ID of the segmented controller's container.
        @method getSegmentedControllerContainerID
        @return {String} The ID of the segmented controller's container.
    */
    getSegmentedControllerContainerID() {
        return `segmented-control-container${this.id}`;
    }

    /**
        Return a jQuery reference to the given class name.
        @method lookupClass
        @param {String} className The name of the class to lookup.
        @return {Object} A jQuery reference to the given class name.
    */
    lookupClass(className) {
        return $(`#${this.id}`).find(`.${className}`);
    }

    /**
        Reset hook for zyWeb to tell tool to reset itself.
        @method reset
        @return {void}
    */
    reset() {
        this.progressionTool.reset();
    }
}

module.exports = {
    create: function() {
        return new CodeOutput();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {

        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};
