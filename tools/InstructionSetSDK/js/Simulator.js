'use strict';

/* exported buildSimulatorPrototype */
/* global InstructionSetSDKError */

/**
    Simulator stores |mapAssemblyAndMachine|, |registers|, |memory|, and a |programCounter|.
    @class Simulator
    @constructor
    @param {MapAssemblyAndMachineInstructions} mapAssemblyAndMachine The assembly and machine instructions to use during simulation.
    @param {Registers} registers The registers to use during simulation.
    @param {Memory} memory The memory to use during simulation.
*/
function Simulator(mapAssemblyAndMachine, registers, memory) {
    this.mapAssemblyAndMachine = mapAssemblyAndMachine;
    this.registers = registers;
    this.memory = memory;
    this.programCounter = 0;

    // Object to store simulator information used for execution.
    this.simulatorContext = {};

    // Default values for integer input component support.
    this.integerInputComponentCallback = null;

    // Default value for integer output component support.
    this.integerOutputComponentCallback = null;

    // Do not call the function during inheritance.
    if (mapAssemblyAndMachine) {
        mapAssemblyAndMachine.machine.setLabels(mapAssemblyAndMachine.machineLabels);
    }
}

/**
    Build the {Simulation} prototype.
    @method buildSimulatorPrototype
    @return {void}
*/
function buildSimulatorPrototype() {

    /*
        Run the simulator until |programCounter|'s value exceeds the number of |instructions|.
        |maxNumberOfInstructionsToRun| is optional and a number.
    */
    Simulator.prototype.run = function(maxNumberOfInstructionsToRun) {
        this.programCounter = 0;

        let numberOfInstructionsRun = 0;

        while (this.moreInstructionsToExecute()) {
            this.runNextMachineInstruction();

            // Throw an error if |numberOfInstructionsRun| exceeds |maxNumberOfInstructionsToRun|.
            if (maxNumberOfInstructionsToRun && (++numberOfInstructionsRun > maxNumberOfInstructionsToRun)) {
                throw new InstructionSetSDKError('Program end never reached (commonly due to an infinite loop).', 'InfiniteLoop');
            }
        }
    };

    /**
        Run the next machine instruction.
        @method runNextMachineInstruction
        @return {void}
    */
    Simulator.prototype.runNextMachineInstruction = function() {
        try {
            this.programCounter = this.mapAssemblyAndMachine.machine.execute(
                this.registers,
                this.memory,
                this.programCounter,
                this.mapAssemblyAndMachine.machineLabels,
                this.simulatorContext
            );
        }
        catch (error) {
            throw new InstructionSetSDKError(
                `${this.mapAssemblyAndMachine.machine[this.programCounter]}. ${error.message}`,
                'RunTimeError'
            );
        }

        if (this.integerInputComponentCallback) {
            this.integerInputComponentCallback();
        }

        if (this.integerOutputComponentCallback) {
            this.integerOutputComponentCallback();
        }
    };

    /**
        Run the next assembly instruction.
        @method runNextAssemblyInstruction
        @return {void}
    */
    Simulator.prototype.runNextAssemblyInstruction = function() {
        const assemblyInstructionsToRun = this.mapAssemblyAndMachine.machineMapped[this.getAssemblyProgramCounter()];

        assemblyInstructionsToRun.forEach(() => {
            this.runNextMachineInstruction();
        });
    };

    /**
        Return whether there are more instructions to execute.
        @method moreInstructionsToExecute
        @return {Boolean} Whether there are more instructions to execute.
    */
    Simulator.prototype.moreInstructionsToExecute = function() {
        return (this.programCounter < this.mapAssemblyAndMachine.machine.length);
    };

    /**
        Return the program counter in assembly instruction context.
        @method getAssemblyProgramCounter
        @return {Number} The program counter in assembly instruction context.
    */
    Simulator.prototype.getAssemblyProgramCounter = function() {
        return this.mapAssemblyAndMachine.getAssemblyProgramCounter(this.programCounter);
    };

    /**
        Register an integer input component.
        @method registerIntegerInput
        @param {Function} componentCallback Call after each machine instruction execution.
        @return {void}
    */
    Simulator.prototype.registerIntegerInput = function(componentCallback) {
        this.integerInputComponentCallback = componentCallback;
    };

    /**
        Register an integer output component.
        @method registerIntegerOutput
        @param {Function} componentCallback Call after each machine instruction execution.
        @return {void}
    */
    Simulator.prototype.registerIntegerOutput = function(componentCallback) {
        this.integerOutputComponentCallback = componentCallback;
    };
}
