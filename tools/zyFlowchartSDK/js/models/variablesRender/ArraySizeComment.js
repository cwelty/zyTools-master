'use strict';

/* exported ArraySizeComment */

/**
    Model for rendering a comment about an array's size.
    @class ArraySizeComment
*/
class ArraySizeComment {

    /**
        @constructor
        @param {String} comment The comment on an array's size.
    */
    constructor(comment) {

        /**
            Whether this is an array's size comment. It is.
            @property isArraySizeComment
            @type {Boolean}
            @default true
        */
        this.isArraySizeComment = true;

        /**
            The comment on an array's size.
            @property value
            @type {String}
        */
        this.comment = comment;
    }
}
