/* global Ember, isLanguageAZyFlowchart */
/* exported Question */
'use strict';

/**
    A question.
    @class Question
*/
class Question {

    /**
        Initialize the Question
        @constructor
        @param {String} code The code of the question.
        @param {String} explanation The explanation to this question's answer.
        @param {String} language The programming language of the code.
        @param {String} input The input for this question's code.
        @param {Array} files Array of {ProgramFile} objects. The different program files composing this question.
        @param {String} [outputFilename=''] The name of the output file.
    */
    constructor(code, explanation, language, input, files, outputFilename = '') { // eslint-disable-line max-params

        /**
            The code for this question.
            @property code
            @type {String}
        */
        this.code = code;

        /**
            The explanation for this question.
            @property explanation
            @type {String}
        */
        this.explanation = explanation;

        /**
            The programming language for this question.
            @property language
            @type {String}
        */
        this.language = language;

        /**
            The program files for this question.
            @property files
            @type {Array} of {ProgramFile}
        */
        this.files = files;

        /**
            The input for this question's code.
            @property input
            @type {String}
        */
        this.input = input;

        /**
            Whether this level's expected output is dictated by the contents of an output file.
            @property useOutputFile
            @type {Boolean}
            @default false
        */
        this.useOutputFile = outputFilename !== '';

        /**
            The name of the output file.
            @property outputFilename
            @type {String}
        */
        this.outputFilename = outputFilename;

        /**
            Whether this level has an input for the program.
            @property hasInput
            @type {Boolean}
            @default false
        */
        this.hasInput = this.input !== '';

        /**
            The expected answer for this question.
            @property expectedAnswer
            @type {String}
            @default null
        */
        this.expectedAnswer = null;

        /**
            The server request promise for languages that need to connect to a server to compile/run code.
            @property serverRequestPromise
            @type {Promise}
            @default null
        */
        this.serverRequestPromise = null;

        /**
            The reject function for the previous server request.
            @property rejectPreviousRequest
            @type {Function}
            @default null
        */
        this.rejectPreviousRequest = null;
    }

    /**
        Stop the existing server request.
        @method stopServerRequest
        @return {void}
    */
    stopServerRequest() {
        this.rejectPreviousRequest();
        this.rejectPreviousRequest = null;
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
        Alert the user that there is an error with the |code|.
        A customer should never see the alert; instead, an author should get this alert while testing.
        @method programError
        @param {String} error The error generated.
        @return {void}
    */
    programError(error) {
        alert(`Error in generated program:\n${error}`); // eslint-disable-line no-alert
    }

    /**
        Set the expected output for the given |code|.
        @method setExpectedAnswer
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    setExpectedAnswer(parentResource) {
        if (isLanguageAZyFlowchart(this.language)) {
            this.setExpectedAnswerViaZyFlowchartExecution();
        }
        else {
            this.setExpectedAnswerViaServerRequests(parentResource);
        }
    }

    /**
        Set the expected output by executing the given |code|.
        @method setExpectedAnswerViaZyFlowchartExecution
        @return {void}
    */
    setExpectedAnswerViaZyFlowchartExecution() {
        this.serverRequestPromise = new Ember.RSVP.Promise((resolve, reject) => {
            this.rejectPreviousRequest = reject;

            let executor = null;

            try {
                executor = require('zyFlowchartSDK').create().makeExecutor(this.code, this.input, true);
            }
            catch (error) {
                this.programError(error);
                reject(error);
            }

            executor.enterExecution();

            // Execute until program done.
            while (!executor.isExecutionDone()) {
                executor.execute();
            }

            this.expectedAnswer = executor.output.output;
            resolve();
        });
    }

    /**
        Set the expected output for the given |code| by compiling/running on the server.
        @method setExpectedAnswerViaServerRequests
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {void}
    */
    setExpectedAnswerViaServerRequests(parentResource) {
        const errorMessage = 'We can\'t seem to reach our server. Please check your Internet connection, or try refreshing the page.';
        const mainFile = this.files.find(file => file.main) || this.files[0];
        const mainFilename = mainFile.filename;
        const files = this.files.map(file => {
            const blob = new Blob([ file.program ]);

            blob.lastModifiedDate = new Date();
            blob.name = file.filename;

            return blob;
        });
        const outputFilenames = this.useOutputFile ? [ this.outputFilename ] : [];
        const formData = require('utilities').getRunCodeFormDataObject('explore', this.language, mainFilename,
                                                                       this.input, files, outputFilenames);

        this.serverRequestPromise = new Ember.RSVP.Promise((resolve, reject) => {
            this.rejectPreviousRequest = reject;

            parentResource.runCode(formData).then(
                returnedObject => {
                    const results = returnedObject.output;

                    // Compiler error
                    if (results.compile_error) {
                        this.programError(results.compile_error);
                        reject(results.compile_error);
                    }

                    // Compiler warning
                    if (results.compile_warning) {
                        this.programError(results.compile_warning);
                        reject(results.compile_warning);
                    }

                    // General program error (Ex: Timeout).
                    if (results.error) {
                        this.programError(results.error);
                        reject(results.error);
                    }

                    this.expectedAnswer = this.useOutputFile ? results.output_files[this.outputFilename] : results.output;
                    resolve();
                },
                () => {
                    reject(errorMessage);
                }
            );
        });
    }
}
