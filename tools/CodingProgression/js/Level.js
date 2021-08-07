/* exported Level */
/* global Ember, CodeRunResults */
'use strict';

/**
    A level of the coding progression.
    @class Level
*/
class Level {

    /**
        Initialize the Level
        @constructor
        @param {String} language The programming language of this level.
        @param {String} prompt The prompt of the level.
        @param {String} explanation The explanation to this level's answer.
        @param {String} solutionCode The solution to this level.
        @param {Array} inputs The different inputs to test this level.
        @param {Array} files The different files that make the program in this level.
        @param {Boolean} useTextarea Whether the area to write code is a textarea or ace editor.
        @param {Array} outputFilenames An array of output file names.
    */
    constructor({ language, prompt, explanation, solutionCode, inputs, files, useTextarea, outputFilenames }) {
        this.language = language;
        this.prompt = prompt;
        this.explanation = explanation;
        this.solutionCode = solutionCode;
        this.inputs = inputs;
        this.files = files;
        this.editableFileIndex = this.files.findIndex(file => file.isEditable);
        this.editableFile = this.files[this.editableFileIndex];
        this.useTextarea = useTextarea;
        this.outputFilenames = outputFilenames;

        this.parentResource = null;
        this.rejectOfUserRequests = [];
        this.solutionsResults = null;
        this.utilities = require('utilities');
    }

    /**
        Sets a parent resource object. Need the parentResource to run code.
        @method setParentResource
        @param {Object} parentResource The parent resource object.
        @return {Void}
    */
    setParentResource(parentResource) {
        this.parentResource = parentResource;
    }

    /**
        Returns the main file.
        @method getMainFile
        @return {Object} The main file in the program.
    */
    getMainFile() {
        return this.files.length === 1 ? this.files[0] : this.files.find(file => file.isMain);
    }

    /**
        Stop the existing server request.
        @method stopServerRequests
        @return {void}
    */
    stopServerRequests() {
        this.rejectOfUserRequests.forEach(reject => reject());
        this.rejectOfUserRequests.length = 0;
    }

    /**
        Returns an array of File objects for the program to be run.
        @method getProgramGivenCode
        @param {String} enteredCode The code to place where the user code goes. Can be user code or solution.
        @param {Boolean} [isSolution=false] Whether |enteredCode| is the solution.
        @return {Array} An array of {File} objects.
    */
    getProgramGivenCode(enteredCode, isSolution = false) {
        return this.files.map(file => {

            /*
                1. Student code + useTextarea => Use just enteredCode
                2. Student code + !useTextarea ===v
                3. Solution code + useTextarea ==>Build prefix + enteredCode + postfix
                4. Solution code + !useTextarea ==^
                5. !isEditable + any of above => Use original file
            */
            let code = enteredCode;

            if (!file.isEditable) {
                code = file.code;
            }
            else if (isSolution || !this.useTextarea) {
                code = file.prefix + enteredCode + file.postfix;
            }

            let filename = file.filename;

            if (file.isEditable) {
                filename += isSolution ? '.solution' : '.student';
            }

            const blob = new Blob([ code ]);

            blob.lastModifiedDate = new Date();
            blob.name = filename;

            return blob;
        });
    }

    /**
        Compiles and runs the student entered program, and the solution program if it wasn't submited before.
        @method runCodeGetResults
        @param {String} codeFragment The code fragment to complete the program.
        @return {Ember.RSVP.Promise} Promise that will resolve with the results.
    */
    runCodeGetResults(codeFragment) {
        const mainFilename = this.getMainFile().filename;

        // Get all file names in order to compile them all.
        const studentFiles = this.getProgramGivenCode(codeFragment);
        const allFiles = [ ...studentFiles ];

        // If we don't have the results of the solution, add the solution file to |allFiles|.
        if (!this.solutionsResults) {
            const solutionFiles = this.getProgramGivenCode(this.solutionCode, true);

            allFiles.push(solutionFiles.find(file => file.name.endsWith('.solution')));
        }

        const formData = this.utilities.getRunCodeFormDataObject('coding_progression', this.language, mainFilename,
                                                                 this.inputs, allFiles, this.outputFilenames);

        return new Ember.RSVP.Promise((resolve, reject) => {
            this.rejectOfUserRequests.push(reject);

            this.parentResource.runCode(formData).then(
                returnedObject => {
                    const results = returnedObject.output;

                    if (results.hasOwnProperty('solution')) {
                        this.solutionsResults = this.processResults(results.solution);

                        // Alert of compilation errors in solution code.
                        const compileErrorTest = this.solutionsResults.compileError || this.solutionsResults.compileWarning;

                        if (compileErrorTest) {
                            window.alert(compileErrorTest.compileMessage); // eslint-disable-line no-alert
                            reject('Compile error on solution code');
                        }

                        // Alert of runtime errors in solution code.
                        const runtimeErrorTest = this.solutionsResults.runs.find(result => result.hasRuntimeError);

                        if (runtimeErrorTest) {
                            window.alert(`Runtime error in test #${runtimeErrorTest.runNumber}:\n${runtimeErrorTest.error}`); // eslint-disable-line no-alert
                            reject('Runtime error on solution code');
                        }
                    }

                    const userResults = this.processResults(results.student);
                    const runResults = {
                        compileError: userResults.compileError,
                        compileWarning: userResults.compileWarning,
                    };

                    runResults.tests = userResults.runs.map((run, index) => {
                        const solutionRun = this.solutionsResults.runs[index];

                        return run.compareAndGetTestResults(solutionRun);
                    });

                    resolve(runResults);
                },
                () => {
                    reject('We can\'t seem to reach our server. Please check your Internet connection, or try refreshing the page.');
                }
            );
        });
    }

    /**
        Processes the results returned by the server, returns an array of objects.
        @method processResults
        @param {Object} resultsObject Results of running the code: https://github.com/zyBooks/zydeSDK/blob/master/coding_progression/README.org
        @return {Object}
    */
    processResults(resultsObject) {
        let runs = [];

        if (resultsObject.results) {
            runs = resultsObject.results.map((run, index) => new CodeRunResults({ run, runNumber: index + 1 }));
        }

        // Old version of coding_progression SDK. This can be removed once server is udpated with file I/O.
        else if (resultsObject.output) {
            runs = resultsObject.output.map((output, index) => {
                const run = {
                    error: resultsObject.error[index],
                    input: this.inputs[index],
                    output,
                    output_files: {}, // eslint-disable-line camelcase
                    truncated_output: resultsObject.truncated_output[index], // eslint-disable-line camelcase
                };

                return new CodeRunResults({ run, runNumber: index + 1 });
            });
        }

        return {
            compileError: resultsObject.compile_error,
            compileWarning: resultsObject.compile_output,
            runs,
        };
    }

    /**
        Returns a JSON representing this {Level} object
        @method toJSON
        @return {void}
    */
    toJSON() {
        return {
            prompt: this.prompt,
            explanation: this.explanation,
            solutionCode: this.solutionCode,
            files: this.files,
            inputs: this.inputs,
            outputFilenames: this.outputFilenames,
        };
    }
}
