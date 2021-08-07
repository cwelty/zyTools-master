'use strict';

/* exported buildOneRegistersFormatInstructionPrototype */
/* global REGISTER_NAME_ORDER, REGISTER_ONLY, RegisterFormatInstruction */

/**
    OneRegistersFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
    @class OneRegistersFormatInstruction
    @extends InstructionSetSDK.Instruction
    @constructor
*/
function OneRegistersFormatInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line

    this._printProperties = [ REGISTER_ONLY ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to OneRegistersFormatInstruction.
    @method buildOneRegistersFormatInstructionPrototype
    @return {void}
*/
function buildOneRegistersFormatInstructionPrototype() {
    OneRegistersFormatInstruction.prototype = new RegisterFormatInstruction();
    OneRegistersFormatInstruction.prototype.constructor = OneRegistersFormatInstruction;
    OneRegistersFormatInstruction.prototype._propertiesConfiguration = [ 'register' ];
    OneRegistersFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    OneRegistersFormatInstruction.prototype.expectedTokenNameOrder = [ 'register' ];

    /**
        See InstructionSetSDK's Instruction for details.
        @method toString
        @return {String} The instruction as a string.
    */
    OneRegistersFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    OneRegistersFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
    };

    /**
        Return the 5-bit string representing the source 2 register.
        @method getSource2Bits
        @return {String} The bit string representing the source 2 register.
    */
    OneRegistersFormatInstruction.prototype.getSource2Bits = function() {
        return '00000';
    };
}
