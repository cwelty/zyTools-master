'use strict';

/* exported buildBranchOnGreaterThanOrEqualInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if negative conditional flag is equal to the overflow conditional flag.
    @class BranchOnGreaterThanOrEqualInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnGreaterThanOrEqualInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnGreaterThanOrEqualInstruction.
    @method buildBranchOnGreaterThanOrEqualInstructionPrototype
    @return {void}
*/
function buildBranchOnGreaterThanOrEqualInstructionPrototype() {
    BranchOnGreaterThanOrEqualInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnGreaterThanOrEqualInstruction.prototype.constructor = BranchOnGreaterThanOrEqualInstruction;
    BranchOnGreaterThanOrEqualInstruction.prototype.opcode = 'B.GE';

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
    BranchOnGreaterThanOrEqualInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return (simulatorContext.negative === simulatorContext.overflow) ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnGreaterThanOrEqualInstruction.prototype.toComment = function() {
        return `// if (N == V) go to ${this._properties[0]}`;
    };
}
