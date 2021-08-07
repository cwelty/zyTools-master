/*
    OrInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
*/
function OrInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit RegisterFormatInstruction and attach prototype functions to OrInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildOrInstructionPrototype(instructionSetSDK) {
    OrInstruction.prototype = new RegisterFormatInstruction();
    OrInstruction.prototype.constructor = OrInstruction;
    OrInstruction.prototype.opcode = 'or';

    // See InstructionSetSDK's Instruction for details.
    OrInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().or(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister1
            this._properties[2]  // sourceRegister2
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    OrInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' | ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    OrInstruction.prototype.getFunctionBits = function() {
        return '100101';
    };
}
