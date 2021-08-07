'use strict';

/* exported buildRegistersControllerPrototype */
/* global StorageController, BytesToPrint, ShowAddressContainerOptions */

/**
    Controls the rendering of the registers.
    @class RegistersController
    @extends StorageController
    @constructor
    @param {Registers} registers The registers to be controlled.
    @param {String} domID The DOM id where the controller can put itself.
    @param {Object} templates A dictionary of rendering templates.
    @param {Number} printRadix The radix for printing an address' value. Default is 10.
*/
function RegistersController(registers, domID, templates, printRadix) {
    StorageController.prototype.constructor.call(this, registers, domID, templates, printRadix);
}

/**
    Inherit StorageController and attach prototype functions to RegistersController.
    @method buildRegistersControllerPrototype
    @return {void}
*/
function buildRegistersControllerPrototype() {
    RegistersController.prototype = new StorageController();
    RegistersController.prototype.constructor = RegistersController;

    // Return array of Registers to print.
    RegistersController.prototype.getUsedBytesNameAndValue = function() {
        const lookupTable = this._storage.getLookupTable();

        return this._storage.REGISTER_NAME_ORDER.filter(registerName => {
            const registerNameAsAddress = this._storage.REGISTER_NAME_TO_ADDRESS[registerName];

            return (registerNameAsAddress in lookupTable);
        }).filter(registerName => this._storage.isShowableAddress(registerName)).map(registerName => {
            const register = this._storage.lookupByRegisterName(registerName);

            return new BytesToPrint(
                registerName,
                this._printBaseWord(register),
                this._storage.addressLabels[registerName],
                register.beenWrittenTo(),
                register.isReadOnly(),
                this._storage.mapAddressToClassName[registerName]
            );
        });
    };

    /**
        Make a {ShowAddressContainerOptions} object for use when rendering.
        @method _makeShowAddressContainerOptions
        @private
        @param {String} validNames A description of the valid names for this storage.
        @return {ShowAddressContainerOptions} The options
    */
    RegistersController.prototype._makeShowAddressContainerOptions = function(validNames) {
        return new ShowAddressContainerOptions('Register', 'register', 'registers', validNames);
    };
}
