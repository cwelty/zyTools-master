'use strict';

/* exported buildLoadByteUnsignedInstructionPrototype */
/* global DataTransferFormatInstruction */

/**
    Represent an unsigned byte load instruction.
    @class LoadByteUnsignedInstruction
    @extends DataTransferFormatInstruction.
    @constructor
*/
function LoadByteUnsignedInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadByteUnsignedInstruction.
    @method buildLoadByteUnsignedInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the {InstructionSetSDK}.
    @return {void}
*/
function buildLoadByteUnsignedInstructionPrototype(instructionSetSDK) {
    LoadByteUnsignedInstruction.prototype = new DataTransferFormatInstruction();
    LoadByteUnsignedInstruction.prototype.constructor = LoadByteUnsignedInstruction;
    LoadByteUnsignedInstruction.prototype.opcode = 'lbu';

    /**
        Execute an unsigned byte load from memory.
        @method execute
        @param {Registers} registers The registers in the program.
        @param {Memory} memory The memory in the program.
        @param {Number} programCounter The current program counter of the program.
        @return {Number} The updated program counter after the execution.
    */
    LoadByteUnsignedInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadByteUnsigned(
            registers,
            memory,
            this._properties[0],
            this._properties[1],
            this._properties[2]
        );
        return (programCounter + 1);
    };

    /**
        Return a comment representing this instruction.
        @method toComment
        @param {Registers} registers The registers in the program.
        @return {String} A comment representing this instruction.
    */
    LoadByteUnsignedInstruction.prototype.toComment = function(registers) {
        let comment = `# ${this._properties[0]} = M[${this._properties[2]} + ${this._properties[1]}]`;

        if (registers) {
            const memoryAddress = registers.lookupByRegisterName(this._properties[2]).add(this._properties[1]).toString();

            comment += ` = M[${memoryAddress}]`;
        }
        return comment;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    LoadByteUnsignedInstruction.prototype.getOpcodeBits = function() {
        return '100100';
    };
}
