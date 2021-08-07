/* exported BinaryDecimalConverter */
'use strict';

/**
    Enables a user to convert numbers from binary to decimal and viceversa.
    @module BinaryDecimalConverter
*/
class BinaryDecimalConverter {

    /**
        Render and initialize a {BaseConverter} instance.
        @method init
        @param {String} givenId The unique identifier given to module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    init(givenId, parentResource) {
        <%= grunt.file.read(hbs_output) %>

        this.id = givenId;
        this.numberOfBits = 16;
        this.parentResource = parentResource;

        const maxDecimalNumber = 65535;
        const name = '<%= grunt.option("tool") %>';
        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[name].binaryDecimalConverter({
            maxDecimalNumber,
        });

        $(`#${this.id}`).html(css + html);

        this.$binaryInvalidFeedback = this.lookupByClass('binary-invalid');
        this.$decimalInvalidFeedback = this.lookupByClass('decimal-invalid');
        this.$binaryInput = this.lookupByClass('binary-input');
        this.$decimalInput = this.lookupByClass('decimal-input');

        this.previousSubmissionTime = 0;
        this.previousBinaryString = '0';
        this.previousDecimalString = '0';

        // Allow removing all numbers. Keycode 8 is backspace, keycode 46 is delete.
        const backspaceKeyCode = 8;
        const deleteKeyCode = 46;

        this.$binaryInput.on('keydown', event => {
            this.removeAllNumbers = (event.keyCode === backspaceKeyCode) || (event.keyCode === deleteKeyCode);
        });
        this.$decimalInput.on('keydown', event => {
            this.removeAllNumbers = (event.keyCode === backspaceKeyCode) || (event.keyCode === deleteKeyCode);
        });

        this.$binaryInput.on('input', () => {
            const binaryRegExp = /^[01]*$/;
            const inputString = this.$binaryInput.val();
            let inputNumber = parseInt(inputString, 10);
            let invalidPress = false;

            // Remove non binary characters
            if (!binaryRegExp.test(inputString)) {
                this.$binaryInput.val(this.previousBinaryString);
            }

            const previousBinaryNumber = parseInt(this.previousBinaryString, 10);
            const binaryAdd = [ previousBinaryNumber + 1, previousBinaryNumber - 1 ];
            const binaryBase = 2;
            const nonBinaryRegExp = /[2-9]/;

            if (isNaN(inputNumber) || (inputNumber < 0)) {
                if (this.removeAllNumbers) {
                    this.$binaryInput.val('');
                    inputNumber = 0;
                }
                else {
                    this.$binaryInput.val(previousBinaryNumber);
                    inputNumber = previousBinaryNumber;
                    invalidPress = true;
                }
            }

            // Remove non binary digits (2 through 9)
            if (nonBinaryRegExp.test(inputString)) {
                if ($.inArray(inputNumber, binaryAdd) > -1) {

                    // Trick the system to allow adding or subtracting one with the arrows.
                    let decimalValue = parseInt(this.$decimalInput.val(), 10);

                    decimalValue += inputNumber - previousBinaryNumber;
                    const binaryString = decimalValue.toString(binaryBase);

                    this.$binaryInput.val(binaryString);
                }

                // Don't allow entering non binary numbers.
                else {
                    invalidPress = true;
                    this.$binaryInput.val(inputString.split(nonBinaryRegExp).join(''));
                }
            }

            if (this.$binaryInput.val().length > this.numberOfBits) {
                this.$binaryInput.val(this.previousBinaryString);
            }

            if (invalidPress) {
                this.showInvalidFeedback('binary');
            }
            else {
                this.hideInvalidFeedback();
            }

            this.binaryToDecimal();
        });

        this.$decimalInput.on('input', () => {
            const decimalRegExp = /^\d*$/;
            const inputString = this.$decimalInput.val();
            let inputNumber = parseInt(inputString, 10);
            let invalidPress = false;
            const previousDecimalNumber = parseInt(this.previousDecimalString, 10);

            if (isNaN(inputNumber) || (inputNumber < 0)) {
                if (this.removeAllNumbers) {
                    this.$decimalInput.val('');
                    inputNumber = 0;
                }
                else {
                    this.$decimalInput.val(previousDecimalNumber);
                    inputNumber = previousDecimalNumber;
                    invalidPress = true;
                }
            }

            // Remove non number characters
            if (!decimalRegExp.test(inputString)) {
                this.$decimalInput.val(this.previousDecimalString);
                invalidPress = true;
            }

            if (inputNumber > maxDecimalNumber) {
                this.$decimalInput.val(maxDecimalNumber);
            }
            else if (inputNumber < 0) {
                this.$decimalInput.val(0);
            }

            if (invalidPress) {
                this.showInvalidFeedback('decimal');
            }
            else {
                this.hideInvalidFeedback();
            }
            this.decimalToBinary();
        });
    }

    /**
        Shows an invalid character message.
        @method showInvalidFeedback
        @param {String} base Which of the input boxes has an invalid character.
        @return {void}
    */
    showInvalidFeedback(base) {
        if (base === 'binary') {
            this.$binaryInvalidFeedback.css('visibility', 'visible');
            this.$decimalInvalidFeedback.css('visibility', 'hidden');
        }
        else if (base === 'decimal') {
            this.$binaryInvalidFeedback.css('visibility', 'hidden');
            this.$decimalInvalidFeedback.css('visibility', 'visible');
        }
    }

