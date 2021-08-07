'use strict';

/* exported ExecutorController */
/* global FunctionController, globalConstants, makeRandomInteger, TextualCodeParser, RestrictedCode, PseudocodeController
   PortedCodeController*/

/**
    Control an {Executor}.
    @class ExecutorController
*/
class ExecutorController {

    /**
        @constructor
        @param {Executor} executor The executor to control.
        @param {Object} $containerDOM jQuery reference to the container for the controller.
    */
    constructor(executor, $containerDOM) {

        /**
            The executor to control.
            @property executor
            @type {Executor}
        */
        this.executor = executor;

        /**
            jQuery reference to the container for the controller.
            @property $containerDOM
            @type {Object}
        */
        this.$containerDOM = $containerDOM;

        /**
            List of function controllers for each function in the program.
            @property functionControllers
            @type {Array} of {FunctionController}
            @default []
        */
        this.functionControllers = [];

        /**
            Reference to the controller for pseudocode used by this executor.
            @property pseudocodeController
            @type {PseudocodeController}
            @default null
        */
        this.pseudocodeController = null;

        /**
            Reference to the controller for the ported language.
            @property portedCodeController
            @type {PortedCodeController}
            @default null
        */
        this.portedCodeController = null;

        /**
            jQuery reference to the function containers.
            @property $functionContainers
            @type {Object}
            @default null
        */
        this.$functionContainers = null;

        /**
            Whether the executor is in execute mode.
            @property isInExecuteMode
            @type {Boolean}
            @default false
        */
        this.isInExecuteMode = false;

        /**
            The last function on the stack.
            @property lastFunctionOnStack
            @type {ProgramFunction}
            @default null
        */
        this.lastFunctionOnStack = null;

        /**
            The currently shown function index, if one exists.
            @property currentlyShownFunctionIndex
            @type {Integer}
            @default 0
        */
        this.currentlyShownFunctionIndex = 0;

        /**
            Whether to render in compact mode. Compact mode uses |this.maxHeight| and |this.maxWidth|, and uses a segmented controller for multiple functions.
            @property isCompact
            @type {Boolean}
            @default false
        */
        this.isCompact = false;

        /**
            The max height of the executor.
            @property maxHeight
            @type {Integer}
            @default null
        */
        this.maxHeight = null;

        /**
            The max width of the executor.
            @property maxWidth
            @type {Integer}
            @default null
        */
        this.maxWidth = null;

        /**
            Whether to show the function name.
            @property showFunctionName
            @type {Boolean}
            @default true
        */
        this.showFunctionName = true;

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
            @default true
        */
        this.isInputEditable = true;

        /**
            The function call when the output has changed via user input.
            @property outputChangeFunction
            @type {Function}
            @default null
        */
        this.outputChangeFunction = null;

        /**
            The segmented function control used in compact mode when there are multiple functions and flowcharts are shown.
            @property segmentedFunctionControl
            @type {SegmentedControl}
            @default null
        */
        this.segmentedFunctionControl = null;

        /**
            The segmented language control used when both languages are shown, so the user can switch between the languages.
            @property segmentedLanguageControl
            @type {SegmentedControl}
            @default null
        */
        this.segmentedLanguageControl = null;

        /**
            The current index for the language segmented control.
            @property selectedSegmentedControlIndex
            @type {Integer}
            @default 0
        */
        this.selectedSegmentedControlIndex = 0;

        /**
            The list of names of the language segmented control.
            @property segmentedControlLanguages
            @type {Array} of {String}
            @default []
        */
        this.segmentedControlLanguages = [];

        /**
            Whether the segmented function control is enabled.
            @property isSegmentedFunctionControlEnabled
            @type {Boolean}
            @default true
        */
        this.isSegmentedFunctionControlEnabled = true;

        /**
            Whether the segmented language control is enabled.
            @property isSegmentedLanguageControlEnabled
            @type {Boolean}
            @default true
        */
        this.isSegmentedLanguageControlEnabled = true;

        /**
            The language(s) to show. Valid values: 'flowchart', 'pseudocode', and 'both'.
            @property languagesToShow
            @type {String}
            @default 'flowchart'
        */
        this.languagesToShow = 'flowchart';

        /**
            Whether the pseudocode is editable, which is only applicable when |this.languagesToShow| is 'pseudocode' or 'both'.
            @property isPseudocodeEditable
            @type {Boolean}
            @default false
        */
        this.isPseudocodeEditable = false;

        /**
            Whether the pseudocode is currently editable. Pseudocode is not editable while executing. Pseudocode is only editable if |this.isPseudocodeEditable| is true.
            @property isPseudocodeEditable
            @type {Boolean}
            @default false
        */
        this.isPseudocodeCurrentlyEditable = false;

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
            The error message shown to the user.
            @property errorMessage
            @type {String}
            @default null
        */
        this.errorMessage = null;

        /**
            The line number of the line of code with an error.
            @property errorLineNumber
            @type {Integer}
            @default null
        */
        this.errorLineNumber = null;

        /**
            The previously executed node.
            @property previousNodeExecuted
            @type {FlowchartNode}
            @default null
        */
        this.previousNodeExecuted = null;

        /**
            Callback function when a compilation error occurs.
            @property compilationErrorCallback
            @type {Function}
            @default null
        */
        this.compilationErrorCallback = null;

        /**
            The language to port Coral to.
            @property portLanguage
            @type {String}
            @default null
        */
        this.portLanguage = null;

        /**
            Whether to provide an accessible and interactive experience.
            @property needsAccessibleAndInteractive
            @type {Boolean}
            @default false
        */
        this.needsAccessibleAndInteractive = false;
    }

