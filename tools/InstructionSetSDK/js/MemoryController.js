'use strict';

/* global ShowAddressContainerOptions, BytesToPrint */

/**
    Render and control a {Memory} object.
    @class MemoryController
    @extends StorageController
    @constructor
    See StorageController for details.
*/
function MemoryController(memory, domID, templates, printRadix) {
    this._showAddressContainerOptions.upperCaseName = 'Address';
    this._showAddressContainerOptions.lowerCaseName = 'address';
    this._showAddressContainerOptions.lowerCaseNamePlural = 'addresses';
    StorageController.prototype.constructor.call(this, memory, domID, templates, printRadix);
}

/**
    Inherit StorageController and attach prototype functions to MemoryController.
    @method buildMemoryControllerPrototype
    @return {void}
*/
function buildMemoryControllerPrototype() {
    MemoryController.prototype = new StorageController();
    MemoryController.prototype.constructor = MemoryController;

    /**
        Return a list of the used bytes, including the byte's name and value.
        @method getUsedBytesNameAndValue
        @return {Array} of {BytesToPrint} The list of used bytes.
    */
    MemoryController.prototype.getUsedBytesNameAndValue = function() {

        // Sort bytes in |lookupTable| into |addresses| from smallest to largest.
        const addresses = Object.keys(this._storage.getLookupTable()).map(address => Number(address)).sort((e1, e2) => e1 - e2);

        // Print each multiple of |bytesPrintedPerAddress| in |addresses|.
        const bytesToPrint = [];
        const bytesPrintedPerAddress = this._storage.bytesPrintedPerAddress;

        addresses.forEach(address => {
            let wordAddress = null;

            // Print |address| if it's a multiple of |bytesPrintedPerAddress|.
            if ((address % bytesPrintedPerAddress) === 0) {
                wordAddress = address;
            }

            // Otherwise, make sure this |address| is being printed with the rest of the word.
            else {

                // The rest of the word starts at the previous multiple of |bytesPrintedPerAddress|.
                const previousMultipleOfFourAddress = (address - (address % bytesPrintedPerAddress));
                const isWordAddressInWordToPrints = bytesToPrint.some(wordToPrint => wordToPrint.address === previousMultipleOfFourAddress);

                if (!isWordAddressInWordToPrints) {
                    wordAddress = previousMultipleOfFourAddress;
                }
            }

            if (wordAddress !== null) {

                // Lookup Word if |bytesPrintedPerAddress| is 4.
                let baseWord = null;

                if (bytesPrintedPerAddress === 4) { // eslint-disable-line no-magic-numbers
                    baseWord = this._storage.lookupWord(wordAddress);
                }

                // Lookup DoubleWord if |bytesPrintedPerAddress| is 8.
                else if (bytesPrintedPerAddress === 8) { // eslint-disable-line no-magic-numbers
                    baseWord = this._storage.lookupDoubleWord(wordAddress);
                }

                bytesToPrint.push(
                    new BytesToPrint(
                        wordAddress,
                        this._printBaseWord(baseWord),
                        this._storage.addressLabels[wordAddress],
                        baseWord.beenWrittenTo(),
                        baseWord.isReadOnly(),
                        this._storage.mapAddressToClassName[wordAddress]
                    )
                );
            }
        });

        return bytesToPrint;
    };

    /**
        Make a {ShowAddressContainerOptions} object for use when rendering.
        @method _makeShowAddressContainerOptions
        @private
        @param {String} validNames A description of the valid names for this storage.
        @return {ShowAddressContainerOptions} The options
    */
    MemoryController.prototype._makeShowAddressContainerOptions = function(validNames) {
        return new ShowAddressContainerOptions('Address', 'address', 'addresses', validNames);
    };
}
