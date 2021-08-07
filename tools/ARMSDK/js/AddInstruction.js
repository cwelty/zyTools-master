/*
    AddInstruction inherits RegisterFormatInstruction.
    See RegisterFormatInstruction for details.
*/
function AddInstruction() {
    RegisterFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit RegisterFormatInstruction and attach prototype functions to AddInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildAddInstructionPrototype(instructionSetSDK) {
    AddInstruction.prototype = new RegisterFormatInstruction();
    AddInstruction.prototype.constructor = AddInstruction;
    AddInstruction.prototype.opcode = 'ADD';

    // See InstructionSetSDK's Instruction for details.
    AddInstruction.prototype.execute = function(registers, memory, programCounter) {
        instructionSetSDK.createCommonExecutes().add(
            registers,
            this._properties[0], // destinationRegister
            this._properties[1], // sourceRegister1
            this._properties[2]  // sourceRegister2
        );
        return ++programCounter;
    };

    // See InstructionSetSDK's Instruction for details.
    AddInstruction.prototype.toComment = function() {
        return `// ${this._properties[0]} = ${this._properties[1]} + ${this._properties[2]}`;
    };
}
