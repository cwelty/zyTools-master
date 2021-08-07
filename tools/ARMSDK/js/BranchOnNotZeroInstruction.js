'use strict';

/* exported buildBranchOnNotZeroInstructionPrototype */
/* global BranchRegisterLabelFormatInstruction */

/**
    Instruction to branch if register is not 0.
    @class BranchOnNotZeroInstruction
    @extends BranchRegisterLabelFormatInstruction
*/
function BranchOnNotZeroInstruction() {
    BranchRegisterLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchRegisterLabelFormatInstruction and attach prototype functions to BranchOnNotZeroInstruction.
    @method buildBranchOnNotZeroInstructionPrototype
    @return {void}
*/
function buildBranchOnNotZeroInstructionPrototype() {
    BranchOnNotZeroInstruction.prototype = new BranchRegisterLabelFormatInstruction();
    BranchOnNotZeroInstruction.prototype.constructor = BranchOnNotZeroInstruction;
    BranchOnNotZeroInstruction.prototype.opcode = 'CBNZ';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @param {Registers} registers The program's registers.
        @param {Memory} memory The program's memory.
        @param {Number} programCounter The current program counter.
        @return {Number} The program counter after execution.
    */
    BranchOnNotZeroInstruction.prototype.execute = function(registers, memory, programCounter) {
        const doesRegisterStoreZero = registers.lookupByRegisterName(this._properties[0]).isZero();

        return doesRegisterStoreZero ? (programCounter + 1) : this._properties[1];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchOnNotZeroInstruction.prototype.toComment = function() {
        return `// if (${this._properties[0]} != 0) go to ${this._properties[1]}`;
    };
}
