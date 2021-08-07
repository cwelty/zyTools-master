'use strict';

/* exported buildARMSimulatorPrototype */

/**
    ARM simulator that stores the conditional flags used during simulation.
    @class ARMSimulator
    @extends InstructionSetSDK.Simulator
*/
function ARMSimulator() {
    this.newSimulator.constructor.apply(this, arguments); // eslint-disable-line

    // Conditional flags.
    this.simulatorContext.negative = 0;
    this.simulatorContext.zero = 0;
    this.simulatorContext.overflow = 0;
    this.simulatorContext.carry = 0;

    this.mapAssemblyAndMachine.machine.setLabels(this.mapAssemblyAndMachine.machineLabels);
}

/**
    Inherit InstructionSetSDK's Simulator and attach prototype functions to ARMSimulator.
    @method buildARMSimulatorPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildARMSimulatorPrototype(instructionSetSDK) {
    ARMSimulator.prototype = instructionSetSDK.inheritSimulator();
    ARMSimulator.prototype.constructor = ARMSimulator;
    ARMSimulator.prototype.newSimulator = instructionSetSDK.inheritSimulator();
}
