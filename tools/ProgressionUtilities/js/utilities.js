'use strict';

/* exported commonFunctions, getElementClassByType, replaceStringVariables, numberOfLinesOfCode, buildStyleEscapeDictionary, downloadImage,
            escapeStyleValues, pythonVariableIsList, getValuesFromPythonList, isTwoDimensionalList, getTableDataFromList,
            addSpreadsheetHeaders, removeSpreadsheetHeaders, isValueDefined, makeImageElementForExplanation,
            makeImageURLs, makeSpreadsheetElementForExplanation, makeTableElementForExplanation, getPythonVariableName,
            createParagraphTag */
/* global TwoDimensionalList, ElementTable, ProgressionUtilities, fillColorModalNameToXMLName */

// Add commonly used functions.
const commonFunctions = `from common_functions import make_words_from_list
import random
import math
import string
import statistics

# Keep these two for backwards compatibility
def pickFrom(list, exclude=[]):
    return pick_from(list, exclude)

def pickFromRange(start, end, exclude=[]):
    return pick_from_range(start, end, exclude)

def sig_fig_round(number_to_round, sig_figs):
    '''Rounds |number_to_round| to |sig_figs| significant figures.'''
    def is_number(value):
        '''Return whether value is a number or a string representing a number'''
        if not isinstance(value, (float, str, int, long)):
            return False
        try:
            float(value)
            return True
        except ValueError:
            return False

    error_message = ' parameter of sig_fig_round is not a number, but should be'
    if not is_number(number_to_round):
        raise ValueError('First' + error_message)
    if not is_number(sig_figs):
        raise ValueError('Second' + error_message)

    # Eliminate sign from converting to sign fig until end of conversion.
    number_to_round = float(number_to_round)
    is_negative = number_to_round < 0.0
    number_to_round = abs(number_to_round)

    # Convert number into scientific notation
    scientific_notation_number = scientificNotation(number_to_round, sig_figs)

    # Split scientific notation into mantissa and exponent, i.e.: {mantissa}E{exponent}
    number_split = string.split(scientific_notation_number, 'E')
    mantissa = number_split[0]
    exponent = int(number_split[1])

    # Split mantissa into integers and decimals, i.e.: {integers}.{decimals}
    mantissa_split = string.split(mantissa, '.')
    integers = mantissa_split[0]
    decimals = mantissa_split[1] if len(mantissa_split) > 1 else ''

    final_rounding = mantissa

    # Handle positive exponent.
    if exponent > 0:
        if len(decimals) < exponent:
            decimals += '0' * (exponent - len(decimals))
        final_rounding = integers + decimals[0:exponent]
        if len(decimals[exponent:]) > 0:
            final_rounding += '.' + decimals[exponent:]
        else:
            # Decide whether to use scientific notation. Ex: 30 with 2 sig figs should be 3.0E+1
            num_sig_figs = len(final_rounding.rstrip('0'))
            if num_sig_figs < sig_figs:
                exponent_amount = len(final_rounding) - 1
                rounded_number_prefix = final_rounding[0] + '.' + final_rounding[1:sig_figs]
                final_rounding = rounded_number_prefix + 'E+' + str(exponent_amount)
    # Handle negative exponent.
    elif exponent < 0:
        final_rounding = '0.' + '0' * (-exponent - 1) + integers + decimals

    if is_negative:
        final_rounding = '-' + final_rounding

    return final_rounding

def sigFigRound(number_to_round, sig_figs):
    return sig_fig_round(number_to_round, sig_figs)

def scientific_notation(value, sig_figs):
    '''Given a numerical value and a number of significant figures, return a scientific notation representing those parameters.'''
    value = float(value)

    is_negative = value < 0.0
    value = abs(value)

    # Rounding is surprising. Ex: 20.65 rounds to 20.6, not 20.7. That's not a Python bug, but we need that to round to 20.7.
    whole_numbers = len(str(int(value)))
    num_decimals_desired = sig_figs - whole_numbers

    # Count number of digits after decimal until a non-zero is found.
    # This is for numbers less than 1. Ex: 0.001 counts 3 decimal spots before a 1 is found.
    num_zeroes_after_decimal = 0
    tmp_value = value
    while (math.floor(tmp_value) == 0) and (tmp_value != 0):
        num_zeroes_after_decimal += 1
        tmp_value = tmp_value * 10
    num_decimals_desired += num_zeroes_after_decimal

    # If any decimal rounding is involved, we need to use the workaround.
    if num_decimals_desired > 0:
        multiplier = 10 ** num_decimals_desired
        value = math.floor((value * multiplier) + 0.5) / multiplier

    format = '%.' + str(sig_figs - 1) + 'E'
    final_rounding = format % value

    if is_negative:
        final_rounding = '-' + final_rounding

    return final_rounding

def scientificNotation(value, sig_figs):
    return scientific_notation(value, sig_figs)

def parens_if_negative(number):
    '''Return the number as a string. If the number is negative, then add parens around the number.'''
    return str(number) if number >= 0 else '(%d)' % number

def meanOfList(lst):
    '''Return the mean of the values in the list. Uses our statistics module.'''
    return statistics.mean(lst)

def medianOfList(lst):
    '''Return the median value in the given list. Uses our statistics module.'''
    return statistics.median(lst)

def stddevOfList(lst):
    '''Return the standard deviation of a sample for a given list. Uses our statistics module'''
    return statistics.stdev(lst)
`;

