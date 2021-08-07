/*
    SetOnLessThanInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
*/
function SetOnLessThanInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit RegisterFormatInstruction and attach prototype functions to SetOnLessThanInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildSetOnLessThanInstructionPrototype(instructionSetSDK) {
    SetOnLessThanInstruction.prototype = new RegisterFormatInstruction();
    SetOnLessThanInstruction.prototype.constructor = SetOnLessThanInstruction;
    SetOnLessThanInstruction.prototype.opcode = 'slt';

    // See InstructionSetSDK's Instruction for details.
    SetOnLessThanInstruction.prototype.execute = function(registers, memory, programCounter) {
        var registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(
            registers,
            [ this._properties[0], this._properties[1], this._properties[2] ]
        );
        var setValue = registerBaseWords[1].isLessThan(registerBaseWords[2]) ? 1 : 0;
        registerBaseWords[0].setValue(setValue);

        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    SetOnLessThanInstruction.prototype.toComment = function() {
        // if ($s2 < $s3) $s1 = 1; else $s1 = 0
        return ('# if (' + this._properties[1] + ' < ' + this._properties[2] + ') ' +
                this._properties[0] + ' = 1;\n# else ' + this._properties[0] + ' = 0');
    };

    /**
        Return the 6-bit string representing the function.
        @method getFunctionBits
        @return {String} The bit string representing the function.
    */
    SetOnLessThanInstruction.prototype.getFunctionBits = function() {
        return '101010';
    };
}
