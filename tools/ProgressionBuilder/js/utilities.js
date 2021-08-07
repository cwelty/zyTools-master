'use strict';

/* exported makeNewElement, fromZyToolToXML, fromXMLToZyTool, addNewLevelWithOneQuestions, duplicateElementVariants, getElementVariantForStyle,
   defaultProgression, maxQuestionAreaWidth, maxQuestionAreaHeight, minQuestionAreaHeight, minQuestionAreaWidth, mapElementVariants,
   getElementVariantForStyle, makeIndexArray, parseCssProperty, latexInText */
/* globals ZyTool, Ember */

const defaultQuestion = {
    code: '',
    elementVariants: [],
    explanation: '',
    height: '',
    isSelected: false,
    name: '',
    usedElements: [],
    width: '',
};

const defaultLevel = {
    elementVariants: [],
    explanation: '',
    height: '',
    isCollapsed: true,
    isSelected: true,
    name: '',
    questions: [],
    usedElements: [],
    width: '',
};

const defaultProgression = {
    elements: [],
    explanation: '',
    height: '350px',
    levels: [],
    width: '550px',
    isExam: false,
};

const maxQuestionAreaWidth = 800;
const maxQuestionAreaHeight = 500;
const minQuestionAreaHeight = 100;
const minQuestionAreaWidth = 450;

/**
    Return the default styles for the given |type|.
    @method defaultElementStyleByType
    @param {String} type The type of element.
    @return {Object} The default styles.
*/
function defaultElementStyleByType(type) {
    const style = {
        opacity: 1,
        'border-radius': 0,
        transform: 'rotate(0deg)',
    };

    switch (type) {
        case 'text':
            style['font-size'] = '16px';
            style.padding = '0px';
            style.border = '2px solid rgba(0, 0, 0, 0)';
            style.color = 'zyante-black';
            break;
        case 'dropdown':
            style['font-size'] = '16px';
            break;
        case 'image':
            style.height = '100px';
            style.width = '100px';
            break;
        case 'shortanswer':
            style['font-size'] = '16px';
            style.width = '150px';
            break;
        case 'table':
            style['font-size'] = '16px';
            style.width = '100px';
            break;
        case 'checkbox':
            style['font-size'] = '16px';
            break;
        default:
            throw new Error(`Unrecognized type: ${type}`);
    }

    return style;
}

/**
    Return an element name given an element id and type.
    @method makeElementName
    @param {Number} id The element id.
    @param {String} type The element's type.
    @return {String} The name of the element.
*/
function makeElementName(id, type) {
    return `Object ${id + 1}: ${require('utilities').initialCapitalize(type)}`;
}

/**
    Return the selected question that question's level from the given levels.
    @method findSelectedQuestionAndLevel
    @param {Levels} levels The given levels.
    @return {Object} The selected question and level: selectedLevel {Level} and selectedQuestion {Question}.
*/
function findSelectedQuestionAndLevel(levels) {
    const questions = levels.map(level => level.questions).flat();
    const selectedQuestion = questions.find(question => question.isSelected);
    const selectedLevel = levels.find(level => level.questions.includes(selectedQuestion));

    return {
        selectedLevel,
        selectedQuestion,
    };
}

/**
    Create a new element.
    @method makeNewElement
    @param {String} type The type of element to make.
    @param {Number} elementID The new element's id.
    @param {Progression} progression Reference to the {Progression} being built.
    @return {Element} The new element.
*/
function makeNewElement(type, elementID, progression) {
    const progressionUtilities = require('ProgressionUtilities').create();

    // Create new element with type, id, and style properties.
    const newElement = progressionUtilities.createElementByProperties({
        id: String(elementID),
        isInEditMode: false,
        isSelected: false,
        name: makeElementName(elementID, type),
        style: defaultElementStyleByType(type),
        type,
    });

    // Center new element on question area.
    const result = findSelectedQuestionAndLevel(progression.levels);
    const selectedLevel = result.selectedLevel;
    const selectedQuestion = result.selectedQuestion;
    const height = progressionUtilities.getMostSpecificProperty('height', progression, selectedLevel, selectedQuestion);
    const width = progressionUtilities.getMostSpecificProperty('width', progression, selectedLevel, selectedQuestion);

    newElement.style.top = `${parseFloat(height) / 2}px`; // eslint-disable-line no-magic-numbers
    newElement.style.left = `${parseFloat(width) / 2}px`; // eslint-disable-line no-magic-numbers

    // Default element properties by type.
    if (type === 'text') {
        newElement.text = 'add text';
    }
    else if (type === 'dropdown') {
        newElement.optionOrderingMethod = 'sort';
    }
    else if (type === 'image') {
        newElement.newAddition = true;
    }

    return newElement;
}

