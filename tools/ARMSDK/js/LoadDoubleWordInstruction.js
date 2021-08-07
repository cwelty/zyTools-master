'use strict';

/* global makeCommentForLoadInstruction */

/*
    LoadDoubleWordInstruction inherits DataTransferFormatInstruction.
    See DataTransferFormatInstruction for details.
*/
function LoadDoubleWordInstruction() {
    DataTransferFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadDoubleWordInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildLoadDoubleWordInstructionPrototype(instructionSetSDK) {
    LoadDoubleWordInstruction.prototype = new DataTransferFormatInstruction();
    LoadDoubleWordInstruction.prototype.constructor = LoadDoubleWordInstruction;
    LoadDoubleWordInstruction.prototype.opcode = 'LDUR';

    // See InstructionSetSDK's Instruction for details.
    LoadDoubleWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadDoubleWordUnsigned(
            registers,
            memory,
            this._properties[0], // firstRegisterName
            this._properties[2], // immediate
            this._properties[1]  // secondRegisterName
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    LoadDoubleWordInstruction.prototype.toComment = function(registers) {
        return makeCommentForLoadInstruction(this._properties, registers);
    };
}
