'use strict';

/* exported buildBranchIfLessInstructionPrototype */
/* global BranchFormatInstruction, BranchIfNotEqualInstruction, SetOnLessThanInstruction */

/**
    Pseudo-instruction for branch if less than.
    @class BranchIfLessInstruction
    @extends BranchFormatInstruction
*/
function BranchIfLessInstruction() {
    BranchFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchFormatInstruction and attach prototype functions to BranchIfLessInstruction.
    @method buildBranchIfLessInstructionPrototype
    @return {void}
*/
function buildBranchIfLessInstructionPrototype() {
    BranchIfLessInstruction.prototype = new BranchFormatInstruction();
    BranchIfLessInstruction.prototype.constructor = BranchIfLessInstruction;
    BranchIfLessInstruction.prototype.opcode = 'blt';

    /**
        Return a comment the explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    BranchIfLessInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} < ${this._properties[1]}) go to ${this._properties[2]}`;
    };

    /**
        Return the list of machine instructions that represent this instruction.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    BranchIfLessInstruction.prototype.toMachineInstructions = function() {
        return [
            new SetOnLessThanInstruction('$at', this._properties[0], this._properties[1]),
            new BranchIfNotEqualInstruction('$at', '$zero', this._properties[2]),
        ];
    };

    /**
        Return this instruction as the comment for the associated machine instruction.
        @method toMachineInstructionComments
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    BranchIfLessInstruction.prototype.toMachineInstructionComments = function() {
        return [ this.toString(), this.toString() ];
    };
}
