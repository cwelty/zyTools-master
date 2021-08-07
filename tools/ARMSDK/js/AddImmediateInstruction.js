/*
    AddImmediateInstruction inherits ImmediateFormatInstruction.
    See ImmediateFormatInstruction for details.
*/
function AddImmediateInstruction() {
    ImmediateFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit ImmediateFormatInstruction and attach prototype functions to AddImmediateInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildAddImmediateInstructionPrototype(instructionSetSDK) {
    AddImmediateInstruction.prototype = new ImmediateFormatInstruction();
    AddImmediateInstruction.prototype.constructor = AddImmediateInstruction;
    AddImmediateInstruction.prototype.opcode = 'ADDI';

    // See InstructionSetSDK's Instruction for details.
    AddImmediateInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().addImmediate(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister
            this._properties[2]  // immediate
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    AddImmediateInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} + ${this._properties[2]}`;
    };
}