/**
    Convert the given number to alphabetic notation. Ex: 1 -> 'a', 26 -> 'z', and 27 -> 'aa'.
    @method convertNumberToAlphabeticNotation
    @param {Number} number The number to convert to alphabetic notation.
    @return {String} The alphabetic notation.
*/
function convertNumberToAlphabeticNotation(number) {
    const asciiLowercaseA = 97;
    const lettersInAlphabet = 26;
    let alphabeticNotation = '';
    let currentNumber = number;

    while (currentNumber > 0) {

        // Character code range from 1 - 26 mapping to 'a' - 'z'.
        const nextCharCode = ((number - 1) % lettersInAlphabet) + 1;
        const nextChar = String.fromCharCode(nextCharCode + asciiLowercaseA - 1);

        alphabeticNotation = nextChar + alphabeticNotation;
        currentNumber = (currentNumber - nextCharCode) / lettersInAlphabet;
    }
    return alphabeticNotation;
}

/**
    Make a new question name for a question at the given index.
    @method makeQuestionName
    @param {Number} index The index of the question to give a name.
    @return {String} The new question name.
*/
function makeQuestionName(index) {
    return `Question ${convertNumberToAlphabeticNotation(index + 1)}`;
}

/**
    Update the names of the given questions.
    @method updateNamingOfQuestions
    @param {Array} questions Array of {Question}. The list of questions to name.
    @return {void}
*/
function updateNamingOfQuestions(questions) {
    questions.forEach((question, index) => {
        question.name = makeQuestionName(index);
    });
}

/**
    Create and add a new question to the given questions.
    @method addNewQuestion
    @param {Array} questions Array of {Question}. The list of questions that the new question will be appended to.
    @return {Question} The new question.
*/
function addNewQuestion(questions) {
    const newQuestion = require('ProgressionUtilities').create().createQuestion(defaultQuestion);

    questions.push(newQuestion);

    updateNamingOfQuestions(questions);

    return newQuestion;
}

/**
    Update the names of the given levels.
    @method updateNamingOfLevels
    @param {Array} levels Array of {Level}. Update name of these levels.
    @return {void}
*/
function updateNamingOfLevels(levels) {
    levels.forEach((level, index) => {
        level.name = `Level ${String(index + 1)}`;
    });
}

/**
    Create and add a new level with one question to the given levels.
    @method addNewLevelWithOneQuestions
    @param {Array} levels Array of {Level}. Add level to this object.
    @return {Level} The new level.
*/
function addNewLevelWithOneQuestions(levels) {
    const newLevel = require('ProgressionUtilities').create().createLevel(defaultLevel);

    addNewQuestion(newLevel.questions);
    levels.push(newLevel);
    updateNamingOfLevels(levels);

    return newLevel;
}

/**
    Identify type of object.
    @method getObjectType
    @param {Object} object The objet.
    @return {String} The type of object.
*/
function getObjectType(object) {
    let type = typeof object;

    if (type === 'object') {

        // Checks if object is null or undefined.
        if (object == null) { // eslint-disable-line
            type = 'null';
        }
        else if (object.forEach) {
            type = 'array';
        }
    }

    return type;
}

