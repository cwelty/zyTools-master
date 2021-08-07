/* exported CodeRunResults */
/* eslint-disable camelcase */
'use strict';

/**
    Stores the results form a code run.
    @class CodeRunResults
*/
class CodeRunResults {

    /**
        @constructor
        @param {String} error The error thrown, if any.
        @param {String} input The input sent to the program that resulted in this result.
        @param {String} output The output of the program in the standard output stream.
        @param {Object} output_files A dictionary of file output generated by the program.
        @param {Boolean} truncated_output Whether the output was truncated (when too much output is generated).
        @param {Integer} runNumber The number of this run.
    */
    constructor({ run: { error, input, output, output_files, truncated_output }, runNumber }) {

        // Some runtime errors are not caught by kubernetes, so we inspect the output looking for those.
        const hasErrorThrown = output.includes('terminate called after throwing');
        const hasException = output.includes('Exception in thread');
        const hasSegmentation = output.includes('Segmentation fault');
        const hasRuntimeError = error || hasErrorThrown || hasException || hasSegmentation || false;

        const vector = this.language === 'c' ? '' : '/vector';
        const genericError = `Runtime error (commonly due to an invalid array${vector} access, divide by 0, etc.).`;
        const errorOutput = hasRuntimeError ? (error || genericError) : '';

        this.error = errorOutput;
        this.hasRuntimeError = hasRuntimeError;
        this.input = input;
        this.outputFiles = output_files;
        this.runNumber = runNumber;
        this.standardOutput = output;
        this.truncatedOutput = truncated_output;
    }

    /**
        Compares this {CodeRunResults} with another {CodeRunResults} and returns the results in an object containing {TestResult} objects.
        @method compareAndGetTestResults
        @param {CodeRunResults} solutionRunResult The {CodeRunResults} to test against.
        @return {Object}
    */
    compareAndGetTestResults(solutionRunResult) {
        const utilities = require('utilities');
        const solutionStandardOutput = solutionRunResult.standardOutput;
        const isStandardOutputEqual = this.standardOutput === solutionStandardOutput;
        const moreStandardOutputData = {
            errorOutput: this.error,
            hasRuntimeError: this.hasRuntimeError,
            input: this.input,
            isEmptyUserOutput: (this.standardOutput === '') && !this.error,
            isEmptyExpectedOutput: solutionStandardOutput === '',
            testNumber: this.runNumber,
        };
        const resultObject = {
            standardOutput: utilities.getTestResult(this.standardOutput, solutionStandardOutput,
                                                    isStandardOutputEqual, moreStandardOutputData),
        };

        Object.entries(this.outputFiles).forEach(([ filename, fileContents ]) => {
            const solutionFileOutput = solutionRunResult.outputFiles[filename];
            const isFileOutputCorrect = fileContents === solutionFileOutput;
            const moreFileOutputData = {
                filename,
            };

            resultObject[filename] = utilities.getTestResult(fileContents, solutionFileOutput,
                                                             isFileOutputCorrect, moreFileOutputData);
        });

        return resultObject;
    }
}
