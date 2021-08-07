'use strict';

/* exported Element */

/**
    An {Element} models the state of a visual element. {Element} is an abstract class.
    @class Element
*/
class Element {

    /**
        @constructor
        @param {Object} elementJSON JSON that models an element.
        @param {String} elementJSON.id Unique to each element.
        @param {Boolean} elementJSON.isInEditMode Whether the element is currently in edit mode.
        @param {Boolean} elementJSON.isSelected Whether this element is currently selected.
        @param {String} elementJSON.name The name of this element.
        @param {Object} elementJSON.style CSS style for this element.
        @param {String} elementJSON.type The type of element.
    */
    constructor(elementJSON) {
        if (elementJSON) {
            this.id = elementJSON.id;
            this.isInEditMode = elementJSON.isInEditMode;
            this.isSelected = elementJSON.isSelected;
            this.name = elementJSON.name;
            this.style = elementJSON.style;
            this.type = elementJSON.type;
        }
    }

    /**
        Return a clone of this element. Inheriting objects should override this.
        @method clone
        @return {Element} Copy of this element.
    */
    clone() {
        throw new Error('Cannot clone Element.');
    }

    /**
        Return JSON representing this element.
        @method toJSON
        @return {Object} JSON representing this element.
    */
    toJSON() {
        return {
            id: this.id,
            isInEditMode: this.isInEditMode,
            isSelected: this.isSelected,
            name: this.name,
            style: $.extend(true, {}, this.style),
            type: this.type,
        };
    }

    /**
        Merge |variantToMerge| with this element.
        @method mergeElementVariant
        @param {ElementVariant} variantToMerge Variant to merge with this element.
        @return {void}
    */
    mergeElementVariant(variantToMerge) {
        for (const property in variantToMerge) { // eslint-disable-line guard-for-in
            this._setProperty(property, variantToMerge[property]);
        }
    }

    /**
        Set a |property| of {Element} with |value|. May be overwritten by inheriting classes.
        @method _setProperty
        @private
        @param {String} property The property to be updated.
        @param {Object} value The value to assigned to |property|. Ex: Updated |id|, |isInEditMode|, or |style|.
        @return {void}
    */
    _setProperty(property, value) {
        if (property === 'style') {
            $.extend(this.style, value);
        }
        else {
            this[property] = value;
        }
    }

    /**
        Update the element with the executed code.
        @method updateWithCode
        @param {Sk.module} module Skulpt Python module that has variables.
        @param {Boolean} inBuilderMode Whether this ProgressionPlayer instance was loaded by the ProgressionBuilder.
        @return {void}
    */
    updateWithCode(module, inBuilderMode) { // eslint-disable-line no-unused-vars

        // Inheriting elements may define behavior.
    }

    /**
        Prepare element content to be rendered.
        @method prepareForRendering
        @return {void}
    */
    prepareForRendering() {} // eslint-disable-line no-empty-function
}
