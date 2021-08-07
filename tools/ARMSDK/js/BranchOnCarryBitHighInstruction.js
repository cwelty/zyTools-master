'use strict';

/* exported buildBranchOnCarryBitHighInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if carry conditional flag is 1.
    @class BranchOnCarryBitHighInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnCarryBitHighInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnCarryBitHighInstruction.
    @method buildBranchOnCarryBitHighInstructionPrototype
    @return {void}
*/
function buildBranchOnCarryBitHighInstructionPrototype() {
    BranchOnCarryBitHighInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnCarryBitHighInstruction.prototype.constructor = BranchOnCarryBitHighInstruction;
    BranchOnCarryBitHighInstruction.prototype.opcode = 'B.HS';

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
    BranchOnCarryBitHighInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.carry ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnCarryBitHighInstruction.prototype.toComment = function() {
        return `// if (C == 1) go to ${this._properties[0]}`;
    };
}
