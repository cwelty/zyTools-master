/* global addEditableWhitespace, CodeAreaController, Ember, LevelTemplate, LevelFactory, ace */
'use strict';

/**
    Progression that generates coding problems where the users have to write part of a program.
    @module CodingProgression
    @return {void}
*/
class CodingProgression {

    /**
        Builds an instance of the CodingProgression tool.
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The unique identifier given to this module.
            @property id
            @type {Number}
            @default null
        */
        this.id = null;

        /**
            The name of the tool.
            @property name
            @type {String}
        */
        this.name = '<%= grunt.option("tool") %>';

        /**
            The handlebars template functions.
            @property templates
            @type {Object}
        */
        this.templates = this[this.name];

        /**
            Reference to the parent resource object.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            Reference to the utility module.
            @property utilities
            @type {Utilities}
        */
        this.utilities = require('utilities');

        /**
            Reference to the progressionTool instance.
            @property progressionTool
            @type {ProgressionTool}
        */
        this.progressionTool = require('progressionTool').create();

        /**
            Reference to the segmentedControl module.
            @property segmentedControl
            @type {segmentedControl}
            @default null
        */
        this.segmentedControl = null;

        /**
            The programming language.
            @property language
            @type {String}
            @default null
        */
        this.language = null;

        /**
            The level factory to build levels from templates.
            @property levelFactory
            @type {LevelFactory}
            @default null
        */
        this.levelFactory = null;

        /**
            The question cache to avoid generating same question too often.
            @property questionCache
            @type {utilities.QuestionCache}
            @default null
        */
        this.questionCache = null;

        /**
            The current level being shown to the user.
            @property currentLevel
            @type {Level}
            @default null
        */
        this.currentLevel = null;

        /**
            An array of CodeAreaController one for each file in the level.
            @property codeAreaControllers
            @type {Array}
            @default []
        */
        this.codeAreaControllers = [];

        /**
            Whether to provide a textarea or ace editor for user to write code.
            @property useTextarea
            @type {Boolean}
            @default false
        */
        this.useTextarea = false;

        /**
            Whether the solution is being shown.
            @property isSolutionShown
            @type {Boolean}
            @default false
        */
        this.isSolutionShown = false;
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
        this.useTextarea = (parentResource.needsAccessibleAndInteractive && parentResource.needsAccessibleAndInteractive()) ||
                           parentResource.needsAccessible();
        this.utilities.addIfConditionalHandlebars();
        this.language = options.language;

        const levelTemplates = options.levels.map(level => {
            const program = level.program || {};
            const input = level.input || [ '' ];

            return new LevelTemplate({
                language: this.language,
                prompt: level.prompt,
                explanation: level.explanation,
                solution: level.solution,
                parameters: level.parameters,
                program,
                input,
                outputFilenames: level.outputFilenames,
            });
        });

        this.levelFactory = new LevelFactory(levelTemplates, this.useTextarea);

        // Future selves, this is just the number that felt right. Could be changed if needed :-)
        const maxQuestionsToCache = 10;

        this.questionCache = this.utilities.getQuestionCache(this.levelFactory, maxQuestionsToCache);

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this.templates.codingProgression();

        $(`#${id}`).html(css + html);

        let hasClickedCheck = false;

