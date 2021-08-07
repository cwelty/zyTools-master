/*
    NorInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
*/
function NorInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit RegisterFormatInstruction and attach prototype functions to NorInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildNorInstructionPrototype(instructionSetSDK) {
    NorInstruction.prototype = new RegisterFormatInstruction();
    NorInstruction.prototype.constructor = NorInstruction;
    NorInstruction.prototype.opcode = 'nor';

    // See InstructionSetSDK's Instruction for details.
    NorInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().nor(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister1
            this._properties[2]  // sourceRegister2
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    NorInstruction.prototype.toComment = function() {
        return ('# ' + this._properties[0] + ' = ~(' + this._properties[1] + ' | ' + this._properties[2] + ')');
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    NorInstruction.prototype.getFunctionBits = function() {
        return '100111';
    };
}
