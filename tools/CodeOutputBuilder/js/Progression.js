/* global Level, CodeFile */
/* exported Progression */
'use strict';

/**
    A Progression class that stores a list of levels, the GUID, caption and programming language.
    @module CodeOutputBuilder
    @return {void}
*/
class Progression {

    /**
        @constructor
        @param {String} [guid=null] The guid for the progression.
        @param {String} [caption=null] The caption for the progression.
        @param {String} [language='cpp'] The programming language for the progression.
        @param {Boolean} [highlightNew=false] Whether to highlight the comment lines with "New".
        @param {String} [globalCode=''] The Python randomization code shared through the progression.
    */
    constructor(guid = null, caption = null, language = 'cpp', highlightNew = false, globalCode = '') {

        /**
            The GUID of this progression.
            @property guid
            @type {String}
        */
        this.guid = guid;

        /**
            The caption for this progression.
            @property caption
            @type {String}
        */
        this.caption = caption;

        /**
            The programming language of this progression.
            @property language
            @type {String}
        */
        this.language = language;

        /**
            Whether to highlight comment lines with the word "New".
            @property highlightNew
            @type {Boolean}
        */
        this.highlightNew = highlightNew;

        /**
            Python randomization code shared through the progression.
            @property globalCode
            @type {String}
        */
        this.globalCode = globalCode;

        /**
            The list of levels of this progression.
            @property levels
            @type {Array}
            @default []
        */
        this.levels = [];
    }

    /**
        Updates the level numbers.
        @method _updateLevelNumbers
        @return {void}
    */
    _updateLevelNumbers() {
        this.levels.forEach((level, index) => {
            level.number = index + 1;
        });
    }

    /**
        Saves a level with the data passed.
        @method saveLevel
        @param {Number} levelIndex The index of the level to be saved.
        @param {Object} levelData Contains the code, explanation, input and parameters to save in the level.
        @return {Boolean} Whether the saving succeded.
    */
    saveLevel(levelIndex, levelData) {
        const level = this.levels[levelIndex];

        if (levelData.parameters instanceof $) {
            level.setParametersXML(levelData.parameters, levelData.isPythonRandomization);
        }
        else {
            level.setParameters(levelData.parameters, levelData.isPythonRandomization);
        }

        level.files = levelData.filesData.map(fileData =>
            new CodeFile(fileData.filename, fileData.isMain, fileData.program, fileData.isSelected)
        );

        level.isSelected = levelData.isSelected;
        level.explanation = levelData.explanation;
        level.input = levelData.input;
        return true;
    }

    /**
        Creates and adds a level to the list of levels.
        @method addLevel
        @return {void}
    */
    addLevel() {
        this.levels.push(new Level());
        this._updateLevelNumbers();
    }

    /**
        Moves a level from one position to another.
        @method moveLevel
        @param {Number} currentLevelIndex The current index of the level.
        @param {Number} newLevelIndex The new index to set for the level.
        @return {void}
    */
    moveLevel(currentLevelIndex, newLevelIndex) {
        const levelBeingMoved = this.levels.splice(currentLevelIndex, 1)[0];

        this.levels.splice(newLevelIndex, 0, levelBeingMoved);
        this._updateLevelNumbers();
    }

    /**
        Removes a level from the list of levels.
        @method removeLevel
        @param {Number} levelIndex The index of level to be removed.
        @return {void}
    */
    removeLevel(levelIndex) {
        this.levels.splice(levelIndex, 1);
        this._updateLevelNumbers();
    }

    /**
        Adds a code editor for a new file in the level.
        @method addFileToLevel
        @param {Number} levelIndex The index of level to which user wants to add a file.
        @param {String} [filename=''] The file name of the new file.
        @return {void}
    */
    addFileToLevel(levelIndex, filename = '') {
        const newFilename = filename || this.generateFilename(levelIndex);

        this.levels[levelIndex].addFile(newFilename);
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
        this.levels[levelIndex].moveFile(currentFileIndex, newFileIndex);
    }

