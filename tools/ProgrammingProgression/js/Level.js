/* global Ember, ProgramFile, HandlebarsComplete */
/* exported Level */
'use strict';

/**
    A level.
    @class Level
*/
class Level {

    /**
        Initialize the Level
        @constructor
        @param {String} prompt The prompt of the level.
        @param {String} explanation The explanation to this level's answer.
        @param {String} solutionCode The solution to this level.
        @param {String} language The programming language of the code.
        @param {String} testCode The testing code for this level.
        @param {Object} parameters The parameters that randomize the level.
        @param {Object} parameters.level Contains the parameters that randomized this level.
        @param {Object} parameters.test Contains the parameters for the testing program.
        @param {Object} testBoilerplate The *Boilerplate.hbs handlebars template.
        @param {Array} testInput The input to send to the program for testing purposes. May be empty.
        @param {Array} files Array of {ProgramFile} objects. The different program files composing this level.
        @param {String} levelType the type of level. Ex: default (just some code in main function), function (student defines a function)...
    */
    constructor(prompt, explanation, solutionCode, language, testCode, parameters, testBoilerplate, testInput, files, levelType) { // eslint-disable-line max-params
        this.prompt = prompt;
        this.explanation = explanation;
        this.solutionCode = solutionCode;
        this.language = language;
        this.testCodeTemplate = testCode;
        this.levelParameters = parameters.level;
        this.testParameters = parameters.test;
        this.testInput = testInput;
        this.levelType = levelType;

        /*
            For C/C++, input can be just a string, but for java, input must be an array.
            We use the first element in the array to compile and run the student code.
            When testing the code against the solution, all input is tested.
        */
        if (typeof this.testInput === 'object') {
            this.testInput = this.testInput[0];
        }
        this.testBoilerplate = testBoilerplate;
        this.files = files;

        this.serverRequestPromise = null;
        this.utilities = require('utilities');
        this.cantReachServer = 'We can\'t seem to reach our server. Please check your Internet connection, or try refreshing the page.';
        this.questionFiles = this.files.length > 1 ? JSON.stringify(this.files) : [];
        this.accessible = this._getAccessibleVersion();
    }

    /**
        Stop the existing server request.
        @method stopServerRequest
        @return {void}
    */
    stopServerRequest() {
        if (typeof this.rejectPreviousRequest === 'function') {
            this.rejectPreviousRequest();
            this.rejectPreviousRequest = null;
        }
    }

    /**
        Whether the server request was rejected.
        @method isServerRequestRejected
        @return {Boolean}
    */
    isServerRequestRejected() {
        return this.serverRequestPromise.isRejected;
    }