    /**
        Render the functions, and input and output if provided.
        @method render
        @return {void}
    */
    render() {
        if (this.executor.input) {
            this.executor.input.clearRegisteredControllers();
        }
        if (this.executor.output) {
            this.executor.output.clearRegisteredControllers();
        }
        if (this.pseudocodeController) {
            this.pseudocodeController.detach();
        }
        if (this.portedCodeController) {
            this.portedCodeController.detach();
        }

        // Store scrolling amount for each function's code.
        const formerFunctionScroll = this.functionControllers.map(controller => controller.makeFunctionAndCodeScrollAmount());

        // Generate a random integer to use in each segmented controller ID.
        const segmentedFunctionControlId = `segmented-function-control-${makeRandomInteger()}`;
        const segmentedLanguageControlId = `segmented-language-control-${makeRandomInteger()}`;

        // Render the functions.
        const functions = this.makeFunctionsToRender();
        const isUsingMultipleLanguages = this.segmentedControlLanguages.length > 1;

        this.$containerDOM.html(globalConstants.templates.executor({
            errorMessage: this.errorMessage,
            functions, isUsingMultipleLanguages, segmentedFunctionControlId, segmentedLanguageControlId,
        }));
        this.$functionContainers = this.$containerDOM.find('.function-container');
        this.functionControllers = functions.map((programFunction, index) =>
            new FunctionController(
                programFunction, this.executor.code, this.$functionContainers.eq(index), this.executor.input, this.executor.output
            )
        );
        this.functionControllers.forEach(controller => {
            controller.setIsPseudocodeCurrentlyShown(this.isPseudocodeCurrentlyShown(), this.pseudocodeController);
            controller.setIsPortedCodeCurrentlyShown(this.isPortedCodeCurrentlyShown(), this.portedCodeController);
            controller.setIsPseudocodeEditable(this.isPseudocodeCurrentlyEditable);
            controller.setIsPseudocodeEditingRestricted(this.isPseudocodeEditingRestricted, this.restrictedCode);
            controller.setShowFunctionName(this.showFunctionName);
            controller.setIsOutputEditable(this.isOutputEditable, this.outputChangeFunction);
            controller.setIsInputEditable(this.isInputEditable);
            controller.setIsInExecuteMode(this.isInExecuteMode);
            controller.setNeedsAccessibleAndInteractive(this.needsAccessibleAndInteractive);
            controller.render();

            if (this.errorMessage) {
                controller.setError(this.errorMessage, this.errorLineNumber);
            }
            else {
                controller.clearError();
            }
        });

        // Compact mode limits the height and width of the rendering.
        if (this.isCompact) {
            this.renderCompactMode(isUsingMultipleLanguages, segmentedFunctionControlId, segmentedLanguageControlId, formerFunctionScroll);
        }

        // Make each variable and IO container, then make each function container the same height/width.
        else {
            this.$functionContainers.each((index, functionContainer) => {
                $(functionContainer).find('.function-container')
                                    .height('auto')
                                    .width('auto');
            });
        }

        // Get error message container.
        const errorContainer = this.$containerDOM.find('.error-message');

        // If error message container is rendered.
        if (errorContainer.length) {

            // Function to convert values from css properties to numbers. Ex: '34px' -> 34.
            const cssToNumber = attribute => Number(attribute.split('px')[0]);

            /* Calculate the max width of error message container,
               accounting for differences in padding between .flowchart-program and .error-message. */
            const flowchartProgram = this.$containerDOM.find('.flowchart-program');
            const flowchartProgramWidth = flowchartProgram.innerWidth();
            const errorPadding = cssToNumber(errorContainer.css('paddingLeft')) + cssToNumber(errorContainer.css('paddingRight'));
            const errorWidth = flowchartProgramWidth - errorPadding;

            // Set error container max-width so it won't exceed the .flowchart-program container.
            errorContainer.css('max-width', errorWidth);
        }

        this.updateShownFunction();
    }

