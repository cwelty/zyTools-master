'use strict';

/* exported InstructionFactory */
/* global AddInstruction, SubtractInstruction, AddImmediateInstruction, LoadDoubleWordInstruction, StoreDoubleWordInstruction,
   AndInstruction, AndImmediateInstruction, LogicalShiftRightInstruction, OrInstruction, OrImmediateInstruction
   LogicalShiftLeftInstruction, BranchInstruction, BranchOnZeroInstruction, BranchOnNotZeroInstruction, SubtractAndSetFlagsInstruction,
   SubtractImmediateAndSetFlagsInstruction, SubtractImmediateInstruction, BranchOnNotEqualInstruction, BranchOnLessThanInstruction,
   BranchOnEqualInstruction, BranchOnGreaterThanOrEqualInstruction, BranchToRegisterInstruction, BranchWithLinkInstruction,
   ExclusiveOrInstruction, ExclusiveOrImmediateInstruction, LoadSignedWordInstruction, StoreWordInstruction, StoreHalfWordInstruction,
   LoadHalfWordInstruction, LoadByteInstruction, StoreByteInstruction, AddAndSetFlagsInstruction, BranchOnLessThanOrEqualInstruction,
   BranchOnGreaterThanInstruction, AddImmediateAndSetFlagsInstruction, BranchOnCarryBitHighInstruction, BranchOnCarryBitLowInstruction,
   BranchOnPositiveInstruction, BranchOnNegativeInstruction, BranchOnOverflowSetInstruction, BranchOnOverflowClearInstruction,
   BranchOnUnsignedGreaterThanInstruction, BranchOnUnsignedLessThanOrEqualInstruction */

/**
    Make an instruction based on an opcode.
    @class InstructionFactory
*/
class InstructionFactory {

    /**
        Make an {Instruction} based on |opcode|.
        @method make
        @param {String} opcode The opcode to make.
        @return {Instruction} The instruction made from |opcode|.
    */
    make(opcode) {
        const opcodeToInstruction = {
            ADD: AddInstruction,
            ADDI: AddImmediateInstruction,
            ADDIS: AddImmediateAndSetFlagsInstruction,
            ADDS: AddAndSetFlagsInstruction,
            AND: AndInstruction,
            ANDI: AndImmediateInstruction,
            B: BranchInstruction, // eslint-disable-line id-length
            'B.EQ': BranchOnEqualInstruction,
            'B.GE': BranchOnGreaterThanOrEqualInstruction,
            'B.GT': BranchOnGreaterThanInstruction,
            'B.HI': BranchOnUnsignedGreaterThanInstruction,
            'B.HS': BranchOnCarryBitHighInstruction,
            BL: BranchWithLinkInstruction,
            'B.LE': BranchOnLessThanOrEqualInstruction,
            'B.LO': BranchOnCarryBitLowInstruction,
            'B.LS': BranchOnUnsignedLessThanOrEqualInstruction,
            'B.LT': BranchOnLessThanInstruction,
            'B.MI': BranchOnNegativeInstruction,
            'B.NE': BranchOnNotEqualInstruction,
            'B.PL': BranchOnPositiveInstruction,
            'B.VC': BranchOnOverflowClearInstruction,
            'B.VS': BranchOnOverflowSetInstruction,
            BR: BranchToRegisterInstruction,
            CBZ: BranchOnZeroInstruction,
            CBNZ: BranchOnNotZeroInstruction,
            EOR: ExclusiveOrInstruction,
            EORI: ExclusiveOrImmediateInstruction,
            LDUR: LoadDoubleWordInstruction,
            LDURB: LoadByteInstruction,
            LDURH: LoadHalfWordInstruction,
            LDURSW: LoadSignedWordInstruction,
            LSL: LogicalShiftLeftInstruction,
            LSR: LogicalShiftRightInstruction,
            ORR: OrInstruction,
            ORRI: OrImmediateInstruction,
            SUB: SubtractInstruction,
            STUR: StoreDoubleWordInstruction,
            STURB: StoreByteInstruction,
            STURH: StoreHalfWordInstruction,
            STURW: StoreWordInstruction,
            SUBI: SubtractImmediateInstruction,
            SUBIS: SubtractImmediateAndSetFlagsInstruction,
            SUBS: SubtractAndSetFlagsInstruction,
        };
        const instruction = (opcode in opcodeToInstruction) ? new opcodeToInstruction[opcode]() : null;

        if (!instruction) {
            throw new Error(`Unrecognized op code: ${opcode}`);
        }

        return instruction;
    }
}
