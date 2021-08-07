'use strict';

/* exported ExplanationElementType */

class ExplanationElementType {

    /**
        Creates an |ExplanationElementType| instance from a regex.
        @constructor
        @param {RegExp} regex The regex for this ExplanationElementType.
        @param {Function} elementBuilderFunction The function that builds the explanation element.
        @param {Array} [parameters=[]] A list of parameters needed to call the function that builds the object.
    */
    constructor(regex, elementBuilderFunction, parameters = []) {
        this.regex = regex;
        this.elementBuilderFunction = elementBuilderFunction;
        this.parameters = parameters;
    }

    /**
        Whether there's an instance of this explanation element type in the passed string.
        @method isInstanceRemaining
        @param {String} str The string to test against.
        @return {Boolean}
    */
    isInstanceRemaining(str) {
        return this.regex.test(str);
    }

    /**
        Matches |this.regex| with |str|. Returns the result.
        @method getMatch
        @param {String} str The string to match.
        @return {Array}
    */
    getMatch(str) {
        const match = this.regex.exec(str);
        const index = match ? match.index : Infinity;

        return {
            elementType: this,
            match,
            index,
        };
    }

    /**
        Builds the element with the passed |match|.
        @method makeElement
        @param {Array} match The match data to build the element.
        @return {jQuery} A jQuery object representing the element.
    */
    makeElement(match) {
        return this.elementBuilderFunction(match, ...this.parameters);
    }
}
