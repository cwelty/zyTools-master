function traceVarVal() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.isPython = false;
        this.language = 'cpp';

        // |lang| is deprecated but still supported.
        if (options && options.lang) {
            this.language = options.lang;
        }
        if (options && options.language) {
            this.language = options.language;
        }
        this.isPython = this.language === 'python';

        /*
            Record whether the user did not select an option.
            Written to in check function, and read in next function.
        */
        this.didUserNotSelectAnOption = false;

        /*
            Record whether the user selected the wrong options.
            Written to in check function, and read in generateQuestion function.
        */
        this.didUserSelectWrongOptions = false;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['traceVarVal']({
            id:     this.id,
            python: this.isPython
        });

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 4,
            start: function() {
                self.generateQuestion(0);
            },
            reset: function() {
                self.$solution.css('visibility', 'hidden');
                self.disableOptions();
                self.resetOptions();
                self.setCode(0);
            },
            next: function(currentQuestion) {
                if (self.didUserNotSelectAnOption) {
                    self.didUserNotSelectAnOption = false;
                } else {
                    self.generateQuestion(currentQuestion);
                }
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                self.progressionTool.userAnswer = '(x,y,z): ' + JSON.stringify(self.returnUserSelectedOptions());
                self.progressionTool.expectedAnswer = '(x,y,z): ' + JSON.stringify(self.correctOptions[currentQuestion]);

                if (self.allVariablesHaveOptionSelected()) {
                    isAnswerCorrect = self.areOptionsCorrect(currentQuestion);
                    self.disableOptions();

                    if (isAnswerCorrect) {
                        self.progressionTool.explanationMessage = 'Correct.';
                    } else {
                        self.didUserSelectWrongOptions = true;
                        self.setCorrectOptions(currentQuestion);
                        self.$solution.css('visibility', 'visible');
                        self.progressionTool.explanationMessage = 'See the solution. Each line of code is an assignment.';
                    }
                } else {
                    self.progressionTool.explanationMessage = 'Select a value for each variable.';
                    self.didUserNotSelectAnOption = true;
                }

                return isAnswerCorrect;
            }
        });

        // Cache commonly accessed DOM elements
        this.$solution = $('#' + this.id + ' .solution');
        this.$traceValueCode = $('#' + this.id + ' .trace-value-code');
        this.$xValues = $('#xValue1' + this.id + ', #xValue2' + this.id + ', #xValue3' + this.id);
        this.$yValues = $('#yValue1' + this.id + ', #yValue2' + this.id + ', #yValue3' + this.id);
        this.$zValues = $('#zValue1' + this.id + ', #zValue2' + this.id + ', #zValue3' + this.id);

        // Initialize output
        this.setCode(0);
    };

    // initial, assignment 1, and assignment 2 x-values
    this.xValues = [];

    // initial, assignment 1, and assignment 2 y-values
    this.yValues = [];

    // initial, assignment 1, and assignment 2 z-values
    this.zValues = [];

    /*
        2D array storing the correct option number (1, 2, or 3) for each question and x, y, and z value.
        First dimension is the question number indexed from 0 to 3.
        Second dimension is x, y, and z values indexed 0 to 2, respectively.
        For example, if the first question has x = 2, y = 3, and z = 5, then |this.correctOptions| is:
        this.correctOptions[0][0] = 2;
        this.correctOptions[0][1] = 3;
        this.correctOptions[0][2] = 5;
    */
    this.correctOptions = [];

    // Return the user selected options in |this.userSelectedOptions|.
    this.returnUserSelectedOptions = function() {
        // Determine which x, y, and z positions were selected
        var userSelectedOptions = [];
        userSelectedOptions[0] = 'none';
        userSelectedOptions[1] = 'none';
        userSelectedOptions[2] = 'none';
        for (var i = 0; i < this.$xValues.length; i++) {
            if (this.$xValues.eq(i).prop('checked')) {
                userSelectedOptions[0] = String(i + 1);
            }
            if (this.$yValues.eq(i).prop('checked')) {
                userSelectedOptions[1] = String(i + 1);
            }
            if (this.$zValues.eq(i).prop('checked')) {
                userSelectedOptions[2] = String(i + 1);
            }
        }
        return userSelectedOptions;
    };

    this.printCode = function() {
        const hbsToUse = (this.isPython || this.language === 'general') ? 'pythonCode' : 'cppCode';
        const code = this[this.name][hbsToUse]({
            xValue1: this.xValues[0],
            xValue2: this.xValues[1],
            xValue3: this.xValues[2],
            yValue1: this.yValues[0],
            yValue2: this.yValues[1],
            zValue1: this.zValues[0],
            zValue2: this.zValues[1],
        });

        this.$traceValueCode.html(code);
    };

    /*
        Choose a random number between (and including) |min| and |max|.
        |min| and |max| are required and numbers.
    */
    this.chooseRandomNumberInRange = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Randomly select the first value for x, y, and z.
    this.setInitValues = function() {
        this.xValues[0] = this.chooseRandomNumberInRange(0, 9);
        this.yValues[0] = this.chooseRandomNumberInRange(0, 9);
        this.zValues[0] = this.chooseRandomNumberInRange(0, 9);
    };

    // Randomly select the second x-value, which cannot be the same as the first x-value.
    this.setXAssign1 = function() {
        do {
            this.xValues[1] = this.chooseRandomNumberInRange(0, 9);
        } while (this.xValues[1] === this.xValues[0]);
    };

    // Randomly select the second y-value, which cannot be the same as the first y-value.
    this.setYAssign1 = function() {
        do {
            this.yValues[1] = this.chooseRandomNumberInRange(0, 9);
        } while (this.yValues[1] === this.yValues[0]);
    };

    // Randomly select the second y-value, which cannot be the same as the first y-value.
    this.setZAssign1 = function() {
        do {
            this.zValues[1] = this.chooseRandomNumberInRange(0, 9);
        } while (this.zValues[1] === this.zValues[0]);
    };

    // Randomly select the third x-value, which cannot be the same as the first or second x-value.
    this.setXassign2 = function() {
        do {
            this.xValues[2] = this.chooseRandomNumberInRange(0, 9);
        } while ((this.xValues[2] === this.xValues[0]) || (this.xValues[2] === this.xValues[1]));
    };

    // Randomly select the third y- and z-value, which cannot be the same as the first or second y-value, or z-value, respectively.
    this.setYandZAssign2 = function() {
        do {
            this.yValues[2] = this.chooseRandomNumberInRange(0, 9);
        } while ((this.yValues[2] === this.yValues[0]) || (this.yValues[2] === this.yValues[1]));

        do {
            this.zValues[2] = this.chooseRandomNumberInRange(0, 9);
        } while ((this.zValues[2] === this.zValues[0]) || (this.zValues[2] === this.zValues[1]));
    };

    // Set the options that the user can choose for the values of x, y, and z.
    this.setOptions = function() {
        // Reset |correctOptions|
        this.correctOptions.length = 0;
        this.correctOptions[0] = [];
        this.correctOptions[1] = [];
        this.correctOptions[2] = [];
        this.correctOptions[3] = [];

        // Randomize the order of the options
        var xOptions = this.randomizeXOptionsOrder();
        var yOptions = this.randomizeYOptionsOrder();
        var zOptions = this.randomizeZOptionsOrder();

        // Set options across each x, y, and z value.
        for (var i = 0; i < this.$xValues.length; i++) {
            this.$xValues.eq(i).val(xOptions[i]);
            $('label[for=xValue' + (i + 1) + this.id + ']').html(xOptions[i]);
            $('#correctXValue' + (i + 1) + this.id).val(xOptions[i]);
            $('label[for=correctXValue' + (i + 1) + this.id + ']').html(xOptions[i]);

            this.$yValues.eq(i).val(yOptions[i]);
            $('label[for=yValue' + (i + 1) + this.id + ']').html(yOptions[i]);
            $('#correctYValue' + (i + 1) + this.id).val(yOptions[i]);
            $('label[for=correctYValue' + (i + 1) + this.id + ']').html(yOptions[i]);

            this.$zValues.eq(i).val(zOptions[i]);
            $('label[for=zValue' + (i + 1) + this.id + ']').html(zOptions[i]);
            $('#correctZValue' + (i + 1) + this.id).val(zOptions[i]);
            $('label[for=correctZValue' + (i + 1) + this.id + ']').html(zOptions[i]);
        }
    };

    // Randomize the order of x value options by either shifting left, not shifting, or shifting right
    this.randomizeXOptionsOrder = function() {
        var randomNumber = this.chooseRandomNumberInRange(1, 3);
        var xOptions = [];

        // shift x options left
        if (randomNumber === 1) {
            this.correctOptions[0][0] = '1';
            this.correctOptions[1][0] = '1';
            this.correctOptions[2][0] = '1';
            this.correctOptions[3][0] = '2';

            xOptions[0] = this.xValues[1];
            xOptions[1] = this.xValues[2];
            xOptions[2] = this.xValues[0];
        }
        // no shift of x options
        else if (randomNumber === 2) {
            this.correctOptions[0][0] = '2';
            this.correctOptions[1][0] = '2';
            this.correctOptions[2][0] = '2';
            this.correctOptions[3][0] = '3';

            xOptions[0] = this.xValues[0];
            xOptions[1] = this.xValues[1];
            xOptions[2] = this.xValues[2];
        }
        // shift x options right
        else if (randomNumber === 3) {
            this.correctOptions[0][0] = '3';
            this.correctOptions[1][0] = '3';
            this.correctOptions[2][0] = '3';
            this.correctOptions[3][0] = '1';

            xOptions[0] = this.xValues[2];
            xOptions[1] = this.xValues[0];
            xOptions[2] = this.xValues[1];
        }

        return xOptions;
    };

    // Randomize the order of y value options by either shifting left, not shifting, or shifting right
    this.randomizeYOptionsOrder = function() {
        var randomNumber = this.chooseRandomNumberInRange(1, 3);
        var yOptions = [];

        // shift y options left
        if (randomNumber === 1) {
            this.correctOptions[0][1] = '3';
            this.correctOptions[1][1] = '1';
            this.correctOptions[2][1] = '1';
            this.correctOptions[3][1] = '1';

            yOptions[0] = this.yValues[1];
            yOptions[1] = this.yValues[2];
            yOptions[2] = this.yValues[0];
        }
        // no shift of y options
        else if (randomNumber === 2) {
            this.correctOptions[0][1] = '1';
            this.correctOptions[1][1] = '2';
            this.correctOptions[2][1] = '2';
            this.correctOptions[3][1] = '2';

            yOptions[0] = this.yValues[0];
            yOptions[1] = this.yValues[1];
            yOptions[2] = this.yValues[2];
        }
        // shift y options right
        else if (randomNumber === 3) {
            this.correctOptions[0][1] = '2';
            this.correctOptions[1][1] = '3';
            this.correctOptions[2][1] = '3';
            this.correctOptions[3][1] = '3';

            yOptions[0] = this.yValues[2];
            yOptions[1] = this.yValues[0];
            yOptions[2] = this.yValues[1];
        }

        return yOptions;
    };

    // Randomize the order of z value options by either shifting left, not shifting, or shifting right
    this.randomizeZOptionsOrder = function() {
        var randomNumber = this.chooseRandomNumberInRange(1, 3);
        var zOptions = [];

        // shift z options left
        if (randomNumber === 1) {
            this.correctOptions[0][2] = '2';
            this.correctOptions[1][2] = '2';
            this.correctOptions[2][2] = '3';
            this.correctOptions[3][2] = '3';

            zOptions[0] = this.zValues[2];
            zOptions[1] = this.zValues[0];
            zOptions[2] = this.zValues[1];
        }
        // no shift of z options
        else if (randomNumber === 2) {
            this.correctOptions[0][2] = '3';
            this.correctOptions[1][2] = '3';
            this.correctOptions[2][2] = '1';
            this.correctOptions[3][2] = '1';

            zOptions[0] = this.zValues[1];
            zOptions[1] = this.zValues[2];
            zOptions[2] = this.zValues[0];
        }
        // shift z options right
        else if (randomNumber === 3) {
            this.correctOptions[0][2] = '1';
            this.correctOptions[1][2] = '1';
            this.correctOptions[2][2] = '2';
            this.correctOptions[3][2] = '2';

            zOptions[0] = this.zValues[0];
            zOptions[1] = this.zValues[1];
            zOptions[2] = this.zValues[2];
        }

        return zOptions;
    };

    /*
        Set the code the user is shown based on the |currentQuestion|.
        |currentQuestion| is not required and is a number.
    */
    this.setCode = function(currentQuestion) {
        currentQuestionIsUndefined = (currentQuestion === undefined);
        currentQuestion = !currentQuestionIsUndefined ? currentQuestion : 0;
        if (currentQuestion === 0) {
            this.setInitValues();
            this.setXAssign1();
            this.setYAssign1();
            this.setZAssign1();
            this.setXassign2();
            this.setYandZAssign2();
        }
        else if (currentQuestion === 1) {
            this.setYAssign1();
            this.setZAssign1();
            this.setXassign2();
            this.setYandZAssign2();
        }
        else if (currentQuestion === 2) {
            this.setZAssign1();
            this.setXassign2();
            this.setYandZAssign2();
        }
        else if (currentQuestion === 3) {
            this.setXassign2();
            this.setYandZAssign2();
        }

        this.printCode();
        this.setOptions();
    };

    /*
        Reveal lines of code |upToLineNumber|.
        |upToLineNumber| is required and a number.
    */
    this.revealCodeUpToLine = function(upToLineNumber) {
        $codeToReveal = $('#' + this.id + ' .code-to-reveal');
        $codeToReveal.hide();
        for (var i = 0; i <= upToLineNumber; i++) {
            $codeToReveal.eq(i).show();
        }
    };

    // Return whether each variable has an option selected.
    this.allVariablesHaveOptionSelected = function() {
        var doesEachVariableHaveOptionSelected = true;

        if (!this.$xValues.eq(0).prop('checked') && !this.$xValues.eq(1).prop('checked') && !this.$xValues.eq(2).prop('checked')) {
            doesEachVariableHaveOptionSelected = false;
        }
        else if (!this.$yValues.eq(0).prop('checked') && !this.$yValues.eq(1).prop('checked') && !this.$yValues.eq(2).prop('checked')) {
            doesEachVariableHaveOptionSelected = false;
        }
        else if (!this.$zValues.eq(0).prop('checked') && !this.$zValues.eq(1).prop('checked') && !this.$zValues.eq(2).prop('checked')) {
            doesEachVariableHaveOptionSelected = false;
        }

        return doesEachVariableHaveOptionSelected;
    };

    /*
        Determine whether the selected options are correct based on |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    this.areOptionsCorrect = function(currentQuestionNumber) {
        var correctOptions = {
            x: this.correctOptions[currentQuestionNumber][0],
            y: this.correctOptions[currentQuestionNumber][1],
            z: this.correctOptions[currentQuestionNumber][2]
        };
        var areOptionsCorrect = true;
        var self = this;
        [ 'x', 'y', 'z' ].forEach(function(variableName) {
            var $selected = $('#' + self.id + ' [id^=' + variableName + 'Value]:checked');
            if ($selected.attr('id') === (variableName + 'Value' + correctOptions[variableName] + self.id)) {
                $selected.addClass('correct-answer');
            }
            else {
                $selected.addClass('wrong-answer');
                areOptionsCorrect = false;
            }
        });

        return areOptionsCorrect;
    };

    /*
        Set the correct options in the solution based on the |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    this.setCorrectOptions = function(currentQuestionNumber) {
        var correctOptions = {
            X: this.correctOptions[currentQuestionNumber][0],
            Y: this.correctOptions[currentQuestionNumber][1],
            Z: this.correctOptions[currentQuestionNumber][2]
        };
        var self = this;
        [ '1', '2', '3' ].forEach(function(option) {
            [ 'X', 'Y', 'Z' ].forEach(function(variableName) {
                var $variable = $('#correct' + variableName + 'Value' + option + self.id);
                if (correctOptions[variableName] === option) {
                    $variable.prop('checked', true).addClass('correct-answer');
                }
                else {
                    $variable.prop('checked', false).removeClass('correct-answer');
                }
            });
        });
    };

    this.enableOptions = function() {
        this.$xValues.attr('disabled', false);
        this.$yValues.attr('disabled', false);
        this.$zValues.attr('disabled', false);
    };

    this.disableOptions = function() {
        this.$xValues.attr('disabled', true);
        this.$yValues.attr('disabled', true);
        this.$zValues.attr('disabled', true);
    };

    // Reset the options by unchecking and removing any classes
    this.resetOptions = function() {
        this.$xValues.prop('checked', false).removeClass('correct-answer').removeClass('wrong-answer');
        this.$yValues.prop('checked', false).removeClass('correct-answer').removeClass('wrong-answer');
        this.$zValues.prop('checked', false).removeClass('correct-answer').removeClass('wrong-answer');
    };

    /*
        Generate a question based on |currentQuestionNumber|.
        |currentQuestionNumber| is required and a number.
    */
    this.generateQuestion = function(currentQuestionNumber) {
        this.$solution.css('visibility', 'hidden');
        this.resetOptions();
        this.enableOptions();

        // If user selected the wrong options, then randomly generate a new question
        if (this.didUserSelectWrongOptions) {
            this.didUserSelectWrongOptions = false;
            this.setCode(currentQuestionNumber);
            this.revealCodeUpToLine(currentQuestionNumber);
        }
        // If this is the first question, then generate new code
        else if (currentQuestionNumber === 0) {
            this.setCode(currentQuestionNumber);
            this.revealCodeUpToLine(currentQuestionNumber);
        }
        // Otherwise, move the highlighting to the next problem
        else {
            this.revealCodeUpToLine(currentQuestionNumber);
        }
    };

    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var traceVarValExport = {
    create: function() {
        return new traceVarVal();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = traceVarValExport;
