'use strict';

/* global Button, ExpressionContainer, TermInstruction, TextInstruction */

/**
    Model that defines the expression area.
    @class ExpressionArea
    @constructor
    @param {String} infoButtonLink A link to the info button.
    @param {String} expressionType The type of this expression: 'proposition' or 'digital'.
*/
function ExpressionArea(infoButtonLink, expressionType) {
    this.expressionContainers = [];
    this.instructions = [];
    this.cancelButton = new Button();
    this.errorMessage = '';
    this.okButton = new Button();
    this.infoButtonLink = infoButtonLink;
    this.expressionType = expressionType;
}

/**
    Add the given symbolic expression.
    @method addSymbol
    @param {Symbol} symbol The symbolic expression to add.
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.addSymbol = function(symbol) {
    this.expressionContainers.push(new ExpressionContainer(symbol));
    return this;
};

/**
    Coach the user to select a law.
    @method promptLawSelection
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.promptLawSelection = function() {
    const name = this.expressionType === 'digital' ? 'property' : 'law';
    const selectLawText = `Select a ${((this.expressionContainers.length > 1) ? 'next ' : '')}${name} from the right to apply`;

    this.clearInstructions();
    this.instructions.push(new TextInstruction(selectLawText, 1));
    this.instructions[0].isShown = true;
    return this;
};

/**
    Enable the last expression.
    @method enableLastExpression
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.enableLastExpression = function() {
    var lastContainer = this.getLastExpressionContainer();

    lastContainer.isDisabled = false;
    lastContainer.isColored = true;
    return this;
};

/**
    Disable the expression containers.
    @method disableExpressionContainers
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.disableExpressionContainers = function() {
    this.expressionContainers.forEach(function(container) {
        container.isDisabled = true;
        container.isColored = false;
        container.applyButton.isShown = false;
        container.nextButton.isShown = false;
    });

    if (this.expressionContainers.length > 1) { // eslint-disable-line no-magic-numbers
        this.getLastExpressionContainer().undoButton.isShown = true;
    }
    return this;
};

/**
    Add user-selected manipulation terms to newly-created instructions.
    @method addManipulationTerms
    @param {Array} terms Array of {MathSymbol} The manipulation terms to add.
    @param {MathSymbol} lawSide The side of the law containing the |terms|.
    @param {String} manipulationName The name of the manipulation.
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.addManipulationTerms = function(terms, lawSide, manipulationName) {
    this.manipulationName = manipulationName;
    var self = this;

    terms.forEach(function(term, index) {
        self.instructions.push(new TermInstruction(term, lawSide, (index + 2))); // eslint-disable-line no-magic-numbers
    });
    return this;
};

/**
    Clear the instructions.
    @method clearInstructions
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.clearInstructions = function() {
    this.instructions.length = 0;
    return this;
};

/**
    Disable the current instruction and enable the next instruction.
    @method loadNextInstruction
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.loadNextInstruction = function() {

    // Find the index of the currently enabled instruction.
    var currentInstruction = this.instructions.filter(function(instruction) {
        return instruction.isShown;
    })[0];

    currentInstruction.isShown = false;

    // Hide next button.
    if (currentInstruction instanceof TermInstruction) {
        this.getLastExpressionContainer().nextButton.isShown = false;
    }

    var indexOfNextInstruction = this.instructions.indexOf(currentInstruction) + 1; // eslint-disable-line no-magic-numbers
    var nextInstruction = this.instructions[indexOfNextInstruction];

    nextInstruction.isShown = true;
    if (nextInstruction instanceof TermInstruction) {
        nextInstruction.term.addMarkRecursive('bold');
        nextInstruction.term.addMarkRecursive('color-' + (indexOfNextInstruction));
    }
    return this;
};

/**
    Remove all marks from each term and each expression.
    @method removeAllMarks
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.removeAllMarks = function() {
    this.getTermsInstructions().forEach(function(termInstruction) {
        termInstruction.term.removeAllMarks();
    });
    this.expressionContainers.forEach(function(expressionContainer) {
        expressionContainer.symbol.removeAllMarks();
    });
    return this;
};

/**
    Show the cancel button.
    @method showCancelButton
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.showCancelButton = function() {
    this.cancelButton.isShown = true;
    this.cancelButton.isDisabled = false;
    return this;
};

/**
    Hide the cancel button.
    @method hideCancelButton
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.hideCancelButton = function() {
    this.cancelButton.isShown = false;
    return this;
};

/**
    Hide the undo buttons.
    @method hideUndoButtons
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.hideUndoButtons = function() {
    this.expressionContainers.forEach(function(container) {
        container.undoButton.isShown = false;
    });
    return this;
};

/**
    Add an error message.
    @method addError
    @param {String} errorMessage The error message to show.
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.addError = function(errorMessage) {
    this.errorMessage = errorMessage;
    this.okButton.isShown = true;
    this.cancelButton.isShown = false;

    this.expressionContainers.forEach(function(container) {
        container.isDisabled = true;
        container.applyButton.isShown = false;
    });

    // Remove bold markings and disable each {TermInstruction}.
    this.getTermsInstructions().forEach(function(termInstruction) {
        termInstruction.isDisabled = true;
        termInstruction.term.removeMarkRecursive('bold');
    });
    return this;
};

/**
    Remove the error.
    @method removeError
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.removeError = function() {
    this.errorMessage = '';
    this.okButton.isShown = false;
    this.cancelButton.isDisabled = false;
    this.getLastExpressionContainer().applyButton.isDisabled = false;
    return this;
};

/**
    Show the feedback instruction.
    @method addFeedbackInstruction
    @return {ExpressionArea} Reference to this object.
    @chainable
*/
ExpressionArea.prototype.addFeedbackInstruction = function() {
    var feedbackInstruction = new TextInstruction('See feedback below.', null);

    feedbackInstruction.isShown = feedbackInstruction.isDisabled = true;
    this.instructions.push(feedbackInstruction);
    return this;
};

/**
    Return an array of the {TermInstruction}s.
    @method getTermsInstructions
    @return {Array} Array of {TermInstruction}. The {TermInstruction}s in |instructions|.
*/
ExpressionArea.prototype.getTermsInstructions = function() {
    return this.instructions.filter(function(instruction) {
        return (instruction instanceof TermInstruction);
    });
};

/**
    Return the last {ExpressionContainer} in |expressionContainers|.
    @method getLastExpressionContainer
    @return {ExpressionContainer}  The last expression container.
*/
ExpressionArea.prototype.getLastExpressionContainer = function() {
    return this.expressionContainers[this.expressionContainers.length - 1]; // eslint-disable-line no-magic-numbers
};

/**
    Return the currently shown instruction.
    @method getCurrentInstruction
    @return {Instruction} The currently shown instruction.
*/
ExpressionArea.prototype.getCurrentInstruction = function() {
    return this.instructions.filter(function(instruction) {
        return instruction.isShown;
    })[0];
};
