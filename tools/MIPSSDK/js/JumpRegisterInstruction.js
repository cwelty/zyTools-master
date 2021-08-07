'use strict';

/* exported buildJumpRegisterInstructionPrototype */
/* global OneRegistersFormatInstruction, registerToBits, numberOfBytesInAddress */

/**
    JumpRegisterInstruction inherits OneRegistersFormatInstruction.
    See OneRegistersFormatInstruction for details.
    @class JumpRegisterInstruction
    @extends OneRegistersFormatInstruction
    @constructor
*/
function JumpRegisterInstruction(...args) {
    OneRegistersFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit OneRegistersFormatInstruction and attach prototype functions to JumpRegisterInstruction.
    @method buildJumpRegisterInstructionPrototype
    @return {void}
*/
function buildJumpRegisterInstructionPrototype() {
    JumpRegisterInstruction.prototype = new OneRegistersFormatInstruction();
    JumpRegisterInstruction.prototype.constructor = JumpRegisterInstruction;
    JumpRegisterInstruction.prototype.opcode = 'jr';

    /**
        Jump to the program counter stored in the register.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @return {Number} The program counter after execution.
    */
    JumpRegisterInstruction.prototype.execute = function(registers, memory) {
        const instructionAddressToJumpTo = registers.lookupByRegisterName(this._properties[0]).getUnsignedValue();

        if ((instructionAddressToJumpTo % numberOfBytesInAddress) !== 0) {
            throw new Error(`Instruction addresses should be word-aligned. Tried to access: ${instructionAddressToJumpTo}`);
        }

        return (instructionAddressToJumpTo - memory.instructionStartAddress) / numberOfBytesInAddress;
    };

    /**
        Return a comment explaining this instruction.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    JumpRegisterInstruction.prototype.toComment = function() {
        return `# go to ${this._properties[0]}`;
    };

    /**
        Return the 5-bit string representing the source 1 register.
        @method getSource1Bits
        @return {String} The bit string representing the source 1 register.
    */
    JumpRegisterInstruction.prototype.getSource1Bits = function() {
        return registerToBits(this._properties[0]);
    };

    /**
        Return the 5-bit string representing the destination register.
        @method getDestinationBits
        @return {String} The bit string representing the destination register.
    */
    JumpRegisterInstruction.prototype.getDestinationBits = function() {
        return '00000';
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    JumpRegisterInstruction.prototype.getFunctionBits = function() {
        return '001000';
    };
}
