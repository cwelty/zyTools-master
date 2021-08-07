'use strict';

/* exported Component */

/**
    A component in an electrical system.
    @class Component
*/
class Component {

    /**
        @constructor
        @param {String} label The label for this test.
        @param {Number} time The time to conduct the test.
        @param {Number} likelihood The likelihood that the test will not pass.
        @param {Boolean} isBroken Whether this component is broken.
    */
    constructor(label, time, likelihood, isBroken) {
        this.label = label;
        this.time = time;
        this.likelihood = likelihood;
        this.isBroken = isBroken;
    }
}
