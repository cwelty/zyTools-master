'use strict';

/* exported buildSubtractImmediateAndSetFlagsInstructionPrototype */
/* global SubtractImmediateInstruction, updateConditionalFlagsForSubtraction */

/**
    Instruction to SUB with an immediate value, and set conditional flags.
    @class SubtractImmediateAndSetFlagsInstruction
    @extends SubtractImmediateInstruction
*/
function SubtractImmediateAndSetFlagsInstruction() {
    SubtractImmediateInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit SubtractImmediateInstruction and attach prototype functions to SubtractImmediateAndSetFlagsInstruction.
    @method buildSubtractImmediateAndSetFlagsInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildSubtractImmediateAndSetFlagsInstructionPrototype(instructionSetSDK) {
    SubtractImmediateAndSetFlagsInstruction.prototype = new SubtractImmediateInstruction();
    SubtractImmediateAndSetFlagsInstruction.prototype.constructor = SubtractImmediateAndSetFlagsInstruction;
    SubtractImmediateAndSetFlagsInstruction.prototype.opcode = 'SUBIS';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @param {Labels} labels The labels of the program on which to execute.
        @param {Object} simulatorContext Miscellaneous context information on the simulation.
        @return {Number} The program counter after execution.
    */
    SubtractImmediateAndSetFlagsInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        const updatedProgramCounter = SubtractImmediateInstruction.prototype.execute.call(this, registers, memory, programCounter);
        const registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(registers,
            [ this._properties[1] ]
        );
        const firstValue = registerBaseWords[0].getLong();
        const secondValue = window.dcodeIO.Long.fromValue(this._properties[2]);

        updateConditionalFlagsForSubtraction(firstValue, secondValue, simulatorContext);

        return updatedProgramCounter;
    };
}
