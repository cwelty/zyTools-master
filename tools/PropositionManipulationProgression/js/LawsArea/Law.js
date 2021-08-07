'use strict';

/**
    Model the layout of laws in a particular category. Ex: The distributive laws.
    @class Law
    @constructor
    @param {LawSide} leftSide The left-hand side of the law.
    @param {LawSide} rightSide The right-hand side of the law.
*/
function Law(leftSide, rightSide) {
    this.leftSide = leftSide;
    this.rightSide = rightSide;
    this.useArrow = false;
    this.arrowURL = '';
}

/**
    Set the direction of the arrow.
    @method setArrowURL
    @param {String} arrowURL The URL for the arrow to use.
    @return {void}
*/
Law.prototype.setArrowURL = function(arrowURL) {
    this.useArrow = true;
    this.arrowURL = arrowURL;
};

/**
    Remove the arrow from the law.
    @method removeArrow
    @return {void}
*/
Law.prototype.removeArrow = function() {
    this.useArrow = false;
    this.arrowURL = '';
};
