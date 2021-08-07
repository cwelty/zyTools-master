'use strict';

/* exported buildSubtractAndSetFlagsInstructionPrototype */
/* global SubtractInstruction, updateConditionalFlagsForSubtraction */

/**
    Instruction to SUBTRACT two registers, and set conditional flags.
    @class SubtractAndSetFlagsInstruction
    @extends SubtractInstruction
*/
function SubtractAndSetFlagsInstruction() {
    SubtractInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit SubtractInstruction and attach prototype functions to SubtractAndSetFlagsInstruction.
    @method buildSubtractAndSetFlagsInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildSubtractAndSetFlagsInstructionPrototype(instructionSetSDK) {
    SubtractAndSetFlagsInstruction.prototype = new SubtractInstruction();
    SubtractAndSetFlagsInstruction.prototype.constructor = SubtractAndSetFlagsInstruction;
    SubtractAndSetFlagsInstruction.prototype.opcode = 'SUBS';

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
    SubtractAndSetFlagsInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        const updatedProgramCounter = SubtractInstruction.prototype.execute.call(this, registers, memory, programCounter);
        const registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(registers,
            [ this._properties[1], this._properties[2] ]
        );
        const firstValue = registerBaseWords[0].getLong();
        const secondValue = registerBaseWords[1].getLong();

        updateConditionalFlagsForSubtraction(firstValue, secondValue, simulatorContext);

        return updatedProgramCounter;
    };
}
