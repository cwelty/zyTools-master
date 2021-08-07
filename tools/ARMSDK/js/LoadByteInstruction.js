'use strict';

/* exported buildLoadByteInstructionPrototype */
/* global DataTransferFormatInstruction, makeCommentForLoadInstruction */

/**
    Instruction to load a byte from memory.
    @class LoadByteInstruction
    @extends BranchLabelFormatInstruction
*/
function LoadByteInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadByteInstruction.
    @method buildLoadByteInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildLoadByteInstructionPrototype(instructionSetSDK) {
    LoadByteInstruction.prototype = new DataTransferFormatInstruction();
    LoadByteInstruction.prototype.constructor = LoadByteInstruction;
    LoadByteInstruction.prototype.opcode = 'LDURB';

    /**
        Move a byte from memory.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    LoadByteInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadByteUnsigned(
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
    LoadByteInstruction.prototype.toComment = function(registers) {
        return makeCommentForLoadInstruction(this._properties, registers);
    };
}
