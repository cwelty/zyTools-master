'use strict';

/* exported buildBranchOnEqualInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if zero conditional flag is set.
    @class BranchOnEqualInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnEqualInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnEqualInstruction.
    @method buildBranchOnEqualInstructionPrototype
    @return {void}
*/
function buildBranchOnEqualInstructionPrototype() {
    BranchOnEqualInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnEqualInstruction.prototype.constructor = BranchOnEqualInstruction;
    BranchOnEqualInstruction.prototype.opcode = 'B.EQ';

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
    BranchOnEqualInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.zero ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnEqualInstruction.prototype.toComment = function() {
        return `// if (Z != 0) go to ${this._properties[0]}`;
    };
}
