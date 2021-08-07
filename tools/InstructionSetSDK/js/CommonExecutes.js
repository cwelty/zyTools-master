// CommonExecutes stores common execution behavior used by instructions.
function CommonExecutes() {}

// Attach prototype functions to CommonExecutes.
function buildCommonExecutesPrototype() {
    /*
        Add |sourceName1| and |sourceName2|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName|, |sourceName1|, and |sourceName2| are required and a string.
    */
    CommonExecutes.prototype.add = function(registers, destinationName, sourceName1, sourceName2) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName1, sourceName2 ]);
        var result = registerBaseWords[1].add(registerBaseWords[2]);
        registerBaseWords[0].setValueByLong(result);
    };

    /*
        Subtract |sourceName1| and |sourceName2|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName|, |sourceName1|, and |sourceName2| are required and a string.
    */
    CommonExecutes.prototype.subtract = function(registers, destinationName, sourceName1, sourceName2) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName1, sourceName2 ]);
        var result = registerBaseWords[1].subtract(registerBaseWords[2]);
        registerBaseWords[0].setValueByLong(result);
    };

    /*
        AND |sourceName1| and |sourceName2|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName|, |sourceName1|, and |sourceName2| are required and a string.
    */
    CommonExecutes.prototype.and = function(registers, destinationName, sourceName1, sourceName2) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName1, sourceName2 ]);
        var result = registerBaseWords[1].and(registerBaseWords[2]);
        registerBaseWords[0].setValueByLong(result);
    };

    /*
        OR |sourceName1| and |sourceName2|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName|, |sourceName1|, and |sourceName2| are required and a string.
    */
    CommonExecutes.prototype.or = function(registers, destinationName, sourceName1, sourceName2) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName1, sourceName2 ]);
        var result = registerBaseWords[1].or(registerBaseWords[2]);
        registerBaseWords[0].setValueByLong(result);
    };

    /*
        NOR |sourceName1| and |sourceName2|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName|, |sourceName1|, and |sourceName2| are required and a string.
    */
    CommonExecutes.prototype.nor = function(registers, destinationName, sourceName1, sourceName2) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName1, sourceName2 ]);
        var result = registerBaseWords[1].nor(registerBaseWords[2]);
        registerBaseWords[0].setValueByLong(result);
    };

    /**
        Compute exclusive-or on |sourceName1| and |sourceName2|, store result in |destinationName|.
        @method xor
        @param {Registers} registers The registers from which to get and set the sources and destination.
        @param {String} destinationName The name of the destination register.
        @param {String} sourceName1 The name of the first source register.
        @param {String} sourceName2 The name of the second source register.
        @return {void}
    */
    CommonExecutes.prototype.xor = function(registers, destinationName, sourceName1, sourceName2) {
        const registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName1, sourceName2 ]);
        const result = registerBaseWords[1].xor(registerBaseWords[2]);

        registerBaseWords[0].setValueByLong(result);
    };

    /*
        Multiply the value stored in |sourceName1| and |sourceName2|, return the result.
        @method multiply
        @param {Registers} registers The registers to read/write from.
        @param {String} sourceName1 The first source register's name.
        @param {String} sourceName2 The second source register's name.
        @return {BaseWord} The result of multiplying source name 1 and 2.
    */
    CommonExecutes.prototype.multiply = function(registers, sourceName1, sourceName2) {
        const registerBaseWords = this.resolveRegisters(registers, [ sourceName1, sourceName2 ]);

        return registerBaseWords[0].multiply(registerBaseWords[1]);
    };

    /*
        Add |sourceName| and |immediate|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName| and |sourceName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.addImmediate = function(registers, destinationName, sourceName, immediate) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        var result = registerBaseWords[1].add(immediate);
        registerBaseWords[0].setValueByLong(result);
    };

    /**
        Subtract |sourceName| and |immediate|, store result in |destinationName|.
        @method subtractImmediate
        @param {Registers} registers The registers used in the program.
        @param {String} destinationName The name of the destination register.
        @param {String} sourceName The name of the source register.
        @param {Number} immediate The value of the immediate.
        @return {void}
    */
    CommonExecutes.prototype.subtractImmediate = function(registers, destinationName, sourceName, immediate) {
        const registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        const result = registerBaseWords[1].subtract(immediate);

        registerBaseWords[0].setValueByLong(result);
    };

    /*
        AND |sourceName| and |immediate|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName| and |sourceName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.andImmediate = function(registers, destinationName, sourceName, immediate) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        var result = registerBaseWords[1].and(immediate);
        registerBaseWords[0].setValueByLong(result);
    };

    /*
        OR |sourceName| and |immediate|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName| and |sourceName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.orImmediate = function(registers, destinationName, sourceName, immediate) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        var result = registerBaseWords[1].or(immediate);
        registerBaseWords[0].setValueByLong(result);
    };

    /**
        Compute the exclusive-or of |sourceName| and |immediate|, store result in |destinationName|.
        @method exclusiveOrImmediate
        @param {Registers} registers The registers from which to get and set the sources and destination.
        @param {String} destinationName The name of the destination register.
        @param {String} sourceName The name of the source register.
        @param {Number} immediate The value of the immediate.
        @return {void}
    */
    CommonExecutes.prototype.exclusiveOrImmediate = function(registers, destinationName, sourceName, immediate) {
        const registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        const result = registerBaseWords[1].xor(immediate);

        registerBaseWords[0].setValueByLong(result);
    };

    /*
        Shift |sourceName| left by |immediate|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName| and |sourceName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.shiftLeft = function(registers, destinationName, sourceName, immediate) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        var result = registerBaseWords[1].shiftLeft(immediate);
        registerBaseWords[0].setValueByLong(result);
    };

    /*
        Shift |sourceName| right by |immediate|, store result in |destinationName|.
        |registers| is required and a |Registers|.
        |destinationName| and |sourceName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.shiftRight = function(registers, destinationName, sourceName, immediate) {
        var registerBaseWords = this.resolveRegisters(registers, [ destinationName, sourceName ]);
        var result = registerBaseWords[1].shiftRight(immediate);
        registerBaseWords[0].setValueByLong(result);
    };

    /**
        Transfer the bits as an unsigned value.
        @method unsignedTransferToFrom
        @param {BaseWord} to Transfer to bits here.
        @param {BaseWord} from Tranfer from bits here.
        @return {void}
    */
    CommonExecutes.prototype.unsignedTransferToFrom = function(to, from) {
        const fromLong = window.dcodeIO.Long.fromValue(from.getUnsignedValue());

        to.setValueByLong(fromLong);
    };

    /**
        Transfer the bits as a signed value.
        @method signedTransferToFrom
        @param {BaseWord} to Transfer to bits here.
        @param {BaseWord} from Tranfer from bits here.
        @return {void}
    */
    CommonExecutes.prototype.signedTransferToFrom = function(to, from) {
        const fromLong = window.dcodeIO.Long.fromValue(from.getSignedValue());

        to.setValueByLong(fromLong);
    };

    /**
        Transfer a {Word} stored in |memory| as a signed value.
        @method loadSignedWord
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.loadSignedWord = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const word = memory.lookupWord(result);

        this.signedTransferToFrom(registerBaseWords[0], word);
    };

    /*
        Transfer Word stored |firstRegisterName| to (|secondRegisterName| + |immediate|) in |memory|.
        |registers| is required and a |Registers|.
        |memory| is required and a Memory.
        |firstRegisterName| and |secondRegisterName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.storeWord = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const word = memory.lookupWord(result);

        this.unsignedTransferToFrom(word, registerBaseWords[0]);
    };

    /**
        Transfer {HalfWord} stored in |memory| at (|secondRegisterName| + |immediate|) in |firstRegisterName|.
        @method loadHalfWordSigned
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.loadHalfWordSigned = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const halfWord = memory.lookupHalfWord(result);

        this.signedTransferToFrom(registerBaseWords[0], halfWord);
    };

    /**
        Transfer an unsigned {HalfWord} stored in |memory| at (|secondRegisterName| + |immediate|) in |firstRegisterName|.
        @method loadHalfWordUnsigned
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.loadHalfWordUnsigned = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const halfWord = memory.lookupHalfWord(result);

        this.unsignedTransferToFrom(registerBaseWords[0], halfWord);
    };

    /**
        Transfer {HalfWord} stored |firstRegisterName| to (|secondRegisterName| + |immediate|) in |memory|.
        @method storeHalfWord
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.storeHalfWord = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const halfWord = memory.lookupHalfWord(result);

        this.unsignedTransferToFrom(halfWord, registerBaseWords[0]);
    };

    /**
        Transfer {Byte} stored in |memory| at (|secondRegisterName| + |immediate|) in |firstRegisterName|.
        @method loadByteSigned
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.loadByteSigned = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const byte = memory.lookupByte(result);

        this.signedTransferToFrom(registerBaseWords[0], byte);
    };

    /**
        Transfer an unsigned {Byte} stored in |memory| at (|secondRegisterName| + |immediate|) in |firstRegisterName|.
        @method loadByteUnsigned
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.loadByteUnsigned = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const byte = memory.lookupByte(result);

        this.unsignedTransferToFrom(registerBaseWords[0], byte);
    };

    /**
        Transfer {Byte} stored |firstRegisterName| to (|secondRegisterName| + |immediate|) in |memory|.
        @method storeByte
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.storeByte = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const byte = memory.lookupByte(result);

        this.unsignedTransferToFrom(byte, registerBaseWords[0]);
    };

    /**
        Transfer an unsigned {DoubleWord} stored in |memory| at (|secondRegisterName| + |immediate|) in |firstRegisterName|.
        @method loadDoubleWordUnsigned
        @param {Registers} registers The registers used in the program.
        @param {Memory} memory The memory used in the program.
        @param {String} firstRegisterName Name of the first register in the instruction.
        @param {Number} immediate The immediate value in the instruction. May also be a {Long}.
        @param {String} secondRegisterName Name of the second register in the instruction.
        @return {void}
    */
    CommonExecutes.prototype.loadDoubleWordUnsigned = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const doubleWord = memory.lookupDoubleWord(result);

        this.unsignedTransferToFrom(registerBaseWords[0], doubleWord);
    };

    /*
        Transfer DoubleWord stored |firstRegisterName| to (|secondRegisterName| + |immediate|) in |memory|.
        |registers| is required and a |Registers|.
        |memory| is required and a Memory.
        |firstRegisterName| and |secondRegisterName| are required and a string.
        |immediate| is required and a number or Long.
    */
    CommonExecutes.prototype.storeDoubleWord = function(registers, memory, firstRegisterName, immediate, secondRegisterName) {
        const registerBaseWords = this.resolveRegisters(registers, [ firstRegisterName, secondRegisterName ]);
        const result = registerBaseWords[1].add(immediate);
        const doubleWord = memory.lookupDoubleWord(result);

        this.unsignedTransferToFrom(doubleWord, registerBaseWords[0]);
    };

    /*
        Return an array of BaseWord from |registers| for each element in |registerNames|.
        |registers| is required and a |Registers|.
        |registerNames| is an array of strings.
    */
    CommonExecutes.prototype.resolveRegisters = function(registers, registerNames) {
        return registerNames.map(function(registerName) {
            return registers.lookupByRegisterName(registerName);
        });
    };
}
