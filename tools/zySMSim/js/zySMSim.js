function ZySMSim() {
    var self;
    var holdTimeout;
    this.init = function(id, parentResource, options) {
        self = this;
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.css = '<style><%= grunt.file.read(css_filename) %></style>';

        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }

        this.isProgressionTool = options != null && options['progressive'];
        this.digDesignMode = options != null && options['digDesignMode'];
        this.HLSM = options != null && options['HLSM'];
        this.html = this[this.name]['template']({
            id: this.id,
            isProgressionTool: this.isProgressionTool
        });
        this.zyIO = require('zyIO');
        this.zyIOTestVector = require('zyIOTestVector');
        if (this.isProgressionTool) {
            var tryAgain = false;
            var questionsPerDifficulty = 1;
            this.progressionTool = require('progressionTool').create();
            this.progressionTool.init(this.id, parentResource, {
                html: this.html,
                css: this.css,
                numToWin: this.HLSM ? 3 : 4,
                useMultipleParts: this.useMultipleParts,
                start: function() {
                    tryAgain = false;
                    if (self.HLSM) {
                        self.problem = self.generateHLSMProgressionQuestion(0);
                    }
                    else {
                        self.problem = self.generateProgressionQuestion(0, questionsPerDifficulty);
                    }

                    $('#progressionPrompt_' + self.id).html(self.problem.question);
                    self.turnOnOffControlsForProgression(true);
                },
                reset: function() {
                    tryAgain = false;
                    $('#progressionPrompt_' + self.id).text('');
                    self.turnOnOffControlsForProgression(false);
                    self.clearSM();
                },
                next: function(currentQuestion) {
                    if (!tryAgain) {
                        if (self.HLSM) {
                            self.problem = self.generateHLSMProgressionQuestion(currentQuestion);
                        }
                        else {
                            self.problem = self.generateProgressionQuestion(currentQuestion, questionsPerDifficulty);
                        }
                        $('#progressionPrompt_' + self.id).html(self.problem.question);
                    }
                    self.turnOnOffControlsForProgression(true);
                    tryAgain = false;
                },
                isCorrect: function() {
                    return new Ember.RSVP.Promise(function(resolve) {
                        $('#testVectorWindow_' + self.id).val(self.problem.testVector);
                        var currentProblem = {};

                        currentProblem.inputStrings = {};
                        if (self.problem.inputString) {
                            currentProblem.inputStrings[self.problem.inputString] = true;
                        }

                        currentProblem.outputStrings = self.problem.outputsToReport;
                        currentProblem.hasDontCareValues = self.problem.hasDontCareValues;
                        currentProblem.correctPattern = self.problem.correctPattern;
                        currentProblem.commands = $('#testVectorWindow_' + self.id).val().toLowerCase().split(/\r\n|\r|\n/g);
                        self.testProgressionSM(currentProblem).then(function(value) {
                            var explanationMessage = value.errorMessage;
                            var isCorrect = (value.passed && !value.couldNotExecute);
                            var userAnswer = value.resultData.outputs[0].values.join(',');
                            var expectedAnswer = value.resultData.correctPattern;

                            if (isCorrect) {
                                explanationMessage = 'Correct';
                            }

                            explanationMessage += value.resultHTML;

                            self.turnOnOffControlsForProgression(false);
                            resolve({
                                explanationMessage,
                                userAnswer,
                                expectedAnswer,
                                isCorrect,
                                metadata: {
                                    userSM: self.saveToJSON(),
                                },
                            });
                        });
                    });
                },
            });

        }
        else {
            $('#' + this.id).html(this.css + this.html);
            $('#' + this.id).click(function() {
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'zySMSim clicked'
                    }
                };
                parentResource.postEvent(event);
            });
        }
        initZySMSim(this.id, options);
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>

    // Helper for a 'random' integer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function looksBinary(number) {
        var isBinaryLooking = false;
        isBinaryLooking = (number === 11) || isBinaryLooking;
        isBinaryLooking = (number === 10) || isBinaryLooking;
        isBinaryLooking = (number === 1) || isBinaryLooking;
        isBinaryLooking = (number === 100) || isBinaryLooking;
        isBinaryLooking = (number === 101) || isBinaryLooking;
        isBinaryLooking = (number === 110) || isBinaryLooking;
        isBinaryLooking = (number === 111) || isBinaryLooking;
    }
    function nonBinaryRandomInt(min, max) {
        var nonBinaryLookingInt = getRandomInt(min, max);
        if (min !== max) {
            while (looksBinary(nonBinaryLookingInt)) {
                nonBinaryLookingInt = getRandomInt(min, max);
            }
        }
        return nonBinaryLookingInt;
    }
    this.generateHLSMProgressionQuestion = function(questionIndex) {
        var generatedQuestion = '';
        var testVector = '';
        var correctPattern = '';
        var answer = '';
        var outputsToReport;
        var inputString = '';
        var outputString = '';
        var hasDontCareValues = false;
        // Generate level one question
        // Simple no input one output generate a pattern
        if (questionIndex == 0) {
            var variableName = 'Z';
            var patternLength = 3;
            for (var i = 0; i < patternLength; i++) {
                var randomNumber = nonBinaryRandomInt(0, 255);
                correctPattern += randomNumber + ' ';
                testVector += 'assert ' + variableName + ' = 0x' + ((randomNumber < 16) ? '0' : '') + randomNumber.toString(16) + '\n';
            }
            var simplePattern = correctPattern;
            correctPattern = correctPattern + correctPattern + correctPattern;
            testVector = testVector + testVector + testVector;
            correctPattern = correctPattern.trim();

            generatedQuestion = 'Generate the repeated pattern ' + simplePattern + ' on ' + variableName + '.';
            outputString = variableName;

            outputsToReport = {
                'Z': true
            };

        }
        // Generate level two question
        else if (questionIndex == 1) {
            var variableName = 'Z';
            var patternLength = 3;
            var incrementAmount = getRandomInt(1, 10);
            var startValue = nonBinaryRandomInt(1, 100);
            for (var i = 0; i < patternLength; i++) {
                var newValue = startValue + incrementAmount * i;
                correctPattern += newValue + ' ';
                testVector += 'assert ' + variableName + ' = 0x' + ((newValue < 16) ? '0' : '') + newValue.toString(16) + '\n';
            }
            var simplePattern = correctPattern;
            for (var i = patternLength; i < patternLength * 3; i++) {
                var newValue = startValue + incrementAmount * i;
                correctPattern += newValue + ' ';
                testVector += 'assert ' + variableName + ' = 0x' + ((newValue < 16) ? '0' : '') + newValue.toString(16) + '\n';
            }
            correctPattern = correctPattern.trim();
            generatedQuestion = 'Generate on ' + variableName + ' the pattern starting at ' + startValue + ' and incrementing by ' + incrementAmount + ' each cycle.';
            outputString = variableName;
            outputsToReport = {
                'Z': true
            };
        }
        // Generate level three question
        else if (questionIndex == 2) {
            outputString = 'u';
            inputString = 'E';
            var randomNumber = nonBinaryRandomInt(1, 254);
            var operation = [ '<', '>', '=' ];
            var operationNames = [ 'less than', 'greater than', 'equal to' ];
            var randomIndex = getRandomInt(0, 2);
            for (var j = 0; j < 2; j++) {
                if (j == 0) {
                    switch (randomIndex) {
                        case 0:
                            var newRandomNumber = getRandomInt(0, randomNumber - 1);
                            testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                            testVector += 'assert 0bxxx0xxxx\n';
                            correctPattern += '0 ';
                            break;
                        case 1:
                            var newRandomNumber = getRandomInt(randomNumber + 1, 255);
                            testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                            testVector += 'assert 0bxxx0xxxx\n';
                            correctPattern += '0 ';
                            break;
                        case 2:
                            var newRandomNumber = randomNumber;
                            testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                            testVector += 'assert 0bxxx0xxxx\n';
                            correctPattern += '0 ';
                            break;
                    }
                }
                else {
                    switch (randomIndex) {
                        case 0:
                            var newRandomNumber = getRandomInt(0, randomNumber - 1);
                            testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                            break;
                        case 1:
                            var newRandomNumber = getRandomInt(randomNumber + 1, 255);
                            testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                            break;
                        case 2:
                            var newRandomNumber = randomNumber;
                            testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                            break;
                    }
                }

                for (var i = 0; i < 4; i++) {
                    testVector += 'assert 0bxxx1xxxx\n';
                    correctPattern += '1 ';
                    testVector += 'assert 0bxxx0xxxx\n';
                    correctPattern += '0 ';
                }

                switch (randomIndex) {
                    case 0:
                        var newRandomNumber = getRandomInt(randomNumber, 255);
                        testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                        testVector += 'assert 0bxxx0xxxx\n';
                        correctPattern += '0 ';
                        break;
                    case 1:
                        var newRandomNumber = getRandomInt(0, randomNumber);
                        testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                        testVector += 'assert 0bxxx0xxxx\n';
                        correctPattern += '0 ';
                        break;
                    case 2:
                        var newRandomNumber = getRandomInt(randomNumber, 255);
                        testVector += inputString + ' 0x' + ((newRandomNumber < 16) ? '0' : '') + newRandomNumber.toString(16) + '\n';
                        testVector += 'assert 0bxxx0xxxx\n';
                        correctPattern += '0 ';
                        break;
                }

                for (var i = 0; i < 2; i++) {
                    testVector += 'assert 0bxxx0xxxx\n';
                    correctPattern += '0 ';
                }
            }
            correctPattern = correctPattern.trim();
            generatedQuestion = 'While ' + inputString + ' is ' + operationNames[randomIndex] + ' ' + randomNumber + ', toggle ' + outputString + ' each cycle. Otherwise, ' + outputString + ' is 0. Start ' + outputString + ' at 0.';
            outputsToReport = {
                u: true
            };
        }

        return {
            question: generatedQuestion,
            testVector: testVector,
            outputsToReport: outputsToReport,
            correctPattern: correctPattern,
            inputString: inputString,
            outputString: outputString,
            hasDontCareValues: hasDontCareValues
        };
    };

    this.generateProgressionQuestion = function(questionIndex, questionsPerDifficulty) {
        var levelOne = 0;
        var levelTwo = levelOne + questionsPerDifficulty;
        var levelThree = levelTwo + questionsPerDifficulty;
        var levelFour = levelThree + questionsPerDifficulty;
        var generatedQuestion = '';
        var testVector = '';
        var correctPattern = '';
        let simplePattern = '';
        let retry = true;
        let patternLength = 3;
        let firstChar = '';
        var answer = '';
        var outputsToReport = {};
        var inputString = '';
        var outputString = '';
        var hasDontCareValues = false;
        // Generate level one question
        // Simple no input one output generate a pattern
        if (questionIndex >= levelOne && questionIndex < levelTwo) {
            while (retry) {
                correctPattern = '';
                testVector = '';
                retry = true;
                firstChar = '';
                for (var i = 0; i < patternLength; i++) {
                    if (getRandomInt(0, 1)) {
                        correctPattern += '1 ';
                        testVector += 'assert 0b1xxxxxxx\n';
                        if (!firstChar) {
                            firstChar = '1';
                        }
                        else if (firstChar === '0') {
                            retry = false;
                        }
                    }
                    else {
                        correctPattern += '0 ';
                        testVector += 'assert 0b0xxxxxxx\n';
                        if (!firstChar) {
                            firstChar = '0';
                        }
                        else if (firstChar === '1') {
                            retry = false;
                        }
                    }
                }
                simplePattern = correctPattern;
                correctPattern = correctPattern + correctPattern + correctPattern;
                testVector = testVector + testVector + testVector;
                correctPattern = correctPattern.trim();
            }


            if (self.digDesignMode) {
                generatedQuestion = 'Generate the repeated pattern ' + simplePattern + ' on z';
                outputString = 'z';
                outputsToReport = {
                    z: true
                };
            }
            else {
                generatedQuestion = 'Generate the repeated pattern ' + simplePattern + ' on B7';
                outputString = 'B7';
                outputsToReport = {
                    B7: true
                };
            }


        }

        // Generate level two question
        // Two outputs gen pattern
        else if (questionIndex >= levelTwo && questionIndex < levelThree) {
            while (retry) {
                const possibleSubPatterns = [ '00', '01', '10', '11' ];
                const subPatterns = require('utilities').pickNElementsFromArray(possibleSubPatterns, patternLength);

                firstChar = '';
                correctPattern = '';
                testVector = '';
                retry = true;
                subPatterns.forEach(subPattern => { // eslint-disable-line no-loop-func
                    const reversedSubPattern = subPattern.split('').reverse().join('');
                    const testVectorPattern = this.digDesignMode ? `0b${reversedSubPattern}xxxxxx` : `0b${subPattern}xxxxxx`;

                    correctPattern += `${subPattern} `;
                    testVector += `assert ${testVectorPattern}\n`;
                    if (!firstChar) {
                        firstChar = subPattern;
                    }
                    else if (firstChar !== subPattern) {
                        retry = false;
                    }
                });
                simplePattern = correctPattern;
                correctPattern = correctPattern + correctPattern + correctPattern;
                testVector = testVector + testVector + testVector;
                correctPattern = correctPattern.trim();
            }
            if (self.digDesignMode) {
                outputString = 'yz';
                outputsToReport = {
                    z: true, // eslint-disable-line id-length
                    y: true, // eslint-disable-line id-length
                };
            }
            else {
                outputString = 'B7B6';
                outputsToReport = {
                    B6: true,
                    B7: true,
                };
            }
            generatedQuestion = `Generate the repeated pattern ${simplePattern} on ${outputString}`;
        }

        // Generate level three question
        // Add input generate pattern while input is high
        else if (questionIndex >= levelThree && questionIndex < levelFour) {
            patternLength = 2;
            do {
                correctPattern = '';
                testVector = '';
                for (var i = 0; i < patternLength; i++) {
                    if (getRandomInt(0, 1)) {
                        correctPattern += '1 ';
                        testVector += 'assert 0b1xxxxxxx\n';
                    }
                    else {
                        correctPattern += '0 ';
                        testVector += 'assert 0b0xxxxxxx\n';
                    }
                }
                simplePattern = correctPattern.trim();
            } while (simplePattern == '0 0' || simplePattern == '1 1');

            testVector = 'assert 0b0xxxxxxx\nassert 0b0xxxxxxx\n0x02\n' + testVector + '0x00\nassert 0b0xxxxxxx\n' +
                         'assert 0b0xxxxxxx\nassert 0b0xxxxxxx\n0x02\n' + testVector;
            correctPattern = '0 0 ' + correctPattern + '0 0 0 ' + correctPattern;
            correctPattern = correctPattern.trim();

            if (self.digDesignMode) {
                outputString = 'z';
                inputString = 'b';
            }
            else {
                outputString = 'B7';
                inputString = 'A1';
            }

            outputsToReport[outputString] = true;
            generatedQuestion = 'Generate the pattern ' + simplePattern + ' on ' + outputString + ' while ' + inputString + ' is 1. ' +
                                outputString + ' should be 0 otherwise.' + require('utilities').getNewline() +
                                'Assume ' + inputString + ' will stay 1 for at least 2 cycles.';
        }

        // Generate level four question
        // Gen a one cycle pulse from an any length pulse
        else if (questionIndex >= levelFour) {
            testVector += '0x00\n' +
                          'assert 0b0xxxxxxx\n' +
                          '0x02\n' +
                          'assert 0b1xxxxxxx\n' +
                          'assert 0b0xxxxxxx\n' +
                          'assert 0b0xxxxxxx\n' +
                          'assert 0b0xxxxxxx\n' +
                          '0x00\n' +
                          'assert 0b0xxxxxxx\n' +
                          '0x02\n' +
                          'assert 0b1xxxxxxx\n' +
                          'assert 0b0xxxxxxx\n' +
                          'assert 0b0xxxxxxx\n';

            correctPattern = '0 1 0 0 0 0 1 0 0';
            correctPattern = correctPattern.trim();

            if (self.digDesignMode) {
                outputString = 'z';
                inputString = 'b';
            }
            else {
                outputString = 'B7';
                inputString = 'A1';
            }

            outputsToReport[outputString] = true;
            generatedQuestion = 'When ' + inputString + ' rises, generate a one cycle pulse on ' + outputString + '.  Keep ' +
                                outputString + ' at 0 otherwise.';

        }

        return {
            question: generatedQuestion,
            testVector: testVector,
            outputsToReport: outputsToReport,
            correctPattern: correctPattern,
            inputString: inputString,
            outputString: outputString,
            hasDontCareValues: hasDontCareValues
        };
    };

    function initZySMSim(zyID, options) {
        var canvas;
        var context;
        var graphs;
        var drawThreadId;
        var outputDrawThreadId;
        var selectedNode;
        var selectedEdge;
        var mousePos;
        var transitionMode;
        var dragged;
        var canDrag;
        var canEdit;
        var currentIndex;
        var smElapsedTime;
        var executingNodes;
        var gcdPeriod;
        var tabInput;
        var tabInputIn;
        var globalCode;
        var simulateOnly;
        var generateRIMS;
        var canExport;
        var digDesignMode;
        var HLSM;
        var zySMSimActive;
        var canMove;
        var progressionExecutionErrorMessage;
        var fieldFocused;
        var reDrawStateMachine;
        var hideTestVector;
        var inputs;
        var outputs;
        var paused;
        var currentTestVectorIndex;
        var inputSize;
        var outputSize;
        var outputOffset;
        var A = 0,
            A0 = 0,
            A1 = 0,
            A2 = 0,
            A3 = 0,
            A4 = 0,
            A5 = 0,
            A6 = 0,
            A7 = 0;
        var B = 0,
            B0 = 0,
            B1 = 0,
            B2 = 0,
            B3 = 0,
            B4 = 0,
            B5 = 0,
            B6 = 0,
            B7 = 0;
        var a = 0,
            b = 0,
            c = 0,
            d = 0,
            e = 0,
            f = 0,
            g = 0,
            h = 0;
        var I = 0,
            J = 0,
            E = 0,
            F = 0;
        var Y = 0,
            Z = 0;
        var z = 0,
            y = 0,
            x = 0,
            w = 0,
            v = 0,
            u = 0,
            t = 0,
            s = 0;
        var currentAction;
        var currentCondition;
        //Carson 8/16/2021
        var simulateID, testVectorID, updateTimerBarID;
        var timerPercent; //Carson 8/16/2021
        var speedChoice;

        // In miliseconds
        var ANIMATION_DURATION = 200;
        var SELECTION_BOUNDING_BOX_OFFSETS = {
            x: -5,
            y: -5,
            width: 10,
            height: 10
        };
        var DEBUG = false;
        Array.prototype.indexOfObject = function arrayObjectIndexOf(value) {
            for (var i = 0, len = this.length; i < len; i++) {
                if (this[i] === value) {
                    return i;
                }
            }
            return -1;
        };

        function init() {
            canvas = $('#drawingArea_' + zyID)[0];
            context = canvas.getContext('2d');
            mousePos = null;
            selectedNode = null;
            selectedEdge = null;
            transitionMode = false;
            simulateID = 0;
            testVectorID = 0;
            updateTimerBarID = 0; //Carson 8/16/2021
            timerPercent = 0; //Carson 8/16/2021
            currentIndex = 0;
            zySMSimActive = false;
            globalCode = '';
            canEdit = true;
            fieldFocused = false;
            paused = false;
            inputSize = 8;
            outputSize = 8;
            outputOffset = 0;
            simulateOnly = ((options && options.simulateOnly !== undefined) ? options.simulateOnly : false);
            digDesignMode = ((options && options['digDesignMode'] !== undefined) ? options['digDesignMode'] : false);
            canExport = ((options && options.canExport !== undefined) ? options.canExport : true);
            hideTestVector = ((options && options.hideTestVector !== undefined) ? options.hideTestVector : false);
            HLSM = ((options && options.HLSM !== undefined) ? options.HLSM : false);
            generateRIMS = ((options && options.generateRIMS !== undefined) ? options.generateRIMS : false);
            graphs = [];
            createInputs();
        }

        function functionIOLoadCompleted() {
            inputs = self.input.bitInputs;
            inputs.decimalInput = self.input.decimalInput;
            outputs = self.output.bitOutputs;
            outputs.decimalOutput = self.output.decimalOutput;
            if (!self.isProgressionTool) {
                // Tabs for the different SMs
                $('#canvasTab_' + zyID).tabs({
                    // Just want to change an index when switching tabs, or create a new SM if the new tab is clicked
                    beforeActivate: function(event, ui) {
                        var newIndex = getTabIndex(ui.newTab.text());
                        // If simulating dont add or if not from a click
                        if ((newIndex == graphs.length && simulateID) || (event.originalEvent == undefined && newIndex == graphs.length) || simulateOnly || (newIndex == graphs.length && paused)) {
                            return false;
                        }
                        selectedNode = null;

                        if (newIndex == graphs.length) {
                            genAndSwitchSM();
                        }
                        currentIndex = newIndex;
                        $('#period_' + zyID).val(graphs[currentIndex].period);
                        reDrawStateMachine = true;

                    },
                    beforeLoad: function(event, ui) {
                        return false;
                    }
                });
                // Add close icon to first tab
                $('#canvasTab_' + zyID + ' ul:first li:eq(0)').append('<span class="ui-icon ui-icon-close" role="presentation"/>');

                // Removing a tab when close icon is clicked
                $('#canvasTab_' + zyID).delegate('span.ui-icon-close', 'click', function() {
                    // Don't delete while running
                    if (simulateID || simulateOnly || paused) {
                        return;
                    }
                    // Only one SM, need to create a new one in it's place
                    if (graphs.length == 1) {
                        genAndSwitchSM();
                    }
                    // Removes the tab from the tab menu
                    var panelId = $(this).closest('li').remove().attr('aria-controls');
                    // Removes the corresponding SM from the array of SMs
                    graphs.splice(getTabIndex($(this).closest('li').find('a').text()), 1);
                    currentIndex = graphs.length - 1;
                    $('#canvasTab_' + zyID).tabs('refresh');
                    reDrawStateMachine = true;
                });


                // Input for SM name used on tabs
                tabInput = $('<div style="position: absolute; z-index: 9999; background: white"><input/></div>');
                tabInput.css('display', 'none');
                tabInputIn = tabInput.find('input');

                $('#canvasTab_' + zyID).append(tabInput);
                // When user dblclicks a tab they can rename the SM
                $('#canvasTab_' + zyID + ' ul:first li:eq(0) a').dblclick(function(e) {
                    if (paused || simulateOnly || simulateID) {
                        return;
                    }
                    changeSMName(0);
                });
            }

            $(canvas).on('mousedown touchstart', function(e) {
                executeFunctionAndSetReDraw(canvasMouseDown, e);
                e.preventDefault();
            });
            $(canvas).on('mouseup touchend', function(e) {
                executeFunctionAndSetReDraw(canvasMouseUp, e);
                e.preventDefault();
            });
            $(canvas).on('mousemove touchmove', function(e) {
                executeFunctionAndSetReDraw(canvasMouseMove, e);
                e.preventDefault();
            });
            $('#exampleDrop_' + zyID).change(function() {
                executeFunctionAndSetReDraw(exampleChanged);
            });
            $('#insertStateButton_' + zyID).click(function() {
                executeFunctionAndSetReDraw(createNode);
            });
            $('#insertTransitionButton_' + zyID).click(function() {
                executeFunctionAndSetReDraw(insertTransitionClicked);
            });
            $('#simulateButton_' + zyID).click(simulate);
            $('#pauseButton_' + zyID).click(pauseResume);
            $('#deleteButton_' + zyID).click(function() {
                if (canEdit) {
                    executeFunctionAndSetReDraw(deleteButtonClicked);
                }
            });
            $('#exportButton_' + zyID).click(function() {
                $('#JSONImportExport_' + zyID).val(saveToJSON());
                reDrawStateMachine = true;
            });
            $('#importButton_' + zyID).click(function() {
                loadFromJSON($('#JSONImportExport_' + zyID).val(), true);
                reDrawStateMachine = true;
            });
            $('#stateActions_' + zyID).keyup(function(e) {
                executeFunctionAndSetReDraw(stateActionsChanged, e);
            });
            $('#stateConditions_' + zyID).keyup(function(e) {
                executeFunctionAndSetReDraw(stateConditionsChanged, e);
            });
            $('#stateActions_' + zyID).focus(focusFocusTracking);
            $('#stateConditions_' + zyID).focus(focusFocusTracking);

            $('#stateActions_' + zyID).blur(blurFocusTracking);
            $('#stateConditions_' + zyID).blur(blurFocusTracking);

            $('#initStateCheck_' + zyID).change(function(e) {
                executeFunctionAndSetReDraw(initStateChecked, e);
            });
            $('#stateName_' + zyID).on('keydown keyup keypress', function(e) {
                executeFunctionAndSetReDraw(stateNameChanged, e);
            });
            $('#period_' + zyID).on('keydown keyup keypress', function(e) {
                executeFunctionAndSetReDraw(periodChanged, e);
            });
            // Prevent browser back navigation via the Backspace or Delete keys. Allow user to use Backspace and Delete normally while typing
            $(document).bind('keydown', function(event) {
                if (((event.keyCode === 8) || (event.keyCode === 46)) && !($(event.target).is('.period, .condition, .action, .state-name, input, textarea') || $(event.target).prop('contentEditable') == 'true')) {
                    event.preventDefault();
                }
            });
            $('#period_' + zyID).focus(focusFocusTracking);
            $('#stateName_' + zyID).focus(focusFocusTracking);
            $('#period_' + zyID).blur(blurFocusTracking);
            $('#stateName_' + zyID).blur(blurFocusTracking);

            $('#JSONImportExport_' + zyID).click(function() {
                $(this).select();
            });

            // Disable and enable test vectors
            $('#testVectorButton_' + zyID).click(function(e) {
                if ($('#testVectorWindow_' + zyID).css('visibility') == 'hidden') {
                    $('#testVectorWindow_' + zyID).css('visibility', 'visible');
                    $('#testVectorButton_' + zyID).text('Use graphical inputs');
                }
                else {
                    $('#testVectorWindow_' + zyID).css('visibility', 'hidden');
                    $('#testVectorButton_' + zyID).text('Use test vectors');
                }
            });
            /*
            // Warning to users to save work before leaving the page (Use export)
            window.onbeforeunload = function(e) {
                // Firefox dosen't support custom messages
                return 'Warning: You will lose any unsaved work when leaving this page.';
            }
            */
            // Gen and display C code for RIMS from these SMs
            $('#exportToRimsButton_' + zyID).click(function(e) {
                $('#' + zyID + ' .rims-c-code-text').val(exportToC());
                $('#' + zyID + ' .rims-c-code').show();
                $('#' + zyID + ' .rims-c-code-text').select();
            });
            $('#' + zyID + ' .rims-c-code-close').click(function() {
                $(this).parent().hide();
            });
            $(document).on('mouseup touchend', function(e) {
                canDrag = false;
            });
            $(document).keyup(function(e) {
                e.preventDefault();
                if (!zySMSimActive) {
                    return false;
                }
                // Delete
                if (e.keyCode == 46) {
                    if (canEdit && !fieldFocused) {
                        executeFunctionAndSetReDraw(deleteButtonClicked);
                    }
                }

            });
            // Used to make sure key event should be firing
            $(document).on('mousedown touchstart', function(e) {
                const toolContainer = document.getElementById(zyID);

                if (toolContainer && $.contains(toolContainer, e.target)) {
                    zySMSimActive = true;
                }
                else {
                    zySMSimActive = false;
                }
                return;
            });
            if (!generateRIMS) {
                $('#exportToRimsButton_' + zyID).hide();
            }
            else {
                $('#exportToRimsButton_' + zyID).show();
            }

            // Only simulation
            if (simulateOnly) {
                $('#deleteButton_' + zyID).hide();
                $('#importButton_' + zyID).hide();
                $('#exportButton_' + zyID).hide();
                $('#exampleDrop_' + zyID).hide();
                $('#insertStateButton_' + zyID).hide();
                $('#insertTransitionButton_' + zyID).hide();
                $('#testVectorWindow_' + zyID).hide();
                $('#testVectorButton_' + zyID).hide();
                $('#' + zyID + '.init-state-check').hide();
                $('#' + zyID + '.period-label').hide();
                $('#' + zyID + '.state-name-label').hide();
                $('#JSONImportExport_' + zyID).hide();
                $('#' + zyID + ' .period-container').hide();
                $('#stateActions_' + zyID).hide();
                $('#stateConditions_' + zyID).hide();
                $('#initStateCheck_' + zyID).hide();
                $('#stateName_' + zyID).hide();
                $('#' + zyID + ' .sidemenu').hide();
                $('#SMToolContainer_' + zyID).width('754px');
                $('#' + zyID + ' .middle-container').width('754px');
            }

            if (!canExport) {
                $('#importButton_' + zyID).hide();
                $('#exportButton_' + zyID).hide();
                $('#exampleDrop_' + zyID).hide();
                $('#JSONImportExport_' + zyID).hide();
            }

            if (self.isProgressionTool && digDesignMode) {
                inputs[4].hide();
                inputs[5].hide();
                inputs[6].hide();
                inputs[7].hide();
                outputs[0].hide();
                outputs[1].hide();
                outputs[2].hide();
                outputs[3].hide();
                canvas.height = 280;
                canvas.width = 575;

                $('#SMToolContainer_' + zyID).width('1035px');
                $('#' + zyID + ' .period-container').hide();

                $('#' + zyID + ' .state-name-container').hide();
                inputSize = 4;
                outputSize = 4;
                outputOffset = 4;
            }

            if (digDesignMode || HLSM) {
                self.output.decimalOutput.hide();
                self.input.decimalInput.hide();
            }

            if (self.isProgressionTool) {
                $('#' + zyID + ' .bottom-container').hide();
                $('#canvasTab_' + zyID).addClass('progression');

                var heightOffset = 5;
                $('#canvasTab_' + zyID).height(canvas.height + heightOffset);
            }

            if (HLSM) {
                inputs.E = self.input.valueInputs[0];
                inputs.F = self.input.valueInputs[1];
                outputs.Y = self.output.valueOutputs[0];
                outputs.Z = self.output.valueOutputs[1];
                $('#' + zyID + ' .internal-variable-container').appendTo('#outputContainer_' + zyID);
                inputs[4].hide();
                inputs[5].hide();
                inputs[6].hide();
                inputs[7].hide();
                outputs[0].hide();
                outputs[1].hide();
                outputs[2].hide();
                outputs[3].hide();
                inputSize = 4;
                outputSize = 4;
                outputOffset = 4;
                $('#exampleDrop_' + zyID).hide();
                $('#' + zyID + ' .middle-container').width('1040px');
                $('#SMToolContainer_' + zyID).width('1040px');
                $('#' + zyID + ' .sidemenu').removeClass('sidemenu-margin');
            }
            else {
                $('#internalBlockI_' + zyID).hide();
                $('#internalBlockJ_' + zyID).hide();
                $('#' + zyID + ' .internal-variable-container').hide();
            }

            if (HLSM && self.isProgressionTool) {
                $('#canvasTab_' + zyID).addClass('progression');
                canvas.width = 585;
                $('#' + zyID + ' .period-container').hide();
                $('#' + zyID + ' .state-name-container').hide();
                $('#canvasTab_' + zyID).height('340px');
            }

            if (hideTestVector) {
                $('#testVectorButton_' + zyID).hide();
            }

            if (hideTestVector && !canExport && !self.isProgressionTool) {
                $('#' + zyID + ' .bottom-container').hide();
                $('#SMToolContainer_' + zyID).height('574px');
            }

            $('#deleteButton_' + zyID).prop('disabled', true);
            $('#deleteButton_' + zyID).addClass('disabled');

            $('#stateActions_' + zyID).text('');
            $('#stateConditions_' + zyID).text('');
            $('#initStateCheck_' + zyID).prop('checked', false);
            $('#initStateCheck_' + zyID).prop('disabled', true);
            $('#stateName_' + zyID).val('');

            $('#pauseButton_' + zyID).prop('disabled', true);
            $('#pauseButton_' + zyID).addClass('disabled');


            $('#stateActions_' + zyID).prop('disabled', true);
            $('#stateConditions_' + zyID).prop('disabled', true);
            $('#stateName_' + zyID).prop('contentEditable', false);

            $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
            $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
            $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);

            context.font = '16px Courier New';

            self.saveToJSON = saveToJSON;
            self.testProgressionSM = testProgressionSM;
            self.turnOnOffControlsForProgression = turnOnOffControlsForProgression;
            self.clearSM = clearSM;
            if ((options !== null) && options['JSONToLoad']) {
                loadFromJSON(options['JSONToLoad']);
                reDrawStateMachine = true;
            }
            else if (!self.isProgressionTool) {
                executeFunctionAndSetReDraw(exampleChanged);
            }
            else {
                graphs = [ new Graph() ];
                graphs[graphs.length - 1].nodes.push(new Node());
                graphs[graphs.length - 1].nodes[0].isDummyState = true;
                graphs[graphs.length - 1].nodes[0].name = 'SMStart';
                graphs[graphs.length - 1].nodes[0].rect.x = 0;
                graphs[graphs.length - 1].nodes[0].rect.y = 0;
            }
            // 30 FPS
            drawThreadId = setInterval(() => {
                try {
                    drawLoop();
                }
                catch (error) {
                    console.log(error);
                }
            }, 33);
            reDrawStateMachine = true;
            if (self.isProgressionTool) {
                self.turnOnOffControlsForProgression(false);
            }
        }

        // Creates the output objects for the different modes
        function createOutputs() {
            outputs = [];
            self.output = self.zyIO.create();
            if (digDesignMode && !HLSM) {
                self.output.init('outputContainer_' + zyID, {
                    isInput: false,
                    outputs: [ {
                        name: 's',
                        value: 0,
                        syncUserVariable: function(value) {
                                s = value;
                            },
                        outsideUpdate: function() {
                                return s;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 't',
                        value: 0,
                        syncUserVariable: function(value) {
                                t = value;
                            },
                        outsideUpdate: function() {
                                return t;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'u',
                        value: 0,
                        syncUserVariable: function(value) {
                                u = value;
                            },
                        outsideUpdate: function() {
                                return u;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'v',
                        value: 0,
                        syncUserVariable: function(value) {
                                v = value;
                            },
                        outsideUpdate: function() {
                                return v;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'w',
                        value: 0,
                        syncUserVariable: function(value) {
                                w = value;
                            },
                        outsideUpdate: function() {
                                return w;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'x',
                        value: 0,
                        syncUserVariable: function(value) {
                                x = value;
                            },
                        outsideUpdate: function() {
                                return x;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'y',
                        value: 0,
                        syncUserVariable: function(value) {
                                y = value;
                            },
                        outsideUpdate: function() {
                                return y;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'z',
                        value: 0,
                        syncUserVariable: function(value) {
                                z = value;
                            },
                        outsideUpdate: function() {
                                return z;
                            },
                        type: self.input.ioType.BIT
                    }
                    ],
                    output: 'B'
                },
                functionIOLoadCompleted);
            }
            else if (HLSM) {
                self.output.init('outputContainer_' + zyID, {
                    isInput: false,
                    outputs: [ {
                        name: 'y',
                        value: 0,
                        syncUserVariable: function(value) {
                                y = value;
                            },
                        outsideUpdate: function() {
                                return y;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'z',
                        value: 0,
                        syncUserVariable: function(value) {
                                z = value;
                            },
                        outsideUpdate: function() {
                                return z;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 's',
                        value: 0,
                        syncUserVariable: function(value) {
                                s = value;
                            },
                        outsideUpdate: function() {
                                return s;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 't',
                        value: 0,
                        syncUserVariable: function(value) {
                                t = value;
                            },
                        outsideUpdate: function() {
                                return t;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'u',
                        value: 0,
                        syncUserVariable: function(value) {
                                u = value;
                            },
                        outsideUpdate: function() {
                                return u;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'v',
                        value: 0,
                        syncUserVariable: function(value) {
                                v = value;
                            },
                        outsideUpdate: function() {
                                return v;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'w',
                        value: 0,
                        syncUserVariable: function(value) {
                                w = value;
                            },
                        outsideUpdate: function() {
                                return w;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'x',
                        value: 0,
                        syncUserVariable: function(value) {
                                x = value;
                            },
                        outsideUpdate: function() {
                                return x;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'Y(8)',
                        value: 0,
                        syncUserVariable: function(value) {
                                Y = value;
                            },
                        outsideUpdate: function() {
                                return Y;
                            },
                        type: self.input.ioType.VALUE
                    },
                    {
                        name: 'Z(8)',
                        value: 0,
                        syncUserVariable: function(value) {
                                Z = value;
                            },
                        outsideUpdate: function() {
                                return Z;
                            },
                        type: self.input.ioType.VALUE
                    }
                    ],
                    output: 'B'
                },
                functionIOLoadCompleted);
            }
            else {
                self.output.init('outputContainer_' + zyID, {
                    isInput: false,
                    outputs: [ {
                        name: 'B0',
                        value: 0,
                        syncUserVariable: function(value) {
                                B0 = value;
                            },
                        outsideUpdate: function() {
                                return B0;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B1',
                        value: 0,
                        syncUserVariable: function(value) {
                                B1 = value;
                            },
                        outsideUpdate: function() {
                                return B1;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B2',
                        value: 0,
                        syncUserVariable: function(value) {
                                B2 = value;
                            },
                        outsideUpdate: function() {
                                return B2;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B3',
                        value: 0,
                        syncUserVariable: function(value) {
                                B3 = value;
                            },
                        outsideUpdate: function() {
                                return B3;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B4',
                        value: 0,
                        syncUserVariable: function(value) {
                                B4 = value;
                            },
                        outsideUpdate: function() {
                                return B4;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B5',
                        value: 0,
                        syncUserVariable: function(value) {
                                B5 = value;
                            },
                        outsideUpdate: function() {
                                return B5;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B6',
                        value: 0,
                        syncUserVariable: function(value) {
                                B6 = value;
                            },
                        outsideUpdate: function() {
                                return B6;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'B7',
                        value: 0,
                        syncUserVariable: function(value) {
                                B7 = value;
                            },
                        outsideUpdate: function() {
                                return B7;
                            },
                        type: self.input.ioType.BIT
                    }
                    ],
                    output: 'B'
                },
                functionIOLoadCompleted);
            }

        }

        // Creates the input objects for all the modes.
        function createInputs() {
            inputs = [];
            self.input = self.zyIO.create();
            if (digDesignMode && !HLSM) {
                self.input.init('inputContainer_' + zyID, {
                    isInput: true,
                    inputs: [ {
                        name: 'a',
                        value: 0,
                        syncUserVariable: function(value) {
                                a = value;
                            },
                        outsideUpdate: function() {
                                return a;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'b',
                        value: 0,
                        syncUserVariable: function(value) {
                                b = value;
                            },
                        outsideUpdate: function() {
                                return b;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'c',
                        value: 0,
                        syncUserVariable: function(value) {
                                c = value;
                            },
                        outsideUpdate: function() {
                                return c;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'd',
                        value: 0,
                        syncUserVariable: function(value) {
                                d = value;
                            },
                        outsideUpdate: function() {
                                return d;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'e',
                        value: 0,
                        syncUserVariable: function(value) {
                                e = value;
                            },
                        outsideUpdate: function() {
                                return e;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'f',
                        value: 0,
                        syncUserVariable: function(value) {
                                f = value;
                            },
                        outsideUpdate: function() {
                                return f;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'g',
                        value: 0,
                        syncUserVariable: function(value) {
                                g = value;
                            },
                        outsideUpdate: function() {
                                return g;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'h',
                        value: 0,
                        syncUserVariable: function(value) {
                                h = value;
                            },
                        outsideUpdate: function() {
                                return h;
                            },
                        type: self.input.ioType.BIT
                    }
                    ],
                    input: 'A'
                },
                createOutputs);
            }
            else if (HLSM) {
                self.input.init('inputContainer_' + zyID, {
                    isInput: true,
                    inputs: [ {
                        name: 'a',
                        value: 0,
                        syncUserVariable: function(value) {
                                a = value;
                            },
                        outsideUpdate: function() {
                                return a;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'b',
                        value: 0,
                        syncUserVariable: function(value) {
                                b = value;
                            },
                        outsideUpdate: function() {
                                return b;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'c',
                        value: 0,
                        syncUserVariable: function(value) {
                                c = value;
                            },
                        outsideUpdate: function() {
                                return c;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'd',
                        value: 0,
                        syncUserVariable: function(value) {
                                d = value;
                            },
                        outsideUpdate: function() {
                                return d;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'e',
                        value: 0,
                        syncUserVariable: function(value) {
                                e = value;
                            },
                        outsideUpdate: function() {
                                return e;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'f',
                        value: 0,
                        syncUserVariable: function(value) {
                                f = value;
                            },
                        outsideUpdate: function() {
                                return f;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'g',
                        value: 0,
                        syncUserVariable: function(value) {
                                g = value;
                            },
                        outsideUpdate: function() {
                                return g;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'h',
                        value: 0,
                        syncUserVariable: function(value) {
                                h = value;
                            },
                        outsideUpdate: function() {
                                return h;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'E(8)',
                        value: 0,
                        syncUserVariable: function(value) {
                                E = value;
                            },
                        outsideUpdate: function() {
                                return E;
                            },
                        type: self.input.ioType.VALUE
                    },
                    {
                        name: 'F(8)',
                        value: 0,
                        syncUserVariable: function(value) {
                                F = value;
                            },
                        outsideUpdate: function() {
                                return F;
                            },
                        type: self.input.ioType.VALUE
                    },
                    ],
                    input: 'A'
                },
                createOutputs);
            }
            else {
                self.input.init('inputContainer_' + zyID, {
                    isInput: true,
                    inputs: [ {
                        name: 'A0',
                        value: 0,
                        syncUserVariable: function(value) {
                                A0 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A0;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A1',
                        value: 0,
                        syncUserVariable: function(value) {
                                A1 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A1;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A2',
                        value: 0,
                        syncUserVariable: function(value) {
                                A2 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A2;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A3',
                        value: 0,
                        syncUserVariable: function(value) {
                                A3 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A3;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A4',
                        value: 0,
                        syncUserVariable: function(value) {
                                A4 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A4;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A5',
                        value: 0,
                        syncUserVariable: function(value) {
                                A5 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A5;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A6',
                        value: 0,
                        syncUserVariable: function(value) {
                                A6 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A6;
                            },
                        type: self.input.ioType.BIT
                    },
                    {
                        name: 'A7',
                        value: 0,
                        syncUserVariable: function(value) {
                                A7 = value;
                                inputUpdated();
                            },
                        outsideUpdate: function() {
                                return A7;
                            },
                        type: self.input.ioType.BIT
                    }
                    ],
                    input: 'A'
                },
                createOutputs);
            }
        }

        // Executes the function that changes the state machine then sets a flag that lets the drawLoop know to redraw.
        function executeFunctionAndSetReDraw(functionToExecute, param) {
            functionToExecute(param);
            reDrawStateMachine = true;
        }

        // Used to make sure deleting in a text field does not also delete the selected object
        function blurFocusTracking() {
            fieldFocused = false;
        }
        // Used to make sure deleting in a text field does not also delete the selected object
        function focusFocusTracking() {
            fieldFocused = true;
        }
        // Ticks all SMs
        function updateLoopNoPeriod() {
            for (var j = 0; j < graphs.length; j++) {
                for (var i = 0; i < graphs[j].edges.length; i++) {
                    // This is the current node executing and one of it's edges's conditions is true
                    if (graphs[j].edges[i].head == executingNodes[j] && executeCondition(graphs[j].edges[i].condition)) {
                        executeAction(graphs[j].edges[i].actions, executingNodes[j].name);
                        executingNodes[j] = graphs[j].edges[i].tail;
                        break;
                    }
                }
                executeAction(executingNodes[j].actions, executingNodes[j].name);
            }
            return progressionExecutionErrorMessage;
        }
        // Helper takes a |bitString| that is an 8 character string of 0s 1s and Xs and returns the corresponding value at |bitIndex|.
        function getBitFromBitString(bitString, bitIndex) {
            if (bitString[bitString.length - 1 - bitIndex].toLowerCase() === 'x') {
                return -1;
            }
            else {
                return parseInt(bitString[bitString.length - 1 - bitIndex]);
            }

        }

        // Executes the users SM and tests it using generated test vectors, |currentProblem| - object - defines the current problem
        function testProgressionSM(currentProblem) {
            return self.zyIOTestVector.run(currentProblem, {
                prepareToExecute: function() {
                    return new Ember.RSVP.Promise(function(resolve, reject) {
                        resolve(prepareToSimulate());
                    });
                },
                initExecute: function() {
                    $('#simulateButton_' + zyID).text('End');
                    $('#simulateButton_' + zyID).removeClass('simulate-margin');
                    // Have to disable all of the controls that modify a SM
                    turnOnOffControls();
                    if (selectedEdge != null) {
                        selectedEdge.deselect();
                        selectedEdge = null;
                    }
                    gcdPeriod = graphs[0].period;
                    smElapsedTime = [];
                    // Find gcd and intialize the elapsed time of each SM
                    for (var j = 0; j < graphs.length; j++) {
                        gcdPeriod = GCD(gcdPeriod, graphs[j].period);
                        smElapsedTime.push(graphs[j].period);
                    }
                },
                executeStep: function() {
                    progressionExecutionErrorMessage = '';
                    return updateLoopNoPeriod();
                },
                cleanUp: function() {
                    $('#simulateButton_' + zyID).text('Simulate');
                    $('#simulateButton_' + zyID).addClass('simulate-margin');
                    simulateID = 1;
                    turnOnOffControls();
                    clearInterval(simulateID);
                    simulateID = 0;
                    selectedNode = null;
                    setTimeout(function() {
                        // Can be in middle of animation
                        // Makes sure executing color is turned off
                        for (var j = 0; j < graphs.length; j++) {
                            for (var i = 0; i < graphs[j].nodes.length; i++) {
                                graphs[j].nodes[i].executing = false;
                            }
                        }
                        reDrawStateMachine = true;
                    }, ANIMATION_DURATION);
                    I = 0;
                    updateB(0, false);
                },
                inputs,
                outputs,
                inputUpdated,
            });
        }
        // Called when any input object is updated, Keeps the global A value up to date.
        function inputUpdated() {
            if (!digDesignMode && !HLSM) {
                A = (inputs[7].value << 7) | (inputs[6].value << 6) | (inputs[5].value << 5) | (inputs[4].value << 4) | (inputs[3].value << 3) | (inputs[2].value << 2) | (inputs[1].value << 1) | inputs[0].value;
                inputs.decimalInput.setValue(A);
            }
        }

        // When a user double clicks a tab an input box appears that allows them to change the state machine's name
        function changeSMName(index) {
            if (simulateOnly) {
                return;
            }
            tabInputIn.unbind('blur');
            tabInput.css('display', 'block');

            var offset = $('#canvasTab_' + zyID + ' ul:first li:eq(' + index + ') a').offset();
            var parentOffset = $('#canvasTab_' + zyID).offset();
            offset.top -= parentOffset.top;
            offset.left -= parentOffset.left;
            tabInput.css({
                left: offset.left,
                top: offset.top
            });
            tabInput.height($('#canvasTab_' + zyID + ' ul:first li:eq(' + index + ') a').outerHeight());
            tabInput.width($('#canvasTab_' + zyID + ' ul:first li:eq(' + index + ') a').outerWidth());
            tabInputIn.val($('#canvasTab_' + zyID + ' ul:first li:eq(' + index + ') a').text());
            // Keeps input box inside tab
            var INPUT_ADJUST = -6;
            tabInputIn.width(tabInput.width() + INPUT_ADJUST);
            tabInputIn.height(tabInput.height() + INPUT_ADJUST);
            tabInputIn.bind('blur', function() {
                $('#canvasTab_' + zyID + ' ul:first li:eq(' + index + ') a').text(tabInputIn.val());
                tabInput.css('display', 'none');
                graphs[index].name = tabInputIn.val();
            });
            tabInputIn.select();
        }
        // Add new SM and update tabs
        function addGraph() {
            var newGraphIndex = graphs.length;
            graphs.push(new Graph());
            var nameIndex = 1;
            graphs[newGraphIndex].name = 'StateMachine' + nameIndex;
            var nameTaken = true;
            // This ensures new SM name is unique
            while (nameTaken) {
                nameTaken = false;
                for (var i = 0; i < (graphs.length - 1); i++) {
                    if (graphs[i].prefix === graphs[newGraphIndex].prefix) {
                        nameIndex++;
                        graphs[newGraphIndex].name = 'StateMachine' + nameIndex;
                        graphs[newGraphIndex].prefix = 'SM' + nameIndex;
                        nameTaken = true;
                    }
                }
            }
            graphs[newGraphIndex].prefix = 'SM' + nameIndex;
            // Add new SM to our tabs along with dbl handler for renaming
            $('#canvasTab_' + zyID).find('li').last().before('<li><a href="#drawingArea_' + zyID + '">' + graphs[newGraphIndex].name + '</a></li>');
            $('#canvasTab_' + zyID + ' ul:first li:eq(' + newGraphIndex + ')').append('<span class="ui-icon ui-icon-close" role="presentation"/>');
            $('#canvasTab_' + zyID).tabs('refresh');
            var SMprefix = graphs[newGraphIndex].prefix;
            $('#canvasTab_' + zyID + ' ul:first li:eq(' + newGraphIndex + ') a').dblclick(function(e) {
                var i;
                // Find matching prefix, break once found
                for (i = 0; i < graphs.length; i++) {
                    if (graphs[i].prefix === SMprefix) {
                        break;
                    }
                }
                // Start changing name of the state machine that was clicked
                changeSMName(i);
            });

        }
        // Create new SM and click on it's tab
        function genAndSwitchSM() {
            addGraph();
            // Need to add dummy state to new graph
            graphs[graphs.length - 1].nodes.push(new Node());
            graphs[graphs.length - 1].nodes[0].isDummyState = true;
            graphs[graphs.length - 1].nodes[0].name = 'SMStart';
            graphs[graphs.length - 1].nodes[0].rect.x = 0;
            graphs[graphs.length - 1].nodes[0].rect.y = 0;
            // Find newly added tab and click it, need to wait a few miliseconds because it can bug out and select two things
            setTimeout(function() {
                $('#canvasTab_' + zyID + ' ul:first li:eq(' + (graphs.length - 1) + ') a').click();
            }, 10);
        }
        // Find index of SM in graphs by using the SM name
        function getTabIndex(smName) {
            for (var i = 0; i < graphs.length; i++) {
                if (graphs[i].name === smName) {
                    return i;
                }
            }
            return graphs.length;
        }
        // Update period for the current SM when user changes the period
        // Have to make sure it's an integer MIN_PERIOD or above
        function periodChanged(e) {
            if (e.which !== 13) {
                var re = /^([0-9]+)$/;
                var period = '';
                $('#period_' + zyID).val().replace(re, function($0, $1) {
                    period = parseFloat($1);
                    if (period >= MIN_PERIOD) {
                        graphs[currentIndex].period = period;
                    }
                });
            }
            else {
                e.preventDefault();
            }
        }

        // Used by the updateLoop function for changing the edge/node color from green back to default
        function turnOffAnimation(i, j) {
            graphs[j].edges[i].executing = false;
            executingNodes[j].executing = true;
            reDrawStateMachine = true;
        }

        // Find out which SMs are ready and execute their current states actions and see what edge to take.
        function updateLoop() {
            
            //Carson Welty 8/10/2021
            timerPercent = 0;
            clearInterval(updateTimerBarID);
            console.log('timerPercent: ', timerPercent);
            console.log('gcdPeriod: ', gcdPeriod);
            updateTimerBarID = setInterval(updateTimerBar, 25);

            for (var j = 0; j < graphs.length; j++) {
                if (smElapsedTime[j] >= graphs[j].period) {
                    smElapsedTime[j] = 0;
                    for (var i = 0; i < graphs[j].edges.length; i++) {
                        if (!simulateID) {
                            return;
                        }
                        // This is the current node executing and one of it's edges's conditions is true
                        if (graphs[j].edges[i].head == executingNodes[j] && executeCondition(graphs[j].edges[i].condition)) {
                            executeAction(graphs[j].edges[i].actions, executingNodes[j].name);
                            executingNodes[j].executing = false;
                            executingNodes[j] = graphs[j].edges[i].tail;
                            graphs[j].edges[i].executing = true;
                            setTimeout(turnOffAnimation, ANIMATION_DURATION, i, j);
                            reDrawStateMachine = true;
                            break;
                        }
                    }
                    executeAction(executingNodes[j].actions, executingNodes[j].name);
                }
                smElapsedTime[j] += gcdPeriod;
            }
        }
        // If the state machine is running this will pause the state machine, leaving it in whatever state it was in and with the current inputs and outputs.
        // Calling this when the state machine is paused will resume the state machine which starts execution in the previously paused state.
        function pauseResume() {
            if (paused) {
                gcdPeriod = graphs[0].period;
                smElapsedTime = [];
                // Find gcd and intialize the elapsed time of each SM
                for (var j = 0; j < graphs.length; j++) {
                    gcdPeriod = GCD(gcdPeriod, graphs[j].period);
                    smElapsedTime.push(graphs[j].period);
                }
                simulateID = setInterval(updateLoop, gcdPeriod);
                // Test vectors are active, run that instead of using user input
                if ($('#testVectorWindow_' + zyID).css('visibility') == 'visible') {
                    // Process test vectors
                    var commands = $('#testVectorWindow_' + zyID).val().toLowerCase().split(/\r\n|\r|\n/g);
                    var index = currentTestVectorIndex;
                    testVectorID = setTimeout(function() {
                        index = processTestVectors(commands, index);
                    }, 1);
                }
                paused = false;
                $(this).text('Pause');
                $(this).addClass('pause-margin');
            }
            else {
                clearInterval(simulateID);
                clearInterval(testVectorID);
                clearInterval(updateTimerBarID); //Carson 8/16/2021
                simulateID = 0;
                testVectorID = 0;
                paused = true;
                $(this).text('Resume');
                $(this).removeClass('pause-margin');
            }
        }

        function prepareToSimulate() {
            if (simulateID) {
                simulate();
            }
            var noErrors = true;
            executingNodes = [];
            for (var j = 0; j < graphs.length; j++) {
                var haveInit = false;
                var matchingNames = false;
                for (var i = 0; i < graphs[j].nodes.length; i++) {
                    for (var k = 0; k < graphs[j].nodes.length; k++) {
                        if (i === k) {
                            continue;
                        }
                        if (graphs[j].nodes[k].name === graphs[j].nodes[i].name) {
                            matchingNames = true;
                        }
                    }
                }
                for (var i = 0; i < graphs[j].nodes.length; i++) {
                    // First state to execute in each SM is the init state
                    if (graphs[j].nodes[i].initState) {
                        executingNodes.push(graphs[j].nodes[0]);
                        executingNodes[executingNodes.length - 1].executing = true;
                        haveInit = true;
                        break;
                    }
                }
                var re = /^([0-9]+)$/;
                var period = '';
                $('#period_' + zyID).val().replace(re, function($0, $1) {
                    period = parseFloat($1);
                });
                // If period is not a number or not greater than our threshold then we have an error and cannot start simulation
                if (!period || (period < MIN_PERIOD)) {
                    noErrors = false;
                    if (executingNodes.length > 0) {
                        for (var i = 0; i < executingNodes.length; i++) {
                            executingNodes[i].executing = false;
                        }
                    }
                }
                noErrors = noErrors && haveInit && !matchingNames;
                if (!noErrors) {
                    var errorMes = graphs[j].name + ':error: ';
                    if (!period) {
                        errorMes += 'Bad period.\n';
                        if ($('#period_' + zyID).val().indexOf('.') != -1) {
                            errorMes += 'Period should be an integer.\n';
                        }
                    }
                    else if ((period < MIN_PERIOD)) {
                        errorMes += 'Period must be ' + MIN_PERIOD + ' or greater.\n';
                    }
                    if (!haveInit) {
                        errorMes += 'No intial state specified.\n';
                    }
                    if (matchingNames) {
                        errorMes += 'Two states cannot have the same name.\n';
                    }
                    setTimeout(function() {
                        // Can be in middle of animation
                        // makes sure executing color is turned off
                        for (var j = 0; j < graphs.length; j++) {
                            for (var i = 0; i < graphs[j].nodes.length; i++) {
                                graphs[j].nodes[i].executing = false;
                            }
                        }
                        reDrawStateMachine = true;
                    }, ANIMATION_DURATION);
                    return { noErrors:noErrors, errorMessage:errorMes };
                }
            }
            return { noErrors:noErrors, errorMessage:errorMes };
        }
        // Starts the execution of the SMs when first called. If state machines are already running this stops the execution
        function simulate() {
            if (!simulateID && !$('#simulateButton_' + zyID).hasClass('disabled') && !paused) {
                var prepareResult = prepareToSimulate();
                var noErrors = prepareResult.noErrors;
                // No errors, time to simulate
                if (noErrors) {
                    $('#simulateButton_' + zyID).text('End');
                    $('#simulateButton_' + zyID).removeClass('simulate-margin');
                    // Have to disable all of the controls that modify a SM
                    turnOnOffControls();
                    if (selectedEdge != null) {
                        selectedEdge.deselect();
                        selectedEdge = null;
                    }
                    gcdPeriod = graphs[0].period;
                    smElapsedTime = [];
                    // Find gcd and intialize the elapsed time of each SM
                    for (var j = 0; j < graphs.length; j++) {
                        gcdPeriod = GCD(gcdPeriod, graphs[j].period);
                        smElapsedTime.push(graphs[j].period);
                    }
                    //Carson Welty 8/12/2021
                    speedChoice = $("#speed-choice option:selected").val();
                
                    simulateID = setInterval(updateLoop, gcdPeriod * speedChoice); 

                    $('#pauseButton_' + zyID).prop('disabled', false);
                    $('#pauseButton_' + zyID).removeClass('disabled');
                    // Test vectors are active, run that instead of using user input
                    if ($('#testVectorWindow_' + zyID).css('visibility') == 'visible') {
                        // Process test vectors
                        var commands = $('#testVectorWindow_' + zyID).val().toLowerCase().split(/\r\n|\r|\n/g);
                        var index = 0;
                        testVectorID = setTimeout(function() {
                            index = processTestVectors(commands, index);
                        }, 1);
                    }
                }
                else {
                    alert(prepareResult.errorMessage);
                    return;
                }

            }
            // Simulate was called while a simulation was running, must stop the simulation
            else {
                $('#pauseButton_' + zyID).prop('disabled', true);
                $('#pauseButton_' + zyID).addClass('disabled');
                $('#simulateButton_' + zyID).text('Simulate');
                $('#simulateButton_' + zyID).addClass('simulate-margin');
                $('#pauseButton_' + zyID).text('Pause');
                $('#pauseButton_' + zyID).addClass('pause-margin');
                turnOnOffControls();
                paused = false;
                clearInterval(simulateID);
                clearInterval(updateTimerBarID);
                simulateID = 0;
                selectedNode = null;
                setTimeout(function() {
                    // Can be in middle of animation
                    // Makes sure executing color is turned off
                    for (var j = 0; j < graphs.length; j++) {
                        for (var i = 0; i < graphs[j].nodes.length; i++) {
                            graphs[j].nodes[i].executing = false;
                        }
                    }
                    reDrawStateMachine = true;
                }, ANIMATION_DURATION);
                updateB(0, false);

            }
        }

        // Carson 8/11/2021
        function updateTimerBar() {
            timerBarCanvas = $('#timer-bar');
            timerBarCanvas.attr({
                width: timerPercent
            })
            // Calculates new timerPercent value for the next time updateTimerBar() is called
            if (timerPercent < 200) { // timing-info container width is 200px
                timerPercent = timerPercent + (200 / ((gcdPeriod * speedChoice) / 25));
            }
            console.log('+timerPercent: ', timerPercent);

            // Update percentage text
            var periodPercent = (timerPercent / 2).toFixed(0); // Divided by 2 since 200px --> 100%
            if (periodPercent <= 100){
                $('#period-percent').text(periodPercent + '%');
            }
            
        }

        // Processes the user's test vectors,
        // Currently you can:
        // Change A by giving a hex value: ex. 0xFA
        // Assert that B is a value: ex assert 0x05
        // Wait a specific amount of seconds or miliseconds: ex wait 5 s, wait 500 ms
        function processTestVectors(commands, index) {
            currentTestVectorIndex = index;
            if (!simulateID) {
                return;
            }
            else if (index >= commands.length) {
                alert('Test vector passed.');
                simulate();
                testVectorID = 0;
                return;
            }
            var newTime = 1;
            // Wait a specific amount of seconds or miliseconds: ex wait 5 s, wait 500 ms
            var reWait = /^(wait\s*([0-9]*)\s*((s)|(ms)))$/;
            // Change A by giving a hex value: ex. 0xFA
            var reAssign = /^(0x[a-f0-9][a-f0-9])$/;
            var reAssignInput = /^(([ef])\s*(0x[a-f0-9][a-f0-9]))$/;
            // Assert that B is a value: ex assert 0x05
            var reAssert = /^(assert\s*(0x[a-f0-9][a-f0-9]))$/;
            var reAssertOutput = /^(assert\s*([yz])\s*([=\>\<!]+)\s*(0x[a-f0-9][a-f0-9]))$/;
            commands[index] = commands[index].replace('\n', '').trim();
            // Handles wait x (ms/s) commands
            if (commands[index].match(reWait)) {
                commands[index].replace(reWait, function($0, $1, $2, $3, $4, $5) {
                    newTime = parseFloat($2);
                    if ($3 == 's') {
                        newTime = newTime * 1000;
                    }
                    testVectorID = setTimeout(function() {
                        processTestVectors(commands, index + 1);
                    }, newTime);
                });
            }
            // Handles 0xXX commands
            else if (commands[index].match(reAssign)) {
                commands[index].replace(reAssign, function($0, $1) {
                    var value = parseInt($1, 16);
                    if (!digDesignMode && !HLSM) {
                        A = value;
                    }
                    inputs[0].setInput(value & 0x01);
                    inputs[1].setInput((value & 0x02) >> 1);
                    inputs[2].setInput((value & 0x04) >> 2);
                    inputs[3].setInput((value & 0x08) >> 3);
                    inputs[4].setInput((value & 0x10) >> 4);
                    inputs[5].setInput((value & 0x20) >> 5);
                    inputs[6].setInput((value & 0x40) >> 6);
                    inputs[7].setInput((value & 0x80) >> 7);

                    testVectorID = setTimeout(function() {
                        processTestVectors(commands, index + 1);
                    }, newTime);
                });

            }
            // Handles E/F 0xXX commands
            else if (commands[index].match(reAssignInput)) {
                commands[index].replace(reAssignInput, function($0, $1, $2, $3) {
                    var value = parseInt($3, 16);
                    var variableName = $2;
                    switch (variableName) {
                        case 'e':
                            E = value;
                            inputs.E.outsideUpdate();
                            break;
                        case 'f':
                            F = value;
                            inputs.F.outsideUpdate();
                            break;
                    }

                    testVectorID = setTimeout(function() {
                        processTestVectors(commands, index + 1);
                    }, newTime);
                });
            }
            // Handles assert 0xXX commands
            else if (commands[index].match(reAssert)) {
                commands[index].replace(reAssert, function($0, $1, $2) {
                    var bitString = $2.substring(2);
                    var failedAssert = false;
                    var bitValues = [ getBitFromBitString(bitString, 0), getBitFromBitString(bitString, 1), getBitFromBitString(bitString, 2), getBitFromBitString(bitString, 3),
                        getBitFromBitString(bitString, 4), getBitFromBitString(bitString, 5), getBitFromBitString(bitString, 6), getBitFromBitString(bitString, 7)
                    ];
                    var errorMessage = index + ': Assert failed, ';
                    if (digDesignMode) {
                        for (var i = 0; i < outputs.length; i++) {
                            if (bitValues[i] != -1 && outputs[i].value != bitValues[i]) {
                                errorMessage += outputs[i].labelValue + ' != ' + bitValues[i];
                                failedAssert = true;
                            }
                        }

                        if (failedAssert && !self.isProgressionTool) {
                            alert(errorMessage);
                            simulate();
                        }
                    }
                    else {
                        var value = parseInt(bitString, 2);
                        if (B != value) {
                            alert(index + ': Assert failed, B != ' + value);
                            simulate();
                            return;
                        }
                    }

                    testVectorID = setTimeout(function() {
                        processTestVectors(commands, index + 1);
                    }, newTime);
                });
            }
            // Handles assert Y/Z 0xXX commands
            else if (commands[index].match(reAssertOutput)) {
                commands[index].replace(reAssertOutput, function($0, $1, $2, $3, $4) {
                    var value = parseInt($4, 16);
                    var variableName = $2;
                    var operation = $3;
                    switch (variableName) {
                        case 'y':
                            switch (operation) {
                                case '>=':
                                    if (Y < value) {
                                        alert(index + ': Assert failed, Y is not >= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '<=':
                                    if (Y > value) {
                                        alert(index + ': Assert failed, Y is not <= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '=':
                                    if (Y != value) {
                                        alert(index + ': Assert failed, Y != ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '!=':
                                    if (Y == value) {
                                        alert(index + ': Assert failed, Y == ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '<':
                                    if (Y >= value) {
                                        alert(index + ': Assert failed, Y >= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '>':
                                    if (Y > value) {
                                        alert(index + ': Assert failed, Y <= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                            }
                            break;
                        case 'z':
                            switch (operation) {
                                case '>=':
                                    if (Z < value) {
                                        alert(index + ': Assert failed, Z is not >= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '<=':
                                    if (Z > value) {
                                        alert(index + ': Assert failed, Z is not <= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '=':
                                    if (Z != value) {
                                        alert(index + ': Assert failed, Z != ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '!=':
                                    if (Z == value) {
                                        alert(index + ': Assert failed, Z == ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '<':
                                    if (Z >= value) {
                                        alert(index + ': Assert failed, Z >= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                                case '>':
                                    if (Z > value) {
                                        alert(index + ': Assert failed, Z <= ' + value);
                                        simulate();
                                        return;
                                    }
                                    break;
                            }
                            break;
                    }
                    testVectorID = setTimeout(function() {
                        processTestVectors(commands, index + 1);
                    }, newTime);
                });
            }
            else {
                processTestVectors(commands, index + 1);
            }


        }
        // Deletes all states in the current SM
        function clearSM() {
            while (graphs[currentIndex].nodes.length > 1) {
                selectedNode = graphs[currentIndex].nodes[1];
                deleteButtonClicked();
            }
            reDrawStateMachine = true;
        }
        // Deletes a node/edge from the current graph
        function deleteButtonClicked() {
            if ((selectedNode == null && selectedEdge == null) || simulateOnly) {
                return;
            }
            clearStateFields();
            if (selectedEdge != null) {
                if (selectedEdge.head == graphs[currentIndex].nodes[0]) {
                    return;
                }
                graphs[currentIndex].edges.splice(graphs[currentIndex].edges.indexOfObject(selectedEdge), 1);
                selectedEdge = null;
                return;
            }
            if (selectedNode != null) {
                if (selectedNode == graphs[currentIndex].nodes[0]) {
                    return;
                }
                var i = 0;
                // When deleting a node all edges connected to it must also be deleted
                while (i < graphs[currentIndex].edges.length) {
                    for (i = 0; i < graphs[currentIndex].edges.length; i++) {
                        if (graphs[currentIndex].edges[i].head === selectedNode || graphs[currentIndex].edges[i].tail === selectedNode) {
                            graphs[currentIndex].edges.splice(i, 1);
                            break;
                        }
                    }
                }
                graphs[currentIndex].nodes.splice(graphs[currentIndex].nodes.indexOf(selectedNode), 1);
                selectedNode = null;
            }
        }
        // Have to update edge/nodes actions when user enters new data
        function stateActionsChanged(e) {
            if (selectedNode != null) {
                selectedNode.actions = $('#stateActions_' + zyID).val();
            }
            else if (selectedEdge != null) {
                selectedEdge.actions = $('#stateActions_' + zyID).val();
            }
        }
        // Have to update edge/nodes condtion when user enters new data
        function stateConditionsChanged(e) {
            if (selectedEdge != null) {
                selectedEdge.condition = $('#stateConditions_' + zyID).val();
            }
        }
        // Places the dummy state and creates the edge from the dummy state to the init state
        function setNewInitState(i, newNode) {
            var newEdge = new Edge();
            newEdge.head = graphs[i].nodes[0];
            newEdge.tail = newNode;
            graphs[i].edges.push(newEdge);
            graphs[i].nodes[0].rect.x = newNode.rect.x - Node.NODE_RADIUS * 3 - Node.NODE_RADIUS / 2;
            graphs[i].nodes[0].rect.y = newNode.rect.y - Node.NODE_RADIUS * 3 - Node.NODE_RADIUS / 2;
            var p1 = {
                x: graphs[i].nodes[0].rect.x,
                y: graphs[i].nodes[0].rect.y
            };
            var p2 = {
                x: newNode.rect.x,
                y: newNode.rect.y
            };
            newEdge.draw(context);
            newEdge.bp2.x = computeMidPoint(p1, p2).x;
            newEdge.bp2.y = computeMidPoint(p1, p2).y;
            newEdge.bp3.x = newEdge.bp2.x;
            newEdge.bp3.y = newEdge.bp2.y;
            newEdge.bp4.x = p2.x + 10;
            newEdge.bp4.y = p2.y + 10;
        }
        // Updates the position of the dummy state when the init state moves
        function updateInitState(i) {
            var edge = null;
            for (var j = 0; j < graphs[i].edges.length; j++) {
                if (graphs[i].edges[j].head.isDummyState) {
                    edge = graphs[i].edges[j];
                    break;
                }
            }
            if (edge != null) {
                graphs[i].nodes[0].rect.x = edge.tail.rect.x - Node.NODE_RADIUS * 3 - Node.NODE_RADIUS / 2;
                graphs[i].nodes[0].rect.y = edge.tail.rect.y - Node.NODE_RADIUS * 3 - Node.NODE_RADIUS / 2;
                var p1 = {
                    x: graphs[i].nodes[0].rect.x,
                    y: graphs[i].nodes[0].rect.y
                };
                var p2 = {
                    x: edge.tail.rect.x,
                    y: edge.tail.rect.y
                };
                edge.draw(context);
                edge.bp2.x = computeMidPoint(p1, p2).x;
                edge.bp2.y = computeMidPoint(p1, p2).y;
                edge.bp3.x = edge.bp2.x;
                edge.bp3.y = edge.bp2.y;
                edge.bp4.x = p2.x + 10;
                edge.bp4.y = p2.y + 10;
            }


        }
        // If init state is checked true, have to move dummy state, else checked false have to remove edge from dummy state
        function initStateChecked(e) {
            if (selectedNode != null) {
                // True -> false
                if (selectedNode.initState) {
                    // Was true before
                    // Need to remove the transition from the dummy state to the old initial state
                    for (var j = 0; j < graphs[currentIndex].edges.length; j++) {
                        if (graphs[currentIndex].edges[j].head == graphs[currentIndex].nodes[0] && graphs[currentIndex].edges[j].tail == selectedNode) {
                            selectedEdge = graphs[currentIndex].edges[j];
                            graphs[currentIndex].edges.splice(graphs[currentIndex].edges.indexOfObject(selectedEdge), 1);
                            selectedEdge = null;
                            break;
                        }
                    }

                }
                // False -> true
                if ($('#initStateCheck_' + zyID).is(':checked')) {
                    // Can have a state that is already been chosen to be the initial state
                    // Have to change the initial state to be the selectedNode
                    // Need to remove the transition from the dummy state to the old initial state
                    for (var i = 0; i < graphs[currentIndex].nodes.length; i++) {
                        if (graphs[currentIndex].nodes[i].initState) {
                            graphs[currentIndex].nodes[i].initState = false;
                            for (var j = 0; j < graphs[currentIndex].edges.length; j++) {
                                if (graphs[currentIndex].edges[j].head == graphs[currentIndex].nodes[0] && graphs[currentIndex].edges[j].tail == graphs[currentIndex].nodes[i]) {
                                    selectedEdge = graphs[currentIndex].edges[j];
                                    graphs[currentIndex].edges.splice(graphs[currentIndex].edges.indexOfObject(selectedEdge), 1);
                                    selectedEdge = null;
                                    break;
                                }
                            }
                            break;
                        }
                    }

                    setNewInitState(currentIndex, selectedNode);
                }
                selectedNode.initState = $('#initStateCheck_' + zyID).is(':checked');
            }
        }
        // Update current node name when user chages data
        function stateNameChanged(e) {
            if (e.which !== 13) {
                if (selectedNode != null) {
                    selectedNode.name = $('#stateName_' + zyID).val();
                }
            }
            else {
                e.preventDefault();
            }
        }
        // Enter transition mode
        function insertTransitionClicked(e) {
            transitionMode = !transitionMode;
            selectedNode = null;
            if (selectedEdge != null) {
                selectedEdge.deselect();
            }
            selectedEdge = null;
        }
        // Returns the new mouse position for use in the canvas, the magic numbers offset it to the center
        function updateMousePos(e) {
            var xOffset = 25;
            var yOffset = 18;
            if (self.isProgressionTool) {
                xOffset = 0;
                yOffset = 0;
            }
            var rect = canvas.getBoundingClientRect();
            var initialX;
            var initialY;
            // This is a touch event
            if (e.type.indexOf('touch') != -1) {
                if (e.originalEvent.touches.length > 0) {
                    initialX = e.originalEvent.touches[0].clientX;
                    initialY = e.originalEvent.touches[0].clientY;
                }
                else {
                    initialX = e.originalEvent.changedTouches[0].clientX;
                    initialY = e.originalEvent.changedTouches[0].clientY;
                }
            }
            else {
                initialX = e.clientX;
                initialY = e.clientY;
            }
            mousePos = {
                x: (initialX - rect.left - xOffset),
                y: (initialY - rect.top - yOffset)
            };
        }
        // Handles the creation of edges and the switching of all text fields when a new edge or node has been selected
        function canvasMouseDown(e) {
            // No canvas mouse events while simulating
            if (simulateID || !canEdit || paused) {
                return;
            }
            updateMousePos(e);
            dragged = false;
            canDrag = false;
            holdTimeout = setTimeout(function() {
                canDrag = true;
            }, 100);
            if (transitionMode && selectedNode != null) {
                // We have already selected src, see if a dst is being clicked.
                var dst = getClickedNode();
                if (dst != null) {
                    var alreadyCreated = false;
                    if (dst === selectedNode) {
                        // Check if we already have a self transition
                        for (var i = 0; i < graphs[currentIndex].edges.length; i++) {
                            if (graphs[currentIndex].edges[i].head === graphs[currentIndex].edges[i].tail && graphs[currentIndex].edges[i].head === selectedNode) {
                                alreadyCreated = true;
                                break;
                            }
                        }
                    }
                    if (!alreadyCreated) {
                        createEdge(dst);
                        transitionMode = false;
                    }
                    else {
                        transitionMode = false;
                    }

                }
            }
            else {
                selectedNode = getClickedNode();
                if (selectedNode != null) {
                    if (selectedEdge != null) {
                        selectedEdge.deselect();
                        selectedEdge = null;
                    }
                    // Not null load properties of the state
                    loadStateProperties();
                }
                else {
                    // Node not clicked, test edge
                    if (selectedEdge != null) {
                        if (!selectedEdge.handleIntersect(mousePos.x, mousePos.y)) {
                            selectedEdge.deselect();
                            selectedEdge = getClickedEdge();
                        }

                    }
                    else {
                        selectedEdge = getClickedEdge();
                    }
                    // Edge was clicked must load edge properties
                    if (selectedEdge != null) {
                        selectedNode = null;
                        loadEdgeProperties();
                    }
                    else {
                        // Nothing was clicked, clear all properties
                        clearStateFields();
                    }

                }
            }
        }

        // Helper to load all edge properties that a user can change. Called after an edge has been selected.
        function loadEdgeProperties() {
            $('#deleteButton_' + zyID).prop('disabled', false);
            $('#deleteButton_' + zyID).removeClass('disabled');
            $('#initStateCheck_' + zyID).prop('disabled', true);
            $('#stateConditions_' + zyID).val(selectedEdge.condition);
            $('#initStateCheck_' + zyID).prop('disabled', true);
            $('#stateName_' + zyID).val('');
            $('#stateName_' + zyID).prop('contentEditable', false);
            $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);
            if (!digDesignMode && !HLSM) {
                $('#stateActions_' + zyID).val(selectedEdge.actions);
                $('#stateActions_' + zyID).prop('disabled', false);
                $('#stateActions_' + zyID).css('background-color', '');
            }
            else {
                $('#stateActions_' + zyID).val('');
                $('#stateActions_' + zyID).prop('disabled', true);
                $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
            }
            if (!selectedEdge.head.isDummyState) {
                $('#stateConditions_' + zyID).prop('disabled', false);
                $('#stateConditions_' + zyID).css('background-color', '');
            }
            $('#initStateCheck_' + zyID).prop('checked', false);
        }

        // Helper to load all state properties that a user can change. Called after an state has been selected.
        function loadStateProperties() {
            $('#deleteButton_' + zyID).prop('disabled', false);
            $('#deleteButton_' + zyID).removeClass('disabled');
            $('#stateActions_' + zyID).css('background-color', '');
            $('#stateActions_' + zyID).val(selectedNode.actions);
            $('#stateConditions_' + zyID).val('');
            $('#stateName_' + zyID).css('background-color', '');
            $('#stateName_' + zyID).prop('disabled', false);
            $('#stateActions_' + zyID).prop('disabled', false);
            $('#stateConditions_' + zyID).prop('disabled', true);
            $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
            $('#initStateCheck_' + zyID).prop('checked', selectedNode.initState);
            $('#stateName_' + zyID).val(selectedNode.name);
            if (selectedNode.initState) {
                $('#initStateCheck_' + zyID).prop('disabled', false);
                $('#initStateCheck_' + zyID).prop('checked', true);
            }
            else {
                $('#initStateCheck_' + zyID).prop('disabled', false);
                $('#initStateCheck_' + zyID).prop('checked', false);
            }
        }

        // Clears all the fields and disables them
        function clearStateFields() {
            $('#deleteButton_' + zyID).prop('disabled', true);
            $('#deleteButton_' + zyID).addClass('disabled');
            $('#stateActions_' + zyID).val('');
            $('#stateConditions_' + zyID).val('');
            $('#initStateCheck_' + zyID).prop('checked', false);
            $('#initStateCheck_' + zyID).prop('disabled', true);
            $('#stateName_' + zyID).val('');

            $('#stateActions_' + zyID).prop('disabled', true);
            $('#stateConditions_' + zyID).prop('disabled', true);
            $('#stateName_' + zyID).prop('disabled', true);

            $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
            $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
            $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);
        }

        // Updates position of elements being dragged
        function canvasMouseMove(e) {
            // No canvas mouse events while simulating
            if (simulateID || !canEdit || paused) {
                return;
            }
            updateMousePos(e);
            // User is dragging, drag the currently selected node
            if (selectedNode != null && canDrag) {
                var oldX = selectedNode.rect.x;
                var oldY = selectedNode.rect.y;
                var changed = selectedNode.moveTo(mousePos.x, mousePos.y);
                var dx = selectedNode.rect.x - oldX;
                var dy = selectedNode.rect.y - oldY;

                for (var i = 0; i < graphs[currentIndex].edges.length; i++) {
                    if (graphs[currentIndex].edges[i].head == selectedNode || graphs[currentIndex].edges[i].tail == selectedNode) {
                        graphs[currentIndex].edges[i].moveBy(dx, dy);
                    }
                }
                if (changed) {
                    dragged = true;
                }
            }
            // Reposition handles
            if (selectedEdge != null && canDrag && selectedEdge.bp2HandleSelected) {
                selectedEdge.bp2.x = mousePos.x;
                selectedEdge.bp2.y = mousePos.y;
            }
            if (selectedEdge != null && canDrag && selectedEdge.bp3HandleSelected) {
                selectedEdge.bp3.x = mousePos.x;
                selectedEdge.bp3.y = mousePos.y;
            }
        }
        // On release of the mouse, objects can no longer be dragged
        function canvasMouseUp(e) {
            // No canvas mouse events while simulating
            if (simulateID || !canEdit || paused) {
                return;
            }
            updateMousePos(e);
            clearTimeout(holdTimeout);
            dragged = false;
            canDrag = false;
        }

        // Turns controls on or off depending on the value of |enableControls|, progression tools need a different set of controls turned off.
        function turnOnOffControlsForProgression(enableControls) {
            if (enableControls) {
                $('#deleteButton_' + zyID).prop('disabled', false);
                $('#importButton_' + zyID).prop('disabled', false);
                $('#exportButton_' + zyID).prop('disabled', false);

                $('#exampleDrop_' + zyID).prop('disabled', false);
                $('#insertStateButton_' + zyID).prop('disabled', false);
                $('#insertTransitionButton_' + zyID).prop('disabled', false);
                $('#testVectorButton_' + zyID).prop('disabled', false);
                $('#exportToRimsButton_' + zyID).prop('disabled', false);
                $('#simulateButton_' + zyID).prop('disabled', false);

                $('#simulateButton_' + zyID).removeClass('disabled');
                $('#deleteButton_' + zyID).removeClass('disabled');
                $('#importButton_' + zyID).removeClass('disabled');
                $('#exportButton_' + zyID).removeClass('disabled');
                $('#insertStateButton_' + zyID).removeClass('disabled');
                $('#insertTransitionButton_' + zyID).removeClass('disabled');
                $('#testVectorButton_' + zyID).removeClass('disabled');
                $('#exportToRimsButton_' + zyID).removeClass('disabled');

                $('#JSONImportExport_' + zyID).prop('disabled', false);
                $('#testVectorWindow_' + zyID).prop('disabled', false);
                $('#period_' + zyID).prop('disabled', false);
                $('#period_' + zyID).css('background-color', '');


                $('#stateActions_' + zyID).val('');
                $('#stateConditions_' + zyID).val('');
                $('#initStateCheck_' + zyID).prop('checked', false);
                $('#initStateCheck_' + zyID).prop('disabled', true);
                $('#stateName_' + zyID).val('');
                $('#stateName_' + zyID).prop('disabled', true);
                $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);

                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].enable();
                }

                canEdit = true;
            }
            else {
                $('#stateActions_' + zyID).val('');
                $('#stateActions_' + zyID).prop('disabled', true);
                $('#stateConditions_' + zyID).val('');
                $('#stateConditions_' + zyID).prop('disabled', true);
                $('#initStateCheck_' + zyID).prop('checked', false);
                $('#initStateCheck_' + zyID).prop('disabled', true);
                $('#deleteButton_' + zyID).prop('disabled', true);
                $('#stateName_' + zyID).val('');
                $('#importButton_' + zyID).prop('disabled', true);
                $('#exportButton_' + zyID).prop('disabled', true);
                $('#exampleDrop_' + zyID).prop('disabled', true);
                $('#insertStateButton_' + zyID).prop('disabled', true);
                $('#insertTransitionButton_' + zyID).prop('disabled', true);
                $('#JSONImportExport_' + zyID).prop('disabled', true);
                $('#testVectorWindow_' + zyID).prop('disabled', true);
                $('#testVectorButton_' + zyID).prop('disabled', true);
                $('#exportToRimsButton_' + zyID).prop('disabled', true);
                $('#period_' + zyID).prop('disabled', true);
                $('#stateName_' + zyID).prop('disabled', true);

                $('#simulateButton_' + zyID).prop('disabled', true);
                $('#deleteButton_' + zyID).addClass('disabled');
                $('#importButton_' + zyID).addClass('disabled');
                $('#exportButton_' + zyID).addClass('disabled');
                $('#insertStateButton_' + zyID).addClass('disabled');
                $('#insertTransitionButton_' + zyID).addClass('disabled');
                $('#testVectorButton_' + zyID).addClass('disabled');
                $('#exportToRimsButton_' + zyID).addClass('disabled');
                $('#simulateButton_' + zyID).addClass('disabled');


                $('#period_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);


                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].disable();
                }

                canEdit = false;

                // If simulation is running we need to stop it
                if (simulateID) {
                    simulate();
                }

                if (selectedNode) {
                    selectedNode = null;
                }

                if (selectedEdge) {
                    selectedEdge.deselect();
                    selectedEdge = null;
                }

            }
        }

        // Disables controls when simulating and enables controls when not simulating
        function turnOnOffControls() {
            if (simulateID || paused) {
                $('#deleteButton_' + zyID).prop('disabled', false);
                $('#importButton_' + zyID).prop('disabled', false);
                $('#exportButton_' + zyID).prop('disabled', false);
                //Carson Welty 8/12/2021
                $('#speed-choice').prop('disabled', false);

                $('#exampleDrop_' + zyID).prop('disabled', false);
                $('#insertStateButton_' + zyID).prop('disabled', false);
                $('#insertTransitionButton_' + zyID).prop('disabled', false);
                $('#testVectorButton_' + zyID).prop('disabled', false);
                $('#exportToRimsButton_' + zyID).prop('disabled', false);

                $('#deleteButton_' + zyID).removeClass('disabled');
                $('#importButton_' + zyID).removeClass('disabled');
                $('#exportButton_' + zyID).removeClass('disabled');
                $('#insertStateButton_' + zyID).removeClass('disabled');
                $('#insertTransitionButton_' + zyID).removeClass('disabled');
                $('#testVectorButton_' + zyID).removeClass('disabled');
                $('#exportToRimsButton_' + zyID).removeClass('disabled');

                $('#JSONImportExport_' + zyID).prop('disabled', false);
                $('#testVectorWindow_' + zyID).prop('disabled', false);
                $('#period_' + zyID).prop('disabled', false);
                $('#period_' + zyID).css('background-color', '');


                $('#stateActions_' + zyID).val('');
                $('#stateConditions_' + zyID).val('');
                $('#initStateCheck_' + zyID).prop('checked', false);
                $('#initStateCheck_' + zyID).prop('disabled', true);
                $('#stateName_' + zyID).val('');
                $('#stateName_' + zyID).prop('disabled', true);
                $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);

                for (var i = 0; i < inputs.length; i++) {
                    inputs[i].enable();
                }

            }
            else {
                $('#stateActions_' + zyID).val('');
                $('#stateActions_' + zyID).prop('disabled', true);
                $('#stateConditions_' + zyID).val('');
                $('#stateConditions_' + zyID).prop('disabled', true);
                $('#initStateCheck_' + zyID).prop('checked', false);
                $('#initStateCheck_' + zyID).prop('disabled', true);
                $('#deleteButton_' + zyID).prop('disabled', true);
                $('#stateName_' + zyID).val('');
                $('#importButton_' + zyID).prop('disabled', true);
                $('#exportButton_' + zyID).prop('disabled', true);
                $('#exampleDrop_' + zyID).prop('disabled', true);
                $('#insertStateButton_' + zyID).prop('disabled', true);
                $('#insertTransitionButton_' + zyID).prop('disabled', true);
                $('#JSONImportExport_' + zyID).prop('disabled', true);
                $('#testVectorWindow_' + zyID).prop('disabled', true);
                $('#testVectorButton_' + zyID).prop('disabled', true);
                $('#exportToRimsButton_' + zyID).prop('disabled', true);
                $('#period_' + zyID).prop('disabled', true);
                $('#stateName_' + zyID).prop('disabled', true);
                //Carson Welty 8/12/2021
                $('#speed-choice').prop('disabled', true);

                $('#deleteButton_' + zyID).addClass('disabled');
                $('#importButton_' + zyID).addClass('disabled');
                $('#exportButton_' + zyID).addClass('disabled');
                $('#insertStateButton_' + zyID).addClass('disabled');
                $('#insertTransitionButton_' + zyID).addClass('disabled');
                $('#testVectorButton_' + zyID).addClass('disabled');
                $('#exportToRimsButton_' + zyID).addClass('disabled');

                $('#period_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateActions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateConditions_' + zyID).css('background-color', BACKGROUND_GRAY);
                $('#stateName_' + zyID).css('background-color', BACKGROUND_GRAY);

                if ($('#testVectorWindow_' + zyID).css('visibility') == 'visible') {
                    for (var i = 0; i < inputs.length; i++) {
                        inputs[i].disable();
                    }
                }
            }
        }

        // Goes through each node and sees if any intersect with the current mouse position
        function getClickedNode() {
            for (var i = 0; i < graphs[currentIndex].nodes.length; i++) {
                if (graphs[currentIndex].nodes[i].pointIntersect(mousePos.x, mousePos.y)) {
                    return graphs[currentIndex].nodes[i];
                }
            }
            return null;
        }

        // Goes through each edge and sees if any intersect with the current mouse position
        function getClickedEdge() {
            for (var i = 0; i < graphs[currentIndex].edges.length; i++) {
                if (graphs[currentIndex].edges[i].pointIntersect(mousePos.x, mousePos.y)) {
                    graphs[currentIndex].edges[i].selected = true;
                    return graphs[currentIndex].edges[i];
                }
            }
            return null;
        }

        function createNode() {
            var node = new Node();
            // New node is generated in a random location in the center
            node.rect.x = canvas.width / 2 + (Math.random() * canvas.width / 4);
            node.rect.y = canvas.height / 2 + (Math.random() * canvas.height / 4);
            var nameTaken = true;
            var newName;
            var nameIndex = 0;
            newName = 's' + nameIndex;
            // This ensures new SM name is unique
            while (nameTaken) {
                nameTaken = false;
                for (var i = 0; i < graphs[currentIndex].nodes.length; i++) {
                    if (graphs[currentIndex].nodes[i].name === newName) {
                        nameIndex++;
                        newName = 's' + nameIndex;
                        nameTaken = true;
                    }
                }
            }
            node.name = newName;
            graphs[currentIndex].nodes.push(node);
            if (selectedEdge) {
                selectedEdge.deselect();
            }
            selectedEdge = null;
            selectedNode = node;
            loadStateProperties();
        }
        // Find smallest number not taken by an edge that shares tails
        function calculatePriority(node, edges) {
            var takenValues = [];
            for (var i = 0; i < edges.length; i++) {
                if (edges[i].tail == node && edges[i].head != node) {
                    takenValues.push(edges[i].priority);
                }
            }
            var minNumber = 0;
            var valueTaken = true;
            while (valueTaken) {
                valueTaken = false;
                for (var j = 0; j < takenValues.length; j++) {
                    if (takenValues[j] == minNumber) {
                        valueTaken = true;
                        minNumber++;
                        break;
                    }
                }
            }
            return minNumber;
        }
        function createEdge(endNode) {
            var edge = new Edge();
            edge.head = selectedNode;
            edge.tail = endNode;
            if (edge.head === edge.tail) {
                edge.head.totalSelfEdges++;
                edge.priority = 1;
            }
            else {
                edge.priority = calculatePriority(edge.tail, graphs[currentIndex].edges);
            }

            graphs[currentIndex].edges.push(edge);
            if (selectedEdge) {
                selectedEdge.deselect();
            }
            selectedEdge = edge;
            selectedEdge.selected = true;
            selectedNode = null;
            loadEdgeProperties();
        }
        // Draws the current state machine
        function drawLoop() {
            if (reDrawStateMachine) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                for (var i = graphs[currentIndex].edges.length - 1; i >= 0; i--) {
                    graphs[currentIndex].edges[i].draw(context);
                }
                for (var i = graphs[currentIndex].nodes.length - 1; i >= 0; i--) {
                    graphs[currentIndex].nodes[i].draw(context);
                }
                updateInitState(currentIndex);
                // Draws selection box around current node
                if (selectedNode != null && !simulateID && !paused) {
                    context.save();
                    context.strokeStyle = ZYANTE_DARK_ORANGE;
                    context.strokeRect(selectedNode.rect.x + SELECTION_BOUNDING_BOX_OFFSETS.x, selectedNode.rect.y + SELECTION_BOUNDING_BOX_OFFSETS.y, selectedNode.rect.width + SELECTION_BOUNDING_BOX_OFFSETS.width, selectedNode.rect.height + SELECTION_BOUNDING_BOX_OFFSETS.height);
                    context.restore();
                }

                if (DEBUG) {
                    // Display connected bezier points
                    for (var i = graphs[currentIndex].edges.length - 1; i >= 0; i--) {
                        context.strokeStyle = ZYANTE_DARK_ORANGE;
                        context.beginPath();
                        context.moveTo(graphs[currentIndex].edges[i].bp1.x, graphs[currentIndex].edges[i].bp1.y);
                        context.lineTo(graphs[currentIndex].edges[i].bp2.x, graphs[currentIndex].edges[i].bp2.y);
                        context.lineTo(graphs[currentIndex].edges[i].bp3.x, graphs[currentIndex].edges[i].bp3.y);
                        context.lineTo(graphs[currentIndex].edges[i].bp4.x, graphs[currentIndex].edges[i].bp4.y);
                        context.lineTo(graphs[currentIndex].edges[i].bp1.x, graphs[currentIndex].edges[i].bp1.y);
                        context.stroke();
                    }
                }
                reDrawStateMachine = false;
            }


        }
        // Execute a user action
        function executeAction(action, stateName) {
            if (!action || jQuery.trim(action).length == 0) {
                return;
            }
            action = action.trim();

            // Check for semicolon
            const reSemicolon = /^(.*\s*)*;$/;
            let usesSemicolon = false;

            // Apparently the |reSemicolon| match can take a lot of time if a semicolon is not present. So let's first check if there's one.
            if (action.includes(';')) {
                usesSemicolon = reSemicolon.test(action);
            }

            if (!usesSemicolon && !digDesignMode) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'SyntaxError: missing semicolon, \n' + action;
                }
                else {
                    alert(stateName + ':' + 'SyntaxError: missing semicolon, \n' + action);
                    simulate();
                }

                return false;
            }
            else if (usesSemicolon && digDesignMode) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'SyntaxError: unexpected semicolon, \n' + action;
                }
                else {
                    alert(stateName + ':' + 'SyntaxError: unexpected semicolon, \n' + action);
                    simulate();
                }

                return false;
            }

            // Only assignements left in action
            var assignmentTestAction = action.replace(/\>=/g, '');
            assignmentTestAction = assignmentTestAction.replace(/\<=/g, '');
            assignmentTestAction = assignmentTestAction.replace(/==/g, '');
            assignmentTestAction = assignmentTestAction.replace(/!=/g, '');
            // If reading output
            var assignmentsToTest = assignmentTestAction.split(';');
            for (var j = 0; j < assignmentsToTest.length; j++) {
                for (var i = outputOffset; i < (outputSize + outputOffset); i++) {
                    var outputIndex = assignmentsToTest[j].lastIndexOf(outputs[i].labelValue);
                    var equalIndex = assignmentsToTest[j].lastIndexOf('=');
                    if ((equalIndex != -1) && (outputIndex != -1) && (outputIndex > equalIndex)) {
                        // We have an assignement
                        if (self.isProgressionTool && !simulateID) {
                            progressionExecutionErrorMessage = stateName + ':' + 'Error: Reading outputs is not allowed; only inputs/variables may be read';
                            return false;
                        }
                        else {
                            alert(stateName + ':' + 'Error: Reading outputs is not allowed; only inputs/variables may be read.\n');
                            simulate();
                            return false;
                        }
                    }
                }
                // Check if reading 8 bit outputs
                var outputIndex = assignmentsToTest[j].lastIndexOf('Y');
                var equalIndex = assignmentsToTest[j].lastIndexOf('=');
                if ((equalIndex != -1) && (outputIndex != -1) && (outputIndex > equalIndex)) {
                    // We have an assignement
                    if (self.isProgressionTool && !simulateID) {
                        progressionExecutionErrorMessage = stateName + ':' + 'Error: Reading outputs is not allowed; only inputs/variables may be read';
                        return false;
                    }
                    else {
                        alert(stateName + ':' + 'Error: Reading outputs is not allowed; only inputs/variables may be read.\n');
                        simulate();
                        return false;
                    }
                }
                var outputIndex = assignmentsToTest[j].lastIndexOf('Z');
                var equalIndex = assignmentsToTest[j].lastIndexOf('=');
                if ((equalIndex != -1) && (outputIndex != -1) && (outputIndex > equalIndex)) {
                    // We have an assignement
                    if (self.isProgressionTool && !simulateID) {
                        progressionExecutionErrorMessage = stateName + ':' + 'Error: Reading outputs is not allowed; only inputs/variables may be read';
                        return false;
                    }
                    else {
                        alert(stateName + ':' + 'Error: Reading outputs is not allowed; only inputs/variables may be read.\n');
                        simulate();
                        return false;
                    }
                }
            }
            var assignmentRE = /([A-Za-z0-9]+)\s* =/g;
            var match;
            var assigningUndefinedVars = assignmentTestAction;
            while (match = assignmentRE.exec(assigningUndefinedVars)) {
                assignmentRE.lastIndex = 0;
                var matchedString = match[1];
                var isOutput = false;
                for (var i = outputOffset; i < (outputSize + outputOffset); i++) {
                    if (matchedString === outputs[i].labelValue) {
                        isOutput = true;
                        break;
                    }
                }
                isOutput = matchedString === 'Y' || matchedString === 'Z' || matchedString === 'I' || matchedString === 'J' || matchedString === 'B' || isOutput;
                var outputIndex = assigningUndefinedVars.indexOf(matchedString);
                var equalIndex = assigningUndefinedVars.indexOf('=');
                var endOfStatement = assigningUndefinedVars.indexOf(';');
                if (endOfStatement == -1 && digDesignMode) {
                    endOfStatement = assigningUndefinedVars.indexOf('\n');
                    if (endOfStatement == -1) {
                        endOfStatement = assigningUndefinedVars.length - 1;
                    }
                }
                if (endOfStatement == -1) {
                    if (self.isProgressionTool && !simulateID) {
                        progressionExecutionErrorMessage = stateName + ':' + 'SyntaxError: missing semicolon';
                        return false;
                    }
                    else {
                        alert(stateName + ':' + 'SyntaxError: missing semicolon.\n');
                        simulate();
                        return false;
                    }
                }
                assigningUndefinedVars = assigningUndefinedVars.substring(endOfStatement + 2);
                if (isOutput) {
                    continue;
                }
                if ((equalIndex != -1) && (outputIndex != -1) && outputIndex < equalIndex) {
                    // We have an assignement
                    if (self.isProgressionTool && !simulateID) {
                        progressionExecutionErrorMessage = stateName + ':' + 'SyntaxError: ' + matchedString + ' is not defined';
                        return false;
                    }
                    else {
                        alert(stateName + ':' + 'SyntaxError: ' + matchedString + ' is not defined.\n');
                        simulate();
                        return false;
                    }
                }
            }
            var oldB = B;
            var oldAValues = 0;
            for (var i = 0; i < inputSize; i++) {
                oldAValues |= inputs[i].value << i;
            }
            try {
                eval(action);
            }
            catch (e) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'SyntaxError: ' + e.message + '\n' + action;
                    return false;
                }
                else {
                    alert(stateName + ':' + 'SyntaxError: ' + e.message + '\n' + action);
                    simulate();
                    return false;
                }

            }
            I = I & 0xFF;
            Y = Y & 0xFF;
            Z = Z & 0xFF;
            for (var i = 0; i < outputs.length; i++) {
                outputs[i].outsideUpdate();
            }
            if (oldB != B) {
                updateB(B, false);
            }
            else {
                updateB(B, true);
            }
            var newAValues = 0;
            for (var i = 0; i < inputSize; i++) {
                inputs[i].outsideUpdate();
                newAValues |= inputs[i].value << i;
            }
            if (oldAValues !== newAValues) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'Error: Not allowed to write to inputs.';
                    return false;
                }
                else {
                    alert(stateName + ':' + 'Error: Not allowed to write to inputs.');
                    simulate();
                    return false;
                }
            }
        }

        // Execute a user condition, returns true or false
        function executeCondition(condition, stateName) {
            // Empty always transition
            if (!condition || jQuery.trim(condition).length == 0) {
                return true;
            }
            condition = condition.trim();
            // Using eval, so we filter out bad input so only boolean expressions are executed
            var re = /B[0-7]?/;
            if (condition.match(re) && !HLSM && !digDesignMode) {
                alert(stateName + ':' + 'Error: not allowed to read outputs.');
                simulate();
                return false;
            }
            var numParen;
            for (var i = 0, numParen = 0; i < condition.length; i++) {
                if (condition.charAt(i) == '(') {
                    numParen++;
                }
                else if (condition.charAt(i) == ')') {
                    numParen--;
                }
            }
            if (numParen < 0) {
                alert(stateName + ':' + 'Syntax error: expected (');
                simulate();
                return false;
            }
            else if (numParen > 0) {
                alert(stateName + ':' + 'Syntax error: expected )');
                simulate();
                return false;
            }
            // Only assignements left in condition
            var assignmentTestAction = condition.replace(/\>=/g, '');
            assignmentTestAction = assignmentTestAction.replace(/\<=/g, '');
            assignmentTestAction = assignmentTestAction.replace(/==/g, '');
            assignmentTestAction = assignmentTestAction.replace(/!=/g, '');

            if (assignmentTestAction.indexOf('=') != -1) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'Error: Can not execute assignments in conditions\n';
                    return false;
                }
                else {
                    alert(stateName + ':' + 'Error: Can not execute assignments in conditions.\n');
                    simulate();
                    return false;
                }
            }
            var newcondition;
            if (digDesignMode) {
                condition = convertFromDigDesignSyntax(condition, false);
                newcondition = condition.replace(/!?[a-h]/g, '');
                newcondition = newcondition.replace(/[0-1]/g, '');
                newcondition = newcondition.replace(/&&/g, '');
                newcondition = newcondition.replace(/\|\|/g, '');
                newcondition = newcondition.replace(/\(/g, '');
                newcondition = newcondition.replace(/\)/g, '');
                newcondition = newcondition.replace(/!/g, '');
                newcondition = newcondition.replace(/\s/g, '');
            }
            else if (HLSM) {
                newcondition = condition.replace(/!?[a-h]/g, '');
                newcondition = newcondition.replace(/[EFI0-9]/g, '');
                newcondition = newcondition.replace(/[0-1]/g, '');
                newcondition = newcondition.replace(/&&/g, '');
                newcondition = newcondition.replace(/\|\|/g, '');
                newcondition = newcondition.replace(/&=/g, '');
                newcondition = newcondition.replace(/\|=/g, '');
                newcondition = newcondition.replace(/&/g, '');
                newcondition = newcondition.replace(/\|/g, '');
                newcondition = newcondition.replace(/\>=/g, '');
                newcondition = newcondition.replace(/\<=/g, '');
                newcondition = newcondition.replace(/\>/g, '');
                newcondition = newcondition.replace(/\</g, '');
                newcondition = newcondition.replace(/==/g, '');
                newcondition = newcondition.replace(/!=/g, '');
                newcondition = newcondition.replace(/\*=/g, '');
                newcondition = newcondition.replace(/\*/g, '');
                newcondition = newcondition.replace(/%=/g, '');
                newcondition = newcondition.replace(/%/g, '');
                newcondition = newcondition.replace(/\/=/g, '');
                newcondition = newcondition.replace(/\//g, '');
                newcondition = newcondition.replace(/\+=/g, '');
                newcondition = newcondition.replace(/\+/g, '');
                newcondition = newcondition.replace(/\<\<=/g, '');
                newcondition = newcondition.replace(/\<\</g, '');
                newcondition = newcondition.replace(/\>\>=/g, '');
                newcondition = newcondition.replace(/\>\>/g, '');
                newcondition = newcondition.replace(/\(/g, '');
                newcondition = newcondition.replace(/\)/g, '');
                newcondition = newcondition.replace(/!/g, '');
                newcondition = newcondition.replace(/\s/g, '');
            }
            else {
                newcondition = condition.replace(/!?A[0-9]?/g, '');
                newcondition = newcondition.replace(/[0-1]/g, '');
                newcondition = newcondition.replace(/&&/g, '');
                newcondition = newcondition.replace(/\|\|/g, '');
                newcondition = newcondition.replace(/\(/g, '');
                newcondition = newcondition.replace(/\)/g, '');
                newcondition = newcondition.replace(/!/g, '');
                newcondition = newcondition.replace(/\s/g, '');
            }

            if (newcondition.length > 0) {
                alert(stateName + ':' + 'Error: invalid transition');
                simulate();
                return false;
            }
            var oldAValues = 0;
            for (var i = 0; i < inputSize; i++) {
                oldAValues |= inputs[i].value << i;
            }
            var boolRes;
            try {
                boolRes = eval(condition);
            }
            catch (e) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'SyntaxError: ' + e.message;
                    return false;
                }
                else {
                    alert(stateName + ':' + 'SyntaxError: ' + e.message);
                    simulate();
                    return false;
                }

            }
            var newAValues = 0;
            for (var i = 0; i < inputSize; i++) {
                inputs[i].outsideUpdate();
                newAValues |= inputs[i].value << i;
            }
            if (oldAValues !== newAValues) {
                if (self.isProgressionTool && !simulateID) {
                    progressionExecutionErrorMessage = stateName + ':' + 'Error: Not allowed to write to inputs.';
                    return false;
                }
                else {
                    alert(stateName + ':' + 'Error: Not allowed to write to inputs.');
                    simulate();
                    return false;
                }
            }
            return boolRes;
        }

        // Converts to Digitial design syntax from C syntax.
        // |stringToConvert| is the line of code to be converted,
        // if |changeNames| is true names will be changed (used when loading examples)
        function convertToDigDesignSyntax(stringToConvert, changeNames) {
            var convertedString = stringToConvert;
            if (changeNames) {
                convertedString = convertedString.replace(/A0/g, 'a');
                convertedString = convertedString.replace(/A1/g, 'b');
                convertedString = convertedString.replace(/A2/g, 'c');
                convertedString = convertedString.replace(/A3/g, 'd');
                convertedString = convertedString.replace(/A4/g, 'e');
                convertedString = convertedString.replace(/A5/g, 'f');
                convertedString = convertedString.replace(/A6/g, 'g');
                convertedString = convertedString.replace(/A7/g, 'h');

                convertedString = convertedString.replace(/B0/g, outputs[outputOffset].labelValue);
                convertedString = convertedString.replace(/B1/g, outputs[(outputOffset + 1) % outputSize].labelValue);
                convertedString = convertedString.replace(/B2/g, outputs[(outputOffset + 2) % outputSize].labelValue);
                convertedString = convertedString.replace(/B3/g, outputs[(outputOffset + 3) % outputSize].labelValue);
                convertedString = convertedString.replace(/B4/g, outputs[(outputOffset + 4) % outputSize].labelValue);
                convertedString = convertedString.replace(/B5/g, outputs[(outputOffset + 5) % outputSize].labelValue);
                convertedString = convertedString.replace(/B6/g, outputs[(outputOffset + 6) % outputSize].labelValue);
                convertedString = convertedString.replace(/B7/g, outputs[(outputOffset + 7) % outputSize].labelValue);

                if (convertedString.indexOf('A') != -1 || convertedString.indexOf('B') != -1) {
                    convertedString = '';
                }
            }
            if (!HLSM) {
                convertedString = convertedString.replace(/\s*&&\s*/g, '');
                convertedString = convertedString.replace(/\|\|/g, '+');
                convertedString = convertedString.replace(/!(.)/g, '$1\'');
                convertedString = convertedString.replace(/!(\(.\))/g, '($1)\'');
            }

            return convertedString;
        }

        // Converts from Digitial design syntax to C syntax.
        // |stringToConvert| is the line of code to be converted,
        // if |changeNames| is true names will be changed (used when loading examples)
        function convertFromDigDesignSyntax(stringToConvert, changeNames) {
            var convertedString = stringToConvert;
            if (changeNames && (convertedString.indexOf('A') === -1) && (convertedString.indexOf('B') === -1)) {
                convertedString = convertedString.replace(/a/g, 'A0');
                convertedString = convertedString.replace(/b/g, 'A1');
                convertedString = convertedString.replace(/c/g, 'A2');
                convertedString = convertedString.replace(/d/g, 'A3');
                convertedString = convertedString.replace(/e/g, 'A4');
                convertedString = convertedString.replace(/f/g, 'A5');
                convertedString = convertedString.replace(/g/g, 'A6');
                convertedString = convertedString.replace(/h/g, 'A7');

                convertedString = convertedString.replace(/s/g, 'B0');
                convertedString = convertedString.replace(/t/g, 'B1');
                convertedString = convertedString.replace(/u/g, 'B2');
                convertedString = convertedString.replace(/v/g, 'B3');
                convertedString = convertedString.replace(/w/g, 'B4');
                convertedString = convertedString.replace(/x/g, 'B5');
                convertedString = convertedString.replace(/y/g, 'B6');
                convertedString = convertedString.replace(/z/g, 'B7');
            }
            convertedString = convertedString.replace(/\+/g, '||');
            convertedString = convertedString.replace(/([a-h])'/g, '!$1');
            convertedString = convertedString.replace(/(\(.\))'/g, '!$1');
            convertedString = convertedString.replace(/(!?[a-h])(!?[a-h])/g, '$1 && $2');
            return convertedString;
        }

        // Update the B variable and all of its components, also updates the visuals for B
        function updateB(value, componentsWereModified) {
            if (componentsWereModified) {
                B = (outputs[7].value << 7) | (outputs[6].value << 6) | (outputs[5].value << 5) | (outputs[4].value << 4) | (outputs[3].value << 3) | (outputs[2].value << 2) | (outputs[1].value << 1) | outputs[0].value;
            }
            else {
                B = value;
                outputs[0].setOutput(B & 0x01);
                outputs[1].setOutput((B & 0x02) >> 1);
                outputs[2].setOutput((B & 0x04) >> 2);
                outputs[3].setOutput((B & 0x08) >> 3);
                outputs[4].setOutput((B & 0x10) >> 4);
                outputs[5].setOutput((B & 0x20) >> 5);
                outputs[6].setOutput((B & 0x40) >> 6);
                outputs[7].setOutput((B & 0x80) >> 7);
            }
            if (!(digDesignMode || HLSM)) {
                outputs.decimalOutput.setValue(B);
            }

            if (HLSM) {
                $('#internalI_' + zyID).val(parseInt(I));
                $('#internalJ_' + zyID).val(parseInt(J));
                outputs.Y.setOutput(Y);
                outputs.Z.setOutput(Z);
            }
        }

        var XML_CHAR_MAP = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            '\'': '&apos;'
        };

        var CHAR_XML_MAP = {
            '&lt;' : '<',
            '&gt;' : '>',
            '&amp;' : '&',
            '&quot;' : '"',
            '&apos;' : '\''
        };

        function escapeXml(s) {
            return s.replace(/[<>&"']/g, function(ch) {
                return XML_CHAR_MAP[ch];
            });
        }

        function unescapeXml(s) {
            return s.replace(/(&lt;)|(&gt;)|(&amp;)|(&quot;)|(&apos;)/g, function(xml) {
                return CHAR_XML_MAP[xml];
            });
        }

        function loadFromJSON(inputString, loadOnImport) {
            graphs = [];
            currentIndex = 0;
            if (inputString == null || !inputString.length) {
                return;
            }
            var parsedObject = JSON.parse(inputString);
            // Remove all SMs
            var numberOfTabs = $('#canvasTab_' + zyID).find('ul').find('li').length;
            for (var i = 0; i < (numberOfTabs - 2); i++) {
                $('#canvasTab_' + zyID + ' ul:first li:eq(1)').find('span').click();
            }
            // Select first tab
            currentIndex = 0;
            setTimeout(function() {
                $('#canvasTab_' + zyID + ' ul:first li:eq(0) a').click();
            }, 10);
            if (!parsedObject.globalCode) {
                globalCode = '';
            }
            else {
                globalCode = unescapeXml(parsedObject.globalCode);
            }
            for (var j = 0; j < parsedObject.graphs.length; j++) {
                if (j == 0) {
                    graphs.push(new Graph());
                }
                else {
                    addGraph();
                }
                $('#period_' + zyID).val(parseFloat(parsedObject.graphs[j].period));
                graphs[j].period = parseFloat(parsedObject.graphs[j].period);
                graphs[j].name = unescapeXml(parsedObject.graphs[j].name);
                if (!parsedObject.graphs[j].localCode) {
                    graphs[j].localCode = '';
                }
                else {
                    graphs[j].localCode = unescapeXml(parsedObject.graphs[j].localCode);
                }
                $('#canvasTab_' + zyID + ' ul:first li:eq(' + j + ') a').text(graphs[j].name);
                graphs[j].prefix = unescapeXml(parsedObject.graphs[j].prefix);
                // Load em up
                if (parsedObject.graphs[j].nodes.length <= 0) {
                    return;
                }
                selectedNode = null;
                selectedEdge = null;
                var newInitState;
                for (var i = 1; i < (parsedObject.graphs[j].nodes.length + 1); i++) {
                    var node = parsedObject.graphs[j].nodes[i - 1];
                    var index = parseInt(node.id.substring(node.id.lastIndexOf('_') + 1));
                    graphs[j].nodes.push(new Node());
                    graphs[j].nodes[index].initState = node.init;
                    graphs[j].nodes[index].rect.x = parseInt(node.x, 10);
                    graphs[j].nodes[index].rect.y = parseInt(node.y, 10);
                    graphs[j].nodes[index].name = unescapeXml(node.name);
                    if (!node.actions) {
                        graphs[j].nodes[index].actions = '';
                    }
                    else if (loadOnImport) {
                        graphs[j].nodes[index].actions = unescapeXml(node.actions);
                    }
                    else if (digDesignMode || HLSM) {
                        graphs[j].nodes[index].actions = unescapeXml(convertToDigDesignSyntax(node.actions, true));
                    }
                    else {
                        graphs[j].nodes[index].actions = unescapeXml(convertFromDigDesignSyntax(node.actions, true));
                    }

                    graphs[j].nodes[index].isDummyState = node.dummy;
                    if (graphs[j].nodes[index].initState) {
                        newInitState = graphs[j].nodes[index];
                    }

                }
                // Connections can between elements not yet existing have to wait for all elements to be created before doing connections
                graphs[j].edges = new Array(parsedObject.graphs[j].edges.length);
                for (var i = 0; i < parsedObject.graphs[j].edges.length; i++) {
                    var edge = parsedObject.graphs[j].edges[i];
                    var index = parseInt(edge.id.substring(edge.id.lastIndexOf('_') + 1));
                    var src = parseInt(edge.src.substring(edge.src.lastIndexOf('_') + 1));
                    var dst = parseInt(edge.dst.substring(edge.dst.lastIndexOf('_') + 1));
                    graphs[j].edges[index] = new Edge();
                    graphs[j].edges[index].head = graphs[j].nodes[src];
                    graphs[j].edges[index].tail = graphs[j].nodes[dst];
                    if (!edge.actions) {
                        graphs[j].edges[index].actions = '';
                    }
                    else if (loadOnImport) {
                        graphs[j].edges[index].actions = unescapeXml(edge.actions);
                    }
                    else if (digDesignMode || HLSM) {
                        graphs[j].edges[index].actions = unescapeXml(convertToDigDesignSyntax(edge.actions, true));
                    }
                    else {
                        graphs[j].edges[index].actions = unescapeXml(convertFromDigDesignSyntax(edge.actions, true));
                    }

                    if (!edge.condition) {
                        graphs[j].edges[index].condition = '';
                    }
                    else if (loadOnImport) {
                        graphs[j].edges[index].condition = unescapeXml(edge.condition);
                    }
                    else if (digDesignMode || HLSM) {
                        graphs[j].edges[index].condition = unescapeXml(convertToDigDesignSyntax(edge.condition, true));
                    }
                    else {
                        graphs[j].edges[index].condition = unescapeXml(convertFromDigDesignSyntax(edge.condition, true));
                    }

                    // Remove empty actions
                    if (graphs[j].edges[index].actions.length == 1 && graphs[j].edges[index].actions[0] == '\n') {
                        graphs[j].edges[index].actions = '';
                    }
                    graphs[j].edges[index].priority = parseInt(edge.priority);
                    // BPs are defined
                    if (edge.bp1 && edge.bp2 && edge.bp3 && edge.bp4) {
                        graphs[j].edges[index].setBPs(edge.bp1, edge.bp2, edge.bp3, edge.bp4);
                    }

                }
                updateInitState(j);


            }
        }


        function saveToJSON() {
            var objectToStringify = {
                globalCode: globalCode,
                graphs: []
            };
            for (var j = 0; j < graphs.length; j++) {
                objectToStringify.graphs.push({
                    name: graphs[j].name,
                    prefix: graphs[j].prefix,
                    period: graphs[j].period,
                    localCode: graphs[j].localCode,
                    nodes: [],
                    edges: []
                });
                for (var i = 0; i < graphs[j].nodes.length; i++) {
                    objectToStringify.graphs[j].nodes.push({
                        id: 'node_' + i,
                        x: graphs[j].nodes[i].rect.x,
                        y: graphs[j].nodes[i].rect.y,
                        name: graphs[j].nodes[i].name,
                        init: graphs[j].nodes[i].initState,
                        dummy: graphs[j].nodes[i].isDummyState,
                        actions: graphs[j].nodes[i].actions
                    });
                }
                for (var i = 0; i < graphs[j].edges.length; i++) {
                    var index1 = graphs[j].nodes.indexOfObject(graphs[j].edges[i].head);
                    if (index1 == -1) {
                        index1 = 'null';
                    }
                    var index2 = graphs[j].nodes.indexOfObject(graphs[j].edges[i].tail);
                    if (index2 == -1) {
                        index2 = 'null';
                    }
                    objectToStringify.graphs[j].edges.push({
                        id: 'edge_' + i,
                        src: 'node_' + index1,
                        dst: 'node_' + index2,
                        priority: graphs[j].edges[i].priority,
                        actions: graphs[j].edges[i].actions,
                        condition: graphs[j].edges[i].condition,
                        bp1: graphs[j].edges[i].bp1,
                        bp2: graphs[j].edges[i].bp2,
                        bp3: graphs[j].edges[i].bp3,
                        bp4: graphs[j].edges[i].bp4
                    });
                }
            }
            return JSON.stringify(objectToStringify);
        }

        function exampleChanged() {
            // Stop simulation before switching
            if (simulateID) {
                simulate();
            }
            updateB(0, false);
            switch ($('#exampleDrop_' + zyID)[0].selectedIndex) {
                case 0:
                    var JSON = '{"globalCode":"","graphs":[{"name":"LoHi","prefix":"SM1","period":1000,"localCode":"","nodes":[{"id":"node_0","x":-16.5,"y":115.5,"name":"SMStart","init":false,"dummy":true,"actions":""},{"id":"node_1","x":71,"y":203,"name":"Lo","init":true,"dummy":false,"actions":"B0 = 0;"},{"id":"node_2","x":378,"y":211,"name":"Hi","init":false,"dummy":false,"actions":"B0 = 1;"}],"edges":[{"id":"edge_0","src":"node_1","dst":"node_2","priority":0,"actions":"","condition":"A0"},{"id":"edge_1","src":"node_2","dst":"node_1","priority":0,"actions":"","condition":"!A0"},{"id":"edge_2","src":"node_1","dst":"node_1","priority":1,"actions":"","condition":"!A0"},{"id":"edge_3","src":"node_2","dst":"node_2","priority":1,"actions":"","condition":"A0"},{"id":"edge_4","src":"node_0","dst":"node_1","priority":0,"actions":"B=0;","condition":""}]}]}';
                    if (digDesignMode) {
                        JSON = JSON.replace(/;/g, '');
                    }
                    var testVector = '0x00\n';
                    testVector += 'wait 2 s\n';
                    testVector += 'assert 0bxxxxxxx0\n';
                    testVector += '0x01\n';
                    testVector += 'wait 2 s\n';
                    testVector += 'assert 0bxxxxxxx1\n';
                    testVector += '0x00\n';
                    testVector += 'wait 2 s\n';
                    testVector += 'assert 0bxxxxxxx0\n';
                    $('#testVectorWindow_' + zyID).val(testVector);
                    loadFromJSON(JSON);
                    break;
                case 1:
                    var JSON = '{"globalCode":"","graphs":[{"name":"FlightAttendant","prefix":"SM1","period":1000,"localCode":"","nodes":[{"id":"node_0","x":12.5,"y":125.5,"name":"SMStart","init":false,"dummy":true,"actions":""},{"id":"node_1","x":100,"y":213,"name":"LightOff","init":true,"dummy":false,"actions":"B0 = 0;"},{"id":"node_2","x":347,"y":217,"name":"LightOn","init":false,"dummy":false,"actions":"B0 = 1;"}],"edges":[{"id":"edge_0","src":"node_1","dst":"node_1","priority":1,"actions":"","condition":"!A0"},{"id":"edge_1","src":"node_2","dst":"node_2","priority":1,"actions":"","condition":"!A1 || A0"},{"id":"edge_2","src":"node_1","dst":"node_2","priority":0,"actions":"","condition":"A0"},{"id":"edge_3","src":"node_2","dst":"node_1","priority":0,"actions":"","condition":"A1 && !A0"},{"id":"edge_4","src":"node_0","dst":"node_1","priority":0,"actions":"","condition":""}]}]}';
                    if (digDesignMode) {
                        JSON = JSON.replace(/;/g, '');
                    }
                    loadFromJSON(JSON);
                    break;
                case 2:
                    var JSON = '{"globalCode":"","graphs":[{"name":"Pacemaker","prefix":"SM1","period":1000,"localCode":"","nodes":[{"id":"node_0","x":5.5,"y":-9.5,"name":"SMStart","init":false,"dummy":true,"actions":""},{"id":"node_1","x":93,"y":78,"name":"ResetTimerA","init":true,"dummy":false,"actions":"B1 = 0;"},{"id":"node_2","x":223,"y":285,"name":"WaitV","init":false,"dummy":false,"actions":""},{"id":"node_3","x":12,"y":225,"name":"PaceV","init":false,"dummy":false,"actions":"B2 = 1;"},{"id":"node_4","x":445,"y":157,"name":"PaceA","init":false,"dummy":false,"actions":"B0 = 1;"},{"id":"node_5","x":392,"y":286,"name":"ResetTimerV","init":false,"dummy":false,"actions":"B3 = 1;"},{"id":"node_6","x":295,"y":75,"name":"WaitA","init":false,"dummy":false,"actions":""}],"edges":[{"id":"edge_0","src":"node_1","dst":"node_6","priority":0,"actions":"","condition":""},{"id":"edge_1","src":"node_6","dst":"node_6","priority":1,"actions":"","condition":"!A0 && !A1"},{"id":"edge_2","src":"node_6","dst":"node_4","priority":0,"actions":"","condition":"!A0 && A1"},{"id":"edge_3","src":"node_4","dst":"node_5","priority":0,"actions":"","condition":""},{"id":"edge_4","src":"node_6","dst":"node_5","priority":0,"actions":"","condition":"A0"},{"id":"edge_5","src":"node_5","dst":"node_2","priority":0,"actions":"","condition":""},{"id":"edge_6","src":"node_2","dst":"node_2","priority":1,"actions":"","condition":"!A2 && !A3"},{"id":"edge_7","src":"node_2","dst":"node_3","priority":0,"actions":"","condition":"!A2 && A3"},{"id":"edge_8","src":"node_2","dst":"node_1","priority":0,"actions":"","condition":"A2"},{"id":"edge_9","src":"node_3","dst":"node_1","priority":0,"actions":"","condition":""},{"id":"edge_10","src":"node_0","dst":"node_1","priority":0,"actions":"","condition":""}]}]}';
                    if (digDesignMode) {
                        JSON = JSON.replace(/;/g, '');
                    }
                    loadFromJSON(JSON);
                    break;
            }
        }
        // Basic recursive GCD function
        function GCD(a, b) {
            if (!b) {
                return a;
            }
            return GCD(b, a % b);
        }
        // Export to RIMS C code, currently unused
        function exportToC() {
            var code = '#include "RIMS.h"\n';
            code += 'volatile int TimerFlag = 0;\n';
            code += 'void TimerISR() {\n';
            code += '   TimerFlag = 1;\n';
            code += '}\n';
            code += globalCode + '\n';
            for (var j = 0; j < graphs.length; j++) {
                code += 'enum ' + graphs[j].prefix + '_STATES { ';
                for (var i = 0; i < graphs[j].nodes.length - 1; i++) {
                    code += graphs[j].prefix + '_' + graphs[j].nodes[i].name + ', ';
                }
                code += graphs[j].prefix + '_' + graphs[j].nodes[graphs[j].nodes.length - 1].name + '} ' + graphs[j].prefix + '_STATE;\n';
                code += 'void Tick_' + graphs[j].name + '() { \n';
                if (graphs[j].localCode) {
                    code += graphs[j].localCode + '\n';
                }
                code += '   switch(' + graphs[j].prefix + '_STATE) { \n';
                for (var i = 0; i < graphs[j].nodes.length; i++) {
                    code += '      case ' + graphs[j].prefix + '_' + graphs[j].nodes[i].name + ':\n';
                    var firstEdge = true;
                    var allOneCondition = false;
                    for (var k = 0; k < graphs[j].edges.length; k++) {
                        if (graphs[j].edges[k].head == graphs[j].nodes[i]) {
                            var condition = '1';
                            if (graphs[j].edges[k].condition) {
                                condition = graphs[j].edges[k].condition;
                            }
                            else {
                                allOneCondition = true;
                            }
                            if (firstEdge) {
                                code += '         if (' + condition + ') {\n';
                                code += '            ' + graphs[j].prefix + '_STATE = ' + graphs[j].prefix + '_' + graphs[j].edges[k].tail.name + ';\n';
                                if (graphs[j].edges[k].actions) {
                                    code += '            ' + graphs[j].edges[k].actions + '\n';
                                }
                                code += '         }\n';
                                firstEdge = false;
                            }
                            else {
                                code += '         else if (' + condition + ') {\n';
                                code += '            ' + graphs[j].prefix + '_STATE = ' + graphs[j].prefix + '_' + graphs[j].edges[k].tail.name + ';\n';
                                if (graphs[j].edges[k].actions) {
                                    code += '            ' + graphs[j].edges[k].actions + '\n';
                                }
                                code += '         }\n';
                            }
                        }
                    }
                    if (!allOneCondition) {
                        code += '         else {\n';
                        code += '            ' + graphs[j].prefix + '_STATE = ' + graphs[j].prefix + '_' + graphs[j].nodes[i].name + ';\n';
                        code += '         }\n';
                    }
                    code += '         break;\n';
                }
                code += '      default:\n';
                var initNode = graphs[j].nodes[0];
                for (var i = 0; i < graphs[j].nodes.length; i++) {
                    if (graphs[j].nodes[i].initState) {
                        initNode = graphs[j].nodes[i];
                    }
                }
                code += '         ' + graphs[j].prefix + '_STATE = ' + graphs[j].prefix + '_' + initNode.name + ';\n';
                code += '         break;\n';
                code += '   }\n';
                code += '   switch(' + graphs[j].prefix + '_STATE) { \n';
                for (var i = 0; i < graphs[j].nodes.length; i++) {
                    code += '      case ' + graphs[j].prefix + '_' + graphs[j].nodes[i].name + ':\n';
                    code += '         ' + graphs[j].nodes[i].actions + '\n';
                    code += '         break;\n';
                }
                code += '   }\n';
                code += '}\n\n';
            }

            code += 'int main(){\n';
            var gcdPeriod = graphs[0].period;
            for (var j = 0; j < graphs.length; j++) {
                gcdPeriod = GCD(gcdPeriod, graphs[j].period);
                code += '   int ' + graphs[j].name + 'ElapsedTime = ' + graphs[j].period + ';\n';
            }
            code += '   int periodGCD = ' + gcdPeriod + ';\n';

            // Initialize each SM.
            graphs.forEach(graph => {
                code += `   ${graph.prefix}_STATE = ${graph.prefix}_${graph.nodes[0].name};\n`;
            });

            code += '   TimerSet(periodGCD);\n';
            code += '   TimerOn();\n';
            code += '   while(1){\n';
            for (var j = 0; j < graphs.length; j++) {
                code += '      if (' + graphs[j].name + 'ElapsedTime >= ' + graphs[j].period + '){\n';
                code += '         Tick_' + graphs[j].name + '();\n';
                code += '         ' + graphs[j].name + 'ElapsedTime = 0;\n';
                code += '      }\n';
                code += '      ' + graphs[j].name + 'ElapsedTime += ' + gcdPeriod + ';\n';
            }
            code += '      while(!TimerFlag);\n';
            code += '      TimerFlag=0;\n';
            code += '   }\n';
            code += '}\n';

            return code;

        }
        init();
    }
}

var zySMSimExport = {
    create: function() {
        return new ZySMSim();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    allowFullscreen: true,
};
module.exports = zySMSimExport;
