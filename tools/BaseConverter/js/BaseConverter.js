'use strict';

/**
    Enables a user to convert from various bases to decimal.
    Ex: From base 2 to decimal.
    @module BaseConverter
    @return {BaseConverter}
*/
function BaseConverter() {

    /**
        The name of the module.
        @property name
        @type String
        @default '<%= grunt.option("tool") %>'
    */
    const name = '<%= grunt.option("tool") %>';

    /**
        Identifier given to this module by the parent module.
        @property moduleId
        @type Number
        @default null
    */
    let moduleId = null;

    /**
        <td> tag containing the decimal value of the number entered by the user.
        @property $decimalResult
        @type Object
        @default null
    */
    let $decimalResult = null;

    /**
        Selected base to convert to decimal.
        @property currentBase
        @type Number
        @default 2
    */
    let currentBase = 2;

    /**
        Base selector box.
        @property $baseSelect
        @type Object
        @default null
    */
    let $baseSelect = null;

    /**
        List of buttons used for binary input.
        @property $buttons
        @type Array of {Object}
        @default null
    */
    let $buttons = null;

    /**
        List of input boxes used for any base higher than 2.
        @property $inputs
        @type Array of {Object}
        @default null
    */
    let $inputs = null;

    /**
        Array containing the decimal value of each digit.
        @property digitDecimalValues
        @type Array of {Number}
        @default null
    */
    let digitDecimalValues = null;

    /**
        List of <td> containing the operation to get the decimal value of each digit.
        Ex for binary number 10011001: 1*128 0*64 0*32 1*16 1*8 0*4 0*2 1*1
        @property $sums
        @type Array of {Object}
        @default null
    */
    let $sums = null;

    /**
        List of <span> containing the selected base.
        @property $baseValues
        @type Array of {Object}
        @default null
    */
    let $baseValues = null;

    /**
        The number of digits the user can interact with.
        @property numberOfDigits
        @type Number
        @default 8
    */
    const numberOfDigits = 8;

    /**
        Dictionary of functions to access resources and submit activity.
        @property parentResource
        @type Object
        @default null
    */
    let parentResource = null;

    let previousSubmissionTime = 0;

    this.defaultBase = 2;

    /**
        Calculates and updates the list of product operations that get the decimal value.
        Ex for binary number 10011001: 1*128 0*64 0*32 1*16 1*8 0*4 0*2 1*1
        @method calculateProducts
        @return {void}
    */
    function calculateProducts() {
        const productValueOfDigits = require('utilities').createArrayOfSizeN(numberOfDigits).map((value, index) => {
            const buttonValue = $buttons[index].innerHTML;
            const inputValue = parseInt($inputs[index].value, currentBase).toString(currentBase);
            const desiredValue = (currentBase <= 2) ? buttonValue : inputValue;     // eslint-disable-line no-magic-numbers
            const postfix = `</b><span class="product-dot">·</span>${digitDecimalValues[index]}`;

            return `<b>${desiredValue}${postfix}`;
        });

        $sums.each((index, sum) => {
            $(sum).html(productValueOfDigits[index]);
        });
    }

    /**
        Calculates and shows the decimal value of the input.
        @method calculateResult
        @return {void}
    */
    function calculateResult() {
        calculateProducts();

        let result = 0;
        const grayColor = require('utilities').zyanteLightGray;

        // Get values from buttons if binary.
        const inputSource = currentBase <= 2 ? $buttons : $inputs;      // eslint-disable-line no-magic-numbers
        const inputValues = inputSource.map((index, source) => parseInt($(source).val(), currentBase)).toArray();
        const inputDecimalValues = inputSource.map((index, source) => (parseInt($(source).val(), currentBase) * digitDecimalValues[index]));

        inputDecimalValues.each((index, value) => {
            result += value;
            $sums.eq(index).css('color', (value === 0) ? grayColor : 'initial');
        });

        if (result !== 0) {
            const currentTime = (new Date()).getTime();
            const fiveSeconds = 5 * 1000;       // eslint-disable-line no-magic-numbers

            if (currentTime > (previousSubmissionTime + fiveSeconds)) {
                previousSubmissionTime = currentTime;
                parentResource.postEvent({
                    answer: '',
                    complete: true,
                    part: 0,
                    metadata: {
                        digitValues: inputValues,
                        base: currentBase,
                    },
                });
            }
        }

        $decimalResult.innerHTML = result;
    }

    /**
        Render and initialize a {BaseConverter} instance.
        @method init
        @param {String} givenId The unique identifier given to module.
        @param {Object} _parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options The options passed to this instance of the tool.
        @return {void}
    */
    this.init = function(givenId, _parentResource, options) {
        moduleId = givenId;
        parentResource = _parentResource;

        const exponentOfDigits = require('utilities').createArrayOfSizeN(numberOfDigits).map((value, index) => index).reverse();
        const productValueOfDigits = require('utilities').createArrayOfSizeN(numberOfDigits).map((value, index) =>
            `${Math.pow(currentBase, index)}*0`
        ).reverse();

        if (options && options.base) {
            currentBase = parseInt(options.base, 10);
        }

        // Write {BaseConverter}'s HTML and CSS to DOM.
        const html = this[name].baseConverter({
            supportedBases: [ 2, 3, 4, 5, 6, 7, 8, 9, 16 ],     // eslint-disable-line no-magic-numbers
            numberOfDigits,
            exponentOfDigits,
            productValueOfDigits,
            oneBase: options && options.base,
            defaultBase: currentBase,
        });
        const css = '<style><%= grunt.file.read(css_filename) %></style>';

        $(`#${moduleId}`).html(css + html);

        this._printDigitDecimalValues();

        $baseValues = this.lookupByClass('base-value');
        $baseSelect = this.lookupByClass('base-select');
        $buttons = this.lookupByClass('bin-button');
        $decimalResult = this.lookupByClass('decimal-value-result')[0];
        $inputs = this.lookupByClass('input-number');
        $sums = this.lookupByClass('sum');

        $inputs.spinner();
        this.$spinner = this.lookupByClass('ui-spinner');
        this.$spinner.hide();

        $baseValues.text(currentBase);

        const self = this;

        $baseSelect.change(event => {
            this._baseChange(event.target);
        });

        $buttons.click(this._bClick)
                .html(0)
                .val(0);

        $decimalResult.innerHTML = 0;

        const validDecimalInputRegExp = /^[0-9]*$/;
        const hexadecimalDigitRegExp = /^[a-zA-Z]*$/;
        const validHexadecimalInputRegExp = /^[0-9a-fA-F]*$/;
        const decimalBase = 10;

        $inputs.val(0)
                .click(event => {
                    event.target.select();
                })
                .on('spin', (event, ui) => {
                    const $target = $(event.target);

                    if (hexadecimalDigitRegExp.test($target.val())) {

                        // For some reason, when digits are hexadecimal, and the number goes up, then ui.value = 1
                        if (ui.value === 1) {
                            ui.value = parseInt($target.val(), currentBase) + 1;
                        }

                        // Same thing, when numbers go down, then ui.value = 0
                        else if (ui.value === -1) {
                            ui.value = parseInt($target.val(), currentBase) - 1;
                        }
                    }
                    $target.val(ui.value.toString(currentBase));
                    if (ui.value >= currentBase) {
                        $target.val((currentBase - 1).toString(currentBase));
                    }
                    if (ui.value < 0) {
                        $target.val('0');
                    }

                    $target.trigger('spinstop');
                    return false;
                })
                .on('input spinstop', event => {
                    const $target = $(event.target);
                    let numberValue = -1;

                    if ($target.val().length > 1) {
                        $target.val($target.val().slice(-1));
                    }

                    if (validDecimalInputRegExp.test($target.val())) {
                        numberValue = parseInt($target.val(), decimalBase);
                    }
                    else if (validHexadecimalInputRegExp.test($target.val())) {
                        numberValue = parseInt($target.val(), currentBase);
                    }
                    else {
                        numberValue = currentBase - 1;
                    }

                    if (numberValue >= 0) {
                        if (isNaN(numberValue) || numberValue >= currentBase) {
                            numberValue = currentBase - 1;
                        }

                        $target.data('integerValue', numberValue);
                        $target.val(numberValue.toString(currentBase));

                        if (numberValue <= 0) {
                            $target.val('0');
                        }

                        calculateResult();
                    }
                    else {
                        $target.val(parseInt($target.data('integerValue'), currentBase));
                    }
                });

        if (options && options.base) {
            this.defaultBase = options.base;
            currentBase = this.defaultBase;
            $baseSelect.hide();
        }

        $baseSelect.val(currentBase);
        this._baseChange($baseSelect[0]);

        $(`#${moduleId} .reset`).click(() => {

            // Reset the tool.
            $buttons.html(0);
            $buttons.val(0);
            $inputs.val(0);
            $baseSelect.val(self.defaultBase);
            this._baseChange($baseSelect[0]);
            calculateResult();
        });

        calculateResult();
    };

    /**
        Changes between bases.
        @method _baseChange
        @private
        @param {Object} selector <select> element calling the method.
        @return {void}
    */
    this._baseChange = function(selector) {
        const previousBase = currentBase;

        currentBase = parseInt(selector.options[selector.selectedIndex].value, 10);

        if (currentBase < previousBase) {
            $inputs.each(index => {
                const $target = $($inputs[index]);

                if (parseInt($target.data('integerValue'), previousBase) >= currentBase) {
                    $target.val(0);
                }
            });
        }

        // Show buttons in binary, input boxes otherwise.
        if (currentBase > 2) {      // eslint-disable-line no-magic-numbers
            $buttons.hide()
                    .val(0)
                    .html(0);
            this.$spinner.show();
            $inputs.spinner();
        }
        else {
            this.$spinner.hide();
            $inputs.val(0);
            $buttons.show();
        }
        this._printDigitDecimalValues();

        $baseValues.text(currentBase);
        calculateResult();
    };

    /**
        Onclick method for the binary buttons. Changes the button value between 1 and 0.
        @method _bClick
        @private
        @return {void}
    */
    this._bClick = function() {
        const $button = $(this);
        const digitInputValue = parseInt($button.val(), 10);
        const value = (digitInputValue === 0) ? 1 : 0;

        $button.html(value);
        $button.val(value);
        calculateResult();
    };

    /**
        Gets all HTML elements of certain class name.
        @method lookupByClass
        @param {String} className The name of the class to search for.
        @return {Array} of {Object} The list of elements of the class.
    */
    this.lookupByClass = function(className) {
        return $(`#${moduleId} .${className}`);
    };

    /**
        Print a digit value for each digit.
        @method _printDigitDecimalValues
        @private
        @return {void}
    */
    this._printDigitDecimalValues = function() {
        digitDecimalValues = require('utilities').createArrayOfSizeN(numberOfDigits).map((value, index) =>
            Math.pow(currentBase, index)
        ).reverse();

        const digitDecimalValuesHTML = this[name].digitDecimalValues({ digitDecimalValues });

        $(`#${moduleId} .digit-decimal-values-container`).html(digitDecimalValuesHTML);
    };

    <%= grunt.file.read(hbs_output) %>
}

const BaseConverterExport = {
    create: function() {
        return new BaseConverter();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};

module.exports = BaseConverterExport;
