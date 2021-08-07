/*
    Render and control a storage object.
    @class StorageController
    @constructor
    @param {Storage} storage The storage to be controlled.
    @param {String} domID The DOM id where the controller can put itself.
    @param {Object} templates A dictionary of rendering templates.
    @param {Number} printRadix The radix for printing an address' value. Default is 10.
*/
function StorageController(storage, domID, templates, printRadix) {
    this._storage = storage;
    this._domID = domID;
    this._templates = templates;
    this._printRadix = printRadix || 10;
    this._isEditing = false;

    /*
        Inheriting objects call this constructor and use this render.
        Required properties are not provided during inheritance.
        Ex: When MemoryController inherits StorageController:
            MemoryController.prototype = new StorageController();
    */
    if (!!storage && !!domID && !!templates) {
        this._render();
    }
}

// Attach prototype functions to StorageController.
function buildStorageControllerPrototype() {

    /**
        The options used for the show address container template.
        @property _showAddressContainerOptions
        @private
        @type {Object}
    */
    StorageController.prototype._showAddressContainerOptions = {
        upperCaseName: '',
        lowerCaseName: '',
        lowerCaseNamePlural: '',
        validNames: '',
    };

    /**
        Render then output the view.
        @method _render
        @private
        @param {Boolean} highlightChanges Whether to render the storage with highlighted changes.
        @return {void}
    */
    StorageController.prototype._render = function(highlightChanges = false) {
        const $storage = $(`#${this._domID}`);

        $storage.empty();

        const showAddressContainerOptions = this._makeShowAddressContainerOptions(this._storage.validNames);
        const storageHTML = this._templates.storage({
            bytes: this.getUsedBytesNameAndValue(),
            editable: this._isEditing,
            highlightChanges,
            storageName: this._storage.storageName,
        });

        $storage.html(storageHTML);

        // Set the location of the plus button to be just below the memory cells.
        if (this._isEditing) {
            $storage.find('.add-address').css('top', $storage.find('.memoryCells').height());
        }

        const $addAddress = $storage.find('.add-address');
        const showAddressContainer = this._templates.showAddressContainer({ options: showAddressContainerOptions });

        $addAddress.webuiPopover({
            content: showAddressContainer,
            placement: 'bottom',
            onShow: $popover => {
                $popover.find('.invalid-address-message').hide();

                const $input = $popover.find('.show-address-pop-up input');

                $input.focus();

                // Prevent listeners from being added multiple times.
                if (!$popover.data('beenShownBefore')) {
                    $popover.data('beenShownBefore', true);

                    $input.keyup(event => {
                        if (event.keyCode === require('utilities').ENTER_KEY) {
                            this._showNewAddress($popover, $input.val());
                        }
                    });

                    $popover.find('.show-address-pop-up .show').click(event => {
                        this._showNewAddress($popover, $input.val());
                        event.stopPropagation();
                    });

                    $popover.find('.show-address-pop-up .cancel').click(event => {
                        this._closeShowAddressPopUp($popover);
                        event.stopPropagation();
                    });
                }
            },
            onHide: $popover => {
                $popover.find('.show-address-pop-up input').val('');
            },
        });

        if (this._isEditing) {
            $storage.find('.show-address-pop-up').hide();

            var self = this;

            // Update storage when user edits an address' value.
            $storage.find('.bytes-value input').change(function() {
                var addressBytes = self._storage.lookupAddress($(this).attr('address'));

                /*
                    If user's value is an empty string, then use the string '0' instead.
                    Empty string crashes conversion to Long.
                */
                var value = $(this).val();
                value = (value !== '') ? value : '0';
                value = window.dcodeIO.Long.fromString(value);
                addressBytes.setValueByLong(value);

                // Update the shown value with stored value.
                $(this).val(addressBytes.toString());
            });
        }
    };

    /**
        Show the given new address.
        @method _showNewAddress
        @private
        @param {Object} $popover jQuery reference to pop-over object.
        @param {String} newAddress The address to show.
        @return {void}
    */
    StorageController.prototype._showNewAddress = function($popover, newAddress) {
        let canShowAddress = true;

        try {
            canShowAddress = this._storage.isShowableAddress(newAddress);
        }
        catch (error) {
            canShowAddress = false;
        }

        if (canShowAddress) {
            this._closeShowAddressPopUp($popover);
        }
        else {
            $popover.find('.invalid-address-message').show();
        }
    };

    /**
        Close the pop-up for which address to show.
        @method _closeShowAddressPopUp
        @private
        @param {Object} $popover jQuery reference to pop-over object.
        @return {void}
    */
    StorageController.prototype._closeShowAddressPopUp = function($popover) {
        $popover.hide();
        this._render();
    };

    /**
        Enable the editing of this storage.
        @method enableEditing
        @return {void}
    */
    StorageController.prototype.enableEditing = function() {
        this._isEditing = true;
        this._render();
    };

    /**
        Disable the editing of this storage.
        @method disableEditing
        @return {void}
    */
    StorageController.prototype.disableEditing = function() {
        this._isEditing = false;
        this._render();
    };

    /**
        Update the {Storage}.
        @method update
        @param {Storage} storage The updated storage object.
        @param {Boolean} highlightChanges Whether to render the storage with highlighted changes.
        @return {void}
    */
    StorageController.prototype.update = function(storage, highlightChanges = false) {
        this._storage = storage;
        this._render(highlightChanges);
    };

    /**
        Print |baseWord| based on |printRadix|.
        @method _printBaseWord
        @private
        @param {BaseWord} baseWord The data to print.
        @return {String} The value stored in |baseWord| printed.
    */
    StorageController.prototype._printBaseWord = function(baseWord) {
        var string = baseWord.toString(this._printRadix);

        // Binary printing has prefixes with 0.. Ex: 0..01101
        if (this._printRadix === 2) {
            // If string is '0', do not change from '0'.
            if (string !== '0') {
                var numberOfBitsNotPrinted = baseWord.numberOfBits - string.length;
                if (numberOfBitsNotPrinted >= 4) {
                    string = '0..0' + string;
                }
                else {
                    // Prefix with |numberOfBitsNotPrinted| 0s.
                    string = (new Array(numberOfBitsNotPrinted + 1).join('0')) + string;
                }
            }
        }
        return string;
    };

    /*
        Return array of Bytes to print.
        This function should be overwritten by inheriting classes.
    */
    StorageController.prototype.getUsedBytesNameAndValue = function() {
        console.error('getUsedBytesNameAndValue should be overwritten by inheriting object.');
    };

    /**
        Make a {ShowAddressContainerOptions} object for use when rendering.
        The inheriting class should define this function.
        @method _makeShowAddressContainerOptions
        @private
        @param {String} validNames A description of the valid names for this storage.
        @return {ShowAddressContainerOptions} The options
    */
    StorageController.prototype._makeShowAddressContainerOptions = function(validNames) { // eslint-disable-line
        throw new Error('StorageController\'s _makeShowAddressContainerOptions was called, but inheriting object should have overridden');
    };
}
