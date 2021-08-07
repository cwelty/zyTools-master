'use strict';

/* exported buildBranchOnLessThanInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if negative conditional flag is not equal to the overflow conditional flag.
    @class BranchOnLessThanInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnLessThanInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnLessThanInstruction.
    @method buildBranchOnLessThanInstructionPrototype
    @return {void}
*/
function buildBranchOnLessThanInstructionPrototype() {
    BranchOnLessThanInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnLessThanInstruction.prototype.constructor = BranchOnLessThanInstruction;
    BranchOnLessThanInstruction.prototype.opcode = 'B.LT';

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
    BranchOnLessThanInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return (simulatorContext.negative === simulatorContext.overflow) ? (programCounter + 1) : this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnLessThanInstruction.prototype.toComment = function() {
        return `// if (N != V) go to ${this._properties[0]}`;
    };
}
