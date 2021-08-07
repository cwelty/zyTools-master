'use strict';

/* exported buildMIPSzyInstructionFactoryPrototype */
/* global MIPSzyBranchIfGreaterOrEqualInstruction, MIPSzyBranchIfGreaterInstruction, MIPSzyBranchIfLessInstruction,
   MIPSzyBranchIfLessOrEqualInstruction, MIPSzyJumpInstruction, MIPSzyJumpAndLinkInstruction, MIPSzyJumpRegisterInstruction,
   MIPSzyBranchIfEqualInstruction, MIPSzyBranchIfNotEqualInstruction */

/**
    Make instructions based on a given opcode.
    @class MIPSzyInstructionFactory
    @extends InstructionFactory
    @return {void}
*/
function MIPSzyInstructionFactory(...args) {
    this.newInstructionFactory.constructor.apply(this, args);
}

/**
    Inherit MIPSSDK's InstructionFactory and build prototype.
    @method buildMIPSzyInstructionFactoryPrototype
    @param {MIPSSDK} MIPSSDK Reference to the MIPS SDK.
    @return {void}
*/
function buildMIPSzyInstructionFactoryPrototype(MIPSSDK) {
    MIPSzyInstructionFactory.prototype = MIPSSDK.inheritInstructionFactory();
    MIPSzyInstructionFactory.prototype.constructor = MIPSzyInstructionFactory;
    MIPSzyInstructionFactory.prototype.newInstructionFactory = MIPSSDK.inheritInstructionFactory();

    /**
        Make an Instruction based on the given opcode.
        @method make
        @param {String} opcode The opcode of the instruction to make.
        @return {Instruction} Reference to the made instruction.
    */
    MIPSzyInstructionFactory.prototype.make = function(opcode) { // eslint-disable-line complexity
        switch (opcode) {
            case 'bge':
                return new MIPSzyBranchIfGreaterOrEqualInstruction();
            case 'bgt':
                return new MIPSzyBranchIfGreaterInstruction();
            case 'ble':
                return new MIPSzyBranchIfLessOrEqualInstruction();
            case 'blt':
                return new MIPSzyBranchIfLessInstruction();
            case 'j':
                return new MIPSzyJumpInstruction();
            case 'jal':
                return new MIPSzyJumpAndLinkInstruction();
            case 'jr':
                return new MIPSzyJumpRegisterInstruction();
            case 'beq':
                return new MIPSzyBranchIfEqualInstruction();
            case 'bne':
                return new MIPSzyBranchIfNotEqualInstruction();
            case 'addi':
            case 'add':
            case 'sub':
            case 'mul':
            case 'mult':
            case 'mflo':
            case 'slt':
            case 'lw':
            case 'sw':
                return this.newInstructionFactory.make.call(this, opcode);
            default:
                throw new Error(`Unrecognized op code: ${opcode}`);
        }
    };
}
