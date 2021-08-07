'use strict';

/* exported buildMIPSInstructionPrototype */

/**
    Abstract class of MIPS instructions.
    @class MIPSInstruction
    @extends InstructionSetSDK.Instruction
    @constructor
*/
function MIPSInstruction(...args) {
    this.newInstruction.constructor.apply(this, args);
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype function to MIPSInstruction.
    @param {InstructionSetSDK} instructionSetSDK Reference to the InstructionSetSDK.
    @return {void}
*/
function buildMIPSInstructionPrototype(instructionSetSDK) {
    MIPSInstruction.prototype = instructionSetSDK.inheritInstruction();
    MIPSInstruction.prototype.constructor = MIPSInstruction;
    MIPSInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();

    /**
        Change the instruction to use a text-only number instead of an input number.
        Inheriting instructions can modify this as needed.
        @method useTextNotInput
        @return {void}
    */
    MIPSInstruction.prototype.useTextNotInput = function() {}; // eslint-disable-line no-empty-function
}