    /**
        Render the compact mode, which limits the height and width of the rendering.
        @method renderCompactMode
        @param {Boolean} isUsingMultipleLanguages Whether multiple languages are being used.
        @param {String} segmentedFunctionControlId The unique ID for the segmented function controller.
        @param {String} segmentedLanguageControlId The unique ID for the segmented language controller.
        @param {Array} formerFunctionScroll Array of {FunctionAndFlowchartScrollAmount}. List of previous function scrolling amounts.
        @return {void}
    */
    renderCompactMode(isUsingMultipleLanguages, segmentedFunctionControlId, segmentedLanguageControlId, formerFunctionScroll) {
        let segmentedControllerHeights = 0;

        // Add a segmented control if pseudocode is not shown and there are multiple functions.
        if (!this.isCodeCurrentlyShown() && (this.executor.program.functions.length > 1)) {
            this.renderFunctionSegmentedController(segmentedFunctionControlId);
            segmentedControllerHeights += $(`#${segmentedFunctionControlId}`).outerHeight(true);
        }

        // Add another segmented control if both languages are shown.
        if (isUsingMultipleLanguages) {
            this.renderLanguageSegmentedController(segmentedLanguageControlId);
            segmentedControllerHeights += $(`#${segmentedLanguageControlId}`).outerHeight(true);
        }

        this.functionControllers.forEach(controller => controller.hideFunctionCode());

        // Compute the padding, border, and margin that the program adds to the overall width.
        const $program = this.$containerDOM.find('.flowchart-program');
        const programPaddingBorderAndMarginWidth = $program.outerWidth(true) - $program.width();

        // Find the largest width of the variables. The IO will auto-scale via CSS.
        const maxVariableAndIOWidth = Math.max(...this.functionControllers.map(controller => controller.getVariableWidth()));
        const minVariableAndIOWidth = 275;
        const variableAndIOWidthToUse = Math.max(maxVariableAndIOWidth, minVariableAndIOWidth);

        // Update the variable and IO containers width.
        this.functionControllers.forEach(controller => controller.setVariableAndIOWidth(variableAndIOWidthToUse));

        // Find the largest height of any variable and IO container, after the width update.
        const maxVariableAndIOHeight = Math.max(...this.functionControllers.map(controller => controller.getVariableAndIOHeight()));

        // Update the variable and IO containers height.
        this.functionControllers.forEach(controller => controller.setVariableAndIOHeight(maxVariableAndIOHeight));

        const variableAndIOWidth = this.functionControllers[0].$containerDOM.find('.variables-and-IO-container').outerWidth(true);
        const maxAllowedFunctionWidth = this.maxWidth - variableAndIOWidth - programPaddingBorderAndMarginWidth;
        const maxCodeWidth = 500;

        if (this.isCodeCurrentlyShown()) {
            const functionWidthToUse = Math.min(maxCodeWidth, maxAllowedFunctionWidth);

            this.$functionContainers.each((index, functionContainer) => {
                $(functionContainer).find('.function-container').width(functionWidthToUse).height(maxVariableAndIOHeight);
            });

            // Force re-render of the editor because we just changed the height and width.
            this.functionControllers.forEach(controller => {
                controller.showFunctionCode();
                controller.codeController.forceEditorReRender();
            });
        }
        else {

            // Find the largest height/width of any function code.
            this.functionControllers.forEach(controller => controller.showFunctionCode());
            const functionCodeHeights = this.functionControllers.map(controller => controller.getFunctionCodeHeight());
            const functionCodeWidths = this.functionControllers.map(controller => controller.getFunctionCodeWidth());
            const offset = 1;
            const maxFunctionCodeHeight = Math.max(...functionCodeHeights) + offset;
            const maxFunctionCodeWidth = Math.max(...functionCodeWidths) + offset;

            // Compute the height and width to use for the function code.
            let functionWidthToUse = Math.min(maxFunctionCodeWidth, maxAllowedFunctionWidth);

            if (this.languagesToShow === 'both') {
                functionWidthToUse = Math.max(functionWidthToUse, maxCodeWidth);
            }

            const maxHeightMinusSegmentedControl = this.maxHeight - segmentedControllerHeights;
            const functionHeightToUse = Math.min(maxHeightMinusSegmentedControl, maxFunctionCodeHeight);

            this.$functionContainers.each((index, functionContainer) => {
                const alignItems = functionCodeHeights[index] < functionHeightToUse ? 'center' : 'stretch';
                const justifyContent = functionCodeWidths[index] < functionWidthToUse ? 'center' : 'flex-start';

                $(functionContainer).find('.function-container')
                                    .height(functionHeightToUse)
                                    .width(functionWidthToUse)
                                    .css('align-items', alignItems)
                                    .css('justify-content', justifyContent);
            });
        }

        // For previously existing functions, apply the former scrolling amount.
        this.functionControllers.forEach(controller => {
            const associatedFormer = formerFunctionScroll.find(former => former.programFunction === controller.programFunction);

            if (associatedFormer) {
                controller.setFunctionCodeScrollAmount(associatedFormer);
            }
        });

        const topOfStack = this.getTopOfStack();
        const nextNodeToExecute = (topOfStack && topOfStack.node) || null;

        this.functionControllers.forEach(controller => controller.showNextToExecuteNode(nextNodeToExecute, this.previousNodeExecuted));
    }

