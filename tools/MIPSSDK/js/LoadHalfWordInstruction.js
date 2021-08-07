'use strict';

/* exported buildLoadHalfWordInstructionPrototype */
/* global DataTransferFormatInstruction */

/**
    Represent a half-word load instruction.
    @class LoadHalfWordInstruction
    @extends DataTransferFormatInstruction.
    @constructor
*/
function LoadHalfWordInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadHalfWordInstruction.
    @method buildLoadHalfWordInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the {InstructionSetSDK}.
    @return {void}
*/
function buildLoadHalfWordInstructionPrototype(instructionSetSDK) {
    LoadHalfWordInstruction.prototype = new DataTransferFormatInstruction();
    LoadHalfWordInstruction.prototype.constructor = LoadHalfWordInstruction;
    LoadHalfWordInstruction.prototype.opcode = 'lh';

    /**
        Execute the loading of a half-word value.
        @method execute
        @param {Registers} registers The registers in the program.
        @param {Memory} memory The memory in the program.
        @param {Number} programCounter The current program counter of the program.
        @return {Number} The updated program counter after the execution.
    */
    LoadHalfWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadHalfWordSigned(
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
    LoadHalfWordInstruction.prototype.toComment = function(registers) {
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
    LoadHalfWordInstruction.prototype.getOpcodeBits = function() {
        return '100001';
    };
}
