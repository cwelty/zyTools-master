'use strict';

/* exported buildImmediateFormatInstructionPrototype */
/* global REGISTER_THEN_COMMA, INPUT_ONLY, REGISTER_NAME_ORDER */

/**
    ImmediateFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
    @class ImmediateFormatInstruction
    @constructor
*/
function ImmediateFormatInstruction(...args) {
    this.newInstruction.constructor.apply(this, args);

    this._printProperties = [
        REGISTER_THEN_COMMA,
        REGISTER_THEN_COMMA,
        INPUT_ONLY,
    ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to ImmediateFormatInstruction.
    @method buildImmediateFormatInstructionPrototype
    @param {InstructionSetSDK} instructionSetSDK The instruction set SDK.
    @return {void}
*/
function buildImmediateFormatInstructionPrototype(instructionSetSDK) {
    ImmediateFormatInstruction.prototype = instructionSetSDK.inheritInstruction();
    ImmediateFormatInstruction.prototype.constructor = ImmediateFormatInstruction;
    ImmediateFormatInstruction.prototype.newInstruction = instructionSetSDK.inheritInstruction();
    ImmediateFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'constant' ];
    ImmediateFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;
    ImmediateFormatInstruction.prototype.expectedTokenNameOrder = [
        'register', 'comma', 'register', 'comma', '#', 'number',
    ];

    // See InstructionSetSDK's Instruction for details.
    ImmediateFormatInstruction.prototype.toString = function() {
        return `${this.opcode} ${this._properties[0]}, ${this._properties[1]}, #${this._properties[2]}`;
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    ImmediateFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);

        const immediateBits = 11;

        this._checkWhetherConstantValueIsNBitSigned(this._properties[2], immediateBits);
    };
}
