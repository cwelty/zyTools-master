'use strict';

/* exported Instruction */

/**
    Model an expression area instruction to the user.
    @class Instruction
    @constructor
    @param {Number} numbering The order number of this instruction in all the instructions.
*/
function Instruction(numbering) {
    this.numbering = numbering;
    this.isShown = this.isDisabled = false;
}
