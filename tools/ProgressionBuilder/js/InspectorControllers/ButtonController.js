'use strict';

/* global AbstractInspectorController */

/**
    Control a button in the inspector.
    @class ButtonController
    @extends AbstractInspectorController
    @constructor
*/
function ButtonController() {
    AbstractInspectorController.prototype.constructor.apply(this, arguments);
}

ButtonController.prototype = new AbstractInspectorController();
ButtonController.prototype.construtor = ButtonController;

/**
    Render the explanation, then add listeners.
    @method render
    @return {void}
*/
ButtonController.prototype.render = function() {
    const buttonHTML = this._templates.Button({
        name: this._options.name,
    });

    this._$inspector.append(buttonHTML);

    this._$inspector.children().last().click(() => {
        this._options.action(this);
    });
};
