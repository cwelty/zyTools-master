'use strict';

/* exported buildMIPSzyJumpInstructionPrototype */

/**
    Jump instruction for MIPSzy.
    @class MIPSzyJumpInstruction
    @extends JumpInstruction
*/
function MIPSzyJumpInstruction(...args) {
    this.newJumpInstruction.constructor.apply(this, args);
}

/**
    Inherit JumpInstruction and attach prototype functions to MIPSzyJumpInstruction.
    @method buildMIPSzyJumpInstructionPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyJumpInstructionPrototype(MIPSSDK) {
    MIPSzyJumpInstruction.prototype = MIPSSDK.inheritJumpInstruction();
    MIPSzyJumpInstruction.prototype.constructor = MIPSzyJumpInstruction;
    MIPSzyJumpInstruction.prototype.newJumpInstruction = MIPSSDK.inheritJumpInstruction();

    /**
        Return a comment describing this instruction.
        @method toComment
        @return {String} A comment describing this instruction.
    */
    MIPSzyJumpInstruction.prototype.toComment = function() {
        return `# jump to ${this._properties[0]}`;
    };
}