/**
    Convert the given object to zyAuthor-style XML.
    @method fromObjectToXML
    @param {Object} object The object to convert to XML.
    @param {String} objectName The name of the object.
    @return {String} The XML converted from object.
*/
function fromObjectToXML(object, objectName) {
    const type = getObjectType(object);

    // Convert type to XML.
    let XML = '';

    switch (type) {
        case 'number':
        case 'boolean':
        case 'string': {
            const escapedString = $('<div/>').text(object).html();
            const readableTags = [ 'code', 'explanation' ];
            const shouldBeReadable = readableTags.includes(objectName);

            XML = `<${objectName} type="${type}">${escapedString}</${objectName}>`;
            XML = shouldBeReadable ? `\n${XML}\n` : XML;
            break;
        }
        case 'object': {
            const objectChildrenXML = Object.keys(object).map(key => fromObjectToXML(object[key], key)).join('');

            XML = `<${objectName} type="dict">${objectChildrenXML}</${objectName}>`;
            break;
        }
        case 'array': {
            const listElementXML = object.map(listItem => fromObjectToXML(listItem, 'item')).join('');

            XML = `<${objectName} type="list">${listElementXML}</${objectName}>`;
            break;
        }
        case 'function':
        case 'null':
            break;
        default:
            throw new Error(`Unrecognized type in: ${type}`);
    }

    return XML;
}

/**
    Return a list of image IDs.
    @method getImageIDs
    @param {String} progressionXML The progression from which to get image IDs.
    @return {Array} of {String} List of image IDs.
*/
function getImageIDs(progressionXML) {
    return new Ember.RSVP.Promise(resolve => {
        const idMatches = progressionXML.match(/[\w-]{25,}/g) || [];

        // Remove duplicates.
        const idSet = new Set(idMatches);
        const idList = Array.from(idSet);

        // Tag names are not image ids, so remove the tag names from image id list.
        const tagNames = [ 'controlHeightWidthPerQuestion', 'correctAnswerIsCheckedString' ];
        const filteredIdList = idList.filter(id => !tagNames.includes(id));

        // Try to load each image ID.
        const promises = filteredIdList.map(id => { // eslint-disable-line arrow-body-style
            return new Ember.RSVP.Promise(imageDone => {
                $('<img>')
                .on('load', () => imageDone(id))
                .on('error', () => imageDone())
                .attr('src', `https://drive.google.com/uc?export=download&id=${id}`);
            });
        });

        // Resolve the images that loaded.
        Promise.all(promises).then(imageIDs => resolve(imageIDs.filter(id => id).join(',')));
    });
}

/**
    Convert a {ZyTool} to a string of XML.
    @method fromZyToolToXML
    @param {ZyTool} zyTool The zyTool to convert to XML.
    @param {Boolean} [includeImageIDs=false] Whether to include image IDs.
    @return {Promise} Promise to convert the zyTool to XML.
*/
function fromZyToolToXML(zyTool, includeImageIDs = false) {
    return new Ember.RSVP.Promise(xmlResolve => {
        const id = zyTool.id;
        const caption = zyTool.caption;
        const parts = zyTool.progression.levels.length;
        const instructionsXML = `<zyInstructions>${zyTool.instructions}</zyInstructions>`;
        const progressionXML = `<zyOptions>${fromObjectToXML(zyTool.progression.toJSON(), 'progression')}</zyOptions>`;
        const alternativeTextXML = `<zyAltDescription>${zyTool.alternativeText}</zyAltDescription>`;
        const zyToolXMLPostfix = '</zyTool>';

        const imageIDsPromise = includeImageIDs ?
                                getImageIDs(progressionXML) :
                                new Ember.RSVP.Promise(imageIDsResolve => imageIDsResolve(''));

        imageIDsPromise.then(imageIDs => {
            const zyToolXMLPrefix = `<zyTool name="ProgressionPlayer" caption="${caption}" id="${id}" challenge="true" parts="${parts}" edited-last="${new Date()}" image-ids="${imageIDs}">\n`; // eslint-disable-line max-len

            xmlResolve(`${zyToolXMLPrefix}${instructionsXML}${progressionXML}${alternativeTextXML}${zyToolXMLPostfix}`);
        });
    });
}