    /**
        Compiles and runs |userEnteredCode|, if there are no problems then proceeds to
        run the test program to see if the solution provided is correct.
        @method runLevel
        @param {String} userEnteredCode The code that the user entered.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    runLevel(userEnteredCode, parentResource) {
        const errorMessage = 'We can\'t seem to reach our server. Please check your Internet connection, or try refreshing the page.';
        const userCode = this._makeProgram(userEnteredCode);
        const testCode = this._makeTestProgram(userEnteredCode);
        const filename = this.files[0].filename;
        const studentFile = this._makeBlobFromProgram(userCode, filename);
        const testFilename = `main.${this.language}`;
        const testFile = this._makeBlobFromProgram(testCode, testFilename);
        const utilities = require('utilities');
        const input = this.testInput;

        const studentCodeFormData = utilities.getRunCodeFormDataObject('explore', this.language, filename, input, [ studentFile ]);
        const solutionCodeFormData = utilities.getRunCodeFormDataObject('explore', this.language, testFilename, input, [ testFile ]);

        this.serverRequestPromise = new Ember.RSVP.Promise((resolve, reject) => {
            this.rejectPreviousRequest = reject;
            parentResource.runCode(studentCodeFormData).then(
                studentResult => {
                    const results = this.processRunResults(studentResult.output, true);

                    if (results.error) {
                        resolve([ results ]);
                    }
                    else {
                        parentResource.runCode(solutionCodeFormData).then(
                            testProgramResult => {
                                const testResult = this.processRunResults(testProgramResult.output, false);

                                if (testResult.error) {
                                    resolve([ testResult ]);
                                }
                                else {
                                    resolve(this.getTestResults(testResult.output));
                                }
                            }
                        );
                    }
                },
                () => {
                    reject(errorMessage);
                }
            );
        });
    }

    /**
        Processes the results of running code on the server.
        @method processRunResults
        @param {Object} results The results from the server call.
        @param {Boolean} isUserEnteredCode Whether the runned code was entered by the user.
        @return {Object}
    */
    processRunResults(results, isUserEnteredCode) { // eslint-disable-line complexity
        const output = results.output || '';
        const terminatedAfterThrowingError = output.includes('terminate called after throwing');
        const exceptionInThread = output.includes('Exception in thread');
        const segmentationFault = output.includes('Segmentation fault');
        const runtimeError = terminatedAfterThrowingError || exceptionInThread || segmentationFault;

        const error = runtimeError || results.compile_error || results.compile_warning || results.error;
        const processedResults = {
            error,
            isUserEnteredCode,
            output,
        };

        // Compiler error
        if (results.compile_error || results.compile_warning) {
            processedResults.when = 'compilation';
            processedResults.result = results.compile_error || results.compile_warning;
        }

        // Runtime errors.
        else if (runtimeError) {
            const vector = this.language === 'c' ? '' : '/vector';
            const result = segmentationFault ? `Segmentation fault (commonly due to an invalid array${vector} access)` :
                                               `Runtime error (commonly due to an invalid array${vector} access, divide by 0, etc.).`;

            processedResults.when = 'run';
            processedResults.result = result;
        }

        // Other runtime errors. Ex: Timeout.
        else if (results.error) {
            processedResults.when = 'run';
            processedResults.result = results.error;
        }

        return processedResults;
    }

    /**
        Makes a {Blob} object from some code and a name.
        @private
        @method _makeBlobFromProgram
        @param {String} program The program code.
        @param {String} filename The name of the file.
        @return {Blob}
    */
    _makeBlobFromProgram(program, filename) {
        const blob = new Blob([ program ]);

        blob.lastModifiedDate = new Date();
        blob.name = filename;
        return blob;
    }

    /**
        Returns block comment.
        @method _makeBlockComment
        @param {String} comment The content of the comment.
        @return {String} The formatted comment.
    */
    _makeBlockComment(comment) {
        return {
            cpp: `/* ${comment} */`,
            c: `/* ${comment} */`,      // eslint-disable-line id-length
            java: `/* ${comment} */`,
            python: `''' ${comment} '''`,
            python3: `''' ${comment} '''`,
        };
    }

    /**
        Gets the accessible version of the level in a string.
        @method _getAccessibleVersion
        @return {String}
    */
    _getAccessibleVersion() {
        const commentStart = this._makeBlockComment('Solution starts here')[this.language];
        const commentEnd = this._makeBlockComment('Solution ends here')[this.language];

        // This marks the solution in the accessible version.
        const accessibleComment = `${commentStart}${this.solutionCode}${commentEnd}`;
        let accessible = this._makeProgram(accessibleComment);
        let spaces = '';

        // Formats the comment and solution to make sense. Fixes indentation,
        // and moves comment to before and after a line if the solution is inline. Ex: if (/* Solution goes here */) {
        accessible = accessible.split('\n').map(line => {
            let builtLine = line;
            const match = builtLine.match(/^\s+/);
            const currentLineSpaces = match ? match[0] : '';

            spaces = currentLineSpaces || spaces;

            if (builtLine.includes(`${commentStart}`)) {
                builtLine = builtLine.replace(commentStart, '');
                builtLine = `${spaces}${commentStart}\n${builtLine}`;
            }
            if (builtLine.includes(`${commentEnd}`)) {
                builtLine = builtLine.replace(commentEnd, '');
                builtLine = `${builtLine}\n${spaces}${commentEnd}`;
            }

            return builtLine;
        }).join('\n');

        return accessible;
    }

    /**
        Builds the user submitted program.
        @method _makeProgram
        @private
        @param {String} writtenCode The code that the student wrote.
        @return {String} The program built with |writtenCode| where student solution goes.
    */
    _makeProgram(writtenCode) {
        const filename = `userProgram.${this.language}`;
        const mainProgramFile = this.files[0];
        const programParts = $.extend({}, mainProgramFile.codeParts);

        programParts.student = writtenCode;
        const userFile = new ProgramFile(filename, programParts, this.levelParameters, this.levelType);

        return userFile.program;
    }

