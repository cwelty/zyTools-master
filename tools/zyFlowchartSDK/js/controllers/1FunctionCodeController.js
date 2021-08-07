'use strict';

/* exported FunctionCodeController */

/**
    Abstract class to render and control a function's code, which may be a flowchart or text.
    @class FunctionCodeController
*/
class FunctionCodeController {

    /**
        @constructor
        @param {Object} $containerDOM jQuery reference to the container for the controller.
    */
    constructor($containerDOM) {

        /**
            jQuery reference to the container for the controller.
            @property $containerDOM
            @type {Object}
        */
        this.$containerDOM = $containerDOM;

        /**
            Whether the controller is in execute mode.
            @property isInExecuteMode
            @type {Boolean}
            @default false
        */
        this.isInExecuteMode = false;
    }

    /**
        Render the function's code.
        @method render
        @return {void}
    */
    render() {
        throw new Error('FunctionCodeController\'s render function should be overridden');
    }

    /**
        Ensure the showing of the node that is next to execute.
        @method showNextToExecuteNode
        @param {FlowchartNode} nextNodeToExecute The next node to execute.
        @return {void}
    */
    showNextToExecuteNode(nextNodeToExecute) { // eslint-disable-line no-unused-vars
        throw new Error('FunctionCodeController\'s showNextToExecuteNode function should be overridden');
    }

    /**
        Put the browser's focus on this function.
        @method focus
        @return {void}
    */
    focus() {} // eslint-disable-line no-empty-function

    /**
        Set an error on the controller.
        @method setError
        @param {String} message The error message.
        @param {Integer} lineNumber The line number of the error.
        @return {void}
    */
    setError(message, lineNumber) {} // eslint-disable-line

    /**
        Clear an error on the controller.
        @method clearError
        @return {void}
    */
    clearError() {} // eslint-disable-line no-empty-function

    /**
        Set whether the controller is in execute mode.
        @method setIsInExecuteMode
        @param {Boolean} isInExecuteMode Whether the controller is in execute mode.
        @return {void}
    */
    setIsInExecuteMode(isInExecuteMode) {
        this.isInExecuteMode = isInExecuteMode;
    }
}
