/*
    DoubleWord is an array of 8 Byte elements.
    |bytes| is required and an array with 8 Byte elements.
*/
function DoubleWord(bytes) {
    BaseWord.prototype.constructor.call(this, bytes);
}

// Inherit BaseWord and attach prototype functions to DoubleWord.
function buildDoubleWordPrototype() {
    DoubleWord.prototype = new BaseWord();
    DoubleWord.prototype.constructor = DoubleWord;

    /**
        Return a 64-bit signed value.
        @method getSignedValue
        @return {Number} The 64-bit signed value.
    */
    DoubleWord.prototype.getSignedValue = function() {
        return this.getLong().toSigned();
    };

    /**
        Return a 64-bit unsigned value.
        @method getUnsignedValue
        @return {Number} The 64-bit unsigned value.
    */
    DoubleWord.prototype.getUnsignedValue = function() {
        return this.getLong().toUnsigned();
    };
}