    /**
        Builds the testing program.
        @method _makeTestProgram
        @private
        @param {String} studentWrittenCode The code that the student wrote.
        @return {String} The test program built.
    */
    _makeTestProgram(studentWrittenCode) {
        const mainProgramFile = this.files[0];

        // For level type: function
        const returnType = mainProgramFile.codeParts.returnType;
        const functionName = mainProgramFile.codeParts.functionName;
        const solutionFunctionName = mainProgramFile.codeParts.solutionFunctionName;
        const parameters = mainProgramFile.codeParts.parameters;
        const functionPrefix = mainProgramFile.codeParts.functionPrefix;
        const functionPostfix = mainProgramFile.codeParts.functionPostfix;

        // For level type: default
        const prefix = HandlebarsComplete.compile(mainProgramFile.programParts.prefix)(this.testParameters);
        const postfix = mainProgramFile.codeParts.postfix;
        const returnStatement = mainProgramFile.codeParts.returnStatement;

        // For all types
        const headers = mainProgramFile.codeParts.headers;
        const preProgramDefinitions = mainProgramFile.codeParts.preProgramDefinitions;
        const main = mainProgramFile.codeParts.main;
        const solutionCode = prefix + this.solutionCode;
        const studentCode = prefix + studentWrittenCode;

        const testsTemplate = HandlebarsComplete.compile(this.testCodeTemplate);
        const tests = testsTemplate(this.testParameters);

        const defaultReturn = this.language.includes('python') ? '' : 'void';
        const testFunctionReturns = this.testParameters.testFunctionReturns ? this.testParameters.testFunctionReturns : defaultReturn;
        const testFunctionParameters = this.testParameters.testFunctionParameters ? this.testParameters.testFunctionParameters : '';

        return this.testBoilerplate({
            headers,
            preProgramDefinitions,
            returnType,
            functionName,
            solutionFunctionName,
            parameters,
            functionPrefix,
            functionPostfix,
            testFunctionReturns,
            testFunctionParameters,
            studentCode,
            solutionCode,
            main,
            tests,
            postfix,
            programInput: this.testInput,
            returnStatement,
        });
    }

    /**
        @method getTestResults
        @param {Object} runResult The result of running the program.
        @return {Object} Contains the results of each test.
    */
    getTestResults(runResult) {

        // The zyDE will return user and expected output surrounded by these text based sentinels.
        const systemMessageBeginSentinel = 'SYSTEM_MESSAGE_BEGIN';
        const spanBeginSentinel = 'SPANBEGIN';
        const spanEndSentinel = 'SPANEND';
        const passSentinel = 'PASS';
        const failSentinel = 'FAIL';
        let testResult = [];

        // Divide by tests, and remove the last one, since it's an empty 'SYSTEM_MESSAGE_BEGINENDSYSTEM_MESSAGE_END'
        const eachTestResult = runResult.split(systemMessageBeginSentinel).filter(test => test.length !== 0).slice(0, -1);

        testResult = eachTestResult.map(element => {
            const passed = element.indexOf(passSentinel) !== -1;

            // If test passed, we divide the string by the \passSentinel|, if not by the |failSentinel|
            let testInfo = passed ? element.split(passSentinel) : element.split(failSentinel);

            testInfo = testInfo.find(splitted => splitted.length !== 0);

            // First line now contains what was tested.
            const whatWasTested = testInfo.split('\n')[0];
            const expectedOutput = testInfo.split(spanBeginSentinel).find(element2 => element2.indexOf('Expected output:\n') === -1)
                                           .split(spanEndSentinel)[0];

            // If test has passed, then |userOutput| is the same as |expectedOutput|, if not, then we get what was the users output.
            const userOutput = passed ? expectedOutput : testInfo.split(spanBeginSentinel)
                                                                 .filter(element2 => element2.indexOf('Your output:\n') === -1)[1]
                                                                 .split(spanEndSentinel)[0];

            return { passed, whatWasTested, expectedOutput, userOutput };
        });

        return testResult.filter(test => (test.expectedOutput !== '') || (test.whatWasTested !== '') || (test.userOutput !== ''));
    }
}
