/**
    Progression wherein the user is given set definitions and operations and inputs the resulting set.
    @module setEquation
*/
function setEquation() {
    /**
        Render and initialize a progression instance.
        @method init
        @param {String} id The unique identifier given to module.
        @param {Object} parentResource Dictionary of functions to access resources and submit activity.
        @return {void}
    */
    this.init = function(id, parentResource) {
        var html = this['<%= grunt.option("tool") %>'].setEquation({ id: id });

        this._progressionTool = require('progressionTool').create();
        this._utilities = require('utilities');
        this._discreteMathUtilities = require('discreteMathUtilities');

        var userInputWasInvalid = false;
        var self = this;
        this._progressionTool.init(id, parentResource, {
            html:             html,
            css:              '<style><%= grunt.file.read(css_filename) %></style>',
            numToWin:         7,
            useMultipleParts: true,
            start: function() {
                self._enableInput();
            },
            reset: function() {
                self._makeLevel(0);
                self._disableInput();
            },
            next: function(currentLevelIndex) {
                self._enableInput();

                if (!userInputWasInvalid) {
                    self._makeLevel(currentLevelIndex);
                }
                userInputWasInvalid = false;
            },
            isCorrect: function(currentLevelIndex) {
                var userInput = self._$input.val();
                self._disableInput();

                var explanationMessage = self._expectedAnswer.explanation;
                var isCorrect = true;
                var isValidInput = self._isInputValid(userInput);
                var userSet = [];
                if (isValidInput) {
                    userSet = self._convertStringToSet(userInput);
                    userSet.sort();
                    self._expectedAnswer.expectedSet.sort();

                    // Check for duplicate elements.
                    var duplicateElements = self._findDuplicateElementsInSet(userSet);
                    if (duplicateElements.length > 0) {
                        isCorrect = false;
                        explanationMessage = duplicateElements[0] + ' is listed more than once.';
                    }
                    else {
                        if (userSet.length !== self._expectedAnswer.expectedSet.length) {
                            isCorrect = false;
                        }
                        else {
                            userSet.forEach(function(element) {
                                var userSetElement = element;
                                if (self._expectedAnswer.expectedSet.indexOf(userSetElement) === -1) {
                                    isCorrect = false;
                                }
                            });
                        }
                    }
                }
                else {
                    // Explain to user an valid input is, then give user another try.
                    isCorrect = false;
                    userInputWasInvalid = true;
                    explanationMessage = 'Invalid input. Valid input example: 3, 5, 9';
                }

                return {
                    explanationMessage: explanationMessage,
                    userAnswer:         JSON.stringify(userSet),
                    expectedAnswer:     JSON.stringify(self._expectedAnswer.expectedSet),
                    isCorrect:          isCorrect
                };
            }
        });

        var $thisTool = $('#' + id);
        this._$givenSets = $thisTool.find('.given-sets').find('div');
        this._$problem = $thisTool.find('.problem');
        this._$input = $thisTool.find('input');

        this._makeLevel(0);

        this._$input.keypress(function(event) {
            if (event.keyCode === self._utilities.ENTER_KEY) {
                self._progressionTool.check();
            }
        });

        this._disableInput();
    };

    /**
        Disable the input field.
        @method _disableInput
        @private
        @return {void}
    */
    this._disableInput = function() {
        this._$input.attr('disabled', true);
    };

    /**
        Enable the input field.
        @method _enableInput
        @private
        @return {void}
    */
    this._enableInput = function() {
        this._$input.attr('disabled', false);
        this._$input.focus();
    };

    /**
        Return the duplicate elements in the given set.
        @method _findDuplicateElementsInSet
        @private
        @param {Array} of {String} set The given set.
        @return {Array} of {String} The duplicate elements.
    */
    this._findDuplicateElementsInSet = function(set) {
        var duplicateElements = [];
        var previousElement = null;
        set.forEach(function(element) {
            // Found a duplicate
            if (element === previousElement) {
                duplicateElements.push(element);
            }
            previousElement = element;
        });
        return duplicateElements;
    };

    /**
        Return whether |userInput| is valid, meaning contains comma-separated numbers or empty string.
        @method _isInputValid
        @private
        @param {String} userInput The user's input.
        @return {Boolean} Whether the user's input is a comma-separated list of numbers.
    */
    this._isInputValid = function(userInput) {
        userInput = userInput.replace(/ /g, '');
        return ((/^\d+(,\d+)*$/).test(userInput) || (userInput === ''));
    };

    /**
        Converts a given comma-separated |str| to an array of string.
        @method _convertStringToSet
        @private
        @param {String} str Comma-separated string to be converted to an array of strings.
        @return {Array} of {String} Array made by splitting by commas.
    */
    this._convertStringToSet = function(str) {
        str = str.replace(/ /g, '');
        if (str === '') {
            return [];
        }
        return str.split(',');
    };

    /**
        Converts a given |set| to a string.
        @method _stringifySet
        @private
        @param {Array} of {String} set The set to be converted to a string.
        @return {String} String built from the given set.
    */
    this._stringifySet = function(set) {
        var setString = '{ ';
        setString += set.join(', ');
        setString += ' }';

        return setString;
    };

    /**
        Generates a set with |numElements| unique elements between 1 and 9.
        @method _generateSetWithNElements
        @private
        @param {Number} numElements The number of elements to generate.
        @return {Array} of {String} The set of generated elements.
    */
    this._generateSetWithNElements = function(numElements) {
        var set = [];
        var exclude = [];

        for (var i = 0; i < numElements; i++) {
            var nextNum = this._utilities.pickNumberInRange(1, 9, exclude);
            set.push(nextNum.toString());
            exclude.push(nextNum);
        }

        set.sort();

        return set;
    };

    /**
        Computes and returns |setA| - |setB|.
        @method _evaluateMinus
        @private
        @param {Array} of {String} setA Set to the left of the minus sign.
        @param {Array} of {String} setB Set to the right of the minus sign.
        @param {Array} of {String} The result of setA - setB.
    */
    this._evaluateMinus = function(setA, setB) {
        return setA.filter(function(elementA) {
            return (setB.indexOf(elementA) === -1);
        });
    };

    /**
        Computes and returns |setA| union |setB|
        @method _evaluateUnion
        @private
        @param {Array} of {String} setA Set to the left of the minus sign.
        @param {Array} of {String} setB Set to the right of the minus sign.
        @param {Array} of {String} The result of setA union setB.
    */
    this._evaluateUnion = function(setA, setB) {
        var unionSet = [];

        setA.forEach(function(elementA) {
            unionSet.push(elementA);
        });

        setB.forEach(function(elementB) {
            if (setA.indexOf(elementB) === -1) {
                unionSet.push(elementB);
            }
        });

        return unionSet;
    };

    /**
        Computes and returns |setA| intersect |setB|.
        @method _evaluateIntersect
        private
        @param {Array} of {String} setA Set to the left of the minus sign.
        @param {Array} of {String} setB Set to the right of the minus sign.
        @return {Array} of {String} The result of setA intersect setB.
    */
    this._evaluateIntersect = function(setA, setB) {
        var intersectSet = [];

        setA.forEach(function(elementA, indexA) {
            if (setB.indexOf(elementA) !== -1) {
                intersectSet.push(elementA);
            }
        });

        return intersectSet;
    };

    /**
        Computes and returns the symmetric difference between |setA| and |setB|.
        @method _evaluateIntersect
        private
        @param {Array} of {String} setA Set to the left of the minus sign.
        @param {Array} of {String} setB Set to the right of the minus sign.
        @return {Array} of {String} The result of setA symmetric difference setB.
    */
    this._evaluateSymmetricDifference = function(setA, setB) {
        // Symmetric difference is (A - B) union (B - A)
        var aMinusB = this._evaluateMinus(setA, setB);
        var bMinusA = this._evaluateMinus(setB, setA);
        return this._evaluateUnion(aMinusB, bMinusA);
    };

    /**
        Return result after evaluating given |setExpression|.
        @method _evaluateSetExpression
        @private
        @param {Array} of {String} setExpression The expression to evaluate. Must be of the form: [set1, set2, symbol, set3, symbol, set4, symbol...]
        @return {Array} of {String} The resulting set.
    */
    this._evaluateSetExpression = function(setExpression) {
        while (setExpression.length > 1) {
            var newSet = [];
            switch(setExpression[2]) {
                case '-':
                    newSet = this._evaluateMinus(setExpression[0], setExpression[1]);
                    break;
                case this._discreteMathUtilities.unionSymbol:
                    newSet = this._evaluateUnion(setExpression[0], setExpression[1]);
                    break;
                case this._discreteMathUtilities.intersectSymbol:
                    newSet = this._evaluateIntersect(setExpression[0], setExpression[1]);
                    break;
                case this._discreteMathUtilities.symmetricDifference:
                    newSet = this._evaluateSymmetricDifference(setExpression[0], setExpression[1]);
                    break;
            }

            // Remove the first two sets and first symbol from the array after they have been used.
            setExpression.shift();
            setExpression.shift();

            // Assign the first element of the array to the result.
            setExpression[0] = newSet;
        }

        setExpression[0].sort();

        return setExpression[0];
    };

    /**
        Generates an explanation given the |sets|, and |expectedSet| based on the |symbol|.
        @method _generateSingleSymbolExplanation
        @private
        @param {Array} of {String} setNames The names of the sets.
        @param {String} symbol The name of the symbol to be explained.
        @param {Array} of {String} expectedSet List of elements in the resulting set.
        @return {String} An explanation for the symbol.
    */
    this._generateSingleSymbolExplanation = function(setNames, symbol, expectedSet) {
        switch (symbol) {
            case '-':
                return (this._stringifySet(expectedSet) + ' contains all elements in ' + setNames[0] + ' that are not in ' + setNames[1] + '.');
            case this._discreteMathUtilities.unionSymbol:
                return (this._stringifySet(expectedSet) + ' contains all elements in  ' + setNames[0] + ' or ' + setNames[1] + '.');
            case this._discreteMathUtilities.intersectSymbol:
                return (this._stringifySet(expectedSet) + ' contains elements in both ' + setNames[0] + ' and ' + setNames[1] + '.');
            case this._discreteMathUtilities.symmetricDifference:
                var explanation = this._stringifySet(expectedSet) + this._utilities.getNewline()
                                + setNames[0] + ' ' + this._discreteMathUtilities.symmetricDifference + ' ' + setNames[1] + ' = (' + setNames[0] + ' - ' + setNames[1] + ') ' + this._discreteMathUtilities.unionSymbol + ' (' + setNames[1] + ' - ' + setNames[0] + ')';
                return explanation;
        }
    };

    /**
        Generates a set that is described in words rather than a list of numbers.
        @method _generateSpecialSet
        @private
        @return {SpecialSet} Randomly chosen special set.
    */
    this._generateSpecialSet = function() {
        var specialSets = [
            new SpecialSet([ '1', '3', '5', '7', '9' ], [ '2', '4', '6', '8' ], '{ x ∈ Z: x is odd }'),
            new SpecialSet([ '2', '4', '6', '8' ], [ '1', '3', '5', '7', '9' ], '{ x ∈ Z: x is even }'),
            new SpecialSet([ '3', '6', '9' ], [ '1', '2', '4', '5', '7', '8' ], '{ x ∈ Z: x is an integer multiple of 3 }'),
            new SpecialSet([ '4', '8' ], [ '1', '2', '3', '5', '6', '7', '9' ], '{ x ∈ Z: x is an integer multiple of 4 }'),
            new SpecialSet([ '1', '4', '9' ], [ '2', '3', '5', '6', '7', '8' ], '{ x ∈ Z: x is a perfect square }')
        ];
        this._utilities.shuffleArray(specialSets);
        return specialSets[0];
    };

    /**
        Picks a random element from |setA| and assigns it randomly to somewhere in |setB|.
        @method _ensureSetOverlap
        @private
        @param {Array} of {String} setA The set from which an element is picked.
        @param {Array} of {String} setB The set from which an element is assigned.
        @return {void}
    */
    this._ensureSetOverlap = function(setA, setB) {
        var overlap = setA[this._utilities.pickNumberInRange(0, setA.length - 1)];
        if (setB.indexOf(overlap) === -1) {
            setB[this._utilities.pickNumberInRange(0, setB.length - 1)] = overlap;
        }
        setB.sort();
    };

    /**
        Shuffles |array| but preserves the last element in |array|.
        @method _shuffleAllButLastElement
        @private
        @param {Array} array The array to shuffle.
        @return {Array} The shuffled array.
    */
    this._shuffleAllButLastElement = function(array) {
        var temp = array.pop();
        this._utilities.shuffleArray(array);
        array.push(temp);
        return array;
    };

    /**
        Create and return 2-3 sets.
        @method _initialGivenSets
        @private
        @param {Number} numSets The number of sets to create.
        @param {Boolean} containsSpecialSets Whether to create a SpecialSet.
        @return {Array} of {SetAndName} The 2-3 created sets.
    */
    this._initialGivenSets = function(numSets, containsSpecialSet) {
        this._clearSets();

        var setA = this._generateSetWithNElements(4);
        var setB = this._generateSetWithNElements(3);
        var setC = this._generateSetWithNElements(3);

        this._ensureSetOverlap(setA, setB);

        var sets = [
            new SetAndName(setB, 'B'),
            new SetAndName(setA, 'A')
        ];

        var setAString = 'A = ' + this._stringifySet(setA);
        var setBString = 'B = ' + this._stringifySet(setB);

        if (containsSpecialSet) {
            specialSet = this._generateSpecialSet();
            sets[1].set = specialSet.negatedSet;
            setAString = 'A = ' + specialSet.description;
            this._ensureSetOverlap(setB, specialSet.set);
        }

        if (numSets === 3) {
            sets.unshift(new SetAndName(setC, 'C'));
        }

        this._$givenSets.eq(0).text(setAString);
        this._$givenSets.eq(1).text(setBString);

        if (numSets === 3) {
            var setCString = 'C = ' + this._stringifySet(setC);
            this._$givenSets.eq(2).text(setCString);
        }

        if (containsSpecialSet) {
            sets = this._shuffleAllButLastElement(sets);
        }
        else {
            this._utilities.shuffleArray(sets);
        }

        return sets;
    };

    /*
        Returns the value stored at the key setName in |sets|.
        @method _getSetNames
        @private
        @param {Array} of {SetAndName} sets The sets from which to get setNames.
        @return {Array} of {String} List of set's setNames.
    */
    this._getSetNames = function(sets) {
        return sets.map(function(d) {
            return d.setName;
        });
    };

    /**
        Clear the given sets from the DOM.
        @method _clearSets
        @private
        @return {void}
    */
    this._clearSets = function() {
        this._$givenSets.html('');
    };

    /**
        Clear the given problem from the DOM.
        @method _clearProblem
        @private
        @return {void}
    */
    this._clearProblem = function() {
        this._$problem.html('');
    };

    /**
        Return the HTML for a negated A.
        @method _generateNegatedASpan
        @return {String} HTML for a negated A.
    */
    this._generateNegatedASpan = function() {
        return '<span class=\'negated\'>A</span>';
    };

    /**
        Generates a problem that contains a Not A.
        @method _generateNegatedAProblem
        @private
        @param {Array} of {SetAndName} sets The sets for this problem.
        @param {Array} of {String} possibleSymbols List of symbols from which to choose.
        @return {ExpectedAnswer} The expected answer for the problem.
    */
    this._generateNegatedAProblem = function(sets, possibleSymbols) {
        this._clearProblem();

        var setNames = this._getSetNames(sets);

        var set0 = sets[0].set;
        var set1 = sets[1].set;
        var set2 = (setNames.length === 3) ? sets[2].set : {};

        var expectedSet, problem, explanation;
        if (setNames[0] === 'A') {
            if (setNames.length === 2) {
                // Ex: NOT(A) - B
                problem = this._generateNegatedASpan() + ' ' + possibleSymbols[0] + ' ' + setNames[1];

                expectedSet = this._evaluateSetExpression([ set0, set1, possibleSymbols[0] ]);

                explanation = this._stringifySet(expectedSet) + this._utilities.getNewline()
                            + 'The bar over the A means Not A.';
            }
            else if (setNames.length === 3) {
                if (this._utilities.flipCoin()) {
                    // Ex: ( NOT(A) - B ) ∩ C
                    problem = '(' + this._generateNegatedASpan() + ' ' + possibleSymbols[0] + ' ' + setNames[1] + ' ) ' + possibleSymbols[1] + ' ' + setNames[2];

                    expectedSet = this._evaluateSetExpression([ set0, set1, possibleSymbols[0], set2, possibleSymbols[1] ]);

                    // Ex: { 3, 5, 9}. First evaluate NOT(A) - B. Then evaluate ( NOT(A) - B ) ∩ C
                    explanation = this._stringifySet(expectedSet)
                                + '<br>First evaluate ' + this._generateNegatedASpan() + ' ' + possibleSymbols[0] + ' ' + setNames[1] + '. Then evaluate ' + problem + '.';
                }
                else {
                    // Ex: NOT(A) - ( B ∩ C )
                    problem = this._generateNegatedASpan() + ' ' + possibleSymbols[0] + ' ( ' + setNames[1] + ' ' + possibleSymbols[1] + ' ' + setNames[2] + ' )';

                    expectedSet = this._evaluateSetExpression([ set0, this._evaluateSetExpression([ set1, set2, possibleSymbols[1] ]), possibleSymbols[0] ]);

                    // Ex: { 3, 5, 9}. First evaluate B ∩ C. Then evaluate NOT(A) - ( B ∩ C ).
                    explanation = this._stringifySet(expectedSet)
                                + '<br>First evaluate ' + setNames[1] + ' ' + possibleSymbols[1] + ' ' + setNames[2] + '. Then evaluate ' + problem + '.';
                }
            }
        }
        else if (setNames[1] === 'A') {
            if (setNames.length === 2) {
                // Ex: B - NOT(A)
                problem = setNames[0] + ' ' + possibleSymbols[0] + ' ' + this._generateNegatedASpan();

                expectedSet = this._evaluateSetExpression([ set0, set1, possibleSymbols[0] ]);

                explanation = this._stringifySet(expectedSet) + this._utilities.getNewline()
                            + 'The bar over the A means Not A.';
            }
            else if (setNames.length === 3) {
                if (this._utilities.flipCoin()) {
                    // Ex: ( B - NOT(A) ) ∩ C
                    problem = '( ' + setNames[0] + ' ' + possibleSymbols[0] + ' ' + this._generateNegatedASpan() + ' ) ' + possibleSymbols[1] + ' ' + setNames[2];

                    expectedSet = this._evaluateSetExpression([ set0, set1, possibleSymbols[0], set2, possibleSymbols[1] ]);

                    // Ex: { 3, 5, 9}. First evaluate B - NOT(A). Then evaluate ( B - NOT(A) ) ∩ C.
                    explanation = this._stringifySet(expectedSet)
                                + '<br>First evaluate ' + setNames[0] + ' ' + possibleSymbols[0] + ' ' + this._generateNegatedASpan() + '. Then evaluate ( ' + problem + '.';
                }
                else {
                    // Ex: B - ( NOT(A) ∩ C )
                    problem = setNames[0] + ' ' + possibleSymbols[0] + ' ( ' + this._generateNegatedASpan() + ' ' + possibleSymbols[1] + ' ' + setNames[2] + ' )';

                    expectedSet = this._evaluateSetExpression([ set0, this._evaluateSetExpression([ set1, set2, possibleSymbols[1] ]), possibleSymbols[0] ]);

                    // Ex: { 3, 5, 9}. First evaluate NOT(A) - B. Then evaluate B - ( NOT(A) ∩ C ).
                    explanation = this._stringifySet(expectedSet)
                                + '<br>First evaluate ' + this._generateNegatedASpan() + ' ' + possibleSymbols[1] + ' ' + setNames[2] + '. Then evaluate ' + problem + '.';
                }
            }
        }
        else if (setNames[2] === 'A') {
            if (this._utilities.flipCoin()) {
                // Ex: ( B - C ) ∩ NOT(A)
                problem = '( ' + setNames[0] + ' ' + possibleSymbols[0] + ' ' + setNames[1] + ' ) ' + possibleSymbols[1] + ' ' + this._generateNegatedASpan();

                expectedSet = this._evaluateSetExpression([ set0, set1, possibleSymbols[0], set2, possibleSymbols[1] ]);

                // Ex: { 3, 5, 9}. First evaluate B - C. Then evaluate ( B - C ) ∩ NOT(A).
                explanation = this._stringifySet(expectedSet)
                            + '<br>First evaluate ' + setNames[0] + ' ' + possibleSymbols[0] + ' ' + setNames[1] + '. Then evaluate ' + problem + '.';
            }
            else {
                // Ex: B - ( C ∩ NOT(A) )
                problem = setNames[0] + ' ' + possibleSymbols[0] + ' ( ' + setNames[1] + ' ' + possibleSymbols[1] + ' ' + this._generateNegatedASpan() + ' )';

                expectedSet = this._evaluateSetExpression([ set0, this._evaluateSetExpression([ set1, set2, possibleSymbols[1] ]), possibleSymbols[0] ]);

                // Ex: { 3, 5, 9}. First evaluate C ∩ NOT(A). Then evaluate B - ( C ∩ NOT(A) ).
                explanation = this._stringifySet(expectedSet)
                            + '<br>First evaluate ' + setNames[1] + ' ' + possibleSymbols[1] + ' ' + this._generateNegatedASpan() + '. Then evaluate ' + problem + '.';
            }
        }

        this._$problem.html(problem);

        return new ExpectedAnswer(expectedSet, explanation);
    };

    /**
        Generates a level that uses 1 |symbol| and 2 generated sets.
        @method _singleSymbolLevel
        @private
        @param {String} symbol The operation symbol to use in this level.
        @param {Boolean} containsSpecialSet Whether the generated sets should contain a {SpecialSet}.
        @return {void}
    */
    this._singleSymbolLevel = function(symbol, containsSpecialSet) {
        containsSpecialSet = containsSpecialSet || false;

        sets = this._initialGivenSets(2, containsSpecialSet);

        var set0 = sets[0].set;
        var set1 = sets[1].set;

        var setNames = this._getSetNames(sets);

        if (containsSpecialSet) {
            this._expectedAnswer = this._generateNegatedAProblem(sets, [ symbol ]);
        }
        else {
            var problemText = setNames[0] + ' ' + symbol + ' ' + setNames[1];
            this._$problem.html(problemText);

            var expectedSet = this._evaluateSetExpression([ set0, set1, symbol ]);
            var explanation = this._generateSingleSymbolExplanation(setNames, symbol, expectedSet);

            this._expectedAnswer = new ExpectedAnswer(expectedSet, explanation);
        }
    };

    /**
        Generates a level that uses 2 generated symbols and 3 generated sets.
        @method _twoSymbolLevel
        @private
        @param {Boolean} containsSpecialSet Whether the generated sets should contain a {SpecialSet}.
        @return {void}
    */
    this._twoSymbolLevel = function(containsSpecialSet) {
        var sets = this._initialGivenSets(3, containsSpecialSet);
        var set0 = sets[0].set;
        var set1 = sets[1].set;
        var set2 = sets[2].set;

        var setNames = this._getSetNames(sets);

        if (containsSpecialSet) {
            var possibleSymbols = [
                '-',
                this._discreteMathUtilities.unionSymbol,
                this._discreteMathUtilities.intersectSymbol,
            ];
            this._utilities.shuffleArray(possibleSymbols);

            if (possibleSymbols[0] === this._discreteMathUtilities.intersectSymbol) {
                possibleSymbols[1] = '-';
            }
            else if (possibleSymbols[0] === '-') {
                possibleSymbols[1] = this._discreteMathUtilities.intersectSymbol;
            }
            else {
                var possibleSecondSymbols = [ '-', this._discreteMathUtilities.intersectSymbol ];
                this._utilities.shuffleArray(possibleSymbols);
                possibleSymbols[1] = possibleSecondSymbols[0];
            }

            this._expectedAnswer = this._generateNegatedAProblem(sets, possibleSymbols);
        }
        else {
            var problem = '';
            var expectedSet = [];
            var explanation = '';

            var possibleSymbols = [
                '-',
                this._discreteMathUtilities.symmetricDifference
            ];
            this._utilities.shuffleArray(possibleSymbols);

            if (this._utilities.flipCoin()) {
                // Ex: ( A - B ) ∩ C
                problem = '( ' + setNames[0] + ' ' + possibleSymbols[0] + ' ' + setNames[1] + ' ) ' + possibleSymbols[1] + ' ' + setNames[2];

                expectedSet = this._evaluateSetExpression([ set0, set1, possibleSymbols[0], set2, possibleSymbols[1] ]);

                // Ex: { 3, 5, 9}. First evaluate A - B. Then evaluate ( A - B ) ∩ C.
                explanation = this._stringifySet(expectedSet)
                            + '<br>First evaluate ' + setNames[0] + ' ' + possibleSymbols[0] + ' ' + setNames[1] + '. Then evaluate ' + problem + '.';
            }
            else {
                // Ex: A - ( B ∩ C )
                problem = setNames[0] + ' ' + possibleSymbols[0] + ' ( ' + setNames[1] + ' ' + possibleSymbols[1] + ' ' + setNames[2] + ' )';

                expectedSet = this._evaluateSetExpression([ set0, this._evaluateSetExpression([ set1, set2, possibleSymbols[1] ]), possibleSymbols[0] ]);

                // Ex: { 3, 5, 9}. First evaluate B ∩ C. Then evaluate A - ( B ∩ C ).
                explanation = this._stringifySet(expectedSet)
                            + '<br>First evaluate ' + setNames[1] + ' ' + possibleSymbols[1] + ' ' + setNames[2] + '. Then evaluate ' + problem + '.';
            }

            this._$problem.html(problem);

            this._expectedAnswer = new ExpectedAnswer(expectedSet, explanation);
        }
    };

    /*
        Generate a level for |currentLevelIndex|.
        @method _makeLevel
        @private
        @param {Number} currentLevelIndex The index of the current level.
        @return {void}
    */
    this._makeLevel = function(currentLevelIndex) {
        this._$input.val('');

        switch(currentLevelIndex) {
            case 0:
                this._singleSymbolLevel(this._discreteMathUtilities.intersectSymbol);
                break;
            case 1:
                this._singleSymbolLevel(this._discreteMathUtilities.unionSymbol);
                break;
            case 2:
                this._singleSymbolLevel('-');
                break;
            case 3:
                this._singleSymbolLevel(this._discreteMathUtilities.symmetricDifference);
                break;
            case 4:
                var possibleSymbols = [ '-', this._discreteMathUtilities.intersectSymbol ];
                this._utilities.shuffleArray(possibleSymbols);
                this._singleSymbolLevel(possibleSymbols[0], true);
                break;
            case 5:
                this._twoSymbolLevel();
                break;
            case 6:
                this._twoSymbolLevel(true);
                break;
        }

        if (this._expectedAnswer.expectedSet.length === 0) {
            this._makeLevel(currentLevelIndex);
        }
    };

    this.reset = function() {
        this._progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var setEquationExport = {
    create: function() {
        return new setEquation();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = setEquationExport;