/**
    Convert given jQuery reference to JSON.
    @param {Object} $current jQuery object reference to current XML being parsed.
    @return {Object} The JSON converted from a jQuery object.
*/
function fromJQueryToJSON($current) {
    let json = null;
    const type = $current.attr('type') ? $current.attr('type') : 'string';

    switch (type) {
        case 'boolean':
            json = ($current.text() === 'true');
            break;
        case 'string':
            json = $current.text();
            break;
        case 'number':
            json = parseFloat($current.text());
            break;
        case 'dict':
            json = {};
            $current.children().each((index, element) => {
                json[element.tagName] = fromJQueryToJSON($(element));
            });
            break;
        case 'list':
            json = [];
            $current.children().each((index, element) => {
                json.push(fromJQueryToJSON($(element)));
            });
            break;
        default:
            throw new Error('Unrecognized object type in fromJQueryToJSON');
    }
    return json;
}

/**
    Get all the variants in each level/question.
    @method mapElementVariants
    @param {Array} objects Array of {Level} or {Question}. The objects from which to get the variants.
    @return {Array} of {Array} of {ElementVariant} All the variants in each level/question.
*/
function mapElementVariants(objects) {
    return objects.map(object => object.elementVariants);
}

/**
    Given a {Progression} object, returns only the dropdown elements.
    @method getDropdownFromProgression
    @param {Progression} progression The progression object.
    @return {Array} of {ElementDropdown}
*/
function getDropdownAndVariantsFromProgression(progression) {
    const dropdownElements = progression.elements.filter(element => element.type === 'dropdown');
    const dropdownIds = dropdownElements.map(dropdown => dropdown.id);
    const levelVariants = mapElementVariants(progression.levels).flat();
    const questions = progression.levels
        .map(level => level.questions)
        .flat();
    const questionVariants = mapElementVariants(questions).flat();
    const variants = levelVariants.concat(questionVariants);
    const dropdownVariants = variants.filter(variant => dropdownIds.includes(variant.id));

    return dropdownElements.concat(dropdownVariants);
}

/**
    Warn user that legacy dropdown order methods ('none' and 'random') are replaced with 'sort' method.
    @method handleLegacyDropdownOrderMethod
    @param {Progression} progression The progression to check for legacy dropdown order methods.
    @return {void}
*/
function handleLegacyDropdownOrderMethod(progression) {
    const dropdowns = getDropdownAndVariantsFromProgression(progression);
    const noneMethods = dropdowns.filter(dropdown => dropdown.optionOrderingMethod === 'none');
    const randomMethods = dropdowns.filter(dropdown => dropdown.optionOrderingMethod === 'random');
    const legacyMethods = noneMethods.concat(randomMethods);

    legacyMethods.forEach(dropdown => {
        dropdown.optionOrderingMethod = 'sort';
    });

    if (legacyMethods.length) {
        const hadNoneMethod = noneMethods.length > 0;
        const hadRandomMethod = randomMethods.length > 0;
        let foundMethods = 'method of Random';

        if (hadNoneMethod && hadRandomMethod) {
            foundMethods = 'methods of None and Random';
        }
        else if (hadNoneMethod) {
            foundMethods = 'method of None';
        }

        window.alert(`Dropdown order ${foundMethods} found in progression; we discourage those methods. Auto-updated to Sorted.`); // eslint-disable-line no-alert
    }
}

/**
   Returns whether there's LaTeX in the passed text.
   @method latexInText
   @param {String} text The text to check.
   @return {Boolean}
*/
function latexInText(text) {
    const latexRegex = /\\\(.*\\\)|\$\$.*\$\$/;

    return latexRegex.test(text);
}

/**
    If LaTeX is found in any dropdown option, warn user that dropdown options do not support LaTeX.
    @method checkLatexInDropdown
    @param {Progression} progression The progression object.
    @return {void}
*/
function checkLatexInDropdown(progression) {
    const dropdowns = getDropdownAndVariantsFromProgression(progression);
    const dropdownsWithLatex = dropdowns.filter(({ options }) => options.some(({ text }) => latexInText(text)));
    const dropdownNames = dropdownsWithLatex.map(({ name }) => name);

    if (dropdownsWithLatex.length) {
        const message = `LaTeX is not supported in dropdowns, but was found in: ${dropdownNames.join(', ')}.`;

        window.alert(message); // eslint-disable-line no-alert
    }
}

