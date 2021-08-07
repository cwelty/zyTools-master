'use strict';

/* global Instruction */

/**
    Model an expression area text-only instruction to the user.
    @class TextInstruction
    @extends Instruction
    @constructor
    @param {String} text The instruction given to the user
    @param {Number} numbering The order number of this instruction in all the instructions..
*/
function TextInstruction(text, numbering) {
    Instruction.prototype.constructor.call(this, numbering);
    this.text = text;
}

TextInstruction.prototype = new Instruction();
TextInstruction.prototype.constructor = TextInstruction;
