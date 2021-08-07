/*
    StoreWordInstruction inherits DataTransferFormatInstruction.
    See DataTransferFormatInstruction for details.
*/
function StoreWordInstruction() {
    DataTransferFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit DataTransferFormatInstruction and attach prototype functions to StoreWordInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildStoreWordInstructionPrototype(instructionSetSDK) {
    StoreWordInstruction.prototype = new DataTransferFormatInstruction();
    StoreWordInstruction.prototype.constructor = StoreWordInstruction;
    StoreWordInstruction.prototype.opcode = 'sw';

    // See InstructionSetSDK's Instruction for details.
    StoreWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().storeWord(
            registers,
            memory,
            this._properties[0], // firstRegisterName
            this._properties[1], // immediate
            this._properties[2]  // secondRegisterName
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    StoreWordInstruction.prototype.toComment = function(registers) {
        var comment = '# M[' + this._properties[2] + ' + ' + this._properties[1] + '] = ';
        if (!!registers) {
            var memoryAddress = registers.lookupByRegisterName(this._properties[2]).add(this._properties[1]).toString();
            comment += 'M[' + memoryAddress + '] = ';
        }
        return (comment + this._properties[0]);
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    StoreWordInstruction.prototype.getOpcodeBits = function() {
        return '101011';
    };
}
