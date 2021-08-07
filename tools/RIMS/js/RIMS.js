function RIMS() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.progression = ((options && options.progression) ? options.progression : false);
        this.useTimer = ((options && options.useTimer) ? options.useTimer : false);
        this.isDebug = ((options && options.isDebug) ? options.isDebug : false);
        this.hideDebug = ((options && options.hideDebug) ? options.hideDebug : false);
        this.hideTimerBar = ((options && options.hideTimerBar) ? options.hideTimerBar : false);
        this.rimsServer = ((options && options.rimsServer) ? options.rimsServer : 'https://rims-server.zybooks.com:443');
        this.code = ((options && options.code) ? this.unescapeXML(options.code) : undefined);
        this.hideSimulationSpeed = ((options && options.hideSimulationSpeed) ? options.hideSimulationSpeed : false);
        this.hideTimingDiagram = ((options && options.hideTimingDiagram) ? options.hideTimingDiagram : false);
        this.useMultipleParts = options && options.useMultipleParts;

        this.Range = ace.require('ace/range').Range;
        this.utilities = require('utilities');
        this.RITS = require('RITS').create();
        this.zyIOTestVector = require('zyIOTestVector');
        this.restrictedEditor = require('restrictedEditor').create();
        this.zyIO = require('zyIO');

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['RIMS']({ id: this.id });

        if (this.progression) {
            var currentProblem;
            var numToWin = this.useTimer ? 5 : 4;
            this.progressionTool = require('progressionTool').create();
            this.tryAgain = false;
            this.removedLines = '';
            this.hideDebug = true;
            this.hideSimulationSpeed = true;
            this.hideTimingDiagram = true;
            var self = this;
            this.progressionTool.init(this.id, this.parentResource, {
                html: html,
                css: css,
                numToWin: numToWin,
                useMultipleParts: this.useMultipleParts,
                start: function() {
                    self.editor.setReadOnly(false);
                    self.utilities.enableButton(self.$compileButton);
                    self.$progressionContainer.show();
                    currentProblem = self.generateProgressionQuestion(0);
                    if (self.useTimer) {
                        self.$progressionMessage.text('Finish the code to implement the state machine.');
                    }
                    else {
                        self.$progressionMessage.text(currentProblem.explanation);
                    }
                },
                reset: function() {
                    self.editor.setReadOnly(true);
                    self.editor.setValue('');
                    self.utilities.disableButton(self.$compileButton);
                    self.$progressionContainer.hide();
                },
                next: function(currentQuestion) {
                    self.enableUI();
                    self.editor.setReadOnly(false);
                    self.utilities.enableButton(self.$compileButton);
                    if (!self.tryAgain) {
                        currentProblem = self.generateProgressionQuestion(currentQuestion);
                    }
                    if (self.useTimer) {
                        self.$progressionMessage.text('Finish the code to implement the state machine.');
                    }
                    else {
                        self.$progressionMessage.text(currentProblem.explanation);
                    }
                },
                isCorrect: function(currentQuestion) {
                    return new Ember.RSVP.Promise(function(resolve, reject) {
                        self.disableUI();
                        if (self.vm.isRunning()) {
                            self.vm.stop();
                            self.clearStep();
                            self.updateButtons();
                        }
                        self.editor.setReadOnly(true);
                        self.utilities.disableButton(self.$compileButton);
                        self.runTestVector(currentProblem).then(function(value) {
                            var explanationMessage;
                            var isCorrect;
                            var userAnswer;
                            var expectedAnswer;
                            // Add html spaces
                            self.removedLines = self.removedLines.split(' ').join('&nbsp;');
                            if (!value.passed || value.couldNotExecute) {
                                explanationMessage = value.errorMessage + self.removedLines + value.resultHTML;
                                isCorrect = false;
                            }
                            else {
                                explanationMessage = 'Correct.' + value.resultHTML;
                                isCorrect = true;
                            }
                            self.tryAgain = value.couldNotExecute;
                            userAnswer = value.resultData.outputs[0].values.join(',');
                            expectedAnswer = value.resultData.correctPattern;
                            self.editor.session.selection.clearSelection();
                            self.editor.setReadOnly(true);
                            resolve({
                                explanationMessage: explanationMessage,
                                userAnswer:         userAnswer,
                                expectedAnswer:     expectedAnswer,
                                isCorrect:          isCorrect
                            });
                        });
                    });
                }
            });
        }
        else {
            $('#' + this.id).html(css + html);
        }
        this.initRIMS();
    };

    /*
        Unescape the XML: &lt; &gt; &amp; &quot; &apos;
        |code| is required and a string.
    */
    this.unescapeXML = function(code) {
        return $('<div>').html(code).text();
    };

    this.initRIMS = function() {
        var self = this;
        this.$editor = $('#codeView_' + this.id);
        this.editor = ace.edit('codeView_' + this.id);
        this.editor.setTheme('ace/theme/dreamweaver');
        this.editor.getSession().setUseSoftTabs(true);
        this.editor.setBehavioursEnabled(false);
        this.editor.setDisplayIndentGuides(false);
        this.editor.setHighlightActiveLine(false);
        this.editor.setHighlightSelectedWord(false);
        this.editor.setShowInvisibles(false);
        this.editor.setShowPrintMargin(false);
        this.editor.setShowFoldWidgets(false);
        this.editor.getSession().setTabSize(3);
        this.editor.setOption('dragEnabled', false);
        this.editor.getSession().setMode('ace/mode/c_cpp');
        this.editor.on('guttermousedown', function(e) {
            if (self.hideDebug) {
                return;
            }
            var target = e.domEvent.target;

            // Only activate when one of the lines is clicked
            if (target.className.indexOf('ace_gutter-cell') === -1) {
                return;
            }
            if (!e.editor.isFocused()) {
                return;
            }

            // Clicked on the left
            if (e.clientX > 25 + target.getBoundingClientRect().left) {
                return;
            }
            var row = e.getDocumentPosition().row;

            // Breakspoints list has holes, have to find the active breakpoint and remove it
            var breakpoints = e.editor.session.getBreakpoints();
            for (var i = 0; i < breakpoints.length; i++) {
                if (breakpoints[i] === 'ace_breakpoint' && i === row) {
                    e.editor.session.clearBreakpoint(row);
                    e.stop();
                    if (self.vm) {
                        self.vm.createBreakpointsFromEditor(self.getBreakpoints(self.editor));
                    }
                    return;
                }
            }
            e.editor.session.setBreakpoint(row);
            e.stop();
            if (self.vm) {
                self.vm.createBreakpointsFromEditor(self.getBreakpoints(self.editor));
            }
        });
        this.editor.on('change', function(e) {
            if ((self.assembler && self.assembler.assembled) && (self.oldCode === self.editor.getValue())) {
                self.utilities.disableButton(self.$compileButton);
                self.utilities.enableButton(self.$runButton);
            }
            else {
                self.utilities.disableButton(self.$runButton);
                self.utilities.enableButton(self.$compileButton);
            }
        });

        // Cache of commonly accessed DOM elements.
        this.$codeView = $('#' + this.id + ' .code-view');
        this.$progressionMessage = $('#' + this.id + ' .progression-message');
        this.$progressionContainer = $('#' + this.id + ' .progression-container');
        this.$memory = $('#' + this.id + ' .memory-view');
        this.$registers = $('#' + this.id + ' .register-view');
        this.$compileButton = $('#' + this.id + ' .compile');
        this.$runButton = $('#' + this.id + ' .run');
        this.$stopButton = $('#' + this.id + ' .stop');
        this.$breakButton = $('#' + this.id + ' .break');
        this.$continueButton = $('#' + this.id + ' .continue');
        this.$stepButton = $('#' + this.id + ' .step');
        this.$memoryButton = $('#' + this.id + ' .memory-button');
        this.$console = $('#' + this.id + ' .console');
        this.$speedOptions = $('#' + this.id + ' .speed');
        this.$timerBar = $('#' + this.id + ' .timer-bar');
        this.$elapsedTime = $('#' + this.id + ' .elapsed-time');
        this.$generateTimingDiagramButton = $('#' + this.id + ' .generate-timing-diagram');
        this.$timingDiagram = $('#RITS-window-' + this.id);
        this.$progressionSM1 = $('#' + this.id + ' .progression-sm1');
        this.$progressionSM2 = $('#' + this.id + ' .progression-sm2');
        this.$progressionSM3 = $('#' + this.id + ' .progression-sm3');
        this.$progressionImage1 = $('#' + this.id + ' .progression-sm1-image');
        this.$progressionImage2 = $('#' + this.id + ' .progression-sm2-image');
        this.$progressionImage3 = $('#' + this.id + ' .progression-sm3-image');
        this.$progressionSM1HTML = $('#' + this.id + ' .progression-sm1 > .dynamic-html');
        this.$progressionSM2HTML = $('#' + this.id + ' .progression-sm2 > .dynamic-html');
        this.$progressionSM3HTML = $('#' + this.id + ' .progression-sm3 > .dynamic-html');
        this.$speedContainer = $('#' + this.id + ' .speed-container');


        this.$progressionImage1[0].src = this.parentResource.getResourceURL('sm1.png', this.name);
        this.$progressionImage2[0].src = this.parentResource.getResourceURL('sm2.png', this.name);
        this.$progressionImage3[0].src = this.parentResource.getResourceURL('sm3.png', this.name);

        this.$progressionSM1.hide();
        this.$progressionSM2.hide();
        this.$progressionSM3.hide();

        this.$speedOptions.change(function() {
            self.speed = $(this)[0].selectedIndex;
            if (self.vm) {
                self.vm.setSpeed(self.speed);
            }
        });
        this.Console = new Console(this.$console);

        if (!this.isDebug) {
            this.$memoryButton.hide();
            this.$memory.hide();
            this.$registers.hide();
        }

        if (this.hideDebug) {
            this.$continueButton.hide();
            this.$breakButton.hide();
            this.$stepButton.hide();
        }

        if (this.hideTimerBar) {
            this.$timerBar.hide();
        }

        if (this.hideSimulationSpeed) {
            this.$speedContainer.hide();
        }

        if (this.hideTimingDiagram) {
            this.$generateTimingDiagramButton.hide();
        }

        this.A = 0;
        this.A0 = 0;
        this.A1 = 0;
        this.A2 = 0;
        this.A3 = 0;
        this.A4 = 0;
        this.A5 = 0;
        this.A6 = 0;
        this.A7 = 0;
        this.B = 0;
        this.B0 = 0;
        this.B1 = 0;
        this.B2 = 0;
        this.B3 = 0;
        this.B4 = 0;
        this.B5 = 0;
        this.B6 = 0;
        this.B7 = 0;
        this.createUI();

        this.$memoryButton.click(function() {
            self.$memory.html(self.vm.getMemoryStateAsString());
        });

        this.$compileButton.click(function() {
            self.getAndLoadAssemblyCode(self.editor.getValue());
            if (!self.progression) {
                var event = {
                    part: 0,
                    complete: true,
                    metadata: {
                        event: 'RIMS code compiled'
                    }
                };
                self.parentResource.postEvent(event);
            }
        });

        this.$runButton.click(function() {
            self.runVM();
            self.updateButtons();
        });

        this.$stopButton.click(function() {
            if (self.vm.isRunning()) {
                self.vm.stop();
                self.clearStep();
                self.updateButtons();
            }
        });

        this.$continueButton.click(function() {
            if (self.vm.isBroken()) {
                self.vm.resume();
                self.updateButtons();
            }
        });

        this.$breakButton.click(function() {
            if (self.vm.isRunning()) {
                self.vm.breakVM();
                self.vm.takeStep();
                self.updateButtons();
            }
        });

        this.$stepButton.click(function() {
            if (self.vm.isBroken()) {
                self.vm.takeStep();
                self.updateButtons();
            }
        });

        this.$generateTimingDiagramButton.click(function() {
            self.generateTimingDiagram();
        });

        this.utilities.disableButton(this.$generateTimingDiagramButton);
        this.utilities.disableButton(this.$stopButton);
        this.utilities.disableButton(this.$breakButton);
        this.utilities.disableButton(this.$continueButton);
        this.utilities.disableButton(this.$stepButton);
        this.utilities.disableButton(this.$runButton);

        this.speed = VM_SPEED_OPTIONS.NORMAL;
        this.$speedOptions[0].selectedIndex = this.speed;
        this.compiled = false;

        if (this.code !== undefined) {
            this.editor.insert(this.code);
        }
        else if (!this.progression && this.useTimer) {
            this.editor.insert('#include \"RIMS.h\"\nvolatile int TimerFlag = 0;\nvoid TimerISR() {\n   TimerFlag = 1;  \n}\nint main() {\n   unsigned char x = 0;\n   TimerSet(1000);\n   TimerOn();\n   while(1) {\n      B0 = x;\n      x = !x;\n      while(!TimerFlag);\n      TimerFlag = 0;\n   }\n   return 0;\n}');
        }
        else if (!this.progression) {
            this.editor.insert('#include \"RIMS.h\"\nint main() {\n   while(1) {\n      B0 = A0 && A1;\n   }\n   return 0;\n}');
        }

        if (this.progression) {
            this.editor.setReadOnly(true);
            this.utilities.disableButton(self.$compileButton);
        }
        this.$progressionContainer.hide();

        this.restrictedEditor.init(this.editor, function() {

        });

        this.restrictedEditor.initializeNonEditableAreas('#include \"RIMS.h\"\n', '', this.editor.getValue().replace('#include \"RIMS.h\"\n', ''));
        var undoManager = this.editor.session.getUndoManager();
        undoManager.reset();
        this.editor.session.setUndoManager(undoManager);
        this.editor.gotoLine(0);
        this.vm = new VirtualMachine();
        TimerBar.BAR_COLOR = this.utilities.zyanteGreen;
        this.timerBar = new TimerBar(this.$timerBar);
        this.timerBar.draw();
    };

    // Disables ui when testing user code
    this.disableUI = function() {
        this.utilities.disableButton(this.$speedOptions);
        var self = this;
        this.input.bitInputs.forEach(function(value) {
            self.utilities.disableButton(value.$checkBox);
        });
    };

    // Enables ui after user code is tested
    this.enableUI = function() {
        this.utilities.enableButton(this.$speedOptions);
        var self = this;
        this.input.bitInputs.forEach(function(value) {
            self.utilities.enableButton(value.$checkBox);
        });
    };

    // Creates and shows the timing diagram using the RITS tool
    this.generateTimingDiagram = function() {
        var self = this;
        this.RITS.init('RITS-window-' + this.id, {
            vcdFile: this.vm.signalLogger.getVCDString(),
            neededSignals: this.vm.signalLogger.neededSignals
        }, function() {
            self.enableUI();
            self.updateButtons();
        });
        this.disableUI();
        this.utilities.disableButton(this.$generateTimingDiagramButton);
        this.utilities.disableButton(this.$stopButton);
        this.utilities.disableButton(this.$breakButton);
        this.utilities.disableButton(this.$continueButton);
        this.utilities.disableButton(this.$stepButton);
        this.utilities.disableButton(this.$runButton);
        this.utilities.disableButton(this.$compileButton);
        this.$timingDiagram.show();
    };

    /*
        Gets the assembly code from the server and then loads into the VM.
        |cCode| is required and a string
        |codeLoaded| is optional and a function - callback called after code has been loaded
    */
    this.getAndLoadAssemblyCode = function(cCode, codeLoaded) {
        this.codeLoadedSuccessfully = false;
        if ((this.oldCode !== undefined) && (cCode === this.oldCode) && (this.assembler) && (this.assembler.assembled === true) && this.compiled) {
            if (this.vm && this.vm.failed()) {
                if (!this.loadCode(this.assemblyCode)) {
                    if (codeLoaded) {
                        codeLoaded();
                    }
                }
                else {
                    this.updateButtons();
                    this.codeLoadedSuccessfully = true;
                    if (codeLoaded) {
                        codeLoaded();
                    }
                }
            }
            else {
                this.updateButtons();
                this.codeLoadedSuccessfully = true;
                if (codeLoaded) {
                    codeLoaded();
                }
            }
        }
        else {
            var includeTestedCode = cCode;
            includeTestedCode = includeTestedCode.replace('#include "RIMS.h"', '');
            if (includeTestedCode.indexOf('#include') !== -1) {
                this.Console.clear();
                this.Console.error('Only file that can be included is RIMS.h');
                this.utilities.enableButton(this.$compileButton);
                if (codeLoaded) {
                    codeLoaded();
                }
            }
            else {
                var self = this;
                $.ajax({
                    type:         'POST',
                    url:          this.rimsServer + '/compile_code',
                    data :        JSON.stringify({
                        input: cCode
                    }),
                    contentType:  'application/json',
                    dataType:     'json',
                    success: function(data, status, xml) {
                        self.oldCode = cCode;
                        self.editor.setReadOnly(false);
                        if (data['is_error']) {
                            self.compiled = false;
                            self.Console.out('done.\n');
                            self.Console.error(data['error_message']);
                            self.codeLoadedSuccessfully = false;
                            self.utilities.enableButton(self.$compileButton);
                        }
                        else {
                            self.compiled = true;
                            self.Console.out('done.\n');
                            self.assemblyCode = data['output'].split('\n');
                            if (!self.loadCode(self.assemblyCode)) {
                                self.utilities.enableButton(self.$compileButton);
                                self.codeLoadedSuccessfully = false;
                            }
                            else {
                                self.codeLoadedSuccessfully = true;
                            }
                            self.updateButtons();
                        }

                        if (codeLoaded) {
                            codeLoaded();
                        }
                    },
                    error: function(xml, status, error) {
                        self.Console.out('failed.\n');
                        self.Console.error('Failed to communicate with server, try again.\n');
                        self.editor.setReadOnly(false);
                        self.utilities.enableButton(self.$compileButton);
                        if (codeLoaded) {
                            codeLoaded();
                        }
                        self.codeLoadedSuccessfully = false;
                    }
                });
                self.Console.clear();
                self.Console.out('Compiling...');
                self.utilities.disableButton(self.$compileButton);
                self.editor.setReadOnly(true);

            }
        }
    };

    // Updates the buttons depending on the state of the vm.
    this.updateButtons = function() {
        if (this.vm && this.assembler) {
            if (this.vm.isRunning()) {
                this.utilities.enableButton(this.$stopButton);
                this.utilities.disableButton(this.$runButton);
                this.utilities.disableButton(this.$compileButton);
                this.editor.setReadOnly(true);

                if (this.vm.isBroken()) {
                    this.utilities.disableButton(this.$breakButton);
                    this.utilities.enableButton(this.$continueButton);
                    this.utilities.enableButton(this.$stepButton);
                }
                else {
                    this.utilities.enableButton(this.$breakButton);
                    this.utilities.disableButton(this.$continueButton);
                    this.utilities.disableButton(this.$stepButton);
                }
            }
            else {
                this.utilities.disableButton(this.$stopButton);
                this.utilities.disableButton(this.$breakButton);
                this.utilities.disableButton(this.$continueButton);
                this.utilities.disableButton(this.$stepButton);
                this.editor.setReadOnly(false);
                $('#' + this.id + ' .ace_cursor').show();
                this.editor.setHighlightGutterLine(true);

                if (this.assembler.assembled) {
                    this.utilities.enableButton(this.$runButton);
                }
                else {
                    this.utilities.disableButton(this.$runButton);
                    this.utilities.enableButton(this.$compileButton);
                }
            }

            if (this.vm.notCurrentlyExecuting()) {
                this.utilities.enableButton(this.$generateTimingDiagramButton);
            }
            else {
                this.utilities.disableButton(this.$generateTimingDiagramButton);
            }
        }
    };

    // Highlights the |lineNumber| - integer - in the ace editor, used to show where the VM is currently at in the code.
    this.highlightStep = function(lineNumber) {
        if (lineNumber !== this.oldLineNumber) {
            this.editor.session.removeMarker(this.stepID);
            this.stepID = this.editor.session.addMarker(new this.Range(lineNumber - 1, 0, lineNumber - 1, 144), 'step-line', 'fullLine');
            // var position = this.editor.getCursorPosition();
            this.editor.gotoLine(lineNumber - 1);
            // this.editor.moveCursorToPosition(position);
            this.oldLineNumber = lineNumber;
        }
    };

    // Clears the currently highlighted line
    this.clearStep = function() {
        this.oldLineNumber = undefined;
        this.editor.session.removeMarker(this.stepID);
    };

    // Synchronizing the UI B values with the B values from the vm
    this.syncB = function() {
        this.B = this.vm.getPin(PINS.B);
        this.B0 = this.B & 0x01;
        this.B1 = (this.B >> 1) & 0x01;
        this.B2 = (this.B >> 2) & 0x01;
        this.B3 = (this.B >> 3) & 0x01;
        this.B4 = (this.B >> 4) & 0x01;
        this.B5 = (this.B >> 5) & 0x01;
        this.B6 = (this.B >> 6) & 0x01;
        this.B7 = (this.B >> 7) & 0x01;
        this.outputUpdated();
        for (var i = 0; i < this.output.bitOutputs.length; i++) {
            this.output.bitOutputs[i].outsideUpdate();
        }
    };

    // Assembles the code and prepares the vm for execution, |code| - list of strings - the assembly code, returns a boolean that is true if the code assembled correctly
    this.loadCode = function(code) {
        this.vm = new VirtualMachine();
        this.vm.setConsole(this.Console);
        this.vm.setSpeed(this.speed);
        this.vm.setRunMode(VM_RUN_MODE.c);
        this.assembler = new Assembler(code, this.vm, this.Console);
        if (this.assembler.assemble()) {
            this.vm.importSymbolTable(this.assembler.getSymbolTable());
            var self = this;
            this.vm.setSyncCallback(function() {
                if (!self.vm.isRunning()) {
                    self.vm.stop();
                    self.clearStep();
                    self.updateButtons();
                }
                else {
                    if (self.speed === VM_SPEED_OPTIONS.SLOWEST) {
                        if ((self.vm.runMode === VM_RUN_MODE.asm) && (self.vm.currentInstruction().instructionInfo.filename.indexOf('RIMS') === -1)) {
                            self.highlightStep(self.vm.currentInstruction().instructionInfo.assemblyLine);
                        }
                        else if ((self.vm.runMode === VM_RUN_MODE.c) && (self.vm.currentInstruction().instructionInfo.filename.indexOf('RIMS') === -1)) {
                            self.highlightStep(self.vm.currentInstruction().instructionInfo.line);
                        }
                    }
                    else if (self.vm.isBroken() && (self.vm.currentInstruction().instructionInfo.filename.indexOf('RIMS') === -1)) {
                        self.highlightStep(self.vm.currentInstruction().instructionInfo.line);
                    }
                    else if (self.vm.currentInstruction().instructionInfo.filename.indexOf('RIMS') === -1) {
                        self.clearStep();
                    }
                    self.updateButtons();
                    self.syncB();
                    if (self.vm.isRunning()) {
                        $('#' + self.id + ' .ace_cursor').hide();
                        self.editor.setHighlightGutterLine(false);
                    }
                    else {
                        $('#' + self.id + ' .ace_cursor').show();
                        self.editor.setHighlightGutterLine(true);
                    }
                    var timerInfo = self.vm.getTimerInfo();
                    self.$elapsedTime.text((timerInfo.currentElapsed / 1000.0).toFixed(3) + ' s');
                    self.timerBar.update(self.vm.getTimerInfo());
                    self.timerBar.draw();
                }
            });
            return true;
        }
        else {
            return false;
        }
    };

    // Gets all of the breakpoints from the ace |editor| in a more usable format.
    this.getBreakpoints = function(editor) {
        var breakpoints = [];
        var aceBreakpoints = editor.session.getBreakpoints();
        for (var i = 0; i < aceBreakpoints.length; i++) {
            if (aceBreakpoints[i] === 'ace_breakpoint') {
                breakpoints.push(i + 1);
            }
        }
        return breakpoints;
    };

    // Generates the RIMS ui components
    this.createUI = function() {
        var self = this;
        this.input = this.zyIO.create();
        this.input.init('inputContainer_' + this.id, {
            isInput: true,
            inputs: [ {
                name: 'A0',
                value: 0,
                syncUserVariable: function(value) {
                        self.A0 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A0, value);
                    },
                outsideUpdate: function() {
                        return self.A0;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A1',
                value: 0,
                syncUserVariable: function(value) {
                        self.A1 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A1, value);
                    },
                outsideUpdate: function() {
                        return self.A1;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A2',
                value: 0,
                syncUserVariable: function(value) {
                        self.A2 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A2, value);
                    },
                outsideUpdate: function() {
                        return self.A2;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A3',
                value: 0,
                syncUserVariable: function(value) {
                        self.A3 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A3, value);
                    },
                outsideUpdate: function() {
                        return self.A3;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A4',
                value: 0,
                syncUserVariable: function(value) {
                        self.A4 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A4, value);
                    },
                outsideUpdate: function() {
                        return self.A4;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A5',
                value: 0,
                syncUserVariable: function(value) {
                        self.A5 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A5, value);
                    },
                outsideUpdate: function() {
                        return self.A5;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A6',
                value: 0,
                syncUserVariable: function(value) {
                        self.A6 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A6, value);
                    },
                outsideUpdate: function() {
                        return self.A6;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'A7',
                value: 0,
                syncUserVariable: function(value) {
                        self.A7 = value;
                        self.inputUpdated();
                        self.vm.setPin(PINS.A7, value);
                    },
                outsideUpdate: function() {
                        return self.A7;
                    },
                type: this.input.ioType.BIT
            }
            ],
            input: 'A'
        });
        this.output = this.zyIO.create();
        this.output.init('outputContainer_' + this.id, {
            isInput: false,
            outputs: [ {
                name: 'B0',
                value: 0,
                syncUserVariable: function(value) {
                        self.B0 = value;
                    },
                outsideUpdate: function() {
                        return self.B0;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B1',
                value: 0,
                syncUserVariable: function(value) {
                        self.B1 = value;
                    },
                outsideUpdate: function() {
                        return self.B1;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B2',
                value: 0,
                syncUserVariable: function(value) {
                        self.B2 = value;
                    },
                outsideUpdate: function() {
                        return self.B2;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B3',
                value: 0,
                syncUserVariable: function(value) {
                        self.B3 = value;
                    },
                outsideUpdate: function() {
                        return self.B3;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B4',
                value: 0,
                syncUserVariable: function(value) {
                        self.B4 = value;
                    },
                outsideUpdate: function() {
                        return self.B4;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B5',
                value: 0,
                syncUserVariable: function(value) {
                        self.B5 = value;
                    },
                outsideUpdate: function() {
                        return self.B5;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B6',
                value: 0,
                syncUserVariable: function(value) {
                        self.B6 = value;
                    },
                outsideUpdate: function() {
                        return self.B6;
                    },
                type: this.input.ioType.BIT
            },
            {
                name: 'B7',
                value: 0,
                syncUserVariable: function(value) {
                        self.B7 = value;
                    },
                outsideUpdate: function() {
                        return self.B7;
                    },
                type: this.input.ioType.BIT
            }
            ],
            output: 'B'
        });
    };

    // Gets the hex representation of the |value| - integer
    this.generateHexString = function(value) {
        var hexString = value.toString(16);
        if (hexString.length < 2) {
            hexString = '0' + hexString;
        }
        return hexString;
    };

    // Gets the binary representation of the |value| - integer
    this.generateBinaryString = function(value) {
        var binarystring = value.toString(2);
        while (binarystring.length < 8) {
            binarystring = '0' + binarystring;
        }
        return binarystring;
    };

    /*
        Returns an object containing the components needed by the restrictedEditor
        |code| - string - the complete code template
        |startLine| - integer - line where user entry begins
        |endLine| - intger - line where user entry ends
    */
    this.generateTemplate = function(code, startLine, endLine) {
        this.editor.setValue(code);
        var range = new this.Range(startLine, 0, endLine, 144);
        var removedLines = this.editor.session.getLines(startLine, endLine).join('<br>');
        removedLines = '<br>' + removedLines;
        this.editor.session.replace(range, '');
        var prefixLines = this.editor.session.getLines(0, startLine - 1);
        var suffixLines = this.editor.session.getLines(startLine, this.editor.session.getLength());
        return { prefix: prefixLines.join('\n') + '\n', suffix: suffixLines.join('\n'), placeholder: '\n         /* Your solution goes here */\n', removedLines: removedLines };
    };

    // Generates the |problem| - object defined in zyIOTestVector for the |currentQuestion| - integer
    this.generateProgressionQuestion = function(currentQuestion) {
        var problem = {};
        this.prefix = '';
        this.suffix = '';
        this.placeholder = '';
        var TEMPLATE_CODE;
        if (!this.useTimer) {
            this.prefix = '#include "RIMS.h"\n\nint main() {\n   while(1) {\n      ';
            this.suffix = '\n   }\n   return 0;\n}';
            this.placeholder = '\n      /* Your solution goes here */\n';
            TEMPLATE_CODE = this.prefix + this.placeholder + this.suffix;
            this.executionPrefix = '#include "RIMS.h"\n\nint main() {\n   ';
            this.executionSuffix = '\n   return 0;\n}';
            this.editor.setValue(TEMPLATE_CODE, 1);
            this.editor.gotoLine(5);
            this.restrictedEditor.initializeNonEditableAreas(this.prefix, this.suffix, this.placeholder);
            switch (currentQuestion) {
                case 0:
                    var bBit = this.utilities.pickNumberInRange(0, 7);
                    var aBitOne = this.utilities.pickNumberInRange(0, 7);
                    var aBitTwo = this.utilities.pickNumberInRange(0, 7, [ aBitOne ]);
                    var choseAnd = this.utilities.pickNumberInRange(0, 1);
                    var trueBinary = '0b';
                    for (var i = 7; i >= 0; i--) {
                        if (i === bBit) {
                            trueBinary += '1';
                        }
                        else {
                            trueBinary += '0';
                        }
                    }
                    problem.inputStrings = {};
                    problem.outputStrings = {};
                    problem.inputStrings['A' + aBitOne] = true;
                    problem.inputStrings['A' + aBitTwo] = true;
                    problem.outputStrings['B' + bBit] = true;
                    problem.hasVvalues = false;
                    if (choseAnd) {
                        problem.correctPattern = '0 0 0 1';
                        problem.commands = [
                            '0x00',
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitOne),
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitTwo),
                            'assert 0b00000000',
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitTwo)),
                            'assert ' + trueBinary
                        ];
                        problem.explanation = 'Set B' + bBit + ' to 1 if both A' + aBitOne + ' and A' + aBitTwo + ' are 1';
                    }
                    else {
                        problem.correctPattern = '0 1 1 1';
                        problem.commands = [
                            '0x00',
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitOne),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString(1 << aBitTwo),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitTwo)),
                            'assert ' + trueBinary
                        ];
                        problem.explanation = 'Set B' + bBit + ' to 1 if A' + aBitOne + ' or A' + aBitTwo + ' are 1';
                    }
                    break;
                case 1:
                    var bBit = this.utilities.pickNumberInRange(0, 7);
                    var aBitOne = this.utilities.pickNumberInRange(0, 7);
                    var aBitTwo = this.utilities.pickNumberInRange(0, 7, [ aBitOne ]);
                    var aBitThree = this.utilities.pickNumberInRange(0, 7, [ aBitOne, aBitTwo ]);
                    var choseAnd = this.utilities.pickNumberInRange(0, 1);
                    var trueBinary = '0b';
                    for (var i = 7; i >= 0; i--) {
                        if (i === bBit) {
                            trueBinary += '1';
                        }
                        else {
                            trueBinary += '0';
                        }
                    }
                    problem.inputStrings = {};
                    problem.outputStrings = {};
                    problem.inputStrings['A' + aBitOne] = true;
                    problem.inputStrings['A' + aBitTwo] = true;
                    problem.inputStrings['A' + aBitThree] = true;
                    problem.outputStrings['B' + bBit] = true;
                    problem.hasVvalues = false;
                    if (choseAnd) {
                        problem.correctPattern = '0 0 0 1 1 1 1 1';
                        problem.commands = [
                            '0x00',
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitOne),
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitTwo),
                            'assert 0b00000000',
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitTwo)),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString(1 << aBitThree),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitThree)),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString((1 << aBitTwo) | (1 << aBitThree)),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitTwo) | (1 << aBitThree)),
                            'assert ' + trueBinary
                        ];
                        problem.explanation = 'Set B' + bBit + ' to 1 if both A' + aBitOne + ' and A' + aBitTwo + ' are 1. Or set B' + bBit + ' to 1 if A' + aBitThree + ' is 1';
                    }
                    else {
                        problem.correctPattern = '0 0 0 0 0 1 1 1';
                        problem.commands = [
                            '0x00',
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitOne),
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitTwo),
                            'assert 0b00000000',
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitTwo)),
                            'assert 0b00000000',
                            '0x' + this.generateHexString(1 << aBitThree),
                            'assert 0b00000000',
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitThree)),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString((1 << aBitTwo) | (1 << aBitThree)),
                            'assert ' + trueBinary,
                            '0x' + this.generateHexString((1 << aBitOne) | (1 << aBitTwo) | (1 << aBitThree)),
                            'assert ' + trueBinary
                        ];
                        problem.explanation = 'Set B' + bBit + ' to 1 if A' + aBitOne + ' or A' + aBitTwo + ' are 1, and A' + aBitThree + ' is 1';
                    }
                    break;
                case 2:
                    var bitString = '' + this.utilities.pickNumberInRange(0, 1) + this.utilities.pickNumberInRange(0, 1) + this.utilities.pickNumberInRange(0, 1) + this.utilities.pickNumberInRange(0, 1);
                    var upperNibble = this.utilities.pickNumberInRange(0, 1);
                    problem.outputStrings = { 'B': true };
                    problem.hasVvalues = false;
                    var randomValuesToTest = [
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                    ];
                    if (upperNibble) {
                        problem.inputStrings = { 'A7': true, 'A6': true, 'A5': true, 'A4': true };
                        problem.correctPattern = '';
                        problem.commands = [];
                        var self = this;
                        randomValuesToTest.forEach(function(value, index) {
                            if (index < (randomValuesToTest.length - 1)) {
                                problem.correctPattern += parseInt(self.generateBinaryString(value << 4).substr(0, 4) + bitString, 2) + ' ';
                            }
                            else {
                                problem.correctPattern += parseInt(self.generateBinaryString(value << 4).substr(0, 4) + bitString, 2);
                            }
                            problem.commands.push('0x' + self.generateHexString(value << 4));
                            problem.commands.push('assert 0b' + self.generateBinaryString(value << 4).substr(0, 4) + bitString);
                        });
                        problem.explanation = 'Set B\'s upper nibble to A\'s upper nibble, and B\'s lower nibble to ' + parseInt(bitString, 2);
                    }
                    else {
                        problem.inputStrings = { 'A3': true, 'A2': true, 'A1': true, 'A0': true };
                        problem.correctPattern = '';
                        problem.commands = [];
                        var self = this;
                        randomValuesToTest.forEach(function(value, index) {
                            if (index < (randomValuesToTest.length - 1)) {
                                problem.correctPattern += parseInt(bitString + self.generateBinaryString(value).substr(4), 2) + ' ';
                            }
                            else {
                                problem.correctPattern += parseInt(bitString + self.generateBinaryString(value).substr(4), 2);
                            }
                            problem.commands.push('0x' + self.generateHexString(value));
                            problem.commands.push('assert 0b' + bitString + self.generateBinaryString(value).substr(4));
                        });
                        problem.explanation = 'Set B\'s lower nibble to A\'s lower nibble, and B\'s upper nibble to ' + parseInt(bitString, 2);
                    }
                    break;
                case 3:
                    var bitString = '' + this.utilities.pickNumberInRange(0, 1) + this.utilities.pickNumberInRange(0, 1) + this.utilities.pickNumberInRange(0, 1) + this.utilities.pickNumberInRange(0, 1);
                    var upperNibble = this.utilities.pickNumberInRange(0, 1);
                    problem.outputStrings = { 'B': true };
                    problem.hasVvalues = false;
                    var randomValuesToTest = [
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                    ];
                    if (upperNibble) {
                        problem.inputStrings = { 'A3': true, 'A2': true, 'A1': true, 'A0': true };
                        problem.correctPattern = '';
                        problem.commands = [];
                        var self = this;
                        randomValuesToTest.forEach(function(value, index) {
                            if (index < (randomValuesToTest.length - 1)) {
                                problem.correctPattern += parseInt(self.generateBinaryString(value << 4).substr(0, 4) + bitString, 2) + ' ';
                            }
                            else {
                                problem.correctPattern += parseInt(self.generateBinaryString(value << 4).substr(0, 4) + bitString, 2);
                            }
                            problem.commands.push('0x' + self.generateHexString(value));
                            problem.commands.push('assert 0b' + self.generateBinaryString(value << 4).substr(0, 4) + bitString);
                        });
                        problem.explanation = 'Set B\'s upper nibble to A\'s lower nibble, and B\'s lower nibble to ' + parseInt(bitString, 2);
                    }
                    else {
                        problem.inputStrings = { 'A7': true, 'A6': true, 'A5': true, 'A4': true };
                        problem.correctPattern = '';
                        problem.commands = [];
                        var self = this;
                        randomValuesToTest.forEach(function(value, index) {
                            if (index < (randomValuesToTest.length - 1)) {
                                problem.correctPattern += parseInt(bitString + self.generateBinaryString(value).substr(4), 2) + ' ';
                            }
                            else {
                                problem.correctPattern += parseInt(bitString + self.generateBinaryString(value).substr(4), 2);
                            }
                            problem.commands.push('0x' + self.generateHexString(value << 4));
                            problem.commands.push('assert 0b' + bitString + self.generateBinaryString(value).substr(4));
                        });
                        problem.explanation = 'Set B\'s lower nibble to A\'s upper nibble, and B\'s upper nibble to ' + parseInt(bitString, 2);
                    }
                    break;
            }
        }
        else if (this.useTimer) {
            problem.inputStrings = {};
            problem.outputStrings = {};
            problem.hasVvalues = false;
            switch (currentQuestion) {
                case 0:
                    var inputBit = this.utilities.pickNumberInRange(0, 7);
                    var outputBit = this.utilities.pickNumberInRange(0, 7);
                    var codeTemplate = this[this.name]['timerProblemSM1']({
                        inputBit: inputBit,
                        outputBit: outputBit
                    });
                    this.$progressionSM1HTML.html(this[this.name]['timerProblemSM1HTML']({
                        inputBit: inputBit,
                        outputBit: outputBit
                    }));
                    this.$progressionSM1.show();
                    this.$progressionSM2.hide();
                    this.$progressionSM3.hide();
                    var template = this.generateTemplate(codeTemplate, 8, 53);
                    this.executionPrefix = template.prefix;
                    this.executionSuffix = template.suffix;
                    var randomLineStart;
                    var randomLineEnd;
                    switch(this.utilities.pickNumberInRange(0, 2)) {
                        case 0:
                            randomLineStart = 10;
                            randomLineEnd = 13;
                            break;
                        case 1:
                            randomLineStart = 16;
                            randomLineEnd = 18;
                            break;
                        case 2:
                            randomLineStart = 27;
                            randomLineEnd = 29;
                            break;
                    }
                    template = this.generateTemplate(codeTemplate, randomLineStart, randomLineEnd);
                    this.removedLines = template.removedLines;
                    this.prefix = template.prefix;
                    this.placeholder = template.placeholder;
                    this.suffix = template.suffix;
                    TEMPLATE_CODE = this.prefix + this.placeholder + this.suffix;
                    this.editor.setValue(TEMPLATE_CODE, 1);
                    this.restrictedEditor.initializeNonEditableAreas(this.prefix, this.suffix, this.placeholder);
                    this.editor.resize(true);
                    this.editor.scrollToLine(randomLineStart, true, true, function() {});
                    problem.correctPattern = '0 1 1 0 0 1';
                    problem.commands = [
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBit),
                        'assert 0b' + this.generateBinaryString(1 << outputBit),
                        '0x' + this.generateHexString(1 << inputBit),
                        'assert 0b' + this.generateBinaryString(1 << outputBit),
                        '0x00',
                        'assert 0b00000000',
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBit),
                        'assert 0b' + this.generateBinaryString(1 << outputBit)
                    ];
                    problem.inputStrings['A' + inputBit] = true;
                    problem.outputStrings['B' + outputBit] = true;
                    problem.explanation = 'B' + outputBit + ' is 1 when A' + inputBit + ' is 1, B' + outputBit + ' is 0 when A' + inputBit + ' is 0.';
                    break;
                case 1:
                    var inputBit = this.utilities.pickNumberInRange(0, 7);
                    var outputBit = this.utilities.pickNumberInRange(0, 7);
                    var codeTemplate = this[this.name]['timerProblemSM1']({
                        inputBit: inputBit,
                        outputBit: outputBit
                    });
                    this.$progressionSM1HTML.html(this[this.name]['timerProblemSM1HTML']({
                        inputBit: inputBit,
                        outputBit: outputBit
                    }));
                    this.$progressionSM1.show();
                    this.$progressionSM2.hide();
                    this.$progressionSM3.hide();
                    var template = this.generateTemplate(codeTemplate, 8, 53);
                    this.executionPrefix = template.prefix;
                    this.executionSuffix = template.suffix;
                    var randomLineStart;
                    var randomLineEnd;
                    switch(this.utilities.pickNumberInRange(0, 1)) {
                        case 0:
                            randomLineStart = 16;
                            randomLineEnd = 24;
                            break;
                        case 1:
                            randomLineStart = 27;
                            randomLineEnd = 35;
                            break;
                    }
                    template = this.generateTemplate(codeTemplate, randomLineStart, randomLineEnd);
                    this.removedLines = template.removedLines;
                    this.prefix = template.prefix;
                    this.placeholder = template.placeholder;
                    this.suffix = template.suffix;
                    TEMPLATE_CODE = this.prefix + this.placeholder + this.suffix;
                    this.editor.setValue(TEMPLATE_CODE, 1);
                    this.restrictedEditor.initializeNonEditableAreas(this.prefix, this.suffix, this.placeholder);
                    this.editor.resize(true);
                    this.editor.scrollToLine(randomLineStart, true, true, function() {});
                    problem.correctPattern = '0 1 1 0 0 1';
                    problem.commands = [
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBit),
                        'assert 0b' + this.generateBinaryString(1 << outputBit),
                        '0x' + this.generateHexString(1 << inputBit),
                        'assert 0b' + this.generateBinaryString(1 << outputBit),
                        '0x00',
                        'assert 0b00000000',
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBit),
                        'assert 0b' + this.generateBinaryString(1 << outputBit)
                    ];
                    problem.inputStrings['A' + inputBit] = true;
                    problem.outputStrings['B' + outputBit] = true;
                    problem.explanation = 'B' + outputBit + ' is 1 when A' + inputBit + ' is 1, B' + outputBit + ' is 0 when A' + inputBit + ' is 0.';
                    break;
                case 2:
                    var inputBitOne = this.utilities.pickNumberInRange(0, 3);
                    var inputBitTwo = this.utilities.pickNumberInRange(4, 7);
                    var outputBitOne = this.utilities.pickNumberInRange(0, 3);
                    var outputBitTwo = this.utilities.pickNumberInRange(4, 7);
                    var codeTemplate = this[this.name]['timerProblemSM2']({
                        inputBitOne: inputBitOne,
                        inputBitTwo: inputBitTwo,
                        outputBitOne: outputBitOne,
                        outputBitTwo: outputBitTwo
                    });
                    this.$progressionSM2HTML.html(this[this.name]['timerProblemSM2HTML']({
                        inputBitOne: inputBitOne,
                        inputBitTwo: inputBitTwo,
                        outputBitOne: outputBitOne,
                        outputBitTwo: outputBitTwo
                    }));
                    this.$progressionSM1.hide();
                    this.$progressionSM2.show();
                    this.$progressionSM3.hide();
                    var template = this.generateTemplate(codeTemplate, 8, 69);
                    this.executionPrefix = template.prefix;
                    this.executionSuffix = template.suffix;
                    var randomLineStart = 15;
                    var randomLineEnd = 26;
                    template = this.generateTemplate(codeTemplate, randomLineStart, randomLineEnd);
                    this.removedLines = template.removedLines;
                    this.prefix = template.prefix;
                    this.placeholder = template.placeholder;
                    this.suffix = template.suffix;
                    TEMPLATE_CODE = this.prefix + this.placeholder + this.suffix;
                    this.editor.setValue(TEMPLATE_CODE, 1);
                    this.restrictedEditor.initializeNonEditableAreas(this.prefix, this.suffix, this.placeholder);
                    this.editor.resize(true);
                    this.editor.scrollToLine(randomLineStart, true, true, function() {});
                    problem.correctPattern = '00 01 00 10 00 00 00 01';
                    problem.commands = [
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBitOne),
                        'assert 0b' + this.generateBinaryString(1 << outputBitOne),
                        '0x' + this.generateHexString(1 << inputBitTwo),
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBitTwo),
                        'assert 0b' + this.generateBinaryString(1 << outputBitTwo),
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString((1 << inputBitOne) | (1 << inputBitTwo)),
                        'assert 0b00000000',
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBitOne),
                        'assert 0b' + this.generateBinaryString(1 << outputBitOne)
                    ];
                    problem.inputStrings['A' + inputBitOne] = true;
                    problem.inputStrings['A' + inputBitTwo] = true;
                    problem.outputStrings['B' + outputBitOne] = true;
                    problem.outputStrings['B' + outputBitTwo] = true;
                    problem.explanation = 'B' + outputBitOne + ' is 1 when A' + inputBitOne + ' is 1, B' + outputBitTwo + ' is 1 when A' + inputBitTwo + ' is 1. B is 0 when both inputs are 1 or when both inputs are 0.';
                    break;
                case 3:
                    var self = this;
                    var inputBit = this.utilities.pickNumberInRange(0, 3);
                    var codeTemplate = this[this.name]['timerProblemSM3']({
                        inputBit: inputBit
                    });
                    this.$progressionSM3HTML.html(this[this.name]['timerProblemSM3HTML']({
                        inputBit: inputBit
                    }));
                    this.$progressionSM1.hide();
                    this.$progressionSM2.hide();
                    this.$progressionSM3.show();
                    var template = this.generateTemplate(codeTemplate, 8, 53);
                    this.executionPrefix = template.prefix;
                    this.executionSuffix = template.suffix;
                    var randomLineStart = 49;
                    var randomLineEnd = 49;
                    template = this.generateTemplate(codeTemplate, randomLineStart, randomLineEnd);
                    this.removedLines = template.removedLines;
                    this.prefix = template.prefix;
                    this.placeholder = template.placeholder;
                    this.suffix = template.suffix;
                    TEMPLATE_CODE = this.prefix + this.placeholder + this.suffix;
                    this.editor.setValue(TEMPLATE_CODE, 1);
                    this.restrictedEditor.initializeNonEditableAreas(this.prefix, this.suffix, this.placeholder);
                    this.editor.resize(true);
                    this.editor.scrollToLine(randomLineStart, true, true, function() {});
                    problem.correctPattern = '';
                    problem.commands = [];
                    var randomValuesToTest = [
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                        this.utilities.pickNumberInRange(0, 15),
                    ];
                    problem.commands.push('0x00');
                    problem.commands.push('assert 0b00000000');
                    problem.correctPattern += 0 + ' ';
                    randomValuesToTest.forEach(function(value, index) {
                        problem.correctPattern += value + ' ';
                        problem.commands.push('0x' + self.generateHexString((1 << inputBit) | (value << 4)));
                        problem.commands.push('assert 0b' + self.generateBinaryString(value));
                        problem.commands.push('0x00');
                        problem.commands.push('assert 0b00000000');
                        if (index < (randomValuesToTest.length - 1)) {
                            problem.correctPattern += '0 ';
                        }
                        else {
                            problem.correctPattern += '0';
                        }
                    });
                    problem.inputStrings['A' + inputBit] = true;
                    problem.inputStrings['A4'] = true;
                    problem.inputStrings['A5'] = true;
                    problem.inputStrings['A6'] = true;
                    problem.inputStrings['A7'] = true;
                    problem.outputStrings['B'] = true;
                    problem.explanation = 'Set B\'s lower nibble to the upper nibble of A when A' + inputBit + ' is 1. B is 0 otherwise';
                    break;
                case 4:
                    var inputBitOne = this.utilities.pickNumberInRange(0, 3);
                    var inputBitTwo = this.utilities.pickNumberInRange(4, 7);
                    var outputBitOne = this.utilities.pickNumberInRange(0, 3);
                    var outputBitTwo = this.utilities.pickNumberInRange(4, 7);
                    var codeTemplate = this[this.name]['timerProblemSM2']({
                        inputBitOne: inputBitOne,
                        inputBitTwo: inputBitTwo,
                        outputBitOne: outputBitOne,
                        outputBitTwo: outputBitTwo
                    });
                    this.$progressionSM2HTML.html(this[this.name]['timerProblemSM2HTML']({
                        inputBitOne: inputBitOne,
                        inputBitTwo: inputBitTwo,
                        outputBitOne: outputBitOne,
                        outputBitTwo: outputBitTwo
                    }));
                    this.$progressionSM1.hide();
                    this.$progressionSM2.show();
                    this.$progressionSM3.hide();
                    var template = this.generateTemplate(codeTemplate, 8, 69);
                    this.executionPrefix = template.prefix;
                    this.executionSuffix = template.suffix;
                    var randomLineStart = 54;
                    var randomLineEnd = 67;
                    template = this.generateTemplate(codeTemplate, randomLineStart, randomLineEnd);
                    this.removedLines = template.removedLines;
                    this.prefix = template.prefix;
                    this.placeholder = template.placeholder;
                    this.suffix = template.suffix;
                    TEMPLATE_CODE = this.prefix + this.placeholder + this.suffix;
                    this.editor.setValue(TEMPLATE_CODE, 1);
                    this.restrictedEditor.initializeNonEditableAreas(this.prefix, this.suffix, this.placeholder);
                    this.editor.resize(true);
                    this.editor.scrollToLine(randomLineStart, true, true, function() {});
                    problem.correctPattern = '00 01 00 10 00 00 00 01';
                    problem.commands = [
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBitOne),
                        'assert 0b' + this.generateBinaryString(1 << outputBitOne),
                        '0x' + this.generateHexString(1 << inputBitTwo),
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBitTwo),
                        'assert 0b' + this.generateBinaryString(1 << outputBitTwo),
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString((1 << inputBitOne) | (1 << inputBitTwo)),
                        'assert 0b00000000',
                        '0x00',
                        'assert 0b00000000',
                        '0x' + this.generateHexString(1 << inputBitOne),
                        'assert 0b' + this.generateBinaryString(1 << outputBitOne)
                    ];
                    problem.inputStrings['A' + inputBitOne] = true;
                    problem.inputStrings['A' + inputBitTwo] = true;
                    problem.outputStrings['B' + outputBitOne] = true;
                    problem.outputStrings['B' + outputBitTwo] = true;
                    problem.explanation = 'B' + outputBitOne + ' is 1 when A' + inputBitOne + ' is 1, B' + outputBitTwo + ' is 1 when A' + inputBitTwo + ' is 1. B is 0 when both inputs are 1 or when both inputs are 0.';
                    break;
            }
        }
        return problem;
    };

    /*
        Gets the first assembly line number of the passed in c code line.
        |code| is required and the list of assembly instructions from the vm
        |cLine| is required and an integer, the line of c code to find
    */
    this.getStartOfAssembly = function(code, cLine) {
        for (var i = 0; i < code.length; i++) {
            if (code[i] && (code[i].instructionInfo.line === cLine)) {
                return i;
            }
        }
        return undefined;
    };

    /*
        Gets the last assembly line number of the passed in c code line.
        |code| is required and the list of assembly instructions from the vm
        |cLine| is required and an integer, the line of c code to find
    */
    this.getEndOfAssembly = function(code, cLine) {
        var latest;
        for (var i = 0; i < code.length; i++) {
            if (code[i] && (code[i].instructionInfo.line === cLine)) {
                latest = i;
            }
        }
        return latest - 1;
    };

    // Runs the test vectors for the |currentProblem| that was generated by generateProgressionQuestion, returns a promise
    this.runTestVector = function(currentProblem) {
        var self = this;
        var inputs = this.input.bitInputs;
        var outputs = this.output.bitOutputs;
        var minAssemblyLine;
        var maxAssemblyLine;
        return this.zyIOTestVector.run(currentProblem, {
            prepareToExecute: function() {
                return new Ember.RSVP.Promise(function(resolve, reject) {
                    self.getAndLoadAssemblyCode(self.editor.getValue(), function() {

                        if (self.codeLoadedSuccessfully) {

                            if (self.useTimer) {
                                var range1 = self.editor.find(self.executionPrefix);
                                var range2 = self.editor.find(self.executionSuffix);
                                var userCodeMin = range1.end.row + 1;
                                var userCodeMax = range2.start.row;
                                minAssemblyLine = self.getStartOfAssembly(self.vm.state.code, userCodeMin);
                                maxAssemblyLine = self.getEndOfAssembly(self.vm.state.code, userCodeMax);

                                if (minAssemblyLine === undefined) {
                                    minAssemblyLine = maxAssemblyLine;
                                }
                                else {
                                    maxAssemblyLine -= 1;
                                }

                                self.vm.runTillLine(userCodeMin);
                                resolve({
                                    noErrors: true,
                                    errorMessage: ''
                                });
                            }
                            else {
                                self.getAndLoadAssemblyCode(self.executionPrefix + self.restrictedEditor.getWriteEnabledCode() + self.executionSuffix, function() {

                                    if (self.codeLoadedSuccessfully) {
                                        resolve({
                                            noErrors: true,
                                            errorMessage: ''
                                        });
                                    }
                                    else {
                                        resolve({
                                            noErrors: false,
                                            errorMessage: 'Failed to compile. See error message above.'
                                        });
                                    }
                                });
                            }
                        }
                        else {
                            resolve({
                                noErrors: false,
                                errorMessage: 'Failed to compile. See error message above.'
                            });
                        }
                    });
                });
            },
            initExecute: function() {
                // Disable buttons
                self.utilities.disableButton(self.$generateTimingDiagramButton);
                self.utilities.disableButton(self.$stopButton);
                self.utilities.disableButton(self.$breakButton);
                self.utilities.disableButton(self.$continueButton);
                self.utilities.disableButton(self.$stepButton);
                self.utilities.disableButton(self.$runButton);
                self.utilities.disableButton(self.$compileButton);
            },
            executeStep: function() {
                var errorMessage;
                if (self.useTimer) {
                    errorMessage = self.vm.runInstructionsBetween(minAssemblyLine, maxAssemblyLine);
                }
                else {
                    errorMessage = self.vm.runToCompletion();
                }
                self.syncB();
                return errorMessage;
            },
            cleanUp: function() {
                self.utilities.disableButton(self.$generateTimingDiagramButton);
                self.utilities.disableButton(self.$stopButton);
                self.utilities.disableButton(self.$breakButton);
                self.utilities.disableButton(self.$continueButton);
                self.utilities.disableButton(self.$stepButton);
                self.utilities.disableButton(self.$runButton);
                self.utilities.disableButton(self.$compileButton);
                if (self.assembler) {
                    self.assembler.assembled = false;
                }
                if (self.vm) {
                    self.vm.hasExecuted = false;
                }
            },
            inputs: inputs,
            outputs: outputs,
            inputUpdated: function() {
                self.inputUpdated();
            }
        });
    };

    // Initialize the pin values in the vm
    this.initializePins = function() {
        this.vm.initPins(this.A);
        this.B = this.vm.getPin(PINS.B);
        this.B0 = this.B & 0x01;
        this.B1 = (this.B >> 1) & 0x01;
        this.B2 = (this.B >> 2) & 0x01;
        this.B3 = (this.B >> 3) & 0x01;
        this.B4 = (this.B >> 4) & 0x01;
        this.B5 = (this.B >> 5) & 0x01;
        this.B6 = (this.B >> 6) & 0x01;
        this.B7 = (this.B >> 7) & 0x01;
        for (var i = 0; i < this.output.bitOutputs.length; i++) {
            this.output.bitOutputs[i].outsideUpdate();
        }
    };

    // Begin execution of the vm
    this.runVM = function() {
        this.initializePins();
        this.vm.startExecution(this.oldCode, this.getBreakpoints(this.editor));
    };

    // Whenever an input is updated the decimal valued A must also be updated.
    this.inputUpdated = function() {
        this.A = (this.input.bitInputs[7].value << 7) | (this.input.bitInputs[6].value << 6) | (this.input.bitInputs[5].value << 5) | (this.input.bitInputs[4].value << 4) | (this.input.bitInputs[3].value << 3) | (this.input.bitInputs[2].value << 2) | (this.input.bitInputs[1].value << 1) | this.input.bitInputs[0].value;
        this.input.decimalInput.setValue(this.A);
    };

    // Whenever an output is updated the decimal valued B must also be updated.
    this.outputUpdated = function() {
        this.B = (this.output.bitOutputs[7].value << 7) | (this.output.bitOutputs[6].value << 6) | (this.output.bitOutputs[5].value << 5) | (this.output.bitOutputs[4].value << 4) | (this.output.bitOutputs[3].value << 3) | (this.output.bitOutputs[2].value << 2) | (this.output.bitOutputs[1].value << 1) | this.output.bitOutputs[0].value;
        this.output.decimalOutput.setValue(this.B);
    };
    <%= grunt.file.read(hbs_output) %>
}

var RIMSExport = {
    create: function() {
        return new RIMS();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    allowFullscreen: true,
};
module.exports = RIMSExport;