    /**
        Return the list of functions to render.
        @method makeFunctionsToRender
        @return {Array} of {Function} The list of functions to render.
    */
    makeFunctionsToRender() {
        const functions = [];

        // For pseudocode or ported code, show exactly 1 function.
        if (this.isCodeCurrentlyShown()) {
            let functionToShow = null;

            // Either the function at top of stack or the last shown function.
            if (this.isInExecuteMode) {
                functionToShow = this.executor.stack.length ? this.getTopOfStack().function : this.lastFunctionOnStack;
            }

            // The default function to show is a Main function w/o any variables.
            else {
                const parser = new TextualCodeParser();
                const program = parser.parse('');

                functionToShow = program.functions[0];
            }

            functions.push(functionToShow);
        }

        // For flowchart, show an instance of each function.
        else {

            // If in execute mode, then show function variables for the highest instance of that function in the stack.
            if (this.isInExecuteMode) { // eslint-disable-line no-lonely-if

                /*
                    Build the list of functions, starting from the top of the stack. Ex:
                    A program has four functions, ordered as follows when not executing: Main, Function1, Function2, Function3.
                    The stack has (from bottom to top): Main, Function2 (first instance), Function1, Function2 (second instance).
                    So, we want the instances of each function closest to the top of the stack.
                    And, if the function isn't in the stack, then we'll render the function from non-execute mode.
                    That is: Main, Function1, Function2 (second instance), and Function3 (non-execute mode instance).
                */
                const functionMapToHighestOnStack = {};

                if (this.executor.stack.length) {
                    this.executor.stack.forEach(element => {
                        functionMapToHighestOnStack[element.function.name] = element.function;
                    });
                }

                // Special case: Stack is empty, so we've finished execution and want to show the last function on the stack.
                else {
                    functionMapToHighestOnStack[this.lastFunctionOnStack.name] = this.lastFunctionOnStack;
                }

                functions.push(...this.executor.program.functions.map(programFunction => {
                    let functionToUse = programFunction;

                    if (programFunction.name in functionMapToHighestOnStack) {
                        functionToUse = functionMapToHighestOnStack[programFunction.name];
                    }

                    return functionToUse;
                }));
            }
            else {
                functions.push(...this.executor.program.functions);
            }
        }

        return functions;
    }

