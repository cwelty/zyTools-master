'use strict';

/* global Instruction */

/**
    Model an expression area instruction telling the user to select a term.
    @class TermInstruction
    @extends Instruction
    @constructor
    @param {MathSymbol} term The term the user is shown in this instruction.
    @param {MathSymbol} lawSide The side of the law containing term.
    @param {Number} numbering The order number of this instruction in all the instructions.
*/
function TermInstruction(term, lawSide, numbering) {
    Instruction.prototype.constructor.call(this, numbering);
    this.term = term;
    this.termHTML = '';
    this.lawSide = lawSide;
    this.lawSideHTML = '';
}

TermInstruction.prototype = new Instruction();
TermInstruction.prototype.constructor = TermInstruction;
