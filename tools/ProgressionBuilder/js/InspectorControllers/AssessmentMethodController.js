'use strict';

/* global AbstractInspectorController */

/**
    Control the assessment method options in the inspector.
    @class AssessmentMethodController
    @extends AbstractInspectorController
    @constructor
*/
function AssessmentMethodController() {
    AbstractInspectorController.prototype.constructor.apply(this, arguments);
}

AssessmentMethodController.prototype = new AbstractInspectorController();
AssessmentMethodController.prototype.construtor = AssessmentMethodController;

/**
    Render the options, then add listeners.
    @method render
    @return {void}
*/
AssessmentMethodController.prototype.render = function() {
    const tolerancePercentage = this._element.assessmentProperties.tolerancePercentage;
    const absoluteTolerance = this._element.assessmentProperties.toleranceAbsoluteValue;
    const caseSensitive = this._element.assessmentProperties.caseSensitive;
    const html = this._templates.AssessmentMethod({ // eslint-disable-line new-cap
        tolerancePercentage: tolerancePercentage || '5',
        absoluteTolerance: absoluteTolerance || '2',
        caseSensitive: caseSensitive || false,
    });

    this._$inspector.append(html);

    const $stringMatchOption = this._$inspector.find('#string-match-option');
    const $caseSensitiveOption = this._$inspector.find('#case-sensitive-checkbox');
    const $tolerancePercentageOption = this._$inspector.find('#tolerance-percentage-option');
    const $absoluteToleranceOption = this._$inspector.find('#absolute-tolerance-option');
    const $tolerancePercentage = this._$inspector.find('#tolerance-percentage');
    const $absoluteTolerance = this._$inspector.find('#absolute-tolerance');

    // Check the appropriate radio button.
    let $radioToCheck = $stringMatchOption;

    if (this._element.assessmentMethod === 'numericalMatch') {
        const useTolerancePercentage = tolerancePercentage || (tolerancePercentage === 0);

        $radioToCheck = useTolerancePercentage ? $tolerancePercentageOption : $absoluteToleranceOption;
    }

    $stringMatchOption.change(() => {
        this.disablePropertiesInput();
        $caseSensitiveOption.prop('disabled', false);
        this._element.assessmentMethod = 'stringMatch';

        this._element.assessmentProperties = {
            caseSensitive: $caseSensitiveOption.prop('checked'),
        };
        this._progressionChangingFunctions.takeSnapshot();
    });

    $caseSensitiveOption.change(event => {
        this._element.assessmentProperties = {
            caseSensitive: event.target.checked,
        };
        this._progressionChangingFunctions.takeSnapshot();
    });

    $tolerancePercentageOption.change(() => {
        this.disablePropertiesInput();
        $tolerancePercentage.prop('disabled', false);
        this._element.assessmentMethod = 'numericalMatch';

        if ($tolerancePercentage.val() === '') {
            $tolerancePercentage.val('2');
        }

        this._element.assessmentProperties = {
            tolerancePercentage: $tolerancePercentage.val(),
        };

        this._progressionChangingFunctions.takeSnapshot();
    });

    $tolerancePercentage.on('input', () => {
        this._element.assessmentProperties = {
            tolerancePercentage: $tolerancePercentage.val(),
        };
        this._progressionChangingFunctions.takeSnapshot();
    });

    $absoluteToleranceOption.change(() => {
        this.disablePropertiesInput();
        $absoluteTolerance.prop('disabled', false);
        this._element.assessmentMethod = 'numericalMatch';

        if ($absoluteTolerance.val() === '') {
            $absoluteTolerance.val('2');
        }

        this._element.assessmentProperties = {
            toleranceAbsoluteValue: $absoluteTolerance.val(),
        };

        this._progressionChangingFunctions.takeSnapshot();
    });

    $absoluteTolerance.on('input', () => {
        this._element.assessmentProperties = {
            toleranceAbsoluteValue: $absoluteTolerance.val(),
        };
        this._progressionChangingFunctions.takeSnapshot();
    });

    $radioToCheck.prop('checked', true);
    $radioToCheck.change();
};

/**
    Disables the assessment properties (case sensitive, tolerance %, and absolute tolerance).
    @method disablePropertiesInput
    @return {void}
*/
AssessmentMethodController.prototype.disablePropertiesInput = function() {
    this._$inspector.find('#case-sensitive-checkbox').prop('disabled', true);
    this._$inspector.find('#tolerance-percentage').prop('disabled', true);
    this._$inspector.find('#absolute-tolerance').prop('disabled', true);
};
