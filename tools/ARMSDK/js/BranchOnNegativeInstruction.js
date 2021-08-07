'use strict';

/* exported buildBranchOnNegativeInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if negative conditional flag is 1.
    @class BranchOnNegativeInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnNegativeInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnNegativeInstruction.
    @method buildBranchOnNegativeInstructionPrototype
    @return {void}
*/
function buildBranchOnNegativeInstructionPrototype() {
    BranchOnNegativeInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnNegativeInstruction.prototype.constructor = BranchOnNegativeInstruction;
    BranchOnNegativeInstruction.prototype.opcode = 'B.MI';

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
    BranchOnNegativeInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return simulatorContext.negative ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnNegativeInstruction.prototype.toComment = function() {
        return `// if (N == 1) go to ${this._properties[0]}`;
    };
}
