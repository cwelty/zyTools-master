'use strict';

/* global REGISTER_NAME_TO_ADDRESS */

/*
    MIPSRegisters inherits InstructionSetSDK's Registers using MIPS-specific register addresses and order.
    See InstructionSetSDK's Registers for details.
*/
function MIPSRegisters(initialRegistersByAddress) {
    this.newRegisters.constructor.call(this, initialRegistersByAddress, 0, 135); // eslint-disable-line

    // LO and HI are not to be shown.
    this.byteAddressesToNotShow = [ '128', '129', '130', '131', '132', '133', '134', '135' ];
}

/*
    Inherit InstructionSetSDK's Registers and attach prototype functions to MIPSRegisters.
    |instructionSetSDK| is required and an InstructionSetSDK.
*/
function buildMIPSRegistersPrototype(instructionSetSDK) {
    MIPSRegisters.prototype = instructionSetSDK.inheritRegisters();
    MIPSRegisters.prototype.constructor = MIPSRegisters;
    MIPSRegisters.prototype.newRegisters = instructionSetSDK.inheritRegisters();
    MIPSRegisters.prototype.REGISTER_NAME_TO_ADDRESS = REGISTER_NAME_TO_ADDRESS;
    MIPSRegisters.prototype.REGISTER_NAME_ORDER = REGISTER_NAME_ORDER;
    MIPSRegisters.prototype.validNames = '$zero, $at, $v0, $v1, $a0 - $a3, $t0 - $t9, $s0 - $s7, $k0, $k1, $gp, $sp, $fp, $ra';

    // $zero's byte addresses are read only.
    MIPSRegisters.prototype.readOnlyByteAddresses = [ 0, 1, 2, 3 ]; // eslint-disable-line no-magic-numbers

    /**
        The address of the last {Word} in the stack.
        @property endOfStack
        @type {Number}
        @default 2147483188
    */
    MIPSRegisters.prototype.endOfStack = 2147483188;

    /**
        The address of the first {Word} in the data memory.
        @property startOfData
        @type {Number}
        @default 268468224
    */
    MIPSRegisters.prototype.startOfData = 268468224;

    /*
        Return a MIPS register, which is a Word.
        See InstructionSDK's Registers for details.
    */
    MIPSRegisters.prototype._lookupRegister = function(address) {
        const isSPRegister = (this.REGISTER_NAME_TO_ADDRESS.$sp === address);
        const isGPRegister = (this.REGISTER_NAME_TO_ADDRESS.$gp === address);
        const isFirstLookup = !(address in this._lookupTable);
        const register = this.lookupWord(address);

        // For first $sp lookup, set the value to the end of the stack.
        if (isSPRegister && isFirstLookup) {
            register.setValue(this.endOfStack, 0);
            register.clearBeenWrittenTo();
        }

        // For first $gp lookup, set the value to the start of the data memory.
        if (isGPRegister && isFirstLookup) {
            register.setValue(this.startOfData, 0);
            register.clearBeenWrittenTo();
        }

        return register;
    };

    /**
        Return a clone, including a copy of each Byte.
        @method clone
        @param {MIPSRegisters} [newRegisters=null] The registers to clone.
        @return {MIPSRegisters} The cloned registers.
    */
    MIPSRegisters.prototype.clone = function(newRegisters = null) {
        const registersToClone = newRegisters || new MIPSRegisters();

        return this.newRegisters.clone.call(this, registersToClone);
    };
}
