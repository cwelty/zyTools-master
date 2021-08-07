/* exported InspectorLevel */
'use strict';

/**
    Structure for storing a level's name and whether that level is checked.
    @class InspectorLevel
    @constructor
    @param {String} name The name of this level.
    @param {Boolean} isChecked Whether this level is currently checked/selected.
    @param {Boolean} [indeterminate=false] Whether the checkbox is in an indeterminate state.
*/
function InspectorLevel(name, isChecked, indeterminate = false) {
    this.name = name;
    this.isChecked = isChecked;
    this.indeterminate = indeterminate;
}
