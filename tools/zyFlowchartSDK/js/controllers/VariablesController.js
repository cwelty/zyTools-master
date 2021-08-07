'use strict';

/* exported VariablesController */
/* global SingleMemoryCellVariableRender, ArraySizeRender, ArrayElementRender, ArraySizeComment, globalConstants */

/**
    Control a {Variables}
    @class VariablesController
*/
class VariablesController {

    /**
        @constructor
        @param {Variables} variables The variables to control.
        @param {Object} $containerDOM jQuery reference to the container for the controller.
    */
    constructor(variables, $containerDOM) {

        /**
            The variables to control.
            @property variables
            @type {Variables}
        */
        this.variables = variables;

        /**
            jQuery reference to the container for the controller.
            @property $containerDOM
            @type {Object}
        */
        this.$containerDOM = $containerDOM;
    }

    /**
        Render the variables.
        @method render
        @return {void}
    */
    render() {
        const variableRenderList = [];
        let hasArray = false;

        this.variables.forEach(variable => {
            const isArray = variable.isArray();

            hasArray = hasArray || isArray;

            if (isArray) {
                const sizeElement = new ArraySizeRender(variable);
                const arrayElements = [];

                if (sizeElement.value === '0') {
                    arrayElements.push(new ArraySizeComment('empty'));
                }
                else if (sizeElement.value === '?') {
                    arrayElements.push(new ArraySizeComment('not set'));
                }
                else {
                    arrayElements.push(...variable.arrayCells.map(memoryCell => new ArrayElementRender(memoryCell, variable.name)));
                }

                variableRenderList.push(sizeElement, ...arrayElements);
            }
            else {
                variableRenderList.push(new SingleMemoryCellVariableRender(variable.cell));
            }
        });

        this.$containerDOM.html(globalConstants.templates.variables({
            hasArray,
            variablesName: this.variables.name,
            variableRenderList,
        }));
    }

    /**
        Hide the variables.
        @method hide
        @return {void}
    */
    hide() {
        this.$containerDOM.hide();
    }

    /**
        Show the variables.
        @method show
        @return {void}
    */
    show() {
        this.$containerDOM.show();
    }
}
