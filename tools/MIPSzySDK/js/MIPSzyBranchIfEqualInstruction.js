'use strict';

/* exported buildMIPSzyBranchIfEqualInstructionPrototype */

/**
    Pseudo-instruction for branch if equal.
    @class MIPSzyBranchIfEqualInstruction
    @extends BranchIfEqualInstruction
*/
function MIPSzyBranchIfEqualInstruction(...args) {
    this.newBranchIfEqualInstruction.constructor.apply(this, args);
}

/**
    Inherit BranchIfEqualInstruction and attach prototype functions to MIPSzyBranchIfEqualInstruction.
    @method buildMIPSzyBranchIfEqualInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyBranchIfEqualInstructionPrototype(MIPSSDK) {
    MIPSzyBranchIfEqualInstruction.prototype = MIPSSDK.inheritBranchIfEqualInstruction();
    MIPSzyBranchIfEqualInstruction.prototype.constructor = MIPSzyBranchIfEqualInstruction;
    MIPSzyBranchIfEqualInstruction.prototype.newBranchIfEqualInstruction = MIPSSDK.inheritBranchIfEqualInstruction();

    /**
        Return a comment that explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    MIPSzyBranchIfEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} == ${this._properties[1]}) branch to ${this._properties[2]}`;
    };
}
