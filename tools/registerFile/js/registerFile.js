function registerFile() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.registerFileImage = this.parentResource.getResourceURL('registerFileBackground.png', this.name);

        this.utilities = require('utilities');

        this.registerFileInputClassNames = [ 'write-data', 'write-address', 'write-enable', 'read-address-a', 'read-enable-a', 'read-address-b', 'read-enable-b' ];
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['registerFile']({
            id:                          this.id,
            registerFileInputClassNames: this.registerFileInputClassNames
        });

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html:             html,
            css:              css,
            numToWin:         8,
            useMultipleParts: true,
            start: function() {
                self.randomizeRegisterValuesThenCacheAsCorrect();
                self.generateQuestion(0);
                self.$registers.eq(0).focus();
            },
            reset: function() {
                self.initializeAllToZero();
                self.disableInputs();
                self.hideRefreshButtons();
            },
            next: function(currentQuestion) {
                self.restoreCachedCorrectValues();
                self.hideRefreshButtons();
                self.generateQuestion(currentQuestion);
                self.$registers.eq(0).focus();
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = self.userInputsAreCorrect();

                var userAnswer = {
                    'register0':  self.$registers.eq(0).val(),
                    'register1':  self.$registers.eq(1).val(),
                    'register2':  self.$registers.eq(2).val(),
                    'register3':  self.$registers.eq(3).val(),
                    'readData_A': self.$readData_A.val(),
                    'readData_B': self.$readData_B.val()
                };

                var correctAnswer = {
                    'register0':  self.expectedValues.registers[0],
                    'register1':  self.expectedValues.registers[1],
                    'register2':  self.expectedValues.registers[2],
                    'register3':  self.expectedValues.registers[3],
                    'readData_A': self.expectedValues.A,
                    'readData_B': self.expectedValues.B
                };

                self.progressionTool.userAnswer = JSON.stringify(userAnswer);
                self.progressionTool.expectedAnswer = JSON.stringify(correctAnswer);

                if (isAnswerCorrect) {
                    self.progressionTool.explanationMessage = 'Correct. ';
                    self.progressionTool.explanationMessage += self.explanationForCurrentQuestion(currentQuestion);
                }
                else {
                    self.highlightIncorrectUserInput();
                    self.progressionTool.explanationMessage = 'Highlighted values are incorrect. ';
                    self.progressionTool.explanationMessage += self.explanationForCurrentQuestion(currentQuestion);
                }

                self.disableInputs();
                self.hideRefreshButtons();

                return isAnswerCorrect;
            }
        });

        // Regularly accessed DOM objects.
        var $thisTool = $('#' + this.id);
        this.$instructions = $thisTool.find('.instructions');
        this.$backgroundImage = $thisTool.find('.register-file-background');

        // Register file inputs.
        this.$writeEnable = $thisTool.find('.write-enable');
        this.$writeAddress = $thisTool.find('.write-address');
        this.$writeData = $thisTool.find('.write-data');
        this.$readEnable_A = $thisTool.find('.read-enable-a');
        this.$readEnable_B = $thisTool.find('.read-enable-b');
        this.$readAddress_A = $thisTool.find('.read-address-a');
        this.$readAddress_B = $thisTool.find('.read-address-b');

        // User inputs.
        this.$registers = $thisTool.find('.register');
        this.$readData_A = $thisTool.find('.read-data-a');
        this.$readData_B = $thisTool.find('.read-data-b');

        // Reset buttons.
        this.$resetReadButton_A = $thisTool.find('.reset-read-button-a');
        this.$resetReadButton_B = $thisTool.find('.reset-read-button-b');
        this.$resetRegisterButtons = $thisTool.find('.reset-register-button');

        // Common groupings of register file inputs.
        this.$write = this.$writeData.add(this.$writeAddress).add(this.$writeEnable);
        this.$readA = this.$readEnable_A.add(this.$readAddress_A);
        this.$readB = this.$readEnable_B.add(this.$readAddress_B);
        this.$read = this.$readA.add(this.$readB);
        this.$writeAndRead = this.$write.add(this.$read);
        this.$userInputs = this.$registers.add(this.$readData_A).add(this.$readData_B);
        this.$resetButtons = this.$resetReadButton_A.add(this.$resetReadButton_B).add(this.$resetRegisterButtons);

        // Initialize tool.
        this.$backgroundImage.css('background-image', 'url(' + this.registerFileImage + ')');
        this.initializeAllToZero();
        this.randomizeRegisterValuesThenCacheAsCorrect();
        this.generateQuestion(0);
        this.disableInputs();
        this.hideRefreshButtons();

        // If enter key is pressed, then Check user answer.
        function checkForEnter(e) {
            var code = e.keyCode || e.which;
            if (code === 13) {
                e.preventDefault();
                self.progressionTool.check();
            }
        }
        this.$registers.keydown(checkForEnter);
        this.$readData_A.keydown(checkForEnter);
        this.$readData_B.keydown(checkForEnter);

        /*
            Reset register button functionality:
            If a register value is changed and does not match the original value, then
            the corresponding reset button will appear. If the button is clicked or if
            the register value is changed back to its original value manually, then the
            button will disappear.
        */
        this.$registers.each(function(index) {
            function createInputForRegister(i) {
                self.$registers.eq(i).on('input', function() {
                    if (this.value !== self.registerValuesBeforeReadWrite[i]) {
                        self.fadeInAndEnable(self.$resetRegisterButtons.eq(i));
                    }
                    else {
                        self.fadeOutAndDisable(self.$resetRegisterButtons.eq(i));
                    }
                });
            }

            function createClickForResetRegisterButton(i) {
                self.$resetRegisterButtons.eq(i).click(function() {
                    if (!self.inputsDisabled) {
                        self.$registers.eq(i).val(self.registerValuesBeforeReadWrite[i]);
                        self.fadeOutAndDisable(self.$resetRegisterButtons.eq(i));
                    }
                });
            }

            createInputForRegister(index);
            createClickForResetRegisterButton(index);
        });

        this.$readData_A.on('input', function() {
            if ($(this).val() !== 'z') {
                self.fadeInAndEnable(self.$resetReadButton_A);
            }
            else {
                self.fadeOutAndDisable(self.$resetReadButton_A);
            }
        });

        this.$readData_B.on('input', function() {
            if ($(this).val() !== 'z') {
                self.fadeInAndEnable(self.$resetReadButton_B);
            }
            else {
                self.fadeOutAndDisable(self.$resetReadButton_B);
            }
        });

        this.$resetReadButton_A.click(function() {
            if (!self.inputsDisabled) {
                self.$readData_A.val('z');
                self.fadeOutAndDisable(self.$resetReadButton_A);
            }
        });

        this.$resetReadButton_B.click(function() {
            if (!self.inputsDisabled) {
                self.$readData_B.val('z');
                self.fadeOutAndDisable(self.$resetReadButton_B);
            }
        });
    };

    // Speed of fading used in this tool.
    this.fadeSpeed = 'slow';

    // Written to in |enableInputs| and |disableInputs|. Read throughout code.
    this.inputsDisabled = true;

    // Store register values before the user edits
    this.registerValuesBeforeReadWrite = [ 0, 0, 0, 0 ];

    // Written to during |generateQuestion|. Read during |check|.
    this.expectedValues = {
        registers: [ 0, 0, 0, 0 ],
        A:         0,
        B:         0
    };

    this.initializeAllToZero = function() {
        this.$writeAndRead.text('0');
        this.$registers.val('0');
        this.$readData_A.val('z');
        this.$readData_B.val('z');
    };

    this.enableInputs = function() {
        this.disableInputs(false);
    };

    /*
        Disable inputs if |disableInputs| is true. Otherwise, enable inputs.
        |disableInputs| is required and a boolean.
    */
    this.disableInputs = function(disableInputs) {
        disableInputs = disableInputs === undefined;
        this.$userInputs.attr('disabled', disableInputs);
        this.inputsDisabled = disableInputs;
    };

    /*
        Fade out and disable |$object|.
        |$object| is required and a jQuery object.
    */
    this.fadeOutAndDisable = function($object) {
        $object.addClass('button-disabled');
        $object.fadeOut();
    };

    /*
        Fade in and enable |$object|.
        |$object| is required and a jQuery object.
    */
    this.fadeInAndEnable = function($object) {
        $object.removeClass('button-disabled');
        $object.fadeIn();
    };

    // Disable then fade out the reset buttons.
    this.hideRefreshButtons = function() {
        this.fadeOutAndDisable(this.$resetButtons);
    };

    // Assign each register a random number between 1 and 99. Then, cache as correct.
    this.randomizeRegisterValuesThenCacheAsCorrect = function() {
        var self = this;
        this.$registers.each(function() {
            $(this).val(self.utilities.pickNumberInRange(1, 99));
        });
        this.cacheCurrentValuesAsExpected();
    };

    // Highlight the user input of the incorrect answers.
    this.highlightIncorrectUserInput = function() {
        var self = this;
        this.$registers.each(function(i) {
            if (self.expectedValues.registers[i] !== $(this).val()) {
                $(this).addClass('incorrect-input');
            }
        });
        if (this.expectedValues.A !== this.$readData_A.val()) {
            this.$readData_A.addClass('incorrect-input');
        }
        if (this.expectedValues.B !== this.$readData_B.val()) {
            this.$readData_B.addClass('incorrect-input');
        }
    };

    // Return whether the user inputs are correct.
    this.userInputsAreCorrect = function() {
        var registersAreCorrect = !this.registerValuesAreIncorrect();
        var readA_IsCorrect = this.expectedValues.A === this.$readData_A.val().toLowerCase();
        var readB_IsCorrect = this.expectedValues.B === this.$readData_B.val().toLowerCase();

        return (registersAreCorrect && readA_IsCorrect && readB_IsCorrect);
    };

    // Return whether the register user input are incorrect.
    this.registerValuesAreIncorrect = function() {
        var self = this;
        var incorrectValue = false;
        this.$registers.each(function(i) {
            if (self.expectedValues.registers[i] !== $(this).val()) {
                incorrectValue = true;
            }
        });
        return incorrectValue;
    };

    /*
        Returns explanation string based on |currentQuestion|.
        |currentQuestion| is required and a number.
    */
    this.explanationForCurrentQuestion = function(currentQuestion) {
        var explanation = '';
        switch (currentQuestion) {
            case 0:
                explanation = 'Write is enabled, so write to the specified address.';
                break;
            case 1:
                explanation = 'Write is not enabled.';
                break;
            case 2:
                var readLetter = 'B';
                if (this.$readEnable_A.text() === '1') {
                    readLetter = 'A';
                }
                explanation = 'Read port ' + readLetter + ' is enabled, so read from the specified address.';
                break;
            case 3:
                explanation = 'Both read ports are enabled.';
                break;
            case 4:
                var readLetter = 'B';
                if (this.$readEnable_A.text() === '1') {
                    readLetter = 'A';
                }
                explanation = 'Only read port ' + readLetter + ' is enabled.';
                break;
            case 5:
                var readLetter = 'B';
                if (this.$readEnable_A.text() === '1') {
                    readLetter = 'A';
                }
                explanation = 'Read on port ' + readLetter + ' and write is enabled.';
                break;
            case 6:
                explanation = 'Read data after writing a new value.';
                break;
            case 7:
                explanation = 'Write and both read ports are enabled.';
                break;
        }

        return explanation;
    };

    // Store the current register and read data values as the expected values.
    this.cacheCurrentValuesAsExpected = function() {
        var self = this;
        this.$registers.each(function(i) {
            self.expectedValues.registers[i] = $(this).val();
        });

        this.expectedValues.A = this.$readData_A.val();
        this.expectedValues.B = this.$readData_B.val();
    };

    /*
        Fade out, |reset|, then fade in |$object|.
        |$object| is required and a jQuery object.
        |reset| is required and a function.
    */
    this.fadeOutResetThenFadeIn = function($object, reset) {
        $object.fadeOut(this.fadeSpeed, function() {
            reset();
            $object.removeClass('incorrect-input').fadeIn(this.fadeSpeed);
        });
    };

    // Reset the inputs and cache the expected register values.
    this.restoreCachedCorrectValues = function() {
        this.$registers.each((index, registerElement) => {
            const $register = $(registerElement);

            $register.val(this.expectedValues.registers[index]);
            this.registerValuesBeforeReadWrite[index] = $register.val();
            $register.removeClass('incorrect-input').fadeIn(this.fadeSpeed);
        });

        this.fadeOutResetThenFadeIn(this.$readData_A, () => {
            this.$readData_A.val('z');
        });

        this.fadeOutResetThenFadeIn(this.$readData_B, () => {
            this.$readData_B.val('z');
        });
    };

    /**
        Sets the write/read enabled bit to what's passed. If null is passed, it does nothing for that bit.
        @method setReadWriteEnabledDisabled
        @param {Number} [writeEnable = null] The value of the write enable bit. If null, it won't change the bit.
        @param {Number} [readEnableA = null] The value of the read a bit. If null, it won't change the bit.
        @param {Number} [readEnableB = null] The value of the read b bit. If null, it won't change the bit.
        @return {void}
    */
    this.setReadWriteEnabledDisabled = function(writeEnable = null, readEnableA = null, readEnableB = null) {
        if (writeEnable !== null) {
            this.$writeEnable.text(writeEnable);
        }

        if (readEnableA !== null) {
            this.$readEnable_A.text(readEnableA);
        }

        if (readEnableB !== null) {
            this.$readEnable_B.text(readEnableB);
        }
    };

    /*
        Generate a question for the given |currentQuestion|.
        |currentQuestion| is required and a number.
    */
    this.generateQuestion = function(currentQuestion) {
        this.$registers.each((index, element) => {
            this.registerValuesBeforeReadWrite[index] = $(element).val();
        });

        const maxRegisterIndex = 3;
        let randomWriteAddress = this.utilities.pickNumberInRange(0, maxRegisterIndex);
        const randomReadAddressA = this.utilities.pickNumberInRange(0, maxRegisterIndex);
        const randomReadAddressB = this.utilities.pickNumberInRange(0, maxRegisterIndex);

        const minWriteDataValue = 1;
        const maxWriteDataValue = 99;
        let randomWriteData = this.utilities.pickNumberInRange(minWriteDataValue, maxWriteDataValue, this.registerValuesBeforeReadWrite);
        let usedReadAddress = null;

        randomWriteData = String(randomWriteData);
        this.expectedValues.A = 'z';
        this.expectedValues.B = 'z';

        switch (currentQuestion) {

            // Write to register.
            case 0: {
                this.setReadWriteEnabledDisabled(null, 0, 0);
                this.expectedValues.registers[randomWriteAddress] = randomWriteData;

                this.$write.fadeOut(this.fadeSpeed, () => {
                    this.$writeData.text(randomWriteData);
                    this.$writeAddress.text(randomWriteAddress);
                    this.$writeEnable.text('1');
                    this.$write.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // All enables are off.
            case 1: {
                this.setReadWriteEnabledDisabled(null, 0, 0);
                this.$write.fadeOut(this.fadeSpeed, () => {
                    this.$writeData.text(randomWriteData);
                    this.$writeAddress.text(randomWriteAddress);
                    this.$writeEnable.text('0');
                    this.$write.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // Read a register.
            case 2: { // eslint-disable-line no-magic-numbers
                this.setReadWriteEnabledDisabled(0, null, 0);
                this.expectedValues.A = this.expectedValues.registers[randomReadAddressA];

                this.$readA.fadeOut(this.fadeSpeed, () => {
                    this.$readEnable_A.text('1');
                    this.$readAddress_A.text(randomReadAddressA);
                    this.$readA.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // Read two registers or the same register twice.
            case 3: { // eslint-disable-line no-magic-numbers
                this.setReadWriteEnabledDisabled(0);
                this.expectedValues.A = this.expectedValues.registers[randomReadAddressA];
                this.expectedValues.B = this.expectedValues.registers[randomReadAddressB];

                this.$read.fadeOut(this.fadeSpeed, () => {
                    this.$readEnable_A.text('1');
                    this.$readEnable_B.text('1');
                    this.$readAddress_A.text(randomReadAddressA);
                    this.$readAddress_B.text(randomReadAddressB);
                    this.$read.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // Read only one register.
            case 4: { // eslint-disable-line no-magic-numbers
                const enableReadPortA = this.utilities.flipCoin();

                this.setReadWriteEnabledDisabled(0);

                if (enableReadPortA) {
                    this.expectedValues.A = this.expectedValues.registers[randomReadAddressA];
                    this.expectedValues.B = 'z';
                }
                else {
                    this.expectedValues.A = 'z';
                    this.expectedValues.B = this.expectedValues.registers[randomReadAddressB];
                }

                this.$read.fadeOut(this.fadeSpeed, () => {
                    if (enableReadPortA) {
                        this.$readEnable_A.text('1');
                        this.$readEnable_B.text('0');
                        this.$readAddress_A.text(randomReadAddressA);
                    }
                    else {
                        this.$readEnable_A.text('0');
                        this.$readEnable_B.text('1');
                        this.$readAddress_B.text(randomReadAddressB);
                    }

                    this.$read.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // Read & write at the same time but not to the same register (only one read).
            case 5: { // eslint-disable-line no-magic-numbers
                const enableReadPortA = this.utilities.flipCoin();

                if (enableReadPortA) {
                    this.expectedValues.A = this.expectedValues.registers[randomReadAddressA];
                    this.expectedValues.B = 'z';
                    usedReadAddress = randomReadAddressA;
                }
                else {
                    this.expectedValues.A = 'z';
                    this.expectedValues.B = this.expectedValues.registers[randomReadAddressB];
                    usedReadAddress = randomReadAddressB;
                }

                // Make sure write address is not the same as read address.
                if (randomWriteAddress === usedReadAddress) {
                    randomWriteAddress--;

                    if (randomWriteAddress < 0) {
                        randomWriteAddress = 3;
                    }
                }
                this.expectedValues.registers[randomWriteAddress] = randomWriteData;

                this.$writeAndRead.fadeOut(this.fadeSpeed, () => {

                    // Read.
                    if (enableReadPortA) {
                        this.$readEnable_A.text('1');
                        this.$readEnable_B.text('0');
                        this.$readAddress_A.text(randomReadAddressA);
                    }
                    else {
                        this.$readEnable_A.text('0');
                        this.$readEnable_B.text('1');
                        this.$readAddress_B.text(randomReadAddressB);
                    }

                    // Write.
                    this.$writeData.text(randomWriteData);
                    this.$writeAddress.text(randomWriteAddress);
                    this.$writeEnable.text('1');

                    this.$writeAndRead.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // Read & write to the same register (only one read).
            case 6: { // eslint-disable-line no-magic-numbers
                usedReadAddress = 0;
                const enableReadPortA = this.utilities.flipCoin();

                if (enableReadPortA) {
                    this.expectedValues.A = randomWriteData;
                    this.expectedValues.B = 'z';
                    usedReadAddress = randomReadAddressA;
                }
                else {
                    this.expectedValues.A = 'z';
                    this.expectedValues.B = randomWriteData;
                    usedReadAddress = randomReadAddressB;
                }
                this.expectedValues.registers[usedReadAddress] = randomWriteData;

                this.$writeAndRead.fadeOut(this.fadeSpeed, () => {

                    // Read.
                    if (enableReadPortA) {
                        this.$readEnable_A.text('1');
                        this.$readEnable_B.text('0');
                        this.$readAddress_A.text(randomReadAddressA);
                    }
                    else {
                        this.$readEnable_A.text('0');
                        this.$readEnable_B.text('1');
                        this.$readAddress_B.text(randomReadAddressB);
                    }

                    // Write.
                    this.$writeData.text(randomWriteData);
                    this.$writeAddress.text(usedReadAddress);
                    this.$writeEnable.text('1');

                    this.$writeAndRead.fadeIn(this.fadeSpeed);
                });
                break;
            }

            // Read & write with two random read addresses.
            case 7: { // eslint-disable-line no-magic-numbers
                /*
                    If the read value is to the same address as the write data, then read the write data.
                    Otherwise, read the register's value.
                */
                this.expectedValues.A = (randomWriteAddress === randomReadAddressA) ? randomWriteData : this.expectedValues.registers[randomReadAddressA];
                this.expectedValues.B = (randomWriteAddress === randomReadAddressB) ? randomWriteData : this.expectedValues.registers[randomReadAddressB];
                this.expectedValues.registers[randomWriteAddress] = randomWriteData;

                this.$writeAndRead.fadeOut(this.fadeSpeed, () => {

                    // Read.
                    this.$readEnable_A.text('1');
                    this.$readEnable_B.text('1');
                    this.$readAddress_A.text(randomReadAddressA);
                    this.$readAddress_B.text(randomReadAddressB);

                    // Write.
                    this.$writeData.text(randomWriteData);
                    this.$writeAddress.text(randomWriteAddress);
                    this.$writeEnable.text('1');

                    this.$writeAndRead.fadeIn(this.fadeSpeed);
                });
                break;
            }
            default:
                break;
        }

        this.enableInputs();
    };

    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var registerFileExport = {
    create: function() {
        return new registerFile();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = registerFileExport;
