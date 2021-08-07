'use strict';

/* global getElementClassNameByType, replaceStringVariables, commonFunctions, numberOfLinesOfCode, downloadImage,
   buildStyleEscapeDictionary, colorEscapeDictionary, getElementClassByType, testProperties, escapeStyleValues,
   Progression, Level, Question, PropertyAndType, ElementController, ElementVariant, ElementTableCell, ElementDropdownOption,
   ExplanationElementType, addSpreadsheetHeaders, removeSpreadsheetHeaders, isValueDefined, makeImageElementForExplanation,
   makeImageURLs, makeSpreadsheetElementForExplanation, makeTableElementForExplanation, createParagraphTag, replaceBackticks */
/* exported fillColorModalNameToXMLName */

/**
    Common models, templates, styles, and functions used by ProgressionBuilder and ProgressionPlayer.

    @module ProgressionUtilities
    @return {ProgressionUtilities}
*/
function ProgressionUtilities() {
    buildStyleEscapeDictionary();

    <%= grunt.file.read(hbs_output) %>
    this.templates = this[this._name];
    this.colorEscapeDictionary = colorEscapeDictionary;
    require('utilities').addIfConditionalHandlebars();
}

/**
    Dictionary of templates for this module.
    @property templates
    @type Object
*/
ProgressionUtilities.prototype.templates = {};

/**
    The name of the module.
    @property _name
    @type String
*/
ProgressionUtilities.prototype._name = '<%= grunt.option("tool") %>'; // eslint-disable-line no-underscore-dangle

/**
    CSS styles defined for this tool.
    @property css
    @type String
*/
ProgressionUtilities.prototype.css = '<style><%= grunt.file.read(css_filename) %></style>';

/**
    Map color name to color's hex value. Color name is key (ex: zyante-black); key's value is
    color's hex values.
    @property colorEscapeDictionary
    @type Object
*/
ProgressionUtilities.prototype.colorEscapeDictionary = {};

/**
    Return a new {Progression}.
    @method createProgression
    @return {Progression} The new progression object.
*/
ProgressionUtilities.prototype.createProgression = function(...args) {
    const progression = Object.create(Progression.prototype);

    Progression.apply(progression, args);
    return progression;
};

/**
    Return a new {Level}.
    @method createLevel
    @return {Level} The new level object.
*/
ProgressionUtilities.prototype.createLevel = function(...args) {
    const level = Object.create(Level.prototype);

    Level.apply(level, args);
    return level;
};

/**
    Return a new {Question}.
    @method createQuestion
    @return {Question} The new question object.
*/
ProgressionUtilities.prototype.createQuestion = function(...args) {
    const question = Object.create(Question.prototype);

    Question.apply(question, args);
    return question;
};

/**
    Return a new {ElementVariant}.
    @method createElementVariant
    @return {ElementVariant} The new progression question element object.
*/
ProgressionUtilities.prototype.createElementVariant = function(...args) {
    const elementVariant = Object.create(ElementVariant.prototype);

    ElementVariant.apply(elementVariant, args);
    return elementVariant;
};

/**
    Return a new {Element} based on given |type|.
    @method createElementByType
    @param {Object} properties The properties to add to the new element.
    @param {String} properties.type The type of element to create.
    @return {Element} The new element.
*/
ProgressionUtilities.prototype.createElementByProperties = function(properties) {
    const ElementClass = getElementClassByType(properties.type);

    return new ElementClass(properties);
};

/**
    Return the class name for the given type of element.
    @method getElementClassNameByType
    @param {String} type The type of element.
    @return {String} The class name of the type of element.
*/
ProgressionUtilities.prototype.getElementClassNameByType = function(type) {
    return getElementClassNameByType(type);
};

/**
    Return the most specific defined |property| value: question > level > progression.

    @method getMostSpecificProperty
    @param {String} property The property to find the most specific value for.
    @param {Progression} progression The progression object.
    @param {Level} level The current level in the progression.
    @param {Question} question The current question in the progression.
    @return {String} The most specific defined |property| value.
*/
ProgressionUtilities.prototype.getMostSpecificProperty = function(property, progression, level, question) {
    let value = null;

    if (isValueDefined(question, property)) {
        value = question[property];
    }
    else if (isValueDefined(level, property)) {
        value = level[property];
    }
    else if (isValueDefined(progression, property)) {
        value = progression[property];
    }

    return value;
};

