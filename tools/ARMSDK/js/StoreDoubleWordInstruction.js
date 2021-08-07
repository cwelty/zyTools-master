/*
    StoreDoubleWordInstruction inherits DataTransferFormatInstruction.
    See DataTransferFormatInstruction for details.
*/
function StoreDoubleWordInstruction() {
    DataTransferFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit DataTransferFormatInstruction and attach prototype functions to StoreDoubleWordInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildStoreDoubleWordInstructionPrototype(instructionSetSDK) {
    StoreDoubleWordInstruction.prototype = new DataTransferFormatInstruction();
    StoreDoubleWordInstruction.prototype.constructor = StoreDoubleWordInstruction;
    StoreDoubleWordInstruction.prototype.opcode = 'STUR';

    // See InstructionSetSDK's Instruction for details.
    StoreDoubleWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().storeDoubleWord(
            registers,
            memory,
            this._properties[0], // firstRegisterName
            this._properties[2], // immediate
            this._properties[1]  // secondRegisterName
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    StoreDoubleWordInstruction.prototype.toComment = function(registers) {
        return makeCommentForStoreInstruction(this._properties, registers);
    };
}
