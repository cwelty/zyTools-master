'use strict';

/* global JumpLabelFormatInstruction */
/* exported buildJumpInstructionPrototype */

/*
    JumpInstruction inherits JumpLabelFormatInstruction.
    See JumpLabelFormatInstruction for details.
*/
function JumpInstruction() {
    JumpLabelFormatInstruction.prototype.constructor.apply(this, arguments);
}

/**
    Inherit JumpLabelFormatInstruction and attach prototype functions to JumpInstruction.
    @method buildJumpInstructionPrototype
    @return {void}
*/
function buildJumpInstructionPrototype() {
    JumpInstruction.prototype = new JumpLabelFormatInstruction();
    JumpInstruction.prototype.constructor = JumpInstruction;
    JumpInstruction.prototype.opcode = 'j';

    /**
        Jump to the label.
        See InstructionSetSDK's Instruction for details.
        @method execute
        @return {String} The label to jump to.
    */
    JumpInstruction.prototype.execute = function() {
        return this._properties[0];
    };

    // See InstructionSetSDK's Instruction for details.
    JumpInstruction.prototype.toComment = function() {
        return '# go to ' + this._properties[0];
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    JumpInstruction.prototype.getOpcodeBits = function() {
        return '000010';
    };
}
