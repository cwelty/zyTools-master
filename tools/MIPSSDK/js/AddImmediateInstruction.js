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
    AddImmediateInstruction.prototype.opcode = 'addi';

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

    /**
        Return a comment explaining the instruction.
        @method toComment
        @param {Registers} registers The registers in the program.
        @return {String} Comment explaining this instruction.
    */
    AddImmediateInstruction.prototype.toComment = function(registers) {
        let comment = `# ${this._properties[0]} = `;

        /*
            If the second register is $zero, then just show first register is assigned with the immediate value.
            Ex: addi $t0, $zero, 40 # $t0 = 40
        */
        if (this._properties[1] === '$zero') {
            comment += this._properties[2];
        }
        else {
            comment += `${this._properties[1]} + ${this._properties[2]}`;

            /*
                If registers are present, then compute the final value.
                Ex: If $t1 has 20, then: addi $t0, $t1, 5 # $t0 = $t1 + 5 (= 25)
            */
            if (registers) {
                const finalValue = registers.lookupByRegisterName(this._properties[1]).add(this._properties[2]).toString();

                comment += ` = ${finalValue}`;
            }
        }

        return comment;
    };

    /**
        Return the 6-bit string representing the opcode.
        @method getOpcodeBits
        @return {String} The bit string representing the opcode.
    */
    AddImmediateInstruction.prototype.getOpcodeBits = function() {
        return '001000';
    };
}
