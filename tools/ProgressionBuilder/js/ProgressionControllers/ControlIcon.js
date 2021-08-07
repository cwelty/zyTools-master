'use strict';

/* exported ControlIcon */

/**
    Structure to store a control icon's name and action.
    @class ControlIcon
*/
class ControlIcon {

    /**
        @constructor
        @param {String} name The name of the control icon.
        @param {Function} action The action to perform when this icon is clicked.
    */
    constructor(name, action) {
        this.name = name;
        this.action = action;
    }
}
