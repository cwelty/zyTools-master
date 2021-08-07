'use strict';

/* exported ArraysQuestionFactory */
/* global QuestionFactory, Question */

/**
    Generate questions to test converting C arrays to assembly.
    @class ArraysQuestionFactory
    @extends QuestionFactory
*/
class ArraysQuestionFactory extends QuestionFactory {

    /**
        @constructor
    */
    constructor(...args) {
        super(...args);
        this.numberOfQuestions = 5;
        this.useTextNotInput = true;
    }

    /**
        Make a Question based on the level number.
        @method make
        @param {Integer} levelNumber The level to make a question for.
        @return {Question} The question for the given level number.
    */
    make(levelNumber) {
        let code = '';
        let questionStemStart = 'Convert the C to assembly.';
        const disabledInstructions = [];
        const labelOptions = [];
        const registerOptions = [ '$zero', '$t0', '$t1' ];
        const instructionOptions = [ this._getAddImmediateOpCode(), this._getStoreRegisterOpCode() ];
        const expectedMemoryAddresses = [];
        const labels = this._instructionSetSDK.createLabels();
        const registers = this._instructionSetSDK.createRegisters();
        const memory = this._instructionSetSDK.createMemory();
        const instructions = this._instructionSetSDK.createInstructions();
        const solutionInstructions = this._instructionSetSDK.createInstructions();

        registers.lookupByRegisterName('$zero');

        const baseAddresses = [ 5000, 5008, 5016, 5024, 5032, 5040 ]; // eslint-disable-line no-magic-numbers
        const baseAddressLocations = [ 7040, 7048, 7056, 7064, 7072, 7080 ]; // eslint-disable-line no-magic-numbers
        const bytesToNextAddress = memory.numberOfBytesInWord;

        switch (levelNumber) {

            /*
                Convert the C to assembly. x's base address is 5000. Store x's base address at DM[7040].
                int x[4];

                addi $t0, $zero, 7040 # User writes
                addi $t1, $zero, 5000 # User writes
                sw $t1, 0($t0) # User writes
            */
            case 0: {
                const memoryAddress1 = this._utilities.pickElementFromArray(baseAddresses);
                const memoryAddress2 = this._utilities.pickElementFromArray(baseAddressLocations);

                questionStemStart += ` x's base address is ${memoryAddress1}. Store x's base address at DM[${memoryAddress2}].`;
                code = 'int x[4];';
                expectedMemoryAddresses.push(memoryAddress2);
                registers.lookupByRegisterName('$t0');
                registers.lookupByRegisterName('$t1');
                memory.lookupWord(memoryAddress1);
                memory.lookupWord(memoryAddress2);
                instructions.push(
                    this._makeAddImmediateInstruction('$t0', '$zero', 0),
                    this._makeAddImmediateInstruction('$t0', '$zero', 0),
                    this._makeAddImmediateInstruction('$t0', '$zero', 0)
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction('$t0', '$zero', memoryAddress2),
                    this._makeAddImmediateInstruction('$t1', '$zero', memoryAddress1),
                    this._makeStoreRegisterNoOffsetInstruction('$t1', '$t0')
                );
                break;
            }

            /*
                Convert the C to assembly. y's base address is stored at DM[7040].
                y[1] = 10;

                addi $t0, $zero, 7040
                lw $t1, 0($t0)        # User writes
                addi $t3, $zero, 10
                addi $t2, $t1, 4      # User writes
                sw $t3, 0($t2)
            */
            case 1:

            /*
                Convert the C to assembly. y's base address is stored at DM[7040].
                y[1] = 10;
                y[2] = 15;

                addi $t0, $zero, 7040
                lw $t1, 0($t0) # User writes
                addi $t3, $zero, 10
                addi $t2, $t1, 4 # User writes
                sw $t3, 0($t2)
                addi $t3, $zero, 15
                addi $t2, $t1, 8 # User writes
                sw $t3, 0($t2)
            */
            case 2: { // eslint-disable-line no-magic-numbers

                // Randomize the array indices.
                const firstIndex = this._utilities.pickElementFromArray([ 1, 2, 3, 4 ]); // eslint-disable-line no-magic-numbers
                const secondIndex = firstIndex + 1;
                const baseAddressLocation = baseAddressLocations[0];
                const firstValue = 10;
                const secondValue = 15;

                questionStemStart += ` y's base address is in DM[${baseAddressLocation}].`;
                code = `y[${firstIndex}] = ${firstValue};`;
                if (levelNumber === 2) { // eslint-disable-line no-magic-numbers
                    code += `\ny[${secondIndex}] = ${secondValue};`;
                }

                // Setup the registers.
                registers.lookupByRegisterName('$t0');
                registers.lookupByRegisterName('$t1');
                registers.lookupByRegisterName('$t2');
                registers.lookupByRegisterName('$t3');
                registerOptions.push('$t2', '$t3');

                // Build the memory addresses and values.
                const baseAddress = baseAddresses[0];
                const firstAddressOffset = firstIndex * bytesToNextAddress;
                const firstAddress = baseAddress + firstAddressOffset;
                const secondAddressOffset = secondIndex * bytesToNextAddress;
                const secondAddress = baseAddress + secondAddressOffset;

                expectedMemoryAddresses.push(firstAddress);
                if (levelNumber === 2) { // eslint-disable-line no-magic-numbers
                    expectedMemoryAddresses.push(secondAddress);
                }
                memory.lookupWord(firstAddress);
                if (levelNumber === 2) { // eslint-disable-line no-magic-numbers
                    memory.lookupWord(secondAddress);
                }
                memory.lookupWord(baseAddressLocation).setValue(baseAddress);

                // Build the instructions.
                instructionOptions.push(this._getLoadRegisterOpCode());
                disabledInstructions.push(0, 2, 4); // eslint-disable-line no-magic-numbers
                if (levelNumber === 2) { // eslint-disable-line no-magic-numbers
                    disabledInstructions.push(5, 7); // eslint-disable-line no-magic-numbers
                }
                instructions.push(
                    this._makeAddImmediateInstruction('$t0', '$zero', baseAddressLocation),
                    this._makeLoadRegisterNoOffsetInstruction('$t0', '$t0'),
                    this._makeAddImmediateInstruction('$t3', '$zero', firstValue),
                    this._makeAddImmediateInstruction('$t1', '$t1', 0),
                    this._makeStoreRegisterNoOffsetInstruction('$t3', '$t2')
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction('$t0', '$zero', baseAddressLocation),
                    this._makeLoadRegisterNoOffsetInstruction('$t1', '$t0'),
                    this._makeAddImmediateInstruction('$t3', '$zero', firstValue),
                    this._makeAddImmediateInstruction('$t2', '$t1', firstAddressOffset),
                    this._makeStoreRegisterNoOffsetInstruction('$t3', '$t2')
                );
                if (levelNumber === 2) { // eslint-disable-line no-magic-numbers
                    instructions.push(
                        this._makeAddImmediateInstruction('$t3', '$zero', secondValue),
                        this._makeAddImmediateInstruction('$t1', '$t1', 0),
                        this._makeStoreRegisterNoOffsetInstruction('$t3', '$t2')
                    );
                    solutionInstructions.push(
                        this._makeAddImmediateInstruction('$t3', '$zero', secondValue),
                        this._makeAddImmediateInstruction('$t2', '$t1', secondAddressOffset),
                        this._makeStoreRegisterNoOffsetInstruction('$t3', '$t2')
                    );
                }
                break;
            }

            /*
                Convert the C to assembly. y's base address is stored at DM[7040].
                y[1] = y[2];

                addi $t0, $zero, 7040
                lw $t1, 0($t0)   # User writes
                addi $t2, $t1, 8 # User writes
                lw $t3, 0($t2)
                addi $t2, $t1, 4 # User writes
                sw $t3, 0($t2)
            */
            case 3: { // eslint-disable-line no-magic-numbers

                // Randomly pick two indices.
                const numIndices = 2;
                const indices = this._utilities.pickNElementsFromArray([ 1, 2, 3, 4, 5 ], numIndices); // eslint-disable-line no-magic-numbers
                const firstIndex = indices[0];
                const secondIndex = indices[1];
                const baseAddressLocation = baseAddressLocations[0];

                questionStemStart += ` y's base address is in DM[${baseAddressLocation}].`;
                code = `y[${firstIndex}] = y[${secondIndex}];`;

                // Setup the registers.
                registers.lookupByRegisterName('$t0');
                registers.lookupByRegisterName('$t1');
                registers.lookupByRegisterName('$t2');
                registers.lookupByRegisterName('$t3');
                registerOptions.push('$t2', '$t3');

                // Build the memory addresses and values.
                const baseAddress = baseAddresses[0];
                const firstAddressOffset = firstIndex * bytesToNextAddress;
                const firstAddress = baseAddress + firstAddressOffset;
                const secondAddressOffset = secondIndex * bytesToNextAddress;
                const secondAddress = baseAddress + secondAddressOffset;
                const secondAddressValue = 99;

                expectedMemoryAddresses.push(firstAddress);
                memory.lookupWord(firstAddress);
                memory.lookupWord(secondAddress).setValue(secondAddressValue);
                memory.lookupWord(baseAddressLocation).setValue(baseAddress);

                // Build the instructions.
                instructionOptions.push(this._getLoadRegisterOpCode());
                disabledInstructions.push(0, 3, 5); // eslint-disable-line no-magic-numbers
                instructions.push(
                    this._makeAddImmediateInstruction('$t0', '$zero', baseAddressLocation),
                    this._makeAddImmediateInstruction('$t1', '$t1', 0),
                    this._makeAddImmediateInstruction('$t1', '$t1', 0),
                    this._makeLoadRegisterNoOffsetInstruction('$t3', '$t2'),
                    this._makeAddImmediateInstruction('$t1', '$t1', 0),
                    this._makeStoreRegisterNoOffsetInstruction('$t3', '$t2')
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction('$t0', '$zero', baseAddressLocation),
                    this._makeLoadRegisterNoOffsetInstruction('$t1', '$t0'),
                    this._makeAddImmediateInstruction('$t2', '$t1', secondAddressOffset),
                    this._makeLoadRegisterNoOffsetInstruction('$t3', '$t2'),
                    this._makeAddImmediateInstruction('$t2', '$t1', firstAddressOffset),
                    this._makeStoreRegisterNoOffsetInstruction('$t3', '$t2')
                );

                break;
            }

            /*
                Convert the C to assembly.
                i = 0;
                while (i <= 6) {
                   x[i] = i * 5;
                   i = i + 1;
                }

                    addi $t4, $zero, 0
                While:
                    bgt $t4, $t1, After
                    mul $t5, $t4, $t2   # User writes
                    add $t5, $t0, $t5   # User writes
                    mul $t6, $t4, $t3   # User writes
                    sw $t6, 0($t5)      # User writes
                    addi $t4, $t4, 1
                    j While
                After:
            */
            case 4: { // eslint-disable-line no-magic-numbers
                const numberOfOperations = 1;
                const operations = this._chooseNArithmeticOperations(numberOfOperations);
                const operation = operations[0];
                const baseAddress = baseAddresses[0];
                const startValue = 0;
                const lastValue = 6;
                const indexOperationValue = 5;

                questionStemStart += ` y's base address is in $t0. Variable i is in $t4.`;
                code = `i = ${startValue};
while (i <= ${lastValue}) {
    y[i] = i ${operation.symbol} ${indexOperationValue};
    i = i + 1;
}`;
                if (operation.opcode === this._getSubtractOpCode()) {
                    instructionOptions.push(this._getSubtractOpCode());
                }
                disabledInstructions.push(0, 1, 5, 6, 7); // eslint-disable-line no-magic-numbers
                labelOptions.push('While', 'After');
                registerOptions.push('$t2', '$t3', '$t4', '$t5', '$t6');
                instructionOptions.push('bgt', 'mul', this._getAddOpCode(), 'j');

                const numberOfIterations = lastValue - startValue + 1;
                const memoryAddresses = this._utilities.createArrayOfSizeN(numberOfIterations)
                                                    .map((value, index) => baseAddress + (index * bytesToNextAddress));

                expectedMemoryAddresses.push(...memoryAddresses);
                labels.addLabel('While', 1);
                labels.addLabel('After', 12); // eslint-disable-line no-magic-numbers
                registers.lookupByRegisterName('$t0').setValue(baseAddress);
                registers.lookupByRegisterName('$t1').setValue(lastValue);
                registers.lookupByRegisterName('$t2').setValue(bytesToNextAddress);
                registers.lookupByRegisterName('$t3').setValue(indexOperationValue);
                registers.lookupByRegisterName('$t4');
                registers.lookupByRegisterName('$t5');
                registers.lookupByRegisterName('$t6');
                memoryAddresses.forEach(memoryAddress => memory.lookupWord(memoryAddress));
                instructions.push(
                    this._makeAddImmediateInstruction('$t4', '$zero', 0),
                    this._instructionSetSDK.createBranchIfGreaterInstruction('$t4', '$t1', 'After'),
                    this._makeAddInstruction('$t5', '$t5', '$t5'),
                    this._makeAddInstruction('$t5', '$t5', '$t5'),
                    this._makeAddInstruction('$t5', '$t5', '$t5'),
                    this._makeStoreRegisterNoOffsetInstruction('$t6', '$t5'),
                    this._makeAddImmediateInstruction('$t4', '$t4', 1),
                    this._instructionSetSDK.createJumpInstruction('While')
                );
                solutionInstructions.push(
                    this._makeAddImmediateInstruction('$t4', '$zero', 0),
                    this._instructionSetSDK.createBranchIfGreaterInstruction('$t4', '$t1', 'After'),
                    this._makeMulInstruction('$t5', '$t4', '$t2'),
                    this._makeAddInstruction('$t5', '$t0', '$t5'),
                    operation.instruction.call(this, '$t6', '$t4', '$t3'),
                    this._makeStoreRegisterNoOffsetInstruction('$t6', '$t5'),
                    this._makeAddImmediateInstruction('$t4', '$t4', 1),
                    this._instructionSetSDK.createJumpInstruction('While')
                );
                break;
            }

            default:
                throw new Error(`Level not supported: ${levelNumber}`);
        }

        instructionOptions.sort();
        registerOptions.sort();

        return new Question(
            this._makeQuestionStemFromStemStartAndCode(questionStemStart, code),
            instructions,
            labels,
            registers,
            memory,
            solutionInstructions,

            // expectedRegisterNames not used
            [],
            expectedMemoryAddresses,

            // registerBaseAddresses not used
            [],
            instructionOptions,
            labelOptions,
            registerOptions,
            disabledInstructions,
            this.useTextNotInput
        );
    }
}
