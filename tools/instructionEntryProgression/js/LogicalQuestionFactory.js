/*
    LogicalQuestionFactory inherits QuestionFactory.
    See QuestionFactory for details.
*/
function LogicalQuestionFactory() {
    QuestionFactory.prototype.constructor.apply(this, arguments);
    this.numberOfQuestions = 5;
    this.printRadix = 2;
}

// Build the LogicalQuestionFactory prototype.
function buildLogicalQuestionFactoryPrototype() {
    LogicalQuestionFactory.prototype = new QuestionFactory();
    LogicalQuestionFactory.prototype.constructor = LogicalQuestionFactory;

    /*
        Make a Question based on |questionNumber|.
        |questionNumber| is required and a number.
    */
    LogicalQuestionFactory.prototype.make = function(questionNumber) {
        var questionStem = '';
        var instructions = this._instructionSetSDK.createInstructions();
        var registers = this._instructionSetSDK.createRegisters();
        var solutionInstructions = this._instructionSetSDK.createInstructions();
        var expectedRegisterNames = [];
        var instructionOptions = [];
        var registerOptions = [];

        // Choose registers for question.
        const numberOfRegisters = 5;
        const chosenRegisterNames = this._chooseNRegisterNames(numberOfRegisters);

        // The possible masks are a string of 1s starting from the least-significant bit. Ex: 111
        var mask = this._utilities.pickElementFromArray([ 7, 15, 31 ]);

        switch (questionNumber) {
            // $s1 = ($s2 >> 4) & 15
            case 0:
                var shiftAmount = this._utilities.pickNumberInRange(3, 5);

                questionStem = 'Compute: ' + chosenRegisterNames[0] + ' = (' + chosenRegisterNames[1] + ' >> ' + shiftAmount + ') & ' + mask;

                instructions.push(
                    this._instructionSetSDK.createShiftRightInstruction(chosenRegisterNames[0], chosenRegisterNames[0], 0),
                    this._instructionSetSDK.createAndImmediateInstruction(chosenRegisterNames[0], chosenRegisterNames[0], 0)
                );

                /*
                    The second register stores the binary value: 1111110100000 (decimal value: 8096),
                    which may be prefixed with additional 1s.
                */
                var potentialRegisterValues = [ 8096 ];
                var firstPower = 13;
                var lastPower = 17;
                for (var i = firstPower; i <= lastPower; ++i) {
                    // Prefix 1-bit by adding 2^i to previous element in |potentialRegisterValues|.
                    potentialRegisterValues.push(potentialRegisterValues[i - firstPower] + Math.pow(2, i));
                }
                var initialRegisterValue = this._utilities.pickElementFromArray(potentialRegisterValues);
                registers.lookupByRegisterName(chosenRegisterNames[1]).setValue(initialRegisterValue);

                registers.lookupByRegisterName(chosenRegisterNames[0]).setValue(0);
                registers.lookupByRegisterName(chosenRegisterNames[2]).setValue(0);

                solutionInstructions.push(
                    this._instructionSetSDK.createShiftRightInstruction(chosenRegisterNames[0], chosenRegisterNames[1], shiftAmount),
                    this._instructionSetSDK.createAndImmediateInstruction(chosenRegisterNames[0], chosenRegisterNames[0], mask)
                );

                expectedRegisterNames.push(chosenRegisterNames[0]);
                instructionOptions.push(this._getShiftRightOpCode(), this._getAndImmediateOpCode());
                registerOptions.push(chosenRegisterNames[0], chosenRegisterNames[1], chosenRegisterNames[2]);
                break;

            // $s1 = ($s1 | 15) | ($s2 & $s3)
            case 1:
                questionStem = 'Compute: ' + chosenRegisterNames[0] + ' = (' + chosenRegisterNames[0] + ' | ' + mask + ') | (' + chosenRegisterNames[1] + ' & ' + chosenRegisterNames[2] + ')';
                instructions.push(
                    this._instructionSetSDK.createAndInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0]),
                    this._instructionSetSDK.createAndInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0]),
                    this._instructionSetSDK.createAndInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0])
                );

                /*
                    Pick 3 register values: one small and two large. This guarantees the expected
                    register value is different than the initial register value.
                */
                var smallRegisterValue = this._utilities.pickNumberInRange(3, 63);
                var largeRegisterValues = this._utilities.pickNNumbersInRange(64, 127, 2);

                registers.lookupByRegisterName(chosenRegisterNames[0]).setValue(smallRegisterValue);
                registers.lookupByRegisterName(chosenRegisterNames[1]).setValue(largeRegisterValues[0]);
                registers.lookupByRegisterName(chosenRegisterNames[2]).setValue(largeRegisterValues[1]);
                registers.lookupByRegisterName(chosenRegisterNames[3]).setValue(0);
                registers.lookupByRegisterName(chosenRegisterNames[4]).setValue(0);

                solutionInstructions.push(
                    this._instructionSetSDK.createOrImmediateInstruction(chosenRegisterNames[0], chosenRegisterNames[0], mask),
                    this._instructionSetSDK.createAndInstruction(chosenRegisterNames[1], chosenRegisterNames[1], chosenRegisterNames[2]),
                    this._instructionSetSDK.createOrInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[1])
                );

                expectedRegisterNames.push(chosenRegisterNames[0]);
                instructionOptions.push(this._getAndOpCode(), this._getOrOpCode(), this._getOrImmediateOpCode());
                registerOptions.push(chosenRegisterNames[0], chosenRegisterNames[1], chosenRegisterNames[2], chosenRegisterNames[3], chosenRegisterNames[4]);
                break;

            // Divide $s2 by 8, store result in $s1
            case 2:
                var bitsToShift = this._utilities.pickNumberInRange(2, 5);
                var amountToDivide = Math.pow(2, bitsToShift);
                questionStem = 'Goal: Divide ' + chosenRegisterNames[1] + ' by ' + amountToDivide + ', store result in ' + chosenRegisterNames[0];

                instructions.push(this._instructionSetSDK.createAndInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0]));

                registers.lookupByRegisterName(chosenRegisterNames[0]).setValue(0);
                registers.lookupByRegisterName(chosenRegisterNames[1]).setValue(amountToDivide * this._utilities.pickNumberInRange(2, 5));

                solutionInstructions.push(this._instructionSetSDK.createShiftRightInstruction(chosenRegisterNames[0], chosenRegisterNames[1], bitsToShift));

                expectedRegisterNames.push(chosenRegisterNames[0]);
                instructionOptions.push(this._getAndOpCode(), this._getShiftRightOpCode(), this._getShiftLeftOpCode());
                registerOptions.push(chosenRegisterNames[0], chosenRegisterNames[1]);
                break;

            // Isolate bits 7..4 in $s1 to be right-most 4 bits of $s2, with other $s2 bits set to 0.
            case 3:
                var numberOfBitsToIsolate = this._utilities.pickNumberInRange(3, 5);

                questionStem = 'Goal: Isolate bits ' + ((2 * numberOfBitsToIsolate) - 1) + '..'
                             + numberOfBitsToIsolate + ' in ' + chosenRegisterNames[0]
                             + ' to be right-most ' + numberOfBitsToIsolate + ' bits of '
                             + chosenRegisterNames[1] + ', and set other ' + chosenRegisterNames[1]
                             + ' bits to 0';

                instructions.push(
                    this._instructionSetSDK.createAndImmediateInstruction(chosenRegisterNames[0], chosenRegisterNames[0], 0),
                    this._instructionSetSDK.createAndImmediateInstruction(chosenRegisterNames[0], chosenRegisterNames[0], 0)
                );

                var largestValue = Math.pow(2, numberOfBitsToIsolate) - 1;
                var firstRegisterValue =
                    (this._utilities.pickNumberInRange(1, largestValue) << (2 * numberOfBitsToIsolate)) +
                    (this._utilities.pickNumberInRange(1, largestValue) << numberOfBitsToIsolate) +
                     this._utilities.pickNumberInRange(1, largestValue);
                registers.lookupByRegisterName(chosenRegisterNames[0]).setValue(firstRegisterValue);
                registers.lookupByRegisterName(chosenRegisterNames[1]).setValue(0);
                registers.lookupByRegisterName(chosenRegisterNames[2]).setValue(0);

                solutionInstructions.push(
                    this._instructionSetSDK.createShiftRightInstruction(chosenRegisterNames[0], chosenRegisterNames[0], numberOfBitsToIsolate),
                    this._instructionSetSDK.createAndImmediateInstruction(chosenRegisterNames[1], chosenRegisterNames[0], largestValue)
                );

                expectedRegisterNames.push(chosenRegisterNames[1]);
                instructionOptions.push(this._getAndImmediateOpCode(), this._getShiftRightOpCode(), this._getShiftLeftOpCode());
                registerOptions.push(chosenRegisterNames[0], chosenRegisterNames[1], chosenRegisterNames[2]);
                break;

            // Copy bits 3..0 in $s0 to 7..4 in $s1. Bits 7..4 in $s1 are already set to 0.
            case 4:
                var numberOfBitsToIsolate = this._utilities.pickNumberInRange(3, 5);
                var shiftAmount = this._utilities.pickNumberInRange(3, 5);

                var newBits = (shiftAmount + numberOfBitsToIsolate - 1) + '..' + shiftAmount + ' in ' + chosenRegisterNames[1];
                questionStem = 'Goal: Copy bits ' + (numberOfBitsToIsolate - 1) + '..0 in '
                             + chosenRegisterNames[0] + ' to ' + newBits + '. Bits ' + newBits
                             + ' are already set to 0.';

                instructions.push(
                    this._instructionSetSDK.createOrInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0]),
                    this._instructionSetSDK.createOrInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0]),
                    this._instructionSetSDK.createOrInstruction(chosenRegisterNames[0], chosenRegisterNames[0], chosenRegisterNames[0])
                );

                /*
                    Source register has 1s for right-most |numberOfBitsToIsolate| bits.
                    Ex: if |instructionEntryProgression| is 3, then register's right-most bits are 111.
                */
                var firstRegisterValue = Math.pow(2, numberOfBitsToIsolate) - 1;
                registers.lookupByRegisterName(chosenRegisterNames[0]).setValue(firstRegisterValue);

                // Destination register has value in range of 3 - (2^shiftAmount - 1)
                var secondRegisterValue = this._utilities.pickNumberInRange(3, (Math.pow(2, shiftAmount) - 1));
                registers.lookupByRegisterName(chosenRegisterNames[1]).setValue(secondRegisterValue);
                registers.lookupByRegisterName(chosenRegisterNames[2]).setValue(0);

                solutionInstructions.push(
                    this._instructionSetSDK.createAndImmediateInstruction(chosenRegisterNames[2], chosenRegisterNames[0], firstRegisterValue),
                    this._instructionSetSDK.createShiftLeftInstruction(chosenRegisterNames[2], chosenRegisterNames[2], shiftAmount),
                    this._instructionSetSDK.createOrInstruction(chosenRegisterNames[1], chosenRegisterNames[1], chosenRegisterNames[2])
                );

                expectedRegisterNames.push(chosenRegisterNames[1]);
                instructionOptions.push(this._getOrOpCode(), this._getAndImmediateOpCode(), this._getShiftRightOpCode(), this._getShiftLeftOpCode());
                registerOptions.push(chosenRegisterNames[0], chosenRegisterNames[1], chosenRegisterNames[2]);
                break;
        }

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
}
