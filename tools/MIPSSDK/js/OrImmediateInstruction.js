/*
    OrImmediateInstruction inherits ImmediateFormatInstruction.
    See ImmediateFormatInstruction for details.
*/
function OrImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit ImmediateFormatInstruction and attach prototype functions to OrImmediateInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildOrImmediateInstructionPrototype(instructionSetSDK) {
    OrImmediateInstruction.prototype = new ImmediateFormatInstruction();
    OrImmediateInstruction.prototype.constructor = OrImmediateInstruction;
    OrImmediateInstruction.prototype.opcode = 'ori';

    // See InstructionSetSDK's Instruction for details.
    OrImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().orImmediate(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister
            this._properties[2]  // immediate
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    OrImmediateInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' | ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    OrImmediateInstruction.prototype.getOpcodeBits = function() {
        return '001101';
    };
}
