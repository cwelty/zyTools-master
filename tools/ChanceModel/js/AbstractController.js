/* exported AbstractController */
'use strict';

/**
    The base class for the controllers.
    @module AbstractController
*/
class AbstractController {

    /**
        @constructor
        @param {String} id The id of the DOM element in which to create the controller.
        @param {Object} templates Dictionary of templates for this module.
    */
    constructor(id, templates) {

        /**
            The id of the DOM element in which to create the controller.
            @property id
            @type {String}
        */
        this.id = id;

        /**
            Dictionary of templates for this module.
            @property templates
            @type {Object}
        */
        this.templates = templates;
    }

    /**
        Empty the controlled DOM.
        @method empty
        @return {void}
    */
    empty() {
        $(`#${this.id}`).empty();
    }

    /**
        Return the element as jQuery.
        @method getElement
        @return {Object} The element as a jQuery object.
    */
    getElement() {
        return $(`#${this.id}`);
    }
}
