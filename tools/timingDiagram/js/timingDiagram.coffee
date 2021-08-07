class TimingDiagram
    constructor: () ->
        @init = (id, parentResource, options) ->
            @name            = '<%= grunt.option("tool") %>'
            @id              = id
            @parentResource  = parentResource
            css              = '<style><%= grunt.file.read(css_filename) %></style>'
            @progressionTool = require('progressionTool').create();
            @utilities       = require('utilities');

            @signalIndexes = [];
            for signalIndex in [0..6]
                @signalIndexes.push(signalIndex);

            @canvasHeight = '40px';
            @canvasWidth = '300px';
            @usedQuestionIndices = [];

            html = '';
            if (options != null && options['useLoadRegisterQuestions'])
                html = this[@name]['loadRegister']({
                    id: @id,
                    signalIndexes: @signalIndexes,
                    canvasHeight: @canvasHeight,
                    canvasWidth: @canvasWidth
                });
            else
                html = this[@name]['timingDiagram']({
                    id: @id,
                    signalIndexes: @signalIndexes,
                    canvasHeight: @canvasHeight,
                    canvasWidth: @canvasWidth
                });
            self = this;
            @useMultipleParts = false;
            if options && options.useMultipleParts
                @useMultipleParts = true;

            if options != null && options['useHLSMQuestions']
                @variableA0Name = 'a';
                @variableA1Name = 'clk';
                @variableB0Name = 'Z';
                @variableBName = 'Z';
                @useHLSMQuestions = true;
                @useLoadRegisterQuestions = false;
                @useGateNotation = false;
                @useSRDQuestions = false;
                @useSRQuestions = false;
                @useDQuestions = false;
                @numberOfQuestionsToWin = 6;
                @numInputs = 2;
                @HLSM0 = {
                    STATES: {
                        SMStart: 0,
                        Reset: 1,
                        Increment: 2
                    },
                    state: 0,
                    I: 0,
                    Z: 0,
                    tick: (a) ->
                        state = self.HLSM0.state;
                        switch state
                            when self.HLSM0.STATES.SMStart
                                state = self.HLSM0.STATES.Reset;
                            when self.HLSM0.STATES.Reset
                                if a == 1
                                    state = self.HLSM0.STATES.Increment;
                                else
                                    state = self.HLSM0.STATES.Reset;
                            when self.HLSM0.STATES.Increment
                                if a == 1
                                    state = self.HLSM0.STATES.Increment;
                                else
                                    state = self.HLSM0.STATES.Reset;
                            else
                                state = self.HLSM0.STATES.Reset;
                        switch state
                            when self.HLSM0.STATES.Reset
                                self.HLSM0.I = 0;
                                self.HLSM0.Z = self.HLSM0.I;
                            when self.HLSM0.STATES.Increment
                                self.HLSM0.I = self.HLSM0.I + 3;
                                self.HLSM0.Z = self.HLSM0.I;
                        self.HLSM0.state = state;
                };
                @HLSM1 = {
                    STATES: {
                        SMStart: 0,
                        Start: 1,
                        Increment: 2,
                        Decrement: 3
                        },
                    state: 0,
                    I: 0,
                    Z: 0,
                    tick: (a) ->
                        state = self.HLSM1.state;
                        switch state
                            when self.HLSM1.STATES.SMStart
                                state = self.HLSM1.STATES.Start;
                            when self.HLSM1.STATES.Start
                                state = self.HLSM1.STATES.Increment;
                            when self.HLSM1.STATES.Increment
                                if a == 1
                                    state = self.HLSM1.STATES.Increment;
                                else
                                    state = self.HLSM1.STATES.Decrement;
                            when self.HLSM1.STATES.Decrement
                                if a == 1
                                    state = self.HLSM1.STATES.Increment;
                                else
                                    state = self.HLSM1.STATES.Decrement;
                            else
                                state = self.HLSM1.STATES.Start;
                        switch state
                            when self.HLSM1.STATES.Start
                                self.HLSM1.I = 50;
                                self.HLSM1.Z = self.HLSM1.I;
                            when self.HLSM1.STATES.Increment
                                self.HLSM1.I = self.HLSM1.I + 1;
                                self.HLSM1.Z = self.HLSM1.I;
                            when self.HLSM1.STATES.Decrement
                                self.HLSM1.I = self.HLSM1.I - 2;
                                self.HLSM1.Z = self.HLSM1.I;
                        self.HLSM1.state = state;
                }
            else if options != null && options['useLoadRegisterQuestions']
                @variableA0Name = 'A';
                @variableA1Name = 'B';
                @variableA2Name = 'ld';
                @variableA3Name = 'clk'
                @variableB0Name = 'Z';
                @variableBName = 'Z';
                @useHLSMQuestions = false;
                @useLoadRegisterQuestions = true;
                @useGateNotation = false;
                @useSRDQuestions = false;
                @useSRQuestions = false;
                @useDQuestions = false;
                @numberOfQuestionsToWin = 6;
                @numInputs = 4;
                if 'coal' of options
                    @isCoal = true
                else
                    @isCoal = false
                if 'useAdders' of options
                    @useAdders = options['useAdders'];
                    @numberOfQuestionsToWin = 4;
                else
                    @useAdders = true;
            else if options != null && options['useGateNotation']
                @variableA0Name = 'a';
                @variableA1Name = 'b';
                @variableB0Name = 'y';
                @variableBName = 'y';
                @variableORSymbol = ' + ';
                @variableANDSymbol = '';
                @useHLSMQuestions = false;
                @useLoadRegisterQuestions = false;
                @useGateNotation = true;
                @useSRDQuestions = false;
                @useSRQuestions = false;
                @useDQuestions = false;
                @numberOfQuestionsToWin = 4;
                @numInputs = 2;
            else if options != null && options['useSRDQuestions']
                @variableA0Name = 's';
                @variableA1Name = 'r';
                @variableB0Name = 'q';
                @variableBName = 'q';
                @variableORSymbol = ' + ';
                @variableANDSymbol = '';
                @useHLSMQuestions = false;
                @useLoadRegisterQuestions = false;
                @useGateNotation = false;
                @useSRDQuestions = true;
                @useSRQuestions = false;
                @useDQuestions = false;
                @numberOfQuestionsToWin = 4;
                @numInputs = 2;
            else if options != null && options['useSRQuestions']
                @variableA0Name = 's';
                @variableA1Name = 'r';
                @variableB0Name = 'q';
                @variableBName = 'q';
                @variableORSymbol = ' + ';
                @variableANDSymbol = '';
                @useHLSMQuestions = false;
                @useLoadRegisterQuestions = false;
                @useGateNotation = false;
                @useSRDQuestions = false;
                @useSRQuestions = true;
                @useDQuestions = false;
                @numberOfQuestionsToWin = 2;
                @numInputs = 2;
            else if options != null && options['useDQuestions']
                @variableA0Name = 'd';
                @variableA1Name = 'e';
                @variableB0Name = 'q';
                @variableBName = 'q';
                @variableORSymbol = ' + ';
                @variableANDSymbol = '';
                @useHLSMQuestions = false;
                @useLoadRegisterQuestions = false;
                @useGateNotation = false;
                @useSRDQuestions = false;
                @useSRQuestions = false;
                @useDQuestions = true;
                @numberOfQuestionsToWin = 2;
                @numInputs = 2;
            else
                @variableA0Name = 'A0';
                @variableA1Name = 'A1';
                @variableB0Name = 'B0';
                @variableBName = 'B';
                @variableORSymbol = '||';
                @variableANDSymbol = ' && ';
                @useHLSMQuestions = false;
                @useLoadRegisterQuestions = false;
                @useGateNotation = false;
                @useSRDQuestions = false;
                @useSRQuestions = false;
                @useDQuestions = false;
                @numberOfQuestionsToWin = 6;
                @numInputs = 2;

            self.LoadQuestionTypes =
                OneRegister: 0
                TwoRegisters: 1
                Adder: 2
            self.HLSMQuestionTypes =
                HLSM0: 0
                HLSM1: 1
            if @useHLSMQuestions
                @originalBinaryQuestions = [];
                @binary_questions = [];
                @originalIntegerQuestions = [];
                @integer_questions = [];
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM0);
                q1 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm0-' + @id];
                @originalIntegerQuestions.push(q1);
                @integer_questions.push(q1);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM0);
                q2 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm0-' + @id];
                @originalIntegerQuestions.push(q2);
                @integer_questions.push(q2);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM0);
                q3 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm0-' + @id];
                @originalIntegerQuestions.push(q3);
                @integer_questions.push(q3);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM0);
                q4 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm0-' + @id];
                @originalIntegerQuestions.push(q4);
                @integer_questions.push(q4);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM0);
                q5 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm0-' + @id];
                @originalIntegerQuestions.push(q5);
                @integer_questions.push(q5);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM1);
                q6 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm1-' + @id];
                @originalIntegerQuestions.push(q6);
                @integer_questions.push(q6);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM1);
                q7 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm1-' + @id];
                @originalIntegerQuestions.push(q7);
                @integer_questions.push(q7);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM1);
                q8 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm1-' + @id];
                @originalIntegerQuestions.push(q8);
                @integer_questions.push(q8);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM1);
                q9 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm1-' + @id];
                @originalIntegerQuestions.push(q9);
                @integer_questions.push(q9);
                currentGeneratedQuestion = @generateHLSMQuestion(@HLSMQuestionTypes.HLSM1);
                q10 = new Question ['', currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], '#hlsm1-' + @id];
                @originalIntegerQuestions.push(q10);
                @integer_questions.push(q10);
            else if @useLoadRegisterQuestions
                instructionsPlural = 'Registers initially contain 0.';
                oneRegisterInstructions = 'Register initially contains 0.';
                twoRegistersInstructions = instructionsPlural;
                twoRegistersNote = 'Note that sequential load registers cause a delay. ';
                adderInstructions = 'The adder does not cause a delay. ' + instructionsPlural;
                if @useAdders
                    twoRegistersInstructions = twoRegistersNote + instructionsPlural;

                #Defines a pool of questions [logical equation, A0, A1, correct answer]
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.OneRegister);
                q1 = new Question [oneRegisterInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#single-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.OneRegister);
                q2 = new Question [oneRegisterInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#single-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.OneRegister);
                q3 = new Question [oneRegisterInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#single-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.OneRegister);
                q4 = new Question [oneRegisterInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#single-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.TwoRegisters);
                q5 = new Question [twoRegistersInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#double-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.TwoRegisters);
                q6 = new Question [twoRegistersInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#double-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.TwoRegisters);
                q7 = new Question [twoRegistersInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#double-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.Adder);
                q8 = new Question [adderInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#triple-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.Adder);
                q9 = new Question [adderInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#triple-' + @id];
                currentGeneratedQuestion = @generateLoadQuestion(@LoadQuestionTypes.Adder);
                q10 = new Question [adderInstructions, currentGeneratedQuestion[0], currentGeneratedQuestion[1], currentGeneratedQuestion[2], currentGeneratedQuestion[3], currentGeneratedQuestion[4], '#triple-' + @id];
                @originalBinaryQuestions = [];
                @binary_questions = [];
                @originalIntegerQuestions = [q1, q2, q3, q4, q5, q6, q7];
                @integer_questions = [q1, q2, q3, q4, q5, q6, q7];
                @questionsWithAdders = [q8, q9, q10];
                if @useAdders
                    Array::push.apply @originalIntegerQuestions, @questionsWithAdders;
                    Array::push.apply @integer_questions, @questionsWithAdders;
            else if @useSRDQuestions
                #Defines a pool of questions [logical equation, A0, A1, correct answer]
                q1 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [1,0,1,0,0,0,1,1,0,1], [0,0,0,0,1,0,0,0,0,0], [1,1,1,1,0,0,1,1,1,1], '#sr-' + @id];
                q2 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [0,0,1,0,0,0,0,0,0,0], [1,0,0,0,1,0,1,0,0,0], [0,0,1,1,0,0,0,0,0,0], '#sr-' + @id];
                q3 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [1,0,0,0,1,0,0,1,1,0], [0,0,1,0,0,0,1,0,0,1], [1,1,0,0,1,1,0,1,1,0], '#sr-' + @id];
                q4 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [1,1,1,0,0,1,1,0,1,0], [1,1,0,0,1,1,1,1,0,0], [1,1,1,1,0,1,1,0,0,0], '#d-' + @id];
                q5 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [0,0,0,0,1,1,1,1,1,0], [1,1,0,0,0,1,1,0,1,1], [0,0,0,0,0,1,1,0,1,0], '#d-' + @id];
                @originalBinaryQuestions = [q1, q2, q3, q4, q5];
                @binary_questions = [q1, q2, q3, q4, q5];
                @integer_questions = [];
                @originalIntegerQuestions = [];
            else if @useSRQuestions
                #Defines a pool of questions [logical equation, A0, A1, correct answer]
                @B0EqualsA0AndA1 = @variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name
                @B0EqualsA0OrA1 = @variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name
                q1 = new Question [@B0EqualsA0AndA1, [1,0,1,0,0,0,1,1,0,1], [0,0,0,0,1,0,0,0,0,0], [1,1,1,1,0,0,1,1,1,1], '#sr-' + @id];
                q2 = new Question [@B0EqualsA0OrA1, [0,0,1,0,0,0,0,0,0,0], [1,0,0,0,1,0,1,0,0,0], [0,0,1,1,0,0,0,0,0,0], '#sr-' + @id];
                q3 = new Question [@B0EqualsA0AndA1, [1,0,0,0,1,0,0,1,1,0], [0,0,1,0,0,0,1,0,0,1], [1,1,0,0,1,1,0,1,1,0], '#sr-' + @id];
                @originalBinaryQuestions = [ q1, q2, q3 ];
                @binary_questions = [ q1, q2, q3 ];
                @integer_questions = [];
                @originalIntegerQuestions = [];
                if @parentResource.setSolution
                    @parentResource.setSolution('s = 1 sets q to 1.' + @utilities.getNewline() + 'r = 1 resets q to 0.' + @utilities.getNewline() + 'q stays same when sr = 00.', 'text', true)
            else if @useDQuestions
                #Defines a pool of questions [logical equation, A0, A1, correct answer]
                @B0EqualsA0OrA1 = @variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name
                q1 = new Question [@B0EqualsA0OrA1, [1,1,1,0,0,1,1,0,1,0], [1,1,0,0,1,1,1,1,0,0], [1,1,1,1,0,1,1,0,0,0], '#d-' + @id];
                q2 = new Question [@B0EqualsA0OrA1, [0,0,0,0,1,1,1,1,1,0], [1,1,0,0,0,1,1,0,1,1], [0,0,0,0,0,1,1,0,1,0], '#d-' + @id];
                q3 = new Question [@B0EqualsA0OrA1, [0,0,1,1,1,0,0,0,1,0], [1,0,0,1,1,0,1,0,0,0], [0,0,0,1,1,1,0,0,0,0], '#d-' + @id];
                @originalBinaryQuestions = [ q1, q2, q3 ];
                @binary_questions = [ q1, q2, q3 ];
                @integer_questions = [];
                @originalIntegerQuestions = [];
                if @parentResource.setSolution
                    @parentResource.setSolution('q stays the same when e = 0.' + @utilities.getNewline() + 'When e = 1, d is stored in q.', 'text', true)
            else
                #Defines a pool of questions [logical equation, A0, A1, correct answer]
                q1 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [0,0,1,1,1,0,0,0,0,0], [0,0,1,1,1,1,1,0,0,0], [0,0,1,1,1,0,0,0,0,0], '#and-gate-' + @id];
                q2 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [1,1,0,0,1,1,1,1,1,1], [0,0,1,1,0,0,1,1,1,1], [0,0,0,0,0,0,1,1,1,1], '#and-gate-' + @id];
                q3 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [0,1,1,1,1,1,1,1,1,1], [0,1,0,1,0,1,0,1,0,0], [0,1,0,1,0,1,0,1,0,0], '#and-gate-' + @id];
                q4 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [0,0,0,1,1,1,1,0,0,0], [1,0,1,1,0,0,0,0,0,0], [0,0,0,1,0,0,0,0,0,0], '#and-gate-' + @id];
                q5 = new Question [@variableB0Name + ' = ' + @variableA0Name + @variableANDSymbol + @variableA1Name, [1,1,0,0,1,1,0,0,1,1], [0,0,0,0,0,1,1,1,1,1], [0,0,0,0,0,1,0,0,1,1], '#and-gate-' + @id];
                q6 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [0,1,1,0,0,1,1,0,0,0], [0,0,1,1,1,1,1,0,0,0], [0,1,1,1,1,1,1,0,0,0], '#or-gate-' + @id];
                q7 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [0,1,1,1,1,1,1,1,1,1], [0,1,0,1,0,1,0,1,0,0], [0,1,1,1,1,1,1,1,1,1], '#or-gate-' + @id];
                q8 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [1,1,1,1,1,1,0,0,1,1], [0,0,0,1,0,0,0,1,0,0], [1,1,1,1,1,1,0,1,1,1], '#or-gate-' + @id];
                q9 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [1,1,0,0,1,1,0,0,1,1], [0,1,0,1,0,1,1,0,0,0], [1,1,0,1,1,1,1,0,1,1], '#or-gate-' + @id];
                q10 = new Question [@variableB0Name + ' = ' + @variableA0Name + ' ' + @variableORSymbol + ' ' + @variableA1Name, [0,0,0,0,0,0,1,1,1,1], [1,1,1,0,0,0,1,1,1,1], [1,1,1,0,0,0,1,1,1,1], '#or-gate-' + @id];

                @originalBinaryQuestions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10];
                @binary_questions = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10];

                qi1 = new Question ['When ' + @variableA0Name + ' rises, ' + @variableBName + ' = ' + @variableBName + ' + 1', [0,0,0,0,1,1,1,0,0,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,1,1,1,1,1,1]];
                qi2 = new Question ['When ' + @variableA0Name + ' rises, ' + @variableBName + ' = ' + @variableBName + ' + 1', [0,0,0,0,1,0,1,0,1,0], [0,0,0,0,0,0,0,0,0,0], [0,0,0,0,1,1,2,2,3,3]];
                qi3 = new Question ['When ' + @variableA0Name + ' and ' + @variableA1Name + ' rise simultaneously, ' + @variableBName + ' = ' + @variableBName + ' + 1', [0,1,1,1,1,0,0,1,1,1], [0,1,0,0,0,0,0,1,1,1], [0,1,1,1,1,1,1,2,2,2]];
                qi4 = new Question ['When ' + @variableA1Name + ' falls, ' + @variableBName + ' = ' + @variableBName + ' + 2', [0,1,0,1,0,1,0,1,0,1], [0,0,0,0,1,1,0,1,0,0], [0,0,0,0,0,0,2,2,4,4,4]];
                qi5 = new Question ['When ' + @variableA0Name + ' falls and ' + @variableA1Name + ' rises simultaneously, ' + @variableBName + ' = ' + @variableBName + ' + 1', [0,1,0,1,0,1,0,1,0,1], [1,1,1,0,1,1,1,0,1,1], [0,0,0,0,1,1,1,1,2,2]];
                @integer_questions = [qi1, qi2, qi3, qi4, qi5];
                @originalIntegerQuestions = [qi1, qi2, qi3, qi4, qi5];

            @progressionTool.init(@id, @parentResource, {
                html: html,
                css: css,
                numToWin: @numberOfQuestionsToWin,
                useMultipleParts: @useMultipleParts,
                start: () ->
                    self.toolIsActive = true;
                    self.binary_questions = self.originalBinaryQuestions.slice(0);
                    self.integer_questions = self.originalIntegerQuestions.slice(0);
                    self.nextLevel(0);
                    if self.getMode() == 'integer'
                        $('#b0-label-' + @id).parent().find('.output-container').find('.int-output-segment').first().focus().select();
                    self.enableInteractiveElements();
                ,
                reset: () ->
                    self.toolIsActive = false;
                    self.reset();
                    self.disableInteractiveElements();
                ,
                next: (currentQuestion) ->
                    self.toolIsActive = true;
                    self.nextLevel(currentQuestion);
                    if self.getMode() == 'integer'
                        $('#b0-label-' + @id).parent().find('.output-container').find('.int-output-segment').first().focus().select();
                    self.enableInteractiveElements();
                ,
                isCorrect: (currentQuestion) ->
                    self.toolIsActive = false;
                    isAnswerCorrect = true;
                    userAnswer = self.BValues[0];
                    expectedAnswer = self.activeQuestion.answer;
                    explanationMessage = '';

                    for pair in self.zip(userAnswer.slice(0, userAnswer.length), expectedAnswer.slice(0, expectedAnswer.length))
                        if pair[0] != pair[1]
                            isAnswerCorrect = false;
                    if not isAnswerCorrect
                        self.drawCorrectAnswer();
                        if self.getMode() == 'integer'
                            if options.useHLSMQuestions
                                if (self.BValues[0][0] != 0 || self.BValues[0][1] != 0) && currentQuestion < (self.numberOfQuestionsToWin / 2)
                                    explanationMessage = 'HLSM transitions to Reset in first clock. ';
                                if (self.BValues[0][0] != 50 || self.BValues[0][1] != 50) && currentQuestion >= (self.numberOfQuestionsToWin / 2)
                                    explanationMessage = 'HLSM transitions to Start in first clock. ';
                            explanationMessage += 'Incorrect answer(s) highlighted above.';
                        else
                            explanationMessage = 'Answer shown in red.';
                    else
                        self.drawDiagrams(false, true);
                        explanationMessage = 'Correct.';

                    if options.useSRDQuestions
                        if self.randomQuestionIndex < 3
                            explanationMessage = 's = 1 sets q to 1.' + @utilities.getNewline() + 'r = 1 resets q to 0.' + @utilities.getNewline() + 'q stays same when sr = 00.';
                        else
                            explanationMessage = 'q stays the same when e = 0.' + @utilities.getNewline() + 'When e = 1, d is stored in q.'

                    if options.useSRQuestions
                        explanationMessage = 's = 1 sets q to 1.' + @utilities.getNewline() + 'r = 1 resets q to 0.' + @utilities.getNewline() + 'q stays same when sr = 00.';
                        if @parentResource.setSolution
                            @parentResource.setSolution(explanationMessage, 'text', true)

                    if options.useDQuestions
                        explanationMessage = 'q stays the same when e = 0.' + @utilities.getNewline() + 'When e = 1, d is stored in q.'
                        if @parentResource.setSolution
                            @parentResource.setSolution(explanationMessage, 'text', true)

                    self.disableInteractiveElements();

                    return {
                        isCorrect:          isAnswerCorrect,
                        userAnswer:         JSON.stringify(userAnswer),
                        expectedAnswer:     expectedAnswer,
                        explanationMessage: explanationMessage
                    };
            });

            if @useLoadRegisterQuestions
                $('#' + @id).width('690px');
                if @isCoal
                    @singleRegisterSource = 'single_coal_register.png'
                    @doubleRegisterSource = 'double_coal_register.png'
                else
                    @singleRegisterSource = 'single.png'
                    @doubleRegisterSource = 'double.png'
                $('#single-' + @id)[0].src = @parentResource.getResourceURL(@singleRegisterSource, @name);
                $('#double-' + @id)[0].src = @parentResource.getResourceURL(@doubleRegisterSource, @name);
                $('#triple-' + @id)[0].src = @parentResource.getResourceURL('triple.png', @name);
            else
                $('#and-gate-' + @id)[0].src = @parentResource.getResourceURL('and.png', @name);
                $('#or-gate-' + @id)[0].src = @parentResource.getResourceURL('or.png', @name);
                $('#sr-' + @id)[0].src = @parentResource.getResourceURL('sr.png', @name);
                $('#d-' + @id)[0].src = @parentResource.getResourceURL('d.png', @name);
                $('#hlsm0-' + @id)[0].src = @parentResource.getResourceURL('hlsm0.png', @name);
                $('#hlsm1-' + @id)[0].src = @parentResource.getResourceURL('hlsm1.png', @name);

            $('#' + @id + ' .gate-image-container').hide();
            $('#' + @id + ' .diagram-canvas-container').css('height', @canvasHeight);
            $('#' + @id + ' .diagram-canvas-container').css('width', @canvasWidth);
            $('#' + @id + ' .diagram-canvas').css('height', @canvasHeight);
            $('#' + @id + ' .diagram-canvas').css('width', @canvasWidth);
            @$inputDiagrams = [];
            $('#' + @id + ' .diagram-canvas-container.input-canvas').each \
                (index, element) ->
                    if index < self.numInputs
                        self.$inputDiagrams.push(element);
                    else
                        $(@).parent().hide();
            for diagram in @$inputDiagrams
                $(diagram).find('.int-input-segment').prop('disabled', true);
            if @useLoadRegisterQuestions
                # first two are integer inputs
                $(@$inputDiagrams[0]).find('.diagram-canvas').hide();
                $(@$inputDiagrams[1]).find('.diagram-canvas').hide();
            else
                $(@$inputDiagrams[0]).find('.int-input-segment').hide();
                $(@$inputDiagrams[1]).find('.int-input-segment').hide();
            @$outputDiagrams = $('#' + @id + ' .diagram-canvas-container.output-canvas');
            @disableInteractiveElements();
            for diagram in @zip(@$outputDiagrams, [0 ... @$outputDiagrams.length])
                if diagram[1] > 0
                    $(diagram[0]).find('.diagram-canvas').hide();
                    $(diagram[0]).parent().hide();
                if diagram[1] == (@$outputDiagrams.length - 1)
                    @$expectedAnswer = diagram[0];
            @BValues = [];
            $(@$expectedAnswer).parent().show().css('visibility', 'hidden');
            @reset();
            $('#' + @id + ' .output-segment').click((event) ->
                self.segmentClick(event, $(this).parent());
            );

            $('#' + @id + ' .int-output-segment').change((event) ->
                self.integerChange(event, $(this).parent());
            );

        @toolIsActive = false;
        @userEnteredB0Values = [];
        @activeQuestion = null;
        @resetUserEnteredBValues = () ->
            @BValues = [];
            for j in [0 ... @$outputDiagrams.length]
                @BValues.push((0 for i in @signalIndexes));

        class Question
            constructor: (params) ->
                @equation = params[0];
                @a0 = params[1];
                @a1 = params[2];
                if params.length == 5
                    @answer = params[3];
                    @gate = params[4];
                else if params.length == 7
                    @a2 = params[3];
                    @a3 = params[4];
                    @answer = params[5];
                    @gate = params[6];
                else
                    @answer = params[3];

        @zip = () ->
            lengthArray = (arr.length for arr in arguments)
            length = Math.min(lengthArray...)
            for i in [0...length]
                arr[i] for arr in arguments

        @clearDiagram = (canvas) ->
            ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);

        @drawWave = (ctx, arr) ->
            ctx.beginPath();
            y_low = 35;
            y_high = 5;
            x_delta = 40;
            x_pos = 0;
            y_pos = if arr[0] == 0 then y_low else y_high;

            # Draw first horizontal line
            ctx.beginPath();
            ctx.moveTo(x_pos, y_pos);
            x_pos += x_delta;
            ctx.lineTo(x_pos, y_pos);
            ctx.stroke();

            for val, ind in arr.slice(1, (@signalIndexes.length))
                old_y = y_pos;
                y_pos = if val == 0 then y_low else y_high;
                # Draw vertical line
                if old_y != y_pos
                    ctx.beginPath();
                    ctx.moveTo(x_pos, old_y);
                    ctx.lineTo(x_pos, y_pos);
                    ctx.stroke();
                # Draw horizontal line
                ctx.beginPath();
                ctx.moveTo(x_pos, y_pos);
                x_pos += x_delta;
                ctx.lineTo(x_pos, y_pos);
                ctx.stroke();

        @getRandomInt = (min, max) ->
            return Math.floor(Math.random() * (max - min + 1)) + min;

        # Checks if a newly created question is the same as an already existing question
        @doesQuestionExist = (question) ->
            doesExist = false;
            for q in @originalBinaryQuestions
                if q.gate && question.gate && q.gate == question.gate
                    if q.equation == question.equation && q.answer.length == question.answer.length
                        doesNotMatch = false;
                        for oldAnswer in q.answer
                            for newAnswer in question.answer
                                if newAnswer != oldAnswer
                                    doesNotMatch = true;
                            if doesNotMatch
                                break;
                        if !doesNotMatch
                            doesExist = true;
            for q in @originalIntegerQuestions
                if q.gate && question.gate && q.gate == question.gate
                    if q.equation == question.equation && q.answer.length == question.answer.length
                        doesNotMatch = false;
                        for oldAnswer in q.answer
                            for newAnswer in question.answer
                                if newAnswer != oldAnswer
                                    doesNotMatch = true;
                            if doesNotMatch
                                break;
                        if !doesNotMatch
                            doesExist = true;
            return doesExist;

        @generateHLSMQuestion = (problemType) ->
            # Reset SMs
            @HLSM0.state = -1;
            @HLSM0.I = 0;
            @HLSM0.Z = 0;
            @HLSM1.state = -1;
            @HLSM1.I = 0;
            @HLSM1.Z = 0;
            # a. clk, Z
            variableValues = [[], [], []];
            variableValues[1] = (i % 2 for i in [1 ... @signalIndexes.length + 1]);
            possibleInputLocations = (i[0] - 1 for i in @zip([0 ... @signalIndexes.length], variableValues[1]) when i[1] == 1);
            all1sOr0s = true;
            while all1sOr0s
                variableValues[0] = (0 for i in [0 ... @signalIndexes.length])
                chosenInputs = (@getRandomInt(0, 1) for i in [0 ... possibleInputLocations.length]);
                for i in @zip([0 ... possibleInputLocations.length], chosenInputs)
                    if i[1] == 1
                        if possibleInputLocations[i[0]] != -1
                            variableValues[0][possibleInputLocations[i[0]]] = 1;
                        variableValues[0][possibleInputLocations[i[0]] + 1] = 1;
                previousValue = variableValues[0][0];
                for i in [1 ... @signalIndexes.length - 1]
                    if variableValues[0][i] == 1 && previousValue == 0
                        all1sOr0s = false;
                        break;
                    if variableValues[0][i] == 0 && previousValue == 1
                        all1sOr0s = false;
                        break;
                    previousValue = variableValues[0][i];
                if !all1sOr0s
                    all1sOr0s = @doesQuestionExist(new Question ['', variableValues[0], variableValues[1], variableValues[2], '#hlsm' + problemType + '-' + @id]);
            switch problemType
                when @HLSMQuestionTypes.HLSM0
                    for i in [0 ... @signalIndexes.length]
                        if variableValues[1][i] == 1
                            @HLSM0.tick(variableValues[0][i]);
                        variableValues[2][i] = @HLSM0.Z;
                when @HLSMQuestionTypes.HLSM1
                    for i in [0 ... @signalIndexes.length]
                        if variableValues[1][i] == 1
                            @HLSM1.tick(variableValues[0][i]);
                        variableValues[2][i] = @HLSM1.Z;
            return variableValues;
        @generateLoadQuestion = (problemType) ->
            aSignal   = [];
            bSignal   = [];
            ldSignal  = [];
            clkSignal = [];
            zSignal   = [];

            for i in [0 ... @signalIndexes.length]
                # CLK starts at 0 then oscilates between 1 and 0.
                clkSignal[i] = (i % 2);

                # If CLK is rising, do not change A, B, nor LD signals.
                if clkSignal[i] == 1
                    aSignal[i]  = aSignal[i - 1];
                    bSignal[i]  = bSignal[i - 1];
                    ldSignal[i] = ldSignal[i - 1];
                else
                    # A, B, and Z signals need to be 3-bit values between 0 and 7.
                    # Some questions add A and B to equal Z
                    addedValue = @getRandomInt(0, 7);
                    aSignal[i] = @getRandomInt(0, addedValue);
                    bSignal[i] = addedValue - aSignal[i];

                    # Circuit has 2 registers in series, so start with many high LD signals.
                    if problemType == @LoadQuestionTypes.TwoRegisters
                        ldSignal[i] = if (i < 5) then 1 else 0;
                    else
                        ldSignal[i] = if (i == 0) then 1 else @getRandomInt(0, 1);

                # Registers load new value when LD and CLK are high.
                if (ldSignal[i] == 1) && (clkSignal[i] == 1)
                    switch problemType
                        # Circuit has 1 register, so immediately load.
                        when @LoadQuestionTypes.OneRegister
                            zSignal[i] = aSignal[i];
                        # Circuit has 2 registers in series, so Z signal update is delayed by 1 load cycle.
                        when @LoadQuestionTypes.TwoRegisters
                            zSignal[i]         = if firstRegisterValue? then firstRegisterValue else 0;
                            firstRegisterValue = aSignal[i];
                        # Circuit has adds two signals to register.
                        when @LoadQuestionTypes.Adder
                            zSignal[i] = aSignal[i] + bSignal[i];
                # Otherwise, assign Z's previous value
                else
                    # Z's previous value is 0 when i is 0.
                    zSignal[i] = if (i == 0) then 0 else zSignal[i - 1];

            return [aSignal, bSignal, ldSignal, clkSignal, zSignal];

        @getMode = () ->
            return if $('#b0-0-' + @id).css('display') == 'none' then 'integer' else 'binary';

        @setMode = (mode...) ->
            for diagram in @$outputDiagrams
                @clearDiagram($(diagram).find('.diagram-canvas')[0]);
            if mode[0] == 'binary'
                $('#a0-label-' + @id).text(@variableA0Name);
                $('#a1-label-' + @id).text(@variableA1Name);
                $('#a2-label-' + @id).text(@variableA2Name);
                $('#a3-label-' + @id).text(@variableA3Name);
                $('#b0-label-' + @id).text(@variableB0Name).addClass('binary-adjustment');
                $('#b0-label-' + @id).text(@variableB0Name).removeClass('integer-adjustment');
                $('#B0-diagram-' + @id).show();
                $('#' + @id + ' .int-output-segment').hide();
                $('#' + @id + ' .output-segment').show();
            else if mode[0] == 'integer'
                $('#a0-label-' + @id).text(@variableA0Name);
                $('#a1-label-' + @id).text(@variableA1Name);
                $('#a2-label-' + @id).text(@variableA2Name);
                $('#a3-label-' + @id).text(@variableA3Name);
                $('#b0-label-' + @id).text(@variableB0Name).removeClass('binary-adjustment');
                $('#b0-label-' + @id).text(@variableB0Name).addClass('integer-adjustment');
                $('#b0-label-' + @id).text(@variableBName);
                $('#B0-diagram-' + @id).hide();
                $('#' + @id + ' .int-output-segment').show();
                $('#' + @id + ' .output-segment').hide();

        @chooseEqn = (currentQuestion) ->
            randQuestion = null;
            getNewIndex = true;

            # The number of tries for a new question, just 15, no reason why.
            maxIterations = 15;
            maxLength = 1;
            iterations = 0;

            while getNewIndex
                @randomQuestionIndex = -1;

                # Generate an HLSM question
                if @useHLSMQuestions && currentQuestion < 3
                    @randomQuestionIndex = @getRandomInt(0, @integer_questions.length - 6);
                    randQuestion = @integer_questions[@randomQuestionIndex];
                    maxLength = @integer_questions.length - 6;
                else if @useHLSMQuestions && currentQuestion >= 3
                    @randomQuestionIndex = @getRandomInt(3, @integer_questions.length - 1);
                    randQuestion = @integer_questions[@randomQuestionIndex];
                    maxLength = @integer_questions.length - 1;

                # Generate a load register question without adders
                else if !@useAdders && @useLoadRegisterQuestions
                    $('#a1-label-' + @id).parent().hide();
                    if currentQuestion < 2
                        @randomQuestionIndex = @getRandomInt(0, @integer_questions.length - 5);
                        randQuestion = @integer_questions[@randomQuestionIndex];
                        maxLength = @integer_questions.length - 5;
                    else
                        $('#a1-label-' + @id).parent().hide();
                        @randomQuestionIndex = @getRandomInt(currentQuestion + 1, @integer_questions.length - 1);
                        randQuestion = @integer_questions[@randomQuestionIndex];
                        maxLength = (@integer_questions.length - 5) - currentQuestion + 1;

                # Generate a load register question
                else if @useLoadRegisterQuestions
                    if currentQuestion < 2
                        $('#a1-label-' + @id).parent().hide();
                        @randomQuestionIndex = @getRandomInt(0, @integer_questions.length - 7);
                        randQuestion = @integer_questions[@randomQuestionIndex];
                        maxLength = @integer_questions.length - 7;
                    else if currentQuestion < 4
                        $('#a1-label-' + @id).parent().hide();
                        @randomQuestionIndex = @getRandomInt(4, @integer_questions.length - 4);
                        randQuestion = @integer_questions[@randomQuestionIndex];
                        maxLength = (@integer_questions.length - 4) - 2;
                    else
                        $('#a1-label-' + @id).parent().show();
                        @randomQuestionIndex = @getRandomInt(7, @integer_questions.length - 1);
                        randQuestion = @integer_questions[@randomQuestionIndex];
                        maxLength = (@integer_questions.length - 1) - 3;

                # Generate an SRD question
                else if @getMode() == 'binary' && @useSRDQuestions && currentQuestion < 2
                    @randomQuestionIndex = Math.floor(Math.random() * (@binary_questions.length-2));
                    randQuestion = @binary_questions[@randomQuestionIndex];
                    maxLength = @binary_questions.length - 2;
                else if @getMode() == 'binary' && @useSRDQuestions && currentQuestion >= 2
                    @randomQuestionIndex = Math.floor(Math.random() * (@binary_questions.length-1))+1;
                    randQuestion = @binary_questions[@randomQuestionIndex];
                    maxLength = @binary_questions.length - 1;

                # Generate SR question or D question, depenging on options.
                else if @getMode() == 'binary' && (@useSRQuestions || @useDQuestions)
                    @randomQuestionIndex = Math.floor(Math.random() * (@binary_questions.length));
                    randQuestion = @binary_questions[@randomQuestionIndex];
                    maxLength = @binary_questions.length;

                # Generate a gate notation question
                else if @getMode() == 'binary' && @useGateNotation && currentQuestion < 2
                    @randomQuestionIndex = Math.floor(Math.random() * (@binary_questions.length-5));
                    randQuestion = @binary_questions[@randomQuestionIndex];
                    maxLength = @binary_questions.length - 5;
                else if @getMode() == 'binary' && @useGateNotation && currentQuestion >= 2
                    @randomQuestionIndex = Math.floor(Math.random() * (@binary_questions.length-3))+3;
                    randQuestion = @binary_questions[@randomQuestionIndex];
                    maxLength = (@binary_questions.length - 3) - 3;

                # Generated a basic timing diagram question
                else if @getMode() == 'binary'
                    @randomQuestionIndex = Math.floor(Math.random() * @binary_questions.length);
                    randQuestion = @binary_questions[@randomQuestionIndex];
                    maxLength = @binary_questions.length;
                else if @getMode() == 'integer'
                    @randomQuestionIndex = Math.floor(Math.random() * @integer_questions.length);
                    randQuestion = @integer_questions[@randomQuestionIndex];
                    maxLength = @binary_questions.length;

                iterations += 1;

                # If already tried each level, or many times, do not repeat the last one.
                if (@usedQuestionIndices.length >= maxLength) or (iterations >= maxIterations)
                    @usedQuestionIndices = [ @usedQuestionIndices[@usedQuestionIndices.length - 1] ];

                if @randomQuestionIndex not in @usedQuestionIndices
                    @usedQuestionIndices.push(@randomQuestionIndex);
                    getNewIndex = false;
                else if iterations >= maxIterations
                    getNewIndex = false;

            $('#equation-' + @id).text(randQuestion.equation);
            return randQuestion;

        # Enable the interactive elements, such as the canvas and inputs.
        @enableInteractiveElements = () ->
            for diagram in @$outputDiagrams
                $(diagram).find('.output-container').find('.int-output-segment').prop('disabled', false);
            $('#' + @id + ' .output-segment, .int-output-segment').addClass('active');

        # Disable the interactive elements, such as the canvas and inputs.
        @disableInteractiveElements = () ->
            for diagram in @$outputDiagrams
                $(diagram).find('.output-container').find('.int-output-segment').prop('disabled', true);
            $('#' + @id + ' .output-segment, .int-output-segment').removeClass('active');

        ###
            Add gray background to |canvas|
            |canvas| is required and a Canvas HTML Object
        ###
        @addGrayBackgroundToCanvas = (canvas) ->
            ctx = canvas.getContext('2d');
            ctx.rect(0, 0, 280, 35);
            ctx.fillStyle = @utilities.zyanteFeaturedBackgroundColor;
            ctx.fill();

        @drawDiagram = (canvas, pts, color, clear=true, addBackground=false) ->
            if clear == true
                @clearDiagram(canvas);
            if addBackground == true
                @addGrayBackgroundToCanvas(canvas);
            ctx = canvas.getContext('2d');
            ctx.strokeStyle = color;
            @drawWave(ctx, pts);

        ###
            Draw all the diagrams given |shouldDrawAnswer| and |shouldHideCanvasBackground|.
            |shouldDrawAnswer| and |shouldHideCanvasBackground| are required and boolean.
        ###
        @drawDiagrams = (shouldDrawAnswer=false, shouldHideCanvasBackground=false) ->
            if @useLoadRegisterQuestions
                integerPts = [@activeQuestion.a0, @activeQuestion.a1, @activeQuestion.a2, @activeQuestion.a3];
                for diagram in @zip(@$inputDiagrams, [0 ... @$inputDiagrams.length])
                    if $(diagram[0]).find('.int-input-segment') && !$(diagram[0]).find('.int-input-segment').is(':hidden')
                        for segment in @zip($(diagram[0]).find('.int-input-segment'), [0 ... $(diagram[0]).find('.int-input-segment').length])
                            $(segment[0]).val(integerPts[diagram[1]][segment[1]]);
            canvases = ($(diagram).find('.diagram-canvas')[0] for diagram in @$inputDiagrams);
            pts = [@activeQuestion.a0, @activeQuestion.a1];
            if @useLoadRegisterQuestions
                pts.push(@activeQuestion.a2);
                pts.push(@activeQuestion.a3);
            if @getMode() == 'binary' || @useLoadRegisterQuestions
                for diagram in @zip(@$outputDiagrams, [0 ... @$outputDiagrams.length])
                    canvases.push($(diagram[0]).find('.diagram-canvas')[0]);
                    pts.push(@BValues[diagram[1]]);
            if shouldDrawAnswer
                for diagram in @$outputDiagrams
                    canvases.push($(diagram).find('.diagram-canvas')[0]);
                    pts.push(@activeQuestion.answer);

            self = @
            zippedCanvases = @zip(canvases, pts)
            zippedCanvases.forEach((canvas, index) ->
                colorToUse    = self.utilities.zyanteGray
                addBackground = false
                if (index >= (zippedCanvases.length - 2))
                    colorToUse    = self.utilities.zyanteDarkBlue
                    addBackground = not shouldHideCanvasBackground
                self.drawDiagram(canvas[0], canvas[1], colorToUse, true, addBackground);
            );

        @segmentClick = (event, $clickedOutput) ->
            if @toolIsActive
                if @getMode() == 'integer'
                    return;
                sender = (event && event.target) || (window.event && window.event.srcElement);
                time = parseInt($(event.target).attr('index'));
                outIndex = $clickedOutput.index('.output-container');
                @BValues[outIndex][time] = if @BValues[outIndex][time] == 0 then 1 else 0
                $canvas = $(@$outputDiagrams[outIndex]).find('.diagram-canvas')[0];
                @clearDiagram($canvas)
                @drawDiagram($canvas , @BValues[outIndex], @utilities.zyanteDarkBlue, true, true);

        @integerChange = (event, $clickedOutput) ->
            if @toolIsActive
                if @getMode() == 'binary'
                    return;
                sender = (event && event.target) || (window.event && window.event.srcElement);
                time = parseInt($(event.target).attr('index'));
                outIndex = $clickedOutput.index('.output-container');
                @BValues[outIndex][time] = parseInt(sender.value);

        @nextLevel = (currentQuestion) ->
            if currentQuestion == 4 || @useLoadRegisterQuestions || @useHLSMQuestions
                @setMode('integer');

            @activeQuestion = @chooseEqn(currentQuestion);
            while (@activeQuestion.answer.every((answerBit) -> answerBit == 0))
                @activeQuestion = @chooseEqn(currentQuestion);

            # useSRQuestions and useDQuestions have their own setSolution elsewhere.
            if (!@useSRQuestions && !@useDQuestions)
                @parentResource.setSolution(@activeQuestion.answer.join(' '));

            if (@useGateNotation || @useSRDQuestions || @useLoadRegisterQuestions || @useHLSMQuestions || @useSRQuestions || @useDQuestions)
                gateIsHidden = $(@activeQuestion.gate).is(':hidden');
                self = this;
                if gateIsHidden
                    $('#' + @id + ' .gate-image-container').not(':hidden').fadeOut('fast', () ->
                        $(self.activeQuestion.gate).parent().fadeIn('fast');
                    );
                if !@useLoadRegisterQuestions
                    $('#equation-' + @id).text('');
                if (@useSRDQuestions || @useSRQuestions || @useDQuestions)
                    if ('#sr-' + @id) == @activeQuestion.gate
                        @variableA0Name = 's';
                        @variableA1Name = 'r';
                    else if ('#d-' + @id) == @activeQuestion.gate
                        @variableA0Name = 'd';
                        @variableA1Name = 'e';

                $('#a0-label-' + @id).text(@variableA0Name);
                $('#a1-label-' + @id).text(@variableA1Name);
                $('#a2-label-' + @id).text(@variableA2Name);
                $('#a3-label-' + @id).text(@variableA3Name);

            @resetUserEnteredBValues();
            $('#' + @id + ' .int-output-segment').val('0').removeClass('wrong-answer');
            $('#' + @id + ' .output-segment').css('background-color', '');
            @drawDiagrams();
            for diagram in @zip(@$outputDiagrams, [0 ... @$outputDiagrams.length])
                if diagram[1] > 0
                    $(diagram[0]).parent().hide();
            $(@$expectedAnswer).parent().show().css('visibility', 'hidden');

        @reset = () ->
            if @useLoadRegisterQuestions || @useHLSMQuestions
                @setMode('integer');
            else
                @setMode('binary');
            @binary_questions = @originalBinaryQuestions.slice(0);
            @integer_questions = @originalIntegerQuestions.slice(0);
            @resetUserEnteredBValues();
            @activeQuestion = @chooseEqn(0);
            $('#' + @id + ' .gate-image-container').hide();
            if (@useGateNotation || @useSRDQuestions || @useLoadRegisterQuestions || @useHLSMQuestions || @useSRQuestions || @useDQuestions)
                $(@activeQuestion.gate).parent().show();
                if (@useSRDQuestions || @useSRQuestions || @useDQuestions)
                    if ('#sr-' + @id) == @activeQuestion.gate
                        @variableA0Name = 's';
                        @variableA1Name = 'r';
                    else if ('#d-' + @id) == @activeQuestion.gate
                        @variableA0Name = 'd';
                        @variableA1Name = 'e';
                $('#equation-' + @id).text('');
                $('#a0-label-' + @id).text(@variableA0Name);
                $('#a1-label-' + @id).text(@variableA1Name);
                $('#a2-label-' + @id).text(@variableA2Name);
                $('#a3-label-' + @id).text(@variableA3Name);
            @drawDiagrams(true, true);
            @disableInteractiveElements();
            for diagram in @zip(@$outputDiagrams, [0 ... @$outputDiagrams.length])
                if diagram[1] > 0
                    $(diagram[0]).parent().hide();
            $(@$expectedAnswer).parent().show().css('visibility', 'hidden');

        @drawCorrectAnswer = () ->
            if @getMode() == 'binary'
                for diagram in @zip(@$outputDiagrams, [0 ... @$outputDiagrams.length])
                    @drawDiagram($(diagram[0]).find('.diagram-canvas')[0], @activeQuestion.answer, @utilities.zyanteMediumRed);
                    @drawDiagram($(diagram[0]).find('.diagram-canvas')[0], @BValues[diagram[1]], @utilities.zyanteDarkBlue, false);
            else if @getMode() == 'integer'
                for i in [0 ... @$outputDiagrams.length - 1]
                    for pair, ind in @zip(@BValues[i].slice(0, @BValues[i].length), @activeQuestion.answer.slice(0, @activeQuestion.answer.length))
                        userAnswer = pair[0]
                        expectedAnswer = pair[1]
                        if userAnswer != expectedAnswer
                            $box = $('#intb' + i + '-' + ind.toString() + '-' + @id);
                            $box.addClass('wrong-answer');
                        $($(@$expectedAnswer).find('.int-output-segment')[ind]).val(expectedAnswer.toString());
                $(@$expectedAnswer).parent().css('visibility', 'visible');
                $(@$expectedAnswer).parent().find('.output-label').text('Expected ' + @variableBName);
        `<%= grunt.file.read(hbs_output) %>`

timingDiagramExport = {
    create: () ->
        return new TimingDiagram()
    dependencies: `<%= grunt.file.read(dependencies) %>`
}
window.timingDiagramExport = timingDiagramExport

module.exports = timingDiagramExport
