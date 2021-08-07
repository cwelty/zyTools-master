'use strict';

/* exported buildRegisterFormatInstructionPrototype */
/* global REGISTER_NAME_ORDER, REGISTER_THEN_COMMA, REGISTER_ONLY */

/**
    RegisterFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
    @class RegisterFormatInstruction
    @constructor
*/
function RegisterFormatInstruction(...args) {
    this.newInstruction.constructor.apply(this, args);

    this._printProperties = [
        REGISTER_THEN_COMMA,
        REGISTER_THEN_COMMA,
        REGISTER_ONLY,
    ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to RegisterFormatInstruction.
    @method buildRegisterFormatInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildRegisterFormatInstructionPrototype(instructionSetSDK) {
    RegisterFormatInstruction.prototype = instructionSetSDK.inheritInstruction();
    RegisterFormatInstruction.prototype.constructor = RegisterFormatInstruction;
    RegisterFormatInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    RegisterFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'register' ];
    RegisterFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    RegisterFormatInstruction.prototype.expectedTokenNameOrder = [ 'register', 'comma', 'register', 'comma', 'register' ];

    // See InstructionSetSDK's Instruction for details.
    RegisterFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}, ${this._properties[1]}, ${this._properties[2]}`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    RegisterFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._properties.forEach(property => this._checkWhetherRegisterNameIsValid(property));
    };
}
