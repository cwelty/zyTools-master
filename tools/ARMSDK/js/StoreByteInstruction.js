'use strict';

/* exported buildStoreByteInstructionPrototype */
/* global DataTransferFormatInstruction, makeCommentForStoreInstruction */

/**
    Instruction to store a byte to memory.
    @class StoreByteInstruction
    @extends BranchLabelFormatInstruction
*/
function StoreByteInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to StoreByteInstruction.
    @method buildStoreByteInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildStoreByteInstructionPrototype(instructionSetSDK) {
    StoreByteInstruction.prototype = new DataTransferFormatInstruction();
    StoreByteInstruction.prototype.constructor = StoreByteInstruction;
    StoreByteInstruction.prototype.opcode = 'STURB';

    /**
        Store a byte to memory.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    StoreByteInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().storeByte(
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
    StoreByteInstruction.prototype.toComment = function(registers) {
        return makeCommentForStoreInstruction(this._properties, registers);
    };
}
