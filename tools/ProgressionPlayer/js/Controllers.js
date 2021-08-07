/**
    Array of {ProgressionPlayerElementController}.
    @class Controllers
    @extends Array
*/
function Controllers() {}
Controllers.prototype = new Array();
Controllers.prototype.constructor = Controllers;

/**
    Empty the array by destroying each {ElementController}.
    @method empty
    @return {void}
*/
Controllers.prototype.empty = function() {
    this.forEach(function(controller) {
        controller.destroy();
    });
    this.length = 0;
};

/**
    Disable each {ElementController}.
    @method disable
    @return {void}
*/
Controllers.prototype.disable = function() {
    this.forEach(function(controller) {
        controller.disable();
    });
};

/**
    Enable each {ElementController}.
    @method enable
    @return {void}
*/
Controllers.prototype.enable = function() {
    this.forEach(controller => {
        controller.enable();
    });
};

/**
    Focus on the front-most element that supports focusing.
    @method focus
    @return {void}
*/
Controllers.prototype.focus = function() {
    const controllerToFocus = this.find(controller => controller.doesSupportFocus);

    if (controllerToFocus) {
        controllerToFocus.focus();
    }
};

/**
    Return whether the elements are configured for a correct answer.
    @method isCorrect
    @param {Boolean} [highlightIncorrect=true] Whether to highlight the incorrect elements.
    @return {Boolean} True if each element is correctly configured.
*/
Controllers.prototype.isCorrect = function(highlightIncorrect = true) {
    const controllersWithIncorrectAnswers = this.filter(controller => !controller.isCorrect());

    if (highlightIncorrect) {
        controllersWithIncorrectAnswers.forEach(controller => controller.markAsWrongAnswer());
    }

    return (controllersWithIncorrectAnswers.length === 0);
};

/**
    Return whether any controller is an invalid answer.
    @method isInvalidAnswer
    @return {Boolean} True if any controller is an invalid answer.
*/
Controllers.prototype.isInvalidAnswer = function() {
    var controllersWithInvalidAnswers = this.filter(function(controller) {
        return controller.isInvalidAnswer();
    });

    controllersWithInvalidAnswers.forEach(function(controller) {
        controller.markAsInvalidAnswer();
    });

    return (controllersWithInvalidAnswers.length > 0);
};

/**
    Return the controllers assessed for correctness, like a short answer.
    @method getControllersAssessedForCorrectness
    @return {Array} of {ElementController} The controllers assessed for correctness, like a short answer.
*/
Controllers.prototype.getControllersAssessedForCorrectness = function() {
    return this.filter(controller => controller.isAssessedForCorrectness);
};

/**
    Return the user's answer for each interactive element.
    @method userAnswer
    @return {Array} of {Object} The users answer for each interactive element.
*/
Controllers.prototype.userAnswer = function() {
    return this.getControllersAssessedForCorrectness()
               .map(controller => controller.userAnswer());
};

/**
    Return the expected answer for each interactive element.
    @method expectedAnswer
    @return {Array} of {Object} The expected answer for each interactive element.
*/
Controllers.prototype.expectedAnswer = function() {
    return this.getControllersAssessedForCorrectness()
               .map(controller => controller.expectedAnswer());
};

/**
    Remove the invalid answer status.
    @method removeInvalidAnswerStatus
    @return {void}
*/
Controllers.prototype.removeInvalidAnswerStatus = function() {
    this.forEach(controller => controller.removeInvalidAnswerStatus());
};

/**
    Set the answer to each of the respective interactive controllers.
    @method setAnswers
    @param {Array} userAnswers Array of {Object}. Each object has the id of the element and the user's previous answer for that element.
    @return {void}
*/
Controllers.prototype.setAnswers = function(userAnswers) {
    userAnswers.forEach(userAnswer => {
        const answer = userAnswer.userAnswer;

        if (answer) {
            const answerController = this.find(controller => controller.hasElementId(userAnswer.id));

            if (answerController) {
                answerController.setAnswer(answer);
            }
        }
    });
};
