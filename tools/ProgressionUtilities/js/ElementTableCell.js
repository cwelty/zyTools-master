'use strict';

/* exported ElementTableCell */
/* global replaceStringVariables, fillColorModalNameToXMLName, replaceBackticks */

/**
    An {ElementTableCell} models each cell in an {ElementTable}.
    @class ElementTableCell
*/
class ElementTableCell {

    /**
        @constructor
        @param {String} [content=''] The content of the cell.
        @param {Boolean} [isHeader=false] Whether the cell is a header.
        @param {Object} [style=null] CSS properties to apply to the table cell.
    */
    constructor({ content = '', isHeader = false, style = null }) {

        /**
            The content of the cell.
            @property content
            @type {String}
        */
        this.content = content || '';

        /**
            The content as HTML.
            @property contentHTML
            @type {String}
            @default null
        */
        this.contentHTML = null;

        /**
            Whether this cell is a header in the table.
            @property isHeader
            @type {Boolean}
        */
        this.isHeader = isHeader;

        /**
            CSS properties to apply to the table cell.
            @property style
            @type {Object}
        */
        this.style = style || { width: 'auto' };
    }

    /**
        Sets whether the cell should have header styling.
        @method setCellHeader
        @param {Boolean} isHeader Whether the cell is a header cell.
        @return {void}
    */
    setCellHeader(isHeader) {
        this.isHeader = isHeader;
    }

    /**
        Sets the width for the cell.
        @method setWidth
        @param {String} width The width to set. Either 'auto' or a percentage number ('8%', '30%', etc)
        @return {void}
    */
    setWidth(width) {
        this.style.width = width;
    }

    /**
        Return a clone of this table cell.
        @method clone
        @return {ElementTableCell} Copy of this element.
    */
    clone() {
        return new ElementTableCell(this.toJSON());
    }

    /**
        Return JSON representing this table cell.
        @method toJSON
        @return {Object} JSON representing this cell.
    */
    toJSON() {
        return {
            content: this.content,
            style: $.extend(true, {}, this.style),
        };
    }

    /**
        Update cell content and style with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        this.content = replaceStringVariables(this.content, module);


        Object.entries(this.style).forEach(entry => {
            const [ key, value ] = entry;
            let newValue = replaceStringVariables(value, module);

            if (key === 'background-color') {
                newValue = fillColorModalNameToXMLName[newValue] || newValue;
            }
            else if (key === 'width') {
                newValue = isNaN(newValue) ? newValue : `${newValue}%`;
            }

            this.style[key] = newValue;
        });
    }

    /**
        Prepare cells for rendering.
        @method prepareForRendering
        @return {void}
    */
    prepareForRendering() {
        this.contentHTML = replaceBackticks(this.content);
    }

    /**
        Change the CSS styles to be printable, rather than just XML names, like: zyAnimatorOrange
        @method changeToPrintableStyles
        @return {void}
    */
    changeToPrintableStyles() {
        if (this.style['background-color']) {
            const color = require('utilities')[this.style['background-color']];

            if (color) {
                this.style['background-color'] = color;
            }

            // Not a valid color, so remove.
            else {
                delete this.style['background-color'];
            }
        }
    }
}
