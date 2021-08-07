'use strict';

/* exported buildBranchOnNotEqualInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if zero conditional flag is not set.
    @class BranchOnNotEqualInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnNotEqualInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnNotEqualInstruction.
    @method buildBranchOnNotEqualInstructionPrototype
    @return {void}
*/
function buildBranchOnNotEqualInstructionPrototype() {
    BranchOnNotEqualInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnNotEqualInstruction.prototype.constructor = BranchOnNotEqualInstruction;
    BranchOnNotEqualInstruction.prototype.opcode = 'B.NE';

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
    BranchOnNotEqualInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.zero ? (programCounter + 1) : this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnNotEqualInstruction.prototype.toComment = function() {
        return `// if (Z == 0) go to ${this._properties[0]}`;
    };
}
