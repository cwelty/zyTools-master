/*
    SetOnLessThanImmediateInstruction inherits ImmediateFormatInstruction.
    See ImmediateFormatInstruction for details.
*/
function SetOnLessThanImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit ImmediateFormatInstruction and attach prototype functions to SetOnLessThanImmediateInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildSetOnLessThanImmediateInstructionPrototype(instructionSetSDK) {
    SetOnLessThanImmediateInstruction.prototype = new ImmediateFormatInstruction();
    SetOnLessThanImmediateInstruction.prototype.constructor = SetOnLessThanImmediateInstruction;
    SetOnLessThanImmediateInstruction.prototype.opcode = 'slti';

    // See InstructionSetSDK's Instruction for details.
    SetOnLessThanImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        var registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(
            registers,
            [ this._properties[0], this._properties[1] ]
        );
        var setValue = registerBaseWords[1].isLessThan(this._properties[2]) ? 1 : 0;
        registerBaseWords[0].setValue(setValue);

        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    SetOnLessThanImmediateInstruction.prototype.toComment = function() {
        // if ($s2 < 20) $s1 = 1; else $s1 = 0
        return ('# if (' + this._properties[1] + ' < ' + this._properties[2] + ') ' +
                this._properties[0] + ' = 1;\n# else ' + this._properties[0] + ' = 0');
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    SetOnLessThanImmediateInstruction.prototype.getOpcodeBits = function() {
        return '001010';
    };
}
