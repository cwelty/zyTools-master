/*
    AndImmediateInstruction inherits ImmediateFormatInstruction.
    See ImmediateFormatInstruction for details.
*/
function AndImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit ImmediateFormatInstruction and attach prototype functions to AndImmediateInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildAndImmediateInstructionPrototype(instructionSetSDK) {
    AndImmediateInstruction.prototype = new ImmediateFormatInstruction();
    AndImmediateInstruction.prototype.constructor = AndImmediateInstruction;
    AndImmediateInstruction.prototype.opcode = 'andi';

    // See InstructionSetSDK's Instruction for details.
    AndImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().andImmediate(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister
            this._properties[2]  // immediate
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    AndImmediateInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' & ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    AndImmediateInstruction.prototype.getOpcodeBits = function() {
        return '001100';
    };
}
