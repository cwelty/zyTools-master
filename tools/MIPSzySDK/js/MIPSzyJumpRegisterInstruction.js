'use strict';

/* exported buildMIPSzyJumpRegisterInstructionPrototype */

/**
    Jump register instruction for MIPSzy.
    @class MIPSzyJumpRegisterInstruction
    @extends JumpRegisterInstruction
*/
function MIPSzyJumpRegisterInstruction(...args) {
    this.newJumpRegisterInstruction.constructor.apply(this, args);
}

/**
    Inherit JumpRegisterInstruction and attach prototype functions to MIPSzyJumpRegisterInstruction.
    @method buildMIPSzyJumpRegisterInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyJumpRegisterInstructionPrototype(MIPSSDK) {
    MIPSzyJumpRegisterInstruction.prototype = MIPSSDK.inheritJumpRegisterInstruction();
    MIPSzyJumpRegisterInstruction.prototype.constructor = MIPSzyJumpRegisterInstruction;
    MIPSzyJumpRegisterInstruction.prototype.newJumpRegisterInstruction = MIPSSDK.inheritJumpRegisterInstruction();

    /**
        Return a comment describing this jump register.
        @method toComment
        @return {String} A comment describing this jump register.
    */
    MIPSzyJumpRegisterInstruction.prototype.toComment = function() {
        return `# jump to ${this._properties[0]}`;
    };
}
