'use strict';

/* global Ember, CodeEditorController, MachineCodeEditorController, IntegerInputComponentController, IntegerOutputComponentController
   convertImportCSVStringToArray, convertStorageToCSV, ARMTokenTypes, MIPSTokenTypes */

/**
    Render instruction set editor (code, registers, and memory) and methods to simulate.
    @module InstructionSetSimulator
    @return {void}
*/
function InstructionSetSimulator() {

    <%= grunt.file.read(hbs_output) %>

    /**
        The moduleName of the module.
        @type {String}
    */
    var moduleName = '<%= grunt.option("tool") %>';

    /**
        Identifier given to this module by the parent module.
        @type {Number}
        @default null
    */
    var moduleID = null;

    /**
        The SDK for the particular instruction set this instance simulates.
        @type {InstructionSetSDK}
        @default null
    */
    var instructionSetSDK = null;

    /**
        The run speeds in seconds by name. Ex: Slowest executes an instruction every 3 seconds.
        @type {Object}
    */
    const runSpeedsByName = {
        Slow: 3,
        Medium: 2,
        Fast: 1,
        Instant: 0,
    };

    /**
        An instruction set simulator used for running user's code.
        @type {Simulator} from InstructionSetSDK
        @default null
    */
    var simulator = null;

    /**
        Controller for the code editor where the user edits the instruction code.
        @type {CodeEditorController}
        @default null
    */
    var codeEditorController = null;

    /**
        The registers used during simulation.
        @type {Registers} from InstructionSetSDK
        @default null
    */
    var registers = null;

    /**
        Controller that renders the registers.
        @type {RegistersController} from InstructionSetSDK
        @default null
    */
    var registersController = null;

    /**
        The memory used during simulation.
        @type {Memory} from InstructionSetSDK
        @default null
    */
    var memory = null;

    /**
        Controller that renders the memory.
        @type {MemoryController} from InstructionSetSDK
        @default null
    */
    var memoryController = null;

    /**
        Tokenizer to convert the user's code into tokens.
        @type {Tokenizer}
        @default null
    */
    var tokenizer = null;

    /**
        Parser to convert the user's code tokens into assembly instructions and labels.
        @type {Parser}
        @default null
    */
    let parser = null;

    /**
        Timer to manage the intervals between executions.
        @type {RunTimer}
        @default null
    */
    var runTimer = null;

    /**
        Dictionary of functions to access resources and submit activity.
        @type {Object}
        @default null
    */
    var parentResource = null;

    /**
        The interval ID for the instruction execution timers.
        @type {Number}
        @default null
    */
    let executeIntervalID = null;

    /**
        Reference to the DOM element of the running message.
        @type {Object}
        @default null
    */
    let $runningMessage = null;

    /**
        Controller for the code editor where the user can view the machine instructions.
        @type {CodeEditorController}
        @default null
    */
    let machineInstructionEditorController = null;

    /**
        Whether this simulation should show machine instructions.
        @type {Boolean}
        @default false
    */
    let showMachineInstructions = false;

    /**
        A map between assembly and machine instructions.
        @type {MapAssemblyAndMachineInstructions}
        @default null
    */
    let mapAssemblyAndMachine = null;

    /**
        The number of bytes per address. Ex: MIPS has 4 bytes per address.
        @type {Number}
        @default null
    */
    let bytesPrintedPerAddress = null;

    /**
        The starting address of the instruction memory.
        @type {Number}
        @default null
    */
    let instructionMemoryStartAddress = null;

    /**
        The ending address of instruction memory.
        @type {Number}
        @default null
    */
    let instructionMemoryEndAddress = null;

    /**
        The initially imported code, registers, and memory.
        @type {String}
        @default ''
    */
    let initialImport = '';

    /**
        Snapshot of the simulator state.
        @type {String}
        @default ''
    */
    let snapshot = '';

    /**
        Whether the simulation is running.
        @type {Boolean}
        @default false
    */
    let isSimulationRunning = false;

    /**
        Whether to show the integer I/O components.
        @type {Boolean}
        @default false
    */
    let showIntegerIO = false;

    /**
        Whether to show the input/export section.
        @type {Boolean}
        @default true
    */
    let showImportExport = true;

    /**
        The integer input component controller.
        @type {IntegerInputComponentController}
        @default null
    */
    let integerInputComponentController = null;

    /**
        The integer output component controller.
        @type {IntegerOutputComponentController}
        @default null
    */
    let integerOutputComponentController = null;

    /**
        Whether the language is ARM.
        @type {Boolean}
        @default false;
    */
    let isLanguageARM = false;

    /**
        The memory address connected to the integer input's Ready.
        @type {Number}
        @default 8192
    */
    const integerInputReadyMemoryAddress = 8192;

    /**
        The memory address connected to the integer input's Value.
        @type {Number}
        @default 8196
    */
    const integerInputValueMemoryAddress = 8196;

    /**
        The memory address connected to the integer output's Value.
        @type {Number}
        @default 8200
    */
    const integerOutputValueMemoryAddress = 8200;

    /**
        Report changes made to user's answer.
        @method setUserAnswer
        @param {String} answer The user's current code.
        @return {void}
    */
    function setUserAnswer(answer) {
        parentResource.setUserAnswer(answer);
    }

    /**
        Initialize a new memory object.
        @method initializeNewMemory
        @return {void}
    */
    function initializeNewMemory() {
        memory = instructionSetSDK.createMemory();
        if (showIntegerIO) {
            memory.addLabelToAddress('InputReady', integerInputReadyMemoryAddress);
            memory.addLabelToAddress('InputValue', integerInputValueMemoryAddress);
            memory.addLabelToAddress('OutputValue', integerOutputValueMemoryAddress);
        }
    }

    /**
        Lookup a jQuery reference to a DOM element based on a given class name.
        @method lookupByClass
        @param {String} className The name of the class to lookup.
        @return {jQuery} Reference to a DOM element with given class name.
    */
    function lookupByClass(className) {
        return $(`#${moduleID} .${className}`);
    }

    /**
        Return a complete id using the given prefix.
        @method makeID
        @param {String} prefix The prefix to the id.
        @return {String} The complete id.
    */
    function makeID(prefix) {
        return `${prefix}-${moduleID}`;
    }

    /**
        Render and initialize a {InstructionSetSimulator} instance.
        @method init
        @param {String} _moduleID The unique identifier given to module.
        @param {Object} _parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @param {Object} options.import The code, registers, and memory to import.
        @param {String} options.instructionSet Which instruction set to render. Ex: MIPS.
        @param {Boolean} [options.useBlackStorageBorder=false] Whether the storage should have colored borders.
        @param {Boolean} [options.showMachineInstructions=false] Whether to show the machine instruction interface.
        @param {Boolean} [options.showIntegerIO=false] Whether to show the integer I/O components.
        @param {Boolean} [options.showImportExport=true] Whether to show the Import Export section.
        @return {void}
    */
    this.init = function(_moduleID, _parentResource, options) {
        moduleID = _moduleID;
        parentResource = _parentResource;
        isLanguageARM = options.instructionSet === 'ARM';

        switch (options.instructionSet) {
            case 'ARM':
            case 'MIPS':
            case 'MIPSzy':
                instructionSetSDK = require(`${options.instructionSet}SDK`).create();
                break;
            default:
                $(`#${moduleID}`).html('Unsupported instruction set. Please check options.');
                return;
        }

        const tokenTypes = isLanguageARM ? ARMTokenTypes : MIPSTokenTypes;

        tokenizer = new Tokenizer(tokenTypes);

        initialImport = options.import.replace(/\n/g, '\\n');
        showMachineInstructions = options.showMachineInstructions || false;
        showIntegerIO = options.showIntegerIO || false;
        parser = new Parser(instructionSetSDK);

        // If options.showImportExport is undefined, this.showImportExport defaults to true.
        const showImportExportOption = options ? options.showImportExport : false;
        showImportExport = showImportExportOption === undefined ? true : showImportExportOption; // eslint-disable-line no-undefined

        const css = `<style><%= grunt.file.read(css_filename) %></style>${instructionSetSDK.css}`;

        // In accessible mode, show the initial assembly, registers, and memory.
        if (parentResource.needsAccessible && parentResource.needsAccessible()) {
            const importJSON = JSON.parse(initialImport);
            const assembly = importJSON.code || '';
            const registersString = importJSON.registers || '';
            const memoryString = importJSON.memory || '';
            const registers = convertImportCSVStringToArray(registersString);
            const memory = convertImportCSVStringToArray(memoryString);
            let machineInstructions = null;
            let integerInput = null;

            if (showMachineInstructions) {
                const tokens = tokenizer.tokenize(assembly);
                const parseResult = parser.parse(tokens);

                mapAssemblyAndMachine = instructionSetSDK.createMapAssemblyAndMachineInstructions(
                    parseResult.instructions,
                    parseResult.labels
                );
                machineInstructions = mapAssemblyAndMachine.makeMachineText(instructionMemoryStartAddress);
            }

            if (showIntegerIO) {
                const integerInputString = importJSON.integerInput || '';
                const integerInputComponent = new IntegerInputComponent(integerInputString);

                integerInput = integerInputComponent.inputs.join(', ');
            }

            const html = this[moduleName].InstructionSetSimulatorAccessible({
                assembly,
                registers,
                memory,
                machineInstructions,
                integerInput,
            });

            $(`#${moduleID}`).html(css + html);
            return;
        }

        const defaultRunSpeed = 'Medium';

        runTimer = new RunTimer(executeNextInstruction, runSpeedsByName[defaultRunSpeed]);
        bytesPrintedPerAddress = instructionSetSDK.createMemory().bytesPrintedPerAddress;

        // Rendering of both machine instructions and integer IO not supported.
        if (showMachineInstructions && showIntegerIO) {
            $(`#${moduleID}`).text('Simultaneously showing both machine instructions and number I/O components not supported.');
            return;
        }

        const useBlackStorageBorder = options.useBlackStorageBorder || false;

        const registersAndMemoryHTML = instructionSetSDK.developmentEnvironmentTemplate({
            instructionsID: '',
            memoryID: makeID('memory'),
            registersID: makeID('registers'),
            showInstructions: false,
            showMemory: true,
            showRegisters: true,
            useBlackStorageBorder,
        });

        const html = this[moduleName].InstructionSetSimulator({ // eslint-disable-line new-cap
            'arrow-down-URL': parentResource.getResourceURL('arrow-down-blue.png', moduleName),
            id: moduleID,
            registersAndMemoryHTML,
            runSpeeds: Object.keys(runSpeedsByName),
            showMachineInstructions,
            showIntegerIO,
            showImportExport,
        });

        $(`#${moduleID}`).html(css + html);

        // Set which running message to use: Either machine instruction's or assembly's running message.
        if (showMachineInstructions) {
            $runningMessage = lookupByClass('machine-running-message');
        }
        else {
            $runningMessage = lookupByClass('assembly-running-message');
        }

        // Initialize viewability of various elements.
        lookupByClass('more-options-container').hide();
        lookupByClass('pause').hide();
        lookupByClass('start-again').hide();
        disableRunningSimulationControls();
        lookupByClass('exit-simulation').hide();
        if (showMachineInstructions) {
            lookupByClass('enter-simulation').attr('disabled', true);
        }

        // Set default run speed.
        lookupByClass('run-speed').val(defaultRunSpeed);

        codeEditorController = new CodeEditorController(
            makeID('assembly-container'),
            options.instructionSet,
            (session, row) => `Line ${row + 1}`,
            setUserAnswer
        );

        registers = instructionSetSDK.createRegisters();
        registersController = instructionSetSDK.createRegistersController(
            instructionSetSDK.createRegisters(),
            makeID('registers'),
            instructionSetSDK.templates
        );
        registersController.enableEditing();

        initializeNewMemory();
        memoryController = instructionSetSDK.createMemoryController(
            memory,
            makeID('memory'),
            instructionSetSDK.templates
        );
        memoryController.enableEditing();

        instructionMemoryStartAddress = memory.instructionStartAddress;
        instructionMemoryEndAddress = memory.instructionEndAddress;

        if (showMachineInstructions) {
            machineInstructionEditorController = new MachineCodeEditorController(
                makeID('machine-container'),
                options.instructionSet,
                (session, row) => `${instructionMemoryStartAddress + (row * bytesPrintedPerAddress)}`
            );
            machineInstructionEditorController.disable();
        }

        if (showIntegerIO) {
            integerInputComponentController = new IntegerInputComponentController(
                lookupByClass('integer-input-container'),
                this[moduleName].IntegerInputComponent
            );

            integerOutputComponentController = new IntegerOutputComponentController(
                lookupByClass('integer-output-container'),
                this[moduleName].IntegerOutputComponent
            );
        }

        try {
            setCodeRegistersMemoryFromString(initialImport);
            codeEditorController.resetUndoHistory();
        }
        catch (error) {
            $(`#${moduleID}`).html(`Error loading import parameter: ${error}`);
            return
        }

        addEventListeners();
    };

    /**
        Method used to stop the simulation.
        Called by parent component.
        @method exitSimulationOnSubmit
        @return {void}
    */
    this.exitSimulationOnSubmit = function() {
        if (snapshot) {
            stopSimulation();
        }
    };

    /**
        Report changes made to user's answer.
        Receive code from parent component, and set editor content to the received code.
        @method receiveUserAnswerOnLoad
        @param {String} answer The code received from parent component.
        @return {void}
    */
    this.receiveUserAnswerOnLoad = function(answer) {

        // Set code only if we have a code editor controller.
        if (codeEditorController) {

            // If tool has run in simulation mode at least once.
            if (snapshot) {
                stopSimulation();
            }

            // If tool hasn't run in simulation mode yet.
            else {
                codeEditorController.enable();
                codeEditorController.focus();

                lookupByClass('enter-simulation').attr('disabled', false);

                if (showMachineInstructions) {
                    lookupByClass('enter-simulation').attr('disabled', true);
                    lookupByClass('assemble').attr('disabled', false);
                    machineInstructionEditorController.clearBreakpoints();
                    machineInstructionEditorController.setText('').setBits('');
                }
            }

            // Set the code in the editor.
            codeEditorController.setCode(answer);
        }
    };

    /**
        Parse user's assembly, then build instructions and simulator.
        @method runAssembler
        @return {Boolean} Whether user's code was successfully assembled.
    */
    function runAssembler() {
        const $console = lookupByClass('compiler-console');

        $console.text('');

        // Parse the user's code.
        let parseResult = null;

        try {
            const tokens = tokenizer.tokenize(codeEditorController.getCode());

            parseResult = parser.parse(tokens);
        }
        catch (error) {
            codeEditorController.handleError(error.lineNumber, error.message);
            $console.text(`Line ${error.lineNumber}: ${error.message}`);
            return false;
        }

        const assembly = parseResult.instructions;

        // Throw error if no assembly entered.
        if (assembly.length === 0) {
            $console.text('Enter assembly to simulate.');
            return false;
        }

        mapAssemblyAndMachine = instructionSetSDK.createMapAssemblyAndMachineInstructions(assembly, parseResult.labels);

        // Make sure there's enough room in instruction memory.
        if (showMachineInstructions && Number.isInteger(instructionMemoryStartAddress) && Number.isInteger(instructionMemoryEndAddress)) {
            const maxAllowedInstructions = (instructionMemoryEndAddress - instructionMemoryStartAddress) / bytesPrintedPerAddress;

            if (mapAssemblyAndMachine.machine.length > maxAllowedInstructions) {
                $console.text('There are more machine instructions than instruction memory can store.');
                return false;
            }
        }

        return true;
    }

    /**
        Update the highlighted line of code for the assembly and machine instructions.
        @method updateHighlightedCode
        @return {void}
    */
    function updateHighlightedCode() {
        if (showMachineInstructions) {
            machineInstructionEditorController.setBreakpoint(simulator.programCounter + 1);
        }

        const assemblyProgramCounter = mapAssemblyAndMachine.getAssemblyProgramCounter(simulator.programCounter);
        const programLineNumber = mapAssemblyAndMachine.assembly[assemblyProgramCounter].lineNumber;

        codeEditorController.setBreakpoint(programLineNumber);
    }

    /**
        Initialize the integer I/O components.
        @method initializeIntegerIO
        @return {void}
    */
    function initializeIntegerIO() {
        try {
            integerInputComponentController.initialize();
            integerOutputComponentController.initialize();
        }
        catch (error) {
            lookupByClass('compiler-console').text(error);
            return false;
        }

        return true;
    }

    /**
        Return a JSON string that stores the code, registers, and memory state.
        @method exportString
        @return {String} The JSON storing the code, registers, and memory state.
    */
    function exportString() {
        const exportJSON = {
            code: codeEditorController.getCode(),
            registers: convertStorageToCSV(registersController),
            memory: convertStorageToCSV(memoryController),
        };

        if (showIntegerIO) {
            exportJSON.integerInput = integerInputComponentController.getInputString();
        }

        return JSON.stringify(exportJSON);
    }

    /**
        Add event listeners to DOM elements.
        @method addEventListeners
        @return {void}
    */
    function addEventListeners() {
        lookupByClass('assemble').click(() => {
            recordEvent('assemble clicked');

            const assemblyWasSuccessful = runAssembler();

            if (assemblyWasSuccessful) {
                lookupByClass('assemble').attr('disabled', true);
                lookupByClass('enter-simulation').attr('disabled', false);
                codeEditorController.disable();

                lookupByClass('export').add(lookupByClass('import')).add(lookupByClass('reset')).attr('disabled', true);

                if (showMachineInstructions) {
                    const machineInstructionText = mapAssemblyAndMachine.makeMachineText(instructionMemoryStartAddress);
                    const machineInstructionBits = mapAssemblyAndMachine.makeMachineBits(instructionMemoryStartAddress);

                    machineInstructionEditorController.setText(machineInstructionText).setBits(machineInstructionBits);
                }
            }
        });

        lookupByClass('enter-simulation').click(() => {
            recordEvent('enter simulation clicked');

            const assemblyWasSuccessful = showMachineInstructions || runAssembler();

            if (assemblyWasSuccessful) {
                const initializeIntegerIOWasSucccesful = !showIntegerIO || initializeIntegerIO();

                if (initializeIntegerIOWasSucccesful) {
                    startSimulation();
                }
            }
        });

        lookupByClass('start-again').click(() => {
            recordEvent('start again clicked');

            makeArrayOfRunningSimulationControls().show();
            lookupByClass('start-again').hide();

            stopSimulation();

            if (showMachineInstructions) {
                lookupByClass('assemble').click();
            }

            lookupByClass('enter-simulation').click();
        });

        lookupByClass('step').click(function() {
            disableRunningSimulationControls();

            executeNextInstruction(1000).then(isSimulationDone => {
                if (!isSimulationDone) {
                    enableRunningSimulationControls();
                }
            });

            recordEvent('step clicked');
        });

        lookupByClass('run').click(function() {
            isSimulationRunning = true;
            lookupByClass('run').hide();
            $runningMessage.show();
            lookupByClass('pause').show();
            lookupByClass('step').attr('disabled', true);
            runTimer.start();
            recordEvent('run clicked');
        });

        lookupByClass('pause').click(function() {
            isSimulationRunning = false;
            stopExecutionTimer();
            recordEvent('pause clicked');

            if (simulator.moreInstructionsToExecute()) {
                registersController.update(registers, true);
                memoryController.update(memory, true);
                updateHighlightedCode();
                lookupByClass('run').show();
                $runningMessage.hide();
                lookupByClass('pause').hide();
                lookupByClass('step').attr('disabled', false);
            }
            else {
                simulationDoneShowEnd();
            }
        });

        lookupByClass('exit-simulation').click(() => {
            stopSimulation();
            recordEvent('exit simulation clicked');
        });

        let moreOptionsShown = false;

        lookupByClass('more-options').click(() => {
            moreOptionsShown = !moreOptionsShown;
            if (moreOptionsShown) {
                lookupByClass('more-options-container').show();
                lookupByClass('arrow').addClass('arrow-up');
            }
            else {
                lookupByClass('more-options-container').hide();
                lookupByClass('arrow').removeClass('arrow-up');
            }
            recordEvent('more options clicked');
        });

        lookupByClass('run-speed').change(function() {
            runTimer.updateWaitTimeInSeconds(runSpeedsByName[this.value]);
            recordEvent(`run speed changed to ${this.value}`);
        });

        lookupByClass('export').click(function() {
            lookupByClass('import-export-area').val(exportString());
            recordEvent('export clicked');
        });

        lookupByClass('import').click(() => {
            recordEvent('import clicked');

            parentResource.showModal(
                'Import will change current code, registers, and memory. OK to import?',
                '',
                {
                    keepOpen: false,
                    label: 'Yes, import',
                    callback: () => {
                        const importString = lookupByClass('import-export-area').val();

                        try {
                            setCodeRegistersMemoryFromString(importString);
                        }
                        catch (error) {
                            alert(error);
                        }

                        recordEvent('import confirmed');
                    },
                },
                {
                    keepOpen: false,
                    label: 'No, do not import',
                }
            );
        });

        lookupByClass('reset').click(() => {
            recordEvent('reset clicked');

            parentResource.showModal(
                'Reset the code, registers, and memory to the initial values?',
                '',
                {
                    keepOpen: false,
                    label: 'Yes, reset',
                    callback: () => {
                        setCodeRegistersMemoryFromString(initialImport);
                        recordEvent('reset confirmed');
                    },
                },
                {
                    keepOpen: false,
                    label: 'No, do not reset',
                }
            );
        });

        // Show a segmented control to toggle between bit and text machine instruction views, if machine instructions are shown.
        if (showMachineInstructions) {
            require('segmentedControl').create().init([ 'Text', 'Bits' ], `bit-text-segmented-control-${moduleID}`, index => {
                if (index === 0) {
                    machineInstructionEditorController.showText();
                }
                else {
                    machineInstructionEditorController.showBits();
                }
            });
        }
    }

    /**
        Execute the integer input component and associated special hardware.
        @method executeIntegerInputComponent
        @return {void}
    */
    function executeIntegerInputComponent() {
        const value = memory.lookupAddress(integerInputValueMemoryAddress);
        const ready = memory.lookupAddress(integerInputReadyMemoryAddress);

        integerInputComponentController.execute(value, ready, memory, integerInputValueMemoryAddress);
    }

    /**
        Execute the integer output component and associated special hardware.
        @method executeIntegerOutputComponent
        @return {void}
    */
    function executeIntegerOutputComponent() {
        const value = memory.lookupAddress(integerOutputValueMemoryAddress);

        // Simulate special hardware that informs the output component when the output's Value is written to.
        if (value.beenWrittenTo()) {
            integerOutputComponentController.execute(value, memory, integerOutputValueMemoryAddress);
        }
    }

    /**
        Enable simulation controls, disable memory/registers/code, and start the simulator.
        @method startSimulation
        @return {void}
    */
    function startSimulation() {

        // Store pre-simulation values via export.
        snapshot = exportString();

        registersController.disableEditing();
        memoryController.disableEditing();
        codeEditorController.disable();
        codeEditorController.setBreakpoint(mapAssemblyAndMachine.assembly[0].lineNumber);

        if (showMachineInstructions) {
            machineInstructionEditorController.setBreakpoint(1);
        }

        lookupByClass('enter-simulation').hide();
        lookupByClass('exit-simulation').show();
        lookupByClass('export').add(lookupByClass('import')).add(lookupByClass('reset')).attr('disabled', true);
        enableRunningSimulationControls();

        simulator = instructionSetSDK.createSimulator(mapAssemblyAndMachine, registers, memory);

        // Register the integer Input and integer Output components if showing integer I/O.
        if (showIntegerIO) {
            integerInputComponentController.disable();

            // Clear access of all addresses, except InputValue as read.
            memory.clearWhichAddressWasAccessed();
            memory.lookupAddress(integerInputValueMemoryAddress).toString();

            // Run the IO components and re-render memory.
            executeIntegerInputComponent();
            executeIntegerOutputComponent();
            memoryController.update(memory, true);

            simulator.registerIntegerInput(() => {
                executeIntegerInputComponent();
            });

            simulator.registerIntegerOutput(() => {
                executeIntegerOutputComponent();
            });
        }
    }

    /**
        Return the controls when simulation is running.
        @method makeArrayOfRunningSimulationControls
        @return {Array} The controls when simulation is running.
    */
    function makeArrayOfRunningSimulationControls() {
        return lookupByClass('step').add(lookupByClass('run')).add(lookupByClass('pause'));
    }

    /**
        Disable the controls when simulation is running.
        @method disableRunningSimulationControls
        @return {void}
    */
    function disableRunningSimulationControls() {
        makeArrayOfRunningSimulationControls().attr('disabled', true);
    }

    /**
        Enable the controls when simulation is running.
        @method enableRunningSimulationControls
        @return {void}
    */
    function enableRunningSimulationControls() {
        makeArrayOfRunningSimulationControls().attr('disabled', false);
    }

    /**
        Clear the execution timer interval.
        @method stopExecutionTimer
        @return {void}
    */
    function stopExecutionTimer() {
        window.clearInterval(executeIntervalID);
    }

    /**
        Set the registers and memory from the given JSON.
        @method setRegistersMemoryFromJSON
        @param {Object} importJSON The JSON from which to set.
        @return {void}
    */
    function setRegistersMemoryFromJSON(importJSON) {
        if (typeof importJSON.registers === 'string') {
            registers = instructionSetSDK.createRegisters();

            if (showMachineInstructions) {
                registers.clearByteAddressesToNotShow();
            }

            try {
                convertImportCSVStringToArray(importJSON.registers).forEach(registerUnit => {
                    const long = window.dcodeIO.Long.fromValue(registerUnit.value);

                    registers.lookupByRegisterName(registerUnit.name).setValueByLong(long);
                });
                registersController.update(registers);
            }
            catch (error) {
                throw new Error('Registers format or naming invalid.');
            }
        }

        if (typeof importJSON.memory === 'string') {
            initializeNewMemory();

            try {
                convertImportCSVStringToArray(importJSON.memory).forEach(memoryUnit => {

                    // Memory unit's name is a number, not string.
                    const name = parseInt(memoryUnit.name, 10);
                    const address = isLanguageARM ? memory.lookupDoubleWord(name) : memory.lookupWord(name);
                    const long = window.dcodeIO.Long.fromValue(memoryUnit.value);

                    address.setValueByLong(long);
                });
                memoryController.update(memory);
            }
            catch (error) {
                throw new Error('Memory format or naming invalid.');
            }
        }
    }

    /**
        Stop the simulation and re-enable the editors.
        @method stopSimulation
        @return {void}
    */
    function stopSimulation() {

        // Revert Registers and Memory to pre-simulation values.
        setRegistersMemoryFromJSON(JSON.parse(snapshot));

        isSimulationRunning = false;

        registersController.enableEditing();
        memoryController.enableEditing();

        codeEditorController.enable();
        codeEditorController.focus();

        if (showMachineInstructions) {
            machineInstructionEditorController.clearBreakpoints();
        }

        stopExecutionTimer();

        $runningMessage.hide();
        lookupByClass('step').show();
        lookupByClass('run').show();
        lookupByClass('pause').hide();
        lookupByClass('exit-simulation').hide();
        lookupByClass('enter-simulation').show();
        lookupByClass('assemble').add(lookupByClass('export'))
                                 .add(lookupByClass('import'))
                                 .add(lookupByClass('reset'))
                                 .attr('disabled', false);
        disableRunningSimulationControls();
        lookupByClass('start-again').hide();

        // Disable when showing machine instructions. Otherwise, enable.
        lookupByClass('enter-simulation').attr('disabled', showMachineInstructions);

        if (showMachineInstructions) {
            machineInstructionEditorController.setText('').setBits('');
        }

        if (showIntegerIO) {
            integerInputComponentController.enable();
        }
    }

    /**
        The simulation is done, show the end button.
        @method simulationDoneShowEnd
        @return {void}
    */
    function simulationDoneShowEnd() {
        disableRunningSimulationControls();
        makeArrayOfRunningSimulationControls().hide();
        lookupByClass('start-again').show();
        $runningMessage.hide();
        codeEditorController.clearBreakpoints();

        if (showMachineInstructions) {
            machineInstructionEditorController.clearBreakpoints();
        }
    }

    /**
        Execute the next instruction in the simulator.
        @method executeNextInstruction
        @param {Number} executionTime The number of milliseconds for the instruction to take to execute.
        @param {Boolean} isRunMode Whether the simulation is in run mode.
        @return {void}
    */
    function executeNextInstruction(executionTime, isRunMode) {
        return new Ember.RSVP.Promise((resolve, reject) => { // eslint-disable-line new-cap

            // Stop running simulation.
            if (isRunMode && !isSimulationRunning) {
                resolve(true);
            }

            // Clear which addresses have been accessed.
            registers.clearWhichAddressWasAccessed();
            memory.clearWhichAddressWasAccessed();

            try {
                if (showMachineInstructions) {
                    simulator.runNextMachineInstruction();
                }
                else {
                    simulator.runNextAssemblyInstruction();
                }
            }
            catch (error) {
                lookupByClass('compiler-console').text(error);
                stopSimulation();
                reject();
                return;
            }

            // Show registers/memory without highlighting.
            registersController.update(registers);
            memoryController.update(memory);

            const isSimulationDone = !simulator.moreInstructionsToExecute();

            if (isSimulationDone) {
                isSimulationRunning = false;
            }

            if (executionTime === 1) {
                executeIntervalID = window.setTimeout(() => {
                    if (isSimulationDone) {
                        simulationDoneShowEnd();
                    }
                    resolve(isSimulationDone);
                });
            }
            else {
                executeIntervalID = window.setTimeout(() => {

                    // Show registers/memory with highlighting.
                    registersController.update(registers, true);
                    memoryController.update(memory, true);

                    executeIntervalID = window.setTimeout(() => {
                        if (isSimulationDone) {
                            simulationDoneShowEnd();
                        }
                        else {
                            updateHighlightedCode();
                        }

                        resolve(isSimulationDone);
                    }, 2 * (executionTime / 3)); // eslint-disable-line no-magic-numbers
                }, (executionTime / 3)); // eslint-disable-line no-magic-numbers
            }
        });
    }

    /**
        Set code, register values, and memory values from a string.
        @method setCodeRegistersMemoryFromString
        @param {String} string The string that contains code and register/memory values.
        @return {void}
    */
    function setCodeRegistersMemoryFromString(string) {
        let importJSON = null;

        try {
            importJSON = JSON.parse(string);
        }
        catch (error) {
            throw new Error('Import string could not be parsed. Perhaps try exporting again.');
        }

        if (typeof importJSON.code === 'string') {
            codeEditorController.setCode(importJSON.code);
        }

        setRegistersMemoryFromJSON(importJSON);

        if (typeof importJSON.integerInput === 'string') {
            integerInputComponentController.setInputString(importJSON.integerInput);
        }
    }

    /**
        Record an event of the given type.
        @method recordEvent
        @param {String} type The type of event.
        @return {void}
    */
    function recordEvent(type) {
        parentResource.postEvent({
            answer: '',
            complete: true,
            part: 0,
            metadata: {
                type,
                userExport: exportString(),
            },
        });
    }
}

module.exports = {
    create: function() {
        return new InstructionSetSimulator();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: () => {

        <%= grunt.file.read(tests) %>
    },
    supportsAccessible: true,
};
