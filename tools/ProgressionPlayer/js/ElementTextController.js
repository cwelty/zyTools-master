/**
    Control a text element.
    @class ElementTextController
    @extends ProgressionPlayerElementController
*/
function ElementTextController() {
    ProgressionPlayerElementController.prototype.constructor.apply(this, arguments);
    this.render();
}

/**
    Build the ElementTextController prototype.
    @method buildElementTextControllerPrototype
    @return {void}
*/
function buildElementTextControllerPrototype() {
    ElementTextController.prototype = new ProgressionPlayerElementController();
    ElementTextController.prototype.constructor = ElementTextController;
}
