'use strict';

/* global registerToBits, decimalToBits, MIPSInstruction */

/*
    ImmediateFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
*/
function ImmediateFormatInstruction(...args) {
    MIPSInstruction.prototype.constructor.apply(this, args);

    this._printProperties = [ REGISTER_THEN_COMMA, REGISTER_THEN_COMMA, INPUT_ONLY ];
}

/*
    Inherit InstructionSetSDK's Instruction and attach prototype functions to ImmediateFormatInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildImmediateFormatInstructionPrototype(instructionSetSDK) {
    ImmediateFormatInstruction.prototype = new MIPSInstruction();
    ImmediateFormatInstruction.prototype.constructor = ImmediateFormatInstruction;
    ImmediateFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'constant' ];
    ImmediateFormatInstruction.prototype._validRegisters = REGISTER_NAME_ORDER;

    ImmediateFormatInstruction.prototype.expectedTokenNameOrder = [
        'register', 'comma', 'register', 'comma', 'number'
    ];

    // See InstructionSetSDK's Instruction for details.
    ImmediateFormatInstruction.prototype.toString = function() {
        return (this.opcode + ' ' + this._properties[0] + ', ' + this._properties[1] + ', ' + this._properties[2]);
    };

    // See InstructionSetSDK's Instruction for details.
    ImmediateFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);

        const immediateBits = 16;

        this._checkWhetherConstantValueIsNBitSigned(this._properties[2], immediateBits);
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    ImmediateFormatInstruction.prototype.getOpcodeBits = function() {
        throw new Error('Called ImmediateFormatInstruction\'s getOpcodeBits, but shouldn\'t have.');
    };

    /**
        Return the 5-bit string representing the source register.
        @method getSourceBits
        @return {String} The bit string representing the source register.
    */
    ImmediateFormatInstruction.prototype.getSourceBits = function() {
        return registerToBits(this._properties[1]);
    };

    /**
        Return the 5-bit string representing the destination register.
        @method getDestinationBits
        @return {String} The bit string representing the destination register.
    */
    ImmediateFormatInstruction.prototype.getDestinationBits = function() {
        return registerToBits(this._properties[0]);
    };

    /**
        Return the 16-bit string representing the immediate value.
        @method getImmediateBits
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} The bit string representing the immediate value.

        The parameters are not used here, but some inheriting instructions do (ex: BranchFormatInstruction).
    */
    ImmediateFormatInstruction.prototype.getImmediateBits = function(machineInstructions, machineLabels, instructionMemoryStartAddress) { // eslint-disable-line
        const numberOfImmediateBits = 16;

        return decimalToBits(this._properties[2], numberOfImmediateBits);
    };

    /**
        Return the bit string representing this instruction.
        @method toMachineInstructionBitString
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} Representation of instruction as machine instruction bits.
    */
    ImmediateFormatInstruction.prototype.toMachineInstructionBitString = function(machineInstructions, machineLabels,
                                                                                  instructionMemoryStartAddress) {
        const opcode = this.getOpcodeBits();
        const source = this.getSourceBits();
        const destination = this.getDestinationBits();
        const immediate = this.getImmediateBits(machineInstructions, machineLabels, instructionMemoryStartAddress);

        return `${opcode} ${source} ${destination} ${immediate}`;
    };
}
