'use strict';

/* exported BuiltInProgramFunction */
/* global ProgramFunction */

/**
    Model a built-in function.
    @class BuiltInProgramFunction
    @extends ProgramFunction
*/
class BuiltInProgramFunction extends ProgramFunction {

    /**
        @constructor
        @param {String} name The name of the function.
        @param {Flowchart} flowchart The function's flowchart.
        @param {Variables} locals The function's local variables.
        @param {Variables} parameters The function's parameters.
        @param {Variables} _return The function's return value.
        @param {Function} executionFunction A javascript function to execute the built-in.
    */
    constructor(name, flowchart, locals, parameters, _return, executionFunction) { // eslint-disable-line max-params
        super(name, locals, parameters, _return);

        this.flowchart = flowchart;

        /**
            A javascript function to execute the built-in.
            @property executionFunction
            @type {Function}
        */
        this.executionFunction = executionFunction;
    }

    /**
        Return whether this is a built-in function.
        @method isBuiltIn
        @return {Boolean} Whether this is a built-in function.
    */
    isBuiltIn() {
        return true;
    }

    /**
        Execute the built-in function to produce a compute the return variable.
        @method execute
        @param {ExecutionContext} context The relevant flowchart properties for execution.
        @return {void}
    */
    execute(context) {
        this.executionFunction(this.parameters, this.return, context);
    }
}
