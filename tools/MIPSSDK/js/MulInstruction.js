'use strict';

/* exported buildMulInstructionPrototype */
/* global MultInstruction, MfloInstruction, RegisterFormatInstruction */

/**
    MulInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
    @class MulInstruction
    @extends RegisterFormatInstruction
    @constructor
*/
function MulInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments); // eslint-disable-line
}

/**
    Inherit RegisterFormatInstruction and attach prototype functions to MulInstruction.
    @method buildMulInstructionPrototype
    @return {void}
*/
function buildMulInstructionPrototype() {
    MulInstruction.prototype = new RegisterFormatInstruction();
    MulInstruction.prototype.constructor = MulInstruction;
    MulInstruction.prototype.opcode = 'mul';

    /**
        See InstructionSetSDK's Instruction for details.
        @method toComment
        @return {String} A comment explaining this instruction.
    */
    MulInstruction.prototype.toComment = function() {
        return `# ${this._properties[0]} = ${this._properties[1]} * ${this._properties[2]}`;
    };

    /**
        Return the list of machine instructions that represent this instruction.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    MulInstruction.prototype.toMachineInstructions = function() {
        return [
            new MultInstruction(this._properties[1], this._properties[2]),
            new MfloInstruction(this._properties[0]),
        ];
    };

    /**
        Return this instruction as the comment for the associated machine instruction.
        @method toMachineInstructionComments
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    MulInstruction.prototype.toMachineInstructionComments = function() {
        return [ this.toString(), this.toString() ];
    };
}
