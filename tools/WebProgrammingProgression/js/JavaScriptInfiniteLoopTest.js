/* exported JavaScriptInfiniteLoopTest */
/* global Ember */
'use strict';

/**
    Run JavaScript to see whether the code finishes or whether there is an infinite loop.
    @class JavaScriptInfiniteLoopTest
*/
class JavaScriptInfiniteLoopTest {

    /**
        Set the code to test.
        @constructor
        @param {String} code The JavaScript code to test.
    */
    constructor(code) {

        /**
            The JavaScript code to test.
            @property code
            @type {String}
        */
        this.code = code;
    }

    /**
        Run the JavaScript code to test for an infinite loop.
        @method run
        @return {Promise} Resolves when the code finishes executing. Rejects if the code doesn't finish executing.
    */
    run() {
        return new Ember.RSVP.Promise((resolve, reject) => {

            // Run code if Worker and Blob are supported.
            if (window.Worker && window.Blob) {

                // Build WebWorker with user's code.
                const blob = new Blob([
                    `self.onmessage = function(e) {

                        // Dummy unit test functions.
                        var zyTest = zyTestConsoleLog = zyTestIfDefined = zyTestStyleOfTag = zyAsync = function() {}
                        var zyGetTextPostRendering = function() { return '' }
                        var window = {};
                        prompt = window.prompt = function(string) {
                            zyPrompts.push(string);
                            return zyInputs.length ? zyInputs.shift() : null;
                        };
                        var console = {}
                        window.console = console;
                        window.console.log = function(string) {
                            zyConsoleLog += string + '\\n';
                        };

                        // Dummy unit test variables.
                        var zyConsoleLog = '';
                        var zyPrompts = [];
                        var zyInputs = [];
                        var zyWebpageAsString = '';

                        // User's code.
                        ${this.code}

                        // User's code done. Report completion then close WebWorker.
                        self.postMessage('user code done');
                        self.close();
                    };`,
                ]);
                const worker = new Worker(window.URL.createObjectURL(blob));

                // Set timer for 3 seconds. If worker not done by then, there is likely an infinite loop so reject.
                const waitTime = 3000;
                const timer = setTimeout(() => {
                    worker.terminate();
                    reject();
                }, waitTime);

                // Resolve to indicate there was no infinite loop.
                worker.onmessage = () => {
                    clearTimeout(timer);
                    resolve();
                };

                // Errors handled elsewhere. Resolve to indicate there was no infinite loop.
                worker.onerror = () => {
                    clearTimeout(timer);
                    resolve();
                };

                // Start running code.
                worker.postMessage(null);
            }
            else {
                resolve();
            }
        });
    }
}
