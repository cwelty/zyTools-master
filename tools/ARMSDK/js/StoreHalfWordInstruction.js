'use strict';

/* exported buildStoreHalfWordInstructionPrototype */
/* global DataTransferFormatInstruction, makeCommentForStoreInstruction */

/**
    Instruction to store a half word to memory.
    @class StoreHalfWordInstruction
    @extends BranchLabelFormatInstruction
*/
function StoreHalfWordInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to StoreHalfWordInstruction.
    @method buildStoreHalfWordInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildStoreHalfWordInstructionPrototype(instructionSetSDK) {
    StoreHalfWordInstruction.prototype = new DataTransferFormatInstruction();
    StoreHalfWordInstruction.prototype.constructor = StoreHalfWordInstruction;
    StoreHalfWordInstruction.prototype.opcode = 'STURH';

    /**
        Store a half word to memory.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    StoreHalfWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().storeHalfWord(
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
    StoreHalfWordInstruction.prototype.toComment = function(registers) {
        return makeCommentForStoreInstruction(this._properties, registers);
    };
}
