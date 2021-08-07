'use strict';

/* exported InputOutputData */
/**
    Stores data about each input or output for the ALU: Data inputs, select signal inputs, and ALU output.
    @class InputOutputData
*/
class InputOutputData {

    /**
        Initializes the object.
        @constructor
        @param {String} binary The binary value of the input.
        @param {Number} size The number of bits this input stores.
        @param {Boolean} isDisabled Whether it is enabled.
        @param {String} name The name of this input or output.
    */
    constructor(binary, size, isDisabled, name) {

        /**
            The binary value of the input/output data in a String
            @type {String}
            @property binary
        */
        this.binary = binary;

        /**
            The size of the input/output data. Number of bits it can hold.
            @type {Integer}
            @property size
        */
        this.size = size;

        /**
            Wether the input/output data switches are disabled.
            @type {Boolean}
            @property isDisabled
        */
        this.isDisabled = isDisabled;

        /**
            The name of the input/output data.
            @type {String}
            @property name
        */
        this.name = name;

        /**
            The name of each bit. The wire names. Ex: 'c0', 'c1', 'c2', etc.
            @type {String}
            @property bitNames
        */
        this.bitNames = require('utilities').createArrayOfSizeN(this.size).map((element, index) => `${this.name}${index}`).reverse();
    }
}
