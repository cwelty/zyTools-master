'use strict';

/* exported buildMIPSzyBranchIfGreaterInstructionPrototype */

/**
    Pseudo-instruction for branch if greater.
    @class MIPSzyBranchIfGreaterInstruction
    @extends BranchIfGreaterInstruction
*/
function MIPSzyBranchIfGreaterInstruction(...args) {
    this.newBranchIfGreaterInstruction.constructor.apply(this, args);
}

/**
    Inherit BranchIfGreaterInstruction and attach prototype functions to MIPSzyBranchIfGreaterInstruction.
    @method buildMIPSzyBranchIfGreaterInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyBranchIfGreaterInstructionPrototype(MIPSSDK) {
    MIPSzyBranchIfGreaterInstruction.prototype = MIPSSDK.inheritBranchIfGreaterInstruction();
    MIPSzyBranchIfGreaterInstruction.prototype.constructor = MIPSzyBranchIfGreaterInstruction;
    MIPSzyBranchIfGreaterInstruction.prototype.newBranchIfGreaterInstruction = MIPSSDK.inheritBranchIfGreaterInstruction();

    /**
        Return a comment that explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    MIPSzyBranchIfGreaterInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} > ${this._properties[1]}) branch to ${this._properties[2]}`;
    };
}
