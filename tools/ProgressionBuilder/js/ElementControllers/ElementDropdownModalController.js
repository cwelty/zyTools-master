'use strict';

/* global ElementDropdownModal */
/* exported ElementDropdownModalController */

/**
    Creates the modal for the edition of a dropdown element.
    @class ElementDropdownModalController
*/
class ElementDropdownModalController {

    /**
        Initializes an ElementDropdownModalController
        @constructor
        @param {Object} parentResource The parent resource of the module.
        @param {Object} templates Dictionary of templates for rendering elements.
    */
    constructor(parentResource, templates) {

        /**
            The parent resource of the module.
            @property _parentResource
            @private
            @type {Object}
        */
        this._parentResource = parentResource;

        /**
            A reference to the dropdown modal controlled by this controller.
            @property dropdownModal
            @type {ElementDropdownModal}
            @default null
        */
        this.dropdownModal = null;

        /**
            Dictionary of templates for rendering elements.
            @property _templates
            @private
            @type {Object}
        */
        this._templates = templates;
    }

    /**
        Returns the correct option.
        @method getCorrectOption
        @return {Object}
    */
    getDefaultOption() {
        return this._createDropdownOption(this.dropdownModal.getDefaultOption(), false, true, true, true);
    }

    /**
        Returns the correct option.
        @method getCorrectOption
        @return {Object}
    */
    getCorrectOption() {
        return this._createDropdownOption(this.dropdownModal.getCorrectOption(), true);
    }

    /**
        Returns an array with incorrect options.
        @method getIncorrectOptions
        @return {Array<Object>}
    */
    getIncorrectOptions() {
        if (this.dropdownModal.isUsingPythonList()) {
            const variableWithNotation = require('utilities').getPythonNotation(this.dropdownModal.getPythonListName());
            const incorrectOption = this._createDropdownOption(variableWithNotation, false, false, false, false, true);

            return [ incorrectOption ];
        }

        return this.dropdownModal.getIncorrectOptions().map(element => this._createDropdownOption(element));
    }

    getNewOptions() {
        const newDefaultOption = this.getDefaultOption();
        const newCorrectOption = this.getCorrectOption();
        const newIncorrectOptions = this.getIncorrectOptions();
        const newOptions = [ newDefaultOption, newCorrectOption, ...newIncorrectOptions ];

        return newOptions;
    }

    /**
        Shows the modal.
        @method show
        @param {Array} currentOptions The handlebars modal template.
        @param {Object} saveButton An object defining the 'Save' button.
        @param {Object} cancelButton An object defining the 'Cancel' button.
        @return {void}
    */
    show(currentOptions, saveButton, cancelButton) {
        const defaultOptionObject = currentOptions.find(option => option.isDefault);
        const defaultOption = defaultOptionObject ? defaultOptionObject.text : 'Pick';
        const correctOptionObject = currentOptions.find(option => option.isCorrectOption);
        const correctOption = correctOptionObject ? correctOptionObject.text : '';
        const currentIncorrectOptions = currentOptions.filter(option => !option.isDefault && !option.isCorrectOption);

        // If there are incorrect options, find if it's a Python list or an array of options.
        const isCurrentlyUsingList = currentIncorrectOptions.length && currentIncorrectOptions[0].isPythonList;
        const incorrectPythonListName = isCurrentlyUsingList ? require('utilities').getPythonNotation(currentIncorrectOptions[0].text) : '';

        // Open modal with inputs to fill this short answer object's data.
        this._parentResource.showModal(
            'Edit dropdown object',
            this._templates.ElementDropdownEdit({ // eslint-disable-line new-cap
                defaultOption,
                correctOption,
                isUsingList: isCurrentlyUsingList,
                incorrectList: incorrectPythonListName,
            }),
            saveButton,
            cancelButton
        );

        window.setTimeout(() => {
            const incorrectOptionsInput = currentIncorrectOptions.map(incorrectOption =>
                this._templates.ElementDropdownIncorrectOptionEdit({ incorrectOption: incorrectOption.text }) // eslint-disable-line new-cap
            );

            // Add one more field for additional incorrect options.
            incorrectOptionsInput.push(this._templates.ElementDropdownIncorrectOptionEdit({})); // eslint-disable-line new-cap

            this.dropdownModal = new ElementDropdownModal('div.dropdown-modal');
            this.dropdownModal.$modal.append(incorrectOptionsInput);

            this._setupModalEventListeners();
        }, 1);
    }

