'use strict';

/* exported NumericalOutputComponent */

/**
    Model a component wherein the user can enter numerical values separated by spaces.
    @class NumericalOutputComponent
*/
class NumericalOutputComponent {

    /**
        @constructor
    */
    constructor() {

        /**
            The output of the component.
            @property output
            @type {String}
        */
        this.output = '';

        /**
            List of controllers that are registered to listen to this component.
            @property registeredControllers
            @type {Array} of {NumericalOutputComponentController}
            @default []
        */
        this.registeredControllers = [];
    }

    /**
        Register the given controller to listen to changes on the output.
        @method registerController
        @param {NumericalOutputComponentController} controller The controller that wants to be registered to listen to this input.
        @return {void}
    */
    registerController(controller) {
        this.registeredControllers.push(controller);
    }

    /**
        Print the given string.
        @method toPrint
        @param {String} string The string to print.
        @return {void}
    */
    toPrint(string) {
        this.output += string;
        this.registeredControllers.forEach(controller => controller.updatedOutput());
    }

    /**
        Set the output of the other controllers that are not currently being edited.
        @method setOutputOfOtherControllers
        @param {NumericalOutputComponentController} controllerBeingEdited The controller being edited, so shouldn't be written to.
        @param {String} string The output value.
        @return {void}
    */
    setOutputOfOtherControllers(controllerBeingEdited, string) {
        this.output = string;
        this.registeredControllers.filter(controller => controller !== controllerBeingEdited)
                                  .forEach(controller => controller.updatedOutput());
    }

    /**
        Clear the registered controllers.
        @method clearRegisteredControllers
        @return {void}
    */
    clearRegisteredControllers() {
        this.registeredControllers.length = 0;
    }

    /**
        Clear the output.
        @method clear
        @return {void}
    */
    clear() {
        this.output = '';
    }
}
