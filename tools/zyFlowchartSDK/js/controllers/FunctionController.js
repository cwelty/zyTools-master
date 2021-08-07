'use strict';

/* exported FunctionController */
/* global FlowchartController, VariablesController globalConstants, NumericalInputComponentController, NumericalOutputComponentController,
   FunctionAndFlowchartScrollAmount */

/**
    Control a {ProgramFunction}. Optionally, also control the program's input and output.
    @class FunctionController
*/
class FunctionController {

    /**
        @constructor
        @param {ProgramFunction} programFunction The function to control.
        @param {String} programCode The program's code.
        @param {Object} $containerDOM jQuery reference to the container for the controller.
        @param {NumericalInputComponent} input A numerical input component to render along with the function.
        @param {NumericalOutputComponent} output A numerical input component to render along with the function.
    */
    constructor(programFunction, programCode, $containerDOM, input, output) {

        /**
            The function to control.
            @property programFunction
            @type {ProgramFunction}
        */
        this.programFunction = programFunction;

        /**
            The program's code, displayed when pseudocode is used.
            @property programCode
            @type {String}
        */
        this.programCode = programCode;

        /**
            jQuery reference to the container for the controller.
            @property $containerDOM
            @type {Object}
        */
        this.$containerDOM = $containerDOM;

        /**
            A numerical input component to render along with the function.
            @property input
            @type {NumericalInputComponent}
        */
        this.input = input;

        /**
            A numerical output component to render along with the function.
            @property output
            @type {NumericalOutputComponent}
        */
        this.output = output;

        /**
            The code controller for this function.
            @property codeController
            @type {FunctionCodeController}
            @default null
        */
        this.codeController = null;

        /**
            The parameters controller for this function.
            @property parametersController
            @type {VariablesController}
            @default null
        */
        this.parametersController = null;

        /**
            The local variables controller for this function.
            @property localsController
            @type {VariablesController}
            @default null
        */
        this.localsController = null;

        /**
            The return variable controller for this function.
            @property returnController
            @type {VariablesController}
            @default null
        */
        this.returnController = null;

        /**
            An input controller which is optionally used.
            @property inputController
            @type {NumericalInputComponentController}
            @default null
        */
        this.inputController = null;

        /**
            An input controller which is optionally used.
            @property outputController
            @type {NumericalOutputComponentController}
            @default null
        */
        this.outputController = null;

        /**
            Whether to show the function name.
            @property showFunctionName
            @type {Boolean}
            @default false
        */
        this.showFunctionName = false;

        /**
            Whether to make the output editable.
            @property isOutputEditable
            @type {Boolean}
            @default false
        */
        this.isOutputEditable = false;

        /**
            Whether to make the input editable.
            @property isInputEditable
            @type {Boolean}
            @default false
        */
        this.isInputEditable = false;

        /**
            The function call when the output has changed via user input.
            @property outputChangeFunction
            @type {Function}
            @default null
        */
        this.outputChangeFunction = null;

        /**
            Whether the pseudocode is currently shown.
            @property isPseudocodeCurrentlyShown
            @type {Boolean}
            @default false
        */
        this.isPseudocodeCurrentlyShown = false;

        /**
            Whether the ported code is currently shown.
            @property isPortedCodeCurrentlyShown
            @type {Boolean}
            @default false
        */
        this.isPortedCodeCurrentlyShown = false;

        /**
            Whether the pseudocode is editable.
            @property isPseudocodeEditable
            @type {Boolean}
            @default false
        */
        this.isPseudocodeEditable = false;

        /**
            Whether pseudocode editing is restricted to only the placeholder, and the pre and post are not editable.
            @property isPseudocodeEditingRestricted
            @type {Boolean}
            @default false
        */
        this.isPseudocodeEditingRestricted = false;

        /**
            The program's code that is restricted to editing the placeholder, not the pre and post.
            @property restrictedCode
            @type {RestrictedCode}
            @default null
        */
        this.restrictedCode = null;

        /**
            Whether the executor is in execute mode.
            @property isInExecuteMode
            @type {Boolean}
            @default false
        */
        this.isInExecuteMode = false;

        /**
            Whether to provide an accessible and interactive experience.
            @property needsAccessibleAndInteractive
            @type {Boolean}
            @default false
        */
        this.needsAccessibleAndInteractive = false;
    }

