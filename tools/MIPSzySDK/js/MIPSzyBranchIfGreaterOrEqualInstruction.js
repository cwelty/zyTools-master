'use strict';

/* exported buildMIPSzyBranchIfGreaterOrEqualInstructionPrototype */

/**
    Pseudo-instruction for branch if greater or equal.
    @class MIPSzyBranchIfGreaterOrEqualInstruction
    @extends BranchIfGreaterOrEqualInstruction
*/
function MIPSzyBranchIfGreaterOrEqualInstruction(...args) {
    this.newBranchIfGreaterOrEqualInstruction.constructor.apply(this, args);
}

/**
    Inherit BranchIfGreaterOrEqualInstruction and attach prototype functions to MIPSzyBranchIfGreaterOrEqualInstruction.
    @method buildMIPSzyBranchIfGreaterOrEqualInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyBranchIfGreaterOrEqualInstructionPrototype(MIPSSDK) {
    MIPSzyBranchIfGreaterOrEqualInstruction.prototype = MIPSSDK.inheritBranchIfGreaterOrEqualInstruction();
    MIPSzyBranchIfGreaterOrEqualInstruction.prototype.constructor = MIPSzyBranchIfGreaterOrEqualInstruction;
    MIPSzyBranchIfGreaterOrEqualInstruction.prototype.newBranchIfGreaterOrEqualInstruction = MIPSSDK.inheritBranchIfGreaterOrEqualInstruction(); // eslint-disable-line max-len

    /**
        Return a comment that explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    MIPSzyBranchIfGreaterOrEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} >= ${this._properties[1]}) branch to ${this._properties[2]}`;
    };
}
