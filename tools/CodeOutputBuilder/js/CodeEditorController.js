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
        @param {String} language The language's name for syntax highlighting.
        @param {Boolean} [isParametersEditor=false] Whether the editor is for the parameters.
    */
    constructor(containerID, language, isParametersEditor = false) {
        this.containerID = containerID;
        this.editor = ace.edit(`${containerID}`);
        this.$editor = $(`#${containerID}`);
        this.editor.setOptions({
            minLines: 18,
            maxLines: 35,
        });

        if (isParametersEditor && language === 'js') {
            this.editor.on('input', () => {
                this.managePlaceholder();
            });
            this.managePlaceholder();
        }

        // When loading from cache, the codeEditor is not ready when this is called. And it crashes. Having a timeout fixes it.
        window.setTimeout(() => {
            this.setSettings(language);
        }, 1);
    }

    destroy() {
        this.editor.destroy();
    }

    /**
        Returns the code in the code editor.
        @method getCode
        @return {String} The code that's in the code area.
    */
    getCode() {
        return this.editor.getValue();
    }

    /**
        Sets the code passed in the editor.
        @method setCode
        @param {String} code The code to set in the code area.
        @return {void}
    */
    setCode(code) {
        this.editor.setValue(code, 1);
        this.editor.getSession().setUndoManager(new ace.UndoManager());
        this.reRender();
    }

    /**
        Sets the base settings for the language indicated.
        @method setSettings
        @param {String} language The language for syntax highlighting.
        @return {void}
    */
    setSettings(language) {
        require('utilities').aceBaseSettings(this.editor, language);
    }

    /**
        Hides the editor.
        @method hide
        @return {void}
    */
    hide() {
        this.$editor.hide();
    }

    /**
        Shows the editor.
        @method show
        @return {void}
    */
    show() {
        this.$editor.show();
    }

    /**
        Force browser to re-render the ace editor and activity. Sometimes editor renders with only 3 lines, this fixes that.
        @method reRender
        @return {void}
    */
    reRender() {
        this.hide();
        this.show();
        this.editor.resize(true);
    }

    /**
        Puts a placeholder in the parameters code editor.
        @method managePlaceholder
        @return {void}
    */
    managePlaceholder() {
        const placeholder = `Ex: {
    myParameter: 'Simple variable',
    myDictionary: {
        key1: '<',
        key2: 'Value 2'
    },
    myList: [ 1, 2, 3 ],
    myListOfDictionaries: [
        {
            first: 'out',
            second: 'in',
        },
        {
            first: 'in',
            second: 'out',
        }
    ]
}`;
        const shouldHavePlaceholder = !this.editor.session.getValue().length;
        let node = this.editor.renderer.emptyMessageNode;

        if (!shouldHavePlaceholder && node) {
            this.editor.renderer.scroller.removeChild(node);
            this.editor.renderer.emptyMessageNode = null;
        }
        else if (shouldHavePlaceholder && !node) {
            const $node = $('<div>');

            $node.text(placeholder)
                 .addClass('parameters-placeholder');
            node = $node.get(0);
            this.editor.renderer.emptyMessageNode = node;
            this.editor.renderer.scroller.appendChild(node);
        }
    }
}
