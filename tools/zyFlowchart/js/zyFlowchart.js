'use strict';

/**
    Models and components used for flowcharts.
    @module zyFlowchart
    @return {void}
*/
class zyFlowchart {

    /**
        @constructor
    */
    constructor() {
        <%= grunt.file.read(hbs_output) %>

        /**
            The handlebars template functions.
            @property templates
            @type {Object}
        */
        this.templates = this['<%= grunt.option("tool") %>'];

        /**
            The CSS styles of the SDK.
            @property style
            @type {String}
        */
        this.css = '<style><%= grunt.file.read(css_filename) %></style>';

        /**
            The unique ID assigned to this module.
            @property id
            @type {String}
            @default null
        */
        this.id = null;

        /**
            The executor controller for the flowchart program.
            @property executorController
            @type {ExecutorController}
            @default null
        */
        this.executorController = null;

        /**
            The unique ID for the timer interval used for running the execution.
            @property runTimerIntervalID
            @type {Integer}
            @default null
        */
        this.runTimerIntervalID = null;

        /**
            The number of milliseconds to wait between executions.
            @property executionTime
            @type {Integer}
        */
        this.executionTime = null;

        /**
            Dictionary of functions to access resources and submit activity.
            @property parentResource
            @type {Object}
            @default null
        */
        this.parentResource = null;

        /**
            The run speeds in seconds by name. Ex: Slowest executes an instruction every 3 seconds.
            @property runSpeedsByName
            @type {Object}
        */
        this.runSpeedsByName = {
            Slow: 2,
            Medium: 1,
            Fast: 0.5,
            Instant: 0,
        };

        /**
            Whether to provide an accessible and interactive experience.
            @property needsAccessibleAndInteractive
            @type {Boolean}
            @default false
        */
        this.needsAccessibleAndInteractive = false;
    }

    /**
        Initialize the zyFlowchart program.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    init(id, parentResource, options) { // eslint-disable-line complexity
        this.id = id;
        this.parentResource = parentResource;
        this.needsAccessibleAndInteractive = parentResource.needsAccessibleAndInteractive();

        // Process the options.
        const code = require('utilities').unescapeHTML((options && options.code) || '');
        const isPseudocodeEditable = options && options.isEditable;
        const isExecutable = options && options.isExecutable;
        const input = options && options.input;
        const languagesToShow = (options && options.languagesToShow) || 'flowchart';
        const portLanguage = options && options.portLanguage;
        const $tool = $(`#${id}`);

        // If compileOnInit is undefined, default to true, otherwise use passed value.
        const compileOption = options ? options.compileOnInit : false;
        const compileOnInit = compileOption === undefined ? true : compileOption; // eslint-disable-line no-undefined

        // The author provided input but not executable, which is an unsupported case.
        if (!isExecutable && input) {
            $tool.text('input option is set, but isExecutable is not');
            return;
        }

        // The author provided a port language but not pseudocode, which is an unsupported case.
        if (portLanguage && languagesToShow === 'flowchart') {
            $tool.text('languagesToShow option is flowchart, but should be either both or pseudocode');
            return;
        }

        // Verify provided Coral is syntactically correct.
        let executor = null;
        const zyFlowchartSDK = require('zyFlowchartSDK').create();

        try {
            executor = zyFlowchartSDK.makeExecutor(code, input, isExecutable, compileOnInit);
        }
        catch (error) {
            $tool.text(error);
            return;
        }

        const css = this.css + zyFlowchartSDK.css;

        $tool.addClass('zyFlowchartSDK');

        // In accessible mode, show the code, input, and output (if executable).
        if (parentResource.needsAccessible() && !this.needsAccessibleAndInteractive) {
            let output = null;
            let errorMessage = null;

            if (isExecutable) {
                executor.enterExecution();

                try {

                    // Execute until program done.
                    while (!executor.isExecutionDone()) {
                        executor.execute();
                    }
                }
                catch (error) {
                    errorMessage = error;
                }

                if (!errorMessage) {
                    output = executor.output.output;
                }
            }

            // Get the ported code.
            let portedCode = '';

            if (portLanguage) {
                try {
                    portedCode = executor.program.getPortedCode(portLanguage);
                }
                catch (error) {
                    $tool.text(error);
                    return;
                }
            }

            const html = this.templates.accessibleZyFlowchart({ code, errorMessage, input, output, portLanguage, portedCode });

            $tool.html(html + css);
            $tool.addClass('accessible-view');
        }
        else {
            const html = this.templates.zyFlowchart({
                id,
                isExecutable,
                runSpeedNames: Object.keys(this.runSpeedsByName),
            });

            $tool.html(html + css);

            this.executorController = zyFlowchartSDK.makeExecutorController(executor, this.lookByClass('program-container'));
            this.executorController.setNeedsAccessibleAndInteractive(this.needsAccessibleAndInteractive);
            this.executorController.setLanguagesToShow(languagesToShow, portLanguage);
            this.executorController.setIsPseudocodeEditable(isPseudocodeEditable);
            this.executorController.setCompilationErrorCallback(errorMessage => {
                this.parentResource.postEvent({
                    answer: this.executorController.getPseudocode(),
                    complete: false,
                    part: 0,
                    metadata: {
                        errorMessage,
                    },
                });
            });
            this.executorController.setCodeChangeCallback(userCode => {
                if (this.parentResource.setUserAnswer) {
                    this.parentResource.setUserAnswer(userCode);
                }
            });
            this.isFullscreenEnabled(false);
            this.addEventListeners();
            this.initialControlButtons();

            const defaultSpeedName = 'Medium';

            this.lookByClass('run-speed').val(defaultSpeedName);
            this.setExecutionTime(defaultSpeedName);
        }
    }

    /**
        Report changes made to user's answer.
        @method receiveUserAnswerOnLoad
        @param {String} answer The code received from parent component.
        @return {void}
    */
    receiveUserAnswerOnLoad(answer) {

        // Set code only if we have a executor controller and pseudocode is editable.
        if (this.executorController && this.executorController.isPseudocodeEditable) {

            // Switch to pseudocode if necessary.
            if (!this.executorController.isPseudocodeCurrentlyShown()) {
                const index = this.executorController.getPseudocodeLanguageIndex();

                this.executorController.segmentedLanguageControl.selectSegmentByIndex(index);
            }

            this.exitExecution();
            this.executorController.setPseudocode(answer);
        }
    }

