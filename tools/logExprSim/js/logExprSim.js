function LogExprSim() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['logExprSim']({ id: this.id });
        $('#' + this.id).html(css + html);

        this.language = 'cpp';
        if (options && options['language'] && ([ 'cpp', 'c', 'java', 'matlab' ].indexOf(options['language']) !== -1)) {
            this.language = options['language'];
        }

        if (this.language === 'matlab') {
            $('#' + this.id + ' .remove-for-matlab').hide();
        }

        var self = this;
        $('#logExprSim_runCodeButton' + this.id).click(function() {
            self.runSim();
        });

        $('#logExprSim' + this.id + ' input').keyup(function(e) {
            // User pressed enter
            if (e.which === 13) {
                self.runSim();
            }
        });

        $('#' + this.id).click(function() {
            if (!self.beenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: '',
                    metadata: {
                        event: 'logic expression simulator tool clicked'
                    }
                };

                eventManager.postEvent(event);
            }

            self.beenClicked = true;
        });
    };

    this.runSim = function() {
        if ([ 'cpp', 'c', 'java' ].indexOf(this.language) !== -1) {
            this.runCCppJavaSim();
        } else if ([ 'matlab' ].indexOf(this.language) !== -1) {
            this.runMatlabSim();
        }
    };

    /**
        Gets the values for the number input.
        @method getVariableValues
        @return {Object} Both values read from user input.
    */
    this.getVariableValues = function() {
        const varX = document.getElementById(`logExprSim_var1${this.id}`).value;
        const varY = document.getElementById(`logExprSim_var2${this.id}`).value;

        return {
            varX,
            varY,
        };
    };

    /**
        Checks that the value input is a number. Correct input is an integer or decimal number.
        @method isValidNumber
        @param {String} input The value input.
        @return {Boolean} Whether the input represents a number.
    */
    this.isValidNumber = function(input) {
        const numbersRegex = /^\s*-?\d+(\.\d+)?\s*$/;

        return (numbersRegex).test(input);
    };

    /**
        Handles the number input error message, if any.
        @method makeNumberInputErrorMessage
        @param {String} input1 The first number input.
        @param {String} input2 The second number input.
        @return {String} The error message.
    */
    this.makeNumberInputErrorMessage = function(input1, input2) {
        const isVar1Valid = this.isValidNumber(input1);
        const isVar2Valid = this.isValidNumber(input2);
        let errorMessage = '';

        if (!(isVar1Valid && isVar2Valid)) {
            errorMessage = '<i>Syntax error</i>.';
            if (this.language === 'matlab') {
                errorMessage += isVar1Valid ? ' \'y\' is not a number.' : ' \'x\' is not a number.';
            }
        }
        return errorMessage;
    };

    this.runCCppJavaSim = function() {
        const outputObj = document.getElementById(`logExprSim_output${this.id}`);
        const variableValues = this.getVariableValues();
        const intVar1Value = variableValues.varX;
        const intVar2Value = variableValues.varY;
        const errorMessage = this.makeNumberInputErrorMessage(intVar1Value, intVar2Value);

        if (errorMessage) {
            outputObj.innerHTML = errorMessage;
            return;
        }

        // Remove decimal if it exists
        let intVariableValue1 = intVar1Value.indexOf('.') === -1 ? intVar1Value : intVar1Value.split('.')[0];
        let intVariableValue2 = intVar2Value.indexOf('.') === -1 ? intVar2Value : intVar2Value.split('.')[0];

        // Remove all spaces
        intVariableValue1 = intVariableValue1.replace(/\s/g, '');
        intVariableValue2 = intVariableValue2.replace(/\s/g, '');

        const inputObj = document.getElementById(`logExprSim_expr${this.id}`);
        let tempText = inputObj.value;

        // remove all spaces
        tempText = tempText.replace(/\s/g, '');

        // make sure variables aren't back to back with each other or numbers
        if (tempText.match(/xx/g) || tempText.match(/yy/g) || tempText.match(/(\d+)x/g) || tempText.match(/x(\d+)/g) || tempText.match(/(\d+)y/g) || tempText.match(/y(\d+)/g) || tempText.match(/xy/g) || tempText.match(/yx/g) || tempText.match(/===/g)) {
            outputObj.innerHTML = '<i>Syntax error.</i>';
            return;
        }

        // replace variables
        tempText = tempText.replace(/x/g, intVariableValue1);
        tempText = tempText.replace(/y/g, intVariableValue2);

        if (tempText) {
            try {
                if (eval(tempText)) {
                    outputObj.innerHTML = 'Expression evaluates to <b>true</b>.';
                } else {
                    outputObj.innerHTML = 'Expression evaluates to <b>false</b>.';
                }
            } catch(err) {
                outputObj.innerHTML = '<i>Syntax error.</i>';
            }
        } else {
            outputObj.innerHTML = '<i>Syntax error.</i>';
        }
    };

    this.runMatlabSim = function() {
        const outputObj = document.getElementById(`logExprSim_output${this.id}`);
        const variableValues = this.getVariableValues();
        const intVar1Value = variableValues.varX;
        const intVar2Value = variableValues.varY;
        const errorMessage = this.makeNumberInputErrorMessage(intVar1Value, intVar2Value);

        if (errorMessage) {
            outputObj.innerHTML = errorMessage;
            return;
        }

        // Remove decimal if it exists
        let intVariableValue1 = intVar1Value.indexOf('.') === -1 ? intVar1Value : intVar1Value.split('.')[0];
        let intVariableValue2 = intVar2Value.indexOf('.') === -1 ? intVar2Value : intVar2Value.split('.')[0];

        // Remove all spaces
        intVariableValue1 = intVariableValue1.replace(/\s/g, '');
        intVariableValue2 = intVariableValue2.replace(/\s/g, '');

        var inputObj = document.getElementById('logExprSim_expr' + this.id);
        var tempText = inputObj.value.replace(/ /g, '');
        var invalidComparators = [ '!=', '&&', '\|\|' ];
        var validComparators = [ '~=', '&', '\\|' ];
        for (var i = 0; i < invalidComparators.length; i++) {
            if (tempText.indexOf(invalidComparators[i]) !== -1) {
                outputObj.innerHTML = '<i>Syntax error</i> in expression. \'' + invalidComparators[i] + '\' is not a valid operator.';
                return;
            }
            var re = new RegExp(validComparators[i], 'g');
            tempText = tempText.replace(re, invalidComparators[i]);
        }

        // remove all spaces
        tempText = tempText.replace(/\s/g, '');

        // make sure variables aren't back to back with each other or numbers
        if (tempText.match(/xx/g) || tempText.match(/yy/g) || tempText.match(/(\d+)x/g) || tempText.match(/x(\d+)/g) || tempText.match(/(\d+)y/g) || tempText.match(/y(\d+)/g) || tempText.match(/xy/g) || tempText.match(/yx/g) || tempText.match(/===/g)) {
            outputObj.innerHTML = '<i>Syntax error</i> in expression.';
            return;
        }

        // replace variables
        tempText = tempText.replace(/x/g, intVariableValue1);
        tempText = tempText.replace(/y/g, intVariableValue2);

        if (tempText) {
            try {
                if (eval(tempText)) {
                    outputObj.innerHTML = 'Expression evaluates to <b>true</b>.';
                } else {
                    outputObj.innerHTML = 'Expression evaluates to <b>false</b>.';
                }
            } catch(err) {
                outputObj.innerHTML = '<i>Syntax error.</i>';
            }
        } else {
            outputObj.innerHTML = '<i>Syntax error.</i>';
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var logExprSimExport = {
    create: function() {
        return new LogExprSim();
    }
};

module.exports = logExprSimExport;
