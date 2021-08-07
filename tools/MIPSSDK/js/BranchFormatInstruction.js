'use strict';

/* exported buildBranchFormatInstructionPrototype */
/* global ImmediateFormatInstruction, getMachineInstructionAddress, makeMachineInstructionCommentMappingLabelToAddress,
   REGISTER_THEN_COMMA, LABEL_ONLY, decimalToBits, numberOfBytesInAddress */

/**
    Abstract class used for branch instructions, such as beq and bne.
    @class BranchFormatInstruction
    @extends ImmediateFormatInstruction
    @constructor
*/
function BranchFormatInstruction(...args) {
    ImmediateFormatInstruction.prototype.constructor.apply(this, args);

    this._printProperties = [ REGISTER_THEN_COMMA, REGISTER_THEN_COMMA, LABEL_ONLY ];
}

/**
    Inherit InstructionSetSDK's Instruction and attach prototype functions to BranchFormatInstruction.
    @method buildBranchFormatInstructionPrototype
    @return {void}
*/
function buildBranchFormatInstructionPrototype() {
    BranchFormatInstruction.prototype = new ImmediateFormatInstruction();
    BranchFormatInstruction.prototype.constructor = BranchFormatInstruction;
    BranchFormatInstruction.prototype._propertiesConfiguration = [ 'register', 'register', 'label' ];
    BranchFormatInstruction.prototype.expectedTokenNameOrder = [ 'register', 'comma', 'register', 'comma', 'word' ];

    // See InstructionSetSDK's Instruction for details.
    BranchFormatInstruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        this._checkWhetherRegisterNameIsValid(this._properties[0]);
        this._checkWhetherRegisterNameIsValid(this._properties[1]);
    };

    /**
        Return the offset to use if this branch is taken.
        @method getOffset
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} [instructionMemoryStartAddress=0] The start address of instruction memory.
        @return {Number} The offset of the branch.
    */
    BranchFormatInstruction.prototype.getOffset = function(machineInstructions, machineLabels, instructionMemoryStartAddress = 0) {
        const labelAddress = getMachineInstructionAddress(machineLabels, this._properties[2], instructionMemoryStartAddress);
        const branchAddress = numberOfBytesInAddress * (instructionMemoryStartAddress + machineInstructions.indexOf(this));

        return (labelAddress - (branchAddress + numberOfBytesInAddress)) / numberOfBytesInAddress;
    }

    /**
        Return the string representing the instruction as machine instruction text. Some instructions will override this.
        Ex: beq $s1, $s2, loop   may become    beq $s1, $s2, 8
        @method toMachineInstructionString
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @param {Instructions} machineInstructions List of machine instructions in program.
        @return {String} Representation of instruction as machine instruction text.
    */
    BranchFormatInstruction.prototype.toMachineInstructionString = function(machineLabels, instructionMemoryStartAddress, machineInstructions) {
        const offset = this.getOffset(machineInstructions, machineLabels, instructionMemoryStartAddress);

        return `${this.opcode} ${this._properties[0]}, ${this._properties[1]}, ${offset}`;
    };

    /**
        Return a comment showing to which memory address this branch's label maps.
        @method toMachineInstructionComments
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    BranchFormatInstruction.prototype.toMachineInstructionComments = function(machineLabels, instructionMemoryStartAddress) {
        return makeMachineInstructionCommentMappingLabelToAddress(machineLabels, this._properties[2], instructionMemoryStartAddress);
    };

    /**
        Return the 16-bit string representing the immediate value.
        @method getImmediateBits
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} The bit string representing the immediate value.
    */
    BranchFormatInstruction.prototype.getImmediateBits = function(machineInstructions, machineLabels, instructionMemoryStartAddress) {
        const offset = this.getOffset(machineInstructions, machineLabels, instructionMemoryStartAddress);
        const numberOfImmediateBits = 16;

        return decimalToBits(offset, numberOfImmediateBits);
    };

    /**
        Return the bit string representing this instruction.
        @method toMachineInstructionBitString
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} Representation of instruction as machine instruction bits.
    */
    BranchFormatInstruction.prototype.toMachineInstructionBitString = function(machineInstructions, machineLabels,
                                                                               instructionMemoryStartAddress) {
        const opcode = this.getOpcodeBits();
        const source = this.getSourceBits();
        const destination = this.getDestinationBits();
        const immediate = this.getImmediateBits(machineInstructions, machineLabels, instructionMemoryStartAddress);

        return `${opcode} ${destination} ${source} ${immediate}`;
    };
}
