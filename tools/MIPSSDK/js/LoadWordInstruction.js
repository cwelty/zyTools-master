/*
    LoadWordInstruction inherits DataTransferFormatInstruction.
    See DataTransferFormatInstruction for details.
*/
function LoadWordInstruction() {
    DataTransferFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit DataTransferFormatInstruction and attach prototype functions to LoadWordInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildLoadWordInstructionPrototype(instructionSetSDK) {
    LoadWordInstruction.prototype = new DataTransferFormatInstruction();
    LoadWordInstruction.prototype.constructor = LoadWordInstruction;
    LoadWordInstruction.prototype.opcode = 'lw';

    // See InstructionSetSDK's Instruction for details.
    LoadWordInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().loadSignedWord(
            registers,
            memory,
            this._properties[0], // firstRegisterName
            this._properties[1], // immediate
            this._properties[2]  // secondRegisterName
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    LoadWordInstruction.prototype.toComment = function(registers) {
        var comment = '# ' + this._properties[0] + ' = M[' + this._properties[2] + ' + ' + this._properties[1] + ']';
        if (!!registers) {
            var memoryAddress = registers.lookupByRegisterName(this._properties[2]).add(this._properties[1]).toString();
            comment += ' = M[' + memoryAddress + ']';
        }
        return comment;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    LoadWordInstruction.prototype.getOpcodeBits = function() {
        return '100011';
    };
}
