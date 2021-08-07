'use strict';

/* exported NewProgressionModalController */
/* global Ember, addNewLevelWithOneQuestions, mapElementVariants, defaultProgression */

/**
    Controller for the modal to decide how to begin the new progression.
    @class NewProgressionModalController
*/
class NewProgressionModalController {

    /**
        @constructor
        @param {Object} parentResource The parent resource of the module.
        @param {Object} templates Dictionary of templates for rendering elements.
    */
    constructor(parentResource, templates) {

        /**
            The parent resource of the module.
            @property parentResource
            @private
            @type {Object}
        */
        this._parentResource = parentResource;

        /**
            Dictionary of templates for rendering elements.
            @property _templates
            @private
            @type {Object}
        */
        this._templates = templates;
    }

    /**
        Return whether the named checkbox is checked.
        @method _isChecked
        @private
        @param {String} name The name of the checkbox to check.
        @return {Boolean} Whether the checkbox is checked.
    */
    _isChecked(name) {
        return $(`input[name=${name}]`).is(':checked');
    }

    /**
        Clear the code property of each item.
        @method _clearCode
        @param {Array} items Array of {Object}. Each item has a code property.
        @return {void}
    */
    _clearCode(items) {
        items.forEach(item => {
            item.code = '';
        });
    }

    /**
        Make a new progression based on the current progression.
        @method _makeNewProgression
        @private
        @param {Progression} currentProgression The progression currently being edited.
        @return {Progression} The new progression based on the current progression.
    */
    _makeNewProgression(currentProgression) {
        const newProgression = currentProgression.clone();

        // Reset height, width, and isExam.
        newProgression.height = defaultProgression.height;
        newProgression.width = defaultProgression.width;
        newProgression.isExam = defaultProgression.isExam;

        if (this._isChecked('remove-global-code')) {
            this._clearCode([ newProgression ]);
        }

        const levels = newProgression.levels;
        const questions = levels.map(level => level.questions)
                                .flat();

        if (this._isChecked('remove-all-objects')) {
            [ newProgression.elements ].concat(mapElementVariants(levels))
                                       .concat(mapElementVariants(questions))
                                       .forEach(objectList => {
                                           objectList.length = 0;
                                       });
        }

        if (this._isChecked('remove-all-questions-and-levels')) {
            levels.length = 0;
            addNewLevelWithOneQuestions(levels);
            newProgression.levels[0].questions[0].isSelected = true;
        }
        else {
            if (this._isChecked('remove-all-level-code')) {
                this._clearCode(levels);
            }

            if (this._isChecked('remove-all-question-code')) {
                this._clearCode(questions);
            }

            if (this._isChecked('remove-all-explanations')) {
                levels.concat(questions)
                      .forEach(item => {
                          item.explanation = '';
                      });
            }
        }

        return newProgression;
    }

    /**
        Show a modal wherein the user can pick how to begin a new progression.
        @method show
        @param {Progression} currentProgression The current progression being edited.
        @return {Promise} A promise to get a new progression.
    */
    show(currentProgression) {
        return new Ember.RSVP.Promise(resolve => {
            this._parentResource.showModal(
                'Begin new progression?',
                this._templates.NewProgressionModal(), // eslint-disable-line new-cap
                {
                    label: 'Yes, begin new progression',
                    decoration: 'button-blue',
                    callback: () => resolve(this._makeNewProgression(currentProgression)),
                },
                {
                    label: 'No, do not begin new progression',
                    decoration: 'button-red',
                }
            );

            window.setTimeout(() => {
                const $subCheckboxes = $('div.sub-checkboxes input');

                $('input[name=remove-all-questions-and-levels]').change(event => {
                    const isChecked = event.target.checked;

                    if (isChecked) {
                        $subCheckboxes.prop('checked', true);
                    }
                    $subCheckboxes.prop('disabled', isChecked);
                });
            }, 1);
        });
    }
}
