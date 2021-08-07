function RationalExpressions() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;

        this.someAnswersRequireExponents = false;

        // Array containing the questions to use during this tool instantiation
        // |options| determine which sets of questions are added to |questionsToUse|
        this.questionsToUse = [];

        if (options) {
            if (options.reduceOnly) {
                this.questionsToUse = this.questionsToUse.concat(this.reduceOnlyQuestions);
                this.someAnswersRequireExponents = true;
            }
            if (options.multiplyAndDivide) {
                this.questionsToUse = this.questionsToUse.concat(this.multiplyDivideThenReduce);
                this.someAnswersRequireExponents = true;
            }
            if (options.addAndSubtract) {
                this.questionsToUse = this.questionsToUse.concat(this.addSubtractThenReduce);
            }
            if (options.complex) {
                this.questionsToUse = this.questionsToUse.concat(this.complexLeastCommonDenominators);
            }
        }

        // If true, then gives the user another chance to answer the same question
        // Set to true in |isCorrect()| if the user input is invalid
        this.invalidInputEnteredGiveAnotherTry = false;

        // |expectedAnswer| is a dictionary containing the expected answer
        // |expectedAnswer| is written to in |makeLevel()|
        // |expectedAnswer| is read from in |isCorrect()|
        this.expectedAnswer = {
            numerator:               '',
            denominator:             '',
            fullyFactoredExpression: '',
            explanation:             ''
        };

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['rationalExpressions']({ id: this.id });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.eventManager, {
            html:             html,
            css:              css,
            numToWin:         this.questionsToUse.length,
            useMultipleParts: true,
            start: function() {
                self.enableAllInputs();
                self.focusOnAppropriateInput(0);
            },
            reset: function() {
                self.makeLevel(0);
                self.disableAllInputs();
            },
            next: function(currentQuestion) {
                if (!self.invalidInputEnteredGiveAnotherTry) {
                    self.makeLevel(currentQuestion);
                } else {
                    self.invalidInputEnteredGiveAnotherTry = false;
                    self.enableAllInputs();
                }
                self.focusOnAppropriateInput(currentQuestion);
            },
            isCorrect: function() {
                let isCorrect = false;
                const numeratorInput = self.$rightNumeratorInput.val();
                const denominatorInput = self.$rightDenominatorInput.val();
                const isInputValid = self.isValidInputExpression(numeratorInput) && self.isValidInputExpression(denominatorInput);

                const userAnswer = `(${numeratorInput}) / (${denominatorInput})`;

                // The expected numerator may be an array.
                let expectedNumerator = Array.isArray(self.expectedAnswer.numerator) ? self.expectedAnswer.numerator[0] : self.expectedAnswer.numerator;
                let expectedDenominator = Array.isArray(self.expectedAnswer.denominator) ? self.expectedAnswer.denominator[0] : self.expectedAnswer.denominator;
                const expectedAnswer = `(${expectedNumerator}) / (${expectedDenominator})`;

                let explanationMessage = self.expectedAnswer.explanation;

                if (!isInputValid || (numeratorInput === '') || (denominatorInput === '')) {
                    self.invalidInputEnteredGiveAnotherTry = true;

                    if (self.someAnswersRequireExponents) {
                        explanationMessage = 'Please enter a number or an expression like -3x^3.';
                    }
                    else {
                        explanationMessage = 'Please enter a number or an expression like -3x.';
                    }
                }
                else {
                    isCorrect = self._isAnswerCorrect(
                        self.expectedAnswer.numerator,
                        numeratorInput,
                        self.expectedAnswer.denominator,
                        denominatorInput
                    );
                }

                self.disableAllInputs();

                return {
                    isCorrect,
                    expectedAnswer,
                    explanationMessage,
                    userAnswer,
                };
            },
        });

        // Cache regularly used DOM objects
        this.$leftHandSideOfEquation = $('#' + this.id + ' .left-hand-side-of-equation');
        this.$leftNumerator = this.$leftHandSideOfEquation.find('.numerator');
        this.$leftDenominator = this.$leftHandSideOfEquation.find('.denominator');

        this.$leftHandSideOfEquationSecondExpression = $('#' + this.id + ' .left-hand-side-of-equation-second-expression');
        this.$leftMultiplicationDivisionSymbol = $('#' + this.id + ' .left-hand-side-of-equation-operator-symbol').find('.operator-symbol');
        this.$leftNumeratorAfterMultiplicationSymbol = this.$leftHandSideOfEquationSecondExpression.find('.numerator');
        this.$leftDenominatorAfterMultiplicationSymbol = this.$leftHandSideOfEquationSecondExpression.find('.denominator');

        this.$middleOfEquation = $('#' + this.id + ' .middle-of-equation');
        this.$middleNumerator = this.$middleOfEquation.find('.numerator');
        this.$middleDenominator = this.$middleOfEquation.find('.denominator');
        this.$middleEqualSign = $('#' + this.id + ' .equal-sign.middle-of-equation');

        this.$rightHandSideOfEquation = $('#' + this.id + ' .right-hand-side-of-equation');
        this.$rightNumeratorInput = this.$rightHandSideOfEquation.find('.numerator-input');
        this.$rightDenominatorInput = this.$rightHandSideOfEquation.find('.denominator-input');

        // Initialize equation
        this.makeLevel(0);
        this.disableAllInputs();

        $('#' + this.id + ' input').keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });
    };

    /**
        Return whether the user's numerator and denominator matches the expected.
        @method _isAnswerCorrect
        @private
        @param {String} expectedNumerator The expected numerator.
        @param {String} userNumerator The user's numerator.
        @param {String} expectedDenominator The expected denominator.
        @param {String} userDemoninator The user's denominator.
        @return {Boolean} Whether the user's numerator and denominator matches the expected.
    */
    this._isAnswerCombinationCorrect = function(expectedNumerator, userNumerator, expectedDenominator, userDemoninator) {
        const isNumeratorCorrect = (this.removeSpaces(expectedNumerator) === this.removeSpaces(userNumerator));
        const isDenominatorCorrect = (this.removeSpaces(expectedDenominator) === this.removeSpaces(userDemoninator));

        return (isNumeratorCorrect && isDenominatorCorrect);
    };

    /**
        Return whether the user's answer matches an expected answer. Handles multiple expected numerators and denominators.
        @method _isAnswerCorrect
        @private
        @param {String} expectedNumerator May also be {Array}. The expected numerator.
        @param {String} userNumerator The user's numerator.
        @param {String} expectedDenominator May also be {Array}. The expected denominator.
        @param {String} userDemoninator The user's denominator.
        @return {Boolean} Whether the user's answer matches an expected answer.
    */
    this._isAnswerCorrect = function(expectedNumerator, userNumerator, expectedDenominator, userDemoninator) {
        let isCorrect = false;

        if (Array.isArray(expectedNumerator)) {
            isCorrect = expectedNumerator.some((numeratorAnswer, index) => {
                const denominatorAnswer = expectedDenominator[index];

                return this._isAnswerCombinationCorrect(numeratorAnswer, userNumerator, denominatorAnswer, userDemoninator);
            });
        }
        else {
            isCorrect = this._isAnswerCombinationCorrect(expectedNumerator, userNumerator, expectedDenominator, userDemoninator);
        }

        return isCorrect;
    };

    // Remove spaces from |str|
    // |str| is a string and required.
    this.removeSpaces = function(str) {
        return str.replace(/ /g, '');
    };

    // Return whether |input| is a valid expression.
    // |input| is a string and required.
    this.isValidInputExpression = function(input) {
        input = this.removeSpaces(input);

        // A valid user input is a negative or positve number with 0 or more digits, e.g., -4 or /-?\d*/
        // the number may followed by an x-term, e.g., -4x or /-?\d*((x|y)/
        // the x-term may have an exponent that is a positive or negative number, e.g., -4x^-2 or /-?\d*((x|y)(\^-?\d+)?)?/
        // the x-term may be followed by more numbers and x-terms, e.g., -4x^-2 - 3x^3 or -?\d*((x|y)(\^-?\d+)?)?((\+|-)?\d*((x|y)(\^-?\d+)?)?)*
        var validUserInputRegularExpression = /^-?\d*((x|y)(\^-?\d+)?)?((\+|-)?\d*((x|y)(\^-?\d+)?)?)*$/;

        return validUserInputRegularExpression.test(input);
    };

    this.divisionSymbol = '&divide;';
    this.multiplicationSymbol = '&middot;';
    this.additionSymbol = '+';
    this.subtractionSymbol = '&#8211;';

    // Enable all input fields in tool
    this.enableAllInputs = function() {
        $('#' + this.id + ' input').val('').attr('disabled', false);
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        $('#' + this.id + ' input').attr('disabled', true);
    };

    // Focus on the appropriate input object for the given |currentQuestionNumber|
    // |currentQuestionNumber| is required and an integer
    this.focusOnAppropriateInput = function(currentQuestionNumber) {
        this.$rightNumeratorInput.focus();
    };

    // Hide the middle equation
    this.hideMiddleEquation = function() {
        this.$middleEqualSign.hide();
        this.$middleOfEquation.hide();
    };

    // Show the middle equation
    this.showMiddleEquation = function() {
        this.$middleEqualSign.show();
        this.$middleOfEquation.show();
    };

    // Hide the left-side of equation's multiplication symbol and second expression
    this.hideSecondExpression = function() {
        this.$leftMultiplicationDivisionSymbol.hide();
        this.$leftNumeratorAfterMultiplicationSymbol.hide();
        this.$leftDenominatorAfterMultiplicationSymbol.hide();
    };

    // Show the left-side of equation's multiplication symbol, second expression, and operator between expressions
    // |operatorBetweenExpressions| is required and the operator between the left-side's expressions.
    this.showSecondExpression = function(operatorBetweenExpressions) {
        this.$leftMultiplicationDivisionSymbol.show().html(operatorBetweenExpressions);
        this.$leftNumeratorAfterMultiplicationSymbol.show();
        this.$leftDenominatorAfterMultiplicationSymbol.show();
    };

    // Return string of x to the power of exponent.
    // |exponent| is a number and required
    // (optional) |base| is a string that overrides the default value of 'x'
    // (optional) |useInputNotation| is a boolean. If set to true, then use a user-input notation for the exponent, e.g, x^2
    this.stringifyXToThePowerOf = function(exponent, base, useInputNotation) {
        base = base === undefined ? 'x' : base;
        useInputNotation = useInputNotation === undefined ? false : useInputNotation;

        // if exponent is 0, then |xToPowerOfExponent| is empty string (also default case)
        var xToPowerOfExponent = '';
        if ((exponent > 1) || (exponent < 0)) {
            if (!useInputNotation) {
                xToPowerOfExponent = base + '<sup>' + exponent + '</sup>';
            } else {
                xToPowerOfExponent = base + '^' + exponent;
            }
        } else if (exponent === 1) {
            xToPowerOfExponent = base;
        }

        return xToPowerOfExponent;
    };

    // Return a string of the multiplication symbol
    this.stringifyMultiplicationSymbol = function() {
        return ' <span class="operator-symbol">' + this.multiplicationSymbol + '</span> ';
    };

    // Return a string with proper spacing for a constant value, e.g., -4 -> ' - 4' and 3 -> ' + 3'.
    // Constant value is a number
    this.stringifyConstantValue = function(constantValue) {
        return constantValue >= 0 ? ' + ' + constantValue : ' - ' + (-1 * constantValue);
    };

    // Repeat |stringToRepeat| |n| times
    // |stringToRepeat| is a string and required
    // |n| is an integer and required
    this.repeatStringNTimes = function(stringToRepeat, n) {
        var resultingString = '';
        for (var i = 0; i < n; i++) {
            resultingString += stringToRepeat;
        }
        return resultingString;
    };

    // Return random element value from 'array' passed to this function
    this.pickRandomElementInArray = function(array) {
        return array[Math.floor(Math.random() * array.length)];
    };

    // Return a randomly-chosen prime number less than or equal to |N|
    // The first ten prime numbers are supported
    // |N| is an integer and required
    this.pickPrimeNumberLessThanOrEqualToN = function(N) {
        var arrayOfPrimes = [];
        var firstTenPrimeNumbers = [ 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 ];

        for (var i = 0; i < firstTenPrimeNumbers.length; i++) {
            if (N >= firstTenPrimeNumbers[i]) {
                arrayOfPrimes.push(firstTenPrimeNumbers[i]);
            } else {
                break;
            }
        }

        return this.pickRandomElementInArray(arrayOfPrimes);
    };

    // Return a randomly-chosen number in the range from |start| to |end|
    // |start| is required and an integer.
    // |end| is required and an integer.
    this.pickNumberInRange = function(start, end) {
        var arrayOfNumbers = [];

        for (var i = start; i <= end; i++) {
            arrayOfNumbers.push(i);
        }

        return this.pickRandomElementInArray(arrayOfNumbers);
    };

    // Make equation [a * b]x / [b * c]y = ax / cy
    // a, b, c should be prime as these should be unfactorable
    // a cannot equal c, or else they would eliminate each other
    this.constantOnlyReduce = function(expressionsShown, options) {
        var a = this.pickPrimeNumberLessThanOrEqualToN(7);
        var b = this.pickPrimeNumberLessThanOrEqualToN(7);
        var c = this.pickPrimeNumberLessThanOrEqualToN(7);
        while (c === a) {
            c = this.pickPrimeNumberLessThanOrEqualToN(7);
        }

        expressionsShown.leftSideOfEquationNumerator = String(a * b) + this.stringifyXToThePowerOf(1);
        expressionsShown.leftSideOfEquationDenominator = String(b * c) + this.stringifyXToThePowerOf(1, 'y');

        expressionsShown.rightSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(1, 'x', true);
        expressionsShown.rightSideOfEquationDenominator = String(c) + this.stringifyXToThePowerOf(1, 'y', true);

        expressionsShown.fullyFactoredExpression = '(' + String(b) + this.stringifyMultiplicationSymbol() + String(a) + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1) + ') / (';
        expressionsShown.fullyFactoredExpression += String(b) + this.stringifyMultiplicationSymbol() + String(c) + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1, 'y') + ')';

        expressionsShown.explanation = 'Factor the expression, then eliminate matching terms.<br/>';
        expressionsShown.explanation += expressionsShown.fullyFactoredExpression + ' = ' + expressionsShown.rightSideOfEquationNumerator + ' / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.hideSecondExpression();

        return expressionsShown;
    };

    // Make equation [a * b]x^d / [b * c]x^e = ax^[d - e] / c
    // a, b, c should be prime as these should be unfactorable
    // a cannot equal c, or else they would eliminate each other
    // d must be larger than e so the numerator has a positive x-exponent
    this.constantAndVariableReduce = function(expressionsShown, options) {
        var a = this.pickPrimeNumberLessThanOrEqualToN(7);
        var b = this.pickPrimeNumberLessThanOrEqualToN(7);
        var c = this.pickPrimeNumberLessThanOrEqualToN(7);
        while (c === a) {
            c = this.pickPrimeNumberLessThanOrEqualToN(7);
        }
        var d = this.pickNumberInRange(1, 3);
        var e = this.pickNumberInRange(1, 3);
        d = d + e;

        expressionsShown.leftSideOfEquationNumerator = String(a * b) + this.stringifyXToThePowerOf(d);
        expressionsShown.leftSideOfEquationDenominator = String(b * c) + this.stringifyXToThePowerOf(e);

        expressionsShown.rightSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(d - e, 'x', true);
        expressionsShown.rightSideOfEquationDenominator = String(c);

        var factoredNumeratorVariable = this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1), d);
        var factoredDenominatorVariable = this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1), e);

        expressionsShown.fullyFactoredExpression = '(' + String(b) + this.stringifyMultiplicationSymbol() + String(a) + factoredNumeratorVariable + ') / ';
        expressionsShown.fullyFactoredExpression += '(' + String(b) + this.stringifyMultiplicationSymbol() + String(c) + factoredDenominatorVariable + ')';

        expressionsShown.explanation = 'Factor the expression, then eliminate matching terms.<br/>';
        expressionsShown.explanation += expressionsShown.fullyFactoredExpression + ' = ' + expressionsShown.rightSideOfEquationNumerator + ' / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.hideSecondExpression();

        return expressionsShown;
    };

    // Make equation (ax + [a * b]) / (ax^2 + [[a * b] + [a * c]]x + [a * b * c]) = 1 / (x + c)
    // a, b, c are integers
    // c should be not be equal to -1 * b so that the middle term in the denominator is not 0
    this.harderConstantAndVariableReduce = function(expressionsShown, options) {
        var showMiddle = options && options.showMiddle ? true : false;

        var a = this.pickRandomElementInArray([ -3, -2, -1, 2, 3 ]);
        var b = this.pickNumberInRange(2, 4);
        var c = this.pickNumberInRange(2, 4);

        expressionsShown.leftSideOfEquationNumerator = String(a * b) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(a * b * c);
        expressionsShown.leftSideOfEquationDenominator = String(b) + this.stringifyXToThePowerOf(2) + this.stringifyConstantValue(b * c) + this.stringifyXToThePowerOf(1);

        const expectedNumerator = String(a);
        const expectedDenominator = this.stringifyXToThePowerOf(1);

        expressionsShown.rightSideOfEquationNumerator = [ expectedNumerator ];
        expressionsShown.rightSideOfEquationDenominator = [ expectedDenominator ];

        // Support placing negative symbol in the denominator.
        if (a < 0) {
            expressionsShown.rightSideOfEquationNumerator.push(String(-1 * a));
            expressionsShown.rightSideOfEquationDenominator.push(`-${this.stringifyXToThePowerOf(1)}`);
        }

        expressionsShown.fullyFactoredExpression = '(' + String(b) + this.stringifyMultiplicationSymbol() + String(a) + this.stringifyMultiplicationSymbol() + '(' + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c) + ')) / ' +
                                                   '(' + String(b) + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1) + this.stringifyMultiplicationSymbol() + '(' + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c) + '))';

        expressionsShown.explanation = 'Factor the expression, then eliminate matching terms.<br/>' +
                                       expressionsShown.fullyFactoredExpression + ' = ' + expectedNumerator + ' / ' + expectedDenominator + '.';

        if (showMiddle) {
            expressionsShown.middleEquationNumerator = String(b) + this.stringifyMultiplicationSymbol() + String(a) + this.stringifyMultiplicationSymbol() + '(' + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c) + ')';
            expressionsShown.middleEquationDenominator = String(b) + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1) + this.stringifyMultiplicationSymbol() + '(' + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c) + ')';
            this.showMiddleEquation();
        } else {
            this.hideMiddleEquation();
        }
        this.hideSecondExpression();

        return expressionsShown;
    };

    // Questions that require only reducing the existing constants and variables
    this.reduceOnlyQuestions = [
        {
            makeLevel: this.constantOnlyReduce,
            options: null
        },
        {
            makeLevel: this.constantAndVariableReduce,
            options: null
        },
        {
            makeLevel: this.harderConstantAndVariableReduce,
            options: {
                showMiddle: true
            }
        },
        {
            makeLevel: this.harderConstantAndVariableReduce,
            options: {
                showMiddle: false
            }
        }
    ];

    // Make equation (ay^e / b) * (cx^d / ay^f)
    // a, b, c, d, e, f are integers
    // a, b, c should be prime as these should be unfactorable
    // c should not equal b or else they'll eliminate each other
    // f > e, so that the denominator will have a positive y exponent
    this.multiplyRationalExpressions = function(expressionsShown, options) {
        var showMiddle = options && options.showMiddle ? true : false;

        var a = this.pickPrimeNumberLessThanOrEqualToN(7);
        var b = this.pickPrimeNumberLessThanOrEqualToN(7);
        var c = this.pickPrimeNumberLessThanOrEqualToN(7);
        while (c === b) {
            c = this.pickPrimeNumberLessThanOrEqualToN(7);
        }
        var d = this.pickNumberInRange(1, 4);
        var e = this.pickNumberInRange(1, 3);
        var f = this.pickNumberInRange(1, 3);
        f += e;

        expressionsShown.leftSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(e, 'y');
        expressionsShown.leftSideOfEquationDenominator = String(b);

        expressionsShown.leftSideOfEquationNumeratorOfSecondExpression = String(c) + this.stringifyXToThePowerOf(d);
        expressionsShown.leftSideOfEquationDenominatorOfSecondExpression = String(a) + this.stringifyXToThePowerOf(f, 'y');

        expressionsShown.rightSideOfEquationNumerator = String(c) + this.stringifyXToThePowerOf(d, 'x', true);
        expressionsShown.rightSideOfEquationDenominator = String(b) + this.stringifyXToThePowerOf(f - e, 'y', true);

        var factoredNumeratorVariable = this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1, 'y'), e);
        factoredNumeratorVariable += this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1), d);
        var factoredDenominatorVariable = this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1, 'y'), f);

        expressionsShown.fullyFactoredExpression = '(' + String(a) + this.stringifyMultiplicationSymbol() + String(c) + factoredNumeratorVariable + ') / ';
        expressionsShown.fullyFactoredExpression += '(' + String(a) + this.stringifyMultiplicationSymbol() + String(b) + factoredDenominatorVariable + ')';

        expressionsShown.explanation = 'Multiply the numerators, multiply the denominators, then eliminate matching terms.<br/>';
        expressionsShown.explanation += expressionsShown.fullyFactoredExpression + ' = ' + expressionsShown.rightSideOfEquationNumerator + ' / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        if (showMiddle) {
            expressionsShown.middleEquationNumerator = String(a) + this.stringifyMultiplicationSymbol() + String(c) + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(e, 'y') + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(d);
            expressionsShown.middleEquationDenominator = String(a) + this.stringifyMultiplicationSymbol() + String(b) + this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(f, 'y');
            this.showMiddleEquation();
        } else {
            this.hideMiddleEquation();
        }

        this.showSecondExpression(this.multiplicationSymbol);

        return expressionsShown;
    };

    // Make equation (ay^e / b) / (ay^f / cx^d)
    // a, b, c, d, e, f are integers
    // a, b, c should be prime as these should be unfactorable
    // c should not equal b or else they'll eliminate each other
    // f > e, so that the denominator will have a positive y exponent
    this.divideRationalExpressions = function(expressionsShown, options) {
        var a = this.pickPrimeNumberLessThanOrEqualToN(7);
        var b = this.pickPrimeNumberLessThanOrEqualToN(7);
        var c = this.pickPrimeNumberLessThanOrEqualToN(7);
        while (c === b) {
            c = this.pickPrimeNumberLessThanOrEqualToN(7);
        }
        var d = this.pickNumberInRange(1, 4);
        var e = this.pickNumberInRange(1, 3);
        var f = this.pickNumberInRange(1, 3);
        f += e;

        expressionsShown.leftSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(e, 'y');
        expressionsShown.leftSideOfEquationDenominator = String(b);

        expressionsShown.leftSideOfEquationNumeratorOfSecondExpression = String(a) + this.stringifyXToThePowerOf(f, 'y');
        expressionsShown.leftSideOfEquationDenominatorOfSecondExpression = String(c) + this.stringifyXToThePowerOf(d);

        expressionsShown.rightSideOfEquationNumerator = String(c) + this.stringifyXToThePowerOf(d, 'x', true);
        expressionsShown.rightSideOfEquationDenominator = String(b) + this.stringifyXToThePowerOf(f - e, 'y', true);

        var factoredNumeratorVariable = this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1, 'y'), e);
        factoredNumeratorVariable += this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1), d);
        var factoredDenominatorVariable = this.repeatStringNTimes(this.stringifyMultiplicationSymbol() + this.stringifyXToThePowerOf(1, 'y'), f);

        expressionsShown.fullyFactoredExpression = '(' + String(a) + this.stringifyMultiplicationSymbol() + String(c) + factoredNumeratorVariable + ') / ';
        expressionsShown.fullyFactoredExpression += '(' + String(a) + this.stringifyMultiplicationSymbol() + String(b) + factoredDenominatorVariable + ')';

        expressionsShown.explanation = 'Take the reciprocal of the second expression, multiply, then eliminate matching terms.<br/>';
        expressionsShown.explanation += expressionsShown.fullyFactoredExpression + ' = ' + expressionsShown.rightSideOfEquationNumerator + ' / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.showSecondExpression(this.divisionSymbol);

        return expressionsShown;
    };

    // Questions that require multiplying or dividing then reducing
    this.multiplyDivideThenReduce = [
        {
            makeLevel: this.multiplyRationalExpressions,
            options: {
                showMiddle: true
            }
        },
        {
            makeLevel: this.multiplyRationalExpressions,
            options: {
                showMiddle: false
            }
        },
        {
            makeLevel: this.divideRationalExpressions,
            options:   null
        }
    ];

    // Compute the greatest common divisor of |num1| and |num2|
    // |num1| and |num2| are integers and required
    this.greatestCommonDivisor = function(num1, num2) {
        if (num2 === 0) {
            return num1;
        } else {
            return this.greatestCommonDivisor(num2, num1 % num2);
        }
    };

    // Determine whether |num1| and |num2| have an integer factor
    // If the greatest common divisor (gcd) is 1, then there is no integer factor
    // |num1| and |num2| are integers and required
    this.hasIntegerFactor = function(num1, num2) {
        return this.greatestCommonDivisor(num1, num2) > 1;
    };

    // Make equation ((ax + b) / (x + c)) + ((dx + e) / (x + c))
    // a, b, c, d, and e are integers
    // Prevent [(a+d)x + (b+e)] from having an integer factor. That is, the greatest common divisor of (a+d) and (b+e) should be 1.
    this.addRationalExpressions = function(expressionsShown, options) {
        var a = this.pickNumberInRange(2, 7);
        var b = this.pickNumberInRange(2, 7);
        var c = this.pickNumberInRange(2, 7);
        var d = this.pickNumberInRange(2, 7);
        var e = this.pickNumberInRange(2, 7);
        while (this.hasIntegerFactor(a + d, b + e)) {
            e = this.pickNumberInRange(2, 7);
        }

        expressionsShown.leftSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(b);
        expressionsShown.leftSideOfEquationDenominator = this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c);

        expressionsShown.leftSideOfEquationNumeratorOfSecondExpression = String(d) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(e);
        expressionsShown.leftSideOfEquationDenominatorOfSecondExpression = this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c);

        expressionsShown.rightSideOfEquationNumerator = String(a + d) + this.stringifyXToThePowerOf(1, 'x', true) + this.stringifyConstantValue(b + e);
        expressionsShown.rightSideOfEquationDenominator = this.stringifyXToThePowerOf(1, 'x', true) + this.stringifyConstantValue(c);

        expressionsShown.fullyFactoredExpression = '((' + String(a) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(b) + ') + (' + String(d) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(e) + ')) / ';
        expressionsShown.fullyFactoredExpression += '(' + this.stringifyXToThePowerOf(1, 'x', true) + this.stringifyConstantValue(c) + ')';

        expressionsShown.explanation = 'Add the numerators.<br/>';
        expressionsShown.explanation += expressionsShown.fullyFactoredExpression + ' = (' + expressionsShown.rightSideOfEquationNumerator + ') / (' + expressionsShown.rightSideOfEquationDenominator + ').';

        this.hideMiddleEquation();
        this.showSecondExpression(this.additionSymbol);

        return expressionsShown;
    };

    // Make equation ((ax + b) / (x + c)) - ((dx + e) / (x + c))
    // a, b, c, d, and e are integers
    // a should be larger than d
    // b should be larger than e
    // Prevent [(a-d)x + (b-e)] from having an integer factor. That is, the greatest common divisor of (a-d) and (b-e) should be 1.
    this.subtractRationalExpressions = function(expressionsShown, options) {
        var a = this.pickNumberInRange(6, 10);
        var b = this.pickNumberInRange(6, 10);
        var c = this.pickNumberInRange(2, 7);
        var d = this.pickNumberInRange(2, 4);
        var e = this.pickNumberInRange(2, 4);
        while (this.hasIntegerFactor(a - d, b - e)) {
            e = this.pickNumberInRange(2, 7);
        }

        expressionsShown.leftSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(b);
        expressionsShown.leftSideOfEquationDenominator = this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c);

        expressionsShown.leftSideOfEquationNumeratorOfSecondExpression = String(d) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(e);
        expressionsShown.leftSideOfEquationDenominatorOfSecondExpression = this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c);

        expressionsShown.rightSideOfEquationNumerator = String(a - d) + this.stringifyXToThePowerOf(1, 'x', true) + this.stringifyConstantValue(b - e);
        expressionsShown.rightSideOfEquationDenominator = this.stringifyXToThePowerOf(1, 'x', true) + this.stringifyConstantValue(c);

        expressionsShown.fullyFactoredExpression = '(' + String(a) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(b) + this.stringifyConstantValue(-1 * d) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(-1 * e) + ') / ';
        expressionsShown.fullyFactoredExpression += '(' + this.stringifyXToThePowerOf(1, 'x', true) + this.stringifyConstantValue(c) + ')';

        expressionsShown.explanation = 'Subtract the second numerator from the first.<br/>';
        expressionsShown.explanation += expressionsShown.fullyFactoredExpression + ' = (' + expressionsShown.rightSideOfEquationNumerator + ') / (' + expressionsShown.rightSideOfEquationDenominator + ').';

        this.hideMiddleEquation();
        this.showSecondExpression(this.subtractionSymbol);

        return expressionsShown;
    };

    // Make equation (ax / b) + (c / (b * b))
    // a, b, and c should be prime to prevent elimination and factoring
    // a, b, and c should not be equal to prevent elimination and factoring
    this.leastCommonDenominatorWithInteger = function(expressionsShown, options) {
        var a = this.pickPrimeNumberLessThanOrEqualToN(7);

        var b = this.pickPrimeNumberLessThanOrEqualToN(7);
        while (a === b) {
            b = this.pickPrimeNumberLessThanOrEqualToN(7);
        }

        var c = this.pickPrimeNumberLessThanOrEqualToN(11);
        while ((a === c) || (b === c)) {
            c = this.pickPrimeNumberLessThanOrEqualToN(11);
        }

        expressionsShown.leftSideOfEquationNumerator = String(a) + this.stringifyXToThePowerOf(1);
        expressionsShown.leftSideOfEquationDenominator = String(b);

        expressionsShown.leftSideOfEquationNumeratorOfSecondExpression = String(c);
        expressionsShown.leftSideOfEquationDenominatorOfSecondExpression = String(b * b);

        expressionsShown.rightSideOfEquationNumerator = String(a * b) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(c);
        expressionsShown.rightSideOfEquationDenominator = String(b * b);

        expressionsShown.fullyFactoredExpression = '((' + String(a) + this.stringifyXToThePowerOf(1) + ' / ' + String(b) + ') * (' + String(b) + ' / ' + String(b) + ')) + ';
        expressionsShown.fullyFactoredExpression += '((' + String(c) + ' / ' + String(b * b) + ') * (1 / 1))';

        expressionsShown.explanation = 'Find least common denominator, match denominators, then add the numerators.<br/>';
        expressionsShown.explanation += 'Least common denominator: ' + String(b * b) + '<br/>';
        expressionsShown.explanation += 'First fraction: (' + String(a) + this.stringifyXToThePowerOf(1) + ' / ' + String(b) + ')' + this.stringifyMultiplicationSymbol() + '(' + String(b) + ' / ' + String(b) + ')';
        expressionsShown.explanation += ' = (' + String(a * b) + this.stringifyXToThePowerOf(1) + ' / ' + String(b * b) + ')<br/>';
        expressionsShown.explanation += 'Then: (' + String(a * b) + this.stringifyXToThePowerOf(1) + ' / ' + String(b * b) + ') + (' + String(c) + ' / ' + String(b * b) + ') = (' + expressionsShown.rightSideOfEquationNumerator + ') / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.showSecondExpression(this.additionSymbol);

        return expressionsShown;
    };

    // Make equation (c / (b * b)) + (a / bx)
    // a, b, and c should be prime to prevent elimination and factoring
    // a, b, and c should not be equal to prevent elimination and factoring
    this.leastCommonDenominatorWithVariable = function(expressionsShown, options) {
        var a = this.pickPrimeNumberLessThanOrEqualToN(7);

        var b = this.pickPrimeNumberLessThanOrEqualToN(5);
        while (a === b) {
            b = this.pickPrimeNumberLessThanOrEqualToN(5);
        }

        var c = this.pickPrimeNumberLessThanOrEqualToN(11);
        while ((a === c) || (b === c)) {
            c = this.pickPrimeNumberLessThanOrEqualToN(11);
        }

        expressionsShown.leftSideOfEquationNumerator = String(c);
        expressionsShown.leftSideOfEquationDenominator = String(b * b);

        expressionsShown.leftSideOfEquationNumeratorOfSecondExpression = String(a);
        expressionsShown.leftSideOfEquationDenominatorOfSecondExpression = String(b) + this.stringifyXToThePowerOf(1);

        expressionsShown.rightSideOfEquationNumerator = String(c) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(a * b);
        expressionsShown.rightSideOfEquationDenominator = String(b * b) + this.stringifyXToThePowerOf(1);

        expressionsShown.fullyFactoredExpression = '((' + String(c) + ' / ' + String(b * b) + ') * (' + this.stringifyXToThePowerOf(1) + ' / ' + this.stringifyXToThePowerOf(1) + ')) + ';
        expressionsShown.fullyFactoredExpression += '((' + String(a) + ' / ' + String(b) + this.stringifyXToThePowerOf(1) + ') * (' + String(b) + ' / ' + String(b) + '))';

        expressionsShown.explanation = 'Find least common denominator, match denominators, then add the numerators.<br/>';
        expressionsShown.explanation += 'Least common denominator: ' + String(b * b) + this.stringifyXToThePowerOf(1) + '<br/>';
        expressionsShown.explanation += 'First fraction: (' + String(c) + ' / ' + String(b * b) + ')' + this.stringifyMultiplicationSymbol() + '(' + this.stringifyXToThePowerOf(1) + ' / ' + this.stringifyXToThePowerOf(1) + ')';
        expressionsShown.explanation += ' = (' + String(c) + this.stringifyXToThePowerOf(1) + ' / ' + String(b * b) + this.stringifyXToThePowerOf(1) + ')<br/>';
        expressionsShown.explanation += 'Second fraction: (' + String(a) + ' / ' + String(b) + this.stringifyXToThePowerOf(1) + ')' + this.stringifyMultiplicationSymbol() + '(' + String(b) + ' / ' + String(b) + ')';
        expressionsShown.explanation += ' = (' + String(a * b) + ' / ' + String(b * b) + this.stringifyXToThePowerOf(1) + ')<br/>';
        expressionsShown.explanation += '(' + String(c) + this.stringifyXToThePowerOf(1) + ' / ' + String(b * b) + this.stringifyXToThePowerOf(1) + ') + (' + String(a * b) + ' / ' + String(b * b) + this.stringifyXToThePowerOf(1) + ') = (' + expressionsShown.rightSideOfEquationNumerator + ') / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.showSecondExpression(this.additionSymbol);

        return expressionsShown;
    };

    // Questions that require adding or subtracting then reducing. Some require finding simple least common denominators.
    this.addSubtractThenReduce = [
        {
            makeLevel: this.addRationalExpressions,
            options:   null
        },
        {
            makeLevel: this.subtractRationalExpressions,
            options:   null
        },
        {
            makeLevel: this.leastCommonDenominatorWithInteger,
            options:   null
        },
        {
            makeLevel: this.leastCommonDenominatorWithVariable,
            options:   null
        }
    ];

    // Make equation (((x / a) + b) / c
    // a, b, and c are integers
    // a should not equal c b/c small fraction having same denominator as big fraction may confuse students
    this.complexLCDWithConstant = function(expressionsShown, options) {
        var a = this.pickNumberInRange(2, 6);
        var b = this.pickNumberInRange(2, 6);
        var c = this.pickNumberInRange(2, 6);
        while ((c === a) || (c === b)) {
            c = this.pickNumberInRange(2, 6);
        }

        expressionsShown.leftSideOfEquationNumerator = '(' + this.stringifyXToThePowerOf(1) + ' / ' + String(a) + ') + ' + String(b);
        expressionsShown.leftSideOfEquationDenominator = String(c);

        expressionsShown.rightSideOfEquationNumerator = this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(a * b);
        expressionsShown.rightSideOfEquationDenominator = String(a * c);

        expressionsShown.fullyFactoredExpression = '(' + String(a) + ' / ' + String(a) + ')' + this.stringifyMultiplicationSymbol();
        expressionsShown.fullyFactoredExpression += '(((' + this.stringifyXToThePowerOf(1) + ' / ' + String(a) + ') + ' + String(b) + ') / ' + String(c) + ')';

        expressionsShown.explanation = 'Determine LCD of small fraction: (' + this.stringifyXToThePowerOf(1) + ' / ' + String(a) + ') has LCD of ' + String(a) + '.<br/>';
        expressionsShown.explanation += 'Multiply by LCD: ' + expressionsShown.fullyFactoredExpression + ' = (' + expressionsShown.rightSideOfEquationNumerator + ') / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.hideSecondExpression();

        return expressionsShown;
    };

    // Make equation (a + (b / x)) / (x / c)
    // a, b, and c are prime integers
    // b !== a to prevent factoring
    // b !== c to prevent factoring
    this.complexLCDWithVariable = function(expressionsShown, options) {
        var a = this.pickPrimeNumberLessThanOrEqualToN(7);
        var b = this.pickPrimeNumberLessThanOrEqualToN(11);
        while (b === a) {
            b = this.pickPrimeNumberLessThanOrEqualToN(11);
        }
        var c = this.pickPrimeNumberLessThanOrEqualToN(7);
        while (c === b) {
            c = this.pickPrimeNumberLessThanOrEqualToN(7);
        }

        expressionsShown.leftSideOfEquationNumerator = String(a) + ' + (' + String(b) + ' / ' + String(c) + this.stringifyXToThePowerOf(1) + ')';
        expressionsShown.leftSideOfEquationDenominator = '(' + String(c) + ' / ' + this.stringifyXToThePowerOf(1) + ')';

        expressionsShown.rightSideOfEquationNumerator = String(a * c) + this.stringifyXToThePowerOf(1) + this.stringifyConstantValue(b);
        expressionsShown.rightSideOfEquationDenominator = String(c * c);

        expressionsShown.fullyFactoredExpression = '(' + String(c) + this.stringifyXToThePowerOf(1) + ' / ' + String(c) + this.stringifyXToThePowerOf(1) + ')' + this.stringifyMultiplicationSymbol();
        expressionsShown.fullyFactoredExpression += '((' + String(a) + ' + (' + String(b) + ' / ' + String(c) + this.stringifyXToThePowerOf(1) + ')) / (' + String(c) + ' / ' + this.stringifyXToThePowerOf(1) + '))';

        expressionsShown.explanation = 'Determine LCD of small fractions: (' + String(b) + ' / ' + String(c) + this.stringifyXToThePowerOf(1) + ') and (' + String(c) + ' / ' + this.stringifyXToThePowerOf(1) + ') have LCD of ' + String(c) + this.stringifyXToThePowerOf(1) + '.<br/>';
        expressionsShown.explanation += 'Multiply by LCD: ' + expressionsShown.fullyFactoredExpression + ' = (' + expressionsShown.rightSideOfEquationNumerator + ') / ' + expressionsShown.rightSideOfEquationDenominator + '.';

        this.hideMiddleEquation();
        this.hideSecondExpression();

        return expressionsShown;
    };

    // Questions that require complex least common denominators
    this.complexLeastCommonDenominators = [
        {
            makeLevel: this.complexLCDWithConstant,
            options:   null
        },
        {
            makeLevel: this.complexLCDWithVariable,
            options:   null
        }
    ];

    // Display an equation given the |currentQuestionNumber|
    // |currentQuestionNumber| is an integer
    this.makeLevel = function(currentQuestionNumber) {
        let expressionsShown = {
            leftSideOfEquationNumerator: '',
            leftSideOfEquationDenominator: '',
            leftSideOfEquationNumeratorOfSecondExpression: '',
            leftSideOfEquationDenominatorOfSecondExpression: '',
            middleEquationNumerator: '',
            middleEquationDenominator: '',
            rightSideOfEquationNumerator: '',
            rightSideOfEquationDenominator: '',
            fullyFactoredExpression: '',
        };

        var nextQuestion = this.questionsToUse[currentQuestionNumber];
        expressionsShown = nextQuestion.makeLevel.call(this, expressionsShown, nextQuestion.options);

        this.$leftNumerator.html(expressionsShown.leftSideOfEquationNumerator);
        this.$leftDenominator.html(expressionsShown.leftSideOfEquationDenominator);
        this.$leftNumeratorAfterMultiplicationSymbol.html(expressionsShown.leftSideOfEquationNumeratorOfSecondExpression);
        this.$leftDenominatorAfterMultiplicationSymbol.html(expressionsShown.leftSideOfEquationDenominatorOfSecondExpression);
        this.$middleNumerator.html(expressionsShown.middleEquationNumerator);
        this.$middleDenominator.html(expressionsShown.middleEquationDenominator);

        this.expectedAnswer = {
            numerator:               expressionsShown.rightSideOfEquationNumerator,
            denominator:             expressionsShown.rightSideOfEquationDenominator,
            fullyFactoredExpression: expressionsShown.fullyFactoredExpression,
            explanation:             expressionsShown.explanation
        };

        this.enableAllInputs();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var rationalExpressionsExport = {
    create: function() {
        return new RationalExpressions();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = rationalExpressionsExport;