    /**
        Render the program function.
        @method render
        @return {void}
    */
    render() { // eslint-disable-line complexity
        this.$containerDOM.html(globalConstants.templates.function({
            hasInputOrOutput: this.input || this.output,
            hasVariables: this.programFunction.parameters.length ||
                          this.programFunction.locals.length ||
                          this.programFunction.return.length,
            functionName: this.programFunction.name,
            isCodeCurrentlyShown: this.isPseudocodeCurrentlyShown || this.isPortedCodeCurrentlyShown,
            showVariablesNotShownMessage: !this.isInExecuteMode && this.isPseudocodeCurrentlyShown,
            showFunctionName: this.showFunctionName,
        }));

        // Create and render the function's code.
        if (this.isPseudocodeCurrentlyShown || this.isPortedCodeCurrentlyShown) {
            this.codeController.setContainerDOM(this.$containerDOM.find('.function-container'));
            this.codeController.setNeedsAccessibleAndInteractive(this.needsAccessibleAndInteractive);

            if (this.isPseudocodeCurrentlyShown) {
                this.codeController.setIsPseudocodeEditable(this.isPseudocodeEditable);
                this.codeController.setIsPseudocodeEditingRestricted(this.isPseudocodeEditingRestricted, this.restrictedCode);
            }
        }
        else {
            this.codeController = new FlowchartController(
                this.programFunction.flowchart, this.$containerDOM.find('.function-container')
            );
        }
        this.codeController.setIsInExecuteMode(this.isInExecuteMode);
        this.codeController.render();

        // Create and render the applicable variables.
        if (this.programFunction.parameters.length) {
            this.parametersController = new VariablesController(
                this.programFunction.parameters, this.$containerDOM.find('.parameter-variables-container')
            );
            this.parametersController.render();
        }
        if (this.programFunction.locals.length) {
            this.localsController = new VariablesController(
                this.programFunction.locals, this.$containerDOM.find('.local-variables-container')
            );
            this.localsController.render();
        }
        if (this.programFunction.return.length) {
            this.returnController = new VariablesController(
                this.programFunction.return, this.$containerDOM.find('.return-variable-container')
            );
            this.returnController.render();
        }

        // Create and render the applicable input and output.
        if (this.input) {
            this.inputController = new NumericalInputComponentController(this.input, this.$containerDOM.find('.input-container'));
            this.inputController.setIsEditable(this.isInputEditable);
            this.inputController.render();
        }
        if (this.output) {
            this.outputController = new NumericalOutputComponentController(this.output, this.$containerDOM.find('.output-container'));
            this.outputController.setIsEditable(this.isOutputEditable, this.outputChangeFunction);
            this.outputController.render();
        }
    }

    /**
        Ensure the showing of the node that is next to execute.
        @method showNextToExecuteNode
        @param {FlowchartNode} nextNodeToExecute The next node to execute.
        @param {FlowchartNode} previousNodeExecuted The previously executed node.
        @return {void}
    */
    showNextToExecuteNode(nextNodeToExecute, previousNodeExecuted) {
        this.codeController.showNextToExecuteNode(nextNodeToExecute, previousNodeExecuted);
    }

    /**
        Make an object storing a function and the associated code's scroll amount.
        @method makeFunctionAndCodeScrollAmount
        @return {FunctionAndFlowchartScrollAmount} The function and associated code's scroll amount.
    */
    makeFunctionAndCodeScrollAmount() {
        let horizontalScroll = 0;
        let verticalScroll = 0;

        // Only flowchart stores scrolling.
        if (!(this.isPseudocodeCurrentlyShown || this.isPortedCodeCurrentlyShown)) {
            horizontalScroll = this.codeController.getHorizontalScroll();
            verticalScroll = this.codeController.getVerticalScroll();
        }

        return new FunctionAndFlowchartScrollAmount(
            this.programFunction, horizontalScroll, verticalScroll
        );
    }

