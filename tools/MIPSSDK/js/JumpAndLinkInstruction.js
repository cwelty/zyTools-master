'use strict';

/* exported buildJumpAndLinkInstructionPrototype */
/* global JumpLabelFormatInstruction, numberOfBytesInAddress */

/**
    Model a jump and link instruction.
    @class JumpAndLinkInstruction
    @extends JumpLabelFormatInstruction
    @constructor
*/
function JumpAndLinkInstruction(...args) {
    JumpLabelFormatInstruction.prototype.constructor.apply(this, args);
}

/**
    Inherit JumpLabelFormatInstruction and attach prototype functions to JumpAndLinkInstruction.
    @method buildJumpAndLinkInstructionPrototype
    @return {void}
*/
function buildJumpAndLinkInstructionPrototype() {
    JumpAndLinkInstruction.prototype = new JumpLabelFormatInstruction();
    JumpAndLinkInstruction.prototype.constructor = JumpAndLinkInstruction;
    JumpAndLinkInstruction.prototype.opcode = 'jal';

    /**
        Execute a jump and link.
        @method execute
        @param {Registers} registers The registers to execute on.
        @param {Memory} memory The memory to execute on.
        @param {Number} programCounter The current program counter of the simulation.
        @return {Number} The updated program counter.
    */
    JumpAndLinkInstruction.prototype.execute = function(registers, memory, programCounter) {

        // Store the next instruction address in $ra.
        const nextProgramCounter = programCounter + 1;
        const nextInstructionAddress = memory.instructionStartAddress + (nextProgramCounter * numberOfBytesInAddress);

        registers.lookupByRegisterName('$ra').setValue(nextInstructionAddress);

        return this._properties[0];
    };

    /**
        Return a comment describing this jump and link.
        @method toComment
        @return {String} A comment describing this jump and link.
    */
    JumpAndLinkInstruction.prototype.toComment = function() {
        return `# $ra = PC + 4; go to ${this._properties[0]}`;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    JumpAndLinkInstruction.prototype.getOpcodeBits = function() {
        return '000011';
    };
}
