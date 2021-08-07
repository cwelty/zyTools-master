'use strict';

/* exported buildStoreWordInstructionPrototype */
/* global DataTransferFormatInstruction, makeCommentForStoreInstruction */

/**
    Instruction to store a word to memory.
    @class StoreWordInstruction
    @extends BranchLabelFormatInstruction
*/
function StoreWordInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to StoreWordInstruction.
    @method buildStoreWordInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildStoreWordInstructionPrototype(instructionSetSDK) {
    StoreWordInstruction.prototype = new DataTransferFormatInstruction();
    StoreWordInstruction.prototype.constructor = StoreWordInstruction;
    StoreWordInstruction.prototype.opcode = 'STURW';

    /**
        Store a word to memory.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    StoreWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().storeWord(
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
    StoreWordInstruction.prototype.toComment = function(registers) {
        return makeCommentForStoreInstruction(this._properties, registers);
    };
}
