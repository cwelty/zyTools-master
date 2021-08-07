'use strict';

/* exported buildOneRegisterAndOneImmediateFormatInstructionPrototype */
/* global REGISTER_NAME_ORDER, REGISTER_THEN_COMMA, INPUT_ONLY */

/**
    Abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
    @class OneRegisterAndOneImmediateFormatInstruction
    @constructor
*/
function OneRegisterAndOneImmediateFormatInstruction(...args) {
    this.newInstruction.constructor.apply(this, args);
    this._printProperties = [
        REGISTER_THEN_COMMA,
        INPUT_ONLY,
    ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to OneRegisterAndOneImmediateFormatInstruction.
    @method buildOneRegisterAndOneImmediateFormatInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildOneRegisterAndOneImmediateFormatInstructionPrototype(instructionSetSDK) {
    OneRegisterAndOneImmediateFormatInstruction.prototype = instructionSetSDK.inheritInstruction();
    OneRegisterAndOneImmediateFormatInstruction.prototype.constructor = OneRegisterAndOneImmediateFormatInstruction;
    OneRegisterAndOneImmediateFormatInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    OneRegisterAndOneImmediateFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'constant' ];
    OneRegisterAndOneImmediateFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    OneRegisterAndOneImmediateFormatInstruction.prototype.expectedTokenNameOrder = [ 'register', 'comma', '#', 'number' ];

    // See InstructionSetSDK's Instruction for details.
    OneRegisterAndOneImmediateFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}, #${this._properties[1]}`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    OneRegisterAndOneImmediateFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
    };
}
