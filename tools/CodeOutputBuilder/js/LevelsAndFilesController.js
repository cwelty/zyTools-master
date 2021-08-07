/* exported LevelsAndFilesController */
'use strict';

/**
    Controls the levels and files selection, edition, removal.
    @class LevelsAndFilesController
*/
class LevelsAndFilesController {

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
            A reference to the levels and files buttons container.
            @property $levelsAndFiles
            @type {jQuery}
        */
        this.$levelsAndFiles = progressionChangingFunctions.getElement('.levels-and-files-container');

        /**
            A selection of the Handlebar templates for this tool.
            @property templates
            @type {Function}
        */
        this.templates = templates;
    }

    /**
        Render the global code button, the list of levels, and the files in each level. Then add listeners.
        @method render
        @return {void}
    */
    render() {

        // Render fixed elements: "Global code" and "Add level" buttons
        this.$levelsAndFiles.empty()
                            .html(this.templates.levelsAndFiles());

        // Render the levels and their files.
        this._progression.levels.forEach((level, levelIndex) => {
            const levelHTML = this.templates.levelButton({
                levelNumber: levelIndex + 1,
                isSelected: level.isSelected,
            });
            const $levelContainer = $(levelHTML);

            $levelContainer.data({ levelIndex });
            this.$levelsAndFiles.find('button.add-level-container')
                                .before($levelContainer);

            level.files.forEach((file, fileIndex) => {
                const fileHTML = this.templates.fileButtons({
                    filename: file.filename,
                    isSelected: file.isSelected,
                });
                const $fileContainer = $(fileHTML);

                $fileContainer.data({ fileIndex });
                $levelContainer.find('.add-file-row')
                               .before($fileContainer);
            });
        });

        this._setListeners();
        this._updateNoteExample();
    }

    /**
        Sets the listeners for this controller.
        @private
        @method _setListeners
        @return {void}
    */
    _setListeners() {

        // "Global code" and "Add level" button listers.
        this.$levelsAndFiles.find('button.edit-global-code')
                            .click(() => {
                                this._progressionChangingFunctions.editGlobalCode();
                            });
        this.$levelsAndFiles.find('button.add-level-container')
                            .click(() => {
                                this._progressionChangingFunctions.addLevel();
                            });

        // Level sorting behavior.
        this.$levelsAndFiles.sortable({
            items: '.level-container',
            stop: (event, ui) => {
                const currentLevelIndex = $(ui.item).data('levelIndex');
                const newLevelIndex = this.$levelsAndFiles.find('.level-container')
                                                          .index(ui.item);

                this._progressionChangingFunctions.moveLevel(currentLevelIndex, newLevelIndex);
            },
        });

        const $levelContainers = this.$levelsAndFiles.find('.level-container');

        // Add level listeners: Selecting and removing levels, adding files.
        $levelContainers.each((levelIndex, levelContainer) => {
            const $levelContainer = $(levelContainer);

            $levelContainer.find('button.level')
                           .click(() => {
                               this._progressionChangingFunctions.selectLevel(levelIndex);
                           });

            $levelContainer.find('button.remove-level')
                           .click(() => {
                               this._progressionChangingFunctions.removeLevel(levelIndex);
                           });

            $levelContainer.find('button.add-file')
                           .click(() => {
                               const newFileIndex = $levelContainer.find('.file-row').length;

                               this._progressionChangingFunctions.addFileToLevel(levelIndex, newFileIndex);
                           });
        });

        // Add file listeners: Sorting files, and selecting, renaming, and removing files.
        $levelContainers.each((levelIndex, levelContainer) => {
            const $levelContainer = $(levelContainer);

            $levelContainer.sortable({
                items: '.file-row',
                stop: (event, ui) => {
                    const $container = ui.item.parent();
                    const currentFileIndex = $(ui.item).data('fileIndex');
                    const newFileIndex = $container.find('.file-row')
                                                   .index(ui.item);

                    this._progressionChangingFunctions.moveFileFromLevel(levelIndex, currentFileIndex, newFileIndex);
                },
            });

            $levelContainer.find('.file-row').each((fileIndex, fileRowElement) => {
                const $fileRow = $(fileRowElement);

                $fileRow.find('.file-name').click(() => {
                    this._progressionChangingFunctions.selectFileFromLevel(levelIndex, fileIndex);
                });

                $fileRow.find('.file-rename').click(() => {
                    this._setFileRenameControls(levelIndex, fileIndex);
                });

                $fileRow.find('.file-remove').click(() => {
                    this._progressionChangingFunctions.removeFileFromLevel(levelIndex, fileIndex);
                });
            });

        });
    }

    /**
        Gets the level's container for the passed level index.
        @private
        @method _getLevelContainer
        @param {Number} levelIndex The index of the level whose container we want to return.
        @return {jQuery}
    */
    _getLevelContainer(levelIndex) {
        return this.$levelsAndFiles.find('.level-container').eq(levelIndex);
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
        return this._getLevelContainer(levelIndex).find('.file-row').eq(fileIndex);
    }

    /**
        Sets the file renaming controls.
        @private
        @method _setFileRenameControls
        @param {Number} levelIndex The index of the level to which this file pertains.
        @param {Number} fileIndex The index of the file to be renamed.
        @return {void}
    */
    _setFileRenameControls(levelIndex, fileIndex) {
        const $fileRow = this._getFileContainer(levelIndex, fileIndex);
        const oldFilename = $fileRow.find('span').text();
        const oldFileHTML = $fileRow.html();
        const renameHTML = this.templates.fileRename({ filename: oldFilename });

        $fileRow.html(renameHTML);
        $fileRow.find('input').select();

        $fileRow.find('button.save').click(() => {
            const newFilename = $fileRow.find('.file-name').val();

            this._progressionChangingFunctions.renameFile(levelIndex, fileIndex, newFilename);
        });
        $fileRow.find('button.cancel').click(() => {
            $fileRow.html(oldFileHTML);
        });
    }

    /**
        Updates the example in the note to indicate the main file of the first level. Or hides the note if it isn't needed.
        @method _updateNoteExample
        @return {void}
    */
    _updateNoteExample() {
        const $noteExample = this.$levelsAndFiles.find('.note-example');
        const $noteDiv = $noteExample.parent();

        if (this._progression.levels.some(level => level.files.length > 1)) {
            const level1MainFile = this._progression.levels[0].files[0].filename;

            $noteExample.html(level1MainFile);
            $noteDiv.show();
        }
        else {
            $noteDiv.hide();
        }
    }
}
