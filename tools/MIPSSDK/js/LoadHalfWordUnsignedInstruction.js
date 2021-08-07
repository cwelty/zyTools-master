'use strict';

/* exported buildLoadHalfWordUnsignedInstructionPrototype */
/* global DataTransferFormatInstruction */

/**
    Represent a half-word load instruction that loads an unsigned value.
    @class LoadHalfWordUnsignedInstruction
    @extends DataTransferFormatInstruction.
    @constructor
*/
function LoadHalfWordUnsignedInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadHalfWordUnsignedInstruction.
    @method buildLoadHalfWordUnsignedInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the {InstructionSetSDK}.
    @return {void}
*/
function buildLoadHalfWordUnsignedInstructionPrototype(instructionSetSDK) {
    LoadHalfWordUnsignedInstruction.prototype = new DataTransferFormatInstruction();
    LoadHalfWordUnsignedInstruction.prototype.constructor = LoadHalfWordUnsignedInstruction;
    LoadHalfWordUnsignedInstruction.prototype.opcode = 'lhu';

    /**
        Execute a loading of an unsigned half-word value.
        @method execute
        @param {Registers} registers The registers in the program.
        @param {Memory} memory The memory in the program.
        @param {Number} programCounter The current program counter of the program.
        @return {Number} The updated program counter after the execution.
    */
    LoadHalfWordUnsignedInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadHalfWordUnsigned(
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
    LoadHalfWordUnsignedInstruction.prototype.toComment = function(registers) {
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
    LoadHalfWordUnsignedInstruction.prototype.getOpcodeBits = function() {
        return '100101';
    };
}
