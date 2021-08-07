'use strict';

/* exported buildBranchOnZeroInstructionPrototype */
/* global BranchRegisterLabelFormatInstruction */

/**
    Instruction to branch if register is 0.
    @class BranchOnZeroInstruction
    @extends BranchRegisterLabelFormatInstruction
*/
function BranchOnZeroInstruction() {
    BranchRegisterLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchRegisterLabelFormatInstruction and attach prototype functions to BranchOnZeroInstruction.
    @method buildBranchOnZeroInstructionPrototype
    @return {void}
*/
function buildBranchOnZeroInstructionPrototype() {
    BranchOnZeroInstruction.prototype = new BranchRegisterLabelFormatInstruction();
    BranchOnZeroInstruction.prototype.constructor = BranchOnZeroInstruction;
    BranchOnZeroInstruction.prototype.opcode = 'CBZ';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    BranchOnZeroInstruction.prototype.execute = function(registers, memory, programCounter) {
        const doesRegisterStoreZero = registers.lookupByRegisterName(this._properties[0]).isZero();

        return doesRegisterStoreZero ? this._properties[1] : (programCounter + 1);
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnZeroInstruction.prototype.toComment = function() {
        return `// if (${this._properties[0]} == 0) go to ${this._properties[1]}`;
    };
}
