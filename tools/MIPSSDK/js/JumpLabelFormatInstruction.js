'use strict';

/* global getMachineInstructionAddress, makeMachineInstructionCommentMappingLabelToAddress, decimalToBits, MIPSInstruction */

/*
    JumpLabelFormatInstruction is an abstract class that inherits InstructionSetSDK's Instruction.
    See InstructionSetSDK's Instruction for details.
*/
function JumpLabelFormatInstruction(...args) {
    MIPSInstruction.prototype.constructor.apply(this, args);

    this._printProperties = [ LABEL_ONLY ];
}

/*
    Inherit InstructionSetSDK's Instruction and attach prototype functions to JumpLabelFormatInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildJumpLabelFormatInstructionPrototype(instructionSetSDK) {
    JumpLabelFormatInstruction.prototype = new MIPSInstruction();
    JumpLabelFormatInstruction.prototype.constructor = JumpLabelFormatInstruction;
    JumpLabelFormatInstruction.prototype._propertiesConfiguration = [ 'label' ];
    JumpLabelFormatInstruction.prototype._validRegisters = [];

    JumpLabelFormatInstruction.prototype.expectedTokenNameOrder = [ 'word' ];

    // See InstructionSetSDK's Instruction for details.
    JumpLabelFormatInstruction.prototype.toString = function() {
        return (this.opcode + ' ' + this._properties[0]);
    };

    // See InstructionSetSDK's Instruction for details. Jump instruction does not use registers or constants.
    JumpLabelFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        return;
    };

    /**
        Compute the immediate bits for the instruction.
        @method getImmediateBits
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} Instruction's immediate bits.
    */
    JumpLabelFormatInstruction.prototype.getImmediateBits = function(machineLabels, instructionMemoryStartAddress) {
        const byteAddressToJumpTo = getMachineInstructionAddress(machineLabels, this._properties[0], instructionMemoryStartAddress);
        const numberOfBitsInAddress = 32;
        const byteAddressToJumpToInBits = decimalToBits(byteAddressToJumpTo, numberOfBitsInAddress);

        // Grab bits in indices 4 - 30. Slice off bits in indices: 0 - 3, and 31 - 32.
        const numberOfImmediateBits = 26;
        const startOfBitsToGrab = 2;

        return byteAddressToJumpToInBits.slice(
            numberOfBitsInAddress - numberOfImmediateBits - startOfBitsToGrab,
            numberOfBitsInAddress - startOfBitsToGrab
        );
    };

    /**
        Return the string representing the instruction as machine instruction text. Some instructions will override this.
        Ex: j loop   may become    j 8
        @method toMachineInstructionString
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} Representation of instruction as machine instruction text.
    */
    JumpLabelFormatInstruction.prototype.toMachineInstructionString = function(machineLabels, instructionMemoryStartAddress) {
        const immediateBits = this.getImmediateBits(machineLabels, instructionMemoryStartAddress);
        const immediateDigits = parseInt(immediateBits, 2);

        return `${this.opcode} ${immediateDigits}`;
    };

    /**
        Show which memory address the label maps to.
        @method toMachineInstructionComments
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    JumpLabelFormatInstruction.prototype.toMachineInstructionComments = function(machineLabels, instructionMemoryStartAddress) {
        return makeMachineInstructionCommentMappingLabelToAddress(machineLabels, this._properties[0], instructionMemoryStartAddress);
    };

    /**
        Return the 6-bit string representing the opcode.
        Inheriting instructions will override this.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    JumpLabelFormatInstruction.prototype.getOpcodeBits = function() {
        throw new Error('Called JumpLabelFormatInstruction\'s getOpcodeBits, but shouldn\'t have.');
    };

    /**
        Return the bit string representing this instruction.
        @method toMachineInstructionBitString
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} Representation of instruction as machine instruction bits.
    */
    JumpLabelFormatInstruction.prototype.toMachineInstructionBitString = function(machineInstructions, machineLabels,
                                                                       instructionMemoryStartAddress) {
        const opcode = this.getOpcodeBits();
        const immediate = this.getImmediateBits(machineLabels, instructionMemoryStartAddress);

        return `${opcode} ${immediate}`;
    };
}