    /**
        Render a segmented controller used to control which function to show.
        @method renderFunctionSegmentedController
        @param {String} segmentedFunctionControlId The segmented function controller's ID.
        @return {void}
    */
    renderFunctionSegmentedController(segmentedFunctionControlId) {
        const functionNames = this.executor.program.functions.map(programFunction => programFunction.name);

        this.segmentedFunctionControl = require('segmentedControl').create();
        this.segmentedFunctionControl.init(functionNames, segmentedFunctionControlId);
        this.segmentedFunctionControl.selectSegmentByIndex(this.currentlyShownFunctionIndex);
        this.segmentedFunctionControl.segmentSelectedCallback = index => {
            if (this.currentlyShownFunctionIndex === index) {
                this.setFunctionIndexToShow(index);
            }
            else {
                const transitionTime = 100;

                this.$functionContainers.animate({ opacity: 0 }, transitionTime, () => {
                    this.setFunctionIndexToShow(index);
                    this.$functionContainers.animate({ opacity: 1 }, transitionTime);
                });
            }
        };

        if (!this.isSegmentedFunctionControlEnabled) {
            this.segmentedFunctionControl.disable();
        }
    }

    /**
        Render a segmented controller used to control which language to show.
        @method renderLanguageSegmentedController
        @param {String} segmentedLanguageControlId The segmented controller's ID.
        @return {void}
    */
    renderLanguageSegmentedController(segmentedLanguageControlId) {
        this.segmentedLanguageControl = require('segmentedControl').create();
        this.segmentedLanguageControl.init(this.segmentedControlLanguages, segmentedLanguageControlId);
        this.segmentedLanguageControl.selectSegmentByIndex(this.selectedSegmentedControlIndex);
        this.segmentedLanguageControl.segmentSelectedCallback = index => {
            const previousIndex = this.selectedSegmentedControlIndex;

            // If the index changed, then re-render.
            if (index !== previousIndex) {
                this.selectedSegmentedControlIndex = index;

                // Switching from pseudocode to flowchart or ported language, so compile the pseudocode.
                if ((previousIndex === 0) && this.hadErrorCompiling()) {
                    this.segmentedLanguageControl.selectSegmentByIndex(0);
                }
                else {
                    this.render();
                    if (!this.focusCursorOnOutputIfOutputIsEditable()) {
                        this.focusOnFunction();
                    }
                }
            }
        };

        if (!this.isSegmentedLanguageControlEnabled) {
            this.segmentedLanguageControl.disable();
        }
    }

    /**
        Show a specific function if one is defined.
        @method updateShownFunction
        @return {void}
    */
    updateShownFunction() {
        if ((this.currentlyShownFunctionIndex !== null) && this.$functionContainers && !this.isCodeCurrentlyShown()) {
            this.$functionContainers.hide().eq(this.currentlyShownFunctionIndex).show();
        }
    }

