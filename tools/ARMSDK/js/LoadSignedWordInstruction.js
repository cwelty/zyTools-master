'use strict';

/* exported buildLoadSignedWordInstructionPrototype */
/* global DataTransferFormatInstruction, makeCommentForLoadInstruction */

/**
    Instruction to load a signed word from memory.
    @class LoadSignedWordInstruction
    @extends BranchLabelFormatInstruction
*/
function LoadSignedWordInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadSignedWordInstruction.
    @method buildLoadSignedWordInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildLoadSignedWordInstructionPrototype(instructionSetSDK) {
    LoadSignedWordInstruction.prototype = new DataTransferFormatInstruction();
    LoadSignedWordInstruction.prototype.constructor = LoadSignedWordInstruction;
    LoadSignedWordInstruction.prototype.opcode = 'LDURSW';

    /**
        Move a signed word from memory.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    LoadSignedWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadSignedWord(
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
    LoadSignedWordInstruction.prototype.toComment = function(registers) {
        return makeCommentForLoadInstruction(this._properties, registers);
    };
}
