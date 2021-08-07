'use strict';

/* exported buildMoveInstructionPrototype */
/* global TwoRegistersFormatInstruction, AddImmediateInstruction */

/**
    MoveInstruction inherits TwoRegistersFormatInstruction.
    See TwoRegistersFormatInstruction for details.
    @class MoveInstruction
    @extends TwoRegistersFormatInstruction
    @constructor
*/
function MoveInstruction() {
    TwoRegistersFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit TwoRegistersFormatInstruction and attach prototype functions to MoveInstruction.
    @method buildMoveInstructionPrototype
    @return {void}
*/
function buildMoveInstructionPrototype() {
    MoveInstruction.prototype = new TwoRegistersFormatInstruction();
    MoveInstruction.prototype.constructor = MoveInstruction;
    MoveInstruction.prototype.opcode = 'move';

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    MoveInstruction.prototype.toComment = function() {
        return `# ${this._properties[0]} ← ${this._properties[1]}`;
    };

    /**
        Return the associated move instruction.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    MoveInstruction.prototype.toMachineInstructions = function() {
        return [ new AddImmediateInstruction(this._properties[0], this._properties[1], 0) ];
    };

    /**
        Return this instruction as the comment for the associated machine instruction.
        @method toMachineInstructionComments
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    MoveInstruction.prototype.toMachineInstructionComments = function() {
        return [ this.toString() ];
    };

    /**
        Throw an error as move is a pseudo-instruction.
        @method toMachineInstructionBitString
        @return {void}
    */
    MoveInstruction.prototype.toMachineInstructionBitString = function() {
        throw new Error('Move is a pseudo-instruction, so does not have a bit representation');
    };
}
