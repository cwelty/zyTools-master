/* global ace */
/* exported CodeEditorController */
'use strict';

/**
    Control the code editor.
    @class CodeEditorController
*/
class CodeEditorController {

    /**
        Initilize the controller for the code editor.
        @constructor
        @param {String} containerID The id of the container where the editor should be loaded.
        @param {Boolean} isAccessible Whether this is the accessible version of the tool.
    */
    constructor(containerID, isAccessible) {
        this.containerID = containerID;
        this.isAccessible = isAccessible;
        this.$editor = $(`#${containerID}`);

        if (!isAccessible) {

            // Create ace editor.
            this.editor = ace.edit(containerID);
            require('utilities').aceBaseSettings(this.editor, 'sql');

            this.editor.setOptions({
                minLines: 15,
                maxLines: 35,
            });
        }
    }

    /**
        Sets the code passed in the editor.
        @method setCode
        @param {String} code The code to set in the code editor.
        @return {void}
    */
    setCode(code) {
        if (this.isAccessible) {
            this.$editor.val(code);
        }
        else {
            this.editor.setValue(code, 1);
            this.editor.getSession().setUndoManager(new ace.UndoManager());
        }
    }

    /**
        Returns the code in the code editor.
        @method getCode
        @return {String}
    */
    getCode() {
        return this.isAccessible ? this.$editor.val() : this.editor.getValue();
    }

    /**
        Finds a string in the code, ignoring whitespace difference. Returns the index of the character where the string starts.
        The results returned by the server include the original query, but the query returned by the server removes whitespaces.
        So newlines, or multiple subsequent spaces are converted to just 1 space.
        This function tries to find |stringToFind| in the editor's code, ignoring the whitespace difference.
        Returns the first index where the substring starts.
        @method getLiteralSubstringAndIndex
        @param {String} stringToFind The string to find in the code.
        @param {Integer} [startFromIndex=0] From index of the character from which to start the search.
        @return {Integer}
    */
    getLiteralSubstringAndIndex(stringToFind, startFromIndex = 0) {

        // Convert |stringToFind| to regex: so we escape special regex characters, replace spaces with whitespace, and add an optional semicolon.
        const strEscapeSpecialRegExChars = stringToFind.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
        const strReplaceSpaces = strEscapeSpecialRegExChars.replace(/ +/g, '\\s+');
        const regExToFind = new RegExp(`${strReplaceSpaces};?`, 'g');

        const code = this.getCode();
        let firstIndexOfStrInCode = 0;
        let literalStr = stringToFind;

        do {
            const strInCode = regExToFind.exec(code);

            if (strInCode) {
                firstIndexOfStrInCode = strInCode.index;
                const lastIndexOfStrInCode = firstIndexOfStrInCode + strInCode[0].length;

                literalStr = code.substring(firstIndexOfStrInCode, lastIndexOfStrInCode);
            }
        } while (firstIndexOfStrInCode < startFromIndex);

        return {
            firstIndex: firstIndexOfStrInCode,
            literalStr,
        };
    }
}