    /**
        Return a jQuery reference with the step and run buttons.
        @method stepAndRunButtons
        @return {Object} jQuery reference with the step and run buttons.
    */
    stepAndRunButtons() {
        return this.lookByClass('step').add(this.lookByClass('run'));
    }

    /**
        Show the enter execution, step, and run. Disable step and run.
        @method initialControlButtons
        @return {void}
    */
    initialControlButtons() {
        this.lookByClass('enter-execution').add(this.lookByClass('step')).add(this.lookByClass('run')).show();
        this.lookByClass('exit-execution').add(this.lookByClass('start-again')).add(this.lookByClass('pause')).hide();
        this.stepAndRunButtons().attr('disabled', true);
    }

    /**
        Exit execution.
        Abstracted out of event listener for use in `exitSimulationOnSubmit` and `receiveUserAnswerOnLoad`.
        @method exitExecution
        @return {void}
    */
    exitExecution() {
        window.clearTimeout(this.runTimerIntervalID);
        this.initialControlButtons();
        this.executorController.exitExecution();
    }

    /**
        Alias of `exitExecution`, in order to keep name the same across all tools.
        Called by parent component.
        @method exitSimulationOnSubmit
        @return {void}
    */
    exitSimulationOnSubmit() {
        this.exitExecution();
    }

    /**
        Create the event listeners.
        @method addEventListeners
        @return {void}
    */
    addEventListeners() {
        this.lookByClass('enter-execution').click(() => {
            this.recordEvent('selected enter execution');

            if (this.executorController.enterExecution()) {
                this.clearErrorMessage();
                this.lookByClass('enter-execution').hide();
                this.lookByClass('exit-execution').show();
                this.stepAndRunButtons().attr('disabled', false);
            }
        });

        this.lookByClass('exit-execution').click(() => {
            this.recordEvent('selected exit execution');
            this.exitExecution();
        });

        this.lookByClass('start-again').click(() => {
            this.recordEvent('selected start again');
            this.lookByClass('exit-execution').click();
            this.lookByClass('enter-execution').click();
        });

        this.lookByClass('step').click(() => {
            this.recordEvent('selected step');
            this.stepAndRunButtons().attr('disabled', true);
            this.runTimerIntervalID = window.setTimeout(() => {
                if (this.didExecuteOnce()) {
                    if (this.executorController.isExecutionDone()) {
                        this.recordEvent('finished execution', true);
                        this.stepAndRunButtons().hide();
                        this.lookByClass('start-again').show();
                    }
                    else {
                        this.stepAndRunButtons().attr('disabled', false);
                    }
                }
            }, this.executionTime);
        });

        this.lookByClass('run').click(() => {
            this.recordEvent('selected run');
            this.lookByClass('run').hide();
            this.lookByClass('step').attr('disabled', true);
            this.lookByClass('pause').show();
            this.startRunning();
        });

        this.lookByClass('pause').click(() => {
            this.recordEvent('selected pause');
            window.clearTimeout(this.runTimerIntervalID);
            this.lookByClass('run').show();
            this.lookByClass('step').attr('disabled', false);
            this.lookByClass('pause').hide();

            // Instant execution doesn't render, so force since we're pausing, we need to render the current state.
            if (this.executionTime === 0) {
                this.executorController.render();
            }
        });

        this.lookByClass('run-speed').change(event => {
            this.recordEvent(`changed speed: ${event.currentTarget.value}`);
            this.setExecutionTime(event.currentTarget.value);
        });
    }

