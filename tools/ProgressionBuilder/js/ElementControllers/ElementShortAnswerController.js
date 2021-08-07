'use strict';

/* exported buildElementShortAnswerControllerPrototype */
/* global ProgressionBuilderElementController, PropertyAndValue */

/**
    Control a short answer element.
    @class ElementShortAnswerController
    @extends ProgressionBuilderElementController
*/
class ElementShortAnswerController {
    constructor(...args) {
        ProgressionBuilderElementController.prototype.constructor.apply(this, args);
    }
}

/**
    Build the ElementShortAnswerController prototype.
    @method buildElementShortAnswerControllerPrototype
    @return {void}
*/
function buildElementShortAnswerControllerPrototype() {
    ElementShortAnswerController.prototype = new ProgressionBuilderElementController();
    ElementShortAnswerController.prototype.constructor = ElementShortAnswerController;

    /**
        Start the edit mode wherein the user can edit the short answer options.
        @method _startEditMode
        @private
        @return {void}
    */
    ElementShortAnswerController.prototype._startEditMode = function() { // eslint-disable-line no-underscore-dangle
        const currentCorrectAnswers = this._getMostSpecificValueOfProperty('correctAnswers');
        const currentPlaceholderText = this._getMostSpecificValueOfProperty('placeholder');

        const saveModalCallback = () => {
            const $correctAnswerFields = $('div.correct-answers-container input.correct-answer');
            const placeholderText = $('input.placeholder').val();
            const correctAnswers = $correctAnswerFields.map((index, inputField) => inputField.value).toArray();

            // Last entry is an empty string, so we remove it.
            correctAnswers.pop();

            window.setTimeout(() => {
                this._endEditMode([
                    new PropertyAndValue('correctAnswers', correctAnswers),
                    new PropertyAndValue('placeholder', placeholderText),
                ]);
            }, 1);
        };

        // Open modal with inputs to fill this short answer object's data.
        this._parentResource.showModal(
            'Edit short answer object',
            this._templates.ElementShortAnswerEdit({ // eslint-disable-line new-cap
                correctAnswers: currentCorrectAnswers,
                numCorrectAnswers: currentCorrectAnswers.length,
                placeholder: currentPlaceholderText,
            }),
            this._makeModalSaveButton(saveModalCallback),
            this._makeModalCancelButton()
        );

        window.setTimeout(() => {

            // Dinamically fill modal (add input fields for new correct answers).
            const correctAnswersInputs = currentCorrectAnswers.map((correctAnswer, index) =>
                this._templates.ElementShortAnswerCorrectAnswerInputEdit({ correctAnswer, index }) // eslint-disable-line new-cap
            );

            // Add one more field for additional correct answers.
            correctAnswersInputs.push(this._templates.ElementShortAnswerCorrectAnswerInputEdit({ // eslint-disable-line new-cap
                correctAnswer: '',
                index: correctAnswersInputs.length,
            }));
            $('div.correct-answers-container').append(correctAnswersInputs);
            this._setupModalEventListeners();
        }, 1);
    };

    ElementShortAnswerController.prototype._setupModalEventListeners = function() { // eslint-disable-line no-underscore-dangle
        const $correctAnswersContainer = $('div.correct-answers-container');
        let $correctAnswers = $correctAnswersContainer.find('input.correct-answer');
        let $lastCorrectAnswer = $correctAnswers.last();

        // When the clear field button is pressed. Clear the related input field.
        const clearButtonPressed = event => {
            let $target = $(event.target);

            // Target should be button.
            if ($target.is('i')) {
                $target = $target.parent();
            }

            // Clear related input field, trigger the input event.
            $target.parent().find('input.correct-answer').val('').trigger('input');
        };

        $correctAnswersContainer.find('button').click(clearButtonPressed);

        // When the correct answer input field is empty, remove from the modal (except the last one).
        const nonLastCorrectAnswerChangeHandler = event => {
            const $inputField = $(event.target);

            if ($inputField.val() === '') {
                $inputField.parent().remove();
                $correctAnswers.last().focus();
            }
        };

        $correctAnswers.filter(':not(:last)').on('input', nonLastCorrectAnswerChangeHandler);

        // If last correct answer input field has some content, add a new input field (this one is not last anymore).
        const lastCorrectAnswerChangeHandler = () => {
            if ($lastCorrectAnswer.val() !== '') {
                $lastCorrectAnswer.unbind('input');
                const newCorrectAnswerInput = this._templates.ElementShortAnswerCorrectAnswerInputEdit({ // eslint-disable-line new-cap
                    correctAnswer: '',
                    index: $correctAnswers.length,
                });

                // Update variables and event handlers.
                $lastCorrectAnswer.parent().find('button').removeClass('hide-button');
                $correctAnswersContainer.append(newCorrectAnswerInput);
                $correctAnswersContainer.find('button').click(clearButtonPressed);
                $correctAnswers = $correctAnswersContainer.find('input.correct-answer');
                $correctAnswers.filter(':not(:last)').on('input', nonLastCorrectAnswerChangeHandler);
                $lastCorrectAnswer = $correctAnswers.last();
                $lastCorrectAnswer.on('input', lastCorrectAnswerChangeHandler);
            }
        };

        $lastCorrectAnswer.on('input', lastCorrectAnswerChangeHandler);
    };
}
