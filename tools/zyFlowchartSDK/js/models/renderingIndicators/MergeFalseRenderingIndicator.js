'use strict';

/* exported MergeFalseRenderingIndicator */
/* global MergeRenderingIndicator */

/**
    Model of indicator to render an edge from the last node of an if-else node's false branch.
    @class MergeFalseRenderingIndicator
    @extends MergeRenderingIndicator
*/
class MergeFalseRenderingIndicator extends MergeRenderingIndicator {

    /**
        Return the name of this indicator.
        @method getName
        @return {String} The name of this indicator.
    */
    getName() {
        return 'MergeFalseRenderingIndicator';
    }
}
