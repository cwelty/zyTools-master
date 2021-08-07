'use strict';

/* exported buildShiftRightInstructionPrototype */
/* global ImmediateRegisterFormatInstruction */

/**
    Represent a shift right instruction in MIPS.
    @class ShiftRightInstruction
    @extends ImmediateRegisterFormatInstruction
    @constructor
*/
function ShiftRightInstruction(...args) {
    ImmediateRegisterFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit ImmediateRegisterFormatInstruction and attach prototype functions to ShiftRightInstruction.
    @method buildShiftRightInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the InstructionSetSDK.
    @return {void}
*/
function buildShiftRightInstructionPrototype(instructionSetSDK) {
    ShiftRightInstruction.prototype = new ImmediateRegisterFormatInstruction();
    ShiftRightInstruction.prototype.constructor = ShiftRightInstruction;
    ShiftRightInstruction.prototype.opcode = 'srl';

    // See InstructionSetSDK's Instruction for details.
    ShiftRightInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().shiftRight(
            registers,

            // destinationRegister
            this._properties[0],

            // sourceRegister
            this._properties[1],

            // immediate
            this._properties[2]
        );
        return (programCounter + 1);
    };

    // See InstructionSetSDK's Instruction for details.
    ShiftRightInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' >> ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    ShiftRightInstruction.prototype.getFunctionBits = function() {
        return '000010';
    };
}
