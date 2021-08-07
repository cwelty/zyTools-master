'use strict';

/* exported buildBranchOnCarryBitLowInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if carry conditional flag is 0.
    @class BranchOnCarryBitLowInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnCarryBitLowInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnCarryBitLowInstruction.
    @method buildBranchOnCarryBitLowInstructionPrototype
    @return {void}
*/
function buildBranchOnCarryBitLowInstructionPrototype() {
    BranchOnCarryBitLowInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnCarryBitLowInstruction.prototype.constructor = BranchOnCarryBitLowInstruction;
    BranchOnCarryBitLowInstruction.prototype.opcode = 'B.LO';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @param {Labels} labels The labels of the program on which to execute.
        @param {Object} simulatorContext Miscellaneous context information on the simulation.
        @return {Number} The program counter after execution.
    */
    BranchOnCarryBitLowInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.carry ? (programCounter + 1) : this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnCarryBitLowInstruction.prototype.toComment = function() {
        return `// if (C == 0) go to ${this._properties[0]}`;
    };
}
