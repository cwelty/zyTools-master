'use strict';

/* exported buildBranchOnPositiveInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if negative conditional flag is 0.
    @class BranchOnPositiveInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnPositiveInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnPositiveInstruction.
    @method buildBranchOnPositiveInstructionPrototype
    @return {void}
*/
function buildBranchOnPositiveInstructionPrototype() {
    BranchOnPositiveInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnPositiveInstruction.prototype.constructor = BranchOnPositiveInstruction;
    BranchOnPositiveInstruction.prototype.opcode = 'B.PL';

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
    BranchOnPositiveInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.negative ? (programCounter + 1) : this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnPositiveInstruction.prototype.toComment = function() {
        return `// if (N == 0) go to ${this._properties[0]}`;
    };
}