/**
    Get the most specific style value for an element.
    @method getMostSpecificStyleValueOfElement
    @param {String} styleName The style name to find.
    @param {Element} element The element on which to find the most specific style.
    @param {Level} level The current level in the progression.
    @param {Question} question The current question in the progression.
    @return {String} The most specific defined style value of the element. Returns null if no style defined.
*/
ProgressionUtilities.prototype.getMostSpecificStyleValueOfElement = function(styleName, element, level, question) {
    let value = null;
    const questionVariant = question && question.elementVariants.find(variant => variant.id === element.id);
    const levelVariant = level && level.elementVariants.find(variant => variant.id === element.id);

    if (questionVariant && questionVariant.style && questionVariant.style[styleName]) {
        value = questionVariant.style[styleName];
    }
    else if (levelVariant && levelVariant.style && levelVariant.style[styleName]) {
        value = levelVariant.style[styleName];
    }
    else if (element && element.style && element.style[styleName]) {
        value = element.style[styleName];
    }

    return value;
};

/**
    Return a new instance of {ElementController}.
    @method inheritElementController
    @return {ElementController} The new instance.
*/
ProgressionUtilities.prototype.inheritElementController = function() {
    return new ElementController();
};

/**
    Return a new {ElementController}.
    @method createElementController
    @return {ElementController} The new element controller object.
*/
ProgressionUtilities.prototype.createElementController = function(...args) {
    const elementController = Object.create(ElementController.prototype);

    ElementController.apply(elementController, args);
    return elementController;
};

/**
    Return a new {ElementDropdownOption}.
    @method createElementDropdownOption
    @return {ElementDropdownOption} The new dropdown option object.
*/
ProgressionUtilities.prototype.createElementDropdownOption = function(...args) {
    const elementDropdownOption = Object.create(ElementDropdownOption.prototype);

    ElementDropdownOption.apply(elementDropdownOption, args);
    return elementDropdownOption;
};

/**
    Return a new {ElementTableCell}.
    @method createElementTableCell
    @return {ElementTableCell} The cell object.
*/
ProgressionUtilities.prototype.createElementTableCell = function(...args) {
    const elementTableCell = Object.create(ElementTableCell.prototype);

    ElementTableCell.apply(elementTableCell, args);
    return elementTableCell;
};

/**
    Return a new {PropertyAndType}.
    @method createPropertyAndType
    @return {PropertyAndType} The new dropdown option object.
*/
ProgressionUtilities.prototype.createPropertyAndType = function(...args) {
    const elementPropertyAndType = Object.create(PropertyAndType.prototype);

    PropertyAndType.apply(elementPropertyAndType, args);
    return elementPropertyAndType;
};

/**
    Attempt to download an image from zybooks.com, then from Google Drive.
    @method downloadImage
    @param {Object} parentResource The parent resource of the module.
    @param {String} imageID The image ID to download.
    @param {Object} $image jQuery object for where to load the image.
    @param {String} errorMessage The message to display if download fails.
    @return {void}
*/
ProgressionUtilities.prototype.downloadImage = function(parentResource, imageID, $image, errorMessage) {
    const imageSources = this.imageURLs(parentResource, imageID);

    downloadImage($image, imageSources, errorMessage);
};

/**
    Make a list of URLs to try to download given an imageID. First from Amazon, then from Google Drive.
    @method imageURLs
    @param {Object} parentResource The parent resource of the module.
    @param {String} imageID The image ID to download.
    @return {void}
*/
ProgressionUtilities.prototype.imageURLs = function(parentResource, imageID) {
    return makeImageURLs(parentResource, imageID);
};

const fillColorModalNameToXMLName = {
    blue: 'zyAnimatorBlue',
    green: 'zyAnimatorGreen',
    orange: 'zyAnimatorOrange',
};