/**
    Return the number of lines of code.
    @method numberOfLinesOfCode
    @param {String} code The code from which to count the number of lines.
    @return {Number} The number of lines of code.
*/
function numberOfLinesOfCode(code) {
    return (code.split('\n').length - 1);
}

/**
    Return the class name for the given type of element.
    @method getElementClassNameByType
    @param {String} type The type of element.
    @return {String} The class name of the type of element.
*/
function getElementClassNameByType(type) {
    let elementClassName = '';

    switch (type.toLowerCase()) {
        case 'dropdown':
            elementClassName = 'ElementDropdown';
            break;
        case 'image':
            elementClassName = 'ElementImage';
            break;
        case 'shortanswer':
            elementClassName = 'ElementShortAnswer';
            break;
        case 'text':
            elementClassName = 'ElementText';
            break;
        case 'table':
            elementClassName = 'ElementTable';
            break;
        case 'checkbox':
            elementClassName = 'ElementCheckbox';
            break;
        default:
            throw new Error(`Unrecognized type: ${type}`);
    }

    return elementClassName;
}

/**
    Return the function to create an element of type |type|.
    @method getElementClassByType
    @param {String} type The type of element.
    @return {Function} The element class constructor.
*/
function getElementClassByType(type) {
    const className = getElementClassNameByType(type);

    // Convert |className| to the class constructor of the same name.
    return eval(className); // eslint-disable-line no-eval
}

let colorEscapeDictionary = {};

/**
    Escape each property's value in |style|.
    @method escapeStyleValues
    @param {Object} style Each key is a property and each value is that property's value.
    @return {Object} Escaped styles
*/
function escapeStyleValues(style) {
    const escapedStyles = {};

    for (const property in style) { // eslint-disable-line guard-for-in
        let newValue = style[property];

        for (const unescapedValue in colorEscapeDictionary) {
            if (typeof newValue === 'string') {
                const escapedValue = colorEscapeDictionary[unescapedValue];

                newValue = newValue.replace(unescapedValue, escapedValue);
            }
        }
        escapedStyles[property] = newValue;
    }
    return escapedStyles;
}