    /**
        Set the index of the function to show.
        @method setFunctionIndexToShow
        @param {Integer} index The index of the function to show.
        @return {void}
    */
    setFunctionIndexToShow(index) {
        this.currentlyShownFunctionIndex = index;
        this.updateShownFunction();
        this.focusCursorOnOutputIfOutputIsEditable();
    }

    /**
        Focus the cursor on the output if the output is editable.
        @method focusCursorOnOutputIfOutputIsEditable
        @return {Boolean} Whether the output was editable.
    */
    focusCursorOnOutputIfOutputIsEditable() {
        if (this.isOutputEditable) {
            const functionIndexToFocus = this.isCodeCurrentlyShown() ? 0 : this.currentlyShownFunctionIndex;

            this.$functionContainers.eq(functionIndexToFocus).find('.console').focus();
        }

        return this.isOutputEditable;
    }

    /**
        Enter the execution.
        @method enterExecution
        @return {Boolean} Whether the execution was able to be entered.
    */
    enterExecution() {
        const hadNoError = !this.hadErrorCompiling();

        if (hadNoError) {
            this.isInExecuteMode = true;
            this.isPseudocodeCurrentlyEditable = false;
            this.isSegmentedFunctionControlEnabled = false;
            this.executor.enterExecution();
            this.getTopOfStack().node.isNextToExecute = true;
            this.currentlyShownFunctionIndex = 0;
        }
        this.render();

        return hadNoError;
    }

    /**
        Exit the execution.
        @method exitExecution
        @return {void}
    */
    exitExecution() {
        this.isInExecuteMode = false;
        this.isPseudocodeCurrentlyEditable = this.isPseudocodeEditable;
        this.isSegmentedFunctionControlEnabled = true;
        this.lastFunctionOnStack = null;
        this.executor.exitExecution();
        this.render();
    }

    /**
        Start the execution from the beginning.
        @method restartExecution
        @return {void}
    */
    restartExecution() {
        this.exitExecution();
        this.enterExecution();
    }

    /**
        Execute the next node.
        @method executeOnce
        @param {Boolean} [doNotRerender=false] Do not re-render the program.
        @return {void}
    */
    executeOnce(doNotRerender = false) {
        this.previousNodeExecuted = this.getTopOfStack().node;
        this.previousNodeExecuted.isNextToExecute = false;
        this.lastFunctionOnStack = this.executor.execute() || this.lastFunctionOnStack;

        if (this.isExecutionDone()) {
            this.currentlyShownFunctionIndex = 0;
        }

        // If there is a next node, then mark it as such.
        else {
            const topOfStack = this.getTopOfStack();
            const functionNames = this.executor.program.functions.map(programFunction => programFunction.name);

            topOfStack.node.isNextToExecute = true;
            this.currentlyShownFunctionIndex = functionNames.indexOf(topOfStack.function.name);
        }

        if (!doNotRerender) {
            this.render();
        }
    }

    /**
        Return whether there was an error compiling the pseudocode.
        @method hadErrorCompiling
        @return {Boolean} Whether there was an error compiling the pseudocode.
    */
    hadErrorCompiling() {
        const updatedCode = this.getPseudocode();

        // Update the restricted code if applicable to keep the executor's code and restricted code in sync.
        if (this.isPseudocodeEditingRestricted) {
            const firstIndexOfPlaceholder = this.restrictedCode.pre.length;
            const firstIndexOfPost = updatedCode.length - this.restrictedCode.post.length;

            this.restrictedCode.placeholder = updatedCode.substring(firstIndexOfPlaceholder, firstIndexOfPost);
        }

        this.errorMessage = null;
        this.errorLineNumber = null;

        try {
            this.executor.setProgramAndCodeFromCode(updatedCode);
            this.executor.validateInput();
            if (this.portLanguage) {
                this.portedCodeController.programCode = this.executor.program.getPortedCode(this.portLanguage);
            }
        }
        catch (error) {
            if (this.compilationErrorCallback) {
                this.compilationErrorCallback(error.message);
            }

            // Since there's an error, show the error message.
            this.errorMessage = error.message;
            this.errorLineNumber = error.lineNumber;
            return true;
        }

        return false;
    }

