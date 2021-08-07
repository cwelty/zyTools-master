function BinaryAddition() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }

        this.utilities = require('utilities');

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['template']({
            id: this.id
        });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 6,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.generateProgressionQuestion(0);
                self.enableDisableButtons(true);
            },
            reset: function() {
                self.generateProgressionQuestion(0);
                self.enableDisableButtons(false);
            },
            next: function(currentQuestion) {
                self.generateProgressionQuestion(currentQuestion);
                self.enableDisableButtons(true);
            },
            isCorrect: function(currentQuestion) {
                var userBits = [];
                var userCarryBits = [];
                self.$answerBits.each(function(i) {
                    userBits[self.correctAnswer.length - 1 - i] = parseInt($(this).text());
                });
                self.$carryBits.each(function(i) {
                    if (i !== self.correctCarryBits.length) {
                        userCarryBits[self.correctCarryBits.length - 1 - i] = parseInt($(this).text());
                    }
                });
                self.enableDisableButtons(false);
                self.progressionTool.userAnswer = JSON.stringify(userBits);
                self.progressionTool.expectedAnswer = JSON.stringify(self.correctAnswer);
                var isAnswerCorrect = self.verifyAnswer(userBits, userCarryBits);
                var multipleWrongBits = false;
                var numWrongBits = 0;
                self.$answerBits.each(function() {
                    if ($(this).hasClass('wrong-answer')) {
                        numWrongBits++;
                    }
                });
                self.$carryBits.each(function() {
                    if ($(this).hasClass('wrong-answer')) {
                        numWrongBits++;
                    }
                });
                if (numWrongBits > 1) {
                    multipleWrongBits = true;
                }
                if (isAnswerCorrect) {
                    self.progressionTool.explanationMessage = 'Correct.';
                }
                else if (multipleWrongBits) {
                    self.progressionTool.explanationMessage = 'The incorrect bits are highlighted in red.';
                }
                else {
                    self.progressionTool.explanationMessage = 'The incorrect bit is highlighted in red.';
                }
                return isAnswerCorrect;
            }
        });
        // Cache
        this.$userPrompt = $('#' + this.id + ' .user-prompt');
        this.$carryBits = $('#' + this.id + ' .carry-bit');
        this.$answerBits = $('#' + this.id + ' .answer-bit');
        this.$firstNum = $('#' + this.id + ' .question-bit-container.first-num .question-bit');
        this.$secondNum = $('#' + this.id + ' .question-bit-container.second-num .question-bit');
        // Init
        this.$firstNum.prop('disabled', true);
        this.$secondNum.prop('disabled', true);
        this.generateProgressionQuestion(0);
        this.enableDisableButtons(false);
        // Event listeners
        this.$answerBits.click(function() {
            $(this).text() === '0' ? $(this).text('1') : $(this).text('0');
        });

        this.$carryBits.click(function() {
            $(this).text() === '0' ? $(this).text('1') : $(this).text('0');
        });
    };

    this.enableDisableButtons = function(enable) {
        if (enable) {
            this.$answerBits.removeClass('disabled');
            this.$answerBits.prop('disabled', false);
            this.$carryBits.removeClass('disabled');
            this.$carryBits.prop('disabled', false);
        }
        else {
            this.$answerBits.addClass('disabled');
            this.$answerBits.prop('disabled', true);
            this.$carryBits.addClass('disabled');
            this.$carryBits.prop('disabled', true);
        }
    };

    // Generates the progression question for the given |questionIndex|
    // the higher the index the harder the question
    this.generateProgressionQuestion = function(questionIndex) {

        // Reset carry bits
        this.$carryBits.each(function() {
            $(this).text('0').removeClass('wrong-answer');
        });

        // Reset answer bits
        this.$answerBits.each(function() {
            $(this).text('0').removeClass('wrong-answer');
        });

        const numberOfBits = 4;

        do {
            if (questionIndex >= 0 && questionIndex < 2) { // eslint-disable-line no-magic-numbers
                this.generateAdditionProblem(numberOfBits, 'easy');
            }
            else if (questionIndex >= 2 && questionIndex < 4) { // eslint-disable-line no-magic-numbers
                this.generateAdditionProblem(numberOfBits, 'medium');
            }
            else {
                this.generateAdditionProblem(numberOfBits, 'hard');
            }
        } while (this.correctAnswer.every(bitValue => bitValue === 0));
    };

    // Generates the two numBits numbers to be added together along with the correctAnswer array
    // |numBits| - number of bits for each number
    // {difficulty| - easy - medium - hard
    this.generateAdditionProblem = function(numBits, difficulty) {
        this.numberOne = [];
        this.numberTwo = [];
        this.answer = [];
        this.correctAnswer = [];
        this.correctCarryBits = [];

        let carryBit = 0;

        for (let loopIndex = 0; loopIndex < numBits; loopIndex++) {
            let firstBit = 0;
            let secondBit = 0;
            let repeatIfEasy = true;
            let repeatIfMedium = true;

            while (repeatIfEasy || repeatIfMedium) {
                firstBit = this.utilities.pickNumberInRange(0, 1);
                secondBit = this.utilities.pickNumberInRange(0, 1);

                repeatIfEasy = (difficulty === 'easy') && ((firstBit + secondBit) > 1);
                repeatIfMedium = (difficulty === 'medium') && ((firstBit + secondBit + carryBit) === 3); // eslint-disable-line no-magic-numbers
            }

            this.numberOne.push(firstBit);
            this.numberTwo.push(secondBit);
            this.correctAnswer.push((firstBit + secondBit + carryBit) % 2); // eslint-disable-line no-magic-numbers
            carryBit = (firstBit + secondBit + carryBit) > 1 ? 1 : 0;
        }

        // Make sure atleast 1 part has carry over
        if (difficulty === 'medium') {
            var haveCarry = false;
            for (var i = 0; i < numBits; i++) {
                carryBit = (this.numberOne[i] + this.numberTwo[i]) > 1 ? 1 : 0;
                if (carryBit === 1) {
                    haveCarry = true;
                    break;
                }
            }
            if (!haveCarry) {
                carryBit = 0;
                var randomIndex = this.utilities.pickNumberInRange(0, numBits - 1);
                if (randomIndex > 0) {
                    carryBit = (this.numberOne[randomIndex] + this.numberTwo[randomIndex]) > 1 ? 1 : 0;
                }
                this.numberOne[randomIndex] = 1;
                this.numberTwo[randomIndex] = 1;
                for (var i = randomIndex; i < numBits; i++) {
                    this.correctAnswer[i] = (this.numberOne[i] + this.numberTwo[i] + carryBit) % 2;
                    carryBit = ((this.numberOne[i] + this.numberTwo[i] + carryBit) >= 2) ? 1 : 0;
                }
            }
        }
        // Enforce an addition with 3 1s
        else if (difficulty === 'hard') {
            var haveThreeOnes = false;
            carryBit = 0;
            for (var i = 0; i < numBits; i++) {
                if ((this.numberOne[i] + this.numberTwo[i] + carryBit) === 3) {
                    haveThreeOnes = true;
                    break;
                }
                carryBit = ((this.numberOne[i] + this.numberTwo[i] + carryBit) >= 2) ? 1 : 0;
            }
            if (!haveThreeOnes) {
                var randomIndex = this.utilities.pickNumberInRange(0, numBits - 2);
                carryBit = 0;
                for (var i = 0; i < randomIndex; i++) {
                    carryBit = ((this.numberOne[i] + this.numberTwo[i] + carryBit) >= 2) ? 1 : 0;
                }
                if (carryBit === 1) {
                    this.numberOne[randomIndex] = 1;
                    this.numberTwo[randomIndex] = 1;
                    // Recalculate answer
                    for (var i = randomIndex; i < numBits; i++) {
                        this.correctAnswer[i] = (this.numberOne[i] + this.numberTwo[i] + carryBit) % 2;
                        carryBit = ((this.numberOne[i] + this.numberTwo[i] + carryBit) >= 2) ? 1 : 0;
                    }
                }
                else {
                    this.numberOne[randomIndex] = 1;
                    this.numberTwo[randomIndex] = 1;
                    this.numberOne[randomIndex + 1] = 1;
                    this.numberTwo[randomIndex + 1] = 1;
                    // Recalculate answer
                    for (var i = randomIndex; i < numBits; i++) {
                        this.correctAnswer[i] = (this.numberOne[i] + this.numberTwo[i] + carryBit) % 2;
                        carryBit = ((this.numberOne[i] + this.numberTwo[i] + carryBit) >= 2) ? 1 : 0;
                    }
                }
            }
        }
        carryBit = 0;
        for (var i = 0; i < numBits - 1; i++) {
            carryBit = ((this.numberOne[i] + this.numberTwo[i] + carryBit) >= 2) ? 1 : 0;
            this.correctCarryBits[i] = carryBit;
        }
        carryBit = ((this.numberOne[numBits - 1] + this.numberTwo[numBits - 1] + carryBit) >= 2) ? 1 : 0;
        var self = this;
        this.$firstNum.each(function(i) {
            $(this).text(self.numberOne[self.numberOne.length - 1 - i]);
        });

        this.$secondNum.each(function(i) {
            $(this).text(self.numberTwo[self.numberTwo.length - 1 - i]);
        });
        var firstNumString = '';
        var secondNumString = '';
        for (var i = 0; i < self.numberOne.length; i++) {
            firstNumString = self.numberOne[i] + firstNumString;
            secondNumString = self.numberTwo[i] + secondNumString;
        }
        this.$userPrompt.text('Add ' + parseInt(firstNumString, 2) + ' and ' + parseInt(secondNumString, 2));
        // Has a 5th carry bit
        if (carryBit) {
            this.$userPrompt.text(this.$userPrompt.text() + ' (Ignore 5th carry bit).');
        }
    };

    // Verfies that the answer is correct by matching bit by bit
    this.verifyAnswer = function(userBits, userCarryBits) {
        var passed = true;
        for (var i = 0; i < userBits.length; i++) {
            if (userBits[i] != this.correctAnswer[i]) {
                // Bad answer highlighting
                $(this.$answerBits[this.$answerBits.length - 1 - i]).addClass('wrong-answer');
                passed = false;
            }
        }

        for (var i = 0; i < userCarryBits.length; i++) {
            if (userCarryBits[i] != this.correctCarryBits[i]) {
                $(this.$carryBits[userCarryBits.length - 1 - i]).addClass('wrong-answer');
                passed = false;
            }
        }
        return passed;
    };


    <%= grunt.file.read(hbs_output) %>
}

var binaryAdditionExport = {
    create: function() {
        return new BinaryAddition();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = binaryAdditionExport;
