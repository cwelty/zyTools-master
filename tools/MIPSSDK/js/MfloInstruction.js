'use strict';

/* exported buildMfloInstructionPrototype */
/* global OneRegistersFormatInstruction */

/**
    MfloInstruction inherits OneRegistersFormatInstruction.
    See OneRegistersFormatInstruction for details.
    @class MfloInstruction
    @extends OneRegistersFormatInstruction
    @constructor
*/
function MfloInstruction() {
    OneRegistersFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit OneRegistersFormatInstruction and attach prototype functions to MfloInstruction.
    @method buildMfloInstructionPrototype
    @return {void}
*/
function buildMfloInstructionPrototype() {
    MfloInstruction.prototype = new OneRegistersFormatInstruction();
    MfloInstruction.prototype.constructor = MfloInstruction;
    MfloInstruction.prototype.opcode = 'mflo';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    MfloInstruction.prototype.execute = function(registers, memory, programCounter) {
        const loValueRegister = registers.lookupByRegisterName('LO');

        registers.lookupByRegisterName(this._properties[0]).setValueByBaseWord(loValueRegister);

        return (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    MfloInstruction.prototype.toComment = function() {
        return `# ${this._properties[0]} <= LO`;
    };

    /**
        Return the 5-bit string representing the source 1 register.
        @method getSource1Bits
        @return {String} The bit string representing the source 1 register.
    */
    MfloInstruction.prototype.getSource1Bits = function() {
        return '00000';
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    MfloInstruction.prototype.getFunctionBits = function() {
        return '010010';
    };
}
