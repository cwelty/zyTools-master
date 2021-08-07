'use strict';

/* exported buildMultInstructionPrototype */
/* global TwoRegistersFormatInstruction */

/**
    MultInstruction inherits TwoRegistersFormatInstruction.
    See TwoRegistersFormatInstruction for details.
    @class MultInstruction
    @extends TwoRegistersFormatInstruction
    @constructor
*/
function MultInstruction() {
    TwoRegistersFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit TwoRegistersFormatInstruction and attach prototype functions to MultInstruction.
    @method buildMultInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the instruction set SDK.
    @return {void}
*/
function buildMultInstructionPrototype(instructionSetSDK) {
    MultInstruction.prototype = new TwoRegistersFormatInstruction();
    MultInstruction.prototype.constructor = MultInstruction;
    MultInstruction.prototype.opcode = 'mult';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    MultInstruction.prototype.execute = function(registers, memory, programCounter) {
        const result = instructionSetSDK.createCommonExecutes().multiply(
            registers,
            this._properties[0],
            this._properties[1]
        );

        registers.lookupByRegisterName('LO').setValue(result.low);
        registers.lookupByRegisterName('HI').setValue(result.high);

        return (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    MultInstruction.prototype.toComment = function() {
        return `# (HI, LO) = ${this._properties[0]} * ${this._properties[1]}`;
    };

    /**
        Return the 5-bit string representing the source 1 register.
        @method getSource1Bits
        @return {String} The bit string representing the source 1 register.
    */
    MultInstruction.prototype.getSource1Bits = function() {
        return registerToBits(this._properties[0]);
    };

    /**
        Return the 5-bit string representing the source 2 register.
        @method getSource2Bits
        @return {String} The bit string representing the source 2 register.
    */
    MultInstruction.prototype.getSource2Bits = function() {
        return registerToBits(this._properties[1]);
    };

    /**
        Return the 5-bit string representing the destination register.
        @method getDestinationBits
        @return {String} The bit string representing the destination register.
    */
    MultInstruction.prototype.getDestinationBits = function() {
        return '00000';
    };

    /**
        Return the 6-bit string representing the function.
        Inheriting instructions will override this.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    MultInstruction.prototype.getFunctionBits = function() {
        return '011000';
    };
}