/**
    Convert given zyAuthor-style XML to ZyTool.
    @method fromXMLToZyTool
    @param {String} xml The zyAuthor-style XML to convert to ZyTool.
    @return {ZyTool} The ZyTool converted from the XML.
*/
function fromXMLToZyTool(xml) {
    let xmlDocument = null;

    // Alt description can contain any character, /.*/ includes any character except whitespace.
    const altDescriptionRegex = /<zyAltDescription>([^]*)<\/zyAltDescription>/;
    let alternativeText = '';

    // Try to parse |xml|.
    try {
        let xmlToLoad = xml;
        const regexResults = xml.match(altDescriptionRegex);

        if (regexResults) {
            alternativeText = regexResults[1];
            xmlToLoad = xml.replace(altDescriptionRegex, '');
        }
        xmlDocument = $.parseXML(xmlToLoad);
    }
    catch (error) {
        alert(error); // eslint-disable-line no-alert
        return null;
    }

    const $zyTool = $(xmlDocument).children().eq(0);
    let zyTool = null;

    if ($zyTool.length === 0) {
        alert('XML format unrecognized: Expected zyTool tag as outer-most tag.'); // eslint-disable-line no-alert
    }
    else {
        const $progression = $zyTool.children('zyOptions').children('progression');

        if ($progression.length === 0) {
            alert('XML format unrecognized: Expected progression tag inside zyOptions tag.'); // eslint-disable-line no-alert
        }
        else {
            const progressionJSON = fromJQueryToJSON($progression);

            if (progressionJSON) {
                const id = $zyTool.attr('id');
                const caption = $zyTool.attr('caption');
                const progressionUtilities = require('ProgressionUtilities').create();
                const progression = progressionUtilities.createProgression(progressionJSON);
                const instructions = $zyTool.children('zyInstructions').html();

                handleLegacyDropdownOrderMethod(progression);
                checkLatexInDropdown(progression);

                zyTool = new ZyTool(id, caption, progression, instructions, alternativeText);
            }
        }
    }

    return zyTool;
}

/**
    Registers a Handlebars helper that stores the index of the loop, this allows using the index inside another loop.
*/
Handlebars.registerHelper('setIndex', function(value) {
    this.outIndex = Number(value); // eslint-disable-line no-invalid-this
});

/**
    Duplicate the element variants for the id to duplicate using the new id.
    @method duplicateElementVariants
    @param {Array} variants Array of {ElementVariant}. Find variant matching the id to duplicate.
    @param {Number} idToDuplicate Duplicate the variants with this id.
    @param {Number} id Give the duplicated variants this id.
    @return {void}.
*/
function duplicateElementVariants(variants, idToDuplicate, id) {
    variants.filter(variant => variant.id === idToDuplicate)
            .forEach(variant => {
                const newVariant = variant.clone();

                newVariant.id = id;
                variants.push(newVariant);
            });
}

/**
    Get the element variant for the given id in the given variants. If one isn't there, then create a new variant.
    @method getElementVariantForStyle
    @param {Array} variants List of {ElementVariant} to search.
    @param {String} id The element id to find in |variants|.
    @return {ElementVariant} The element variant for the given id.
*/
function getElementVariantForStyle(variants, id) {
    let variantOfElement = variants.find(variant => variant.id === id);

    // If a variant doesn't exist, create one.
    if (!variantOfElement) {
        variantOfElement = require('ProgressionUtilities').create().createElementVariant({ id });
        variants.push(variantOfElement);
    }

    // If the variant lacks style, add style. Consider brushing your shoulder.
    if (!variantOfElement.style) {
        variantOfElement.style = {};
    }

    return variantOfElement;
}

/**
    Makes an array filled with the index of the element. Ex: makeIndexArray(4) returns [ 0, 1, 2, 3 ]
    @method makeIndexArray
    @param {Number} numberOfElements The number of elements the array will contain.
    @return {Array<Number>}
*/
function makeIndexArray(numberOfElements) {
    return [ ...Array(numberOfElements).keys() ];
}

/**
    Parses a CSS property into a number.
    @function parseProperty
    @param {jQuery} $element The element that has the CSS.
    @param {String} property The property name.
    @return {Integer}
+*/
function parseCssProperty($element, property) {
    if (property === 'width') {
        return parseInt($element.width(), 10);
    }
    else if (property === 'height') {
        return parseInt($element.height(), 10);
    }

    return parseInt($element.css(property), 10);
}