    /**
        Hides the invalid character message.
        @method hideInvalidFeedback
        @return {void}
    */
    hideInvalidFeedback() {
        this.$binaryInvalidFeedback.css('visibility', 'hidden');
        this.$decimalInvalidFeedback.css('visibility', 'hidden');
    }

    /**
        Converts from the binary input box to decimal in the decimal input box.
        @method binaryToDecimal
        @param {Object} event Event calling the function.
        @return {void}
    */
    binaryToDecimal() {
        const binaryValue = this.$binaryInput.val();
        const decimalValue = parseInt(binaryValue, 2);

        if (!isNaN(decimalValue)) {
            this.$decimalInput.val(decimalValue);
            this.recordValues();
            this.updatePreviousValues();
        }

        if (binaryValue === '') {
            this.$decimalInput.val('');
        }
    }

    /**
        Convert from the decimal in the decimal input box to binary in the binary input box.
        @method decimalToBinary
        @param {Object} event Event calling the function.
        @return {void}
    */
    decimalToBinary() {
        const decimalValue = this.$decimalInput.val();
        const binaryValue = parseInt(decimalValue, 10).toString(2);         // eslint-disable-line no-magic-numbers

        if (!isNaN(binaryValue)) {
            this.$binaryInput.val(binaryValue);
            this.recordValues();
            this.updatePreviousValues();
        }

        if (decimalValue === '') {
            this.$binaryInput.val('');
        }
    }

    /**
        Update the previous values.
        @method updatePreviousValues
        @return {void}
    */
    updatePreviousValues() {
        this.previousBinaryString = this.$binaryInput.val();
        this.previousDecimalString = this.$decimalInput.val();
    }

    /**
        Record the decimal and binary values if the values have changed
        @method recordValues
        @return {void}
    */
    recordValues() {
        if (this.$binaryInput.val() !== this.previousBinaryString) {
            const currentTime = (new Date()).getTime();
            const fiveSeconds = 5 * 1000;       // eslint-disable-line no-magic-numbers

            if (currentTime > (this.previousSubmissionTime + fiveSeconds)) {
                this.previousSubmissionTime = currentTime;
                this.parentResource.postEvent({
                    answer: '',
                    complete: true,
                    part: 0,
                    metadata: {
                        decimalValue: this.$decimalInput.val(),
                        binaryValue: this.$binaryInput.val(),
                    },
                });
            }
        }
    }

    /**
        Gets all HTML elements of certain class name.
        @method lookupByClass
        @param {String} className The name of the class to search for.
        @return {Array} of {Object} The list of elements of the class.
    */
    lookupByClass(className) {
        return $(`#${this.id} .${className}`);
    }
}

module.exports = {
    create: function() {
        return new BinaryDecimalConverter();
    },
};