        this.progressionTool.init(id, parentResource, {
            html,
            css,
            numToWin: levelTemplates.length,
            useMultipleParts: true,
            showSolution: options.showSolution,
            start: () => {
                this.enable();
            },
            reset: () => {
                this.disable();
                this.makeLevel(0);
            },
            next: nextLevelNumber => {
                const createNewLevel = (nextLevelNumber !== this.currentLevelNumber) || !hasClickedCheck || this.isSolutionShown;

                $(`#${id} .error-output`).html('').hide();
                this.currentLevel.stopServerRequests();
                this.makeLevel(nextLevelNumber, createNewLevel);
                this.isSolutionShown = false;
                this.enable();
                hasClickedCheck = false;
            },
            isCorrect: () => {
                hasClickedCheck = true;

                // Save cursor position.
                const selectedSegmentIndex = this.segmentedControl ? this.segmentedControl.getSelectedSegmentIndex() : 0;

                this.disable();
                this.codeAreaControllers[selectedSegmentIndex].saveCursorPosition();

                // Check that the user provided some new code.
                const editableCodeAreaController = this.codeAreaControllers[this.currentLevel.editableFileIndex];
                const userEnteredCode = editableCodeAreaController.getUserCode();
                const placeholder = this.currentLevel.editableFile.student;

                // Check that the user provided some code.
                if (userEnteredCode.trim() === '' || userEnteredCode.trim() === placeholder) {
                    return {
                        explanationMessage: 'No code was provided',
                        isCorrect: false,
                        showTryAgain: true,
                    };
                }

                const testResultsPromise = this.currentLevel.runCodeGetResults(userEnteredCode);

                return new Ember.RSVP.Promise((resolve, reject) => {
                    testResultsPromise.then(testResults => {
                        const compilerMessage = testResults.compileError || testResults.compileWarning || '';
                        const hasCompilerError = compilerMessage !== '';

                        const testResultsPerInput = testResults.tests;
                        const testResultsArray = testResultsPerInput.map(resultsObject =>
                                                                        Object.values(resultsObject)
                                                                    ).flat();
                        const isLevelCorrect = !hasCompilerError && testResultsArray.every(testResult => testResult.isCorrect);
                        const diffPromises = testResultsArray.map(result => result.buildOutputDifference(parentResource));
                        let showErrorMessageHintAboutLineNumbers = false;

                        if (compilerMessage) {
                            showErrorMessageHintAboutLineNumbers = parentResource.showErrorMessageHintAboutLineNumbers &&
                                parentResource.showErrorMessageHintAboutLineNumbers(compilerMessage, editableCodeAreaController.getCode(),
                                                                                    userEnteredCode, this.language);
                        }

                        Ember.RSVP.all(diffPromises).then(() => {
                            const testsHTML = this.templates.tests({
                                explanation: this.currentLevel.explanation || '',
                                showErrorMessageHintAboutLineNumbers,
                                hasCompilerError,
                                compilerMessage,
                                tests: testResultsPerInput,
                                checkmarkImageURL: this.utilities.getCheckmarkImageURL(parentResource),
                            });

                            resolve({
                                explanationMessage: testsHTML,
                                userAnswer: userEnteredCode,
                                isCorrect: isLevelCorrect,
                                showTryAgain: !isLevelCorrect,
                                callbackFunction: () => {
                                    const $legendButton = $(`#${id} .special-character-legend`);

                                    if (parentResource.showSpecialCharacterLegendModal) {
                                        $legendButton.click(() => parentResource.showSpecialCharacterLegendModal());
                                    }
                                    else {
                                        $legendButton.hide();
                                    }

                                    $(`#${id} .expand-button`).parent().click(element => {
                                        const $clickedElement = $(element.target);
                                        const $parent = $clickedElement.hasClass('test-header') ? $clickedElement :
                                                                                                  $clickedElement.parent();
                                        const $elementsToHide = $parent.siblings();
                                        const $arrowElement = $parent.find('i');
                                        const arrowUp = 'keyboard_arrow_up';
                                        const arrowDown = 'keyboard_arrow_down';

                                        if ($arrowElement.text() === arrowUp) {
                                            $arrowElement.text(arrowDown);
                                            $elementsToHide.hide();
                                        }
                                        else {
                                            $arrowElement.text(arrowUp);
                                            $elementsToHide.show();
                                        }
                                    });
                                },
                            });
                        });
                    },
                    errorMessage => {
                        reject(errorMessage);
                    });
                });
            },
        });

