/*
    |Question| is an Object containing:
        * |expectedAnswer| and |explanationTemplate| are required strings.
        * |validAnswerExplanation| is a string.
*/
function Question(expectedAnswer, explanationTemplate) {
    this.expectedAnswer = expectedAnswer || '';
    this.explanationTemplate = explanationTemplate || '';

    this.validAnswerExplanation = 'Your answer has an invalid format.';
}

/*
    Return whether the |userAnswer| matches the |expectedAnswer|.
    |userAnswer| is required and a string.
*/
Question.prototype.isCorrect = function(userAnswer) {
    return (userAnswer === this.expectedAnswer);
};

/*
    Return whether the |userAnswer| contains more than just whitespace.
    |userAnswer| is required and a string.
*/
Question.prototype.isInputFormatValid = function(userAnswer) {
    // \S means non-whitespace. So return true if |userAnswer| contains any non-whitespace.
    return /\S/.test(userAnswer);
};

/*
    Return an explanation replacing instances of USER_ANSWER in |explanationTemplate| with |userAnswer|.
    |explanationTemplate| is required and a string.
    |userAnswer| is required and a string.
*/
Question.prototype.getExplanation = function(userAnswer) {
    return this.explanationTemplate.replace(/USER_ANSWER/g, userAnswer);
};

/**
    Behavior to execute after the explanation has been added to the DOM.
    @method explanationPostProcess
    @return {void}
*/
Question.prototype.explanationPostProcess = function() {
    return;
};

/**
    Behavior to execute after the problem has been added to the DOM.
    @method generateProblemPostProcess
    @return {void}
*/
Question.prototype.generateProblemPostProcess = function() {
    return;
};

/**
    Return metadata for this progression to be recorded when Check is clicked.
    @method getMetadata
    @return {Object} Metadata to be recorded for this progression.
*/
Question.prototype.getMetadata = function() {
    return {};
};
