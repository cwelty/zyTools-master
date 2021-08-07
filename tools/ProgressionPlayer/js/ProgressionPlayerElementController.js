/**
    Control an element displayed to the user, including rendering, updating, and destroying.
    This controller is an abstract class.

    @class ProgressionPlayerElementController
    @extends ElementController
    @constructor
*/
function ProgressionPlayerElementController() {
    require('ProgressionUtilities').create().inheritElementController().constructor.apply(this, arguments);
}

/**
    Build the ProgressionPlayerElementController prototype.
    @method buildProgressionPlayerElementControllerPrototype
    @return {void}
*/
function buildProgressionPlayerElementControllerPrototype() {
    ProgressionPlayerElementController.prototype = require('ProgressionUtilities').create().inheritElementController();
    ProgressionPlayerElementController.prototype.constructor = ProgressionPlayerElementController;

    /**
        Return whether the user's answer for this element is correct.
        Inheriting controllers with an interactive element should override this.
        @method isCorrect
        @return {Boolean} Whether the user's answer is correct for this element. Default is true.
    */
    ProgressionPlayerElementController.prototype.isCorrect = function() {
        return true;
    };

    /**
        Mark the element as a wrong answer.
        @method markAsWrongAnswer
        @return {void}
    */
    ProgressionPlayerElementController.prototype.markAsWrongAnswer = function() {
        this._$element.addClass('wrong-answer');
    };

    /**
        Return whether the elements have an invalid configuration.
        Inheriting controllers with an interactive element should override this.
        @method isInvalidAnswer
        @return {Boolean} True if any element has an invalid configuration. Default is false.
    */
    ProgressionPlayerElementController.prototype.isInvalidAnswer = function() {
        return false;
    };

    /**
        Mark the element as an invalid answer.
        @method markAsInvalidAnswer
        @return {void}
    */
    ProgressionPlayerElementController.prototype.markAsInvalidAnswer = function() {
        this._$element.addClass('invalid-answer');
    };

    /**
        Return the user's answer for the element.
        Inheriting controllers with an interactive element should override this.
        @method userAnswer
        @return {String} The user's answer for this element. Default is empty string.
    */
    ProgressionPlayerElementController.prototype.userAnswer = function() {
        return {
            id: this._elementRendered.id,
            userAnswer: this._elementSpecificUserAnswer(),
        };
    };

    /**
        Return the user's answer for this specific element.
        @method _elementSpecificUserAnswer
        @private
        @return {String} The user answer for this specific element.
    */
    ProgressionPlayerElementController.prototype._elementSpecificUserAnswer = function() { // eslint-disable-line no-underscore-dangle
        return '';
    };

    /**
        Return the expected answer for the element.
        Inheriting controllers with an interactive element should override this.
        @method expectedAnswer
        @return {String} The expected answer for this element. Default is empty string.
    */
    ProgressionPlayerElementController.prototype.expectedAnswer = function() {
        return {
            id: this._elementRendered.id,
            expectedAnswer: this._elementSpecificExpectedAnswer(),
        };
    };

    /**
        Return the expected answer for this specific element.
        @method _elementSpecificExpectedAnswer
        @private
        @return {String} The user answer for this specific element.
    */
    ProgressionPlayerElementController.prototype._elementSpecificExpectedAnswer = function() { // eslint-disable-line no-underscore-dangle
        return '';
    };

    /**
        Remove the invalid answer class from |_$element|.
        @method removeInvalidAnswerStatus
        @return {void}
    */
    ProgressionPlayerElementController.prototype.removeInvalidAnswerStatus = function() {
        this._$element.removeClass('invalid-answer');
    };

    /**
        Disable the controller's interactive elements.
        Inheriting objects that are interactive should override this.
        @method disable
        @return {void}
    */
    ProgressionPlayerElementController.prototype.disable = function() {};

    /**
        Enable the controller's interactive elements.
        Inheriting objects that are interactive should override this.
        @method enable
        @return {void}
    */
    ProgressionPlayerElementController.prototype.enable = function() {};

    /**
        Whether the element supports being focused upon.
        @property doesSupportFocus
        @type {Boolean}
        @default false
    */
    ProgressionPlayerElementController.prototype.doesSupportFocus = false;

    /**
        Move browser focus to the controller's interactive element.
        @method focus
        @return {void}
    */
    ProgressionPlayerElementController.prototype.focus = function() {}; // eslint-disable-line no-empty-function

    /**
        Whether the element is assessed for correctness.
        @property isAssessedForCorrectness
        @type {Boolean}
        @default false
    */
    ProgressionPlayerElementController.prototype.isAssessedForCorrectness = false;

    /**
        Return whether this controller's element has the given id.
        @method hasElementId
        @param {String} id The given id.
        @return {Boolean} Whether this controller's element has the given id.
    */
    ProgressionPlayerElementController.prototype.hasElementId = function(id) {
        return this._elementRendered.id === id;
    };

    /**
        Set the controller's answer with the given answer.
        @method setUserAnswer
        @param {Object} answer The answer to set.
        @return {Boolean} Whether this controller's element has the given id.
    */
    ProgressionPlayerElementController.prototype.setAnswer = function(answer) {}; // eslint-disable-line
}
