'use strict';

/* exported buildHalfWordPrototype */
/* global BaseWord */

/**
    HalfWord is an array of 2 {Byte} elements.
    @class HalfWord
    @extends BaseWord
    @constructor
    @param {Array} bytes The 2 {Byte} elements to store.
*/
function HalfWord(bytes) {
    BaseWord.prototype.constructor.call(this, bytes);
}

/**
    Inherit BaseWord and attach prototype functions to HalfWord.
    @method buildHalfWordPrototype
    @return {void}
*/
function buildHalfWordPrototype() {
    HalfWord.prototype = new BaseWord();
    HalfWord.prototype.constructor = HalfWord;
    HalfWord.prototype.numberOfBits = 16;

    /**
        Sign extend |_long|.
        @method _updateLongFromBytes
        @return {void}
    */
    HalfWord.prototype._updateLongFromBytes = function() {
        BaseWord.prototype._updateLongFromBytes.call(this);

        this._setLong(this.getSignedValue(), 0);
    };

    /**
        Return a 16-bit signed value.
        @method getSignedValue
        @return {Number} The 16-bit signed value.
    */
    HalfWord.prototype.getSignedValue = function() {
        const signed32BitValue = this.getLong().getLowBits();

        return new Int16Array([ signed32BitValue ])[0];
    };

    /**
        Return a 16-bit unsigned value.
        @method getUnsignedValue
        @return {Number} The 16-bit unsigned value.
    */
    HalfWord.prototype.getUnsignedValue = function() {
        const signed32BitValue = this.getLong().getLowBits();

        return new Uint16Array([ signed32BitValue ])[0];
    };
}