/**
    Add color definitions to |colorEscapeDictionary| from utilities zyTool.
    @method buildStyleEscapeDictionary
    @return {void}
*/
function buildStyleEscapeDictionary() {
    const utilities = require('utilities');

    colorEscapeDictionary = {
        'zyante-black': utilities.zyanteGray,
        'zyante-gray': '#9e9e9e',
        'zyante-dark-blue': utilities.zyanteDarkBlue,
    };
}

/**
    Try to download an image from the list of URLs.
    @method downloadImage
    @param {Object} $image jQuery object reference to the image DOM.
    @param {Array} imageURLs The URLs to try, starting from index 0.
    @param {String} errorMessage The error message if non of the image URLs load.
    @return {void}
*/
function downloadImage($image, imageURLs, errorMessage) {
    $image.on('error', () => {
        if (imageURLs.length > 0) {
            imageURLs.shift();
            downloadImage($image, imageURLs, errorMessage);
        }
        else {
            $image.attr('alt', errorMessage);
        }
    })
    .attr('src', imageURLs[0]);
}

/**
    Replace each variable in |string| with that variable's value in |module|.
    @method replaceStringVariables
    @param {String} string The string that may have variables to replace.
    @param {Sk.module} module Skulpt Python module that has variables.
    @return {String} The string with variables updated with actual values.
*/
function replaceStringVariables(string, module) {
    return require('utilities').replaceStringVariables(string, module);
}

/**
    Given a string, returns the Python variable name.
    The string can be in either of two formats: "var_name" or "${var_name}". Both return "var_name"
    @method getPythonVariableName
    @param {String} text The value passed.
    @return {String} The variable name.
*/
function getPythonVariableName(text) {
    const variableWithNotation = require('utilities').getPythonNotation(text);
    const regex = /^\$\{(\w+)\}$/;
    const match = regex.exec(variableWithNotation);

    return (match && match[1]) || '';
}

/**
    Check if the passed variable in |listName| is a list in |module|.
    @method pythonVariableIsList
    @param {String} listName The string to check if is a two-dimensional list.
    @param {Sk.module} module Skulpt Python module that has variables.
    @return {Boolean} Wether |string| is a two-dimensional list in |module|.
*/
function pythonVariableIsList(listName, module) {
    const listVariable = module.tp$getattr(listName);

    return listVariable && (listVariable.tp$name === 'list');
}

/**
    Returns the values contained in the python list.
    @method getValuesFromPythonList
    @param {String} listName The string to check if is a two-dimensional list.
    @param {Sk.module} module Skulpt Python module that has variables.
    @return {Array<String>} An array containing the values in the Python list.
*/
function getValuesFromPythonList(listName, module) {
    const listVariable = module.tp$getattr(listName);

    return listVariable.v.map(element => element.v);
}

/**
    Check if the passed variable in |listName| is a two-dimensional list in |module|.
    @method isTwoDimensionalList
    @param {String} listName The string to check if is a two-dimensional list.
    @param {Sk.module} module Skulpt Python module that has variables.
    @return {Boolean} Wether |string| is a two-dimensional list in |module|.
*/
function isTwoDimensionalList(listName, module) {
    const listVariable = module.tp$getattr(listName);

    return pythonVariableIsList(listName, module) && listVariable.v[0] && (listVariable.v[0].tp$name === 'list');
}

/**
    Get the number of rows, columns and each value in the two-dimensional list |listName|.
    @method getTableDataFromList
    @param {String} listName The name of the list to replace.
    @param {Sk.module} module Skulpt Python module that has variables.
    @return {Object} An object containing the number of rows, columns and the content of each cell.
*/
function getTableDataFromList(listName, module) {
    const listVariable = module.tp$getattr(listName);

    return new TwoDimensionalList(listVariable);
}

