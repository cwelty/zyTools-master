'use strict';

/* global AbstractInspectorController */

/**
    Control the dropdown ordering method options in the inspector.
    @class OptionOrderMethodController
    @extends AbstractInspectorController
    @constructor
*/
function OptionOrderMethodController() {
    AbstractInspectorController.prototype.constructor.apply(this, arguments);
}

OptionOrderMethodController.prototype = new AbstractInspectorController();
OptionOrderMethodController.prototype.construtor = OptionOrderMethodController;

/**
    Render the options, then add listeners.
    @method render
    @return {void}
*/
OptionOrderMethodController.prototype.render = function() {
    this._$inspector.append(this._templates.OptionOrderMethod()); // eslint-disable-line new-cap

    const $inputs = this._$inspector.children().last().find('input');

    // Check the appropriate radio button.
    $inputs.filter(`[value=${this._element.optionOrderingMethod}]`).prop('checked', true);

    $inputs.change(event => {
        this._element.optionOrderingMethod = $(event.currentTarget).val();
        this._progressionChangingFunctions.takeSnapshot();
    });
};
