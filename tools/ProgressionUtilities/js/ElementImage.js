'use strict';

/* exported ElementImage */
/* global replaceStringVariables */

/**
    An {ElementImage} models an image.
    @class ElementImage
    @extends Element
*/
class ElementImage extends Element {

    /**
        @constructor
        @param {Object} elementImageJSON JSON that models the image. See {Element} for more properties.
        @param {String} elementImageJSON.imageID The ID of the image, used for finding the image.
        @param {Object} elementImageJSON.style The rendering styles (e.g., CSS) of the element.
        @param {Boolean} elementImageJSON.controlHeightWidthPerQuestion Whether the height and width are controlled per question, or same for all questions.
    */
    constructor(elementImageJSON) {
        super(elementImageJSON);
        this.imageID = elementImageJSON.imageID || '';
        this.controlHeightWidthPerQuestion = elementImageJSON.controlHeightWidthPerQuestion || false;
        this._updateKeepRatioProperties();
    }

    /**
        Return a clone of this element.
        @method clone
        @return {Element} Copy of this element.
    */
    clone() {
        return new ElementImage(this.toJSON());
    }

    /**
        Return JSON representing this element.
        @method toJSON
        @return {Object} JSON representing this element.
    */
    toJSON() {
        const elementJSON = Element.prototype.toJSON.call(this); // eslint-disable-line prefer-reflect

        elementJSON.imageID = this.imageID;
        elementJSON.controlHeightWidthPerQuestion = this.controlHeightWidthPerQuestion;

        return elementJSON;
    }

    /**
        Updates the values of |keepHeightRatio| and |keepWidthRatio| depending on the values of style.height and style.width.
        @method _updateKeepRatioProperties
        @private
        @return {void}
    */
    _updateKeepRatioProperties() {
        this.keepHeightRatio = this.style.height === 'auto';
        this.keepWidthRatio = this.style.width === 'auto';
    }

    /**
       Set a |property| of {Element} with |value|.
       @method _setProperty
       @private
       @param {String} property The property to be updated.
       @param {Object} value The value to assigned to |property|. Ex: Updated |id|, |isInEditMode|, or |style|.
       @return {void}
    */
    _setProperty(property, value) {
        super._setProperty(property, value); // eslint-disable-line no-underscore-dangle
        this._updateKeepRatioProperties();
    }

    /**
        Update image ID with executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {void}
    */
    updateWithCode(module) {
        this.imageID = replaceStringVariables(this.imageID, module);
    }
}
