function WhackAMole() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.rows = 3;
        this.columns = 3;
        this.numQuestions = 6;
        this.indexOffset = 0;

        if (options) {
            if (typeof options['rows'] === 'number') {
                this.rows = options['rows'];
            }
            if (typeof options['cols'] === 'number') {
                this.columns = options['cols'];
            }
            if (typeof options['numQuestions'] === 'number') {
                this.numQuestions = options['numQuestions'];
            }
            if (typeof options['use0Index'] === 'boolean') {
                if (options['use0Index']) {
                    this.indexOffset = 0;
                } else {
                    this.indexOffset = 1;
                }
            }
        }

        // There must be at least 1 row
        this.rows = this.rows >= 1 ? this.rows : 1;

        // There must be at least 1 column
        this.columns = this.columns >= 1 ? this.columns : 1;

        // There must be at least 4 holes
        if ((this.rows * this.columns) < 4) {
            this.rows = 2;
            this.columns = 2;
        }

        // Give a user a retry if they click next without selecting a mole
        this.giveARetry = false;

        // List of mole indexes that are the correct moles to click
        // Written to by makeLevel
        // Read from isCorrect
        this.correctMoleIndexesArray = [];

        // List of moles indexes that are decoy moles
        // Written to by makeLevel
        // Ready from isCorrect
        this.decoyMolesIndexesArray = [];

        this.moleImage = this.parentResource.getResourceURL('mole.png', this.name);

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['whackAMole'](
            {
                id:      this.id,
                rows:    this.rows,
                columns: this.columns
            }
        );

        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: self.numQuestions,
            start: function() {
                self.makeLevel(0);
            },
            reset: function() {
                self.$instructions.text('');
                self.resetHoles();
            },
            next: function(currentQuestion) {
                if (!self.giveARetry) {
                    self.makeLevel(currentQuestion);
                } else {
                    self.$holes.removeClass('disabled');
                    self.giveARetry = false;
                }
            },
            isCorrect: function(currentQuestion) {
                self.$holes.addClass('disabled');

                var explanationMessage = '';
                var userAnswer = '';
                var expectedAnswer = '';
                var isAnswerCorrect = false;

                // if no moles selected, then give a retry
                if (!self.$holes.hasClass('selected')) {
                    self.giveARetry = true;
                    explanationMessage = 'Select a mole.';
                }
                else {
                    isAnswerCorrect = true;

                    var selectedWrongMoles = [];

                    // Mark holes that are selected but wrong as 'wrong'
                    self.$holes.each(function(index, hole) {
                        var $hole = $(hole);
                        if ($hole.hasClass('selected')) {
                            userAnswer += String(index) + ',';

                            // if the selected mole is not one of the correct moles, then the answer is wrong
                            if (self.correctMoleIndexesArray.indexOf(index) === -1) {
                                $hole.addClass('wrong');
                                isAnswerCorrect = false;

                                // Save the wrongly selected moles for the explanation
                                selectedWrongMoles.push(self.stringifyIndexOfMole(index));
                            }
                        }
                    });

                    // Mark correct mole indexes as 'correct' regardless of whether selected
                    self.correctMoleIndexesArray.forEach(function(correctMole) {
                        expectedAnswer += String(correctMole) + ',';
                        self.$holes.eq(correctMole).addClass('selected').addClass('correct');

                        // If any correct mole indexes are not selected, then the answer is wrong
                        if (!self.$holes.eq(correctMole).hasClass('selected')) {
                            isAnswerCorrect = false;
                        }
                    });

                    if (isAnswerCorrect) {
                        explanationMessage = 'Correct.';
                    }
                    else {
                        if (selectedWrongMoles.length === 1) {
                            explanationMessage = 'The red index is ' + selectedWrongMoles[0] + '.';
                        }
                        else {
                            explanationMessage = 'The red indices are ' + selectedWrongMoles[0] + ' and ' + selectedWrongMoles[1] + '.';
                        }
                    }
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         userAnswer,
                    expectedAnswer:     expectedAnswer,
                    isCorrect:          isAnswerCorrect
                };
            }
        });

        // Cache commonly used DOM objects
        this.$instructions = $('#' + this.id + ' .instructions');
        this.$holes = $('#' + this.id + ' .hole');

        // Add event listeners
        this.$holes.click(function(event) {
            self.holeClicked(event);
        });
    };

    // Add a mole to the hole at the specified |index|
    // |index| is required and an integer
    this.addMoleToHole = function(index) {
        this.$holes.eq(index).addClass('mole').removeClass('disabled').css('background-image', 'url(' + this.moleImage + ')');
    };

    // Reset all holes
    this.resetHoles = function() {
        this.$holes.addClass('disabled').removeClass('mole').removeClass('selected').removeClass('correct').removeClass('wrong').css('background-image', '');
    };

    // Handle a click event on a hole
    // |event| is required and is passed from the click event
    this.holeClicked = function(event) {
        var $hole = $(event.target);

        if (!$hole.hasClass('disabled')) {
            $hole.toggleClass('selected');
        }
    };

    // Convert the |index| of the mole into a string with either the format [i] or [i][j] depending on whether the moles are 1D or 2D
    // |index| is a required integer.
    this.stringifyIndexOfMole = function(index) {
        var stringifiedIndex = '';

        // if this.rows is 1, then we're dealing with a 1D array
        // Otherwise, we're dealing with a 2D array
        if (this.rows === 1) {
            stringifiedIndex = '[' + (index + this.indexOffset) + ']';
        } else {
            var row = (Math.floor(index / this.columns)) + this.indexOffset;
            var column = (index % this.columns) + this.indexOffset;
            stringifiedIndex = '[' + row + '][' + column + ']';
        }

        return stringifiedIndex;
    };

    // Generate and print the instructions based on |this.correctMoleIndexesArray|
    this.generateAndPrintInstructions = function() {
        var instructions = 'Select the ';

        if (this.correctMoleIndexesArray.length === 1) {
            instructions += 'element at index ' + this.stringifyIndexOfMole(this.correctMoleIndexesArray[0]) + '.';
        } else {
            // First element in array
            instructions += 'elements at indexes ' + this.stringifyIndexOfMole(this.correctMoleIndexesArray[0]);

            if (this.correctMoleIndexesArray.length === 2) {
                // Second element in array
                instructions += ' and ' + this.stringifyIndexOfMole(this.correctMoleIndexesArray[1]) + '.';
            } else {
                // Second element through second to last element in array
                for (var i = 1; i < (this.correctMoleIndexesArray.length - 1); i++) {
                    instructions += ', ' + this.stringifyIndexOfMole(this.correctMoleIndexesArray[i]);
                }

                // Last element in array
                instructions += ', and ' + this.stringifyIndexOfMole(this.correctMoleIndexesArray[this.correctMoleIndexesArray.length - 1]) + '.';
            }
        }

        this.$instructions.text(instructions);
    };

    // Choose |numberOfMolesThisLevel| moles to be correct
    // |numberOfMolesThisLevel| is required and an integer
    this.chooseMolesForThisLevel = function(numberOfMolesThisLevel) {
        // Reset correctMoleIndexesArray
        this.correctMoleIndexesArray.length = 0;

        var potentialCorrectMoleIndex = Math.floor(Math.random() * this.$holes.length);
        while (this.correctMoleIndexesArray.length < numberOfMolesThisLevel) {
            // If the potential correct mole is not already in the correct mole array, then add it
            if (this.correctMoleIndexesArray.indexOf(potentialCorrectMoleIndex) === -1) {
                this.correctMoleIndexesArray.push(potentialCorrectMoleIndex);
            }

            potentialCorrectMoleIndex = Math.floor(Math.random() * this.$holes.length);
        }
    };

    // Choose |numberOfDecoyMolesThisLevel| moles to be a decoy
    // |numberOfDecoyMolesThisLevel| is required and an integer
    this.chooseDecoyMolesForThisLevel = function(numberOfDecoyMolesThisLevel) {
        this.decoyMolesIndexesArray.length = 0;

        // While not enough decoy moles have been found
        while (this.decoyMolesIndexesArray.length < numberOfDecoyMolesThisLevel) {
            var potentialDecoyMoleIndex = Math.floor(Math.random() * this.$holes.length);

            // If the potential decoy mole is not already in the correct or decoy mole arrays, then add it
            var combinedCorrectAndDecoyMolesIndexes = this.correctMoleIndexesArray.concat(this.decoyMolesIndexesArray);
            if (combinedCorrectAndDecoyMolesIndexes.indexOf(potentialDecoyMoleIndex) === -1) {
                this.decoyMolesIndexesArray.push(potentialDecoyMoleIndex);
            }
        }
    };

    // Display the correct and decoy moles
    this.displayCorrectAndDecoyMoles = function() {
        // Combine correct and decoy moles into 1 array
        var combinedCorrectAndDecoyMolesIndexes = this.decoyMolesIndexesArray.concat(this.correctMoleIndexesArray);

        var self = this;
        combinedCorrectAndDecoyMolesIndexes.forEach(function(moleIndex) {
            self.addMoleToHole(moleIndex);
        });
    }

    // Display instructions and options to user.
    // |currentQuestionNumber| is required and is a number
    this.makeLevel = function(currentQuestionNumber) {
        this.resetHoles();

        if (currentQuestionNumber < 4) {
            // pick 1 correct mole
            this.chooseMolesForThisLevel(1);
        } else {
            // pick 2 correct mole
            this.chooseMolesForThisLevel(2);
        }

        // pick 2 decoy moles
        this.chooseDecoyMolesForThisLevel(2);

        this.displayCorrectAndDecoyMoles();
        this.generateAndPrintInstructions();
    };

    <%= grunt.file.read(hbs_output) %>
}

var whackAMoleExport = {
    create: function() {
        return new WhackAMole();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};

module.exports = whackAMoleExport;
