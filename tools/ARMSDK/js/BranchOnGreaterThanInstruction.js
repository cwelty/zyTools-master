'use strict';

/* exported buildBranchOnGreaterThanInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if negative conditional flag is equal to the overflow conditional flag, and zero flag is 0.
    @class BranchOnGreaterThanInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnGreaterThanInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnGreaterThanInstruction.
    @method buildBranchOnGreaterThanInstructionPrototype
    @return {void}
*/
function buildBranchOnGreaterThanInstructionPrototype() {
    BranchOnGreaterThanInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnGreaterThanInstruction.prototype.constructor = BranchOnGreaterThanInstruction;
    BranchOnGreaterThanInstruction.prototype.opcode = 'B.GT';

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
    BranchOnGreaterThanInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        const isGreaterThan = !simulatorContext.zero && (simulatorContext.negative === simulatorContext.overflow);

        return isGreaterThan ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnGreaterThanInstruction.prototype.toComment = function() {
        return `// if (Z == 0) and (N == V) go to ${this._properties[0]}`;
    };
}
