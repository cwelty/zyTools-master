'use strict';

/* global registerToBits, MIPSInstruction */

/*
    RegisterFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
*/
function RegisterFormatInstruction(...args) {
    MIPSInstruction.prototype.constructor.apply(this, args);

    this._printProperties = [ REGISTER_THEN_COMMA, REGISTER_THEN_COMMA, REGISTER_ONLY ];
}

/*
    Inherit InstructionSetSDK's Instruction and attach prototype functions to RegisterFormatInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildRegisterFormatInstructionPrototype(instructionSetSDK) {
    RegisterFormatInstruction.prototype = new MIPSInstruction();
    RegisterFormatInstruction.prototype.constructor = RegisterFormatInstruction;
    RegisterFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'register' ];
    RegisterFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;

    RegisterFormatInstruction.prototype.expectedTokenNameOrder = [
        'register', 'comma', 'register', 'comma', 'register'
    ];

    // See InstructionSetSDK's Instruction for details.
    RegisterFormatInstruction.prototype.toString = function() {
        return (this.opcode + ' ' + this._properties[0] + ', ' + this._properties[1] + ', ' + this._properties[2]);
    };

    // See InstructionSetSDK's Instruction for details.
    RegisterFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);
        this._checkWhetherRegisterNameIsValid(this._properties[2]);
    };

    /**
        Return the 5-bit string representing the source 1 register.
        @method getSource1Bits
        @return {String} The bit string representing the source 1 register.
    */
    RegisterFormatInstruction.prototype.getSource1Bits = function() {
        return registerToBits(this._properties[1]);
    };

    /**
        Return the 5-bit string representing the source 2 register.
        @method getSource2Bits
        @return {String} The bit string representing the source 2 register.
    */
    RegisterFormatInstruction.prototype.getSource2Bits = function() {
        return registerToBits(this._properties[2]);
    };

    /**
        Return the 5-bit string representing the destination register.
        @method getDestinationBits
        @return {String} The bit string representing the destination register.
    */
    RegisterFormatInstruction.prototype.getDestinationBits = function() {
        return registerToBits(this._properties[0]);
    };

    /**
        Return the 5-bit string representing the shift amount.
        @method getShiftAmountBits
        @return {String} The bit string representing the shift amount.
    */
    RegisterFormatInstruction.prototype.getShiftAmountBits = function() {
        return '00000';
    };

    /**
        Return the 6-bit string representing the function.
        Inheriting instructions will override this.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    RegisterFormatInstruction.prototype.getFunctionBits = function() {
        throw new Error('Called RegisterFormatInstruction\'s getFunctionBits, but shouldn\'t have.');
    };

    /**
        Return the bit string representing this instruction.
        @method toMachineInstructionBitString
        @return {String} Representation of instruction as machine instruction bits.
    */
    RegisterFormatInstruction.prototype.toMachineInstructionBitString = function() {
        const opcode = '000000';
        const source1 = this.getSource1Bits();
        const source2 = this.getSource2Bits();
        const destination = this.getDestinationBits();
        const shift = this.getShiftAmountBits();
        const functionBits = this.getFunctionBits();

        return `${opcode} ${source1} ${source2} ${destination} ${shift} ${functionBits}`;
    };
}
