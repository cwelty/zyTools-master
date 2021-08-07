'use strict';

/*
    Word is an array of 4 Byte elements.
    |bytes| is required and an array with 4 Byte elements.
*/
function Word(bytes) {
    BaseWord.prototype.constructor.call(this, bytes);
}

// Inherit BaseWord and attach prototype functions to Word.
function buildWordPrototype() {
    Word.prototype = new BaseWord();
    Word.prototype.constructor = Word;
    Word.prototype.numberOfBits = 32;

    /**
        Return a 32-bit signed value.
        @method getSignedValue
        @return {Number} The 32-bit signed value.
    */
    Word.prototype.getSignedValue = function() {
        return this.getLong().getLowBits();
    };

    /**
        Return a 16-bit unsigned value.
        @method getUnsignedValue
        @return {Number} The 16-bit unsigned value.
    */
    Word.prototype.getUnsignedValue = function() {
        return new Uint32Array([ this.getSignedValue() ])[0];
    };

    /**
        Return whether |this| is less than |rhs|.
        @method isLessThan
        @param {BaseWord} rhs The right-hand side of the less than expression. Can also be a {Number} or {String}.
        @return {Boolean} Whether |this| is less than |rhs|.
    */
    Word.prototype.isLessThan = function(rhs) {
        const rhsToUse = this._convertToLong(rhs);

        return this.getLong().low < rhsToUse.low;
    };

    /**
        Return whether |this| is less than |rhs| when both are unsigned.
        @method isLessThanUnsigned
        @param {BaseWord} rhs The right-hand side of the less than expression. Can also be a {Number} or {String}.
        @return {Boolean} Whether |this| is less than |rhs| when both are unsigned.
    */
    Word.prototype.isLessThanUnsigned = function(rhs) {
        const rhsToUse = this._convertToLong(rhs);

        return this.toUnsigned(this.getLong().low) < this.toUnsigned(rhsToUse.low);
    };
}
