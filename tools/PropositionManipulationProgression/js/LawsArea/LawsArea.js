'use strict';

/* global Property, applyPropertiesAndOptions */

/**
    Model the layout of the laws area.
    @class LawsArea
    @constructor
    @param {Object} [options] Property values that are not required.
    @param {String} [options.equalitySymbol='≡'] The symbol placed between expressions in a law.
    @param {Boolean} [options.isDisabled=false] Whether the law area is disabled.
    @param {Array} [options.lawPanels=[]] Array of {Array} of {LawCategory}.
    @param {String} [options.title='Laws'] The title of the law area.
    @param {String} [options.rightArrowURL='≡'] URL to the right-arrow.
    @param {String} [options.leftArrowURL='≡'] URL to the left-arrow.
*/
function LawsArea(options) {
    const properties = [
        new Property('equalitySymbol', '≡'),
        new Property('isDisabled', false),
        new Property('lawPanels', []),
        new Property('title', options.title ? options.title : 'Laws'),
        new Property('rightArrowURL', ''),
        new Property('leftArrowURL', ''),
    ];

    applyPropertiesAndOptions(this, properties, options);
}

/**
    Set the direction arrow for the nth {LawSide} that is a button.
    @method setDirectionForNthLawSideButton
    @param {Number} nth The ordering of the {LawSide} to find.
    @return {void}
*/
LawsArea.prototype.addDirectionForSelectedNthLawSideButton = function(nth) {
    var lawSide = this.findNthLawSideButton(nth);
    var parent = this.findParentOfLawSide(lawSide);
    var arrowURL = (parent.leftSide === lawSide) ? this.rightArrowURL : this.leftArrowURL;

    parent.setArrowURL(arrowURL);
};

/**
    Find the parent of |lawSide|.
    @method findParentOfLawSide
    @param {LawSide} lawSide Find the parent to this {LawSide}.
    @return {Law} The parent of |lawSide|.
*/
LawsArea.prototype.findParentOfLawSide = function(lawSide) {
    return this.getLaws().filter(function(law) {
        return ((law.leftSide === lawSide) || (law.rightSide === lawSide));
    })[0];
};

/**
    Find the Nth {LawSide} that is a button.
    @method findNthLawSideButton
    @param {Number} nth The ordering of the {LawSide} to find.
    @return {LawSide}
*/
LawsArea.prototype.findNthLawSideButton = function(nth) {
    return this.getLawSides().filter(function(lawSide) {
        return lawSide.isButton;
    }).filter(function(lawSide, index) {
        return (index === nth);
    })[0];
};

/**
    Get the law sides in order with left-side before the right-side.
    @method getLawSides
    @return {Array} Array of {LawSide}. The law sides that were gotten.
*/
LawsArea.prototype.getLawSides = function() {
    var listOfLaws = [];

    this.getLaws().forEach(function(law) {
        listOfLaws.push(law.leftSide);
        listOfLaws.push(law.rightSide);
    });
    return listOfLaws;
};

/**
    Get the laws in order.
    @method getLaws
    @return {Array} Array of {LawSide}. The laws that were gotten.
*/
LawsArea.prototype.getLaws = function() {
    var laws = [];

    this.lawPanels.forEach(function(panel) {
        panel.forEach(function(category) {
            laws = laws.concat(category.laws);
        });
    });
    return laws;
};