/**
    Return the spreadsheet column name for the given index. Ex: Index 1 is A and index 2 is B.
    @method spreadsheetColumnName
    @param {Integer} index The index of the column name.
    @return {String} The name of the column.
*/
function spreadsheetColumnName(index) {
    let name = '';

    if (index > 0) {

        // Algorithm based on converting base-10 to base-26.
        const numLetters = 26;
        const asciiA = 'A'.charCodeAt(0);
        let number = index - 1;

        // Convert number to a string of base-26 characters. Ex: 0 converts to "A", 25 converts to "Z", 26 converts to "AA".
        while (number >= 0) {

            // Get the right-most base-26 character.
            const nextCharacter = String.fromCharCode((number % numLetters) + asciiA);

            // Add the right-most character to the left-side of the base-26 cell name.
            name = nextCharacter + name;

            // Shift the right-most base-26 digit from number.
            number = Math.floor(number / numLetters) - 1;
        }
    }

    return name;
}

/**
    Add spreadsheet headers to the table.
    @method addSpreadsheetHeaders
    @param {Array} table Array of {Array} of {String}. 2D array of cells.
    @return {void}
*/
function addSpreadsheetHeaders(table) {
    const columns = table[0].length + 1;

    // Add named rows.
    table.forEach((row, index) => row.unshift(String(index + 1)));

    // Add named columns.
    const namedColumn = require('utilities').createArrayOfSizeN(columns).map((item, index) => spreadsheetColumnName(index));

    table.unshift(namedColumn);
}

/**
    Remove the headers from the table.
    @method removeSpreadsheetHeaders
    @param {Array} table Array of {Array} of {String}. 2D array of cells.
    @param {String} which From which table to remove the spreadsheet headers.
    @return {void}
*/
function removeSpreadsheetHeaders(table, which) {

    // Remove named columns.
    if (which !== 'width') {
        table.shift();
    }

    // Remove named rows.
    table.forEach(row => row.shift());
}

/**
    Return whether object's property is defined.
    @method isValueDefined
    @param {Object} object The object that stores the property.
    @param {String} property The name of the property to check.
    @return {Boolean} Whether object's property is defined.
*/
function isValueDefined(object, property) {
    let isDefined = false;

    if (object) {
        const value = object[property];
        const isNull = value === null;
        const isUndefined = typeof value === 'undefined';
        const isEmptyString = value === '';

        isDefined = !(isNull || isUndefined || isEmptyString);
    }

    return isDefined;
}

/**
    Make a list of URLs to try to download given an imageID. First from Amazon, then from Google Drive.
    @method makeImageURLs
    @param {Object} parentResource The parent resource of the module.
    @param {String} imageID The image ID to download.
    @return {void}
*/
function makeImageURLs(parentResource, imageID) {
    const versionedImageURL = parentResource.getVersionedImage(imageID);
    const getResource = parentResource.getStaticResource || parentResource.getDependencyURL;
    const zyServerURL = getResource.call(parentResource, `gdrive_images/${imageID}`); // eslint-disable-line prefer-reflect
    const googleDriveURL = `https://drive.google.com/uc?export=download&id=${imageID}`;

    return [ versionedImageURL, zyServerURL, googleDriveURL ];
}

/**
    Make a jQuery object for an image based on the given match result.
    @method makeImageElementForExplanation
    @param {Object} imageMatch The result of RegEx.exec() that matched to an image.
    @param {Object} parentResource The parent resource of the module.
    @param {Boolean} addURLFallback Whether to add an image URL fallback.
    @return {Object} A jQuery object of an image.
*/
function makeImageElementForExplanation(imageMatch, parentResource, addURLFallback) {

    // Find image matches and grab: width and height if set, image id, and text before the image.
    const imageWidth = imageMatch[1] ? parseInt(imageMatch[1], 10) : 0;
    const imageHeight = imageMatch[2] ? parseInt(imageMatch[2], 10) : 0;
    const imageIDToLoad = imageMatch[3];

    // Create <img> tag, the ID is the ID of the image to load, push img to |explanationParts|.
    const imageURLs = makeImageURLs(parentResource, imageIDToLoad);
    const properties = {
        class: 'explanation-image',
        'image-id': imageIDToLoad,
        src: imageURLs[0],
    };

    if (addURLFallback) {
        properties.onerror = `this.onerror=null; this.src='${imageURLs[1]}';`;
    }

    const $element = $('<img>', properties);

    if (imageWidth !== 0) {
        $element.width(imageWidth);
    }
    if (imageHeight !== 0) {
        $element.height(imageHeight);
    }

    return $element;
}

