'use strict';

/* exported buildBranchOnUnsignedLessThanOrEqualInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if carry conditional flag is 0 or zero flag is 1.
    @class BranchOnUnsignedLessThanOrEqualInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnUnsignedLessThanOrEqualInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnUnsignedLessThanOrEqualInstruction.
    @method buildBranchOnUnsignedLessThanOrEqualInstructionPrototype
    @return {void}
*/
function buildBranchOnUnsignedLessThanOrEqualInstructionPrototype() {
    BranchOnUnsignedLessThanOrEqualInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnUnsignedLessThanOrEqualInstruction.prototype.constructor = BranchOnUnsignedLessThanOrEqualInstruction;
    BranchOnUnsignedLessThanOrEqualInstruction.prototype.opcode = 'B.LS';

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
    BranchOnUnsignedLessThanOrEqualInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return (!simulatorContext.carry || simulatorContext.zero) ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnUnsignedLessThanOrEqualInstruction.prototype.toComment = function() {
        return `// if (C == 0) or (Z == 1) go to ${this._properties[0]}`;
    };
}
