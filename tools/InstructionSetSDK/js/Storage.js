'use strict';

/* global Byte, HalfWord */

/*
    Storage is an abstract object for storing data in an array of bytes. The array is implemented with
    a lookup table to minimize the amount of user-memory used.

    Storage stores a |_lookupTable|, where each element is a Byte.
    |initialBytesByAddress| is optional and a dictionary with key as address and Word as value.
    |smallestAddress| and |largestAddress| are required and either a Long or number.
*/
function Storage(initialBytesByAddress, smallestAddress, largestAddress) {
    this._lookupTable = {};

    // Convert to Long if value is set.
    var smallestAddressIsSet = !!smallestAddress || (typeof smallestAddress === 'number');
    var largestAddressIsSet = !!largestAddress || (typeof largestAddress === 'number');
    if (smallestAddressIsSet) {
        this.smallestAddress = this._convertToLong(smallestAddress);
    }
    if (largestAddressIsSet) {
        this.largestAddress = this._convertToLong(largestAddress);
    }

    if (!!initialBytesByAddress) {
        for (var address in initialBytesByAddress) {
            var data = initialBytesByAddress[address];
            this._addData(Number(address), data);
        }
    }

    /**
        The byte addresses, each as a {String}, that should not be shown.
        @property byteAddressesToNotShow
        @type {Array}
        @default []
    */
    this.byteAddressesToNotShow = [];

    /**
        Dictionary of addresses and associated labels.
        @property addressLabels
        @type {Object}
        @default {}
    */
    this.addressLabels = {};
}

