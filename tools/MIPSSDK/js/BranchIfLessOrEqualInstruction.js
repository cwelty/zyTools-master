'use strict';

/* exported buildBranchIfLessOrEqualInstructionPrototype */
/* global BranchFormatInstruction, BranchIfEqualInstruction, SetOnLessThanInstruction */

/**
    Pseudo-instruction for branch if less than or equal to.
    @class BranchIfLessOrEqualInstruction
    @extends BranchFormatInstruction
*/
function BranchIfLessOrEqualInstruction() {
    BranchFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchFormatInstruction and attach prototype functions to BranchIfLessOrEqualInstruction.
    @method buildBranchIfLessOrEqualInstructionPrototype
    @return {void}
*/
function buildBranchIfLessOrEqualInstructionPrototype() {
    BranchIfLessOrEqualInstruction.prototype = new BranchFormatInstruction();
    BranchIfLessOrEqualInstruction.prototype.constructor = BranchIfLessOrEqualInstruction;
    BranchIfLessOrEqualInstruction.prototype.opcode = 'ble';

    /**
        Return a comment the explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    BranchIfLessOrEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} <= ${this._properties[1]}) go to ${this._properties[2]}`;
    };

    /**
        Return the list of machine instructions that represent this instruction.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    BranchIfLessOrEqualInstruction.prototype.toMachineInstructions = function() {
        return [
            new SetOnLessThanInstruction('$at', this._properties[1], this._properties[0]),
            new BranchIfEqualInstruction('$at', '$zero', this._properties[2]),
        ];
    };

    /**
        Return this instruction as the comment for the associated machine instruction.
        @method toMachineInstructionComments
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    BranchIfLessOrEqualInstruction.prototype.toMachineInstructionComments = function() {
        return [ this.toString(), this.toString() ];
    };
}
