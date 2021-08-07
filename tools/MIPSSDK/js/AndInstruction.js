/*
    AndInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
*/
function AndInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit RegisterFormatInstruction and attach prototype functions to AndInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildAndInstructionPrototype(instructionSetSDK) {
    AndInstruction.prototype = new RegisterFormatInstruction();
    AndInstruction.prototype.constructor = AndInstruction;
    AndInstruction.prototype.opcode = 'and';

    // See InstructionSetSDK's Instruction for details.
    AndInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().and(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister1
            this._properties[2]  // sourceRegister2
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    AndInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' & ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    AndInstruction.prototype.getFunctionBits = function() {
        return '101000';
    };
}
