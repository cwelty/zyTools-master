/* global LevelsAndFilesController, LevelsContentController, Progression, GlobalCodeController, HistoryController */
/* exported CodeOutputBuilder */
'use strict';

/**
    Builder to create codeOutput progressions.
    @module CodeOutputBuilder
    @return {void}
*/
class CodeOutputBuilder {

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

        const name = '<%= grunt.option("tool") %>';

        /**
            Dictionary of templates for this module.
            @property templates
            @type {Object}
        */
        this.templates = this[name];

        /**
            Reference to the parent of this module.
            @property _parentResource
            @private
            @type Object
            @default null
        */
        this._parentResource = null;

        /**
            The jQuery element where the caption is entered.
            @property $captionInput
            @type {jQuery}
            @default null
        */
        this.$captionInput = null;

        /**
            The jQuery element that indicates the programming language.
            @property $languageSelector
            @type {jQuery}
            @default null
        */
        this.$languageSelector = null;

        /**
            The jQuery element that indicates the highlightNew option.
            @property $highlightNew
            @type {jQuery}
            @default null
        */
        this.$highlightNew = null;

        /**
            A class storing the progression's options.
            @property progression
            @type {Progression}
            @default new Progression
        */
        this.progression = new Progression();

        /**
            Allows navigating back and forward in the actions taken by the user (undo, redo).
            @property historyController
            @type {HistoryController}
            @default null
        */
        this.historyController = null;

