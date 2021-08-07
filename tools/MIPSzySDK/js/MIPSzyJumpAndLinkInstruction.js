'use strict';

/* exported buildMIPSzyJumpAndLinkInstructionPrototype */

/**
    Jump and link instruction for MIPSzy.
    @class MIPSzyJumpAndLinkInstruction
    @extends JumpAndLinkInstruction
*/
function MIPSzyJumpAndLinkInstruction(...args) {
    this.newJumpAndLinkInstruction.constructor.apply(this, args);
}

/**
    Inherit JumpAndLinkInstruction and attach prototype functions to MIPSzyJumpAndLinkInstruction.
    @method buildMIPSzyJumpAndLinkInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyJumpAndLinkInstructionPrototype(MIPSSDK) {
    MIPSzyJumpAndLinkInstruction.prototype = MIPSSDK.inheritJumpAndLinkInstruction();
    MIPSzyJumpAndLinkInstruction.prototype.constructor = MIPSzyJumpAndLinkInstruction;
    MIPSzyJumpAndLinkInstruction.prototype.newJumpAndLinkInstruction = MIPSSDK.inheritJumpAndLinkInstruction();

    /**
        Return a comment describing this jump and link.
        @method toComment
        @return {String} A comment describing this jump and link.
    */
    MIPSzyJumpAndLinkInstruction.prototype.toComment = function() {
        return `# $ra = PC + 4; jump to ${this._properties[0]}`;
    };
}
