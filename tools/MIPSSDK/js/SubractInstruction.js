/*
    SubtractInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
*/
function SubtractInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit RegisterFormatInstruction and attach prototype functions to SubtractInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildSubtractInstructionPrototype(instructionSetSDK) {
    SubtractInstruction.prototype = new RegisterFormatInstruction();
    SubtractInstruction.prototype.constructor = SubtractInstruction;
    SubtractInstruction.prototype.opcode = 'sub';

    // See InstructionSetSDK's Instruction for details.
    SubtractInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().subtract(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister1
            this._properties[2]  // sourceRegister2
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    SubtractInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ' + this._properties[1] + ' - ' + this._properties[2]);
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    SubtractInstruction.prototype.getFunctionBits = function() {
        return '100010';
    };
}
