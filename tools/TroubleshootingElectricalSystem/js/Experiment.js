'use strict';

/* exported Experiment */

/**
    An experiment to run on a component.
    @class Experiment
*/
class Experiment {

    /**
        @constructor
        @param {Component} component The component to test in the experiment.
        @param {String} [result=''] The result of the experiment.
        @param {String} [resultNote=''] A note about the result.
        @param {Boolean} [isRunningTest=false] Whether the associated test is running.
        @param {Boolean} [testFinishedRunning=false] Whether the associated test has finished running.
    */
    constructor(component, result = '', resultNote = '', isRunningTest = false, testFinishedRunning = false) {
        this.component = component;
        this.result = result;
        this.resultNote = resultNote;
        this.isRunningTest = isRunningTest;
        this.testFinishedRunning = testFinishedRunning;
    }
}
