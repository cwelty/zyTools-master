'use strict';

/* exported buildBranchOnOverflowSetInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if overflow conditional flag is 1.
    @class BranchOnOverflowSetInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnOverflowSetInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnOverflowSetInstruction.
    @method buildBranchOnOverflowSetInstructionPrototype
    @return {void}
*/
function buildBranchOnOverflowSetInstructionPrototype() {
    BranchOnOverflowSetInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnOverflowSetInstruction.prototype.constructor = BranchOnOverflowSetInstruction;
    BranchOnOverflowSetInstruction.prototype.opcode = 'B.VS';

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
    BranchOnOverflowSetInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.overflow ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnOverflowSetInstruction.prototype.toComment = function() {
        return `// if (V == 1) go to ${this._properties[0]}`;
    };
}