    /**
        Creates and returns a new dropdown option.
        @private
        @method _createDropdownOption
        @param {String} text The text value of the option.
        @param {Boolean} [isCorrectOption=false] Whether this is the correct option.
        @param {Boolean} [isDefault=false] Whether this is the default option.
        @param {Boolean} [isInvalidOption=false] Whether this is and invalid option.
        @param {Boolean} [isSelected=false] Whether this is the selected option.
        @param {Boolean} [isPythonList=false] Whether the incorrect options are defined as a Python list.
        @return {Object} A new option for the dropdown.
    */
    _createDropdownOption(text, isCorrectOption = false, isDefault = false, // eslint-disable-line max-params
                          isInvalidOption = false, isSelected = false, isPythonList = false) {
        return require('ProgressionUtilities').create().createElementDropdownOption({
            text,
            isCorrectOption,
            isDefault,
            isInvalidOption,
            isSelected,
            isPythonList,
        });
    }

    /**
        Sets up the modal event listeners. Ex: Clearing an option, adding new input fields, etc.
        @private
        @method _setupModalEventListeners
        @return {void}
    */
    _setupModalEventListeners() {
        const $modal = this.dropdownModal.$modal;

        $modal.find('.default-option, .correct-option').on('input', event => {
            const $target = $(event.target);
            const $container = $target.parent();
            const $button = $container.find('button');

            if ($target.val() === '') {
                $container.removeClass('value-present');
                $button.addClass('hide-button');
            }
            else {
                $container.addClass('value-present');
                $button.removeClass('hide-button');
            }
        });

        // When the clear field button is pressed. Clear the related input field.
        const clearButtonPressed = event => {
            let $target = $(event.target);

            // Target should be button.
            if ($target.is('i')) {
                $target = $target.parent();
            }

            // Clear related input field, trigger the input event.
            $target.parent().find('input').val('').trigger('input');
        };

        $modal.find('div.zb-input-container button').click(clearButtonPressed);

        let $incorrectOptionsInput = $modal.find('input.incorrect-option');
        let $lastIncorrectOptionInput = $incorrectOptionsInput.last();

        $modal.sortable({
            items: 'div.incorrect-option-container',
        });

        // When an incorrect option input field is emptied, remove from the modal (except the last one).
        const nonLastIncorrectOptionChangeHandler = event => {
            const $inputField = $(event.target);
            const $container = $inputField.parent();

            if ($inputField.val() === '') {
                $inputField.parent().remove();
                $incorrectOptionsInput.last().focus();
                $container.removeClass('value-present');
            }
            else {
                $container.addClass('value-present');
            }
        };

        $incorrectOptionsInput.filter(':not(:last)').on('input', nonLastIncorrectOptionChangeHandler);

        // If last incorrect option input field has some content, add a new input field (and this one is not last anymore).
        const lastIncorrectOptionChangeHandler = () => {
            if ($lastIncorrectOptionInput.val() !== '') {
                $lastIncorrectOptionInput.unbind('input');
                const newIncorrectOptionInput = this._templates.ElementDropdownIncorrectOptionEdit({}); // eslint-disable-line new-cap

                // Update variables and event handlers.
                $lastIncorrectOptionInput.parent().find('button').removeClass('hide-button');
                $modal.append(newIncorrectOptionInput);
                $modal.find('button').click(clearButtonPressed);
                $incorrectOptionsInput = $modal.find('input.incorrect-option');
                $incorrectOptionsInput.filter(':not(:last)').on('input', nonLastIncorrectOptionChangeHandler);
                $lastIncorrectOptionInput = $incorrectOptionsInput.last();
                $lastIncorrectOptionInput.on('input', lastIncorrectOptionChangeHandler);
            }
        };

        const $useListCheckbox = $modal.find('input#use-list');

        $useListCheckbox.change(() => {
            const $incorrectListNameContainer = $modal.find('div.incorrect-list-name-container');
            const $incorrectOptionContainer = $modal.find('div.incorrect-option-container');

            if ($useListCheckbox.prop('checked')) {
                $incorrectListNameContainer.show();
                $incorrectOptionContainer.hide();
            }
            else {
                $incorrectListNameContainer.hide();
                $incorrectOptionContainer.show();
            }
        });
        $useListCheckbox.trigger('change');

        $lastIncorrectOptionInput.on('input', lastIncorrectOptionChangeHandler);
    }
}