/**
    Convert the given string into a 2D array of strings. Split on newline, then on '&'.
    @method convertStringInto2DArray
    @param {String} data The string to convert.
    @return {Array} of {Array} of {String} The 2D array from the string.
*/
function convertStringInto2DArray(data) {
    return data.split('\n').map(row => row.split('&'));
}

/**
    Make a jQuery object for a spreadsheet based on the given match result.
    @method makeSpreadsheetElementForExplanation
    @param {Object} spreadsheetMatch The result of RegEx.exec() that matched to a spreadsheet.
    @return {Object} A jQuery object of a spreadsheet.
*/
function makeSpreadsheetElementForExplanation(spreadsheetMatch) {

    // Build spreadsheet contents, including headers.
    const contents = convertStringInto2DArray(spreadsheetMatch[4]);

    addSpreadsheetHeaders(contents);

    // Build fill colors, including default colors for headers.
    let fillColors = contents.map(row => row.map(() => 'default'));

    if (spreadsheetMatch[5]) {
        fillColors = convertStringInto2DArray(spreadsheetMatch[6]);
        fillColors.map(row => row.unshift('default'));

        const headerRow = require('utilities').createArrayOfSizeN(contents.length).map(() => 'default');

        fillColors.unshift(headerRow);
    }

    const tableData = contents.map((row, rowIndex) =>
        row.map((content, columnIndex) => {
            const fillColor = fillColors[rowIndex][columnIndex];
            const mappedColor = fillColorModalNameToXMLName[fillColor];
            const style = {};

            // Convert the mapped color to a hex value.
            if (mappedColor) {
                const hexColor = require('utilities')[mappedColor];

                style['background-color'] = hexColor;
            }

            const isHeader = (rowIndex === 0) || (columnIndex === 0);

            return { content, isHeader, style };
        })
    );
    const fontSize = spreadsheetMatch[3] ? parseInt(spreadsheetMatch[3], 10) : null;
    const height = spreadsheetMatch[2] ? parseInt(spreadsheetMatch[2], 10) : null;
    const width = spreadsheetMatch[1] ? parseInt(spreadsheetMatch[1], 10) : null;
    const style = {};

    if (fontSize) {
        style['font-size'] = `${fontSize}px`;
    }
    if (height) {
        style.height = `${height}px`;
    }
    if (width) {
        style.width = `${width}px`;
    }

    const table = new ElementTable({
        tableData,
        isSpreadsheet: true,
        style,
    });
    const templates = (new ProgressionUtilities()).templates;
    const htmlStyle = templates.ElementStyle({ style }); // eslint-disable-line new-cap

    table.prepareForRendering();
    const html = templates.ElementTable({ element: table, style: htmlStyle, noCopyButton: true }); // eslint-disable-line new-cap

    return $(html);
}

