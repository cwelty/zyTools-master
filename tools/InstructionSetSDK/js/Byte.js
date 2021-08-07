/**
    Byte stores 8 unsigned bits.
    @class Byte
    @constructor
    @param {Object} options Optional settings for the byte.
    @param {Number} options.value The initial value of the byte.
    @param {Boolean} options.isReadOnly Whether this byte is read only.
    @param {String} [options.address=''] The address of this Byte in storage.
*/
function Byte(options) {
    this._value = new Uint8Array(1);
    this._value[0] = (options && options.value) || 0;
    this.isReadOnly = (options && options.isReadOnly) || false;
    this.address = (options && options.address) || '';
    this.beenWrittenTo = false;
    this.beenReadFrom = false;
}

function buildBytePrototype() {
    /**
        Get the value of the byte.
        @method getUnsignedValue
        @return {Number} The value stored in byte.
    */
    Byte.prototype.getUnsignedValue = function() {
        this.beenReadFrom = true;
        return this._value[0];
    };

    /**
        Return the signed value of the byte.
        @method getSignedValue
        @return {Number} The signed value of the byte.
    */
    Byte.prototype.getSignedValue = function() {
        this.beenReadFrom = true;
        return new Int8Array([ this._value[0] ])[0];
    };

    /**
        Set the value of the byte.
        @method setValue
        @param {Number} value The value to set.
        @return {void}
    */
    Byte.prototype.setValue = function(value) {
        if (!this.isReadOnly) {
            this._value[0] = value;
            this.beenWrittenTo = true;
        }
    };

    /**
        Set the value of this Byte using a {Long}.
        @method setValueByLong
        @param {Long} long The long storing the value to set.
        @return{void}
    */
    Byte.prototype.setValueByLong = function(long) {
        this.setValue(long.getLowBitsUnsigned());
    };

    /**
        Return Byte's value as a string using signed representation.
        @method toString
        @return {String} Byte's value as a string using signed representation.
    */
    Byte.prototype.toString = function() {
        return this.getSignedValue().toString();
    };
}
