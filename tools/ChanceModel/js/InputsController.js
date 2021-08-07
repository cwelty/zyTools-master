/* exported InputsController */
/* global AbstractController, validateInputs, exampleToOptions */
'use strict';

/**
    Control the inputs.
    @module InputsController
    @extends AbstractController
*/
class InputsController extends AbstractController {

    /**
        Render the inputs.
        @method render
        @param {String} example The example study to render.
        @param {Function} preSimulate A callback that a simulation will happen if inputs are valid.
        @param {Function} simulate A callback for when Simulate is clicked and inputs are valid.
        @return {void}
    */
    render({ example, preSimulate, simulate }) {
        const $inputs = this.getElement();
        const options = exampleToOptions[example];

        $inputs.html(this.templates.inputs(options));

        const $probability = $inputs.find('[name="probability-of-success"]');
        const $attempts = $inputs.find('[name="number-of-attempts"]');
        const $repetitions = $inputs.find('[name="number-of-repetitions"]');

        $inputs.find('.simulate').click(() => {
            preSimulate();

            const probability = parseFloat($probability.val());
            const attempts = parseInt($attempts.val(), 10);
            const repetitions = parseInt($repetitions.val(), 10);
            const { warnings, errors } = validateInputs(probability, attempts, repetitions, example);
            const $warnings = $inputs.find('.warnings');
            const $errors = $inputs.find('.errors');

            $warnings.hide();
            if (warnings.length) {
                $warnings.show()
                         .text(`Note: ${warnings.join(' ')}`);
            }

            $errors.hide();
            if (errors.length) {
                $errors.show()
                       .text(`Error: ${errors.join(' ')}`);
            }
            else {
                simulate(probability, attempts, repetitions);
            }
        });

        const { probability, attempts, repetitions } = options;

        $inputs.find('.reset-inputs').click(() => {
            $probability.val(probability.initial);
            $attempts.val(attempts.initial);
            $repetitions.val(repetitions.initial);
        });
    }
}
