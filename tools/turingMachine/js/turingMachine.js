function TuringMachine() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.tapeSymbolIndex = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ];

        var html = this[this.name]['turingMachine']({ id: this.id, tapeSymbolIndex: this.tapeSymbolIndex });
        $('#' + this.id).html(css + html);

        // Cache buttons
        this.$startButton = $('#start-button-' + this.id);
        this.$stopButton = $('#stop-button-' + this.id);
        this.$modifyTapeButton = $('#modify-tape-button-' + this.id);
        this.$nextButton = $('#next-button-' + this.id);
        this.$resetButton = $('#reset-button-' + this.id);

        // Initialize values
        this.resetButtonClick();

        // Setup event listeners
        var self = this;
        this.$startButton.click(function() {
            self.startButtonClick();
        });
        this.$stopButton.click(function() {
            self.stopButtonClick();
        });
        this.$modifyTapeButton.click(function() {
            self.modifyTapeButtonClick();
        });
        this.$nextButton.click(function() {
            self.nextButtonClick();
        });
        this.$resetButton.click(function() {
            self.resetButtonClick();
        });
        $('#' + this.id).click(function() {
            if (!self.hasBeenClicked) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'turingMachine',
                    metadata: {
                        event: 'turingMachine clicked'
                    }
                };

                self.eventManager.postEvent(event);

                self.hasBeenClicked = true;
            }
        });
    };

    var currentPointerLocation = 1;
    var symbolTapeInitCache = '**********';

    var transitions = { // Turing machine transition rules
        'q-0': {
            a: {
                state: 'q-first',
                symbol: '*',
                direction: 'R',
                explanation: 'Change leftmost a to * to mark the left end of the string.'
            },
            x: {
                state: 'q-rej',
                symbol: 'x',
                direction: 'R',
                explanation: ''
            },
            '*': {
                state: 'q-rej',
                symbol: '*',
                direction: 'R',
                explanation: ''
            }
        },
        'q-first': {
            a: {
                state: 'q-even',
                symbol: 'x',
                direction: 'R',
                explanation: 'The second a is observed. Change a to an x.'
            },
            x: {
                state: 'q-first',
                symbol: 'x',
                direction: 'R',
                explanation: 'Only the first a has been seen.'
            },
            '*': {
                state: 'q-acc',
                symbol: '*',
                direction: 'R',
                explanation: 'Only the first * remains. The number of a\'s was a power of two.'
            }
        },
        'q-even': {
            a: {
                state: 'q-odd',
                symbol: 'a',
                direction: 'R',
                explanation: 'Now an odd number of a\'s have been seen.'
            },
            x: {
                state: 'q-even',
                symbol: 'x',
                direction: 'R',
                explanation: 'An even number of a\'s have been seen.'
            },
            '*': {
                state: 'q-ret',
                symbol: '*',
                direction: 'L',
                explanation: 'End of string reached. An even number of a\'s have been seen. Continue and return head back to the beginning.'
            }
        },
        'q-odd': {
            a: {
                state: 'q-even',
                symbol: 'x',
                direction: 'R',
                explanation: 'Now an even number of a\'s have been seen. Change every other a to an x.'
            },
            x: {
                state: 'q-odd',
                symbol: 'x',
                direction: 'R',
                explanation: 'An odd number of a\'s have been seen.'
            },
            '*': {
                state: 'q-rej',
                symbol: '*',
                direction: 'L',
                explanation: 'String has an odd number of a\'s. Reject.'
            }
        },
        'q-ret': {
            a: {
                state: 'q-ret',
                symbol: 'a',
                direction: 'L',
                explanation: 'Head returning to beginning of the string.'
            },
            x: {
                state: 'q-ret',
                symbol: 'x',
                direction: 'L',
                explanation: 'Head returning to beginning of the string.'
            },
            '*': {
                state: 'q-first',
                symbol: '*',
                direction: 'R',
                explanation: 'Leftmost * counts as an a. Beginning of string reached. Start moving right again.'
            }
        },
        'q-acc': {
            a: {
                state: 'q-acc',
                symbol: 'a',
                direction: '',
                explanation: 'The Turing machine <i>accepts</i> on input string '
            },
            x: {
                state: 'q-acc',
                symbol: 'x',
                direction: '',
                explanation: 'The Turing machine <i>accepts</i> on input string '
            },
            '*': {
                state: 'q-acc',
                symbol: '*',
                direction: '',
                explanation: 'The Turing machine <i>accepts</i> on input string '
            }
        },
        'q-rej': {
            a: {
                state: 'q-rej',
                symbol: 'a',
                direction: '',
                explanation: 'The Turing machine <i>rejects</i> on input string '
            },
            x: {
                state: 'q-rej',
                symbol: 'x',
                direction: '',
                explanation: 'The Turing machine <i>rejects</i> on input string '
            },
            '*': {
                state: 'q-rej',
                symbol: '*',
                direction: '',
                explanation: 'The Turing machine <i>rejects</i> on input string '
            }
        }
    };

    var textStateNameToHTML = {
        'q-0': 'q <sub>0</sub>',
        'q-first': 'q <sub>first</sub>',
        'q-even': 'q <sub>even</sub>',
        'q-odd': 'q <sub>odd</sub>',
        'q-ret': 'q <sub>ret</sub>',
        'q-acc': 'q <sub>acc</sub>',
        'q-rej': 'q <sub>rej</sub>'
    };

    var HTMLStateNameToText = {
        'q <sub>0</sub>': 'q-0',
        'q <sub>first</sub>': 'q-first',
        'q <sub>even</sub>': 'q-even',
        'q <sub>odd</sub>': 'q-odd',
        'q <sub>ret</sub>': 'q-ret',
        'q <sub>acc</sub>': 'q-acc',
        'q <sub>rej</sub>': 'q-rej'
    };

    // Removes all state-related classes from $stateTd, then adds the class newState to $stateTd
    // Expects a jQuery object $stateTd and a string newState
    this.colorizeState = function($stateTd, newState) {
        $stateTd.removeClass('q-0').removeClass('q-first').removeClass('q-even')
                .removeClass('q-odd').removeClass('q-ret').removeClass('q-acc').removeClass('q-rej');
        $stateTd.addClass(newState);
    };

    // Highlight the transition rule based on the current pointer location
    // Expects a boolean value that determines whether the highlight should be added or removed
    this.highlightTransitionRuleBeingPointedTo = function(shouldHighlight) {
        var $currStateTd = $('#state-' + currentPointerLocation + '-' + this.id);
        var currState = HTMLStateNameToText[$currStateTd.html().trim()];
        var $currSymbolTd = $('#tape-' + currentPointerLocation + '-' + this.id);
        var currSymbol = $currSymbolTd.html().trim();

        if (shouldHighlight) {
            $('#rule-' + currState + '-' + currSymbol.replace(/\*/g, 'asterix') + '-' + this.id).addClass('highlighted');
        } else {
            $('#rule-' + currState + '-' + currSymbol.replace(/\*/g, 'asterix') + '-' + this.id).removeClass('highlighted');
        }

        if (shouldHighlight) {
            $('#explanation-' + this.id).html(transitions[currState][currSymbol].explanation);
            if ((currState === 'q-acc') || (currState === 'q-rej')) {
                var firstA = symbolTapeInitCache.indexOf('a');
                var asterxBeforeFirstARemoved = symbolTapeInitCache.substring(firstA, symbolTapeInitCache.length - 1);
                var firstAsterix = asterxBeforeFirstARemoved.indexOf('*');
                var removedAsterixFromSymbolTapeInitCache = asterxBeforeFirstARemoved.substring(0, firstAsterix);
                $('#explanation-' + this.id).html($('#explanation-' + this.id).html() + removedAsterixFromSymbolTapeInitCache + '.');
            }
        } else {
            $('#explanation-' + this.id).html('');
        }
    };

    // Replace the tapeIndex with the given newSymbol, then color the tapeIndex based on the newSymbol
    // Expects a string newSymbol and an integer tapeIndex
    this.replaceAndColorSymbol = function(newSymbol, tapeIndex) {
        var $currSymbolTd = $('#tape-' + tapeIndex + '-' + this.id);

        // replace symbol
        $currSymbolTd.html(newSymbol);

        // color symbol
        if (newSymbol === 'a') {
            $currSymbolTd.addClass('symbol-a').removeClass('symbol-x').removeClass('symbol-asterix');
        } else if (newSymbol === 'x') {
            $currSymbolTd.addClass('symbol-x').removeClass('symbol-a').removeClass('symbol-asterix');
        } else if (newSymbol === '*') {
            $currSymbolTd.addClass('symbol-asterix').removeClass('symbol-a').removeClass('symbol-x');
        }
    };

    this.startButtonClick = function() {
        this.$startButton.hide();
        this.$stopButton.show();
        this.$modifyTapeButton.addClass('disabled');
        this.$nextButton.removeClass('disabled');

        var $firstState = $('#state-1-' + this.id);
        $firstState.html('q <sub>0</sub></span>');
        this.colorizeState($firstState, 'q-0');

        $('#statePntr-1-' + this.id).html('&darr;');

        symbolTapeInitCache = '';
        for (var i = 1; i <= 10; i++) {
            var $tape = $('#tape-' + i + '-' + this.id);
            symbolTapeInitCache += $tape.text();
            $tape.addClass('symbol-colored');
            this.replaceAndColorSymbol($tape.text(), i);
        }

        currentPointerLocation = 1;

        this.highlightTransitionRuleBeingPointedTo(true);
    };

    this.stopButtonClick = function() {
        this.$startButton.show();
        this.$stopButton.hide();
        this.$modifyTapeButton.removeClass('disabled');
        this.$nextButton.addClass('disabled');

        $('#explanation-' + this.id).html('');

        this.highlightTransitionRuleBeingPointedTo(false);

        for (var i = 1; i <= 10; i++) {
            var $tape = $('#tape-' + i + '-' + this.id);
            $tape.text(symbolTapeInitCache[i - 1]);
            $tape.removeClass('symbol-colored');

            var $state = $('#state-' + i + '-' + this.id);
            $state.html('');

            var $statePointer = $('#statePntr-' + i + '-' + this.id);
            $statePointer.html('');
        }
    };

    this.modifyTapeButtonClick = function() {
        if (!this.$modifyTapeButton.hasClass('disabled')) {
            var numDsrStr = prompt('Enter the number of a\'s desired (between 1 and 8).');
            var numDsrInt = parseInt(numDsrStr);
            if ((numDsrInt >= 1) && (numDsrInt <= 8)) {
                for(var i = 1; i <= 8; i++) {
                    var $tape = $('#tape-' + i + '-' + this.id);
                    if (i <= numDsrInt) {
                        $tape.text('a');
                    } else {
                        $tape.text('*');
                    }
                }
            }
        }
    };

    this.nextButtonClick = function() {
        if (!this.$nextButton.hasClass('disabled')) {
            this.$nextButton.addClass('disabled');

            var $currStateTd = $('#state-' + currentPointerLocation + '-' + this.id);
            var currState = HTMLStateNameToText[$currStateTd.html().trim()];
            var $currSymbolTd = $('#tape-' + currentPointerLocation + '-' + this.id);
            var currSymbol = $currSymbolTd.html().trim();
            var transitionRule = transitions[currState][currSymbol];
            var nextState = transitionRule.state;
            var replaceSymbol = transitionRule.symbol;
            var pointerMoveDirection = transitionRule.direction;
            var currPointer = currentPointerLocation;
            var nextPointer;
            var $nextStateTd;

            $currStateTd.animate({ opacity: 0.0 });
            $currSymbolTd.animate({ opacity: 0.0 });

            var self = this;
            $('#statePntr-' + currPointer + '-' + this.id).animate({ opacity: 0.0 }, function() {
                self.highlightTransitionRuleBeingPointedTo(false); // unhighlight old transition

                $currStateTd.html(''); // remove old state
                $('#statePntr-' + currPointer + '-' + self.id).html('');

                self.replaceAndColorSymbol(replaceSymbol, currPointer);

                if (pointerMoveDirection === 'R') { // update pointer
                    currentPointerLocation++;
                } else if (pointerMoveDirection === 'L') {
                    currentPointerLocation--;
                }
                nextPointer = currentPointerLocation;

                $nextStateTd = $('#state-' + nextPointer + '-' + self.id);
                $nextStateTd.html(textStateNameToHTML[nextState]); // add new state
                self.colorizeState($nextStateTd, nextState);
                $('#statePntr-' + nextPointer + '-' + self.id).html('&darr;'); // add new state pointer

                self.highlightTransitionRuleBeingPointedTo(true); // highlight next transition

                if ((nextState !== 'q-acc') && (nextState !== 'q-rej') && (nextPointer <= 9)) {
                    self.$nextButton.removeClass('disabled');
                }

                $currStateTd.animate({ opacity: 1.0 });
                $currSymbolTd.animate({ opacity: 1.0 });
                $('#statePntr-' + currPointer + '-' + self.id).animate({ opacity: 1.0 });

                $nextStateTd.css('opacity', '0.0').animate({ opacity: 1.0 });
                $('#statePntr-' + nextPointer + '-' + self.id).css('opacity', '0.0').animate({ opacity: 1.0 });
            });
        }
    };

    this.resetButtonClick = function() {
        symbolTapeInitCache = 'aaaa******';
        this.stopButtonClick();
    };

    <%= grunt.file.read(hbs_output) %>
}

var turingMachineExport = {
    create: function() {
        return new TuringMachine();
    }
};
module.exports = turingMachineExport;