/**
    Make a jQuery object for a table based on the given match result.
    @method makeTableElementForExplanation
    @param {Object} tableMatch The result of RegEx.exec() that matched to a table.
    @return {Object} A jQuery object of a table.
*/
function makeTableElementForExplanation(tableMatch) {
    const isFirstRowHeader = Boolean(tableMatch[1]);
    const isFirstColumnHeader = Boolean(tableMatch[2]);

    // Build table contents.
    const contents = convertStringInto2DArray(tableMatch[6]);
    const tableData = contents.map((row, rowIndex) =>
        row.map((content, columnIndex) => {
            const isHeaderRow = isFirstRowHeader && (rowIndex === 0);
            const isHeaderColumn = isFirstColumnHeader && (columnIndex === 0);
            const isHeader = isHeaderRow || isHeaderColumn;

            return { content, isHeader };
        })
    );
    const fontSize = tableMatch[5] ? parseInt(tableMatch[5], 10) : null;
    const height = tableMatch[4] ? parseInt(tableMatch[4], 10) : null;
    const width = tableMatch[3] ? parseInt(tableMatch[3], 10) : null;
    const style = {};

    if (fontSize) {
        style['font-size'] = `${fontSize}px`;
    }
    if (height) {
        style.height = `${height}px`;
    }
    if (width) {
        style.width = `${width}px`;
    }

    const table = new ElementTable({
        tableData,
        style,
        isFirstRowHeader,
        isFirstColumnHeader,
    });
    const templates = (new ProgressionUtilities()).templates;
    const htmlStyle = templates.ElementStyle({ style }); // eslint-disable-line new-cap

    table.prepareForRendering();
    const html = templates.ElementTable({ element: table, style: htmlStyle, noCopyButton: true }); // eslint-disable-line new-cap

    return $(html);
}

/**
    Convert string into array of simple tokens, which handles an escaped backtick.
    @method backtickTokenize
    @param {String} str The string to tokenize.
    @return {Array} of {String} The tokens.
*/
function backtickTokenize(str) {
    const tokens = [];

    for (let index = 0; index < str.length; index++) {
        const curr = str[index];
        const next = str[index + 1];
        let value = curr;

        // Handle escaped backtick.
        if ((curr === '\\') && (next === '`')) {
            value = '\\`';
            index++;
        }

        tokens.push(value);
    }

    return tokens;
}

/**
    Convert the tokens into an array of strings, wherein odd-indexed strings are text and even-indexed strings are code.
    @method backtickTokensToParts
    @param {Array} tokens Array of {String} The tokens to convert.
    @return {Array} of {String} The parts.
*/
function backtickTokensToParts(tokens) {
    let isTagOpen = false;

    // First string is just text, not code.
    const parts = [ '' ];

    while (tokens.length) {
        const value = tokens.shift();


        if (value === '`') {
            isTagOpen = !isTagOpen;

            // Start new string.
            parts.push('');
        }
        else {

            // Add to existing string.
            parts[parts.length - 1] += value;
        }
    }

    // Tag was not closed.
    if (isTagOpen) {

        // Put the code into the previous part.
        parts[parts.length - 2] += `\`${parts[parts.length - 1]}`; // eslint-disable-line no-magic-numbers

        // Remove the code part.
        parts.pop();
    }

    return parts;
}

/**
    Convert each part into the respective node. Odd-indexed is text and even-indexed is code.
    @method backtickPartsToNodes
    @param {Array} parts Array of {String} The parts to convert.
    @return {Array} of {Node}
*/
function backtickPartsToNodes(parts) {
    return parts.map((part, index) => {
        const isEven = index % 2; // eslint-disable-line no-magic-numbers
        const nodeType = isEven ? 'code' : 'span';
        const node = document.createElement(nodeType);

        node.textContent = part;

        return node;
    });
}

/**
    Replace each backtick pair with <code> tag.
    @method replaceBackticks
    @param {String} str The string in which to replace.
    @return {String} HTML with backticks replaced as <code>.
*/
function replaceBackticks(str) {
    const tokens = backtickTokenize(str);
    const parts = backtickTokensToParts(tokens);
    const nodes = backtickPartsToNodes(parts);

    return $('<div>').html($(nodes)).prop('innerHTML');
}

/**
    Creates a <p> tag containing the passed string.
    @method createParagraphTag
    @param {String} str The text to put in the <p> tag.
    @return {Object} jQuery reference to the <p> tag.
*/
function createParagraphTag(str) {
    return $('<p>').html(replaceBackticks(str));
}
