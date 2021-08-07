'use strict';

/* exported buildBranchWithLinkInstructionPrototype */
/* global BranchLabelFormatInstruction, numberOfBytesInAddress */

/**
    Instruction to unconditionally branch.
    @class BranchWithLinkInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchWithLinkInstruction(...args) {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchWithLinkInstruction.
    @method buildBranchWithLinkInstructionPrototype
    @return {void}
*/
function buildBranchWithLinkInstructionPrototype() {
    BranchWithLinkInstruction.prototype = new BranchLabelFormatInstruction();
    BranchWithLinkInstruction.prototype.constructor = BranchWithLinkInstruction;
    BranchWithLinkInstruction.prototype.opcode = 'BL';

    /**
        Execute a jump and link.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {String} The label to jump to.
    */
    BranchWithLinkInstruction.prototype.execute = function(registers, memory, programCounter) {

        // Store the next instruction address in X30.
        const nextProgramCounter = programCounter + 1;
        const nextInstructionAddress = memory.instructionStartAddress + (nextProgramCounter * numberOfBytesInAddress);

        registers.lookupByRegisterName('X30').setValue(nextInstructionAddress);

        return this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchWithLinkInstruction.prototype.toComment = function() {
        return `// X30 = PC + 4; go to ${this._properties[0]}`;
    };
}
