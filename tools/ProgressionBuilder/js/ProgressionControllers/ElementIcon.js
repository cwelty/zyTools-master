'use strict';

/* exported ElementIcon */

/**
    Structure to store an element icon's type and symbol.
    @class ElementIcon
*/
class ElementIcon {

    /**
        @constructor
        @param {String} type The type of element this icon represents.
        @param {String} symbol The symbol to print that represents this icon.
    */
    constructor(type, symbol) {
        this.symbol = symbol;
        this.type = type;
    }
}
