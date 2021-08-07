/* exported LevelsContentController */
/* global CodeEditorController */
'use strict';

/**
    Controls the levels content elements: Code (including multiple files' code), parameters, explanation and input.
    @class LevelsContentController
*/
class LevelsContentController {

    /**
        @constructor
        @param {Object} progressionChangingFunctions An object with functions to inform the progression builder of changes.
        @param {Object} templates An object containing a selection of templates.
        @param {Progression} progression The progression being built.
    */
    constructor(progressionChangingFunctions, templates, progression) {

        /**
            Functions to inform the progression builder of changes.
            @property _progressionChangingFunctions
            @type {Object}
        */
        this._progressionChangingFunctions = progressionChangingFunctions;

        /**
            The progression being built.
            @property _progression
            @type {Progression}
        */
        this._progression = progression;

        /**
            A reference to the levels content container.
            @property $levelsContainer
            @type {jQuery}
        */
        this.$levelsContainer = progressionChangingFunctions.getElement('.levels-content-container');

        /**
            A selection of the Handlebar templates for this tool.
            @property templates
            @type {Function}
        */
        this.templates = templates;

        /**
            Array of Arrays of CodeEditorControllers. Each level has an array of CodeEditorControllers. One for each file.
            @property codeEditorsPerLevel
            @type {Array}
            @default []
        */
        this.codeEditorsPerLevel = [];

        /**
            Array of Arrays of CodeEditorControllers. Each level has 2 parameter editors. One (the first) for Python randomization.
            The other for JSON randomization.
            @property parameterEditors
            @type {Array}
            @default []
        */
        this.parameterEditors = [];

        /**
            Stores the next ID to use for the next code editor.
            @property nextEditorId
            @type {Number}
            @default 0
        */
        this.nextEditorId = 0;

        /**
            A reference to the segmentedControl module, to create new instances.
            @property segmentedControlModule
            @type {SegmentedControl}
        */
        this.segmentedControlModule = require('segmentedControl');

        /**
            Array of SegmentedControl for each level. The order of the elements corresponds to the order of the levels.
            @property segmentedControls
            @type {Array}
            @default []
        */
        this.segmentedControls = [];
    }

    /**
        Gets the level's container for the passed level index.
        @private
        @method _getLevelContainer
        @param {Number} levelIndex The index of the level whose container we want to return.
        @return {jQuery}
    */
    _getLevelContainer(levelIndex) {
        return this.$levelsContainer.find('.level-content-container').eq(levelIndex);
    }

    /**
        Gets the file's container for the passed level and file indices.
        @private
        @method _getFileContainer
        @param {Number} levelIndex The index of the level in which the file exists.
        @param {Number} fileIndex The index of the file whose container is to be returned.
        @return {jQuery}
    */
    _getFileContainer(levelIndex, fileIndex) {
        return this._getLevelContainer(levelIndex).find('.code-editor').eq(fileIndex);
    }

    /**
        Returns the selected parameter editor for a level.
        @private
        @method _getParametersEditor
        @param {Number} levelIndex The index of the level.
        @param {Boolean} editorIndex The index of the parameters editor (0 for python, 1 for JSON).
        @return {CodeEditorController}
    */
    _getParametersEditor(levelIndex, editorIndex) {
        return this.parameterEditors[levelIndex][editorIndex];
    }

    /**
        Returns whether the randomization is in Python.
        @private
        @method _getIsPythonRandomization
        @param {Number} levelIndex The index of the level.
        @return {Boolean}
    */
    _getIsPythonRandomization(levelIndex) {
        return this.segmentedControls[levelIndex].getSelectedSegmentIndex() === 0;
    }

    /**
        Shows the indicated level. Hides the rest.
        @private
        @method _selectLevel
        @param {Number} levelIndex The index of the level to show.
        @return {void}
    */
    _selectLevel(levelIndex) {
        const $allLevelsContentContainer = this.$levelsContainer.find('.level-content-container');
        const $selectedLevelContentContainer = this._getLevelContainer(levelIndex);
        const editorIndex = this.segmentedControls[levelIndex].getSelectedSegmentIndex();

        $allLevelsContentContainer.hide();
        $selectedLevelContentContainer.show();
        this._getParametersEditor(levelIndex, editorIndex).reRender();
    }

    /**
        Creates a code editor and appends the editor to |$container|. Returns the new {CodeEditorController} object.
        @private
        @method _createCodeEditor
        @param {jQuery} $container The DOM element that will contain the new editor.
        @param {String} language The programming language of the editor for syntax highlighting.
        @param {String} type The type of code editor, it's either 'code' or 'parameter'.
        @return {CodeEditorController}
    */
    _createCodeEditor($container, language, type) {
        const editorId = `${this._progressionChangingFunctions.getId()}-editor-${this.nextEditorId}`;
        const editorDiv = `<div id='${editorId}' class='${type}-editor editor-container container'></div>`;

        this.nextEditorId++;
        $container.append(editorDiv);
        const isParametersEditor = type === 'parameter';
        const codeEditorController = new CodeEditorController(editorId, language, isParametersEditor);

        codeEditorController.editor.on('blur', () => {
            this._progressionChangingFunctions.takeSnapshot();
        });

        return codeEditorController;
    }

