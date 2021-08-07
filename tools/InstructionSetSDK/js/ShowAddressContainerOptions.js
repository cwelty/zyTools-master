'use strict';

/* exported ShowAddressContainerOptions */

/**
    Store the options expected by the showAddressContainer template.
    @class ShowAddressContainerOptions
*/
class ShowAddressContainerOptions {

    /**
        @constructor
        @param {String} upperCaseName The name of a unit of storage starting with an upper-case. Ex: Address
        @param {String} lowerCaseName The name of a unit of storage starting with a lower-case. Ex: address
        @param {String} lowerCaseNamePlural The plural of |lowerCaseName|. Ex: addresses
        @param {String} validNames A description of the valid values. Ex: 0 - 4294967292
    */
    constructor(upperCaseName, lowerCaseName, lowerCaseNamePlural, validNames) {
        this.upperCaseName = upperCaseName;
        this.lowerCaseName = lowerCaseName;
        this.lowerCaseNamePlural = lowerCaseNamePlural;
        this.validNames = validNames;
    }
}