        /**
            A set of functions that can be called from other controllers.
            @property builderControllerFunctions
            @type {Object}
        */
        this.builderControllerFunctions = {
            getId: () => this.id,
            getElement: selector => this.getElement(selector),
            moveLevel: (currentLevelIndex, newLevelIndex) => {
                this.moveLevel(currentLevelIndex, newLevelIndex);
            },
            addLevel: () => {
                this.addLevel();
            },
            editGlobalCode: () => {
                this.editGlobalCode();
            },
            renameFile: (levelIndex, fileIndex, newFilename) => {
                this.renameFile(levelIndex, fileIndex, newFilename);
            },
            selectFileFromLevel: (levelIndex, fileIndex) => {
                this.selectFileFromLevel(levelIndex, fileIndex);
            },
            selectLevel: levelIndex => {
                this.selectLevel(levelIndex);
            },
            removeLevel: levelIndex => {
                this.removeLevel(levelIndex);
            },
            addFileToLevel: (levelIndex, fileIndex, filename) => {
                this.addFileToLevel(levelIndex, fileIndex, filename);
            },
            removeFileFromLevel: (levelIndex, fileIndex) => {
                this.removeFileFromLevel(levelIndex, fileIndex);
            },
            moveFileFromLevel: (levelIndex, fileIndex, newFileIndex) => {
                this.moveFileFromLevel(levelIndex, fileIndex, newFileIndex);
            },
            takeSnapshot: () => {
                this.takeSnapshot();
            },
            showModal: (title, message, leftButton, rightButton) => {
                this.showModal(title, message, leftButton, rightButton);
            },
        };
    }

    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.id = id;
        this._parentResource = parentResource;

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this.templates.codeOutputBuilder({ id });

        $(`#${id}`).html(css + html);

        this.$captionInput = this.getElement('input.caption-container');
        this.$captionInput.blur(() => {
            this.takeSnapshot();
        });

        this.$languageSelector = this.getElement('select#language');
        this.$languageSelector.change(() => {
            const language = this.$languageSelector.val();

            this.progression.language = language;
            this.levelsContentController.setCodeLanguage(language);
            this.takeSnapshot();
        });

        this.$highlightNew = this.getElement('.highlight-new input');
        this.$highlightNew.change(() => {
            this.progression.highlightNew = this.$highlightNew.prop('checked');
            this.takeSnapshot();
        });

        const $importExportTextarea = this.getElement('.import-export');
        const copiedMessageContainer = this.getElement('.zb-message-container');

        copiedMessageContainer.hide();
        this.getElement('button.export').click(() => {
            if (!this.progression.caption) {
                alert('Please enter a caption first'); // eslint-disable-line no-alert
                return;
            }
            const xml = this.export();

            if (xml) {
                const threeSeconds = 3000;

                $importExportTextarea.val(xml);
                $importExportTextarea.get(0).select();
                document.execCommand('copy');
                copiedMessageContainer.fadeIn({
                    complete: () => {
                        setTimeout(() => {
                            copiedMessageContainer.fadeOut();
                        }, threeSeconds);
                    },
                });
            }
        });

        this.getElement('button.import').click(() => {
            const xml = $importExportTextarea.val();

            this.import(xml);
            this.takeSnapshot();
        });

        this.getElement('button.run').click(() => {
            this.getElement('div.builder').hide();
            this.getElement('div.player').show();

            const toolOptions = this.progression.toJSON();

            if (toolOptions) {
                require('codeOutput').create().init(`player-${id}`, this._parentResource, toolOptions);
                $('.zyante-progression-start-button').trigger('click');
            }
        });

        this.getElement('button.new').click(() => {
            if (window.confirm('Are you sure you want to begin a new progression? You will lose any unsaved changes')) { // eslint-disable-line no-alert
                this.beginNewProgression();
            }
        });

        this.getElement('button.back-to-builder').click(() => {
            this.getElement('div.player').hide();
            this.getElement('div.builder').show();
        });
        const $undo = this.getElement('.undo');
        const $redo = this.getElement('.redo');

        $undo.click(() => {
            this._undoProgression();
        });
        $redo.click(() => {
            this._redoProgression();
        });

        this.historyController = new HistoryController($undo, $redo);
        const lastSave = parentResource.getLocalStore('COBLastSave');

        this.beginNewProgression();

        if (lastSave) {
            this.import(lastSave);
            this._cacheLastSave(lastSave);
        }
    }

    /**
        Cache the given snapshot.
        @private
        @method _cacheLastSave
        @param {String} lastSave The last save.
        @return {void}
    */
    _cacheLastSave(lastSave) {
        this._parentResource.setLocalStore('COBLastSave', lastSave);
    }

    /**
        Undo the progression.
        @private
        @method _undoProgression
        @return {void}
    */
    _undoProgression() {
        const { levelIndex, fileIndex } = this.progression.getSelectedLevelAndFile();
        const previousState = this.historyController.previous();

        this.import(previousState);
        this.saveAll();
        this.selectFileFromLevel(levelIndex, fileIndex);
    }

    /**
        Redo the progression.
        @private
        @method _redoProgression
        @return {void}
    */
    _redoProgression() {
        const { levelIndex, fileIndex } = this.progression.getSelectedLevelAndFile();
        const nextState = this.historyController.next();

        this.import(nextState);
        this.saveAll();
        this.selectFileFromLevel(levelIndex, fileIndex);
    }

    /**
        Begins a new progression.
        @method beginNewProgression
        @return {void}
    */
    beginNewProgression() {
        this.releaseResources();
        this.getElement('.levels-content-container').children().remove();
        this.progression = new Progression();
        this.levelsAndFilesController = new LevelsAndFilesController(this.builderControllerFunctions, this.templates, this.progression);
        this.levelsContentController = new LevelsContentController(this.builderControllerFunctions, this.templates, this.progression);
        this.globalCodeController = new GlobalCodeController(this.id, this.progression);
        this.$captionInput.val('');
        this.$languageSelector.val('cpp');
        this.addLevel();
        this.levelsAndFilesController.render();
    }

    /**
        Record current state of progression.
        @private
        @method takeSnapshot
        @return {void}
    */
    takeSnapshot() {
        this.saveAll();
        const snapshot = this.export(false);

        this.historyController.push(snapshot);
        this._cacheLastSave(snapshot);
    }

    /**
        Saves all the levels.
        @method saveAll
        @return {Boolean} Whether saving the levels was successful.
    */
    saveAll() {
        return this.progression.levels.every((level, levelIndex) => this.saveLevel(levelIndex));
    }

    /**
        Saves the current level.
        @method saveLevel
        @param {Number} levelIndex The index of the level to save.
        @param {Boolean} shouldShowAlerts Whether to show alerts when there's an error saving the levels.
        @return {Boolean} Whether saving the level was successful.
    */
    saveLevel(levelIndex, shouldShowAlerts = true) {

        // Get the content of the files.
        const saveData = this.levelsContentController.getLevelData(levelIndex);

        saveData.isSelected = this.progression.levels[levelIndex].isSelected;

        // Set filename and is main data.
        saveData.filesData.forEach((data, fileIndex) => {
            data.filename = this.progression.levels[levelIndex].files[fileIndex].filename;
            data.isMain = fileIndex === 0;
            data.isSelected = this.progression.levels[levelIndex].files[fileIndex].isSelected;
        });

        try {
            return this.progression.saveLevel(levelIndex, saveData);
        }
        catch (error) {
            if (shouldShowAlerts) {
                alert(`Error saving the parameters:\n${error}`); // eslint-disable-line no-alert
            }
            return false;
        }
    }

    /**
        Opens a modal to begin editing the global code.
        @method editGlobalCode
        @return {void}
    */
    editGlobalCode() {
        const modalHTML = this.templates.globalCodeModal({ id: this.id });
        const leftButton = {
            label: 'Save and close',
            callback: () => {
                this.globalCodeController.saveCode();
                this.takeSnapshot();
            },
        };
        const rightButton = {
            label: 'Cancel',
        };

        this._parentResource.showModal('Global code editor', modalHTML, leftButton, rightButton);

        // Timeout of 1ms to ensure the modal is created before the {CodeEditorController}.
        setTimeout(() => {
            this.globalCodeController.beginEditing();
        }, 1);
    }

    /**
        Creates and adds a level to the list of levels of the progression, then focuses the new level.
        @method addLevel
        @param {Boolean} [shouldTakeSnapshot=true] Whether a snapshot should be taken.
        @return {Boolean} Whether adding the level was a success.
    */
    addLevel(shouldTakeSnapshot = true) {
        const newLevelIndex = this.progression.levels.length;

        this.progression.addLevel();
        this.levelsContentController.addLevel();
        const filename = this.progression.generateFilename(newLevelIndex);

        this.addFileToLevel(newLevelIndex, 0, filename, shouldTakeSnapshot);

        if (shouldTakeSnapshot) {
            this.takeSnapshot();
        }

        return true;
    }

    /**
        Moves a level from one position to another.
        @method moveLevel
        @param {Number} currentLevelIndex The current index of the level.
        @param {Number} newLevelIndex The new index to set for the level.
        @return {void}
    */
    moveLevel(currentLevelIndex, newLevelIndex) {
        this.progression.moveLevel(currentLevelIndex, newLevelIndex);
        this.levelsContentController.moveLevel(currentLevelIndex, newLevelIndex);
        this.levelsAndFilesController.render();
        this.takeSnapshot();
    }

    /**
        Selects the level with the index is passed. Saves the level being changed from, and loads the level being changed to.
        @method selectLevel
        @param {Number} levelIndex The index of the level.
        @return {void}
    */
    selectLevel(levelIndex) {
        this.selectFileFromLevel(levelIndex, 0);
    }

    /**
        Removes a level from the list of levels.
        @method removeLevel
        @param {Number} levelIndex The index of level to be removed.
        @return {void}
    */
    removeLevel(levelIndex) {
        if (this.progression.levels.length === 1) {
            alert('Cannot remove the last level. Instead create a new progression.'); // eslint-disable-line no-alert
            return;
        }

        this.levelsContentController.removeLevel(levelIndex);
        this.progression.removeLevel(levelIndex);

        const selectedLevelAndFile = this.progression.getSelectedLevelAndFile();

        if (selectedLevelAndFile.levelIndex < 0) {
            this.selectLevel(0);
        }

        this.levelsAndFilesController.render();
        this.takeSnapshot();
    }

    /**
        Adds a file to the level at index \levelIndex\.
        @method addFileToLevel
        @param {Number} levelIndex The index of the level to which this file will pertain.
        @param {Number} fileIndex The index of the new file in the level.
        @param {String} filename The name of the file.
        @param {Boolean} [shouldTakeSnapshot=true] Whether a snapshot should be taken.
        @return {void}
    */
    addFileToLevel(levelIndex, fileIndex, filename, shouldTakeSnapshot = true) {
        this.progression.addFileToLevel(levelIndex, filename);
        this.levelsContentController.addFileToLevel(levelIndex);
        this.levelsAndFilesController.render();
        this.selectFileFromLevel(levelIndex, fileIndex);
        if (shouldTakeSnapshot) {
            this.takeSnapshot();
        }

        return true;
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
        this.progression.moveFileFromLevel(levelIndex, currentFileIndex, newFileIndex);
        this.levelsContentController.moveFileFromLevel(levelIndex, currentFileIndex, newFileIndex);
        this.levelsAndFilesController.render();
        this.takeSnapshot();
    }

    /**
        Selects a file from a level.
        @method selectFileFromLevel
        @param {Number} levelIndex The index of the level.
        @param {Number} fileIndex The index of the file in the level to select.
        @return {void}
    */
    selectFileFromLevel(levelIndex, fileIndex) {

        // Sometimes a level/file is removed, so we need to ensure we don't get out of bounds.
        const newLevelIndex = Math.min(levelIndex, this.progression.levels.length - 1);
        const levelFiles = this.progression.levels[newLevelIndex].files;
        const newFileIndex = Math.min(fileIndex, levelFiles.length - 1);

        this._saveLevelIfLevelChanges(newLevelIndex);
        this.progression.selectFileFromLevel(newLevelIndex, newFileIndex);
        this.levelsContentController.selectFileFromLevel(newLevelIndex, newFileIndex);
        this.levelsAndFilesController.render();
    }

    /**
        Renames a file.
        @method renameFile
        @param {Number} levelIndex The index of the level.
        @param {Number} fileIndex The index of the file in the level to select.
        @param {String} filename The file name to set.
        @param {Boolean} [shouldTakeSnapshot=true] Whether a snapshot should be taken.
        @return {void}
    */
    renameFile(levelIndex, fileIndex, filename, shouldTakeSnapshot = true) {
        this.progression.levels[levelIndex].files[fileIndex].filename = filename;
        this.levelsAndFilesController.render();

        if (shouldTakeSnapshot) {
            this.takeSnapshot();
        }
    }

    /**
        Removes a file from a level.
        @method removeFileFromLevel
        @param {Number} levelIndex The index of the level to which this file pertains.
        @param {Number} fileIndex The index of the file to be renamed.
        @return {void}
    */
    removeFileFromLevel(levelIndex, fileIndex) {
        if (this.progression.levels[levelIndex].files.length === 1) {
            alert('Cannot remove the last file of a level.'); // eslint-disable-line no-alert
            return;
        }

        const selectedLevelAndFile = this.progression.getSelectedLevelAndFile();

        this.progression.removeFileFromLevel(levelIndex, fileIndex);
        this.levelsContentController.removeFileFromLevel(levelIndex, fileIndex);

        this.selectFileFromLevel(selectedLevelAndFile.levelIndex, selectedLevelAndFile.fileIndex);
        this.levelsAndFilesController.render();

        this.takeSnapshot();
    }

    /**
        Exports the progression and returns an XML string.
        @method export
        @param {Boolean} shouldShowAlerts Whether to show alerts when there's an error saving the levels.
        @return {String}
    */
    export(shouldShowAlerts = true) {
        let xml = '';
        const currentLevelIndex = this.progression.getSelectedLevelAndFile().levelIndex;

        if (this.saveLevel(currentLevelIndex, shouldShowAlerts)) {
            this.progression.caption = this.$captionInput.val();
            this.progression.guid = this.progression.guid || require('utilities').generateGUID();
            xml = this.progression.toXML();
        }

        return xml;
    }

    /**
        Imports the XML in the textarea.
        @method import
        @param {String} xml The XML code to import.
        @return {void}
    */
    import(xml) {
        let xmlDocument = null;

        try {
            xmlDocument = $.parseXML(xml);
        }
        catch (error) {
            alert(error); // eslint-disable-line no-alert
            return;
        }

        let $zyTool = $(xmlDocument).children().eq(0);

        if ($zyTool.prop('tagName') === 'zyVersion') {
            $zyTool = $zyTool.children().eq(0);
        }

        if ($zyTool.length === 0) {
            alert('XML format unrecognized: Expected zyTool tag as outer-most tag.'); // eslint-disable-line no-alert
        }
        else {
            this.releaseResources();
            const unescapeHTML = require('utilities').unescapeHTML;

            const $options = $zyTool.children('zyOptions');
            const $levels = $options.children('levels,questions').children();
            const guid = $zyTool.attr('id');
            const caption = unescapeHTML($zyTool.attr('caption'));
            const language = $options.children('language').html();
            const highlightNew = $options.children('highlightNew').html() || false;
            const $globalCode = $options.children('globalCode');
            const globalCode = unescapeHTML($globalCode.html()) || '';

            this.getElement('.level-container').remove();
            this.getElement('.level-content-container').remove();
            this.progression = new Progression(guid, caption, language, highlightNew, globalCode);
            this.levelsAndFilesController = new LevelsAndFilesController(this.builderControllerFunctions, this.templates, this.progression);
            this.levelsContentController = new LevelsContentController(this.builderControllerFunctions, this.templates, this.progression);
            this.globalCodeController = new GlobalCodeController(this.id, this.progression);
            this.$captionInput.val(this.progression.caption);
            this.$languageSelector.val(this.progression.language);
            this.$highlightNew.find('input').prop('checked', highlightNew);

            $levels.each((levelIndex, levelElement) => {
                this.addLevel(false);

                const $level = $(levelElement);
                const $template = $level.children('template');
                const $explanation = $level.children('explanation');
                const $input = $level.children('input');
                const $parameters = $level.children('parameters');
                const isPythonRandomization = $parameters.children().length === 0;

                const explanation = $explanation.attr('unescape-html') ? unescapeHTML($explanation.html()) : $explanation.html();
                const input = $input.attr('unescape-html') ? unescapeHTML($input.html()) : $input.html();
                let filesData = [];

                // If template is type list, then we need to build a list of files.
                if ($template.attr('type') === 'list') {
                    filesData = $template.children().map((fileIndex, file) => {
                        const $file = $(file);
                        const $program = $file.children('program');
                        const program = $program.attr('unescape-html') ? unescapeHTML($program.html()) : $program.html();
                        const filename = $file.children('filename').html();
                        const isMain = fileIndex === 0;

                        if (fileIndex > 0) {
                            this.addFileToLevel(levelIndex, fileIndex, filename, false);
                        }
                        else {
                            this.renameFile(levelIndex, fileIndex, filename, false);
                        }

                        return { filename, isMain, program };
                    })
                    .toArray();
                }
                else {
                    const program = $template.attr('unescape-html') ? unescapeHTML($template.html()) : $template.html();
                    const filename = this.progression.levels[levelIndex].files[0].filename;

                    filesData.push({ filename, isMain: true, program });
                }

                const levelData = {
                    filesData,
                    explanation,
                    input,
                    parameters: isPythonRandomization ? $parameters : $parameters.children(),
                    isPythonRandomization,
                };

                this.progression.saveLevel(levelIndex, levelData);
                this.levelsContentController.importLevel(levelIndex, levelData);
            });
            this.selectLevel(0);
        }
    }

    /**
        Release resources before starting a progression. Removes Ace editor workers.
        @method releaseResources
        @return {void}
    */
    releaseResources() {
        if (this.levelsContentController) {
            this.levelsContentController.destroy();
        }
    }

    /**
        Gets a jQuery element for this instance of the tool.
        @method getElement
        @param {String} selector The element selector.
        @return {jQuery}
    */
    getElement(selector) {
        return $(`#${this.id} ${selector}`);
    }

    /**
        Opens a modal.
        @method showModal
        @param {String} title The title of the modal.
        @param {String} message The message can be a simple string or HTML code.
        @param {Object} leftButton Data for the left button (label, callback, decoration, etc)
        @param {Object} [rightButton=null] Data for the right button (label, callback, decoration, etc)
        @return {void}
    */
    showModal(title, message, leftButton, rightButton = null) {
        this._parentResource.showModal(title, message, leftButton, rightButton);
    }

    /**
        If a new level is selected, save the old one.
        @method _saveLevelIfLevelChanges
        @private
        @param {Number} newLevelIndex The new level that is going to be selected
        @return {void}
    */
    _saveLevelIfLevelChanges(newLevelIndex) {
        const currentLevelIndex = this.progression.getSelectedLevelAndFile().levelIndex;

        if ((currentLevelIndex !== -1) && (currentLevelIndex !== newLevelIndex)) {
            this.saveLevel(currentLevelIndex);
        }
    }
}

module.exports = {
    create: function() {
        return new CodeOutputBuilder();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {

        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: false,
};
