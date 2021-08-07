'use strict';

/* global ExpressionArea */

/**
    Control the expression area wherein the user selects terms from an expression.
    @class ExpressionAreaController
    @constructor
    @param {Object} properties Property values that are required.
    @param {Object} properties.$dom jQuery reference to the DOM container for this controller.
    @param {String} properties.expressionType The type of expression to render.
    @param {Object} properties.templates Collection of functions for generating HTML strings.
    @param {LawsController} properties.lawsAreaController Reference to the associated LawsController.
    @param {String} properties.infoButtonLink The link to the info button.
    @param {Function} properties.checkIfLastExpressionIsExpectedAnswer Function to determine whether the last expression is the expected answer.
    @param {Function} properties.showTermSelectionExample Function to show the term selection example.
*/
function ExpressionAreaController(properties) {
    this.$dom = properties.$dom;
    this.expressionType = properties.expressionType;
    this.templates = properties.templates;
    this.lawsAreaController = properties.lawsAreaController;
    this.infoButtonLink = properties.infoButtonLink;
    this.checkIfLastExpressionIsExpectedAnswer = properties.checkIfLastExpressionIsExpectedAnswer;
    this.showTermSelectionExample = properties.showTermSelectionExample;
}

/**
    Render the expression area.
    @method render
    @return {void}
*/
ExpressionAreaController.prototype.render = function() {
    this.$dom.empty();

    const expressionPartsFunction = this.templates.expressionParts;
    const sdk = require('PropositionalCalculusSDK').create();
    const makeExpression = sdk.makeExpression;

    // Render each expression.
    this.expressionArea.expressionContainers.forEach(expressionContainer => {
        expressionContainer.parts = makeExpression(this.expressionType, expressionContainer.symbol).toParts();
        expressionContainer.html = expressionPartsFunction({
            parts: expressionContainer.parts,
        });
    });

    // Render the term and side of law in each instruction.
    this.expressionArea.getTermsInstructions().forEach(instruction => {
        instruction.termHTML = expressionPartsFunction({
            parts: makeExpression(this.expressionType, instruction.term).toParts(),
        });

        instruction.lawSideHTML = expressionPartsFunction({
            parts: makeExpression(this.expressionType, instruction.lawSide).toParts(),
        });
    });

    const expressionAreaHTML = this.templates.expressionArea({
        expressionArea: this.expressionArea,
        manipulationName: this.expressionArea.manipulationName,
    });

    this.$dom.html(expressionAreaHTML);

    this.$dom.find('button.cancel').click(() => this.cancel());

    this.$dom.find('button.next-term').click(() => {
        this.expressionArea.loadNextInstruction();
        this.render();
        this.lawsAreaController.render();
    });

    this.$dom.find('button.apply').click(event => {
        const lastExpressionContainer = this.expressionArea.getLastExpressionContainer();
        const subExpressions = this.expressionArea.getTermsInstructions()
            .map((termInstruction, index) => this.makeColorMark(index + 1))
            .map(colorMark => lastExpressionContainer.symbol.findRootOfMark(colorMark))
            .map(symbol => makeExpression(this.expressionType, symbol));

        const nextSymbol = lastExpressionContainer.symbol;
        const nextExpression = makeExpression(this.expressionType, nextSymbol);
        const isReverseOrComplement = this.expressionArea.manipulationName === 'reverseOrComplement';

        lastExpressionContainer.symbol = lastExpressionContainer.symbol.clone();

        try {
            const variableName = event.target.id;
            const options = isReverseOrComplement ? { variableName } : {};

            sdk.runManipulation(
                this.expressionArea.manipulationName,
                nextExpression,
                subExpressions,
                options
            );
        }
        catch (error) {
            const errorMessage = error.getMessage(this.expressionType);

            this.expressionArea.addError(errorMessage);
            this.render();
            this.lawsAreaController.render();
            return;
        }

        this.expressionArea.addSymbol(nextExpression.root);
        this.cancel();
        this.checkIfLastExpressionIsExpectedAnswer();
    });

    this.$dom.find('button.show-me-how').click(() => this.showTermSelectionExample());

    this.$dom.find('button.ok').click(() => this.cancel());

    this.$dom.find('button.undo').click(() => {
        this.expressionArea.expressionContainers.pop();
        this.cancel();
        this.render();
    });

    const $symbols = this.$dom.find('div.expression:not(.disabled) span');

    // Add or remove the marking on the clicked symbol.
    $symbols.click(event => {
        const symbolIndex = $symbols.index(event.target);
        const lastExpressionContainer = this.expressionArea.getLastExpressionContainer();
        let clickedSymbol = lastExpressionContainer.parts[symbolIndex].symbol;
        const currentInstruction = this.expressionArea.getCurrentInstruction();

        // Build a list of symbols to try to click.
        const symbolsToClick = [ clickedSymbol ];

        // Select all the preceding NOT operators.
        clickedSymbol = this._getPrecedingNotOperators(clickedSymbol);
        symbolsToClick.unshift(clickedSymbol);

        // If the shown term's root is an operator, then try to include that operator in the selection.
        if (currentInstruction.term.isOperator()) {
            clickedSymbol = this._getAncestorWithSimilarStructure(clickedSymbol, currentInstruction.term);
            symbolsToClick.unshift(clickedSymbol);
        }

        // Try to click each symbol in |symbolsToClick| until a symbol is successfully clicked.
        for (let index = 0; index < symbolsToClick.length; ++index) {
            const wasClicked = this._tryToClickSymbol(symbolsToClick[index]);

            if (wasClicked) {
                break;
            }
        }

        this.render();
        this.lawsAreaController.render();
    });
};

