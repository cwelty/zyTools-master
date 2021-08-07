'use strict';

/* exported buildLoadHalfWordInstructionPrototype */
/* global DataTransferFormatInstruction, makeCommentForLoadInstruction */

/**
    Instruction to load a half word from memory.
    @class LoadHalfWordInstruction
    @extends BranchLabelFormatInstruction
*/
function LoadHalfWordInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadHalfWordInstruction.
    @method buildLoadHalfWordInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildLoadHalfWordInstructionPrototype(instructionSetSDK) {
    LoadHalfWordInstruction.prototype = new DataTransferFormatInstruction();
    LoadHalfWordInstruction.prototype.constructor = LoadHalfWordInstruction;
    LoadHalfWordInstruction.prototype.opcode = 'LDURH';

    /**
        Move a half word from memory.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    LoadHalfWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadHalfWordUnsigned(
            registers,
            memory,
            this._properties[0],
            this._properties[2],
            this._properties[1]
        );
        return programCounter + 1;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @param {Registers} registers The registers in the simulator.
        @return {String} A comment explaining this instruction.
    */
    LoadHalfWordInstruction.prototype.toComment = function(registers) {
        return makeCommentForLoadInstruction(this._properties, registers);
    };
}