    /**
        Set the function code's scroll amount.
        @method setFunctionCodeScrollAmount
        @param {FunctionAndFlowchartScrollAmount} amountToSet The amount of scroll to set.
        @return {void}
    */
    setFunctionCodeScrollAmount(amountToSet) {

        // Only flowchart sets scrolling.
        if (!(this.isPseudocodeCurrentlyShown || this.isPortedCodeCurrentlyShown)) {
            this.codeController.setHorizontalScroll(amountToSet.horizontalScroll);
            this.codeController.setVerticalScroll(amountToSet.verticalScroll);
        }
    }

    /**
        Get the height of this function's code.
        @method getFunctionCodeHeight
        @return {Number} The height of the function's code.
    */
    getFunctionCodeHeight() {
        return this.codeController.getHeight();
    }

    /**
        Get the width of this function's code.
        @method getFunctionCodeWidth
        @return {Number} The width of the function's code.
    */
    getFunctionCodeWidth() {
        return this.codeController.getWidth();
    }

    /**
        Get the height of this function's variables and IO.
        @method getVariableAndIOHeight
        @return {Number} The height of the function's variables and IO.
    */
    getVariableAndIOHeight() {
        return this.$containerDOM.find('.variables-and-IO-container').height();
    }

    /**
        Get the width of this function's variables.
        @method getVariableWidth
        @return {Number} The width of the function's variables.
    */
    getVariableWidth() {
        let variableWidth = 0;
        const $functionVariables = this.$containerDOM.find('.function-variables-container');

        // If there are function variables, then measure the width of the variables.
        if ($functionVariables.length) {
            const $inputOutputContainer = this.$containerDOM.find('.input-output-container');

            $inputOutputContainer.hide();
            variableWidth = $functionVariables.width();
            $inputOutputContainer.show();
        }


        return variableWidth;
    }

    /**
        Set the height of this function's variables and IO.
        @method setVariableAndIOHeight
        @param {Number} height The height to set.
        @return {void}
    */
    setVariableAndIOHeight(height) {
        const propertyToUse = this.isOutputEditable ? 'min-height' : 'height';

        this.$containerDOM.find('.variables-and-IO-container').css(propertyToUse, height);
    }

    /**
        Set the width of this function's variables and IO.
        @method setVariableAndIOWidth
        @param {Number} width The width to set.
        @return {void}
    */
    setVariableAndIOWidth(width) {
        const propertyToUse = this.isOutputEditable ? 'min-width' : 'width';

        this.$containerDOM.find('.variables-and-IO-container').css(propertyToUse, width);
    }

    /**
        Set whether to show the function name.
        @method setShowFunctionName
        @param {Boolean} showFunctionName Whether to show the function name.
        @return {void}
    */
    setShowFunctionName(showFunctionName) {
        this.showFunctionName = showFunctionName;
    }

    /**
        Hide the function's code.
        @method hideFunctionCode
        @return {void}
    */
    hideFunctionCode() {
        this.$containerDOM.find('.function-container').hide();
    }

    /**
        Show the flowchart.
        @method showFunctionCode
        @return {void}
    */
    showFunctionCode() {
        this.$containerDOM.find('.function-container').show();
    }

    /**
        Set whether to make the output editable.
        @method setIsOutputEditable
        @param {Boolean} isOutputEditable Whether to make the output editable.
        @param {Function} [outputChangeFunction=null] A function to call when the output changes.
        @return {void}
    */
    setIsOutputEditable(isOutputEditable, outputChangeFunction = null) {
        this.isOutputEditable = isOutputEditable;
        this.outputChangeFunction = outputChangeFunction;
    }

    /**
        Set whether to make the input editable.
        @method setIsInputEditable
        @param {Boolean} isInputEditable Whether to make the input editable.
        @return {void}
    */
    setIsInputEditable(isInputEditable) {
        this.isInputEditable = isInputEditable;
    }

