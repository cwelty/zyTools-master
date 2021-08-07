'use strict';

/* exported buildMIPSzyBranchIfLessInstructionPrototype */

/**
    Pseudo-instruction for branch if less.
    @class MIPSzyBranchIfLessInstruction
    @extends BranchIfLessInstruction
*/
function MIPSzyBranchIfLessInstruction(...args) {
    this.newBranchIfLessInstruction.constructor.apply(this, args);
}

/**
    Inherit BranchIfLessInstruction and attach prototype functions to MIPSzyBranchIfLessInstruction.
    @method buildMIPSzyBranchIfLessInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyBranchIfLessInstructionPrototype(MIPSSDK) {
    MIPSzyBranchIfLessInstruction.prototype = MIPSSDK.inheritBranchIfLessInstruction();
    MIPSzyBranchIfLessInstruction.prototype.constructor = MIPSzyBranchIfLessInstruction;
    MIPSzyBranchIfLessInstruction.prototype.newBranchIfLessInstruction = MIPSSDK.inheritBranchIfLessInstruction();

    /**
        Return a comment that explains how this instruction works.
        @method toComment
        @return {String} The comment for instruction.
    */
    MIPSzyBranchIfLessInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} < ${this._properties[1]}) branch to ${this._properties[2]}`;
    };
}