    /**
        Sets the coding language to all code editors for syntax highlight.
        @method setCodeLanguage
        @param {String} language The programming language to set.
        @return {void}
    */
    setCodeLanguage(language) {
        this.codeEditorsPerLevel.forEach(levelEditors => {
            levelEditors.forEach(codeEditor => {
                const flowchartLanguages = [ 'zyPseudocode', 'zyFlowchartZyPseudocode', 'zyFlowchart' ];

                if (flowchartLanguages.includes(language)) {
                    codeEditor.setSettings('coral');
                }
                else {
                    codeEditor.setSettings(language);
                }
            });
        });
    }

    /**
        Adds the elements of a new level.
        @method addLevel
        @return {void}
    */
    addLevel() {
        const aBillion = 1000000000;
        const segmentedControlId = `segmented-control-${require('utilities').pickNumberInRange(0, aBillion)}`;
        const $levelContainer = $(this.templates.levelContent({ segmentedControlId }));

        this.$levelsContainer.append($levelContainer);

        // Create two parameter editors: One for Python, another for JSON.
        const $parametersContainer = $levelContainer.find('.parameter-editors-container');
        const pythonParameterEditor = this._createCodeEditor($parametersContainer, 'python', 'parameter');
        const jsonParameterEditor = this._createCodeEditor($parametersContainer, 'js', 'parameter');
        const levelParameterEditors = [ pythonParameterEditor, jsonParameterEditor ];

        // By default Python is selected, so hide JSON.
        jsonParameterEditor.hide();
        this.parameterEditors.push(levelParameterEditors);

        // Create the segmented control.
        const segmentedControl = this.segmentedControlModule.create();

        segmentedControl.init([ 'Python', 'JSON' ], segmentedControlId, (segmentIndex, segmentTitle, hadInteraction) => {
            levelParameterEditors.forEach(editor => editor.hide());
            levelParameterEditors[segmentIndex].reRender();

            // Don't take a snapshot if the callback is called when undoing or redoing (we would lose the previous/next states).
            if (hadInteraction) {
                this._progressionChangingFunctions.takeSnapshot();
            }
        });
        this.segmentedControls.push(segmentedControl);

        this.codeEditorsPerLevel.push([]);

        // Take snapshots when the input or explanation textareas are blurred.
        $levelContainer.find('textarea.explanation, textarea.input').off().blur(() => {
            this._progressionChangingFunctions.takeSnapshot();
        });

        // Clicking the information button shows a modal with instructions.
        $levelContainer.find('.parameters-info').click(() => {
            this._progressionChangingFunctions.showModal('Parameters usage', this.templates.parametersInfoModal(),
                {
                    keepOpen: false,
                    label: 'Ok',
                    decoration: 'button-blue',
                }
            );
        });
    }

    /**
        Imports a level's data.
        @method importLevel
        @param {Number} levelIndex The index of the level to import.
        @param {Object} levelData The level's data. Files with code, explanation, parameters, input.
        @return {void}
    */
    importLevel(levelIndex, levelData) {
        levelData.filesData.forEach((data, fileIndex) => {
            this.codeEditorsPerLevel[levelIndex][fileIndex].setCode(data.program);
        });

        const parametersLanguage = levelData.isPythonRandomization ? 'Python' : 'JSON';
        const editorIndex = levelData.isPythonRandomization ? 0 : 1;
        const parametersAsString = this._progression.levels[levelIndex].getParametersString();

        this.segmentedControls[levelIndex].selectSegmentByTitle(parametersLanguage);
        this._getParametersEditor(levelIndex, editorIndex).setCode(parametersAsString);

        const $levelContainer = this._getLevelContainer(levelIndex);

        $levelContainer.find('textarea.explanation').val(levelData.explanation);
        $levelContainer.find('textarea.input').val(levelData.input);
    }

    /**
        Moves a level from one position to another.
        @method moveLevel
        @param {Number} currentLevelIndex The current index of the level.
        @param {Number} newLevelIndex The new index to set for the level.
        @return {void}
    */
    moveLevel(currentLevelIndex, newLevelIndex) {
        const segmentedControlsBeingMoved = this.segmentedControls.splice(currentLevelIndex, 1)[0];
        const codeEditorsBeingMoved = this.codeEditorsPerLevel.splice(currentLevelIndex, 1)[0];
        const parameterEditorBeingMoved = this.parameterEditors.splice(currentLevelIndex, 1)[0];

        this.segmentedControls.splice(newLevelIndex, 0, segmentedControlsBeingMoved);
        this.codeEditorsPerLevel.splice(newLevelIndex, 0, codeEditorsBeingMoved);
        this.parameterEditors.splice(newLevelIndex, 0, parameterEditorBeingMoved);

        const levelBeingMovedContainer = this._getLevelContainer(currentLevelIndex);
        const levelNewPositionContainer = this._getLevelContainer(newLevelIndex);

        if (newLevelIndex < currentLevelIndex) {
            levelBeingMovedContainer.insertBefore(levelNewPositionContainer);
        }
        else {
            levelBeingMovedContainer.insertAfter(levelNewPositionContainer);
        }
    }

