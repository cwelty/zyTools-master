/* global ProgressionController */
'use strict';

/**
    Control the object list.
    @class ObjectListController
    @extends ProgressionController
    @constructor
*/
function ObjectListController(...args) {
    this._$elements = [];
    ProgressionController.prototype.constructor.apply(this, args);
}

ObjectListController.prototype = new ProgressionController();
ObjectListController.prototype.contructor = ObjectListController;

/**
    Render the object list, then add listeners.
    @method render
    @return {void}
*/
ObjectListController.prototype.render = function() {

    // Render object list.
    this._$dom.empty();
    const objectListHTML = this._templates.ObjectList({ // eslint-disable-line new-cap
        elements: this._progression.elements.slice(),
    });

    this._$dom.html(objectListHTML);

    // Attach respective {Element} to each DOM element in list.
    this._$elements = this._$dom.find('.object-list-element');
    this._$elements.each((index, element) => {
        $(element).data('element', this._progression.elements[index]);
    });

    // Add listener to each object in list.
    this._$elements.mousedown(event => {
        const $target = $(event.target);
        const indexOfElement = $target.index();
        const selectedElement = this._progression.elements[indexOfElement];

        this._progressionChangingFunctions.selectedElement(selectedElement);
    });

    // Sort elements in object list. Higher in list means closer to user.
    this._$dom.find('.list').sortable({
        update: () => {
            const $updatedDOMElements = this._$dom.find('.object-list-element');
            const $updatedElements = $updatedDOMElements.map((index, element) => $(element).data('element'));

            this._progressionChangingFunctions.updateElements($.makeArray($updatedElements));
        },
    });
};

/**
    Remove highlight from all elements, except the selected element.
    @method updateElementSelected
    @return {void}
*/
ObjectListController.prototype.updateElementSelected = function() {

    // De-selected all elements.
    this._$elements.removeClass('selected');

    // Select the element with |isSelected| as true.
    const indexesOfSelected = this._progression.elements.map((element, index) => { // eslint-disable-line arrow-body-style
        return element.isSelected ? index : -1;
    }).filter(index => index !== -1);

    indexesOfSelected.forEach(indexOfSelected => this._$elements.eq(indexOfSelected).addClass('selected'));
};

/**
    Re-render since an element was added.
    @method elementAdded
    @return {void}
*/
ObjectListController.prototype.elementAdded = function() {
    this.render();
};

/**
    Re-render since elements changed.
    @method elementAdded
    @return {void}
*/
ObjectListController.prototype.updatedElements = function() {
    this.render();
};
