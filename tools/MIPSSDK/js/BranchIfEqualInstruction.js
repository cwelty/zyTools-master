/*
    BranchIfEqualInstruction inherits BranchFormatInstruction.
    See BranchFormatInstruction for details.
*/
function BranchIfEqualInstruction() {
    BranchFormatInstruction.prototype.constructor.apply(this, arguments);
}

/*
    Inherit BranchFormatInstruction and attach prototype functions to BranchIfEqualInstruction.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildBranchIfEqualInstructionPrototype(instructionSetSDK) {
    BranchIfEqualInstruction.prototype = new BranchFormatInstruction();
    BranchIfEqualInstruction.prototype.constructor = BranchIfEqualInstruction;
    BranchIfEqualInstruction.prototype.opcode = 'beq';

    // See InstructionSetSDK's Instruction for details.
    BranchIfEqualInstruction.prototype.execute = function(registers, memory, programCounter) {
        var registerBaseWords = instructionSetSDK.createCommonExecutes().resolveRegisters(
            registers,
            [ this._properties[0], this._properties[1] ]
        );
        return (registerBaseWords[0].equals(registerBaseWords[1]) ? this._properties[2] : ++programCounter);
    };

    // See InstructionSetSDK's Instruction for details.
    BranchIfEqualInstruction.prototype.toComment = function() {
        return `# if (${this._properties[0]} == ${this._properties[1]}) go to ${this._properties[2]}`;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    BranchIfEqualInstruction.prototype.getOpcodeBits = function() {
        return '000100';
    };
}
