'use strict';

/* exported buildBranchIfGreaterOrEqualInstructionPrototype */
/* global BranchFormatInstruction, BranchIfEqualInstruction, SetOnLessThanInstruction */

/**
    Pseudo-instruction for branch if greater than or equal to.
    @class BranchIfGreaterOrEqualInstruction
    @extends BranchFormatInstruction
*/
function BranchIfGreaterOrEqualInstruction() {
    BranchFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchFormatInstruction and attach prototype functions to BranchIfGreaterOrEqualInstruction.
    @method buildBranchIfGreaterOrEqualInstructionPrototype
    @return {void}
*/
function buildBranchIfGreaterOrEqualInstructionPrototype() {
    BranchIfGreaterOrEqualInstruction.prototype = new BranchFormatInstruction();
    BranchIfGreaterOrEqualInstruction.prototype.constructor = BranchIfGreaterOrEqualInstruction;
    BranchIfGreaterOrEqualInstruction.prototype.opcode = 'bge';

    /**
        Return a comment the explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    BranchIfGreaterOrEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} >= ${this._properties[1]}) go to ${this._properties[2]}`;
    };

    /**
        Return the list of machine instructions that represent this instruction.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    BranchIfGreaterOrEqualInstruction.prototype.toMachineInstructions = function() {
        return [
            new SetOnLessThanInstruction('$at', this._properties[0], this._properties[1]),
            new BranchIfEqualInstruction('$at', '$zero', this._properties[2]),
        ];
    };

    /**
        Return this instruction as the comment for the associated machine instruction.
        @method toMachineInstructionComments
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    BranchIfGreaterOrEqualInstruction.prototype.toMachineInstructionComments = function() {
        return [ this.toString(), this.toString() ];
    };
}