    /**
        Removes the indicated level.
        @method removeLevel
        @param {Number} levelIndex The index of the level to remove.
        @return {void}
    */
    removeLevel(levelIndex) {
        this._getLevelContainer(levelIndex).remove();
        this.segmentedControls.splice(levelIndex, 1);
        this._destroyEditors(this.codeEditorsPerLevel.splice(levelIndex, 1));
        this._destroyEditors(this.parameterEditors.splice(levelIndex, 1));
    }

    /**
        Gets the data (each files' code, explanation, input, and parameters) for the level.
        @method getLevelData
        @param {Number} levelIndex The index of the level whose data we want to get.
        @return {Object}
    */
    getLevelData(levelIndex) {
        const levelCodeEditors = this.codeEditorsPerLevel[levelIndex];
        const filesData = levelCodeEditors.map((codeEditor, index) => { // eslint-disable-line arrow-body-style
            return {
                isMain: index === 0,
                program: codeEditor.getCode(),
            };
        });
        const editorIndex = this.segmentedControls[levelIndex].getSelectedSegmentIndex();
        const isPythonRandomization = editorIndex === 0;
        const parameters = this._getParametersEditor(levelIndex, editorIndex).getCode();
        const $levelContainer = this._getLevelContainer(levelIndex);
        const explanation = $levelContainer.find('textarea.explanation').val();
        const input = $levelContainer.find('textarea.input').val();

        return {
            filesData,
            parameters,
            isPythonRandomization,
            explanation,
            input,
        };
    }

    /**
        Adds a code editor for a new file in the level.
        @method addFileToLevel
        @param {Number} levelIndex The index of level to which user wants to add a file.
        @return {void}
    */
    addFileToLevel(levelIndex) {
        const $levelCodeEditorsContainer = this.$levelsContainer.find('.code-editors-container').eq(levelIndex);
        const codeEditor = this._createCodeEditor($levelCodeEditorsContainer, this._progression.language, 'code');

        this.codeEditorsPerLevel[levelIndex].push(codeEditor);
    }

    /**
        Moves a file within a level from one position to another.
        @method moveFileFromLevel
        @param {Number} levelIndex The level to which the file pertains.
        @param {Number} currentFileIndex The current index of the file.
        @param {Number} newFileIndex The new index to set for the file.
        @return {void}
    */
    moveFileFromLevel(levelIndex, currentFileIndex, newFileIndex) {
        const codeEditorBeingMoved = this.codeEditorsPerLevel[levelIndex].splice(currentFileIndex, 1)[0];

        this.codeEditorsPerLevel[levelIndex].splice(newFileIndex, 0, codeEditorBeingMoved);

        const fileBeingMovedContainer = this._getFileContainer(levelIndex, currentFileIndex);
        const fileNewPositionContainer = this._getFileContainer(levelIndex, newFileIndex);

        if (newFileIndex < currentFileIndex) {
            fileBeingMovedContainer.insertBefore(fileNewPositionContainer);
        }
        else {
            fileBeingMovedContainer.insertAfter(fileNewPositionContainer);
        }
    }

    /**
        Shows a particular file from a particular level. Hides the rest.
        @method selectFileFromLevel
        @param {Number} levelIndex The index of the level to show.
        @param {Number} fileIndex The index of the file in the level to show.
        @return {void}
    */
    selectFileFromLevel(levelIndex, fileIndex) {
        this._selectLevel(levelIndex);
        const $selectedLevelContentContainer = this._getLevelContainer(levelIndex);
        const $allFilesFromLevelContainers = $selectedLevelContentContainer.find('.code-editor');
        const $selectedFileContainer = $allFilesFromLevelContainers.eq(fileIndex);

        $allFilesFromLevelContainers.hide();
        $selectedFileContainer.show();
        this.codeEditorsPerLevel[levelIndex][fileIndex].reRender();
    }

    /**
        Removes a file from a level.
        @method removeFileFromLevel
        @param {Number} levelIndex The index of the level to which this file pertains.
        @param {Number} fileIndex The index of the file to be renamed.
        @return {void}
    */
    removeFileFromLevel(levelIndex, fileIndex) {
        this._getFileContainer(levelIndex, fileIndex).remove();
        this.codeEditorsPerLevel[levelIndex].splice(fileIndex, 1);
    }

    /**
        Calls destroy on each {CodeEditorController} of the passed array.
        @method _destroyEditors
        @private
        @param {Array} editors an {Array} of {CodeEditorController}.
        @return {void}
    */
    _destroyEditors(editors) {
        editors.flat().forEach(editor => editor.destroy());
    }

    /**
        Destroys all the editors of this class to release resources.
        @method destroy
        @return {void}
    */
    destroy() {
        this._destroyEditors(this.codeEditorsPerLevel);
        this._destroyEditors(this.parameterEditors);
    }
}
