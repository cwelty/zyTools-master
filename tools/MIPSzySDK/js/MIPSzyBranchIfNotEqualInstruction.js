'use strict';

/* exported buildMIPSzyBranchIfNotEqualInstructionPrototype */

/**
    Pseudo-instruction for branch if not equal.
    @class MIPSzyBranchIfNotEqualInstruction
    @extends BranchIfNotEqualInstruction
*/
function MIPSzyBranchIfNotEqualInstruction(...args) {
    this.newBranchIfNotEqualInstruction.constructor.apply(this, args);
}

/**
    Inherit BranchIfNotEqualInstruction and attach prototype functions to MIPSzyBranchIfNotEqualInstruction.
    @method buildMIPSzyBranchIfNotEqualInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyBranchIfNotEqualInstructionPrototype(MIPSSDK) {
    MIPSzyBranchIfNotEqualInstruction.prototype = MIPSSDK.inheritBranchIfNotEqualInstruction();
    MIPSzyBranchIfNotEqualInstruction.prototype.constructor = MIPSzyBranchIfNotEqualInstruction;
    MIPSzyBranchIfNotEqualInstruction.prototype.newBranchIfNotEqualInstruction = MIPSSDK.inheritBranchIfNotEqualInstruction();

    /**
        Return a comment that explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    MIPSzyBranchIfNotEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} != ${this._properties[1]}) branch to ${this._properties[2]}`;
    };
}
