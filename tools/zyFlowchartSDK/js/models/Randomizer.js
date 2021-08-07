'use strict';

/* exported Randomizer */
/* global alea */

/**
    A random number generator that can be seeded.
    @class Randomizer
*/
class Randomizer {

    /**
        @constructor
    */
    constructor() {

        /**
            The alea instance, which is a seedable random number generator.
            @property alea
            @type {alea}
            @default null
        */
        this.alea = null;
    }

    /**
        Initialize the randomizer with a seed value.
        @method initialize
        @return {void}
    */
    initialize() {
        const currentTime = (new Date()).getTime();

        this.setSeed(currentTime);
    }

    /**
        Create an alea instance with the given seed.
        @method setSeed
        @param {String} seed The seed to set.
        @return {void}
    */
    setSeed(seed) {
        this.alea = new alea(seed); // eslint-disable-line new-cap
    }

    /**
        Return a randomly-generated 32-bit integer.
        @method getNumber
        @return {Integer} A randomly-generated 32-bit integer.
    */
    getNumber() {
        return Math.abs(this.alea.int32());
    }
}
