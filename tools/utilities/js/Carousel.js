'use strict';

/* exported Carousel */

/**
    A Carousel stores a randomly-ordered |array| and an |index|.
    @class Carousel
*/
class Carousel {

    /**
        Initialize the carousel.
        @constructor
        @param {Array} array The array to carousel.
    */
    constructor(array) {
        this.array = array;
        this.index = 0;
    }

    /**
        Get the next value from the carousel.
        @method getValue
        @return {Object} The next value.
    */
    getValue() {
        this.index = (this.index + 1) % this.array.length;
        return this.array[this.index];
    }
}
