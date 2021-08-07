'use strict';

/* exported buildBranchOnLessThanOrEqualInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if negative conditional flag is not equal to the overflow conditional flag, or if the zero conditional flag is 1.
    @class BranchOnLessThanOrEqualInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnLessThanOrEqualInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnLessThanOrEqualInstruction.
    @method buildBranchOnLessThanOrEqualInstructionPrototype
    @return {void}
*/
function buildBranchOnLessThanOrEqualInstructionPrototype() {
    BranchOnLessThanOrEqualInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnLessThanOrEqualInstruction.prototype.constructor = BranchOnLessThanOrEqualInstruction;
    BranchOnLessThanOrEqualInstruction.prototype.opcode = 'B.LE';

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
    BranchOnLessThanOrEqualInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        const isLessThanOrEqual = (simulatorContext.negative !== simulatorContext.overflow) || simulatorContext.zero;

        return isLessThanOrEqual ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnLessThanOrEqualInstruction.prototype.toComment = function() {
        return `// if (N != V) or (Z == 1) go to ${this._properties[0]}`;
    };
}