/**
    Try to click |symbolToClick| by adding/removing a mark.
    @method _tryToClickSymbol
    @param {MathSymbol} symbolToClick The symbol to try to mark or unmark.
    @return {Boolean} Whether |symbolToClick| had a mark added or removed.
*/
ExpressionAreaController.prototype._tryToClickSymbol = function(symbolToClick) {
    var succeededInClicking = false;
    var currentInstruction = this.expressionArea.getCurrentInstruction();
    var currentInstructionIndex = this.expressionArea.instructions.indexOf(currentInstruction);
    var colorToUse = this.makeColorMark(currentInstructionIndex);
    var lastExpressionContainer = this.expressionArea.getLastExpressionContainer();

    // Clicked symbol is marked with |colorToUse|, so remove the mark.
    if (symbolToClick.hasMark(colorToUse)) {
        succeededInClicking = true;

        // Find the marked ancestors with |colorToUse|.
        var clickedSymbolAncestors = lastExpressionContainer.symbol.findAncestors(symbolToClick);
        var markedAncestors = clickedSymbolAncestors.filter(function(ancestor) {
            return (ancestor.hasMark(colorToUse));
        });

        // Length of 1 means only |symbolToClick| is marked.
        var onlyClickedSymbolMarked = (markedAncestors.length === 1);

        if (onlyClickedSymbolMarked) {
            symbolToClick.removeMarkRecursive(colorToUse);
        }
        else {

            // Remove mark from furthest marked ancestor, and recursively remove mark from 2nd-furthest marked ancestor.
            markedAncestors[0].removeMark(colorToUse);
            markedAncestors[1].removeMarkRecursive(colorToUse);
        }

        var noMarksLeft = (lastExpressionContainer.symbol.findRootOfMark(colorToUse) === null);

        // If the |colorToUse| has been completely removed, then hide the Apply and Next buttons.
        if (noMarksLeft) {
            lastExpressionContainer.applyButton.isShown = lastExpressionContainer.nextButton.isShown = false;
        }
    }

    // Clicked symbol is unmarked, so mark the clicked symbol with |colorToUse|.
    else if (symbolToClick.isUnmarked()) {
        var symbolToMark = symbolToClick;

        // Search for highest symbol in tree marked with |colorToUse|.
        var rootOfMark = lastExpressionContainer.symbol.findRootOfMark(colorToUse);

        // If there are already marked symbols, then the symbol to mark is the common ancestor between the marked symbols and |symbolToClick|.
        if (rootOfMark) {
            symbolToMark = lastExpressionContainer.symbol.findCommonAncestor(rootOfMark, symbolToMark);
        }

        /*
            Perform marking if the symbol to mark has descendants that are either unmarked or already have |colorToUse|.
            Otherwise, do not mark |symbolToMark|.
        */
        if (symbolToMark.descendantHasSpecificMarkOrIsUnmarked(colorToUse)) {
            succeededInClicking = true;
            symbolToMark.addMarkRecursive(colorToUse);

            var lastTermInstruction = this.expressionArea.getTermsInstructions().pop();
            var isLastTermInstruction = (currentInstruction === lastTermInstruction);

            // If on the last instruction, then show the Apply button.
            if (isLastTermInstruction) {
                lastExpressionContainer.applyButton.isShown = true;
                lastExpressionContainer.applyButton.isDisabled = false;
            }

            // Otherwise, show the Next button.
            else {
                lastExpressionContainer.nextButton.isShown = true;
            }
        }
    }

    return succeededInClicking;
};

/**
    Set the initial symbolic expression. Clear any existing expressions.
    @method setInitialSymbolicExpression
    @param {MathSymbol} symbol The initial symbolic expression that the user will manipulate.
    @return {void}
*/
ExpressionAreaController.prototype.setInitialSymbolicExpression = function(symbol) {
    this.symbol = symbol;
    if (this.expressionArea) {
        this.expressionArea.removeAllMarks();
    }

    this.expressionArea = new ExpressionArea(this.infoButtonLink, this.expressionType);
    this.render();
};

/**
    Prompt the user to select a law.
    @method promptLawSelection
    @return {void}
*/
ExpressionAreaController.prototype.promptLawSelection = function() {
    this.expressionArea.promptLawSelection();
    this.render();
};

/**
    Start the expression area.
    @method start
    @return {void}
*/
ExpressionAreaController.prototype.start = function() {
    this.expressionArea.addSymbol(this.symbol);
    this.promptLawSelection();
};