// Attach prototype functions to Storage.
function buildStoragePrototype() {
    Storage.prototype.numberOfBytesInWord = 4;
    Storage.prototype.readOnlyByteAddresses = [];

    /**
        The name of this storage. Ex: Registers or Memory.
        @property storageName
        @type {String}
        @default 'Storage'
    */
    Storage.prototype.storageName = 'Storage';

    /**
        A written description of the valid names for this storage.
        @property validNames
        @type {String}
    */
    Storage.prototype.validNames = '';

    /**
        Clear which addresses have been accessed.
        @method clearWhichAddressWasAccessed
        @return {void}
    */
    Storage.prototype.clearWhichAddressWasAccessed = function() {
        Object.keys(this._lookupTable).forEach(address => {
            const byte = this._lookupTable[address];

            byte.beenWrittenTo = false;
            byte.beenReadFrom = false;
        });
    };

    /*
        Return whether |address| is between |smallestAddress| and |largestAddress|, inclusively.
        |address| is required and either a number or Long.
    */
    Storage.prototype.isValidAddress = function(address) {
        address = this._convertToLong(address);
        return (address.greaterThanOrEqual(this.smallestAddress) && address.lessThanOrEqual(this.largestAddress));
    };

    /**
        Return whether this address is ok to show.
        @method isShowableAddress
        @param {String} address Or {Number} or {Long}. The address to verify is showable.
        @return {Boolean} Whether this address is ok to show.
    */
    Storage.prototype.isShowableAddress = function(address) {
        const baseWord = this.lookupAddress(address);

        return baseWord.every(byte => this.byteAddressesToNotShow.indexOf(byte.address) === -1);
    };

    /*
        Return the Byte stored at the |address|.
        |address| is required and either a number or a Long.
    */
    Storage.prototype.lookupByte = function(address) {
        const addressAsLong = this._convertToLong(address);
        const addressAsString = addressAsLong.toString();

        this._errorIfAddressIsForbidden(addressAsLong);

        let byte = null;

        // If the address is in |_lookupTable|, then return the Byte.
        if (addressAsString in this._lookupTable) {
            byte = this._lookupTable[addressAsString];
        }

        // Otherwise, the Byte hasn't been created yet, so create then return the Byte.
        else {
            const isReadOnly = (this.readOnlyByteAddresses.indexOf(addressAsLong.toInt()) !== -1);

            byte = new Byte({ isReadOnly, address: addressAsString });
            this.addByte(addressAsLong, byte);
        }

        return byte;
    };

    /*
        Return the Word stored at the |address|.
        |address| is required and either a number or Long.
    */
    Storage.prototype.lookupWord = function(address) {
        address = this._convertToLong(address);
        var bytes = this._getBytesStartingAtAddress(address, this.numberOfBytesInWord);
        return new Word(bytes);
    };

    /**
        Return the {HalfWord} stored at the |address|.
        @method lookupHalfWord
        @param {Number} address The address to lookup. May also be a {Long}.
        @return {HalfWord} The {HalfWord} stored at the given |address|.
    */
    Storage.prototype.lookupHalfWord = function(address) {
        const addressAsLong = this._convertToLong(address);
        const bytes = this._getBytesStartingAtAddress(addressAsLong, (this.numberOfBytesInWord / 2)); // eslint-disable-line no-magic-numbers

        return new HalfWord(bytes);
    };

    /*
        Return the DoubleWord stored at the |address|.
        |address| is required and either a number or Long.
    */
    Storage.prototype.lookupDoubleWord = function(address) {
        address = this._convertToLong(address);
        var bytes = this._getBytesStartingAtAddress(address, (2 * this.numberOfBytesInWord));
        return new DoubleWord(bytes);
    };

    /*
        Return an array of |numberOfBytes| Bytes starting at |address|.
        |address| is required and a Long.
        |numberOfBytes| is required and a number.
    */
    Storage.prototype._getBytesStartingAtAddress = function(address, numberOfBytes) {
        var bytes = [];
        for (var i = 0; i < numberOfBytes; ++i) {
            bytes.push(this.lookupByte(address.add(i)));
        }
        return bytes;
    };

    /*
        Convert |value| to a Long if |value| is a number.
        |value| is required and either a number, string, or Long.
    */
    Storage.prototype._convertToLong = function(value) {
        if (typeof value === 'number') {
            value = window.dcodeIO.Long.fromNumber(value);
        }
        else if (typeof value === 'string') {
            value = window.dcodeIO.Long.fromString(value);
        }
        return value;
    };

    /*
        Add |byte| to the |_lookupTable| at |address|.
        |address| is required and either a number or Long.
        |byte| is required and a Byte.
    */
    Storage.prototype.addByte = function(address, byte) {
        this._addData(address, byte);
    };

    /*
        Add |word| to the |_lookupTable| at |address|.
        |address| is required and a number.
        |word| is required and a Word.
    */
    Storage.prototype.addWord = function(address, word) {
        this._addData(address, word);
    };

    /*
        Add |word| to the |_lookupTable| at |address|.
        |address| is required and a number.
        |doubleWord| is required and a DoubleWord.
    */
    Storage.prototype.addDoubleWord = function(address, doubleWord) {
        this._addData(address, doubleWord);
    };

    /*
        Add |data| to the |_lookupTable| at |address|.
        |address| is required and either a number or Long.
        |data| is required and a Byte, Word, or DoubleWord.
    */
    Storage.prototype._addData = function(address, data) {
        address = this._convertToLong(address);
        // Add |data| if |data|'s address is valid
        if (this.isValidAddress(address)) {
            // |data| is Byte, so add directly to |_lookupTable|.
            if (data instanceof Byte) {
                this._lookupTable[address.toString()] = data;
            }
            // |data| is array of Bytes, so add each Byte to |_lookupTable|.
            else {
                var self = this;
                data.forEach(function(byte, index) {
                    self.addByte(address.add(index), byte);
                });
            }
        }
        // |word|'s address is not valid. Throw error.
        else {
            throw new InstructionSetSDKError('Invalid address: ' + address.toString(), 'InvalidAddress');
        }
    };

    /*
        Return a clone, including a copy of each Word.
        |newStorage| is required and a Storage object.
    */
    Storage.prototype.clone = function(newStorage) {
        for (var address in this._lookupTable) {
            var value = this._lookupTable[address].getSignedValue();
            newStorage.lookupByte(address).setValue(value);
        }
        return newStorage;
    };

    // Accessor method for internal |_lookupTable|.
    Storage.prototype.getLookupTable = function() {
        return this._lookupTable;
    };

    // Return the number of elements in |_loopupTable|.
    Storage.prototype.numberOfElementsInLookupTable = function() {
        var numberOfElements = 0;
        for (var address in this._lookupTable) {
            numberOfElements++;
        }
        return numberOfElements;
    };

    /**
        Lookup the given address and return the bytes stored at that address.
        @method lookupAddress
        @param {Number} address Or {Long} or {String}. The address to lookup.
        @return {BaseWord} The bytes stored at the given address.
    */
    Storage.prototype.lookupAddress = function(address) { // eslint-disable-line
        throw new Error('Storage\'s lookupAddress should not be called.');
    };

    /**
        Remove the byte addresses to not show and instead show them.
        @method clearByteAddressesToNotShow
        @return {void}
    */
    Storage.prototype.clearByteAddressesToNotShow = function() {
        this.byteAddressesToNotShow = [];
    };

    /**
        Throw an error if the address is forbidden, such as if the address is instruction memory.
        The inheriting class should define this.
        @method _errorIfAddressIsForbidden
        @private
        @param {Long} byteAddress The address being checked.
        @return {void}
    */
    Storage.prototype._errorIfAddressIsForbidden = function(byteAddress) { // eslint-disable-line
        throw new Error('Storage\'s _errorIfAddressIsForbidden should not be called.');
    };

    /**
        Add a label to an address.
        @method addLabelToAddress
        @param {Number} address The address to add a label.
        @param {String} label The label to add to address.
        @return {void}
    */
    Storage.prototype.addLabelToAddress = function(label, address) {
        this.addressLabels[address] = label;
    };

    /**
        Map an address to a class name to be added during rendering.
        @property mapAddressToClassName
        @type {Object}
        @default {}
    */
    Storage.prototype.mapAddressToClassName = {};

    /**
        Set a class name to be added to an address during rendering.
        @method addClassToAddress
        @param {String} className The class name to add.
        @param {Number} address The address to add the class name during rendering.
        @return {void}
    */
    Storage.prototype.addClassToAddress = function(className, address) {
        this.mapAddressToClassName[address] = className;
    };
}