    /**
        Start running execution.
        @method startRunning
        @return {void}
    */
    startRunning() {

        // Instant speed should skip the rendering and instead just wait 1 ms before executing again.
        if (this.executionTime === 0) {
            this.runTimerIntervalID = window.setTimeout(() => {
                if (this.didExecuteOnce(true)) {
                    if (this.executorController.isExecutionDone()) {
                        this.executorController.render();
                    }
                    this.handlePostExecutionDuringRunning();
                }
            }, 1);
        }
        else {
            this.runTimerIntervalID = window.setTimeout(() => {
                if (this.didExecuteOnce()) {
                    this.handlePostExecutionDuringRunning();
                }
            }, this.executionTime);
        }
    }

    /**
        During running, handle what happens after an execution.
        @method handlePostExecutionDuringRunning
        @return {void}
    */
    handlePostExecutionDuringRunning() {
        if (this.executorController.isExecutionDone()) {
            this.recordEvent('finished execution', true);
            this.stepAndRunButtons().add(this.lookByClass('pause')).hide();
            this.lookByClass('start-again').show();
            window.clearTimeout(this.runTimerIntervalID);
        }
        else {
            this.startRunning();
        }
    }

    /**
        Set the execution time based on a speed.
        @method setExecutionTime
        @param {String} speed The speed at which to set the execution time.
        @return {void}
    */
    setExecutionTime(speed) {
        this.executionTime = this.runSpeedsByName[speed] * 1000; // eslint-disable-line no-magic-numbers
    }

    /**
        Display an error message.
        @method displayErrorMessage
        @param {String} message The error message to display.
        @return {void}
    */
    displayErrorMessage(message) {
        this.lookByClass('error-message').text(message);
    }

    /**
        Clear the error message.
        @method clearErrorMessage
        @return {void}
    */
    clearErrorMessage() {
        this.lookByClass('error-message').text('');
    }

    /**
        Return whether the execute once was successful.
        @method didExecuteOnce
        @param {Boolean} [doNotRerender=false] Do not re-render the program.
        @return {Boolean} Whether the execute once was successful.
    */
    didExecuteOnce(doNotRerender = false) {
        let hadError = false;

        try {
            this.executorController.executeOnce(doNotRerender);
        }
        catch (error) {
            hadError = true;
            this.recordEvent('had error during execution', true);
            this.displayErrorMessage(error.message);
            this.lookByClass('exit-execution').click();
        }

        return !hadError;
    }

    /**
        Return a jQuery reference to the element with the given class name.
        @method lookByClass
        @param {String} className The name of the class to look up.
        @return {Object} A jQuery reference to the element with the given class name.
    */
    lookByClass(className) {
        return $(`#${this.id} .${className}`);
    }

    /**
        Record an event of the given type.
        @method recordEvent
        @param {String} type The type of event.
        @param {Boolean} [complete=false] Whether the user finished the activity.
        @return {void}
    */
    recordEvent(type, complete = false) {
        this.parentResource.postEvent({
            answer: this.executorController.getPseudocode(),
            complete,
            part: 0,
            metadata: {
                type,
            },
        });
    }

    /**
        Inform as to whether the fullscreen is enabled.
        @method isFullscreenEnabled
        @param {Boolean} isFullscreenEnabled Whether the fullscreen is enabled.
        @return {void}
    */
    isFullscreenEnabled(isFullscreenEnabled) {
        let maxExecutorHeight = 550;
        const minExecutorWidth = 870;
        const $tool = $(`#${this.id}`);
        const maxExecutorWidth = Math.max($tool.width(), minExecutorWidth);

        if (isFullscreenEnabled) {
            const toolHeight = $tool.height();
            const controlsHeight = this.lookByClass('controls-container').outerHeight(true);

            maxExecutorHeight = Math.max(toolHeight - controlsHeight, maxExecutorHeight);
        }

        this.executorController.setIsCompact(true, maxExecutorHeight, maxExecutorWidth);
        this.executorController.render();
    }
}

module.exports = {
    create: function() {
        return new zyFlowchart(); // eslint-disable-line new-cap
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {

        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
    allowFullscreen: true,
};