/**
    Set the user-selected manipulation.
    @method setManipulationTerms
    @param {Array} terms Array of {MathSymbol}. The user-selected manipulation's terms.
    @param {MathSymbol} lawSide The side of the law containing the |terms|.
    @param {String} manipulationName The name of the manipulation.
    @return {void}
*/
ExpressionAreaController.prototype.setManipulationTerms = function(terms, lawSide, manipulationName) {
    this.expressionArea.addManipulationTerms(terms, lawSide, manipulationName)
                       .enableLastExpression()
                       .loadNextInstruction()
                       .showCancelButton()
                       .hideUndoButtons();
    this.render();
};

/**
    Disable the expression from being manipulated.
    @method disable
    @return {void}
*/
ExpressionAreaController.prototype.disable = function() {
    this.expressionArea.removeAllMarks()
                       .clearInstructions()
                       .addFeedbackInstruction()
                       .disableExpressionContainers()
                       .hideCancelButton()
                       .hideUndoButtons()
                       .removeError();
    this.render();
};

/**
    Return the color name given a number.
    @method makeColorMark
    @param {Number} number The given number.
    @return {String} The color name with the given number.
*/
ExpressionAreaController.prototype.makeColorMark = function(number) {
    return ('color-' + number);
};

/**
    Cancel the current law manipulation.
    @method cancel
    @return {void}
*/
ExpressionAreaController.prototype.cancel = function() {
    this.expressionArea.removeAllMarks()
                       .promptLawSelection()
                       .disableExpressionContainers()
                       .hideCancelButton()
                       .removeError();
    this.render();
    this.lawsAreaController.enable();
};

/**
    Find the ancestor of |symbol| that has the most similar structure to |term|. Namely, the structure of the operators.
    Ex: If |term| is NOT a, then check if |symbol| is NOT or if |symbol|'s parent is NOT.
    @method _getAncestorWithSimilarStructure
    @private
    @param {MathSymbol} symbol Find the ancestor of this with the most similar structure to |term|.
    @param {MathSymbol} term The structure to compare to.
    @return {MathSymbol} The ancestor of |symbol| that has the most similar structure to |term|.
*/
ExpressionAreaController.prototype._getAncestorWithSimilarStructure = function(symbol, term) {
    var ancestors = this.expressionArea.getLastExpressionContainer().symbol.findAncestors(symbol);
    var ancestorsWithSymbolFirst = ancestors.reverse();

    // Default match is the |symbol| itself.
    var closestMatch = symbol;
    var largestMatchLength = 0;

    var self = this;

    term.findOperatorPaths().forEach(function(path) {
        var leafFirstPath = path.reverse();
        var match = self._findFirstStructureMatch(ancestorsWithSymbolFirst, leafFirstPath);

        // If a match is found and the match is longer than other matches.
        if (Boolean(match) && (leafFirstPath.length > largestMatchLength)) {
            closestMatch = match;
            largestMatchLength = leafFirstPath.length;
        }
    });

    return closestMatch;
};

/**
    Find the first match in |path| to |structureToFind|.
    @method _findFirstStructureMatch
    @private
    @param {Array} path Array of {MathSymbol}. The path to compare to.
    @param {Array} structureToFind Array of {MathSymbol}. The structure to find in |path|.
    @return {MathSymbol} The first match in |path| to |structureToFind|. Return undefined if no match found.
*/
ExpressionAreaController.prototype._findFirstStructureMatch = function(path, structureToFind) {

    // Path can start from index 0 to (path.length - structureToFind.length).
    var possiblePathStarts = path.filter(function(value, index) {
        return (index <= (path.length - structureToFind.length));
    });

    // Try each possible start to find a match.
    var possibleMatches = possiblePathStarts.map(function(possiblePathStart, pathStartIndex) {

        // Match found if every symbol matches from |possiblePathStarts| with each symbol in |structureToFind|.
        var foundMatch = structureToFind.every(function(currentStructureSymbol, structureIndex) {
            var currentPathSymbol = path[pathStartIndex + structureIndex];

            return (currentPathSymbol.name === currentStructureSymbol.name);
        });
        var lastSymbolInPossiblePath = path[pathStartIndex + structureToFind.length - 1];

        return (foundMatch ? lastSymbolInPossiblePath : null);
    });

    var matches = possibleMatches.filter(function(possibleMatch) {
        return Boolean(possibleMatch);
    });

    return matches[0];
};

/**
    Return the top-most NOT operator that is directly above |symbol| through only NOT operators.
    Ex: If expression is (NOT NOT a) OR b and user clicks a, then return (NOT NOT a).
    @method _getPrecedingNotOperators
    @private
    @param {MathSymbol} symbol Find preceding NOT operators of this.
    @return {MathSymbol} The preceding NOT operator of |symbol|.
*/
ExpressionAreaController.prototype._getPrecedingNotOperators = function(symbol) {
    var ancestors = this.expressionArea.getLastExpressionContainer().symbol.findAncestors(symbol);
    var ancestorsWithSymbolFirst = ancestors.reverse();
    var index = 1;

    while ((index < ancestorsWithSymbolFirst.length) && (ancestorsWithSymbolFirst[index].name === 'NOT')) {
        index++;
    }

    return ancestorsWithSymbolFirst[index - 1];
};
