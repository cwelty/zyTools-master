'use strict';

function zyIOTestVector() {
    this.name = '<%= grunt.option("tool") %>';

    /*
        Executes a list of test vectors on the user's tool, returns a promise that is resolved when all test vectors have been executed
        |question| required and an object containing these properties:
            * |inputStrings| required and an object containing properties that are the names of the inputs being tested
            * |outputStrings| required and an object containing properties that are the names of the outputs being tested
            * |hasDontCareValues| required and a boolean that is true if don't cares exist in the test vector
            * |correctPattern| required and a string containing the correct pattern on the outputs
            * |commands| required and a list of strings containing the test vector commands
        |toolToTest| required and an object containing these properties:
            * |prepareToExecute| required and a function that must return a promise whose resolve value is an object containing:
                * |noErrors| required and a boolean true if no errors were present when checking whether the simulation can execute
                * |errorMessage| required and a string empty if no errors otherwise contains the errorMessage
            * |initExecute| required and a function that is called to disallow user interaction with the answer they are submitting
            * |executeStep| required and a function that executes a single step in the tool, can be an empty function must return a string containing an errorMessage if any exists.
            * |cleanUp| required and a function executed at the end to put the tool back to neutral state
            * |inputs| required and a list of zyIO input objects
            * |outputs| required and a list of zyIO output objects
            * |inputUpdated| required and a function called after setting an input
        @return {Promise} Resolves after evaluating correctness and building an explanation.
    */
    this.run = function(question, toolToTest) {
        const resultData = {};

        resultData.inputStrings = question.inputStrings;
        resultData.outputStrings = question.outputStrings;
        resultData.inputs = [];
        for (var input in resultData.inputStrings) {
            resultData.inputs.push({ name: input, values: [] });
        }
        resultData.outputs = [];
        for (var output in resultData.outputStrings) {
            resultData.outputs.push({ name: output, values: [] });
        }
        resultData.correctPattern = question.correctPattern;
        resultData.hasDontCareValues = question.hasDontCareValues;
        var handlebarsTemplate = this[this.name]['results'];
        var promise = toolToTest.prepareToExecute();
        return new Ember.RSVP.Promise(function(resolve, reject) {
            promise.then(function(prepareResult) {
                var noErrors = prepareResult.noErrors;
                // No errors, time to simulate
                if (noErrors) {
                    toolToTest.initExecute();
                    processTestVector(toolToTest, '', false, true, resultData, question.commands, 0, resolve, handlebarsTemplate);
                }
                else {
                    cleanUp(toolToTest, resultData, false, true, prepareResult.errorMessage, resolve, handlebarsTemplate);
                }
            });
        });
    };

    /*
    Executes a test vector input/output pair, this will also execute the user tool. Once completed the next test vector is executed with a recursive call.
    When all test vector commands have been executed cleanUp is called.
        |toolToTest| required and an object containing these properties:
            * |prepareToExecute| required and a function that must return a promise whose resolve value is an object containing:
                * |noErrors| required and a boolean true if no errors were present when checking whether the simulation can execute
                * |errorMessage| required and a string empty if no errors otherwise contains the errorMessage
            * |initExecute| required and a function that is called to disallow user interaction with the answer they are submitting
            * |executeStep| required and a function that executes a single step in the tool, can be an empty function must return a string containing an errorMessage if any exists.
            * |cleanUp| required and a function executed at the end to put the tool back to neutral state
            * |inputs| required and a list of zyIO input objects
            * |outputs| required and a list of zyIO output objects
            * |inputUpdated| required and a function called after setting an input
        |outputPattern| is required and is a string -                   the current string of output values
        |couldNotExecute| is required and is a boolean -                true if user error occured that prevented execution
        |testPassed| is required and is a boolean -                     true if user answer is correct
        |resultData| is required and is an object -                     contains properties that are used to generated the table html
        |commands| is required and is a list of strings -               list of test vector commands
        |index| is required and is an integer -                         current index into commands list
        |resolve| is required and is a function -                       called when processing has finished
        |handlebarsTemplate| is required and is a handlebars template - template for generated table
    */
    function processTestVector(toolToTest, outputPattern, couldNotExecute, testPassed, resultData, commands, index, resolve, handlebarsTemplate) {
        // Base case, ends the recursion
        if (index >= commands.length) {
            cleanUp(toolToTest, resultData, testPassed, couldNotExecute, '', resolve, handlebarsTemplate);
            return;
        }

        // Empty command, just process the next one
        if (commands[index].trim().length === 0) {
            index++;
            processTestVector(toolToTest, outputPattern, couldNotExecute, testPassed, resultData, commands, index, resolve, handlebarsTemplate);
            return;
        }
        // Process input
        var newTime = 1;
        // Wait a specific amount of seconds or miliseconds: ex wait 5 s, wait 500 ms
        var reWait = /^(wait\s*([0-9]*)\s*((s)|(ms)))$/;
        // Change A by giving a hex value: ex. 0xFA
        var reAssign = /^(0x[a-f0-9][a-f0-9])$/;
        var reAssignInput = /^(([ef])\s*(0x[a-f0-9][a-f0-9]))$/;
        // Assert that B is a value in hex: ex assert 0x05
        var reAssert = /^(assert\s*(0b[0-1x]{8}))$/;
        var reAssertOutput = /^(assert\s*([yz])\s*([=\>\<!]+)\s*(0x[a-f0-9][a-f0-9]))$/;
        commands[index] = commands[index].replace('\n', '').trim();
        var matchedWait = commands[index].match(reWait);
        var matchedAssign = commands[index].match(reAssign);
        var matchedAssignInput = commands[index].match(reAssignInput);

        // Handles wait x (ms/s) commands
        if (matchedWait) {
            newTime = parseFloat(matchedWait[2]);
            if (matchedWait[3] == 's') {
                newTime = newTime * 1000;
            }
            index++;
            setTimeout(function() {
                processTestVector(toolToTest, outputPattern, couldNotExecute, testPassed, resultData, commands, index, resolve, handlebarsTemplate);
            }, newTime);
            return;
        }
        // Handles 0xXX commands
        else if (matchedAssign) {
            var value = parseInt(matchedAssign[1], 16);
            // Store |value| in |inputs|, bit by bit.
            for (var i = 0; i < toolToTest.inputs.length; i++) {
                toolToTest.inputs[i].setInput(value & (0x01 << i)) >> i;
            }
            index++;
            toolToTest.inputUpdated();
        }
        else if (matchedAssignInput) {
            var value = parseInt(matchedAssignInput[3], 16);
            var variableName = matchedAssignInput[2];
            // Supports two multi-bit outputs E and F
            switch (variableName) {
                case 'e':
                    toolToTest.inputs.E.setInput(value);
                    break;
                case 'f':
                    toolToTest.inputs.F.setInput(value);
                    break;
            }
            index++;
        }

        // Record values to be displayed in table
        toolToTest.inputs.forEach(function(value, i) {
            if (value.labelValue in resultData.inputStrings) {
                for (var j = 0; j < resultData.inputs.length; j++) {
                    if (resultData.inputs[j].name === value.labelValue) {
                        resultData.inputs[j].values.push(value.value);
                        break;
                    }
                }
            }
        });

        if (resultData.inputStrings.hasOwnProperty('E')) {
            for (var j = 0; j < resultData.inputs.length; j++) {
                if (resultData.inputs[j].name === 'E') {
                    resultData.inputs[j].values.push(toolToTest.inputs.E.value);
                    break;
                }
            }
        }
        var executionErrorMessage = '';

        // Execute tick
        executionErrorMessage = toolToTest.executeStep();
        if (executionErrorMessage) {
            couldNotExecute = true;
            testPassed = false;
            cleanUp(toolToTest, resultData, testPassed, couldNotExecute, executionErrorMessage, resolve, handlebarsTemplate);
            return;
        }
        var matchedAssert = commands[index].match(reAssert);
        var matchedAssertOutput = commands[index].match(reAssertOutput);

        // Verify output
        // Handles assert 0xXX commands, as defined in |reAssert|
        if (matchedAssert) {
            var bitString = matchedAssert[2].substring(2);
            var failedAssert = false;
            var bitValues = [ getBitFromBitString(bitString, 0), getBitFromBitString(bitString, 1), getBitFromBitString(bitString, 2), getBitFromBitString(bitString, 3),
                getBitFromBitString(bitString, 4), getBitFromBitString(bitString, 5), getBitFromBitString(bitString, 6), getBitFromBitString(bitString, 7)
            ];
            var errorMessage = index + ': Assert failed, ';
            for (var i = 0; i < toolToTest.outputs.length; i++) {
                if ((bitValues[i] != -1) && (toolToTest.outputs[i].value !== bitValues[i])) {
                    errorMessage += toolToTest.outputs[i].labelValue + ' != ' + bitValues[i];
                    failedAssert = true;
                }
            }

            if (failedAssert) {
                testPassed = false;
            }

            // Record values to be displayed in table
            toolToTest.outputs.forEach(function(value, i) {
                if (value.labelValue in resultData.outputStrings) {
                    outputPattern += '' + value.value;
                    for (var j = 0; j < resultData.outputs.length; j++) {
                        if (resultData.outputs[j].name === value.labelValue) {
                            resultData.outputs[j].values.push(value.value);
                            break;
                        }
                    }
                }
            });

            if ('B' in resultData.outputStrings) {
                var bValue = (toolToTest.outputs[7].value << 7) | (toolToTest.outputs[6].value << 6) | (toolToTest.outputs[5].value << 5) | (toolToTest.outputs[4].value << 4) | (toolToTest.outputs[3].value << 3) | (toolToTest.outputs[2].value << 2) | (toolToTest.outputs[1].value << 1) | toolToTest.outputs[0].value;
                outputPattern += '' + bValue;
                recordOutput(resultData.outputs, 'B', bValue);
            }
            outputPattern += ' ';
            index++;
        }
        // Handles assert Y/Z 0xXX commands, as defined in reAssertOutput
        else if (matchedAssertOutput) {
            var errorMessage;
            var value = parseInt(matchedAssertOutput[4], 16);
            var variableName = matchedAssertOutput[2];
            var operation = matchedAssertOutput[3];
            // Supports two multi-bit outputs Y and Z
            var Y = toolToTest.outputs.Y.value;
            var Z = toolToTest.outputs.Z.value;
            switch (variableName) {
                case 'y':
                    var assertResult = assertOutputCorrectness(operation, 'Y', Y, value);
                    testPassed = assertResult.testPassed;
                    errorMessage = assertResult.errorMessage;
                    break;
                case 'z':
                    var assertResult = assertOutputCorrectness(operation, 'Z', Z, value);
                    testPassed = assertResult.testPassed;
                    errorMessage = assertResult.errorMessage;
                    break;
            }

            // Record values to be displayed in table
            if ('Y' in resultData.outputStrings) {
                outputPattern += '' + Y;
                recordOutput(resultData.outputs, 'Y', Y);
            }

            if ('Z' in resultData.outputStrings) {
                outputPattern += '' + Z;
                recordOutput(resultData.outputs, 'Z', Z);
            }
            outputPattern += ' ';
            index++;
        }
        return processTestVector(toolToTest, outputPattern, couldNotExecute, testPassed, resultData, commands, index, resolve, handlebarsTemplate);
    }

    /*
        Helper that checks if an output passes an assertion, returns an object with the updated |errorMessage| and |testPassed|
        |operation| is required and is a string
        |outputName| is required and is a string
        |outputValue| is required and is an integer, the current value
        |assertValue| is required and is an integer
    */
    function assertOutputCorrectness(operation, outputName, outputValue, assertValue) {
        var errorMessage = '';
        var testPassed = true;
        switch (operation) {
            case '>=':
                if (outputValue < assertValue) {
                    errorMessage = 'Assert failed, ' + outputName + ' is not >= ' + assertValue;
                    testPassed = false;
                }
                break;
            case '<=':
                if (outputValue > assertValue) {
                    errorMessage = 'Assert failed, ' + outputName + ' is not <= ' + assertValue;
                    testPassed = false;
                }
                break;
            case '=':
                if (outputValue != assertValue) {
                    errorMessage = 'Assert failed, ' + outputName + ' != ' + assertValue;
                    testPassed = false;
                }
                break;
            case '!=':
                if (outputValue == assertValue) {
                    errorMessage = 'Assert failed, ' + outputName + ' == ' + assertValue;
                    testPassed = false;
                }
                break;
            case '<':
                if (outputValue >= assertValue) {
                    errorMessage = 'Assert failed, ' + outputName + ' >= ' + assertValue;
                    testPassed = false;
                }
                break;
            case '>':
                if (outputValue > assertValue) {
                    errorMessage = 'Assert failed, ' + outputName + ' <= ' + assertValue;
                    testPassed = false;
                }
                break;
        }
        return { errorMessage: errorMessage, testPassed: testPassed };
    }

    /*
        Helper that adds the current value of the output variable to the output array
        |outputName| is required and is a string
        |outputValue| is required and is an integer, the current value
        |outputArray| is required and is a list, the array of inputs to be updated
    */
    function recordOutput(outputArray, outputName, outputValue) {
        for (var j = 0; j < outputArray.length; j++) {
            if (outputArray[j].name === outputName) {
                outputArray[j].values.push(outputValue);
                break;
            }
        }
    }

    /*
        Cleans up the IO objects, generates an error message and resolves the promise started by the user facing function.
        |toolToTest| is required and is an object -                     described above
        |couldNotExecute| is required and is a boolean -                true if user error occured that prevented execution
        |testPassed| is required and is a boolean -                     true if user answer is correct
        |resultData| is required and is an object -                     contains properties that are used to generated the table html
        |userErrorMessage| is required and is a string -                error message generated by user tool
        |resolve| is required and is a function -                       called when processing has finished
        |handlebarsTemplate| is required and is a handlebars template - template for generated table
    */
    function cleanUp(toolToTest, resultData, testPassed, couldNotExecute, userErrorMessage, resolve, handlebarsTemplate) {
        var errorMessage;
        if (!testPassed && !couldNotExecute) {
            errorMessage = 'See table.';
        }
        else {
            userErrorMessage = userErrorMessage.trim();
            if (userErrorMessage[userErrorMessage.length - 1] === '.') {
                userErrorMessage = userErrorMessage.substr(0, userErrorMessage.length - 1);
            }
            errorMessage = userErrorMessage + '.';
        }

        var tableHTML = generateResultHTML(resultData, handlebarsTemplate);

        for (var i = 0; i < toolToTest.inputs.length; i++) {
            toolToTest.inputs[i].setInput(0);
        }

        for (var i = 0; i < toolToTest.outputs.length; i++) {
            toolToTest.outputs[i].setOutput(0);
        }

        toolToTest.cleanUp();
        resolve({
            errorMessage: errorMessage,
            passed: testPassed,
            couldNotExecute: couldNotExecute,
            resultHTML: tableHTML,
            resultData: resultData
        });
    }

    /**
        Generates the html describing the results, returns a string of html.
        @method generateResultHTML
        @param {Object} resultData An object which has properties that are defined in the results.hbs file.
        @param {Function} handlebarsTemplate The handlebars template that renders the results.
        @return {String} The results HTML.
    */
    function generateResultHTML(resultData, handlebarsTemplate) {
        const expectedOutputs = resultData.correctPattern.split(' ');

        resultData.outputs.reverse();

        const outputName = resultData.outputs.map(output => output.name)
                                             .join('');
        const outputArrays = resultData.outputs.map(output => output.values);

        /*
            Zip together output arrays, such that index-0's are in same array, index-1's are in same array, etc.
            Ex: [[1, 2], [3, 4]] => [[1, 3], [2, 4]]
        */
        const zippedOutputArrays = outputArrays[0].map((value, index) =>
            outputArrays.map(array => array[index])
        );

        const actualOutputs = zippedOutputArrays.map(array => array.join(''));

        return handlebarsTemplate({
            outputName,
            actualOutputs,
            hasInput: Object.keys(resultData.inputStrings).length > 0,
            inputs: resultData.inputs,
            expectedOutputs,
            hasDontCareValues: resultData.hasDontCareValues,
        });
    }

    /*
        Helper takes a |bitString| that is an 8 character string of 0s 1s and Xs and returns the corresponding value at |bitIndex|
        |bitString| is required and is a string
        |bitIndex| is required and is an integer
    */
    function getBitFromBitString(bitString, bitIndex) {
        if (bitString[bitString.length - 1 - bitIndex].toLowerCase() === 'x') {
            return -1;
        }
        else {
            return parseInt(bitString[bitString.length - 1 - bitIndex]);
        }
    }

    <%= grunt.file.read(hbs_output) %>
}

module.exports = new zyIOTestVector();
