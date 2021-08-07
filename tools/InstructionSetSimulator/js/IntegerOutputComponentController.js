'use strict';

/* exported IntegerOutputComponentController */
/* global IntegerOutputComponent */

/**
    Controller for an {IntegerOutputComponent}.
    @class IntegerOutputComponentController
*/
class IntegerOutputComponentController {

    /**
        @constructor
        @param {Object} $container jQuery reference to the container for this integer output component.
        @param {Function} template Function to generate HTML for the output component.
    */
    constructor($container, template) {

        /**
            jQuery reference to the container for this integer output component.
            @property $container
            @type {Object}
        */
        this.$container = $container;

        /**
            Reference to the integer output component model.
            @property integerOutputComponent
            @type {IntegerOutputComponent}
            @default null
        */
        this.integerOutputComponent = null;

        /**
            Function to generate HTML for the output component.
            @property template
            @type {Function}
        */
        this.template = template;

        /**
            jQuery reference to the output textarea.
            @property $output
            @type {Object}
            @default null
        */
        this.$output = null;

        this.render();
    }

    /**
        Render an {IntegerOutputComponent}.
        @method render
        @return {void}
    */
    render() {
        this.$container.html(this.template());
        this.$output = this.$container.find('.integer-output');
    }

    /**
        Initialize the integer output component
        @method initialize
        @return {void}
    */
    initialize() {
        this.integerOutputComponent = new IntegerOutputComponent();
        this.printOutput();
    }

    /**
        Execute the output component.
        @method execute
        @param {BaseWord} value The memory address connected to Value.
        @param {Memory} memory The memory storing Value and Ready.
        @param {Number} integerOutputValueMemoryAddress The address of Value in memory.
        @return {void}
    */
    execute(value, memory, integerOutputValueMemoryAddress) {
        this.integerOutputComponent.execute(value, memory, integerOutputValueMemoryAddress);
        this.printOutput();
    }

    /**
        Print the output to screen.
        @method printOutput
        @return {void}
    */
    printOutput() {
        this.$output.text(`${this.integerOutputComponent.output}_`);
    }
}