ProgressionUtilities.prototype.fillColorModalNameToXMLName = fillColorModalNameToXMLName;

/**
    Convert the modal name to the XML name for the given fill color.
    @method convertFillColorModalNameToXMLName
    @param {String} modalName The color name in the modal, like: blue
    @return {String} The XML color name, like: zyAnimatorBlue
*/
ProgressionUtilities.prototype.convertFillColorModalNameToXMLName = function(modalName) {
    let xmlName = null;

    // The color is a standard color, like: blue
    if (this.fillColorModalNameToXMLName[modalName]) {
        xmlName = this.fillColorModalNameToXMLName[modalName];
    }

    // Don't convert if the color is default since the default doesn't need to be recorded.
    else if (modalName !== 'default') {
        xmlName = modalName;
    }

    return xmlName;
};

/**
    Whether there's any remaining explanation element.
    @private
    @method _isExplanationElementRemaining
    @param {Array} explanationElementTypes An array of the different explanation element types possible.
    @param {String} str The string in which to search for explanation elements.
    @return {Boolean}
*/
ProgressionUtilities.prototype._isExplanationElementRemaining = function(explanationElementTypes, str) { // eslint-disable-line no-underscore-dangle
    return explanationElementTypes.some(explanationElementType => explanationElementType.isInstanceRemaining(str));
};

/**
    Whether there's any remaining explanation element.
    @private
    @method getExplanationElementMatches
    @param {Array} explanationElementTypes An array of the different explanation element types possible.
    @param {String} str The string in which to search for explanation elements.
    @return {Boolean}
*/
ProgressionUtilities.prototype.getExplanationElementMatches = function(explanationElementTypes, str) {
    return explanationElementTypes.map(explanationElementType => explanationElementType.getMatch(str));
};

/**
    Processes the explanation generating <img> tags where needed. Returns an HTML string.
    @method processExplanation
    @param {String} parentResource Reference to the parent of this module.
    @param {String} textExplanation The raw explanation for this question.
    @param {Boolean} [addURLFallback=false] Whether to add an image URL fallback.
    @return {String}
*/
ProgressionUtilities.prototype.processExplanation = function(parentResource, textExplanation, addURLFallback = false) {
    const imageRegEx = /\[image\s*(\d*)\s*(\d*)]\(((\w|\-)+)\)/;
    const spreadsheetRegEx = /\[spreadsheet\s*(\d*)\s*(\d*)\s*(\d*)\]\s*\[([^\]]*)\]\s*(\[([^\]]*)\])?/;
    const tableRegEx = /\[table\s*(hrow)?\s*(hcol)?\s*(\d*)\s*(\d*)\s*(\d*)\]\s*\[([^\]]*)\]/;

    /*
        [^\x05] used b/c Firefox v68 does not support s flag.
        Firefox v78+ should support s flag at which time, change this line in two ways:
        1. [^\x05] -> .
        2. Add s flag
    */
    const tableEscapedRegEx = /\\\[table\s*(hrow)?\s*(hcol)?\s*(\d*)\s*(\d*)\s*(\d*)\\\]\s*\\\[(((?!\\\])[^\x05])*)\\\]/; // eslint-disable-line no-control-regex

    let remainingExplanation = textExplanation;
    const explanationParts = [];
    const explanationElementTypes = [
        new ExplanationElementType(imageRegEx, makeImageElementForExplanation, [ parentResource, addURLFallback ]),
        new ExplanationElementType(spreadsheetRegEx, makeSpreadsheetElementForExplanation),
        new ExplanationElementType(tableRegEx, makeTableElementForExplanation),
        new ExplanationElementType(tableEscapedRegEx, makeTableElementForExplanation),
    ];

    /* Search for special notation in the explanation and process it.
     * Special notation is used to include: images, spreadsheets, and tables.
     * When a special notation is found:
     * 1. Builds a <p> tag with the text before the element.
     * 2. Adds the element.
     * 3. Continues to the next element. If there isn't any othe relement, the rest of the text is added in a <p> tag.
     *
     * Image notation: [image](image-id)
     *
     * Spreadsheet notation: [spreadsheet][a1&b1
     * a2&b2]
     * [blue&orange
     * blue&orange]
     *
     * Table notation:
     * [table][a1&a2
     * b1&b2]
     *
     * Ex: If |remainingExplanation| = "Explanation: [image](image-id) explained":
     *   The regEx finds an image notation present in the explanation, so enter while.
     *   Find the index of "[image](image-id)" and extract the "image-id" using imageRegEx.exec.
     *   Get the string before "[image](image-id)", that is "Explanation: ", and place it in a <p> tag via the createParagraphTag() function.
     *   Create an <img> whose ID is the image ID.
     *   Update |remainingExplanation| to the value after "[image](image-id)", in this example that is " explained".
     *   The regEx does not match any other notation, so exit the while and add the end of the explanation in a new <p> tag: " explained".
     */
    while (this._isExplanationElementRemaining(explanationElementTypes, remainingExplanation)) {
        const matchResults = this.getExplanationElementMatches(explanationElementTypes, remainingExplanation);
        const closerMatchResult = matchResults.reduce((prev, curr) => (prev.index < curr.index) ? prev : curr); // eslint-disable-line no-confusing-arrow
        const closerMatch = closerMatchResult.match;
        const $element = closerMatchResult.elementType.makeElement(closerMatch);

        // Put each line before match into <p> tags, then add the $element.
        const textBeforeMatch = remainingExplanation.slice(0, closerMatch.index);

        explanationParts.push(createParagraphTag(textBeforeMatch));
        explanationParts.push($element);

        // Update values for next iteration.
        const lastEndIndex = closerMatch.index + closerMatch[0].length;

        remainingExplanation = remainingExplanation.slice(lastEndIndex);
    }

    // Add remaining explanation.
    if (remainingExplanation.length > 0) {
        explanationParts.push(createParagraphTag(remainingExplanation));
    }

    // Build the resulting explanation as an HTML string.
    return explanationParts.map($element => $element[0].outerHTML).join('');
};

