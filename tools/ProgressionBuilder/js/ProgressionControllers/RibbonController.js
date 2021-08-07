'use strict';

/* global ElementIcon, ControlIcon, ProgressionController */

/**
    Control the ribbon.
    @class RibbonController
    @extends ProgressionController
    @constructor
*/
function RibbonController() {
    ProgressionController.prototype.constructor.apply(this, arguments);
}

RibbonController.prototype = new ProgressionController();
RibbonController.prototype.contructor = RibbonController;

/**
    Render the ribbon, then add listeners.
    @method render
    @return {void}
*/
RibbonController.prototype.render = function() {
    this._$dom.empty();

    const elementIcons = [
        new ElementIcon('text', 'T'),
        new ElementIcon('image', 'I'),
        new ElementIcon('dropdown', 'D'),
        new ElementIcon('shortanswer', 'S'),
        new ElementIcon('table', 'Ta'),
        new ElementIcon('checkbox', 'Ch'),
    ];

    const controlIcons = [
        new ControlIcon('Undo', this._progressionChangingFunctions.undoProgression),
        new ControlIcon('Redo', this._progressionChangingFunctions.redoProgression),
        new ControlIcon('Run player', this._progressionChangingFunctions.switchToPlayer),
        new ControlIcon('Begin new progression', this._progressionChangingFunctions.beginNewProgression),
    ];

    const ribbonHTML = this._templates.Ribbon({ elementIcons, controlIcons });

    this._$dom.html(ribbonHTML);

    // Add listener to add element when icon clicked.
    this._$dom.find('.element-icon').click(event => {
        const type = $(event.currentTarget).attr('type');

        this._progressionChangingFunctions.disableArrowKeyMovement();
        this._progressionChangingFunctions.addElement(type);
    });

    const $controlIcons = this._$dom.find('.control-icon');

    $controlIcons.click(event => {
        const index = $controlIcons.index(event.target);

        controlIcons[index].action();
    });
};
