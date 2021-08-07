'use strict';

/**
    Used for testing zyWeb's modal API.
    @module ModalTester
*/
class ModalTester {

    /**
        Load module to DOM and add event listeners.
        @method init
        @param {Number} id The DOM id of where to load the module.
        @param {Object} parentResource Collection of functions provided by the parent resource.
        @return {void}
    */
    init(id, parentResource) {
        this.id = id;

        <%= grunt.file.read(hbs_output) %>

        const html = this.ModalTester.layout();
        const $module = this._getModule();

        $module.html(`<style><%= grunt.file.read(css_filename) %></style>${html}`);

        $module.find('.alert').click(() => {
            this._addTextToTextarea('Alert clicked');
            parentResource.alert(
                'Alert',
                this.ModalTester.modal()
            );
        });

        $module.find('.show-modal').click(() => {
            this._addTextToTextarea('Show modal clicked');
            parentResource.showModal(
                'Show modal',
                this.ModalTester.modal(),
                {
                    keepOpen: false,
                    label: 'OK',
                    decoration: 'button-blue',
                    callback: () => {
                        this._addTextToTextarea('OK clicked');
                    },
                },
                {
                    keepOpen: false,
                    label: 'Cancel',
                    decoration: 'button-gray',
                    callback: () => {
                        this._addTextToTextarea('Cancel clicked');
                    },
                }
            );
        });

        $module.find('.reset').click(() => {
            this._addTextToTextarea('Reset clicked');
            parentResource.showModal(
                'Reset this activity?',
                '',
                {
                    keepOpen: false,
                    label: 'Yes, reset',
                    decoration: 'button-blue',
                    callback: () => {
                        this._addTextToTextarea('Yes clicked');
                    },
                },
                {
                    keepOpen: false,
                    label: 'No, do not reset',
                    decoration: 'button-red',
                    callback: () => {
                        this._addTextToTextarea('Cancel clicked');
                    },
                }
            );
        });
    }

    /**
        Add given text to the textarea.
        @method _addTextToTextarea
        @private
        @param {String} text The text to add.
        @return {void}
    */
    _addTextToTextarea(text) {
        const $textarea = this._getModule().find('textarea');
        let existingText = $textarea.val();

        if (existingText && text) {
            existingText += '\n';
        }

        $textarea.val(existingText + text);
    }

    /**
        Return a jQuery reference to the module's DOM.
        @method _getModule
        @return {Object} jQuery reference to the module's DOM.
    */
    _getModule() {
        return $(`#${this.id}`);
    }
}

const modalTesterExport = {
    create: function() {
        return new ModalTester();
    },
};

module.exports = modalTesterExport;
