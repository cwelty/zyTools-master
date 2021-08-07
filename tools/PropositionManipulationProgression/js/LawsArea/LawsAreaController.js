'use strict';

/* global LawsArea */

/**
    Control the laws box, including enabling, disabling, and selecting the laws.
    @class LawsAreaController
    @constructor
    @param {Object} properties Property values that are required.
    @param {Object} properties.$dom jQuery reference to the DOM container for this controller.
    @param {String} properties.expressionType The type of expression to render.
    @param {Object} properties.templates Collection of functions for generating HTML strings.
    @param {Function} properties.setManipulationTerms Set the user-selected manipulation terms.
    @param {String} properties.rightArrowURL The link to the right-arrow image.
    @param {String} properties.leftArrowURL The link to the left-arrow image.
    @param {Array} properties.lawPanels Array of {Array} of {LawCategory}. The categories to show the user.
*/
function LawsAreaController(properties) {
    this.$dom = properties.$dom;
    this.expressionType = properties.expressionType;
    this.templates = properties.templates;
    this.setManipulationTerms = properties.setManipulationTerms;

    this.lawsArea = new LawsArea({
        rightArrowURL: properties.rightArrowURL,
        leftArrowURL: properties.leftArrowURL,
        lawPanels: properties.lawPanels,
        title: this.expressionType === 'digital' ? 'Properties' : 'Laws',
    });

    this.render();
}

/**
    Render the laws area and add click listeners.
    @method render
    @return {void}
*/
LawsAreaController.prototype.render = function() {
    this.$dom.empty();

    var expressionPartsFunction = this.templates.expressionParts;
    var sdk = require('PropositionalCalculusSDK').create();
    var self = this;

    // Render each {LawSide}'s expression.
    this.lawsArea.getLawSides().forEach(function(lawSide) {
        lawSide.html = expressionPartsFunction({
            parts: sdk.makeExpression(self.expressionType, lawSide.symbol).toParts(),
        });
    });

    this.$dom.html(this.templates.lawsArea({ lawsArea: this.lawsArea }));

    var $buttons = this.$dom.find('button');

    $buttons.click(function() {
        var buttonIndex = $buttons.index(this);
        var clickedLawSide = self.lawsArea.findNthLawSideButton(buttonIndex);

        self.setManipulationTerms(clickedLawSide.terms, clickedLawSide.symbol, clickedLawSide.manipulation);
        self.lawsArea.addDirectionForSelectedNthLawSideButton(buttonIndex);
        self.disable();
    });

    // Align the laws by setting the law-proposition columns to be the same width. First, align by panel.
    this.$dom.find('.law-panel').each((index, lawPanel) => {

        // Second, align by law containers.
        const lawContainers = $(lawPanel).find('.law-container').toArray().map(lawContainer => $(lawContainer));

        // Third, align by the first law proposition of each law container.
        const firstPropositionOfEachLaw = lawContainers.map($lawContainer => $lawContainer.find('.law-proposition').eq(0));

        // Fourth, align by the second law proposition of each law container.
        const secondPropositionOfEachLaw = lawContainers.map($lawContainer => $lawContainer.find('.law-proposition').eq(1));

        // Fifth, find the max width of the first law proposition, and the max width of the second.
        const offset = 5;
        const maxWidthFirst = Math.max(...firstPropositionOfEachLaw.map($proposition => $proposition.width())) + offset;
        const maxWidthSecond = Math.max(...secondPropositionOfEachLaw.map($proposition => $proposition.width())) + offset;

        // Sixth, update the widths to match the max, thus creating alignment.
        firstPropositionOfEachLaw.forEach($proposition => $proposition.width(maxWidthFirst));
        secondPropositionOfEachLaw.forEach($proposition => $proposition.width(maxWidthSecond));
    });
};

/**
    Enable the laws to be clicked.
    @method enable
    @return {void}
*/
LawsAreaController.prototype.enable = function() {
    this.lawsArea.isDisabled = false;
    this.removeArrows();
    this.render();
};

/**
    Disable the laws to be clicked.
    @method disable
    @return {void}
*/
LawsAreaController.prototype.disable = function() {
    this.lawsArea.isDisabled = true;
    this.render();
};

/**
    Remove the direction arrows.
    @method removeArrows
    @return {void}
*/
LawsAreaController.prototype.removeArrows = function() {
    this.lawsArea.getLaws().forEach(function(law) {
        law.removeArrow();
    });
};
