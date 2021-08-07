/* global LevelTemplate, LevelFactory, CodeAreaController, Ember, addEditableWhitespace, */
/* exported ProgrammingProgression */
'use strict';

/**
    Progression that generates programming problems where the students have to write part of a program.
    @module ProgrammingProgression
    @return {void}
*/
class ProgrammingProgression {

    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();
        this.segmentedControl = require('segmentedControl').create();
        this.checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);

        this.language = options.language;

        // |levelTemplates| stores a list of {LevelTemplates}.
        this.levelTemplates = options.levels.map(level =>
            new LevelTemplate(this.language, level.prompt, level.explanation, level.solution.code,
                              level.parameters, level.files, level.test, level.levelType)
        );
        this.levelFactory = new LevelFactory(this.levelTemplates);

        // Future selves, this is just an estimate, could be changed if needed :-)
        const maxQuestionsToCache = 10;

        this.questionCache = this.utilities.getQuestionCache(this.levelFactory, maxQuestionsToCache);     // eslint-disable-line no-magic-numbers

        // |currentLevel| stores the current level.
        this.currentLevel = null;

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name].ProgrammingProgression({ id });        // eslint-disable-line new-cap
        const $thisTool = $(`#${this.id}`);

        $thisTool.html(css + html);

        // Generate the sample program.
        const codePlaceholder = 'Your solution goes here';
        const languageCommentMap = {
            cpp: `/* ${codePlaceholder} */`,
            c: `/* ${codePlaceholder} */`,      // eslint-disable-line id-length
            java: `/* ${codePlaceholder} */`,
            python: `''' ${codePlaceholder} '''`,
            python3: `''' ${codePlaceholder} '''`,
        };

        this.placeholder = languageCommentMap[this.language];
        this.didUserAnswer = false;

        // Initialize the progressionTool
        this.progressionTool.init(this.id, this.parentResource, {
            html,
            css,
            numToWin: this.levelTemplates.length,
            useMultipleParts: true,
            start: () => {
                this.codeAreaController.saveCursorPosition();
                this.codeAreaController.enable();
            },
            reset: () => {
                this.codeAreaController.disable();
                this.displayNewLevel(0, true);
            },
            next: currentLevelNumber => {
                const createNewLevel = (currentLevelNumber !== this.currentLevelNumber) || !this.didUserAnswer;

                this.displayNewLevel(currentLevelNumber, createNewLevel);
                if (createNewLevel) {
                    this.codeAreaController.saveCursorPosition();
                }
                this.didUserAnswer = false;
                this.$errorDiv.html('');
                this.$errorDiv.hide();
                this.codeAreaController.enable();
            },
            isCorrect: () => {
                this.didUserAnswer = true;
                this.codeAreaController.disable();
                this.codeAreaController.saveCursorPosition();

                const userEnteredCode = this.codeAreaController.getStudentCode();

                // Check that the user provided some code.
                if (userEnteredCode.trim() === '' || userEnteredCode.trim() === this.placeholder.trim()) {
                    return {
                        explanationMessage: 'No code was provided',
                        isCorrect: false,
                        showTryAgain: true,
                    };
                }

                this.currentLevel.runLevel(userEnteredCode, this.parentResource);

                return new Ember.RSVP.Promise((resolve, reject) => {
                    this.currentLevel.serverRequestPromise.then(programResult => {
                        const expectedAnswer = options.levels[this.currentLevelNumber].solution.code;

                        // Program resulted in error
                        if (programResult[0].error) {
                            const errorInfo = programResult[0];
                            let explanationMessage = '';
                            let showErrorMessageHintAboutLineNumbers = false;

                            const integrated = errorInfo.isUserEnteredCode ? '' : ', integrated with our tests,';
                            let errorOutput = errorInfo.result;

                            if (errorOutput === 'Program timed out') {
                                errorOutput = 'Program end never reached (commonly due to an infinite loop, ' +
                                              'infinite recursion, or divide/mod by 0).';
                            }
                            const testsHTML = this[this.name].tests({ error: true,
                                                                      errorOutput });

                            explanationMessage = `Your code${integrated} raised an error at ${programResult[0].when} time:`;
                            explanationMessage += `${this.utilities.getNewline()}${testsHTML}`;

                            showErrorMessageHintAboutLineNumbers = parentResource.showErrorMessageHintAboutLineNumbers &&
                                                                   parentResource.showErrorMessageHintAboutLineNumbers(
                                errorInfo.result, this.codeAreaController.getCode(), userEnteredCode, this.language
                            );

                            if (showErrorMessageHintAboutLineNumbers) {
                                explanationMessage += this.utilities.getNewline();
                                explanationMessage += 'Note: Although the reported line number is in the uneditable part of the code, the error actually exists in your code. Tools often don\'t recognize the problem until reaching a later line.'; // eslint-disable-line max-len
                            }

                            resolve({
                                explanationMessage,
                                userAnswer: userEnteredCode,
                                expectedAnswer,
                                isCorrect: false,
                                showTryAgain: true,
                            });
                        }
                        else {
                            const testResults = programResult.map(
                                result => require('utilities').getTestResult(
                                    result.userOutput, result.expectedOutput, result.passed,
                                    {
                                        isEmptyExpectedOutput: !result.expectedOutput || (result.expectedOutput === '(none)'),
                                        isEmptyUserOutput: !result.userOutput || (result.userOutput === '(none)'),
                                        whatWasTested: result.whatWasTested,
                                    }
                                )
                            );
                            const isCorrect = programResult.every(test => test.passed);
                            const explanation = this.currentLevel.explanation || '';
                            const promises = testResults.map(result => result.buildOutputDifference(parentResource));

                            Ember.RSVP.all(promises).then(() => {
                                const testsHTML = this[this.name].tests({ explanation,
                                                                          tests: testResults,
                                                                          checkmarkImageURL: this.checkmarkImageURL });

                                resolve({
                                    explanationMessage: `${testsHTML}${this.utilities.getNewline()}`,
                                    userAnswer: userEnteredCode,
                                    expectedAnswer,
                                    isCorrect,
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
                        }
                    },
                    errorMessage => {
                        reject(errorMessage);
                    });
                });
            },
            accessibleViewForLevel: levelIndex => {
                this.displayNewLevel(levelIndex, true, true);

                const accessibleHTML = this[this.name].ProgrammingProgressionAccessible({ level: this.currentLevel });  // eslint-disable-line new-cap

                return accessibleHTML;
            },
        });

        this.codeAreaController = new CodeAreaController(`editor-container${this.id}`, this.language);

        this.$errorDiv = $(`#${this.id} .error-output`);
        this.$segmentedControlContainer = $(`#segmented-control-container${this.id}`);
        this.$codeDiv = $(`#${this.id} div.code`);
        this.displayNewLevel(0, true);
    }

    /**
        Display a new level given the |currentLevelNumber|.
        @method displayNewLevel
        @param {Integer} currentLevelNumber The number of the level to show.
        @param {Boolean} [newLevel=true] Whether to build a new level or use the previous one.
        @param {Boolean} [accessible=false] Whether this is the accessible version of the tool or not.
        @return {void}
    */
    displayNewLevel(currentLevelNumber, newLevel = true, accessible = false) {

        // Stop server requests by the previous question.
        if (this.currentLevel) {
            this.currentLevel.stopServerRequest();
        }

        this.currentLevelNumber = currentLevelNumber;
        if (newLevel) {
            this.currentLevel = this.questionCache.makeQuestion(currentLevelNumber);
            const parameters = this.levelFactory.levelTemplates[currentLevelNumber].parameters;
            const permutations = this.utilities.getNumberOfPermutations(parameters);

            if (this.parentResource.setPermutationsShownAndTotal) {
                this.parentResource.setPermutationsShownAndTotal({
                    shown: this.levelFactory.shownLevels[currentLevelNumber].size,
                    total: permutations,
                });
            }
        }

        if (this.parentResource.setSolution) {

            /* When testing functions, we need to have a different function name for the solution and for the student.
               In those cases, the solution function name ends in ZySolution, but we don't want that postfix in the
               solution shown to instructors. */
            const solution = this.currentLevel.solutionCode.replace('ZySolution', '');

            this.parentResource.setSolution(solution, this.language);
        }

        if (!accessible) {
            if (this.currentLevel.files.length > 1) {
                const fileNames = this.currentLevel.files.map(file => file.filename);

                this.$segmentedControlContainer.show();
                this.segmentedControl.init(fileNames, `segmented-control-container${this.id}`, (index, title) => {
                    this.$codeDiv.html(this.currentLevel.files.find(file => file.filename === title).program);
                });
            }
            else {
                this.$segmentedControlContainer.hide();
            }

            // Update the instructions and initial program.
            $(`#${this.id} .instructions-div`).html(this.currentLevel.prompt);

            const mainFile = this.currentLevel.files[0];

            // Add a bit of whitespace around the editable region if possible.
            const noWhitespacePlaceholder = mainFile.prefixPostfixPlaceholder.placeholder.trim();
            let prefix = mainFile.prefixPostfixPlaceholder.prefix;
            let postfix = mainFile.prefixPostfixPlaceholder.postfix;
            let placeholder = this.placeholder;

            if ((noWhitespacePlaceholder !== '') && (noWhitespacePlaceholder !== '<STUDENT_CODE>')) {
                placeholder = mainFile.prefixPostfixPlaceholder.placeholder;
            }
            const updatedCode = addEditableWhitespace(prefix, postfix, placeholder);

            prefix = updatedCode.prefix;
            postfix = updatedCode.postfix;
            placeholder = newLevel ? updatedCode.placeholder : this.codeAreaController.getStudentCode();
            const program = prefix + placeholder + postfix;

            this.codeAreaController.setCode(program);
            this.codeAreaController.restrictEditor(prefix, postfix, placeholder);
        }
    }
}

const programmingProgressionExport = {
    create: function() {
        return new ProgrammingProgression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};

module.exports = programmingProgressionExport;
