'use strict';

/* exported buildBranchInstructionPrototype */
/* global BranchLabelFormatInstruction */

/**
    Instruction to unconditionally branch.
    @class BranchInstruction
    @extends BranchLabelFormatInstruction
*/
function BranchInstruction() {
    BranchLabelFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchLabelFormatInstruction and attach prototype functions to BranchInstruction.
    @method buildBranchInstructionPrototype
    @return {void}
*/
function buildBranchInstructionPrototype() {
    BranchInstruction.prototype = new BranchLabelFormatInstruction();
    BranchInstruction.prototype.constructor = BranchInstruction;
    BranchInstruction.prototype.opcode = 'B';

    /**
        See InstructionSetSDK's Instruction for details.
        @method execute
        @return {String} The label to jump to.
    */
    BranchInstruction.prototype.execute = function() {
        return this._properties[0];
    };

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    BranchInstruction.prototype.toComment = function() {
        return `// go to ${this._properties[0]}`;
    };
}
