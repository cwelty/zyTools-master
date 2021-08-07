'use strict';

/* exported buildMIPSzyBranchIfLessOrEqualInstructionPrototype */

/**
    Pseudo-instruction for branch if less or equal.
    @class MIPSzyBranchIfLessOrEqualInstruction
    @extends BranchIfLessOrEqualInstruction
*/
function MIPSzyBranchIfLessOrEqualInstruction(...args) {
    this.newBranchIfLessOrEqualInstruction.constructor.apply(this, args);
}

/**
    Inherit BranchIfLessOrEqualInstruction and attach prototype functions to MIPSzyBranchIfLessOrEqualInstruction.
    @method buildMIPSzyBranchIfLessOrEqualInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyBranchIfLessOrEqualInstructionPrototype(MIPSSDK) {
    MIPSzyBranchIfLessOrEqualInstruction.prototype = MIPSSDK.inheritBranchIfLessOrEqualInstruction();
    MIPSzyBranchIfLessOrEqualInstruction.prototype.constructor = MIPSzyBranchIfLessOrEqualInstruction;
    MIPSzyBranchIfLessOrEqualInstruction.prototype.newBranchIfLessOrEqualInstruction = MIPSSDK.inheritBranchIfLessOrEqualInstruction();

    /**
        Return a comment that explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    MIPSzyBranchIfLessOrEqualInstruction.prototype.toComment = function() {
        return `# if(${this._properties[0]} <= ${this._properties[1]}) branch to ${this._properties[2]}`;
    };
}