    /**
        Return the element at the top of the execution stack.
        @method getTopOfStack
        @return {ExecutionStackElement} The element at the top of the execution stack.
    */
    getTopOfStack() {
        return this.executor.stack[this.executor.stack.length - 1];
    }

    /**
        Get the latest pseudocode.
        @method getPseudocode
        @return {String} The latest pseudocode.
    */
    getPseudocode() {

        // If controllers have been built, then get the code from the controllers. Otherwise, get the code from the executor.
        return this.functionControllers.length ? this.functionControllers[0].getPseudocode() : this.executor.code;
    }

    /**
        Return whether there are any nodes left to execute.
        @method isExecutionDone
        @return {Boolean} Whether there are any nodes left to execute.
    */
    isExecutionDone() {
        return this.executor.isExecutionDone();
    }

    /**
        Set whether to render in compact mode.
        @method setIsCompact
        @param {Boolean} isCompact Whether to use compact mode.
        @param {Number} [maxHeight=null] The max height to set. Required in compact mode.
        @param {Number} [maxWidth=null] The max width to set. Required in compact mode.
        @return {void}
    */
    setIsCompact(isCompact, maxHeight = null, maxWidth = null) {
        this.isCompact = isCompact;
        this.showFunctionName = !isCompact;
        this.maxHeight = maxHeight;
        this.maxWidth = maxWidth;
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
        Return whether the pseudocode is included in the executor.
        @method isPseudocodeIncluded
        @return {Boolean} Whether the pseudocode is included in the executor.
    */
    isPseudocodeIncluded() {
        return [ 'pseudocode', 'both' ].includes(this.languagesToShow);
    }

    /**
        Set the value of |this.languagesToShow|.
        @method setLanguagesToShow
        @param {String} languagesToShow The value to set.
        @param {String} portLanguage The language to port Coral to.
        @return {void}
    */
    setLanguagesToShow(languagesToShow, portLanguage) {
        this.languagesToShow = languagesToShow;
        this.portLanguage = portLanguage;

        const isPseudocodeIncluded = this.isPseudocodeIncluded();

        this.selectedSegmentedControlIndex = isPseudocodeIncluded ? 0 : this.selectedSegmentedControlIndex;

        // Make a reference to a PseudocodeController that will be used for this executor.
        if (isPseudocodeIncluded && !this.pseudocodeController) {
            this.pseudocodeController = new PseudocodeController(this.executor.code);
        }

        const languagesMap = {
            both: [ 'Code', 'Flowchart' ],
            flowchart: [ 'Flowchart' ],
            pseudocode: [ 'Code' ],
        };

        this.segmentedControlLanguages = languagesMap[languagesToShow];
        if (portLanguage) {
            this.segmentedControlLanguages.push(portLanguage);

            // Make a reference to a PortedCodeController that will be used for this executor.
            const code = this.executor.program.getPortedCode(portLanguage);

            this.portedCodeController = new PortedCodeController(code, portLanguage);
        }
    }

    /**
        Set whether the pseudocode should be editable.
        @method setIsPseudocodeEditable
        @param {Boolean} isPseudocodeEditable Whether the pseudocode should be editable.
        @return {void}
    */
    setIsPseudocodeEditable(isPseudocodeEditable) {
        this.isPseudocodeEditable = isPseudocodeEditable;
        this.isPseudocodeCurrentlyEditable = this.isPseudocodeEditable && !this.isInExecuteMode;
        this.functionControllers.forEach(controller => controller.setIsPseudocodeEditable(this.isPseudocodeCurrentlyEditable));
    }

    /**
        Set whether the pseudocode editing should be restricted.
        @method setIsPseudocodeEditingRestricted
        @param {Boolean} isPseudocodeEditingRestricted Whether the pseudocode editing should be restricted.
        @param {String} [pre=null] The uneditable code before the placeholder code.
        @param {String} [placeholder=null] The editable code.
        @param {String} [post=null] The uneditable code after the placeholder code.
        @return {void}
    */
    setIsPseudocodeEditingRestricted(isPseudocodeEditingRestricted, pre = null, placeholder = null, post = null) {
        this.isPseudocodeEditingRestricted = isPseudocodeEditingRestricted;
        this.restrictedCode = isPseudocodeEditingRestricted ? new RestrictedCode(pre, placeholder, post) : null;

        if (this.restrictedCode) {
            try {
                this.executor.setProgramAndCodeFromCode(pre + placeholder + post);
            }
            catch (error) {
                $.noop();
            }
        }
    }

    /**
        Set whether to make the segmented language control enabled.
        @method setIsSegmentedLanguageControlEnabled
        @param {Boolean} isSegmentedLanguageControlEnabled Whether to make the segmented language control enabled.
        @return {void}
    */
    setIsSegmentedLanguageControlEnabled(isSegmentedLanguageControlEnabled) {
        this.isSegmentedLanguageControlEnabled = isSegmentedLanguageControlEnabled;

        // Update the segmented control if it exists.
        if (this.segmentedLanguageControl) {
            if (isSegmentedLanguageControlEnabled) {
                this.segmentedLanguageControl.enable();
            }
            else {
                this.segmentedLanguageControl.disable();
            }
        }
    }

    /**
        Set the function to call when a compilation error occurs.
        @method setCompilationErrorCallback
        @param {Function} compilationErrorCallback The function to call when a compilation error occurs.
        @return {void}
    */
    setCompilationErrorCallback(compilationErrorCallback) {
        this.compilationErrorCallback = compilationErrorCallback;
    }

    /**
        Set the function to call when the code changes.
        @method setCodeChangeCallback
        @param {Function} codeChangeCallback The function to call when the code changes.
        @return {void}
    */
    setCodeChangeCallback(codeChangeCallback) {
        if (this.pseudocodeController) {
            this.pseudocodeController.setCodeChangeCallback(codeChangeCallback);
        }
    }

    /**
        Set the current pseudocode controller's code.
        @method setPseudocode
        @param {String} code The code to set.
        @return {void}
    */
    setPseudocode(code) {
        if (this.pseudocodeController) {
            this.pseudocodeController.setPseudocode(code);
        }
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
        Put the browser's focus on the currently shown function.
        @method focusOnFunction
        @return {void}
    */
    focusOnFunction() {
        if (this.functionControllers.length) {
            const indexToFocus = this.isCodeCurrentlyShown() ? 0 : this.currentlyShownFunctionIndex;

            this.functionControllers[indexToFocus].focus();
        }
    }

    /**
        Get the index of the pseudocode option as stored in segmentedControlLanguages.
        @method getPseudocodeLanguageIndex
        @return {Integer} The index of the pseudocode option.
    */
    getPseudocodeLanguageIndex() {
        return this.segmentedControlLanguages.indexOf('Code');
    }

    /**
        Return whether the pseudocode is currently shown.
        @method isPseudocodeCurrentlyShown
        @return {Boolean} Whether the pseudocode is currently shown.
    */
    isPseudocodeCurrentlyShown() {
        return this.getPseudocodeLanguageIndex() === this.selectedSegmentedControlIndex;
    }

    /**
        Return whether the ported code is currently shown.
        @method isPortedCodeCurrentlyShown
        @return {Boolean} Whether the ported code is currently shown.
    */
    isPortedCodeCurrentlyShown() {
        return this.segmentedControlLanguages.indexOf(this.portLanguage) === this.selectedSegmentedControlIndex;
    }

    /**
        Return whether pseudocode or ported code is currently shown.
        @method isCodeCurrentlyShown
        @return {Boolean} Whether pseudocode or ported code is currently shown.
    */
    isCodeCurrentlyShown() {
        return this.isPseudocodeCurrentlyShown() || this.isPortedCodeCurrentlyShown();
    }
}
