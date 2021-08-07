/*
    Registers is a Storage object with specific address and order of each Word.
    |initialRegistersByAddress| is optional and a dictionary with key as address and Word (or DoubleWord) as value.
    |smallestAddress| and |largestAddress| are optional and either a Long or number.
*/
function Registers(initialRegistersByAddress, smallestAddress, largestAddress) {
    Storage.prototype.constructor.call(this, {}, smallestAddress, largestAddress);

    if (!!initialRegistersByAddress) {
        for (var address in initialRegistersByAddress) {
            var register = this.lookupByRegisterName(address);
            var initial = initialRegistersByAddress[address];
            register.forEach(function(registerByte, index) {
                var initialByte = initial[index];
                var initialByteValue = initialByte.getSignedValue();
                registerByte.setValue(initialByteValue);
            });
        }
    }
}

// Inherit Storage and attach prototype functions to Registers.
function buildRegistersPrototype() {
    Registers.prototype = new Storage();
    Registers.prototype.constructor = Registers;

    /**
        The name of the registers.
        @property storageName
        @type {String}
        @default 'Registers'
    */
    Registers.prototype.storageName = 'Registers';

    /*
        Return the BaseWord for the |registerName|.
        |registerName| is required and a string.
    */
    Registers.prototype.lookupByRegisterName = function(registerName) {
        if (registerName in this.REGISTER_NAME_TO_ADDRESS) {
            return this._lookupRegister(this.REGISTER_NAME_TO_ADDRESS[registerName]);
        }
        else {
            throw new InstructionSetSDKError('Invalid register name: ' + registerName, 'InvalidRegisterName');
        }
    };

    /*
        Lookup the register at |address|. Size of register differs between MIPS and ARM.
        |address| is required and a number.
    */
    Registers.prototype._lookupRegisterByAddress = function(address) {
        console.error('_lookupRegister should be overwritten by inheriting object.');
    };

    /**
        Lookup register by register's address number. See {Storage} for details.
        @method lookupAddress
        @return {BaseWord} The bytes representing the address.
    */
    Registers.prototype.lookupAddress = function(address) {
        return this.lookupByRegisterName(address);
    };

    /**
        Currently not in use by {Registers}.
        @method _errorIfAddressIsForbidden
        @private
        @param {Long} byteAddress The address being checked.
        @return {void}
    */
    Registers.prototype._errorIfAddressIsForbidden = function(byteAddress) {}; // eslint-disable-line
}
