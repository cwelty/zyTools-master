/*
    BaseWord is an abstract object is an array with Byte elements.
    |bytes| is optional and an array with Byte elements.
*/
function BaseWord(bytes) {
    // |bytes| does not exist during prototypical inheritance.
    if (!!bytes) {
        this.push.apply(this, bytes);
        this._long = null;
    }
}

// Inherit Array and attach prototype functions to BaseWord.
function buildBaseWordPrototype() {
    BaseWord.prototype = new Array();
    BaseWord.prototype.constructor = BaseWord;
    BaseWord.prototype.numberOfBitsPerByte = 8;
    BaseWord.prototype.bytesPerWord = 4;

    // This value may differ for inheriting objects.
    BaseWord.prototype.numberOfBits = 64;

    /**
        Return the {BaseWord}'s {Long}.
        @method getLong
        @return {Long} The {BaseWord}'s {Long}.
    */
    BaseWord.prototype.getLong = function() {

        // Build the long.
        if (!this._long) {
            this._updateLongFromBytes();
        }

        // Reflect the read onto each Byte.
        this.forEach(byte => {
            byte.getSignedValue();
        });

        return this._long;
    };

    /**
        Print signed value in specified |radix|.
        @method toString
        @param {Number} [radix=10] The radix of the value to be printed. Ex: 10 means base-10.
        @return {String} The signed value representation of the {BaseWord}.
    */
    BaseWord.prototype.toString = function(radix = 10) { // eslint-disable-line no-magic-numbers
        return this.getSignedValue().toString(radix);
    };

    /**
        Return a unsigned value.
        Inheriting objects will override this.
        @method getUnsignedValue
        @return {Number} The unsigned value.
    */
    BaseWord.prototype.getUnsignedValue = function() {
        throw new Error('getUnsignedValue should be overwritten by inheriting object.');
    };

    /**
        Return the signed value.
        @method getSignedValue
        @return {Number} The signed value.
    */
    BaseWord.prototype.getSignedValue = function() {
        throw new Error('getSignedValue should be overwritten by inheriting object.');
    };

    /**
        Return whether the value stored is 0.
        @method isZero
        @return {Boolean} Whether the value stored is 0.
    */
    BaseWord.prototype.isZero = function() {
        return this.getLong().isZero();
    };

    /*
        Return a Long storing |this| + |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.add = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().add(rhsToUse);
    };

    /*
        Return a Long storing |this| - |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.subtract = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().subtract(rhsToUse);
    };

    /*
        Return a Long storing |this| AND |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.and = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().and(rhsToUse);
    };

    /*
        Return a Long storing |this| OR |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.or = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().or(rhsToUse);
    };

    /*
        Return a Long storing |this| NOR |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.nor = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().or(rhsToUse).not();
    };

    /**
        Compute exclusive-or between |this| and |rhs|.
        @method xor
        @param {BaseWord} rhs The right-hand side. May be a {Number} or {String}.
        @return {Long} The result of the exclusive-or.
    */
    BaseWord.prototype.xor = function(rhs) {
        const rhsToUse = this._convertToLongNumberOrString(rhs);

        return this.getLong().xor(rhsToUse);
    };

    /*
        Return a Long storing |this| multiplied by |rhs|.
        @method multiply
        @param {Object} rhs Right hand side of the multiply operation. Either a {BaseWord}, {Number}, or {String}.
        @return {Long} The result of |this| multiplied by |rhs|.
    */
    BaseWord.prototype.multiply = function(rhs) {
        const rhsToUse = this._convertToLongNumberOrString(rhs);

        return this.getLong().multiply(rhsToUse);
    };

    /*
        Return a Long storing |this| shifted left by |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.shiftLeft = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().shiftLeft(rhsToUse);
    };

    /*
        Return a Long storing |this| shifted right by |rhs|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.shiftRight = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().shiftRight(rhsToUse);
    };

    /*
        Return whether |baseWord| is equal to |this|.
        |baseWord| is required and a baseWord.
    */
    BaseWord.prototype.equals = function(baseWord) {
        var sameNumberOfBytes = this.length === baseWord.length;
        return sameNumberOfBytes && this.getLong().equals(baseWord.getLong());
    };

    /*
        Return whether |this| is less than |baseWord|.
        |rhs| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype.isLessThan = function(rhs) {
        var rhsToUse = this._convertToLongNumberOrString(rhs);
        return this.getLong().lessThan(rhsToUse);
    };

    /**
        Return the given value as an unsigned integer.
        @method toUnsigned
        @param {Number} integerValue An integer value.
        @return {Number} The unsigned value of the given value.
    */
    BaseWord.prototype.toUnsigned = function(integerValue) {
        return (integerValue >>> 0); // eslint-disable-line no-bitwise
    };

    /*
        Split |lowerWord| and |upperWord| by Byte into each element in Bytes.
        Supports up to 64-bits.
        |lowerWord| is required and a 32-bit number.
        |upperWord| is optional and a 32-bit number.
    */
    BaseWord.prototype.setValue = function(lowerWord, upperWord) {
        var self = this;
        this.forEach(function(byte, index) {
            var offset = self.numberOfBitsPerByte * (index % self.bytesPerWord);
            var byteMask = 0xFF;
            var maskOffset = byteMask << offset;
            var word = (index < self.bytesPerWord) ? lowerWord : upperWord;
            var maskedValue = word & maskOffset;
            var byteValue = maskedValue >>> offset;
            byte.setValue(byteValue);
        });

        this._setLong(lowerWord, upperWord);
    };

    /*
        Set Bytes with |long|.
        |long| is required and a Long.
    */
    BaseWord.prototype.setValueByLong = function(long) {
        this.setValue(long.getLowBitsUnsigned(), long.getHighBitsUnsigned());
    };

    /*
        Set |this|'s Bytes with |baseWord|.
        |baseWord| is required and a BaseWord.
    */
    BaseWord.prototype.setValueByBaseWord = function(baseWord) {
        this.setValueByLong(baseWord.getLong());
    };

    // Set |_long| with value stored in |this|.
    BaseWord.prototype._updateLongFromBytes = function() {
        // Sum Bytes into |lowerWord| and |upperWord|.
        var lowerWord = 0;
        var upperWord = 0;
        var self = this;
        this.forEach(function(byte, index) {
            var shiftAmount = self.numberOfBitsPerByte * (index % self.bytesPerWord);
            var signedValue = byte.getUnsignedValue() << shiftAmount;
            var unsignedValue = signedValue >>> 0;

            // First 4 bytes
            if (index < self.bytesPerWord) {
                lowerWord += unsignedValue;
            }
            // Second 4 bytes
            else if (index < (2 * self.bytesPerWord)) {
                upperWord += unsignedValue;
            }
        });

        this._setLong(lowerWord, upperWord);
    };

    /**
        Convert the given {Long}, {Number}, {String}, or {BaseWord} to {Long}.
        @method _convertToLong
        @private
        @param {Long} value Convert this value to a {Long}. May also be a {Number}, {String}, or {BaseWord}.
        @return {Long} The given value as a {Long}.
    */
    BaseWord.prototype._convertToLong = function(value) {
        const isBaseWord = value.getLong && window.dcodeIO.Long.isLong(value.getLong());
        const long = isBaseWord ? value.getLong() : window.dcodeIO.Long.fromValue(value);

        long.unsigned = true;

        return long;
    };

    /*
        If |value|'s |_long| is a Long, then return |_long|. Otherwise, return |value|.
        |value| is required and either a BaseWord, number, or string.
    */
    BaseWord.prototype._convertToLongNumberOrString = function(value) {
        var longNumberOrString = value;
        if (value.getLong && window.dcodeIO.Long.isLong(value.getLong())) {
            longNumberOrString = value.getLong();
        }
        return longNumberOrString;
    };

    /*
        Set |_long| with |lowerWord| and |upperWord|.
        |lowerWord| and |upperWord| are required and a 32-bit number.
    */
    BaseWord.prototype._setLong = function(lowerWord, upperWord) {
        this._long = window.dcodeIO.Long.fromBits(
            lowerWord,
            upperWord,
            true // isUnsigned
        );
    };

    /**
        Return whether any of the bytes have been written to.
        @method beenWrittenTo
        @return {Boolean} Whether any of the bytes have been written to.
    */
    BaseWord.prototype.beenWrittenTo = function() {
        return this.some(byte => byte.beenWrittenTo);
    };

    /**
        Clear whether each byte has been written to.
        @method clearBeenWrittenTo
        @return {void}
    */
    BaseWord.prototype.clearBeenWrittenTo = function() {
        this.forEach(byte => byte.beenWrittenTo = false); // eslint-disable-line no-return-assign
    };

    /**
        Return whether any of the bytes have been read from.
        @method beenReadFrom
        @return {Boolean} Whether any of the bytes have been read from.
    */
    BaseWord.prototype.beenReadFrom = function() {
        return this.some(byte => byte.beenReadFrom);
    };

    /**
        Return whether the base word is ready only.
        @method isReadOnly
        @return {Boolean} Whether the base word is ready only.
    */
    BaseWord.prototype.isReadOnly = function() {
        return this.some(byte => byte.isReadOnly);
    };
}