/**
    Post process the explanation. Sets the HTML in the explanation area and loads the images.
    @method postProcessExplanation
    @param {Object} parameters An object containing parameters.
    @param {String} parameters.id The unique id given to this module.
    @param {String} parameters.parentResource Reference to the parent of this module.
    @return {void}
*/
ProgressionUtilities.prototype.postProcessExplanation = function(parameters) {
    const id = parameters.id;
    const $explanationArea = $(`#${id} .zyante-progression-explanation`);
    const progressionUtilities = require('ProgressionUtilities').create();

    $explanationArea.html($explanationArea.text());
    $explanationArea.find('.explanation-image').each((index, element) => {
        const $element = $(element);
        const imageID = $element.attr('image-id');

        progressionUtilities.downloadImage(parameters.parentResource, imageID, $(element), '[Error: Image did not load. Try refreshing.]');
    });
    parameters.parentResource.latexChanged();
};

/**
    Replace each backtick pair with <code> tag.
    @method replaceBackticks
    @param {String} str The string in which to replace.
    @return {String} HTML with backticks replaced as <code>.
*/
ProgressionUtilities.prototype.replaceBackticks = function(str) {
    return replaceBackticks(str);
};

/**
    Escape each property's value in |style|.
    @method escapeStyleValues
    @param {Object} style Each key is a property and each value is that property's value.
    @return {Object} Escaped styles
*/
ProgressionUtilities.prototype.escapeStyleValues = function(style) {
    return escapeStyleValues.call(this, style);
};

/**
    Replace the variables in the given string.
    @method replaceStringVariables
    @param {String} string The string that may have variables to replace.
    @param {Sk.module} module Skulpt Python module that has variables.
    @return {String} The string with variables updated with actual values.
*/
ProgressionUtilities.prototype.replaceStringVariables = function(string, module) {
    return replaceStringVariables(string, module);
};

/**
    Build a new Python module with given code.
    @method makePythonModule
    @param {String} progressionCode The code from the {Progression} to run through the new module.
    @param {String} levelCode The code from the {level} to run through the new module.
    @param {String} questionCode The code from the {Question} to run through the new module.
    @return {Sk.module} Skulpt Python module with given code run through.
*/
ProgressionUtilities.prototype.makePythonModule = function(progressionCode, levelCode, questionCode) {
    return require('utilities').makePythonModule(commonFunctions + progressionCode + levelCode + questionCode);
};

