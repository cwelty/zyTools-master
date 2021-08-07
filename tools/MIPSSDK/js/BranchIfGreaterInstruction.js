'use strict';

/* exported buildBranchIfGreaterInstructionPrototype */
/* global BranchFormatInstruction, BranchIfNotEqualInstruction, SetOnLessThanInstruction */

/**
    Pseudo-instruction for branch if greater.
    @class BranchIfGreaterInstruction
    @extends BranchFormatInstruction
*/
function BranchIfGreaterInstruction() {
    BranchFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit BranchFormatInstruction and attach prototype functions to BranchIfGreaterInstruction.
    @method buildBranchIfGreaterInstructionPrototype
    @return {void}
*/
function buildBranchIfGreaterInstructionPrototype() {
    BranchIfGreaterInstruction.prototype = new BranchFormatInstruction();
    BranchIfGreaterInstruction.prototype.constructor = BranchIfGreaterInstruction;
    BranchIfGreaterInstruction.prototype.opcode = 'bgt';

    /**
        Return a comment the explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    BranchIfGreaterInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} > ${this._properties[1]}) go to ${this._properties[2]}`;
    };

    /**
        Return the list of machine instructions that represent this instruction.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    BranchIfGreaterInstruction.prototype.toMachineInstructions = function() {
        return [
            new SetOnLessThanInstruction('$at', this._properties[1], this._properties[0]),
            new BranchIfNotEqualInstruction('$at', '$zero', this._properties[2]),
        ];
    };

    /**
        Return this instruction as the comment for the associated machine instruction.
        @method toMachineInstructionComments
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    BranchIfGreaterInstruction.prototype.toMachineInstructionComments = function() {
        return [ this.toString(), this.toString() ];
    };
}
