function KMapSimplifiedTerm() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['kMapSimplifiedTerm']({
            id: this.id,
            mintermRow1: this.mintermRow1,
            mintermRow2: this.mintermRow2
        });

        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }

        this.giveAnotherTryWithSameQuestion = false;

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 7,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.makeLevel(0);
                self.$simplifiedTerm.attr('disabled', false);
                self.$simplifiedTerm.focus();
            },
            reset: function() {
                self.makeLevel(0);
                self.$simplifiedTerm.val('');
                self.$simplifiedTerm.attr('disabled', true);
            },
            next: function(currentQuestion) {
                if (!self.giveAnotherTryWithSameQuestion) {
                    self.makeLevel(currentQuestion);
                }
                self.giveAnotherTryWithSameQuestion = false;
                self.$simplifiedTerm.attr('disabled', false);
                self.$simplifiedTerm.val('');
                self.$simplifiedTerm.focus();
            },
            isCorrect: function(currentQuestion) {
                var userInputSimplifiedTerm = self.$simplifiedTerm.val();
                var isAnswerCorrect = false;

                // Build expected terms, e.g., ac + b'c, and array of expected indices, e.g., [1, 5, 6].
                var expectedTerms = '';
                var expectedIndices = [];
                self.expectedAnswers.forEach(function(answer, index) {
                    expectedTerms += answer.term;
                    if ((index + 1) < self.expectedAnswers.length) {
                        expectedTerms += ' + ';
                    }
                    expectedIndices = expectedIndices.concat(answer.indices);
                });

                // Set user and expected answer
                self.progressionTool.userAnswer = userInputSimplifiedTerm;
                self.progressionTool.expectedAnswer = expectedTerms;

                // Disable the user input
                self.$simplifiedTerm.attr('disabled', true);

                // If user input is not valid, then output an explanation of what is valid input
                if (!self.userInputIsValid(userInputSimplifiedTerm)) {
                    self.progressionTool.explanationMessage = 'Not a term or sum-of-terms, e.g., b\'c + ab.';
                    self.giveAnotherTryWithSameQuestion = true;
                }
                else {
                    // Convert user input to k-map indices
                    var userIndices = self.convertUserInputTermToIndices(userInputSimplifiedTerm);

                    // If user input k-map indices are equal to the expected indices, then the user's input is correct
                    if (self.arraysAreEqual(userIndices, expectedIndices)) {
                        isAnswerCorrect = true;
                        self.progressionTool.explanationMessage = 'Correct.';
                    }
                    else {
                        if (self.expectedAnswers.length > 1) {
                            self.progressionTool.explanationMessage = 'The simplified terms are: ' + expectedTerms;
                            self.progressionTool.explanationMessage += '<br/>The blue circle is: ' + self.expectedAnswers[0].term;
                            self.progressionTool.explanationMessage += '<br/>The orange circle is: ' + self.expectedAnswers[1].term;
                        }
                        else {
                            self.progressionTool.explanationMessage = 'The simplified term is: ' + expectedTerms;
                        }
                    }
                }

                return isAnswerCorrect;
            }
        });

        this.initializeTool();
    };

    /*
        K-map's first row of minterms
        |minterm| is the string representation
        |value| is the binary representation
    */
    this.mintermRow1 = [
        { minterm: 'a\' b\' c\'', value: '000' },
        { minterm: 'a\' b\' c', value: '001' },
        { minterm: 'a\' b c', value: '011' },
        { minterm: 'a\' b c\'', value: '010' }
    ];

    /*
        K-map's second row of minterms
        |minterm| is the string representation
        |value| is the binary representation
    */
    this.mintermRow2 = [
        { minterm: 'a b\' c\'', value: '100' },
        { minterm: 'a b\' c', value: '101' },
        { minterm: 'a b c', value: '111' },
        { minterm: 'a b c\'', value: '110' }
    ];

    // Store the total number of minterms
    this.numberOfMinterms = this.mintermRow1.length + this.mintermRow2.length;

    /*
        |expectedAnswers| is an array of expected answers represented as objects, including a |term| and k-map |indices| properties
        For example:
        {
            term: 'ac',
            indices: [5, 6]
        }
        Written in |makeLevel| and read in |isCorrect|
        Each |term| is a string containing one of the expected simplified terms
        Each |indices| is an array of arrays of k-map indices, each associated with |terms|
    */
    this.expectedAnswers = [];

    /*
        Array of simplified three-variable expressions
        Used to generate new problems
        Each element in the array is an object containing two properties: |stringRepresentation| and |kMapIndices|
        |stringRepresentation| - a string storing the two-variable expression
        |kMapIndices| - an array containing the indices in the k-map associated with |stringRepresentation|
    */
    this.threeVariableArray = [
        { stringRepresentation: [ 'a\'b\'c\'', 'a\'c\'b\'', 'b\'c\'a\'', 'b\'a\'c\'', 'c\'a\'b\'', 'c\'b\'a\'' ], kMapIndices: [ 0 ] },
        { stringRepresentation: [ 'a\'b\'c', 'a\'cb\'', 'b\'ca\'', 'b\'a\'c', 'ca\'b\'', 'cb\'a\'' ], kMapIndices: [ 1 ] },
        { stringRepresentation: [ 'a\'bc', 'a\'cb', 'bca\'', 'ba\'c', 'ca\'b', 'cba\'' ], kMapIndices: [ 2 ] },
        { stringRepresentation: [ 'a\'bc\'', 'a\'c\'b', 'bc\'a\'', 'ba\'c\'', 'c\'a\'b', 'c\'ba\'' ], kMapIndices: [ 3 ] },
        { stringRepresentation: [ 'ab\'c\'', 'ac\'b\'', 'b\'c\'a', 'b\'ac\'', 'c\'ab\'', 'c\'b\'a' ], kMapIndices: [ 4 ] },
        { stringRepresentation: [ 'ab\'c', 'acb\'', 'b\'ca', 'b\'ac', 'cab\'', 'cb\'a' ], kMapIndices: [ 5 ] },
        { stringRepresentation: [ 'abc', 'acb', 'bca', 'bac', 'cab', 'cba' ], kMapIndices: [ 6 ] },
        { stringRepresentation: [ 'abc\'', 'ac\'b', 'bc\'a', 'bac\'', 'c\'ab', 'c\'ba' ], kMapIndices: [ 7 ] },
    ];

    // Stores the index of the current three-variable used by the tool.
    // Used to cycle through one-variables.
    this.currentThreeVariableArrayIndex = 0;

    /*
        Array of simplified two-variable expressions
        Used to generate new problems
        Each element in the array is an object containing two properties: |stringRepresentation| and |kMapIndices|
        |stringRepresentation| - a string storing the two-variable expression
        |kMapIndices| - an array containing the indices in the k-map associated with |stringRepresentation|
        |kMapIndicesThatAreNotNeighbors| - an array of indices that are not neighbors of the |kMapIndices| on the k-map
    */
    this.twoVariableArray = [
        { stringRepresentation: [ 'ab', 'ba' ], kMapIndices: [ 6, 7 ], kMapIndicesThatAreNotNeighbors: [ 0, 1 ] },
        { stringRepresentation: [ 'ab\'', 'b\'a' ], kMapIndices: [ 4, 5 ], kMapIndicesThatAreNotNeighbors: [ 2, 3 ] },
        { stringRepresentation: [ 'a\'b', 'ba\'' ], kMapIndices: [ 2, 3 ], kMapIndicesThatAreNotNeighbors: [ 4, 5 ] },
        { stringRepresentation: [ 'a\'b\'', 'b\'a\'' ], kMapIndices: [ 0, 1 ], kMapIndicesThatAreNotNeighbors: [ 6, 7 ] },
        { stringRepresentation: [ 'ac', 'ca' ], kMapIndices: [ 5, 6 ], kMapIndicesThatAreNotNeighbors: [ 0, 3 ] },
        { stringRepresentation: [ 'ac\'', 'c\'a' ], kMapIndices: [ 4, 7 ], kMapIndicesThatAreNotNeighbors: [ 1, 2 ] },
        { stringRepresentation: [ 'a\'c', 'ca\'' ], kMapIndices: [ 1, 2 ], kMapIndicesThatAreNotNeighbors: [ 4, 7 ] },
        { stringRepresentation: [ 'a\'c\'', 'c\'a\'' ], kMapIndices: [ 0, 3 ], kMapIndicesThatAreNotNeighbors: [ 5, 6 ] },
        { stringRepresentation: [ 'bc', 'cb' ], kMapIndices: [ 2, 6 ], kMapIndicesThatAreNotNeighbors: [ 0, 4 ] },
        { stringRepresentation: [ 'bc\'', 'c\'b' ], kMapIndices: [ 3, 7 ], kMapIndicesThatAreNotNeighbors: [ 1, 5 ] },
        { stringRepresentation: [ 'b\'c', 'cb\'' ], kMapIndices: [ 1, 5 ], kMapIndicesThatAreNotNeighbors: [ 3, 7 ] },
        { stringRepresentation: [ 'b\'c\'', 'c\'b\'' ], kMapIndices: [ 0, 4 ], kMapIndicesThatAreNotNeighbors: [ 2, 6 ] }
    ];

    // Stores the index of the current two-variable used by the tool.
    // Used to cycle through two-variables.
    this.currentTwoVariableArrayIndex = 0;

    // Return whether two arrays are equal, meaning have the same values at each element
    // |arr1| and |arr2| are required and arrays
    this.arraysAreEqual = function(arr1, arr2) {
        /*
            if arr1 - arr2 has no elements
            and arr2 - arr1 has no elements,
            then arr1 and arr2 are equal.
        */
        return ($(arr1).not(arr2).length === 0) && ($(arr2).not(arr1).length === 0);
    };

    // Valid if user input is not empty and includes only a, b, c, ', +, or spaces
    // |userInput| is a string and required
    this.userInputIsValid = function(userInput) {
        if (userInput === '') {
            return false;
        }
        else if (!/^[abc'+\s]*$/.test(userInput)) {
            return false;
        }
        return true;
    };

    // Convert a user input simplified term (or sum-of-terms) into the associated array of k-map indices
    // |userInput| is a string and required
    this.convertUserInputTermToIndices = function(userInput) {
        // Remove all whitespace from user input
        userInput = userInput.replace(/\s/g, '');

        // User input may be a sum-of-minterms, e.g., bc + a'b'
        // Split user input into an array of single terms, e.g., bc or a'b'
        var arrayOfUserInputTerms = userInput.split('+');

        var self = this;
        var userInputIndices = [];

        // For each user input term, set the associated indices in |userInputIndices| to 1
        arrayOfUserInputTerms.forEach(function(userTerm) {
            // Loop through one-variable strings and associated indices, and set the associated indices in |userInputIndices| to 1
            self.threeVariableArray.forEach(function(threeVariables) {
                // If the userTerm matches a one-variable string representation, then store the associated indices
                if (threeVariables.stringRepresentation.indexOf(userTerm) !== -1) {
                    userInputIndices = userInputIndices.concat(threeVariables.kMapIndices);
                }
            });

            // Loop through two-variable strings and associated indices, and set the associated indices in |userInputIndices| to 1
            self.twoVariableArray.forEach(function(twoVariables) {
                // If the userTerm matches a two-variable string representation, then store the associated indices
                if (twoVariables.stringRepresentation.indexOf(userTerm) !== -1) {
                    userInputIndices = userInputIndices.concat(twoVariables.kMapIndices);
                }
            });
        });

        return userInputIndices;
    };

    // Randomize the order of the array elements
    // |array| is required and an array
    this.shuffleArray = function(array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;

        // While there remain elements to shuffle
        while (currentIndex > 0) {
            // Randomly pick a remaining element
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // Swap the randomly selected element with the current index element
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    };

    // Cache DOM objects and set event listeners
    this.initializeTool = function() {
        // Cache regularly used DOM objects
        this.$kmapCellsContent = $('#' + this.id + ' .kmap-cell-contents');
        this.$simplifiedTerm = $('#' + this.id + ' .simplified-term');
        this.$circleContainer = $('#' + this.id + ' .circle-drawing-container');

        // Disable user input
        this.$simplifiedTerm.attr('disabled', true);

        // Shuffle the possible one-variable and two-variable arrays
        this.shuffleArray(this.threeVariableArray);
        this.shuffleArray(this.twoVariableArray);

        // Set event listeners
        var self = this;
        this.$simplifiedTerm.keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });

        // Make level
        this.makeLevel(0);
    };

    // The mapping used in circle drawing to associate a color with the respective class
    this.colorToClassMap = {
        'dark-blue': 'border-color-dark-blue',
        'orange':    'border-color-orange'
    };

    /*
        Draw three-variable circle by applying a class based on |index|
        |index| is required and a number between 0 and N - 1, where N is the number of elements in the k-map
        |color| is required and string supported by |colorToClassMap|
    */
    this.drawThreeVariableCircle = function(index, color) {
        var $newCircle = $('<div>');
        $newCircle.addClass('three-variable-circle').addClass('index-' + index).addClass(this.colorToClassMap[color]);
        this.$circleContainer.append($newCircle);
    };

    /*
        Draw two-variable circle by applying a class based on |index1| and |index2|
        |index1| and |index2| are required and numbers between 0 and N - 1, where N is the number of elements in the k-map
        |color| is required and string supported by |colorToClassMap|
    */
    this.drawTwoVariableCircle = function(index1, index2, color) {
        // Assign |smallerIndex| equal to min(index1, index2)
        // Assign |largerIndex| equal to max(index1, index2)
        var smallerIndex = Math.min(index1, index2);
        var largerIndex = Math.max(index1, index2);

        // Two special cases for drawing two-variable circles
        var halfCirclesOnTopRow = (smallerIndex === 0) && (largerIndex === 3);
        var halfCirclesOnBottomRow = (smallerIndex === 4) && (largerIndex === 7);

        // If not a special case, then use a full circle
        // Otherwise, use the half circles
        if (!halfCirclesOnTopRow && !halfCirclesOnBottomRow) {
            var $newCircle = $('<div>');
            $newCircle.addClass('two-variable-circle').addClass('index-' + smallerIndex + '-' + largerIndex).addClass(this.colorToClassMap[color]);
            this.$circleContainer.append($newCircle);
        }
        else {
            var $halfCircleLeft = $('<div>');
            $halfCircleLeft.addClass('two-variable-half-circle-left').addClass('index-' + smallerIndex + '-' + largerIndex).addClass(this.colorToClassMap[color]);
            this.$circleContainer.append($halfCircleLeft);

            var $halfCircleRight = $('<div>');
            $halfCircleRight.addClass('two-variable-half-circle-right').addClass('index-' + smallerIndex + '-' + largerIndex).addClass(this.colorToClassMap[color]);
            this.$circleContainer.append($halfCircleRight);
        }
    };

    // Remove the circle drawings by resetting the class assignments
    this.removeCircleDrawings = function() {
        this.$circleContainer.empty();
    };

    // Assign each k-map element either 1 (if part of the expected k-map indices) or 0 (if not)
    this.printKMapElements = function() {
        var expectedIndices = [];
        this.expectedAnswers.forEach(function(answer) {
            expectedIndices = expectedIndices.concat(answer.indices);
        });

        var self = this;
        this.$kmapCellsContent.each(function(index, kMapElement) {
            var elementValue = 0;
            // If this index is part of the expected k-map indices, then assign 1
            if (expectedIndices.indexOf(index) !== -1) {
                elementValue = 1;
            }
            kMapElement.innerHTML = elementValue;
        });
    };

    // Randomly generate a level, starting from 1 two-variable term, based on |currentQuestionNumber|
    // |currentQuestionNumber| is required and a number
    this.makeLevel = function(currentQuestionNumber) {
        // Reset level
        this.removeCircleDrawings();
        this.expectedAnswers.length = 0;

        // 1 three-variable term, e.g., a'bc
        if (currentQuestionNumber < 1) {
            // Select 1 three-variable term
            var term = this.threeVariableArray[this.currentThreeVariableArrayIndex].stringRepresentation[0];
            var indices = this.threeVariableArray[this.currentThreeVariableArrayIndex].kMapIndices;

            // Set expected answer
            this.expectedAnswers.push({
                term:    term,
                indices: indices
            });

            // Draw circle
            this.drawThreeVariableCircle(indices[0], 'dark-blue');

            // Update incrementer
            this.currentThreeVariableArrayIndex = (this.currentThreeVariableArrayIndex + 1) % this.threeVariableArray.length;
        }
        // 1 two-variable term, e.g., a'b
        else if (currentQuestionNumber < 3) {
            // Select 1 two-variable term
            var term = this.twoVariableArray[this.currentTwoVariableArrayIndex].stringRepresentation[0];
            var indices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

            // Set expected answer
            this.expectedAnswers.push({
                term:    term,
                indices: indices
            });

            // Draw circle
            this.drawTwoVariableCircle(indices[0], indices[1], 'dark-blue');

            // Update incrementer
            this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
        }
        // 1 two-variable and 1 three-variable term, e.g., a'b + ab'c'
        else if (currentQuestionNumber < 5) {
            // Select 1 two-variable term
            var twoVariableTerm = this.twoVariableArray[this.currentTwoVariableArrayIndex].stringRepresentation[0];
            var twoVariableIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

            // Select 1 three-variable term that isn't a neighbor of the two-variable term
            var notNeightborsIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndicesThatAreNotNeighbors;
            var threeVariableTerm = this.threeVariableArray[this.currentThreeVariableArrayIndex].stringRepresentation[0];
            var threeVariableIndex = this.threeVariableArray[this.currentThreeVariableArrayIndex].kMapIndices;
            while (notNeightborsIndices.indexOf(threeVariableIndex[0]) === -1) {
                this.currentThreeVariableArrayIndex = (this.currentThreeVariableArrayIndex + 1) % this.threeVariableArray.length;
                threeVariableTerm = this.threeVariableArray[this.currentThreeVariableArrayIndex].stringRepresentation[0];
                threeVariableIndex = this.threeVariableArray[this.currentThreeVariableArrayIndex].kMapIndices;
            }

            // Draw circles
            this.drawTwoVariableCircle(twoVariableIndices[0], twoVariableIndices[1], 'dark-blue');
            this.drawThreeVariableCircle(threeVariableIndex[0], 'orange');

            // Set expected answers
            this.expectedAnswers.push({
                term:    twoVariableTerm,
                indices: twoVariableIndices
            });
            this.expectedAnswers.push({
                term:    threeVariableTerm,
                indices: threeVariableIndex
            });

            // Update incrementers
            this.currentThreeVariableArrayIndex = (this.currentThreeVariableArrayIndex + 1) % this.threeVariableArray.length;
            this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
        }
        // 2 two-variable terms, e.g., a'b' + b'c'
        else {
            // Select first two-variable term
            var firstTerm = this.twoVariableArray[this.currentTwoVariableArrayIndex].stringRepresentation[0];
            var firstIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

            // Update incrementer
            this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;

            // Select second two-variable term, which has 1 indice the same as the first and 1 indice different
            do {
                var secondTerm = this.twoVariableArray[this.currentTwoVariableArrayIndex].stringRepresentation[0];
                var secondTermIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;
                var secondTermIndice0Same = firstIndices.indexOf(secondTermIndices[0]) !== -1;
                var secondTermIndice1Same = firstIndices.indexOf(secondTermIndices[1]) !== -1;

                // Update incrementer
                this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
            } while ((secondTermIndice0Same && secondTermIndice1Same) || (!secondTermIndice0Same && !secondTermIndice1Same));

            // Draw circles
            this.drawTwoVariableCircle(firstIndices[0], firstIndices[1], 'dark-blue');
            this.drawTwoVariableCircle(secondTermIndices[0], secondTermIndices[1], 'orange');

            // Set expected answers
            this.expectedAnswers.push({
                term:    firstTerm,
                indices: firstIndices
            });
            this.expectedAnswers.push({
                term:    secondTerm,
                indices: secondTermIndices
            });
        }

        // Print k-map element values
        this.printKMapElements();
    };

    // Reset hook for zyWeb to tell tool to reset itself
    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var kMapSimplifiedTermExport = {
    create: function() {
        return new KMapSimplifiedTerm();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = kMapSimplifiedTermExport;
