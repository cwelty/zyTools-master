'use strict';

/* exported buildDataTransferFormatInstructionPrototype */
/* global ImmediateFormatInstruction, REGISTER_THEN_COMMA, INPUT_THEN_REGISTER, registerToBits, decimalToBits, TEXT_THEN_REGISTER */

/**
    DataTransferFormatInstruction is an abstract class inherited by sw and lw instructions.
    @class DataTransferFormatInstruction
    @constructor
    @extends ImmediateFormatInstruction
    @return {void}
*/
function DataTransferFormatInstruction(...args) {
    ImmediateFormatInstruction.prototype.constructor.apply(this, args);

    this._printProperties = [ REGISTER_THEN_COMMA, INPUT_THEN_REGISTER ];
}

/**
    Inherit ImmediateFormatInstruction and attach prototype functions to DataTransferFormatInstruction.
    @method buildDataTransferFormatInstructionPrototype
    @return {void}
*/
function buildDataTransferFormatInstructionPrototype() {
    DataTransferFormatInstruction.prototype = new ImmediateFormatInstruction();
    DataTransferFormatInstruction.prototype.constructor = DataTransferFormatInstruction;
    DataTransferFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'constant', 'register' ];
    DataTransferFormatInstruction.prototype.expectedTokenNameOrder = [
        'register', 'comma', 'numberThenRegister',
    ];

    // See InstructionSetSDK's Instruction for details.
    DataTransferFormatInstruction.prototype.toString = function() {
        return (this.opcode + ' ' + this._properties[0] + ', ' + this._properties[1] + '(' + this._properties[2] + ')');
    };

    // See InstructionSetSDK's Instruction for details.
    DataTransferFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);

        const immediateBits = 16;

        this._checkWhetherConstantValueIsNBitSigned(this._properties[1], immediateBits);
        this._checkWhetherRegisterNameIsValid(this._properties[2]);
    };

    /**
        Return the 5-bit string representing the source register.
        @method getSourceBits
        @return {String} The bit string representing the source register.
    */
    DataTransferFormatInstruction.prototype.getSourceBits = function() {
        return registerToBits(this._properties[2]);
    };

    /**
        Return the 16-bit string representing the immediate value.
        @method getImmediateBits
        @return {String} The bit string representing the immediate value.
    */
    DataTransferFormatInstruction.prototype.getImmediateBits = function() {
        const numberOfImmediateBits = 16;

        return decimalToBits(this._properties[1], numberOfImmediateBits);
    };

    /**
        Change the instruction to use a text-only number instead of an input number.
        @method useTextNotInput
        @return {void}
    */
    DataTransferFormatInstruction.prototype.useTextNotInput = function() {
        this._printProperties.forEach((property, index) => {
            if (property === INPUT_THEN_REGISTER) {
                this._printProperties[index] = TEXT_THEN_REGISTER;
            }
        });
    };
}
