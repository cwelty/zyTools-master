'use strict';

/*
    Add |range| helper to HandleBars templates.
    |range| generates a sequence of integers from 0 to |n|-1.

    Example usage:
        {{#range 10}}
            <div id='d{{this}}' />
        {{/range}}

    The above outputs 10 divs having ids d0 - d9:
        <div id='d0' />
        <div id='d1' />
        ...
        <div id='d9' />
*/
Handlebars.registerHelper('range', (number, block) => {
    let html = '';

    for (let index = 0; index < number; ++index) {
        html += block.fn(index);
    }
    return html;
});

/**
    Returns a boolean representing if the string starts with |str|.
    @method startsWith
    @param {String} str Check if |this| starts with |str|.
    @return {Boolean} Whether |this| starts with |str|.
*/
String.prototype.startsWith = function(str) { // eslint-disable-line no-extend-native
    return (this.indexOf(str) === 0);
};

/**
    Replace the character at |index| with |character|.
    @methodreplaceAt
    @param {Number} index The index to replace at.
    @param {String} character The character to replace at index.
    @return {String} The new string.
*/
String.prototype.replaceAt = function(index, character) { // eslint-disable-line no-extend-native
    return this.substr(0, index) + character + this.substr(index + 1);
};

/**
    Replace the first occurrence of |replacee| with |replacer| starting from the end of the string.
    @method rightReplace
    @param {String} replacee The character to replace.
    @param {String} replacer The character to replace with.
    @return {String} The new string with |replacee| replaced with |replacer|
*/
String.prototype.rightReplace = function(replacee, replacer) { // eslint-disable-line no-extend-native
    let newString = this.slice();

    if (newString.length !== 0) {
        while (newString[newString.length - 1] === replacee) {
            let index = newString.length - 1;

            for (; index >= 0; --index) {
                if (newString[index] !== replacee) {
                    break;
                }
            }
            newString = newString.replaceAt(index + 1, replacer);
        }
    }

    return newString;
};