    /**
        Set whether pseudocode is currently being shown.
        @method setIsPseudocodeCurrentlyShown
        @param {String} isPseudocodeCurrentlyShown Whether pseudocode is currently being shown.
        @param {PseudocodeController} pseudocodeController The pseudocode controller to use.
        @return {void}
    */
    setIsPseudocodeCurrentlyShown(isPseudocodeCurrentlyShown, pseudocodeController) {
        this.isPseudocodeCurrentlyShown = isPseudocodeCurrentlyShown;

        if (isPseudocodeCurrentlyShown) {
            this.codeController = pseudocodeController;
        }
    }

    /**
        Set whether ported code is currently being shown.
        @method setIsPortedCodeCurrentlyShown
        @param {String} isPortedCodeCurrentlyShown Whether ported code is currently being shown.
        @param {PseudocodeController} portedCodeController The ported code controller to use.
        @return {void}
    */
    setIsPortedCodeCurrentlyShown(isPortedCodeCurrentlyShown, portedCodeController) {
        this.isPortedCodeCurrentlyShown = isPortedCodeCurrentlyShown;

        if (isPortedCodeCurrentlyShown) {
            this.codeController = portedCodeController;
        }
    }

    /**
        Set whether the pseudocode is editable.
        @method setIsPseudocodeEditable
        @param {Boolean} isPseudocodeEditable Whether the pseudocode is editable.
        @return {void}
    */
    setIsPseudocodeEditable(isPseudocodeEditable) {
        this.isPseudocodeEditable = isPseudocodeEditable;

        if (this.codeController && this.codeController.setIsPseudocodeEditable) {
            this.codeController.setIsPseudocodeEditable(this.isPseudocodeEditable);
        }
    }

    /**
        Set whether the pseudocode editing should be restricted.
        @method setIsPseudocodeEditingRestricted
        @param {Boolean} isPseudocodeEditingRestricted Whether the pseudocode editing should be restricted.
        @param {RestrictedCode} restrictedCode The program's code that is restricted to editing the placeholder, not the pre and post.
        @return {void}
    */
    setIsPseudocodeEditingRestricted(isPseudocodeEditingRestricted, restrictedCode) {
        this.isPseudocodeEditingRestricted = isPseudocodeEditingRestricted;
        this.restrictedCode = restrictedCode;
    }

    /**
        Set whether the executor is in execute mode.
        @method setIsInExecuteMode
        @param {Boolean} isInExecuteMode Whether the executor is in execute mode.
        @return {void}
    */
    setIsInExecuteMode(isInExecuteMode) {
        this.isInExecuteMode = isInExecuteMode;
    }

    /**
        Set the error message and line number.
        @method setError
        @param {String} message The error message.
        @param {Integer} lineNumber The line number of the error.
        @return {void}
    */
    setError(message, lineNumber) {
        this.codeController.setError(message, lineNumber);
    }

    /**
        Set whether to provide an accessible and interactive experience.
        @method setNeedsAccessibleAndInteractive
        @param {Boolean} needsAccessibleAndInteractive Whether to provide an accessible and interactive experience.
        @return {void}
    */
    setNeedsAccessibleAndInteractive(needsAccessibleAndInteractive) {
        this.needsAccessibleAndInteractive = needsAccessibleAndInteractive;
    }

    /**
        Clear the error message and line number.
        @method clearError
        @return {void}
    */
    clearError() {
        this.codeController.clearError();
    }

    /**
        Return the pseudocode stored by this function.
        @method getPseudocode
        @return {String} The code stored by this function.
    */
    getPseudocode() {
        return (this.codeController && this.codeController.getPseudocode) ?
                this.codeController.getPseudocode() :
                this.programCode;
    }

    /**
        Put the browser's focus on this function.
        @method focus
        @return {void}
    */
    focus() {
        if (this.codeController) {
            this.codeController.focus();
        }
    }
}
