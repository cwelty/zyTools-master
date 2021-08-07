/*
    AddSubQuestionFactory inherits QuestionFactory.
    See QuestionFactory for details.
*/
function AddSubQuestionFactory() {
    QuestionFactory.prototype.constructor.apply(this, arguments);
    this.numberOfQuestions = 5;
}

// Build the AddSubQuestionFactory prototype.
function buildAddSubQuestionFactoryPrototype() {
    AddSubQuestionFactory.prototype = new QuestionFactory();
    AddSubQuestionFactory.prototype.constructor = AddSubQuestionFactory;

    /*
        Make a Question based on |questionNumber|.
        |questionNumber| is required and a number.
    */
    AddSubQuestionFactory.prototype.make = function(questionNumber) {
        var questionStem = 'Compute: ';
        var instructions = this._instructionSetSDK.createInstructions();
        var registers = this._instructionSetSDK.createRegisters();
        var solutionInstructions = this._instructionSetSDK.createInstructions();
        var instructionOptions = [ this._getAddOpCode() ];
        var numberOfRegistersToSet = 0;

        switch (questionNumber) {
            // $s1 = $s2 + $s3
            case 0:
                var chosenRegisters = this._chooseRegisterNamesAndValues(3);

                numberOfRegistersToSet = 3;

                questionStem += chosenRegisters[0].name + ' = ' + chosenRegisters[1].name + ' + ' + chosenRegisters[2].name;

                instructions.push(this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name));

                solutionInstructions.push(this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[1].name, chosenRegisters[2].name));
                break;

            // $s1 = $s2 + $s3 + $s4
            case 1:
                var chosenRegisters = this._chooseRegisterNamesAndValues(5);

                numberOfRegistersToSet = 4;

                questionStem += chosenRegisters[0].name + ' = ' + chosenRegisters[1].name + ' + ' + chosenRegisters[2].name + ' + ' + chosenRegisters[3].name;

                instructions.push(
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name)
                );

                solutionInstructions.push(
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[1].name, chosenRegisters[2].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[3].name)
                );
                break;

            // $s1 = $s2 + ($s3 - $s4)
            case 2:
                var chosenRegisters = this._chooseRegisterNamesAndValues(5);

                numberOfRegistersToSet = 4;

                questionStem += chosenRegisters[0].name + ' = ' + chosenRegisters[1].name + ' + (' + chosenRegisters[2].name + ' - ' + chosenRegisters[3].name + ')';

                instructions.push(
                    this._instructionSetSDK.createSubtractInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name)
                );

                solutionInstructions.push(
                    this._instructionSetSDK.createSubtractInstruction(chosenRegisters[0].name, chosenRegisters[2].name, chosenRegisters[3].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[1].name)
                );

                instructionOptions.push(this._getSubtractOpCode());
                break;

            // $s1 = ($s2 + $s3) - ($s4 + $s5)
            case 3:
                var chosenRegisters = this._chooseRegisterNamesAndValues(7);

                numberOfRegistersToSet = 5;

                questionStem += chosenRegisters[0].name + ' = (' + chosenRegisters[1].name + ' + ' + chosenRegisters[2].name + ') - (' + chosenRegisters[3].name + ' + ' + chosenRegisters[4].name + ')';

                instructions.push(
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name),
                    this._instructionSetSDK.createSubtractInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name)
                );

                solutionInstructions.push(
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[1].name, chosenRegisters[2].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[5].name, chosenRegisters[3].name, chosenRegisters[4].name),
                    this._instructionSetSDK.createSubtractInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[5].name)
                );

                instructionOptions.push(this._getSubtractOpCode());
                break;

            /*
                a = b + c + d
                Assume: a is $s1, b is $s2, c is $s3, and d is $s4
            */
            case 4:
                var chosenRegisters = this._chooseRegisterNamesAndValues(5);

                numberOfRegistersToSet = 4;

                questionStem += 'a = b + c + d' + this._utilities.getNewline();
                questionStem += 'Assume: a is ' + chosenRegisters[0].name + ', b is ' + chosenRegisters[1].name + ', c is ' + chosenRegisters[2].name + ', d is ' + chosenRegisters[3].name;

                instructions.push(
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[0].name)
                );

                solutionInstructions.push(
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[1].name, chosenRegisters[2].name),
                    this._instructionSetSDK.createAddInstruction(chosenRegisters[0].name, chosenRegisters[0].name, chosenRegisters[3].name)
                );
                break;
        }

        // Set the first |numberOfRegistersToSet| of |chosenRegisters| in |registers|.
        chosenRegisters.forEach(function(chosenRegister, index) {
            if (index < numberOfRegistersToSet) {
                registers.lookupByRegisterName(chosenRegister.name).setValue(chosenRegister.value);
            }
        });

        var expectedRegisterNames = [ chosenRegisters[0].name ];
        var registerOptions = chosenRegisters.map(function(chosenRegister) {
            return chosenRegister.name;
        });

        return new Question(
            questionStem,
            instructions,
            this._instructionSetSDK.createLabels(),
            registers,
            this._instructionSetSDK.createMemory(),
            solutionInstructions,
            expectedRegisterNames,
            [], // expectedMemoryAddresses is not used
            [], // registerBaseAddresses is not used
            instructionOptions,
            [], // labelOptions not used
            registerOptions,
            [] // disabledInstructions is not used
        );
    };

    /*
        Return an array of |numberOfRegisters| RegisterNameAndValues.
        |numberOfRegisters| is required and a number.
    */
    AddSubQuestionFactory.prototype._chooseRegisterNamesAndValues = function(numberOfRegisters) {
        var chosenRegisterNames = this._chooseNRegisterNames(numberOfRegisters);

        // Choose register values, starting with 0 then followed by |numberOfRegisters|-1 unique values.
        var uniqueValues = this._utilities.pickNNumbersInRange(2, 50, (numberOfRegisters - 1));
        uniqueValues.sort(function(a, b) {
            return (a - b);
        }).reverse();
        var chosenRegisterValues = [ 0 ].concat(uniqueValues);

        // Return array of RegisterNameAndValue.
        return chosenRegisterNames.map(function(registerName, index) {
            return new RegisterNameAndValue(registerName, chosenRegisterValues[index]);
        });
    };
}