    /**
        Removes a file from a level.
        @method removeFileFromLevel
        @param {Number} levelIndex The index of the level to which this file pertains.
        @param {Number} fileIndex The index of the file to be removed.
        @return {void}
    */
    removeFileFromLevel(levelIndex, fileIndex) {
        this.levels[levelIndex].removeFile(fileIndex);
    }

    /**
        Builds a name for a new file name.
        @method generateFilename
        @param {Number} levelIndex The index of the level whose container we want to return.
        @return {String} The new filename.
    */
    generateFilename(levelIndex) {
        const fileIndex = this.levels[levelIndex].files.length;
        const extensionFromLanguage = {
            c: 'c', // eslint-disable-line id-length
            cpp: 'cpp',
            java: 'java',
            python: 'py',
            python3: 'py',
            zyPseudocode: 'coral',
            zyFlowchartZyPseudocode: 'coral',
            zyFlowchart: 'coral',
        };
        const languageExtension = extensionFromLanguage[this.language];
        const filename = fileIndex === 0 ? `main.${languageExtension}` : `file-${fileIndex}.${languageExtension}`;

        return filename;
    }

    /**
        Returns the escaped global code.
        @method getEscapedGlobalCodeXML
        @return {String}
    */
    getEscapedGlobalCodeXML() {
        let globalCodeXML = '';

        if (this.globalCode) {
            const escapedGlobalCode = require('utilities').escapeHTML(this.globalCode);
            const unescapeGlobalCode = escapedGlobalCode === this.globalCode ? '' : ' unescape-html=\'true\'';

            globalCodeXML = `<globalCode${unescapeGlobalCode}>${escapedGlobalCode}</globalCode>\n`;
        }
        return globalCodeXML;
    }

    /**
        Returns the index of the selected level and file.Returns an object with their indices.
        @method getSelectedLevelAndFile
        @return {Object}
    */
    getSelectedLevelAndFile() {
        const selectedLevelIndex = this.levels.findIndex(level => level.isSelected);
        const selectedFileIndex = selectedLevelIndex === -1 ? -1 : this.levels[selectedLevelIndex].files.findIndex(file => file.isSelected);

        return {
            levelIndex: selectedLevelIndex,
            fileIndex: selectedFileIndex,
        };
    }

    /**
        Selects the indicated level and file. Deselects the others.
        @method selectFileFromLevel
        @param {Number} levelIndexToSelect The index of the level to select.
        @param {Number} fileIndexToSelect The index of the file to select.
        @return {void}
    */
    selectFileFromLevel(levelIndexToSelect, fileIndexToSelect) {

        // Deselect all.
        this.levels.forEach(level => {
            level.isSelected = false;
            level.files.forEach(file => {
                file.isSelected = false;
            });
        });

        // Select desired level and file.
        const level = this.levels[levelIndexToSelect];
        const file = level.files[fileIndexToSelect];

        level.isSelected = true;
        file.isSelected = true;
    }

    /**
        Returns an XML string representing this progression.
        @method toXML
        @return {String} The XML string.
    */
    toXML() {
        const numParts = this.levels.length;
        const toolXML = `<zyTool name='codeOutput' caption='${this.caption}' id='${this.guid}' parts='${numParts}' challenge='true'>`;
        let exportedXML = `${toolXML}\n<zyOptions>\n<language>${this.language}</language>\n`;

        exportedXML += this.highlightNew ? `<highlightNew type='boolean'>${this.highlightNew}</highlightNew>\n` : '';
        exportedXML += this.getEscapedGlobalCodeXML();
        exportedXML += `<levels type='list'>\n`;
        exportedXML += this.levels.map(level => level.toXML()).join('\n');
        exportedXML += `\n</levels>\n</zyOptions>\n</zyTool>`;

        return exportedXML;
    }

    /**
        Returns a JSON object representing this progression.
        @method toJSON
        @return {JSON}
    */
    toJSON() {
        return {
            language: this.language,
            highlightNew: this.highlightNew,
            globalCode: this.globalCode,
            levels: this.levels.map(level => level.toJSON()),
        };
    }
}