        this.makeLevel(0);
    }

    /**
        Show the file editor by index.
        @method showFileEditorByIndex
        @param {Integer} index The index of the file editor to show.
        @return {void}
    */
    showFileEditorByIndex(index) {

        // Hide all editors.
        this.codeAreaControllers.forEach(controller => {
            controller.hide();
        });

        // Show editor of given index to show.
        this.codeAreaControllers[index].show();

        // Re-render and focus the shown editor.
        this.codeAreaControllers[index].reRender();
        this.codeAreaControllers[index].focus();
    }

    /**
        Enable the editable code controller.
        @method enable
        @return {void}
    */
    enable() {
        this.codeAreaControllers.filter((controller, index) => index === this.currentLevel.editableFileIndex)
                                .forEach(controller => controller.enable());
    }

    /**
        Disable all code controllers.
        @method disable
        @return {void}
    */
    disable() {
        this.codeAreaControllers.forEach(controller => controller.disable());
    }

    /**
        Make a new level number |newLevelNumber|.
        @method makeLevel
        @param {Integer} newLevelNumber The number of the level to make.
        @param {Boolean} [isNewLevel=true] Whether to make a new level or use the previous one.
        @param {Boolean} [accessible=false] Whether to make the accessible version.
        @return {void}
    */
    makeLevel(newLevelNumber, isNewLevel = true, accessible = false) {
        this.currentLevelNumber = newLevelNumber;

        if (isNewLevel) {
            this.currentLevel = this.questionCache.makeQuestion(newLevelNumber);
            this.currentLevel.setParentResource(this.parentResource);
            const parameters = this.levelFactory.levelTemplates[newLevelNumber].parameters;
            const permutations = typeof parameters === 'string' ? 'unknown' : this.utilities.getNumberOfPermutations(parameters);

            this.parentResource.setPermutationsShownAndTotal({
                shown: this.levelFactory.shownLevels[newLevelNumber].size,
                total: permutations,
            });
            this.parentResource.setSolution(this.currentLevel.solutionCode, this.language);
            this.progressionTool.setSolutionCallback($solutionContainer => {
                this.disable();
                this.isSolutionShown = true;

                const id = `solution-${this.id}`;

                $solutionContainer.html(
                    this.templates.solution({ useTextarea: this.useTextarea, id })
                );

                const $solution = $(`#${id}`);

                if (this.useTextarea) {
                    $solution.val(this.currentLevel.solutionCode);
                }
                else {
                    const editor = ace.edit(id);

                    require('utilities').aceBaseSettings(editor, this.language);

                    editor.setOptions({
                        minLines: 1,
                        maxLines: 100,
                    });

                    editor.setValue(this.currentLevel.solutionCode, 1);
                    editor.renderer.setShowGutter(false);
                    editor.setReadOnly(true);

                    editor.resize(true);
                    $solution.hide().show();
                }
            });

            if (!accessible) {
                const filesToShow = this.currentLevel.files.filter(file => file.shouldShowContents);
                const numberOfFilesToShow = filesToShow.length;
                const html = this.templates.level({ id: this.id, numberOfFiles: numberOfFilesToShow, useTextarea: this.useTextarea });

                $(`#${this.id} .level-container`).html(html);

                // Update the instructions and initial program.
                $(`#${this.id} .instructions-div`).html(this.currentLevel.prompt);

                if (numberOfFilesToShow > 1) {
                    const segmentedControlContainerId = `segmented-control-container${this.id}`;
                    const fileNames = filesToShow.map(file => file.filename);

                    this.segmentedControl = require('segmentedControl').create();
                    this.segmentedControl.init(fileNames, segmentedControlContainerId, index => {
                        this.showFileEditorByIndex(index);
                    });
                }
                else {
                    this.segmentedControl = null;
                }

                const editableFileIndex = this.currentLevel.editableFileIndex;
                const editableFile = this.currentLevel.editableFile;
                const updatedCode = addEditableWhitespace(editableFile.prefix, editableFile.postfix, editableFile.student);
                const prefix = updatedCode.prefix;
                const postfix = updatedCode.postfix;
                const placeholder = isNewLevel ? updatedCode.placeholder : this.codeAreaControllers[editableFileIndex].getUserCode();
                const program = prefix + placeholder + postfix;

                // Build file editor controllers for the shown files.
                this.codeAreaControllers = filesToShow.map((file, index) => {
                    const controller = new CodeAreaController(`editor-${index}-${this.id}`, this.language, this.useTextarea);

                    // If it's the editable file, we set the code by parts and restrict the editor.
                    if (index === editableFileIndex) {
                        controller.setCode(program);
                        controller.restrictEditor(prefix, postfix, placeholder);
                    }
                    else {
                        controller.setCode(file.code);
                    }
                    return controller;
                });

                this.codeAreaControllers.forEach(controller => {
                    if (!this.useTextarea) {
                        this.utilities.submitOnCtrlReturn(controller.editor, () => {
                            this.progressionTool.check();
                        });
                    }
                });

                this.showFileEditorByIndex(editableFileIndex);

                if (numberOfFilesToShow > 1) {
                    this.segmentedControl.selectSegmentByIndex(editableFileIndex);
                }
            }
        }
        this.parentResource.latexChanged();
    }
}

module.exports = {
    create: function() {
        return new CodingProgression();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
    supportsAccessibleCompletion: true,
};
