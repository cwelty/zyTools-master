'use strict';

/* exported buildTwoRegistersFormatInstructionPrototype */
/* global REGISTER_NAME_ORDER, REGISTER_THEN_COMMA, REGISTER_ONLY, RegisterFormatInstruction */

/**
    TwoRegistersFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
    @class TwoRegistersFormatInstruction
    @extends InstructionSetSDK.Instruction
    @constructor
*/
function TwoRegistersFormatInstruction(...args) {
    RegisterFormatInstruction.prototype.constructor.apply(this, args);

    this._printProperties = [ REGISTER_THEN_COMMA, REGISTER_ONLY ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to TwoRegistersFormatInstruction.
    @method buildTwoRegistersFormatInstructionPrototype
    @return {void}
*/
function buildTwoRegistersFormatInstructionPrototype() {
    TwoRegistersFormatInstruction.prototype = new RegisterFormatInstruction();
    TwoRegistersFormatInstruction.prototype.constructor = TwoRegistersFormatInstruction;
    TwoRegistersFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register' ];
    TwoRegistersFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    TwoRegistersFormatInstruction.prototype.expectedTokenNameOrder = [
        'register', 'comma', 'register',
    ];

    /**
        See InstructionSetSDK's Instruction for details.
        @method toString
        @return {String} The instruction as a string.
    */
    TwoRegistersFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}, ${this._properties[1]}`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    TwoRegistersFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);
    };
}
