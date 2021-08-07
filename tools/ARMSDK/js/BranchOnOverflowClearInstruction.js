'use strict';

/* exported buildBranchOnOverflowClearInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if overflow conditional flag is 0.
    @class BranchOnOverflowClearInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnOverflowClearInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnOverflowClearInstruction.
    @method buildBranchOnOverflowClearInstructionPrototype
    @return {void}
*/
function buildBranchOnOverflowClearInstructionPrototype() {
    BranchOnOverflowClearInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnOverflowClearInstruction.prototype.constructor = BranchOnOverflowClearInstruction;
    BranchOnOverflowClearInstruction.prototype.opcode = 'B.VC';

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
    BranchOnOverflowClearInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.overflow ? (programCounter + 1) : this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnOverflowClearInstruction.prototype.toComment = function() {
        return `// if (V == 0) go to ${this._properties[0]}`;
    };
}
