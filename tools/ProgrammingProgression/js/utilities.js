/* global PrefixPostfixPlaceholder */
/* exported handleTestTables, addEditableWhitespace */
'use strict';

/**
    Accepts the prefix, postfix, and code placeholder of this problem, and returns updated
    versions of each in a dictionary.

    If possible, this function removes whitespace from the end of the prefix and beginning of
    the postfix and adds it to the placeholder.
    @method addEditableWhitespace
    @param {String} prefixParam The code before the students code.
    @param {String} postfixParam The code after the students code.
    @param {String} placeholderParam The placeholder for the student code.
    @return {Object} containing prefix, postfix and placeholder with the added whitespace.
*/
function addEditableWhitespace(prefixParam, postfixParam, placeholderParam) {

    // Strip trailing spaces from each line.
    let prefix = prefixParam.replace(/ +\n/g, '\n');
    let postfix = postfixParam.replace(/ +\n/g, '\n');
    let placeholder = placeholderParam.replace(/ +\n/g, '\n');

    // Move indentation characters from prefix to placeholder
    const indentationCharacters = [ ' ', '\t' ];
    let inlineComment = false;

    for (let index = prefix.length - 1; index >= 0; --index) {
        const character = prefix[index];

        // Track if a code character is encountered before a newline
        if (/\S/.test(character)) {
            inlineComment = true;
        }

        if (indentationCharacters.indexOf(character) === -1) {
            break;
        }
        else {

            // Move character from prefix to placeholder
            placeholder = character + placeholder;
            prefix = prefix.substr(0, prefix.length - 1);
        }
    }

    // Add new lines to placeholder if not immediately surrounded by code.
    // e.g. if (/* Your code goes here */) {
    if (!inlineComment) {
        const endsWithTwoNewlinesRegEx = /\n\n$/;
        const startsWithTwoNewlinesRegEx = /^\n\n/;

        placeholder = `\n${placeholder}\n`;

        // Remove trailing newline(s) from prefix; only one should exist.
        while (endsWithTwoNewlinesRegEx.test(prefix)) {    // eslint-disable-line no-magic-numbers
            prefix = prefix.substring(0, prefix.length - 1);
        }

        // Remove leading newline(s) from postfix; only one should exist.
        while (startsWithTwoNewlinesRegEx.test(postfix)) {
            postfix = postfix.substring(1, postfix.length);
        }
    }

    return new PrefixPostfixPlaceholder(prefix, postfix, placeholder);
}
