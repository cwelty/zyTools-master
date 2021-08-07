/*
    Instruction is an abstract class that stores an array of |_properties|.
    |arguments| are optional. If present, store each argument in |_properties|.
    String arguments are considered a register address. Number arguments are considered a constant.
*/
function Instruction() {

    // Array of objects specifying how to print the instruction. Inheriting object should override.
    this._printProperties = null;

    this._setProperties(arguments);
}

// Attach prototype functions to Instruction.
function buildInstructionPrototype() {
    // Return |_properties|.
    Instruction.prototype.getProperties = function() {
        return this._properties;
    };

    /*
        Return the Instruction's property by |index|.
        |index| is required and a number.
    */
    Instruction.prototype.getPropertyByIndex = function(index) {
        return this._properties[index];
    };

    /*
        Set the Instruction's property at |index|.
        |index| is required and a number.
    */
    Instruction.prototype.setPropertyByIndex = function(index, value) {
        this._properties[index] = value;
    };

    // Return a cloned Instruction.
    Instruction.prototype.clone = function() {
        return jQuery.extend(true, {}, this);
    };

    /*
        Copy |_properties| from |instruction| to |this|, limiting register values to |registerOptions|.
        |instruction| is required and an Instruction.
        |registerOptions| is required and an array of strings.
    */
    Instruction.prototype.copyProperties = function(instruction, registerOptions) {
        this._setProperties(instruction._properties);

        // Restrict register elements in |_properties| to be from |registerOptions|.
        var self = this;
        this._properties = this._propertiesConfiguration.map(function(propertyConfiguration, index) {
            var property = self._properties[index];
            if ((propertyConfiguration === 'register') && (registerOptions.indexOf(property) === -1)) {
                property = registerOptions[0];
            }
            return property;
        });
    };

    /*
        Set |_properties| based on |properties|, checking that each element is valid.
        |properties| is required and an object or array.
    */
    Instruction.prototype._setProperties = function(properties) {
        // During inheritance, |_propertiesConfiguration| is null, so cannot set properties.
        if (!!this._propertiesConfiguration) {
            // Validate each element in |properties| based on the |_propertiesConfiguration|.
            var self = this;
            this._properties = this._propertiesConfiguration.map(function(propertyConfiguration, index) {
                // If properties[index] exists, then store properties[index]. Otherwise, store null.
                var property = (properties.length > index) ? properties[index] : null;

                // If |property| is valid, return |property|. Otherwise, return valid value.
                switch (propertyConfiguration) {
                    case 'register':
                        return self._validateRegister(property);
                    case 'constant':
                        return self._validateConstant(property);

                    // Check the label once the instruction has been assigned a |labels|.
                    case 'label':
                        return property;
                }
            });
        }
    };

    /*
        Return |registerName| if already is a valid register. Else, return a valid register name.
        Ex: $s0 is a valid register name in MIPS.
        |registerName| is required and a string.
    */
    Instruction.prototype._validateRegister = function(registerName) {
        if (!registerName || (this._validRegisters.indexOf(registerName) === -1)) {
            return this._validRegisters[0];
        }
        return registerName;
    };

    /*
        Return |constant| if already is a number of Long. Else, return 0.
        |constant| is required and a Long or number.
    */
    Instruction.prototype._validateConstant = function(constant) {
        if ((typeof constant !== 'number') && !window.dcodeIO.Long.isLong(constant)) {
            return 0;
        }
        return constant;
    };

    /*
        Set |_labels| then validate any label properties in this instruction.
        |labels| is required and a Labels object.
    */
    Instruction.prototype.setLabels = function(labels) {
        this._labels = labels;

        // Validate only the label properties.
        var self = this;
        this._properties = this._propertiesConfiguration.map(function(propertyConfiguration, index) {
            // If |property| is valid, return |property|. Otherwise, return valid value.
            var property = self._properties[index];
            switch (propertyConfiguration) {
                // Register and constant were validated during Instruction creation.
                case 'register':
                case 'constant':
                    return property;
                case 'label':
                    return self._validateLabel(property);
            }
        });
    };

    /*
        Return |label| if already a valid label. Else, return a valid label.
        |label| is required and a string.
    */
    Instruction.prototype._validateLabel = function(label) {
        return ((this._labels.lookupProgramCounter(label) !== null) ? label : this._labels[0].name);
    };

    // Labels associated with this instruction.
    Instruction.prototype._labels = new Labels();

    // Array of strings with value: 'register', 'constant', or 'label'. Inheriting object should override.
    Instruction.prototype._propertiesConfiguration = null;

    // Array of strings of valid register names. Inheriting object should override.
    Instruction.prototype._validRegisters = null;

    // String storing the opcode. Inheriting object should override.
    Instruction.prototype.opcode = null;

    // Used for parsing an instruction. See InstructionSetSimulator's Parser. Inheriting object should override.
    Instruction.prototype.expectedTokenNameOrder = [];

    // Used for tracking to which line of code this instruction maps.
    Instruction.prototype.lineNumber = -1;

    // Return a string representation of the instruction. Ex: add $s1, $s2, $s3
    Instruction.prototype.toString = function() {
        console.error('Inheriting object should override toString');
    };

    /*
        Execute the instruction with given |registers| and |memory|.
        Return the updated |programCounter|.

        |registers| is required and a Registers object.
        |memory| is required and a Memory object.
        |programCounter| is required and a Number.
        |labels| is optional and a Labels.
    */
    Instruction.prototype.execute = function(registers, memory, programCounter, labels) {
        console.error('Inheriting object should override execute');
    };

    /*
        Return a string commenting the instruction's behavior. Ex: $s1 = $s2 + $s3
        |registers| is optional and a Registers.
    */
    Instruction.prototype.toComment = function(registers) {
        console.error('Inheriting object should override toComment');
    };

    /**
        Get the properties configuration array.
        @method getPropertiesConfiguration
        @return {Array} The properties configuration array.
    */
    Instruction.prototype.getPropertiesConfiguration = function() {
        return this._propertiesConfiguration.slice();
    };

    /**
        Check whether the register names and constant values are valid.
        @method checkWhetherRegisterNamesAndConstantValuesAreValid
        @return {void}
    */
    Instruction.prototype.checkWhetherRegisterNamesAndConstantValuesAreValid = function() {
        console.error('Inheriting object should override checkWhetherRegisterNamesAndConstantValuesAreValid');
    };

    /**
        Check whether the given register name is valid.
        @method _checkWhetherRegisterNameIsValid
        @protected
        @param {String} registerName The register name to check.
        @return {void}
    */
    Instruction.prototype._checkWhetherRegisterNameIsValid = function(registerName) {
        if (this._validRegisters.indexOf(registerName) === -1) {
            throw new Error(`${registerName} is not a valid register name`);
        }
    };

    /**
        Check whether the given constant value is an N-bit signed value. Ex: 16-bit signed value in range: -32768 to 32767
        @method _checkWhetherConstantValueIsNBitSigned
        @protected
        @param {Number} constantValue The value to check.
        @param {Number} nBits The number of bits to see if signed.
        @return {void}
    */
    Instruction.prototype._checkWhetherConstantValueIsNBitSigned = function(constantValue, nBits) {

        /*
            Minimum value is: -1 * 2^(n - 1)
            Maximum value is: 2^(n - 1) - 1
        */
        const baseValue = 2;
        const nMinus1Value = Math.pow(baseValue, nBits - 1);
        const minValue = -1 * nMinus1Value;
        const maxValue = nMinus1Value - 1;

        this._checkWhetherConstantValueIsValid(constantValue, minValue, maxValue);
    };

    /**
        Check whether the given constant value is an N-bit unsigned value. Ex: 5-bit unsigned value in range: 0 to 31
        @method _checkWhetherConstantValueIsNBitSigned
        @protected
        @param {Number} constantValue The value to check.
        @param {Number} nBits The number of bits to see if signed.
        @return {void}
    */
    Instruction.prototype._checkWhetherConstantValueIsNBitUnsigned = function(constantValue, nBits) {

        /*
            Minimum value is: 0
            Maximum value is: 2^n - 1
        */
        const baseValue = 2;
        const maxValue = Math.pow(baseValue, nBits) - 1;

        this._checkWhetherConstantValueIsValid(constantValue, 0, maxValue);
    };

    /**
        Check whether the given constant value is a N-bit signed value. Ex: 16-bit signed value in range: -32768 to 32767
        @method _checkWhetherConstantValueIsValid
        @protected
        @param {Number} constantValue The value to check.
        @param {Number} minValue The minimum value that constant can be.
        @param {Number} maxValue The maximum value that constant can be.
        @return {void}
    */
    Instruction.prototype._checkWhetherConstantValueIsValid = function(constantValue, minValue, maxValue) {
        const rangeMessage = `range: ${minValue} to ${maxValue}`;

        if (isNaN(constantValue)) {
            throw new Error(`${constantValue} is not a number. Valid number ${rangeMessage}`);
        }

        if ((constantValue < minValue) || (constantValue > maxValue)) {
            throw new Error(`${constantValue} is out of range. Valid ${rangeMessage}`);
        }
    };

    /**
        Return the list of machine instructions that represent this instruction. Note: Some instructions are pseudo-instructions.
        @method toMachineInstructions
        @return {Array} Array of {Instruction}. List of machine instructions that represent this instruction.
    */
    Instruction.prototype.toMachineInstructions = function() {
        return [ this ];
    };

    /**
        Return a list of comments to associate with the machine instructions. Note: Some instructions will override with more details.
        @method toMachineInstructionComments
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {Array} Array of {String}. List of comments to associate with the machine instructions.
    */
    Instruction.prototype.toMachineInstructionComments = function(machineLabels, instructionMemoryStartAddress) { // eslint-disable-line no-unused-vars
        return [ '' ];
    };

    /**
        Return the string representing the instruction as machine instruction text. Some instructions will override this.
        Ex: beq $s1, $s2, loop   may become    beq $s1, $s2, 8
        @method toMachineInstructionString
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @param {Instructions} machineInstructions List of machine instructions in program.
        @return {String} Representation of instruction as machine instruction text.
    */
    Instruction.prototype.toMachineInstructionString = function(machineLabels, instructionMemoryStartAddress, machineInstructions) { // eslint-disable-line no-unused-vars
        return this.toString();
    };

    /**
        Return the bit string representing the instruction as a machine instruction. All instructions will override this.
        Ex: add $s0, $s1, $s2   will become   00000010010100001000100000100000
        @method toMachineInstructionBitString
        @param {Instructions} machineInstructions List of machine instructions in program.
        @param {Labels} machineLabels List of labels mapping label name to machine instruction index.
        @param {Number} instructionMemoryStartAddress The start address of instruction memory.
        @return {String} Representation of instruction as machine instruction bits.
    */
    Instruction.prototype.toMachineInstructionBitString = function(machineInstructions, machineLabels, instructionMemoryStartAddress) { // eslint-disable-line no-unused-vars
        throw new Error('Error: Trying to call Instruction\'s toMachineInstructionBitString, but shouldn\'t.');
    };
}
