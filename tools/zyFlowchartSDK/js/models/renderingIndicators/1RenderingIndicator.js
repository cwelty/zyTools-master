'use strict';

/* exported RenderingIndicator */

/**
    Abstract model of an indicator used for rendering.
    @class RenderingIndicator
*/
class RenderingIndicator {

    /**
        Return the name of this indicator. Inheriting objects must override.
        @method getName
        @return {String} The name of this indicator.
    */
    getName() {
        throw new Error('RenderingIndicator\'s getName function should be overridden');
    }

    /**
        Return the column of this indicator.
        @method getColumn
        @param {Array} indicators Array of {RenderingIndicator}. The list of indicators that this indicator is in.
        @return {Integer} The column of this indicator.
    */
    getColumn(indicators) { // eslint-disable-line no-unused-vars
        throw new Error('RenderingIndicator\'s getColumn function should be overridden');
    }
}