/**
    Ensure the table element's CSS colors are printable.
    @method makeTableElementToRender
    @param {ElementTable} elementToRender The table element to render.
    @return {ElementTable} The table element to render.
*/
ProgressionUtilities.prototype.makeTableElementToRender = function(elementToRender) {
    if (!elementToRender.listName && !elementToRender.tableData.data) {
        elementToRender.tableData.forEach(row => row.forEach(cell => cell.changeToPrintableStyles()));
    }

    return elementToRender;
};

/**
    Revise the error message's line number by subtracting the number of prefix lines of code.
    @method reviseLineNumberInErrorMessage
    @param {String} errorMessage The error message to revise.
    @param {String} progressionCode The code from the {Progression} to run through the new module.
    @param {String} levelCode The code from the {Level} to run through the new module.
    @return {String} The revised error message.
*/
ProgressionUtilities.prototype.reviseLineNumberInErrorMessage = function(errorMessage, progressionCode, levelCode) {

    // 1 line of code is always added to Python code in makePythonModule() from utilities (to import common functions).
    const linesOfCodeAddedInUtilities = 2;
    const commonLinesOfCode = numberOfLinesOfCode(commonFunctions) + linesOfCodeAddedInUtilities;
    const firstLineOfLevelCode = commonLinesOfCode + numberOfLinesOfCode(progressionCode) + 1;
    const firstLineOfQuestionCode = firstLineOfLevelCode + numberOfLinesOfCode(levelCode);

    return errorMessage.replace(/\son\sline\s(\d+)/g, (match, lineNumberString) => {
        const lineNumber = parseInt(lineNumberString, 10);

        // 1 line of code is always added to Python code in makePythonModule() from utilities (to import common functions).
        let revisedLineNumber = lineNumber - commonLinesOfCode;
        let areaOfCodeWithError = 'global';

        // Error in {Question}'s code
        if (lineNumber >= firstLineOfQuestionCode) {
            revisedLineNumber = lineNumber - firstLineOfQuestionCode + 1;
            areaOfCodeWithError = 'question';
        }
        else if (lineNumber >= firstLineOfLevelCode) {
            revisedLineNumber = lineNumber - firstLineOfLevelCode + 1;
            areaOfCodeWithError = 'level';
        }

        return (revisedLineNumber > 0) ? ` on line ${revisedLineNumber} of ${areaOfCodeWithError}'s code` : '';
    });
};

/**
    Add spreadsheet headers to the table.
    @method addSpreadsheetHeaders
    @param {Array} table Array of {Array} of {String}. 2D array of cells.
    @return {void}
*/
ProgressionUtilities.prototype.addSpreadsheetHeaders = function(table) {
    addSpreadsheetHeaders(table);
};

/**
    Remove the headers from the table.
    @method removeSpreadsheetHeaders
    @param {Array} table Array of {Array} of {String}. 2D array of cells.
    @param {String} [which=''] From which table to remove the spreadsheet headers.
    @return {void}
*/
ProgressionUtilities.prototype.removeSpreadsheetHeaders = function(table, which = '') {
    removeSpreadsheetHeaders(table, which);
};

/**
    Test that object has the expected properties and each property has the expected type.
    @method testProperties
    @param {Object} object The object being tested.
    @param {Array} objectPropertiesAndTypes The expected properties and property types.
    @param {String} objectName The name of the object.
    @return {void}
*/
ProgressionUtilities.prototype.testProperties = function(object, objectPropertiesAndTypes, objectName) {
    testProperties.call(this, object, objectPropertiesAndTypes, objectName);
};

const ProgressionUtilitiesExport = {
    create: function() {
        if (!this._progressionUtilities) {
            this._progressionUtilities = new ProgressionUtilities();
        }
        return this._progressionUtilities;
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
    runTests: function() {
        <%= grunt.file.read(tests) %>
    },
};

module.exports = ProgressionUtilitiesExport;
