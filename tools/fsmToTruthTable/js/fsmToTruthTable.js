function FsmToTruthTable() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }
        this.questionsPerSM = 3;

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['template']({
            id: this.id
        });
        this.incorrect = false;
        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.questionsPerSM * 2,
            useMultipleParts: this.useMultipleParts,
            start: function() {
                self.started = true;
                self.incorrect = false;
                self.generateProgressionQuestion(0);
            },
            reset: function() {
                self.incorrect = false;
                self.generateProgressionQuestion(0);
                self.displayCorrectAnswer();
                self.disableAllStateEdit();
                self.$userPrompt.text('');
            },
            next: function(currentQuestion) {
                self.generateProgressionQuestion(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                const { isAnswerCorrect, userAnswer } = self.verifyAnswer(currentQuestion);

                self.progressionTool.expectedAnswer = JSON.stringify(self.correctAnswer);
                self.progressionTool.userAnswer = userAnswer;
                self.disableAllStateEdit();
                if (isAnswerCorrect) {
                    self.progressionTool.explanationMessage = 'Correct.';
                    self.incorrect = false;
                }
                else {
                    self.progressionTool.explanationMessage = 'Incorrect answers highlighted above. ';
                    switch (currentQuestion % self.questionsPerSM) {
                        case 0:
                            self.progressionTool.explanationMessage += 'Input rows should count up in binary, thus covering all possible state encodings and input.';
                            break;
                        case 1:
                            self.progressionTool.explanationMessage += `p1 and p0 indicate the present state. Ex: If p1p0 is 00, state is s0. The present state assigns y\'s value. Ex: In s0, y = ${self.correctAnswer[0].row0.y}.`;
                            break;
                        case 2:
                            var nextState;
                            var nextStateEncoding = (self.correctAnswer[0].row1.n1 + '' + self.correctAnswer[0].row1.n0);
                            switch (nextStateEncoding) {
                                case '00':
                                    nextState = 's0';
                                    break;
                                case '01':
                                    nextState = 's1';
                                    break;
                                case '10':
                                    nextState = 's2';
                                    break;
                            }
                            self.progressionTool.explanationMessage += 'Next state is determined by present state and b\'s value. Ex: If present state is s0 and b\'s value is 1, then next state is ' + nextState + ', encoded as ' + nextStateEncoding + '.';
                            break;
                    }
                    self.incorrect = true;
                }
                return isAnswerCorrect;
            }
        });
        // Cache
        this.$userPrompt = $('#' + this.id + ' .user-prompt');
        // S0
        this.$s0 = $('#s0_' + this.id);
        this.$s0Action = $('#s0Action_' + this.id);
        this.$s0Label = $('#s0Label_' + this.id);
        this.$s0Encoding = $('#s0Encoding_' + this.id);
        this.$s0SelfTransition = $('#s0SelfTransition_' + this.id);
        this.$s0SelfTransitionLabel = $('#s0SelfTransitionLabel_' + this.id);
        this.$s0s1Transition = $('#s0s1Transition_' + this.id);
        this.$s0s1TransitionLabel = $('#s0s1TransitionLabel_' + this.id);
        this.$s0s2Transition = $('#s0s2Transition_' + this.id);
        this.$s0s2TransitionLabel = $('#s0s2TransitionLabel_' + this.id);
        this.$s0s3Transition = $('#s0s3Transition_' + this.id);
        this.$s0s3TransitionLabel = $('#s0s3TransitionLabel_' + this.id);
        // S1
        this.$s1 = $('#s1_' + this.id);
        this.$s1Action = $('#s1Action_' + this.id);
        this.$s1Label = $('#s1Label_' + this.id);
        this.$s1Encoding = $('#s1Encoding_' + this.id);
        this.$s1SelfTransition = $('#s1SelfTransition_' + this.id);
        this.$s1SelfTransitionLabel = $('#s1SelfTransitionLabel_' + this.id);
        this.$s1s0Transition = $('#s1s0Transition_' + this.id);
        this.$s1s0TransitionLabel = $('#s1s0TransitionLabel_' + this.id);
        this.$s1s2Transition = $('#s1s2Transition_' + this.id);
        this.$s1s2TransitionLabel = $('#s1s2TransitionLabel_' + this.id);
        this.$s1s3Transition = $('#s1s3Transition_' + this.id);
        this.$s1s3TransitionLabel = $('#s1s3TransitionLabel_' + this.id);
        // S2
        this.$s2 = $('#s2_' + this.id);
        this.$s2Action = $('#s2Action_' + this.id);
        this.$s2Label = $('#s2Label_' + this.id);
        this.$s2Encoding = $('#s2Encoding_' + this.id);
        this.$s2SelfTransition = $('#s2SelfTransition_' + this.id);
        this.$s2SelfTransitionLabel = $('#s2SelfTransitionLabel_' + this.id);
        this.$s2s1Transition = $('#s2s1Transition_' + this.id);
        this.$s2s1TransitionLabel = $('#s2s1TransitionLabel_' + this.id);
        this.$s2s0Transition = $('#s2s0Transition_' + this.id);
        this.$s2s0TransitionLabel = $('#s2s0TransitionLabel_' + this.id);
        this.$s2s3Transition = $('#s2s3Transition_' + this.id);
        this.$s2s3TransitionLabel = $('#s2s3TransitionLabel_' + this.id);
        // S3
        this.$s3 = $('#s3_' + this.id);
        this.$s3Action = $('#s3Action_' + this.id);
        this.$s3Label = $('#s3Label_' + this.id);
        this.$s3Encoding = $('#s3Encoding_' + this.id);
        this.$s3SelfTransition = $('#s3SelfTransition_' + this.id);
        this.$s3SelfTransitionLabel = $('#s3SelfTransitionLabel_' + this.id);
        this.$s3s1Transition = $('#s3s1Transition_' + this.id);
        this.$s3s1TransitionLabel = $('#s3s1TransitionLabel_' + this.id);
        this.$s3s2Transition = $('#s3s2Transition_' + this.id);
        this.$s3s2TransitionLabel = $('#s3s2TransitionLabel_' + this.id);
        this.$s3s0Transition = $('#s3s0Transition_' + this.id);
        this.$s3s0TransitionLabel = $('#s3s0TransitionLabel_' + this.id);
        // Cache truth table
        this.truthTable = [];
        var currentState = {
            $name: $('#s0Name_' + this.id),
            row0: {
                $p1: $('#' + this.id + ' .s0-table.p1').not('.editable'),
                $p0: $('#' + this.id + ' .s0-table.p0').not('.editable'),
                $b: $('#' + this.id + ' .s0-table.b').not('.editable'),
                $n1: $('#' + this.id + ' .s0-table.n1').not('.editable'),
                $n0: $('#' + this.id + ' .s0-table.n0').not('.editable'),
                $y: $('#' + this.id + ' .s0-table.y').not('.editable')
            },
            row1: {
                $p1: $('#' + this.id + ' .editable.s0-table.p1 div'),
                $p0: $('#' + this.id + ' .editable.s0-table.p0 div'),
                $b: $('#' + this.id + ' .editable.s0-table.b div'),
                $n1: $('#' + this.id + ' .editable.s0-table.n1 div'),
                $n0: $('#' + this.id + ' .editable.s0-table.n0 div'),
                $y: $('#' + this.id + ' .editable.s0-table.y div')
            }
        };
        this.truthTable.push(currentState);
        currentState = {
            $name: $('#s1Name_' + this.id),
            row0: {
                $p1: $('#' + this.id + ' .s1-table.p1').not('.editable'),
                $p0: $('#' + this.id + ' .s1-table.p0').not('.editable'),
                $b: $('#' + this.id + ' .s1-table.b').not('.editable'),
                $n1: $('#' + this.id + ' .s1-table.n1').not('.editable'),
                $n0: $('#' + this.id + ' .s1-table.n0').not('.editable'),
                $y: $('#' + this.id + ' .s1-table.y').not('.editable')
            },
            row1: {
                $p1: $('#' + this.id + ' .editable.s1-table.p1 div'),
                $p0: $('#' + this.id + ' .editable.s1-table.p0 div'),
                $b: $('#' + this.id + ' .editable.s1-table.b div'),
                $n1: $('#' + this.id + ' .editable.s1-table.n1 div'),
                $n0: $('#' + this.id + ' .editable.s1-table.n0 div'),
                $y: $('#' + this.id + ' .editable.s1-table.y div')
            }
        };
        this.truthTable.push(currentState);
        currentState = {
            $name: $('#s2Name_' + this.id),
            row0: {
                $p1: $('#' + this.id + ' .s2-table.p1').not('.editable'),
                $p0: $('#' + this.id + ' .s2-table.p0').not('.editable'),
                $b: $('#' + this.id + ' .s2-table.b').not('.editable'),
                $n1: $('#' + this.id + ' .s2-table.n1').not('.editable'),
                $n0: $('#' + this.id + ' .s2-table.n0').not('.editable'),
                $y: $('#' + this.id + ' .s2-table.y').not('.editable')
            },
            row1: {
                $p1: $('#' + this.id + ' .editable.s2-table.p1 div'),
                $p0: $('#' + this.id + ' .editable.s2-table.p0 div'),
                $b: $('#' + this.id + ' .editable.s2-table.b div'),
                $n1: $('#' + this.id + ' .editable.s2-table.n1 div'),
                $n0: $('#' + this.id + ' .editable.s2-table.n0 div'),
                $y: $('#' + this.id + ' .editable.s2-table.y div')
            }
        };
        this.truthTable.push(currentState);
        currentState = {
            $name: $('#s3Name_' + this.id),
            row0: {
                $p1: $('#' + this.id + ' .s3-table.p1').not('.editable'),
                $p0: $('#' + this.id + ' .s3-table.p0').not('.editable'),
                $b: $('#' + this.id + ' .s3-table.b').not('.editable'),
                $n1: $('#' + this.id + ' .s3-table.n1').not('.editable'),
                $n0: $('#' + this.id + ' .s3-table.n0').not('.editable'),
                $y: $('#' + this.id + ' .s3-table.y').not('.editable')
            },
            row1: {
                $p1: $('#' + this.id + ' .editable.s3-table.p1 div'),
                $p0: $('#' + this.id + ' .editable.s3-table.p0 div'),
                $b: $('#' + this.id + ' .editable.s3-table.b div'),
                $n1: $('#' + this.id + ' .editable.s3-table.n1 div'),
                $n0: $('#' + this.id + ' .editable.s3-table.n0 div'),
                $y: $('#' + this.id + ' .editable.s3-table.y div')
            }
        };
        this.truthTable.push(currentState);
        // Init
        this.disableS3();
        this.started = false;
        this.generateProgressionQuestion(0);
        this.displayCorrectAnswer();
        this.disableAllStateEdit();
        this.$userPrompt.text('');
        // Event listeners
        // Only allow 1s and 0s to be entered
        $('#' + this.id + ' .editable div').keypress(function(e) {
            if (e.which != 8 && e.which != 0 && isNaN(String.fromCharCode(e.which))) {
                e.preventDefault();
            }
            else if (e.which != 8 && e.which != 0 && (String.fromCharCode(e.which) != 0 && String.fromCharCode(e.which) != 1)) {
                e.preventDefault();
            }
            else if (e.which == 13) {
                e.preventDefault();
                self.progressionTool.check();
            }
            else if (e.which == 0) {

            }
            else {
                $(this).text('');
            }
        });

        $('#' + this.id + ' .state-name').keypress(function(e) {
            if (e.which == 13) {
                e.preventDefault();
                self.progressionTool.check();
            }
            else if ($(this).text().length == 2) {
                e.preventDefault();
            }
        });
    };

    // Return integer in range from |min| to |max|, inclusive.
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generates the progression question for the given |questionIndex|
    // the higher the index the harder the question
    this.generateProgressionQuestion = function(questionIndex) {
        $('#' + this.id + ' .editable div').removeClass('wrong-answer');
        $('#' + this.id + ' .state-name').removeClass('wrong-answer');

        switch (questionIndex) {
            case 0:
                this.generateProblem(questionIndex);
                this.disableAllStateEdit();
                this.enableStateEdit('s0', questionIndex % this.questionsPerSM, true);
                this.enableStateEdit('s1', questionIndex % this.questionsPerSM);
                this.enableStateEdit('s2', questionIndex % this.questionsPerSM);
                this.$userPrompt.text('Fill in present state and input bits.');
                break;
            case 1:
                this.generateProblem(questionIndex);
                this.disableAllStateEdit();
                this.enableStateEdit('s0', questionIndex % this.questionsPerSM, true);
                this.enableStateEdit('s1', questionIndex % this.questionsPerSM);
                this.enableStateEdit('s2', questionIndex % this.questionsPerSM);
                this.$userPrompt.text('Fill in output bits.');
                break;
            case 2:
                this.generateProblem(questionIndex);
                this.disableAllStateEdit();
                this.enableStateEdit('s0', questionIndex % this.questionsPerSM, true);
                this.enableStateEdit('s1', questionIndex % this.questionsPerSM);
                this.enableStateEdit('s2', questionIndex % this.questionsPerSM);
                this.$userPrompt.text('Fill in next state bits.');
                break;
            case 3:
                this.generateProblem(questionIndex);
                this.disableAllStateEdit();
                this.enableStateEdit('s0', questionIndex % this.questionsPerSM, true);
                this.enableStateEdit('s1', questionIndex % this.questionsPerSM);
                this.enableStateEdit('s2', questionIndex % this.questionsPerSM);
                this.$userPrompt.text('Fill in present state and input bits.');
                break;
            case 4:
                this.generateProblem(questionIndex);
                this.disableAllStateEdit();
                this.enableStateEdit('s0', questionIndex % this.questionsPerSM, true);
                this.enableStateEdit('s1', questionIndex % this.questionsPerSM);
                this.enableStateEdit('s2', questionIndex % this.questionsPerSM);
                this.$userPrompt.text('Fill in output bits.');
                break;
            case 5:
                this.generateProblem(questionIndex);
                this.disableAllStateEdit();
                this.enableStateEdit('s0', questionIndex % this.questionsPerSM, true);
                this.enableStateEdit('s1', questionIndex % this.questionsPerSM);
                this.enableStateEdit('s2', questionIndex % this.questionsPerSM);
                this.$userPrompt.text('Fill in next state bits.');
                break;
        }
    };

    this.generateProblem = function(questionIndex) {
        this.generateRandomSM(questionIndex);
        this.generateTableAnswer();
        this.displayCorrectAnswer();
        // Hide the state encoding on the SM for the second SM.
        if (questionIndex >= 3) {
            this.$s0Encoding.hide();
            this.$s1Encoding.hide();
            this.$s2Encoding.hide();
        }
        else {
            this.$s0Encoding.show();
            this.$s1Encoding.show();
            this.$s2Encoding.show();
        }

        this.clearUserAnswer(0, questionIndex);
        this.clearUserAnswer(1, questionIndex);
        this.clearUserAnswer(2, questionIndex);
    };

    this.displayCorrectAnswer = function() {
        for (var i = 0; i < this.truthTable.length; i++) {
            this.displayStateRow(i);
        }
    };

    this.displayStateRow = function(i) {
        this.truthTable[i].$name.text(this.correctAnswer[i].name);

        this.truthTable[i].row0.$p1.text(this.correctAnswer[i].row0.p1);
        this.truthTable[i].row0.$p0.text(this.correctAnswer[i].row0.p0);
        this.truthTable[i].row0.$b.text(this.correctAnswer[i].row0.b);
        this.truthTable[i].row0.$n1.text(this.correctAnswer[i].row0.n1);
        this.truthTable[i].row0.$n0.text(this.correctAnswer[i].row0.n0);
        this.truthTable[i].row0.$y.text(this.correctAnswer[i].row0.y);

        this.truthTable[i].row1.$p1.text(this.correctAnswer[i].row1.p1);
        this.truthTable[i].row1.$p0.text(this.correctAnswer[i].row1.p0);
        this.truthTable[i].row1.$b.text(this.correctAnswer[i].row1.b);
        this.truthTable[i].row1.$n1.text(this.correctAnswer[i].row1.n1);
        this.truthTable[i].row1.$n0.text(this.correctAnswer[i].row1.n0);
        this.truthTable[i].row1.$y.text(this.correctAnswer[i].row1.y);
    };

    this.removeUserEntries = function() {
        for (var i = 0; i < this.truthTable.length - 1; i++) {
            this.clearUserAnswer(i, true, 0);
        }
    };

    this.clearUserAnswer = function(i, questionIndex) {
        var part = questionIndex % this.questionsPerSM;
        var clearInputs = part <= 0;
        var clearYs = part <= 1;
        var clearNs = part <= 2;

        if (clearInputs) {
            this.truthTable[i].row1.$p1.text('');
            this.truthTable[i].row1.$p0.text('');
            this.truthTable[i].row1.$b.text('');
        }

        if (clearYs) {
            this.truthTable[i].row1.$y.text('');
        }

        if (clearNs) {
            this.truthTable[i].row1.$n0.text('');
            this.truthTable[i].row1.$n1.text('');
        }
    };

    this.generateRandomSM = function(questionIndex) {
        this.generateS0(questionIndex);
        this.generateS1(questionIndex);
        this.generateS2(questionIndex);
    };

    // Generates S0 randomly
    // Pick 2 of the 3 transitions to keep
    // Choose condition of b for one and b' for the other
    // Choose whether action is y = 1 or y = 0.
    this.generateS0 = function(questionIndex) {
        var generateAll = (questionIndex % this.questionsPerSM) === 0;
        var generateYs = ((questionIndex % this.questionsPerSM) === 1 && this.incorrect) || generateAll;
        var generateNs = ((questionIndex % this.questionsPerSM) === 2 && this.incorrect) || generateAll;

        if (generateNs) {
            this.$s0SelfTransition.show();
            this.$s0s1Transition.show();
            this.$s0s2Transition.show();

            var randomTransition = [ this.$s0SelfTransition, this.$s0s1Transition, this.$s0s2Transition ];
            var randomLabels = [ this.$s0SelfTransitionLabel, this.$s0s1TransitionLabel, this.$s0s2TransitionLabel ];
            var randomIndex = getRandomInt(0, 2);
            randomTransition[randomIndex].hide();
            randomTransition.splice(randomIndex, 1);
            randomLabels.splice(randomIndex, 1);
            randomIndex = getRandomInt(0, 1);
            randomLabels[randomIndex].text('b');
            randomLabels.splice(randomIndex, 1);
            randomLabels[0].text('b\'');
            randomLabels[0].text('b\'');
        }

        if (generateYs) {
            if (getRandomInt(0, 1)) {
                this.$s0Action.text('y = 1');
            }
            else {
                this.$s0Action.text('y = 0');
            }
        }
    };

    // Generates S1 randomly
    // Pick 2 of the 3 transitions to keep
    // Choose condition of b for one and b' for the other
    // Choose whether action is y = 1 or y = 0.
    this.generateS1 = function(questionIndex) {
        var generateAll = (questionIndex % this.questionsPerSM) === 0;
        var generateYs = ((questionIndex % this.questionsPerSM) === 1 && this.incorrect) || generateAll;
        var generateNs = ((questionIndex % this.questionsPerSM) === 2 && this.incorrect) || generateAll;

        if (generateNs) {
            this.$s1SelfTransition.show();
            this.$s1s0Transition.show();
            this.$s1s2Transition.show();

            var randomTransition = [ this.$s1SelfTransition, this.$s1s0Transition, this.$s1s2Transition ];
            var randomLabels = [ this.$s1SelfTransitionLabel, this.$s1s0TransitionLabel, this.$s1s2TransitionLabel ];
            // Always remove the self transition so that we can get to all states
            var randomIndex = 0;
            randomTransition[randomIndex].hide();
            randomTransition.splice(randomIndex, 1);
            randomLabels.splice(randomIndex, 1);

            randomIndex = getRandomInt(0, 1);
            randomLabels[randomIndex].text('b');
            randomLabels.splice(randomIndex, 1);
            randomLabels[0].text('b\'');
            randomLabels[0].text('b\'');
        }
        if (generateYs) {
            if (getRandomInt(0, 1)) {
                this.$s1Action.text('y = 1');
            }
            else {
                this.$s1Action.text('y = 0');
            }
        }
    };

    // Generates S2 randomly
    // Pick 2 of the 3 transitions to keep
    // Choose condition of b for one and b' for the other
    // Choose whether action is y = 1 or y = 0.
    this.generateS2 = function(questionIndex) {
        var generateAll = (questionIndex % this.questionsPerSM) === 0;
        var generateYs = ((questionIndex % this.questionsPerSM) === 1 && this.incorrect) || generateAll;
        var generateNs = ((questionIndex % this.questionsPerSM) === 2 && this.incorrect) || generateAll;

        if (generateNs) {
            this.$s2SelfTransition.show();
            this.$s2s1Transition.show();
            this.$s2s0Transition.show();

            var randomTransition = [ this.$s2SelfTransition, this.$s2s0Transition, this.$s2s1Transition ];
            var randomLabels = [ this.$s2SelfTransitionLabel, this.$s2s0TransitionLabel, this.$s2s1TransitionLabel ];
            // Always remove the self transition so that we can get to all states
            var randomIndex = 0;
            randomTransition[randomIndex].hide();
            randomTransition.splice(randomIndex, 1);
            randomLabels.splice(randomIndex, 1);
            randomIndex = getRandomInt(0, 1);
            randomLabels[randomIndex].text('b');
            randomLabels.splice(randomIndex, 1);
            randomLabels[0].text('b\'');
            randomLabels[0].text('b\'');
        }
        if (generateYs) {
            if (getRandomInt(0, 1)) {
                this.$s2Action.text('y = 1');
            }
            else {
                this.$s2Action.text('y = 0');
            }
        }
    };

    // Generates array |correctAnswer| from the state of what is enabled in the FSM
    this.generateTableAnswer = function() {
        this.correctAnswer = [];
        this.generateS0Answer();
        this.generateS1Answer();
        this.generateS2Answer();
        this.generateS3Answer();
    };

    // Uses the state of of what is visible in the state machine concerning S0 to generate the entries in the truth table
    // for this state.
    // Input variables for the state remain unchanged. Every iteration will have the same p1, p0, and b for both rows.
    // y is the same for both rows and is determined by the assignment made in the generation process (y = 0 or y = 1)
    // n1, n0 for row0 is the encoding of the state that will be transitioned to when in S0 and b is 0.
    // n1, n0 for row1 is the encoding of the state that will be transitioned to when in S0 and b is 1.
    this.generateS0Answer = function() {
        var currentState = {
            name: 'Unused',
            row0: {
                p1: 0,
                p0: 0,
                b: 0,
                n1: 0,
                n0: 0,
                y: 0
            },
            row1: {
                p1: 0,
                p0: 0,
                b: 1,
                n1: 0,
                n0: 0,
                y: 0
            }
        };
        if (!this.$s0.is(':hidden')) {
            currentState.name = 's0';
            if (this.$s0Action.text().indexOf('0') !== -1) {
                currentState.row0.y = 0;
                currentState.row1.y = 0;
            }
            else {
                currentState.row0.y = 1;
                currentState.row1.y = 1;
            }
            if (!this.$s0SelfTransition.is(':hidden')) {
                if (this.$s0SelfTransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 0;
                }
                else if (this.$s0SelfTransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 0;
                    currentState.row0.n0 = 0;
                }
            }
            if (!this.$s0s1Transition.is(':hidden')) {
                if (this.$s0s1TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 1;
                }
                else if (this.$s0s1TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 0;
                    currentState.row0.n0 = 1;
                }
            }
            if (!this.$s0s2Transition.is(':hidden')) {
                if (this.$s0s2TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 0;
                }
                else if (this.$s0s2TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 1;
                    currentState.row0.n0 = 0;
                }
            }
            if (!this.$s0s3Transition.is(':hidden')) {
                if (this.$s0s3TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 1;
                }
                else if (this.$s0s3TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 1;
                    currentState.row0.n0 = 1;
                }
            }
        }
        this.correctAnswer[0] = currentState;
    };

    // Uses the state of of what is visible in the state machine concerning S1 to generate the entries in the truth table
    // for this state.
    // Input variables for the state remain unchanged. Every iteration will have the same p1, p0, and b for both rows.
    // y is the same for both rows and is determined by the assignment made in the generation process (y = 0 or y = 1)
    // n1, n0 for row0 is the encoding of the state that will be transitioned to when in S1 and b is 0.
    // n1, n0 for row1 is the encoding of the state that will be transitioned to when in S1 and b is 1.
    this.generateS1Answer = function() {
        var currentState = {
            name: 'Unused',
            row0: {
                p1: 0,
                p0: 1,
                b: 0,
                n1: 0,
                n0: 0,
                y: 0
            },
            row1: {
                p1: 0,
                p0: 1,
                b: 1,
                n1: 0,
                n0: 0,
                y: 0
            }
        };
        if (!this.$s1.is(':hidden')) {
            currentState.name = 's1';
            if (this.$s1Action.text().indexOf('0') !== -1) {
                currentState.row0.y = 0;
                currentState.row1.y = 0;
            }
            else {
                currentState.row0.y = 1;
                currentState.row1.y = 1;
            }
            if (!this.$s1SelfTransition.is(':hidden')) {
                if (this.$s1SelfTransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 1;
                }
                else if (this.$s1SelfTransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 0;
                    currentState.row0.n0 = 1;
                }
            }
            if (!this.$s1s0Transition.is(':hidden')) {
                if (this.$s1s0TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 0;
                }
                else if (this.$s1s0TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 0;
                    currentState.row0.n0 = 0;
                }
            }
            if (!this.$s1s2Transition.is(':hidden')) {
                if (this.$s1s2TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 0;
                }
                else if (this.$s1s2TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 1;
                    currentState.row0.n0 = 0;
                }
            }
            if (!this.$s1s3Transition.is(':hidden')) {
                if (this.$s1s3TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row.n1 = 1;
                    currentState.row1.n0 = 1;
                }
                else if (this.$s1s3TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 1;
                    currentState.row0.n0 = 1;
                }
            }
        }
        this.correctAnswer[1] = currentState;
    };

    // Uses the state of of what is visible in the state machine concerning S2 to generate the entries in the truth table
    // for this state.
    // Input variables for the state remain unchanged. Every iteration will have the same p1, p0, and b for both rows.
    // y is the same for both rows and is determined by the assignment made in the generation process (y = 0 or y = 1)
    // n1, n0 for row0 is the encoding of the state that will be transitioned to when in S2 and b is 0.
    // n1, n0 for row1 is the encoding of the state that will be transitioned to when in S2 and b is 1.
    this.generateS2Answer = function() {
        var currentState = {
            name: 'Unused',
            row0: {
                p1: 1,
                p0: 0,
                b: 0,
                n1: 0,
                n0: 0,
                y: 0
            },
            row1: {
                p1: 1,
                p0: 0,
                b: 1,
                n1: 0,
                n0: 0,
                y: 0
            }
        };
        if (!this.$s2.is(':hidden')) {
            currentState.name = 's2';
            if (this.$s2Action.text().indexOf('0') !== -1) {
                currentState.row0.y = 0;
                currentState.row1.y = 0;
            }
            else {
                currentState.row0.y = 1;
                currentState.row1.y = 1;
            }
            if (!this.$s2SelfTransition.is(':hidden')) {
                if (this.$s2SelfTransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 0;
                }
                else if (this.$s2SelfTransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 1;
                    currentState.row0.n0 = 0;
                }
            }
            if (!this.$s2s1Transition.is(':hidden')) {
                if (this.$s2s1TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 1;
                }
                else if (this.$s2s1TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 0;
                    currentState.row0.n0 = 1;
                }
            }
            if (!this.$s2s0Transition.is(':hidden')) {
                if (this.$s2s0TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 0;
                }
                else if (this.$s2s0TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 0;
                    currentState.row0.n0 = 0;
                }
            }
            if (!this.$s2s3Transition.is(':hidden')) {
                if (this.$s2s3TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 1;
                }
                else if (this.$s2s3TransitionLabel.text().indexOf('\'') !== -1) {
                    currentState.row0.n1 = 1;
                    currentState.row0.n0 = 1;
                }
            }
        }
        this.correctAnswer[2] = currentState;
    };

    // Uses the state of of what is visible in the state machine concerning S3 to generate the entries in the truth table
    // for this state.
    // Input variables for the state remain unchanged. Every iteration will have the same p1, p0, and b for both rows.
    // y is the same for both rows and is determined by the assignment made in the generation process (y = 0 or y = 1)
    // n1, n0 for row0 is the encoding of the state that will be transitioned to when in S3 and b is 0.
    // n1, n0 for row1 is the encoding of the state that will be transitioned to when in S3 and b is 1.
    this.generateS3Answer = function() {
        var currentState = {
            name: 'Unused',
            row0: {
                p1: 1,
                p0: 1,
                b: 0,
                n1: 0,
                n0: 0,
                y: 0
            },
            row1: {
                p1: 1,
                p0: 1,
                b: 1,
                n1: 0,
                n0: 0,
                y: 0
            }
        };
        if (!this.$s3.is(':hidden')) {
            currentState.name = 's3';
            if (this.$s3Action.text().indexOf('0') !== -1) {
                currentState.row0.y = 0;
                currentState.row1.y = 0;
            }
            else {
                currentState.row0.y = 1;
                currentState.row1.y = 1;
            }
            if (!this.$s3SelfTransition.is(':hidden')) {
                if (!this.$s3SelfTransitionLabel.is(':hidden')) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 1;
                }
                else if (!this.$s3SelfTransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 1;
                }
            }
            if (!this.$s3s1Transition.is(':hidden')) {
                if (!this.$s3s1TransitionLabel.is(':hidden')) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 1;
                }
                else if (!this.$s3s1TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 1;
                }
            }
            if (!this.$s3s2Transition.is(':hidden')) {
                if (!this.$s3s2TransitionLabel.is(':hidden')) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 0;
                }
                else if (!this.$s3s2TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 1;
                    currentState.row1.n0 = 0;
                }
            }
            if (!this.$s3s0Transition.is(':hidden')) {
                if (!this.$s3s0TransitionLabel.is(':hidden')) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 0;
                }
                else if (!this.$s3s0TransitionLabel.text().indexOf('\'') === -1) {
                    currentState.row1.n1 = 0;
                    currentState.row1.n0 = 0;
                }
            }
        }
        this.correctAnswer[3] = currentState;
    };

    this.enableStateEdit = function(stateToEnable, questionIndex, focusThis) {
        $('#' + this.id + ' .editable.' + stateToEnable + '-table div').prop('contentEditable', false);
        $('#' + this.id + ' .editable.' + stateToEnable + '-table').removeClass('can-edit');
        switch (questionIndex) {
            case 0:
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.p1  div').prop('contentEditable', true);
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.p1').addClass('can-edit');
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.p0  div').prop('contentEditable', true);
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.p0').addClass('can-edit');
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.b  div').prop('contentEditable', true);
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.b').addClass('can-edit');
                if (focusThis && this.started) {
                    $('#' + this.id + ' .editable.' + stateToEnable + '-table.p1 div').focus();
                }
                break;
            case 1:
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.y  div').prop('contentEditable', true);
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.y').addClass('can-edit');
                if (focusThis && this.started) {
                    $('#' + this.id + ' .editable.' + stateToEnable + '-table.y div').focus();
                }
                break;
            case 2:
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.n1  div').prop('contentEditable', true);
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.n1').addClass('can-edit');
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.n0  div').prop('contentEditable', true);
                $('#' + this.id + ' .editable.' + stateToEnable + '-table.n0').addClass('can-edit');
                if (focusThis && this.started) {
                    $('#' + this.id + ' .editable.' + stateToEnable + '-table.n1 div').focus();
                }
                break;
        }
    };

    this.disableAllStateEdit = function() {
        $('#' + this.id + ' .editable div').prop('contentEditable', false);
        $('#' + this.id + ' .state-name div').prop('contentEditable', false);

        $('#' + this.id + ' .editable').removeClass('can-edit');
        $('#' + this.id + ' .state-name').removeClass('can-edit');
    };

    // Verfies that the answer is correct
    this.verifyAnswer = function(currentQuestion) {
        var passed = true;
        var part = currentQuestion % (this.questionsPerSM);
        let userAnswer = '';

        switch (part) {
            case 0:
                for (var i = 0; i < this.truthTable.length; i++) {
                    const p1Value = this.truthTable[i].row1.$p1.text();
                    const p0Value = this.truthTable[i].row1.$p0.text();
                    const bValue = this.truthTable[i].row1.$b.text();

                    userAnswer += `${p1Value}, ${p0Value}, ${bValue}, `;

                    if (parseInt(p1Value) !== this.correctAnswer[i].row1.p1) {
                        passed = false;
                        this.truthTable[i].row1.$p1.addClass('wrong-answer');
                    }
                    if (parseInt(p0Value) !== this.correctAnswer[i].row1.p0) {
                        passed = false;
                        this.truthTable[i].row1.$p0.addClass('wrong-answer');
                    }
                    if (parseInt(bValue) !== this.correctAnswer[i].row1.b) {
                        passed = false;
                        this.truthTable[i].row1.$b.addClass('wrong-answer');
                    }
                }
                break;
            case 1:
                for (var i = 0; i < this.truthTable.length; i++) {
                    const yValue = this.truthTable[i].row1.$y.text();

                    userAnswer += `${yValue}, `;

                    if (parseInt(yValue) !== this.correctAnswer[i].row1.y) {
                        passed = false;
                        this.truthTable[i].row1.$y.addClass('wrong-answer');
                    }
                }
                break;
            case 2:
                for (var i = 0; i < this.truthTable.length; i++) {
                    const n1Value = this.truthTable[i].row1.$n1.text();
                    const n0Value = this.truthTable[i].row1.$n0.text();

                    userAnswer = `${n1Value}, ${n0Value}, `;

                    if (parseInt(n1Value) !== this.correctAnswer[i].row1.n1) {
                        passed = false;
                        this.truthTable[i].row1.$n1.addClass('wrong-answer');
                    }
                    if (parseInt(n0Value) !== this.correctAnswer[i].row1.n0) {
                        passed = false;
                        this.truthTable[i].row1.$n0.addClass('wrong-answer');
                    }
                }
                break;
        }
        return { isAnswerCorrect: passed, userAnswer };
    };

    this.disableS0 = function() {
        this.$s0.hide();
        this.$s0Label.hide();
        this.$s0SelfTransition.hide();
        this.$s0SelfTransitionLabel.hide();
        this.$s0s1Transition.hide();
        this.$s0s1TransitionLabel.hide();
        this.$s0s2Transition.hide();
        this.$s0s2TransitionLabel.hide();
        this.$s0s3Transition.hide();
        this.$s0s3TransitionLabel.hide();

        this.$s3s0Transition.hide();
        this.$s2s0Transition.hide();
        this.$s1s0Transition.hide();
    };

    this.disableS1 = function() {
        this.$s1.hide();
        this.$s1Label.hide();
        this.$s1SelfTransition.hide();
        this.$s1SelfTransitionLabel.hide();
        this.$s1s0Transition.hide();
        this.$s1s0TransitionLabel.hide();
        this.$s1s2Transition.hide();
        this.$s1s2TransitionLabel.hide();
        this.$s1s3Transition.hide();
        this.$s1s3TransitionLabel.hide();

        this.$s3s1Transition.hide();
        this.$s2s1Transition.hide();
        this.$s0s1Transition.hide();
    };

    this.disableS2 = function() {
        this.$s2.hide();
        this.$s2Label.hide();
        this.$s2SelfTransition.hide();
        this.$s2SelfTransitionLabel.hide();
        this.$s2s1Transition.hide();
        this.$s2s1TransitionLabel.hide();
        this.$s2s0Transition.hide();
        this.$s2s0TransitionLabel.hide();
        this.$s2s3Transition.hide();
        this.$s2s3TransitionLabel.hide();

        this.$s3s2Transition.hide();
        this.$s0s2Transition.hide();
        this.$s1s2Transition.hide();
    };

    this.disableS3 = function() {
        this.$s3.hide();
        this.$s3Label.hide();
        this.$s3SelfTransition.hide();
        this.$s3SelfTransitionLabel.hide();
        this.$s3s1Transition.hide();
        this.$s3s1TransitionLabel.hide();
        this.$s3s2Transition.hide();
        this.$s3s2TransitionLabel.hide();
        this.$s3s0Transition.hide();
        this.$s3s0TransitionLabel.hide();

        this.$s0s3Transition.hide();
        this.$s2s3Transition.hide();
        this.$s1s3Transition.hide();
    };


    <%= grunt.file.read(hbs_output) %>
}

var fsmToTruthTableExport = {
    create: function() {
        return new FsmToTruthTable();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = fsmToTruthTableExport;
