'use strict';

/* exported buildBranchOnUnsignedGreaterThanInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to branch if carry conditional flag is 1 and zero flag is 0.
    @class BranchOnUnsignedGreaterThanInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchOnUnsignedGreaterThanInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchOnUnsignedGreaterThanInstruction.
    @method buildBranchOnUnsignedGreaterThanInstructionPrototype
    @return {void}
*/
function buildBranchOnUnsignedGreaterThanInstructionPrototype() {
    BranchOnUnsignedGreaterThanInstruction.prototype = new BranchLabelFormatInstruction();
    BranchOnUnsignedGreaterThanInstruction.prototype.constructor = BranchOnUnsignedGreaterThanInstruction;
    BranchOnUnsignedGreaterThanInstruction.prototype.opcode = 'B.HI';

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
    BranchOnUnsignedGreaterThanInstruction.prototype.execute = function(registers, memory, programCounter, labels, simulatorContext) {
        return (simulatorContext.carry && !simulatorContext.zero) ? this._properties[0] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnUnsignedGreaterThanInstruction.prototype.toComment = function() {
        return `// if (C == 1) and (Z == 0) go to ${this._properties[0]}`;
    };
}
