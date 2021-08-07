function KMapAddCircles() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }

        /**
            Whether to use two variables. If false, use three variables.
            @property useTwoVariables
            @type {Boolean}
        */
        this.useTwoVariables = options && options.useTwoVariables;

        if (this.useTwoVariables) {
            this.mintermRow1 = [
                { minterm: 'a\' b\'', value: '00' },
                { minterm: 'a\' b', value: '01' },
            ];

            this.mintermRow2 = [
                { minterm: 'a b\'', value: '10' },
                { minterm: 'a b', value: '11' },
            ];

            this.oneVariableArray = [
                {
                    stringRepresentation: [ 'a' ],
                    kMapIndices: [ 2, 3 ], // eslint-disable-line no-magic-numbers
                    termReductionSteps: 'ab + ab\'<br>a(b + b\')<br>a(1)<br>a',
                },
                {
                    stringRepresentation: [ 'a\'' ],
                    kMapIndices: [ 0, 1 ],
                    termReductionSteps: 'a\'b + a\'b\'<br>a\'(b + b\')<br>a\'(1)<br>a\'',
                },
                {
                    stringRepresentation: [ 'b' ],
                    kMapIndices: [ 1, 3 ], // eslint-disable-line no-magic-numbers
                    termReductionSteps: 'ab + a\'b<br>b(a + a\')<br>b(1)<br>b',
                },
                {
                    stringRepresentation: [ 'b\'' ],
                    kMapIndices: [ 0, 2 ], // eslint-disable-line no-magic-numbers
                    termReductionSteps: 'ab\' + a\'b\'<br>b\'(a + a\')<br>b\'(1)<br>b\'',
                },
            ];

            this.twoVariableArray = [
                { stringRepresentation: [ 'a\'b\'' ], kMapIndices: [ 0 ] },
                { stringRepresentation: [ 'a\'b' ], kMapIndices: [ 1 ] },
                { stringRepresentation: [ 'ab\'' ], kMapIndices: [ 2 ] }, // eslint-disable-line no-magic-numbers
                { stringRepresentation: [ 'ab' ], kMapIndices: [ 3 ] }, // eslint-disable-line no-magic-numbers
            ];
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['kMapAddCircles']({
            mintermRow1: this.mintermRow1,
            mintermRow2: this.mintermRow2,
            useTwoVariables: this.useTwoVariables,
        });

        this.giveAnotherTryWithSameQuestion = false;

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.useTwoVariables ? 3 : 7,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.makeLevel(0);
                self.enableInteractiveElements();
            },
            reset: function() {
                self.makeLevel(0);
                self.disableInteractiveElements();
            },
            next: function(currentQuestion) {
                if (!self.giveAnotherTryWithSameQuestion) {
                    self.makeLevel(currentQuestion);
                }
                self.giveAnotherTryWithSameQuestion = false;
                self.enableInteractiveElements();
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                self.disableInteractiveElements();

                var userEnteredArrayOfTerms = self.convertFromArrayOfCirclesToArrayOfTerms(self.userEnteredCircles);
                var expectedArrayOfTerms = self.convertFromArrayOfCirclesToArrayOfTerms(self.expectedCircles);

                // Set user and expected answer
                self.progressionTool.userAnswer = userEnteredArrayOfTerms.join(' + ');
                self.progressionTool.expectedAnswer = expectedArrayOfTerms.join(' + ');

                // If user did not make a circle, then give directions
                if (userEnteredArrayOfTerms.length === 0) {
                    self.progressionTool.explanationMessage = 'Select cells then click Add circle.';
                    self.giveAnotherTryWithSameQuestion = true;
                }
                else {
                    if (self.arraysAreEqual(userEnteredArrayOfTerms, expectedArrayOfTerms)) {
                        self.progressionTool.explanationMessage = 'Correct.';
                        isAnswerCorrect = true;
                    }
                    else {
                        self.progressionTool.explanationMessage = 'Use the fewest and largest possible circle(s) that contains only 1s.';

                        // Draw missing circles in green
                        var hadMissingCircle = false;
                        self.expectedCircles.forEach(function(expectedCircle) {
                            var seenInUserEnteredCircles = false;

                            self.userEnteredCircles.forEach(function(userEnteredCircle) {
                                if (self.arraysAreEqual(expectedCircle, userEnteredCircle)) {
                                    seenInUserEnteredCircles = true;
                                }
                            });

                            if (!seenInUserEnteredCircles) {
                                self.drawCircle(expectedCircle, 'green');
                                hadMissingCircle = true;
                            }
                        });
                        if (hadMissingCircle) {
                            self.progressionTool.explanationMessage += '<br>Missing circle(s) shown in light green.';
                        }

                        // Draw incorrect circles in red
                        var hadExtraCircles = false;
                        self.userEnteredCircles.forEach(function(userEnteredCircle) {
                            var seenInExpectedCircles = false;

                            self.expectedCircles.forEach(function(expectedCircle) {
                                if (self.arraysAreEqual(expectedCircle, userEnteredCircle)) {
                                    seenInExpectedCircles = true;
                                }
                            });

                            if (!seenInExpectedCircles) {
                                self.drawCircle(userEnteredCircle, 'medium-red');
                                hadExtraCircles = true;
                            }
                        });
                        if (hadExtraCircles) {
                            self.progressionTool.explanationMessage += '<br>Incorrect circle(s) shown in red.';
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
        |expectedCircles| is an array of expected circles.
        An expected circle is an array of k-map indices, e.g., [5, 6] for ac.
        Written in |makeLevel| and read in |isCorrect|
    */
    this.expectedCircles = [];

    // Convert an array of circles to an array of terms
    // |arrayOfCircles| is required and an array of k-map indices
    this.convertFromArrayOfCirclesToArrayOfTerms = function(arrayOfCircles) {
        const arrayOfTerms = [];

        arrayOfCircles.forEach(kMapIndices => {
            if (kMapIndices.length === 1) {
                const arrayToUse = this.useTwoVariables ? this.twoVariableArray : this.threeVariableArray;

                arrayToUse.forEach(variable => {
                    if (this.arraysAreEqual(variable.kMapIndices, kMapIndices)) {
                        arrayOfTerms.push(variable.stringRepresentation[0]);
                    }
                });
            }
            else if (kMapIndices.length === 2) { // eslint-disable-line no-magic-numbers
                const arrayToUse = this.useTwoVariables ? this.oneVariableArray : this.twoVariableArray;

                arrayToUse.forEach(variable => {
                    if (this.arraysAreEqual(variable.kMapIndices, kMapIndices)) {
                        arrayOfTerms.push(variable.stringRepresentation[0]);
                    }
                });
            }
            else if ((kMapIndices.length === 4) && !this.useTwoVariables) { // eslint-disable-line no-magic-numbers
                this.oneVariableArray.forEach(oneVariable => {
                    if (this.arraysAreEqual(oneVariable.kMapIndices, kMapIndices)) {
                        arrayOfTerms.push(oneVariable.stringRepresentation[0]);
                    }
                });
            }
            else if ((kMapIndices.length === 8) || (this.useTwoVariables && (kMapIndices.length === 4))) { // eslint-disable-line no-magic-numbers
                arrayOfTerms.push('1');
            }
        });

        return arrayOfTerms;
    };

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
        Each element in the array is an object containing three properties:
        |stringRepresentation| - a string storing the two-variable expression
        |kMapIndices| - an array containing the indices in the k-map associated with |stringRepresentation|
        |kMapIndicesThatAreNotNeighbors| - an array of indices that are not neighbors of the |kMapIndices| on the k-map
    */
    this.twoVariableArray = [
        { stringRepresentation: [ 'ab', 'ba' ], kMapIndices: [ 6, 7 ], kMapIndicesThatAreNotNeighbors: [ 0, 1 ], termReductionSteps: 'abc + abc\'<br>ab(c + c\')<br>ab(1)<br>ab' },
        { stringRepresentation: [ 'ab\'', 'b\'a' ], kMapIndices: [ 4, 5 ], kMapIndicesThatAreNotNeighbors: [ 2, 3 ], termReductionSteps: 'ab\'c + ab\'c<br>ab\'(c + c\')<br>ab\'(1)<br>ab\'' },
        { stringRepresentation: [ 'a\'b', 'ba\'' ], kMapIndices: [ 2, 3 ], kMapIndicesThatAreNotNeighbors: [ 4, 5 ], termReductionSteps: 'a\'bc + a\'b\'c<br>a\'b(c + c\')<br>a\'b(1)<br>a\'b' },
        { stringRepresentation: [ 'a\'b\'', 'b\'a\'' ], kMapIndices: [ 0, 1 ], kMapIndicesThatAreNotNeighbors: [ 6, 7 ], termReductionSteps: 'a\'b\'c + a\'b\'c<br>a\'b\'(c + c\')<br>a\'b\'(1)<br>a\'b\'' },
        { stringRepresentation: [ 'ac', 'ca' ], kMapIndices: [ 5, 6 ], kMapIndicesThatAreNotNeighbors: [ 0, 3 ], termReductionSteps: 'abc + ab\'c<br>ac(b + b\')<br>ac(1)<br>ac' },
        { stringRepresentation: [ 'ac\'', 'c\'a' ], kMapIndices: [ 4, 7 ], kMapIndicesThatAreNotNeighbors: [ 1, 2 ], termReductionSteps: 'abc\' + ab\'c\'<br>ac\'(b + b\')<br>ac\'(1)<br>ac\'' },
        { stringRepresentation: [ 'a\'c', 'ca\'' ], kMapIndices: [ 1, 2 ], kMapIndicesThatAreNotNeighbors: [ 4, 7 ], termReductionSteps: 'a\'bc + a\'b\'c<br>a\'c(b + b\')<br>a\'c(1)<br>a\'c' },
        { stringRepresentation: [ 'a\'c\'', 'c\'a\'' ], kMapIndices: [ 0, 3 ], kMapIndicesThatAreNotNeighbors: [ 5, 6 ], termReductionSteps: 'a\'bc\' + a\'b\'c\'<br>a\'c\'(b + b\')<br>a\'c\'(1)<br>a\'c\'' },
        { stringRepresentation: [ 'bc', 'cb' ], kMapIndices: [ 2, 6 ], kMapIndicesThatAreNotNeighbors: [ 0, 4 ], termReductionSteps: 'abc + a\'bc<br>bc(a + a\')<br>bc(1)<br>bc' },
        { stringRepresentation: [ 'bc\'', 'c\'b' ], kMapIndices: [ 3, 7 ], kMapIndicesThatAreNotNeighbors: [ 1, 5 ], termReductionSteps: 'abc\' + a\'bc\'<br>bc\'(a + a\')<br>bc\'(1)<br>bc\'' },
        { stringRepresentation: [ 'b\'c', 'cb\'' ], kMapIndices: [ 1, 5 ], kMapIndicesThatAreNotNeighbors: [ 3, 7 ], termReductionSteps: 'ab\'c + a\'b\'c<br>b\'c(a + a\')<br>b\'c(1)<br>b\'c' },
        { stringRepresentation: [ 'b\'c\'', 'c\'b\'' ], kMapIndices: [ 0, 4 ], kMapIndicesThatAreNotNeighbors: [ 2, 6 ], termReductionSteps: 'ab\'c\' + a\'b\'c\'<br>b\'c\'(a + a\')<br>b\'c\'(1)<br>b\'c\'' }
    ];

    // Stores the index of the current two-variable used by the tool.
    // Used to cycle through two-variables.
    this.currentTwoVariableArrayIndex = 0;

    /*
        Array of simplified one-variable expressions
        Used to generate new problems
        Each element in the array is an object containing two properties:
        |stringRepresentation| - a string storing the two-variable expression
        |kMapIndices| - an array containing the indices in the k-map associated with |stringRepresentation|
    */
    this.oneVariableArray = [
        { stringRepresentation: [ 'a' ], kMapIndices: [ 4, 5, 6, 7 ], termReductionSteps: 'abc + abc\' + ab\'c + ab\'c\'<br>ab(c + c\') + ab\'(c + c\')<br>ab(1) + ab\'(1)<br>ab + ab\'<br>a(b + b\')<br>a(1)<br>a' },
        { stringRepresentation: [ 'a\'' ], kMapIndices: [ 0, 1, 2, 3 ], termReductionSteps: 'a\'bc + a\'bc\' + a\'b\'c + a\'b\'c\'<br>a\'b(c + c\') + a\'b\'(c + c\')<br>a\'b(1) + a\'b\'(1)<br>a\'b + a\'b\'<br>a\'(b + b\')<br>a\'(1)<br>a\'' },
        { stringRepresentation: [ 'b' ], kMapIndices: [ 2, 3, 6, 7 ], termReductionSteps: 'abc + abc\' + a\'bc + a\'bc\'<br>ab(c + c\') + a\'b(c + c\')<br>ab(1) + a\'b(1)<br>ab + a\'b<br>b(a + a\')<br>b(1)<br>b' },
        { stringRepresentation: [ 'b\'' ], kMapIndices: [ 0, 1, 4, 5 ], termReductionSteps: 'ab\'c + ab\'c\' + a\'b\'c + a\'b\'c\'<br>ab\'(c + c\') + a\'b\'(c + c\')<br>ab\'(1) + a\'b\'(1)<br>ab\' + a\'b\'<br>b\'(a + a\')<br>b\'(1)<br>b\'' },
        { stringRepresentation: [ 'c' ], kMapIndices: [ 1, 2, 5, 6 ], termReductionSteps: 'abc + ab\'c + a\'bc + a\'b\'c<br>ac(b + b\') + a\'c(b + b\')<br>ac(1) + a\'c(1)<br>ac + a\'c<br>c(a + a\')<br>c(1)<br>c' },
        { stringRepresentation: [ 'c\'' ], kMapIndices: [ 0, 3, 4, 7 ], termReductionSteps: 'abc\' + ab\'c\' + a\'bc\' + a\'b\'c\'<br>ac\'(b + b\') + a\'c\'(b + b\')<br>ac\'(1) + a\'c\'(1)<br>ac\' + a\'c\'<br>c\'(a + a\')<br>c\'(1)<br>c\'' },
    ];

    // Stores the index of the current one-variable used by the tool.
    // Used to cycle through one-variables.
    this.currentOneVariableArrayIndex = 0;

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

    // Disable all interactive elements
    this.disableInteractiveElements = function() {
        this.$addCircle.attr('disabled', true).addClass('disabled');
        this.$undo.attr('disabled', true).addClass('disabled');
        this.$kMapCells.addClass('disabled').removeClass('selected');
    };

    // Enable all interactive elements
    this.enableInteractiveElements = function() {
        this.$kMapCells.removeClass('disabled');
    };

    // Cache DOM objects and set event listeners
    this.initializeTool = function() {
        // Cache regularly used DOM objects
        this.$thisTool = $('#' + this.id);
        this.$kMapCells = this.$thisTool.find('.kmap-cell');
        this.$kmapCellsContent = this.$thisTool.find('.kmap-cell-contents');
        this.$circleContainer = this.$thisTool.find('.circle-drawing-container');
        this.$addCircle = this.$thisTool.find('.add-circle');
        this.$undo = this.$thisTool.find('.undo');
        this.$feedbackMessage = this.$thisTool.find('.feedback-message');

        this.$feedbackMessage.hide();

        // Shuffle the possible one-variable and two-variable arrays
        this.shuffleArray(this.threeVariableArray);
        this.shuffleArray(this.twoVariableArray);

        // Disable buttons
        this.disableInteractiveElements();

        // Set event listeners
        var self = this;
        this.$kMapCells.click(function() {
            var $this = $(this);
            if (!$this.hasClass('disabled')) {
                self.kmapCellClicked($this);
            }
        });
        this.$addCircle.click(function() {
            self.addCircleFromSelectedCells();
        });
        this.$undo.click(function() {
            self.undo();
        });

        // Make level
        this.makeLevel(0);
    };

    // Update whether Add circle button should be enabled or disabled based on number of selected cells
    // If number of selected cells more than 0, then Add circle should be enabled
    // Otherwise, Add circle should be disabled
    this.updateAddCircleButtonEnabledOrDisabled = function() {
        var selectedCells = this.returnSelectedCellsAsArrayOfIndices();
        if (selectedCells.length > 0) {
            this.$addCircle.attr('disabled', false).removeClass('disabled');
        }
        else {
            this.$addCircle.attr('disabled', true).addClass('disabled');
        }
    };

    // Remove selection highlight from each cell and disabled Add circle button
    this.clearSelectedCells = function() {
        this.$kMapCells.removeClass('selected');
        this.$addCircle.attr('disabled', true).addClass('disabled');
    };

    // Toggle the visibility of the clicked |$kmapCell|'s contents
    // |$kmapCell| is a required jQuery object
    this.kmapCellClicked = function($kMapCell) {
        if ($kMapCell.hasClass('selected')) {
            $kMapCell.removeClass('selected');
        } else {
            $kMapCell.addClass('selected');
        }

        this.updateAddCircleButtonEnabledOrDisabled();
    };

    // Return an array of selected cell's k-map indices
    this.returnSelectedCellsAsArrayOfIndices = function() {
        var arrayOfSelectedCellsByIndex = [];
        this.$kMapCells.each(function(index, kMapCell) {
            if ($(kMapCell).hasClass('selected')) {
                arrayOfSelectedCellsByIndex.push(index);
            }
        });
        return arrayOfSelectedCellsByIndex;
    };

    // Circles that the user entered
    // Array of array of circle's indices, e.g.,
    this.userEnteredCircles = [];

    // Return the index of |arrayToFind| in |arrayOfArrays|
    // Return -1 if |arrayToFind is not in |arrayOfArrays|
    this.indexOfArrayInArray = function(arrayOfArrays, arrayToFind) {
        var indexOfArrayToFind = -1;
        var self = this;
        arrayOfArrays.forEach(function(subArray, index) {
            if (self.arraysAreEqual(subArray, arrayToFind)) {
                indexOfArrayToFind = index;
            }
        });
        return indexOfArrayToFind;
    };

    // Output a feedback message. Message lasts until the user mousedowns.
    // |feedbackMessage| is a required string
    // |isAnExplanation| is an optional boolean. Default is false. If true, then text color is blue. Otherwise, text color is red.
    this.outputFeedbackMessage = function(feedbackMessage, isAnExplanation) {
        this.$feedbackMessage.html(feedbackMessage).fadeIn();

        var self = this;
        this.$thisTool.mousedown(function() {
            self.$thisTool.unbind('mousedown');
            self.$feedbackMessage.stop(true, true).fadeOut();
        });

        if (isAnExplanation) {
            this.$feedbackMessage.addClass('display-explanation-message').removeClass('display-error-message');
        }
        else {
            this.$feedbackMessage.addClass('display-error-message').removeClass('display-explanation-message');
        }
    };

    // Add a circle based on the selected cells
    // If the selected cells describe an invalid circle, then inform user of specific mistake
    this.addCircleFromSelectedCells = function() {
        var selectedCellIndices = this.returnSelectedCellsAsArrayOfIndices();
        var numberOfSelectedCells = selectedCellIndices.length;
        var wasCircledAdded = false;
        var termReductionSteps = '';

        // If no circles selected, then inform user of how to do so
        if (numberOfSelectedCells === 0) {
            this.outputFeedbackMessage('Create a circle by selecting cells then clicking Add circle.');
        }
        // If a circle already exists for |selectedCellIndices|, then inform user that circle already exists.
        else if (this.indexOfArrayInArray(this.userEnteredCircles, selectedCellIndices) !== -1) {
            var feedbackMessage = 'Circle already exists for selected cell';
            if (selectedCellIndices.length > 1) {
                feedbackMessage += 's';
            }
            this.outputFeedbackMessage(feedbackMessage + '.');
        }
        // If 1 cell selected, then add that circle
        else if (numberOfSelectedCells === 1) {
            var self = this;
            const arrayToUse = this.useTwoVariables ? this.twoVariableArray : this.threeVariableArray;

            arrayToUse.forEach(function(threeVariable) {
                if (self.arraysAreEqual(threeVariable.kMapIndices, selectedCellIndices)) {
                    termReductionSteps = threeVariable.stringRepresentation[0];
                }
            });
            wasCircledAdded = true;
        }
        // If 2 cells selected, then add circle if |selectedCellIndices| is one of the |kMapIndices| in |this.twoVariableArray|
        else if (numberOfSelectedCells === 2) {
            const arrayToUse = this.useTwoVariables ? this.oneVariableArray : this.twoVariableArray;

            arrayToUse.forEach(variable => {
                if (this.arraysAreEqual(variable.kMapIndices, selectedCellIndices)) {
                    termReductionSteps = variable.stringRepresentation[0];
                    wasCircledAdded = true;
                }
            });

            if (!wasCircledAdded) {
                this.outputFeedbackMessage('Invalid circle. Valid circles have adjacent cells.');
            }
        }
        else if ((numberOfSelectedCells === 4) && !this.useTwoVariables) { // eslint-disable-line no-magic-numbers
            var validCircle = false;
            var self = this;
            this.oneVariableArray.forEach(function(oneVariable) {
                if (self.arraysAreEqual(oneVariable.kMapIndices, selectedCellIndices)) {
                    validCircle = true;
                    termReductionSteps = oneVariable.termReductionSteps;
                }
            });

            if (validCircle) {
                wasCircledAdded = true;
            }
            else {
                this.outputFeedbackMessage('Invalid circle. Valid circles form an adjacent square or rectangle of cells.');
            }
        }
        else if ((numberOfSelectedCells === 8) || (this.useTwoVariables && (numberOfSelectedCells === 4))) { // eslint-disable-line no-magic-numbers
            wasCircledAdded = true;
            termReductionSteps = '1';
        }
        // If the number of selected cells are not either 1, 2, 4, or 8, then inform user of correct number of selected cells.
        else {
            const endMessage = this.useTwoVariables ? 'or 4' : '4, or 8';

            this.outputFeedbackMessage(`Invalid circle. Valid circles can contain 1, 2, ${endMessage} cells.`);
        }

        // If the circle was added, then add the selected cells to |userEnteredCircles| then deselect all cells
        if (wasCircledAdded) {
            this.drawCircle(selectedCellIndices.slice(), 'dark-blue');
            this.userEnteredCircles.push(selectedCellIndices);
            this.clearSelectedCells();
            this.$undo.attr('disabled', false).removeClass('disabled');
            this.outputFeedbackMessage('Circle<br>' + termReductionSteps, true);
        }
    };

    // Remove circles, then draw circles from |this.userSelectedCircles|
    this.redrawCircles = function() {
        this.removeCircleDrawings();

        var self = this;
        this.userEnteredCircles.forEach(function(circleIndices) {
            self.drawCircle(circleIndices, 'dark-blue');
        });
    };

    // Undo by removing the last drawn circle, then re-drawing
    this.undo = function() {
        this.clearSelectedCells();
        this.userEnteredCircles.pop();
        this.redrawCircles();

        if (this.userEnteredCircles.length === 0) {
            this.$undo.attr('disabled', true).addClass('disabled');
        }
    };

    // The mapping used in circle drawing to associate a color with the respective class
    this.colorToClassMap = {
        'dark-blue':  'border-color-dark-blue',
        'orange':     'border-color-orange',
        'medium-red': 'border-color-medium-red',
        'green':      'border-color-green'
    };

    // Draw a circle with given |indices| and colored as |color|
    // |indices| is a required array of numbers
    // |color| is a required string
    this.drawCircle = function(indices, color) {
        var circleDrawn = [];
        if (indices.length === 1) {
            circleDrawn = this.drawThreeVariableCircle(indices, color);
        }
        else if (indices.length === 2) {
            circleDrawn = this.drawTwoVariableCircle(indices, color);
        }
        else if (indices.length === 4) {
            circleDrawn = this.drawOneVariableCircle(indices, color);
        }
        else if (indices.length === 8) {
            circleDrawn = this.drawZeroVariableCircle(color);
        }
        return circleDrawn;
    };

    /*
        Draw three-variable circle by applying a class based on |indices|
        |indices| is required and an array with one number between 0 and N - 1, where N is the number of elements in the k-map
        |color| is required and string supported by |colorToClassMap|
    */
    this.drawThreeVariableCircle = function(indices, color) {
        const mapUseTwoToUseThreeVariables = { 0: 0, 1: 1, 2: 4, 3: 5 };
        const index = this.useTwoVariables ? mapUseTwoToUseThreeVariables[indices[0]] : indices[0];
        const $newCircle = $('<div>');

        $newCircle.addClass('three-variable-circle').addClass('index-' + index).addClass(this.colorToClassMap[color]);
        this.$circleContainer.append($newCircle);
        return $newCircle;
    };

    /*
        Draw two-variable circle by applying a class based on |indices|
        |indices| is required and an array of two numbers, each number between 0 and N - 1, where N is the number of elements in the k-map
        |color| is required and string supported by |colorToClassMap|
    */
    this.drawTwoVariableCircle = function(indices, color) {
        let $drawnCircle = null;
        let indicesToUse = indices;

        indicesToUse.sort();

        if (this.useTwoVariables) {

            // Map the indices from 2 to 3 variable k-map. a' does not need to be mapped since indices don't change.
            const aIndices = [ 2, 3 ]; // eslint-disable-line no-magic-numbers
            const bIndices = [ 1, 3 ]; // eslint-disable-line no-magic-numbers
            const notBIndices = [ 0, 2 ]; // eslint-disable-line no-magic-numbers

            if (this.arraysAreEqual(indices, aIndices)) {
                indicesToUse[0] = 4; // eslint-disable-line no-magic-numbers
                indicesToUse[1] = 5; // eslint-disable-line no-magic-numbers
            }
            else if (this.arraysAreEqual(indices, bIndices)) {
                indicesToUse[1] = 5; // eslint-disable-line no-magic-numbers
            }
            else if (this.arraysAreEqual(indices, notBIndices)) {
                indicesToUse[1] = 4; // eslint-disable-line no-magic-numbers
            }

            $drawnCircle = $('<div>');
            $drawnCircle.addClass('two-variable-circle');
            this.$circleContainer.append($drawnCircle);
        }
        else {

            // Two special cases for drawing two-variable circles
            const halfCirclesOnTopRow = (indicesToUse[0] === 0) && (indicesToUse[1] === 3); // eslint-disable-line no-magic-numbers
            const halfCirclesOnBottomRow = (indicesToUse[0] === 4) && (indicesToUse[1] === 7); // eslint-disable-line no-magic-numbers

            // If not a special case, then use a full circle
            // Otherwise, use the half circles
            if (!halfCirclesOnTopRow && !halfCirclesOnBottomRow) {
                $drawnCircle = $('<div>');
                $drawnCircle.addClass('two-variable-circle');
                this.$circleContainer.append($drawnCircle);
            }
            else {
                const $halfCircleLeft = $('<div>');
                const $halfCircleRight = $('<div>');

                $halfCircleLeft.addClass('two-variable-half-circle-left');
                $halfCircleRight.addClass('two-variable-half-circle-right');

                this.$circleContainer.append($halfCircleLeft);
                this.$circleContainer.append($halfCircleRight);

                $drawnCircle = $.merge($halfCircleLeft, $halfCircleRight);
            }
        }

        $drawnCircle.addClass(this.colorToClassMap[color])
                    .addClass(`index-${indicesToUse[0]}-${indicesToUse[1]}`);

        return $drawnCircle;
    };

    /*
        Draw one-variable circle by applying a class based on |indices|
        |indices| are required and numbers between 0 and N - 1, where N is the number of elements in the k-map
        |color| is required and string supported by |colorToClassMap|
    */
    this.drawOneVariableCircle = function(indices, color) {
        let $drawnCircle = null;
        let indicesToUse = indices;

        // 3-variable k-map indices for c'.
        const cPrimeArray = [ 0, 3, 4, 7 ]; // eslint-disable-line no-magic-numbers

        indicesToUse.sort();

        if (this.useTwoVariables) {
            $drawnCircle = $('<div>');
            $drawnCircle.addClass('one-variable-circle');
            this.$circleContainer.append($drawnCircle);
            indicesToUse = [ 0, 1, 4, 5 ]; // eslint-disable-line no-magic-numbers
        }

        // Special case if indices to draw are c': Draw two half circles.
        else if (this.arraysAreEqual(indicesToUse, cPrimeArray)) {
            const $halfCircleLeft = $('<div>');
            const $halfCircleRight = $('<div>');

            $halfCircleLeft.addClass('one-variable-half-circle-left');
            $halfCircleRight.addClass('one-variable-half-circle-right');

            this.$circleContainer.append($halfCircleLeft);
            this.$circleContainer.append($halfCircleRight);

            $drawnCircle = $.merge($halfCircleLeft, $halfCircleRight);
        }

        // If not the special case, then draw 1 circle.
        else {
            $drawnCircle = $('<div>');
            $drawnCircle.addClass('one-variable-circle');
            this.$circleContainer.append($drawnCircle);
        }

        $drawnCircle.addClass(`index-${indicesToUse[0]}-${indicesToUse[1]}-${indicesToUse[2]}-${indicesToUse[3]}`)
                    .addClass(this.colorToClassMap[color]);

        return $drawnCircle;
    };

    /*
        Draw zero-variable circle by applying a class
        |color| is required and string supported by |colorToClassMap|
    */
    this.drawZeroVariableCircle = function(color) {
        var $newCircle = $('<div>');
        $newCircle.addClass('zero-variable-circle').addClass(this.colorToClassMap[color]).show();
        this.$circleContainer.append($newCircle);
        return $newCircle;
    };

    // Remove the circle drawings by resetting the class assignments
    this.removeCircleDrawings = function() {
        this.$circleContainer.empty();
    };

    // Assign each k-map element either 1 (if part of the expected k-map indices) or 0 (if not)
    this.printKMapElements = function() {
        var expectedIndices = [];
        this.expectedCircles.forEach(function(circle) {
            expectedIndices = expectedIndices.concat(circle);
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
        this.expectedCircles.length = 0;
        this.userEnteredCircles.length = 0;

        if (this.useTwoVariables) {
            switch (currentQuestionNumber) {

                // 1 two-variable term, e.g., ab.
                case 0: {

                    // Select 1 two-variable term.
                    const indices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

                    // Set expected answer.
                    this.expectedCircles.push(indices);

                    // Update incrementer.
                    this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
                    break;
                }

                // 2 two-variable terms, i.e., ab + a'b' or a'b + ab'
                case 1: {

                    // Select a two-variable term.
                    const indices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;
                    const nonNeighbors = {
                        0: 3,
                        1: 2,
                        2: 1,
                        3: 0,
                    };

                    // Set expected answers.
                    this.expectedCircles.push(indices, [ nonNeighbors[indices[0]] ]);

                    // Run forward until the next question is not the same as the current question.
                    let nextIndex = null;
                    let sameAsCurrentIndices = null;

                    do {
                        this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;

                        nextIndex = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices[0];
                        sameAsCurrentIndices = this.expectedCircles.some(circleIndices => circleIndices[0] === nextIndex); // eslint-disable-line no-loop-func
                    } while (sameAsCurrentIndices);
                    break;
                }

                // 1 one-variable term, e.g., a.
                case 2: { // eslint-disable-line no-magic-numbers

                    // Select 2 two-variable term.
                    const indices = this.oneVariableArray[this.currentOneVariableArrayIndex].kMapIndices;

                    // Set expected answer
                    this.expectedCircles.push(indices);

                    // Update incrementer
                    this.currentOneVariableArrayIndex = (this.currentOneVariableArrayIndex + 1) % this.oneVariableArray.length;
                    break;
                }

                default:
                    throw Error('Undefined level');
            }
        }
        else {

            // 1 three-variable term, e.g., a'bc
            if (currentQuestionNumber < 1) {
                // Select 1 three-variable term
                var indices = this.threeVariableArray[this.currentThreeVariableArrayIndex].kMapIndices;

                // Set expected answer
                this.expectedCircles.push(indices);

                // Update incrementer
                this.currentThreeVariableArrayIndex = (this.currentThreeVariableArrayIndex + 1) % this.threeVariableArray.length;
            }
            // 1 two-variable term, e.g., a'b
            else if (currentQuestionNumber < 3) {
                // Select 1 two-variable term
                var indices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

                // Set expected answer
                this.expectedCircles.push(indices);

                // Update incrementer
                this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
            }
            // 1 two-variable and 1 three-variable term, e.g., a'b + ab'c'
            else if (currentQuestionNumber < 5) {
                // Select 1 two-variable ter,
                var twoVariableIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

                // Select 1 three-variable term that isn't a neighbor of the two-variable term
                var notNeightborsIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndicesThatAreNotNeighbors;
                var threeVariableIndex = this.threeVariableArray[this.currentThreeVariableArrayIndex].kMapIndices;
                while (notNeightborsIndices.indexOf(threeVariableIndex[0]) === -1) {
                    this.currentThreeVariableArrayIndex = (this.currentThreeVariableArrayIndex + 1) % this.threeVariableArray.length;
                    threeVariableIndex = this.threeVariableArray[this.currentThreeVariableArrayIndex].kMapIndices;
                }

                // Set expected answers
                this.expectedCircles.push(twoVariableIndices);
                this.expectedCircles.push(threeVariableIndex);

                // Update incrementers
                this.currentThreeVariableArrayIndex = (this.currentThreeVariableArrayIndex + 1) % this.threeVariableArray.length;
                this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
            }
            // 2 two-variable terms, e.g., a'b' + b'c'
            else {
                // Select first two-variable term
                var firstIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;

                // Update incrementer
                this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;

                // Select second two-variable term, which has 1 indice the same as the first and 1 indice different
                do {
                    var secondTermIndices = this.twoVariableArray[this.currentTwoVariableArrayIndex].kMapIndices;
                    var secondTermIndice0Same = firstIndices.indexOf(secondTermIndices[0]) !== -1;
                    var secondTermIndice1Same = firstIndices.indexOf(secondTermIndices[1]) !== -1;

                    // Update incrementer
                    this.currentTwoVariableArrayIndex = (this.currentTwoVariableArrayIndex + 1) % this.twoVariableArray.length;
                } while ((secondTermIndice0Same && secondTermIndice1Same) || (!secondTermIndice0Same && !secondTermIndice1Same));

                // Set expected answers
                this.expectedCircles.push(firstIndices);
                this.expectedCircles.push(secondTermIndices);
            }
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

var kMapAddCirclesExport = {
    create: function() {
        return new KMapAddCircles();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = kMapAddCirclesExport;
