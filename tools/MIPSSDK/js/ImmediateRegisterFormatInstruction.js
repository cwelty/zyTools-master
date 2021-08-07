'use strict';

/* exported buildImmediateRegisterFormatInstructionPrototype */
/* global ImmediateFormatInstruction, RegisterFormatInstruction, REGISTER_THEN_COMMA, INPUT_ONLY, registerToBits, decimalToBits */

/**
    Store common logic used by ShiftLeftInstruction and ShiftRightInstruction.
    @class ImmediateRegisterFormatInstruction
    @extends RegisterFormatInstruction
*/
function ImmediateRegisterFormatInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line

    this._printProperties = [ REGISTER_THEN_COMMA, REGISTER_THEN_COMMA, INPUT_ONLY ];
}

/**
    Inherit RegisterFormatInstruction and attach prototype functions to ImmediateRegisterFormatInstruction.
    @method buildImmediateRegisterFormatInstructionPrototype
    @return {void}
*/
function buildImmediateRegisterFormatInstructionPrototype() {
    ImmediateRegisterFormatInstruction.prototype = new RegisterFormatInstruction();
    ImmediateRegisterFormatInstruction.prototype.constructor = ImmediateRegisterFormatInstruction;
    ImmediateRegisterFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'constant' ];
    ImmediateRegisterFormatInstruction.prototype.expectedTokenNameOrder = [ 'register', 'comma', 'register', 'comma', 'number' ];

    /**
        Check whether the two registers have a valid name and whether the constant is a 5-bit unsigned value.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    ImmediateRegisterFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);

        const immediateBits = 5;

        this._checkWhetherConstantValueIsNBitUnsigned(this._properties[2], immediateBits);
    };

    // See InstructionSetSDK's Instruction for details.
    ImmediateRegisterFormatInstruction.prototype.toString = function() {
        return ImmediateFormatInstruction.prototype.toString.apply(this);
    };

    /**
        Return the 5-bit string representing the source 1 register.
        @method getSource1Bits
        @return {String} The bit string representing the source 1 register.
    */
    ImmediateRegisterFormatInstruction.prototype.getSource1Bits = function() {
        return registerToBits(this._properties[1]);
    };

    /**
        Return the 5-bit string representing the source 2 register.
        @method getSource2Bits
        @return {String} The bit string representing the source 2 register.
    */
    ImmediateRegisterFormatInstruction.prototype.getSource2Bits = function() {
        return '00000';
    };

    /**
        Return the 5-bit string representing the destination register.
        @method getDestinationBits
        @return {String} The bit string representing the destination register.
    */
    ImmediateRegisterFormatInstruction.prototype.getDestinationBits = function() {
        return registerToBits(this._properties[0]);
    };

    /**
        Return the 5-bit string representing the shift amount.
        @method getShiftAmountBits
        @return {String} The bit string representing the shift amount.
    */
    ImmediateRegisterFormatInstruction.prototype.getShiftAmountBits = function() {
        const numberOfShiftBits = 5;

        return decimalToBits(this._properties[2], numberOfShiftBits);
    };
}
