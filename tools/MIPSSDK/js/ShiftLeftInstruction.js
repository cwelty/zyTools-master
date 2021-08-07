'use strict';

/* exported buildShiftLeftInstructionPrototype */
/* global ImmediateRegisterFormatInstruction */

/**
    Represent a shift left instruction in MIPS.
    @class ShiftLeftInstruction
    @extends ImmediateRegisterFormatInstruction
    @constructor
*/
function ShiftLeftInstruction(...args) {
    ImmediateRegisterFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit ImmediateRegisterFormatInstruction and attach prototype functions to ShiftLeftInstruction.
    @method buildShiftLeftInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK Reference to the InstructionSetSDK.
    @return {void}
*/
function buildShiftLeftInstructionPrototype(instructionSetSDK) {
    ShiftLeftInstruction.prototype = new ImmediateRegisterFormatInstruction();
    ShiftLeftInstruction.prototype.constructor = ShiftLeftInstruction;
    ShiftLeftInstruction.prototype.opcode = 'sll';

    // See InstructionSetSDK's Instruction for details.
    ShiftLeftInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().shiftLeft(
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
    ShiftLeftInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' << ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    ShiftLeftInstruction.prototype.getFunctionBits = function() {
        return '000000';
    };
}
