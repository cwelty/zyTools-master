'use strict';

/* exported NumericalOutputComponentController */
/* global globalConstants */

/**
    Control a numerical output component.
    @class NumericalOutputComponentController
*/
class NumericalOutputComponentController {

    /**
        @constructor
        @param {NumericalOutputComponent} output The numerical output component to control.
        @param {Object} $containerDOM jQuery reference to the container for the controller.
    */
    constructor(output, $containerDOM) {

        /**
            The numerical output component to control.
            @property output
            @type {NumericalOutputComponent}
        */
        this.output = output;

        /**
            jQuery reference to the container for the controller.
            @property $containerDOM
            @type {Object}
        */
        this.$containerDOM = $containerDOM;

        /**
            Whether the output is editable.
            @property isEditable
            @type {Boolean}
            @default false
        */
        this.isEditable = false;

        /**
            Function to call when the user change's the output.
            @property onChangeFunction
            @type {Function}
            @default null
        */
        this.onChangeFunction = null;

        // Register this controller with the output component so this controller gets updates when the output changes.
        this.output.registerController(this);
    }

    /**
        Render the numerical output component.
        @method render
        @return {void}
    */
    render() {
        this.$containerDOM.html(globalConstants.templates.output({ isEditable: this.isEditable }));
        this.updatedOutput();

        if (this.isEditable) {
            const $console = this.$containerDOM.find('.console');

            $console.on('input', () => {
                this.output.setOutputOfOtherControllers(this, $console.val());
                if (this.onChangeFunction) {
                    this.onChangeFunction();
                }
            });
        }
    }

    /**
        Inform this controller that the output has changed.
        @method updatedOutput
        @return {void}
    */
    updatedOutput() {
        const $console = this.$containerDOM.find('.console');

        if (this.isEditable) {
            $console.val(this.output.output);
            if (this.onChangeFunction) {
                this.onChangeFunction();
            }
        }
        else {
            this.$containerDOM.find('.numerical-output').text(`${this.output.output}_`);

            // Scroll to the last output entry automatically.
            $console.scrollTop($console.prop('scrollHeight'));
        }
    }

    /**
        Set whether the output is editable.
        @method setIsEditable
        @param {Boolean} isEditable Whether the output is editable.
        @param {Function} [onChangeFunction=null] A function to call when the output changes.
        @return {void}
    */
    setIsEditable(isEditable, onChangeFunction = null) {
        this.isEditable = isEditable;
        this.onChangeFunction = onChangeFunction;
    }
}
