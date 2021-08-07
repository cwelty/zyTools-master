'use strict';

/* exported UserInput */

/**
    A class that stores all user input.
    @class UserInput
*/
class UserInput {

    /**
        @constructor
        @param {jQuery} $tool A jQuery reference to this tool.
    */
    constructor($tool) {
        this.$tool = $tool;

        this.updateUserInput();
    }

    /**
        Updates the user input stored by this object.
        @method updateUserInput
        @return {void}
    */
    updateUserInput() {
        this.mean = parseFloat(this.$tool.find('input#mean').val());
        this.std = parseFloat(this.$tool.find('input#std').val());
        this.userValue = parseFloat(this.$tool.find('input#user-value').val());
        this.userValue2 = parseFloat(this.$tool.find('input#user-value-2').val());
        this.selectedCase = this.$tool.find('select#case').val();
    }

    /**
        Puts an error message in the tool.
        @method printError
        @param {String} errorMessage The error to print.
        @return {void}
    */
    printError(errorMessage) {
        const $answer = this.$tool.find('p.answer');

        $answer.addClass('error').text(errorMessage);
    }

    /**
        Looks at the user input to find out if there's an error (missing or invalid inputs).
        @method hasError
        @param {String} calculate The calculation type: 'ztop' or 'ptoz'
        @return {Boolean} Whether there's an error in user input.
    */
    hasError(calculate) {
        let errorMessage = '';

        if (isNaN(this.mean)) {
            errorMessage = 'Error: A mean is needed.';
            this.$tool.find('input#mean').focus();
        }
        else if (isNaN(this.std)) {
            errorMessage = 'Error: A standard deviation is needed.';
            this.$tool.find('input#std').focus();
        }
        else if (this.std <= 0) {
            errorMessage = 'Error: Standard deviation has to be greater than 0.';
            this.$tool.find('input#std').focus();
        }
        else if (calculate === 'ptoz') {
            errorMessage = this.getPToZError();
        }
        else if (calculate === 'ztop') {
            errorMessage = this.getZToPError();
        }

        this.printError(errorMessage);

        return (errorMessage !== '');
    }

    /**
        Returns an error message for the probability to z-score case if needed.
        @method getPToZError
        @return {String} The error message.
    */
    getPToZError() {
        let errorMessage = '';
        const isProbabilityInvalid = (this.userValue > 1) || (this.userValue < 0);

        if (this.userValue && isProbabilityInvalid) {
            errorMessage = 'Error: Probability has to be between 0 and 1.';
            this.$tool.find('input#user-value').focus();
        }
        return errorMessage;
    }

    /**
        Returns an error message for the z-score to probability case if needed.
        @method getZToPError
        @return {String} The error message.
    */
    getZToPError() {
        let errorMessage = '';

        if (this.selectedCase === 'between') {
            const bothXExist = this.userValue && this.userValue2;
            const isOnlyX1Missing = !this.userValue && this.userValue2;
            const isOnlyX2Missing = this.userValue && !this.userValue2;

            if (isOnlyX1Missing) {
                errorMessage = 'Error: An X¹ value is needed.';
                this.$tool.find('input#user-value').focus();
            }
            else if (isOnlyX2Missing) {
                errorMessage = 'Error: An X² value is needed.';
                this.$tool.find('input#user-value-2').focus();
            }
            else if (bothXExist && (this.userValue >= this.userValue2)) {
                errorMessage = 'Error: X¹ has to be smaller than X².';
                this.$tool.find('input#user-value').focus();
            }
        }
        return errorMessage;
    }
}
