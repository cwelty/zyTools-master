/**
    Convert user entered floating-point value into the bit representation of that value.
    @module floatingPointValue
*/
function floatingPointValue() {
    var parentResource, moduleId;

    /**
        Render and initialize a {floatingPointValue} instance.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} _parentResource Dictionary of functions to access resources and submit activity.
        @param {Object} options Options for a module instance.
        @param {Boolean} options.showBitNumbers Whether to show the bit numbers for each bit value.
        @return {void}
    */
    this.init = function(_id, _parentResource, options) {
        var showBitNumbers = (options && options.showBitNumbers);
        moduleId = _id;
        parentResource = _parentResource;

        var html = this['<%= grunt.option("tool") %>'].floatingPointValue({
            id:                 moduleId,
            exponentBitSize:    8,
            exponentBitNumbers: [ 30, 29, 28, 27, 26, 25, 24, 23 ],
            mantissaBitSize:    23,
            mantissaBitNumbers: [ 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0 ],
            showBitNumbers,
            useSignificand: options && options.useSignificand,
        });
        var $module = $('#' + moduleId);
        $module.html('<style><%= grunt.file.read(css_filename) %></style>' + html);

        // Adds a click listener to the run button
        var self = this;
        $module.find('.convert-to-float').click(function() {
            self.generateFloatingPoint();
        });

        // Enter key also converts
        $module.find('.decimal-value-input').keydown(function(e) {
            self.resetBits();
            if (e.keyCode === 13) {
                self.generateFloatingPoint();
                return false;
            }
        });
    };

    // Reset all bit values
    this.resetBits = function() {
        $makeID('floating-point-value-sign').find('.floating-point-sign-bit').val(0);

        // Set exponent div contents
        $makeID('floating-point-value-exponent').children('.floating-point-bit').each(function() {
            $(this).text('0');
        });

        // Set mantissa div contents
        $makeID('floating-point-value-mantissa').children('.floating-point-bit').each(function() {
            $(this).text('0');
        });

        // Reset messages
        $makeID('floating-point-message').html('');
        $makeID('rounded-floating-point-value').html('');
        $makeID('calculated-floating-point-value').css('visibility', 'hidden');
    };

    /*
        Converts float value to IEEE representation and returns an array of two numbers that represent the IEEE representation when converted to binary
        Two numbers are returned for 64-bit support but in this case we only care about the first number in the array
    */
    this.floatToIEEE = function(floatValue) {
        var buf = new ArrayBuffer(8);
        (new Float32Array(buf))[0] = floatValue;
        return [ (new Uint32Array(buf))[0], (new Uint32Array(buf))[1] ];
    };

    /*
        Converts IEEE representation to a float value.
        Takes in two numbers that represent the IEEE representation when converted to binary and returns a float value.
    */
    this.IEEEToFloat = function(ieeeValue) {
        var buffer = new ArrayBuffer(8);
        (new Uint32Array(buffer))[0] = ieeeValue[0];
        (new Uint32Array(buffer))[1] = ieeeValue[1];
        return new Float32Array(buffer)[0];
    };

    // Takes in user input and converts the value to IEEE representation and displays the rounded value
    this.generateFloatingPoint = function() {
        this.resetBits();
        // Get user's entered value
        var userValue = $makeID('floating-point-decimal-value').val();

        var $convertedMessageContainer = $makeID('floating-point-message');

        // Value is not a number
        if (isNaN(userValue) || (userValue.length <= 0)) {
            $convertedMessageContainer.html('Please enter a valid floating point value.');
            return;
        }

        userValue = userValue.trim();
        // If user entered a decimal value starting with a decimal point we want to prepend a 0
        var userValueIsNegative = (userValue.charAt(0) === '-');
        if ((Number(userValue) < 1) && (userValue.charAt(0) === '.')) {
            var modifiedUserValue = '0' + userValue;
        }
        // If the value is negative we want to append the 0 between the '-' and decimal
        else if ((Number(userValue) < 1) && userValueIsNegative && (userValue.charAt(1) === '.')) {
            var modifiedUserValue = '-0' + userValue.substr(1);
        }
        else {
            var modifiedUserValue = userValue;
        }

        /*
            Checks to make sure value is within bounds to prevent an unwanted overflow in the representation
            Bounds are determined by smallest and largest number that can be represented by 32-bit IEEE representation.
            Smallest possible floating-point value: 00000000 0000000000000000000000001 = 1.4e-45
        */
        var smallestFloatingPointValue = 1.4e-45;
        var absoluteUserValue = Math.abs(Number(userValue));
        if ((absoluteUserValue < smallestFloatingPointValue) && (absoluteUserValue !== 0)) {
            $convertedMessageContainer.html('Cannot represent value in 32-bit floating point.');
            return;
        }

        var value = Number(userValue);
        var sign = 0;
        var exponent = '0';
        var mantissa = '0';
        var ieeeFloatValue = 0;

        if (Number(userValue) !== 0) {
            // Converts decimal to IEEE binary representation
            var ieeeValue = this.floatToIEEE(value)[0].toString(2);

            // Add back lost 0's from conversion
            while (ieeeValue.length < 32) {
                ieeeValue = '0' + ieeeValue;
            }

            /*
                The user value is larger than the largest possible floating-point value, so treat as infinity.
                Largest possible floating-point value: 11111110 1111111111111111111111111 = 3.4e38
            */
            var largestFloatingPointValue = 3.4e38;
            if (absoluteUserValue > largestFloatingPointValue) {
                sign = userValueIsNegative ? '1' : '0';
                exponent = '11111111';
                mantissa = '00000000000000000000000';
            }
            else {
                sign = ieeeValue.charAt(0);
                exponent = ieeeValue.substr(1, 8);
                mantissa = ieeeValue.substr(9, 23);
            }

            // Set sign div contents
            $makeID('floating-point-value-sign').find('.floating-point-sign-bit').text(sign);

            // Set exponent div contents
            $makeID('floating-point-value-exponent').children('.floating-point-bit').each(function(index) {
                $(this).text(exponent.charAt(index));
            });

            // Set mantissa div contents
            $makeID('floating-point-value-mantissa').children('.floating-point-bit').each(function(index) {
                $(this).text(mantissa.charAt(index));
            });

            // Convert IEEE back to float
            ieeeFloatValue = this.IEEEToFloat(this.floatToIEEE(value));
        }

        var normalizedExponent = parseInt(exponent, 2);

        $convertedMessageContainer.html(modifiedUserValue + ' in a 32-bit floating-point representation (IEEE):');
        $makeID('raw-sign').html(sign === '1' ? '-' : '+');
        $makeID('raw-exponent').html(normalizedExponent);
        $makeID('calculated-exponent').html(normalizedExponent - 127);
        $makeID('raw-mantissa').html(Math.abs(ieeeFloatValue / (Math.pow(2, normalizedExponent - 127))));
        $makeID('calculated-floating-point-value').css('visibility', 'visible');
        $makeID('rounded-floating-point-value').html('Representation\'s value: ' + ieeeFloatValue);

        var event = {
            part:     0,
            complete: true,
            answer:   '',
            metadata: {
                event:        'Decimal converted to float',
                decimalValue: userValue
            }
        };
        parentResource.postEvent(event);
    };

    /**
        Convert a given base id into a jQuery reference to a DOM element.
        @method $makeID
        @param {String} idBase The base id.
        @return {Object} A jQuery reference to the DOM element for the base id.
    */
    function $makeID(idBase) {
        return $('#' + idBase + moduleId);
    }

    <%= grunt.file.read(hbs_output) %>
}

var floatingPointValueExport = {
    create: function() {
        return new floatingPointValue();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = floatingPointValueExport;
