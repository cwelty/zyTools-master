'use strict';

/* global MoveInstruction, MulInstruction, MultInstruction, MfloInstruction, BranchIfGreaterOrEqualInstruction, BranchIfGreaterInstruction,
   BranchIfLessOrEqualInstruction, BranchIfLessInstruction, SetOnLessThanUnsignedInstruction, SetOnLessThanImmediateUnsignedInstruction,
   LoadHalfWordInstruction, JumpInstruction, JumpAndLinkInstruction, JumpRegisterInstruction, StoreHalfWordInstruction,
   LoadHalfWordUnsignedInstruction, LoadByteInstruction, StoreByteInstruction, LoadByteUnsignedInstruction */

// InstructionFactory makes an instruction.
function InstructionFactory() {}

// Attach prototype functions to InstructionFactory.
function buildInstructionFactoryPrototype() {
    /*
        Make an Instruction based on the given |opcode|.
        |opcode| is required and a string.
    */
    InstructionFactory.prototype.make = function(opcode) {
        switch (opcode) {
            case 'add':
                return new AddInstruction();
            case 'sub':
                return new SubtractInstruction();
            case 'and':
                return new AndInstruction();
            case 'or':
                return new OrInstruction();
            case 'nor':
                return new NorInstruction();
            case 'mul':
                return new MulInstruction();
            case 'mult':
                return new MultInstruction();
            case 'mflo':
                return new MfloInstruction();
            case 'slt':
                return new SetOnLessThanInstruction();
            case 'sltu':
                return new SetOnLessThanUnsignedInstruction();
            case 'andi':
                return new AndImmediateInstruction();
            case 'ori':
                return new OrImmediateInstruction();
            case 'sll':
                return new ShiftLeftInstruction();
            case 'srl':
                return new ShiftRightInstruction();
            case 'addi':
                return new AddImmediateInstruction();
            case 'slti':
                return new SetOnLessThanImmediateInstruction();
            case 'sltiu':
                return new SetOnLessThanImmediateUnsignedInstruction();
            case 'lw':
                return new LoadWordInstruction();
            case 'sw':
                return new StoreWordInstruction();
            case 'lh':
                return new LoadHalfWordInstruction();
            case 'lhu':
                return new LoadHalfWordUnsignedInstruction();
            case 'sh':
                return new StoreHalfWordInstruction();
            case 'lb':
                return new LoadByteInstruction();
            case 'lbu':
                return new LoadByteUnsignedInstruction();
            case 'sb':
                return new StoreByteInstruction();
            case 'beq':
                return new BranchIfEqualInstruction();
            case 'bne':
                return new BranchIfNotEqualInstruction();
            case 'bge':
                return new BranchIfGreaterOrEqualInstruction();
            case 'bgt':
                return new BranchIfGreaterInstruction();
            case 'ble':
                return new BranchIfLessOrEqualInstruction();
            case 'blt':
                return new BranchIfLessInstruction();
            case 'j':
                return new JumpInstruction();
            case 'jal':
                return new JumpAndLinkInstruction();
            case 'jr':
                return new JumpRegisterInstruction();
            case 'move':
                return new MoveInstruction();
            default:
                throw new Error(`Unrecognized op code: ${opcode}`);
        }
    };
}
