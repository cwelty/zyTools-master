'use strict';

/* global ProgressionController, findSelectedQuestionAndLevel */

/**
    Control the explanations.
    @class ExplanationsController
    @extends ProgressionController
    @constructor
*/
function ExplanationsController(...args) {
    ProgressionController.prototype.constructor.apply(this, args);
}

ExplanationsController.prototype = new ProgressionController();
ExplanationsController.prototype.contructor = ExplanationsController;

/**
    Render the explanation, then add listeners.
    @method render
    @return {void}
*/
ExplanationsController.prototype.render = function() {
    const result = findSelectedQuestionAndLevel(this._progression.levels);
    const selectedLevel = result.selectedLevel;
    const selectedQuestion = result.selectedQuestion;

    this._$dom.empty();
    const explanationsHTML = this._templates.Explanations({ // eslint-disable-line new-cap
        level: selectedLevel,
        question: selectedQuestion,
    });

    this._$dom.html(explanationsHTML);

    // Add a change listener to each textarea field.
    const $textareas = this._$dom.find('textarea');

    $textareas.on('keyup change', event => {
        const newExplanation = $(event.currentTarget).val();

        switch ($textareas.index(event.target)) {

            // Index 0 means level.
            case 0:
                selectedLevel.explanation = newExplanation;
                break;

            // Index 1 means question.
            case 1:
                selectedQuestion.explanation = newExplanation;
                break;

            default:
                break;
        }
    });

    // Add a click listener to the information symbol containing documentation for explanations.
    const $info = this._$dom.find('span.info-char');

    $info.click(() => {
        this._parentResource.alert(
            'Using explanations',
            this._templates.explanationsDocumentation()
        );

        // Make OK button take all the space available.
        $('.ProgressionBuilder-modal div.buttons').css({ width: 'auto', 'margin-right': '10px' });
    });
};

/**
    An element was selected, so re-render the explanation.
    @method updateElementSelected
    @return {void}
*/
ExplanationsController.prototype.updateElementSelected = function() {
    this.render();
};

/**
    A question was selected, so re-render the explanation.
    @method updateQuestionSelected
    @return {void}
*/
ExplanationsController.prototype.updateQuestionSelected = function() {
    this.render();
};
