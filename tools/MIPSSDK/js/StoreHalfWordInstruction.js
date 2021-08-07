'use strict';

/* exported buildStoreHalfWordInstructionPrototype */
/* global DataTransferFormatInstruction */

/**
    Represent a half-word store instruction.
    @class StoreHalfWordInstruction
    @extends DataTransferFormatInstruction.
    @constructor
*/
function StoreHalfWordInstruction(...args) {
    DataTransferFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit DataTransferFormatInstruction and attach prototype functions to StoreHalfWordInstruction.
    @method buildStoreHalfWordInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the {InstructionSetSDK}.
    @return {void}
*/
function buildStoreHalfWordInstructionPrototype(instructionSetSDK) {
    StoreHalfWordInstruction.prototype = new DataTransferFormatInstruction();
    StoreHalfWordInstruction.prototype.constructor = StoreHalfWordInstruction;
    StoreHalfWordInstruction.prototype.opcode = 'sh';

    /**
        Execute storing a half-word value.
        @method execute
        @param {Registers} registers The registers in the program.
        @param {Memory} memory The memory in the program.
        @param {Number} programCounter The current program counter of the program.
        @return {Number} The updated program counter after the execution.
    */
    StoreHalfWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().storeHalfWord(
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
    StoreHalfWordInstruction.prototype.toComment = function(registers) {
        let comment = `# M[${this._properties[2]} + ${this._properties[1]}] = `;

        if (registers) {
            const memoryAddress = registers.lookupByRegisterName(this._properties[2]).add(this._properties[1]).toString();

            comment += `M[${memoryAddress}] = `;
        }
        return (comment + this._properties[0]);
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    StoreHalfWordInstruction.prototype.getOpcodeBits = function() {
        return '101001';
    };
}
