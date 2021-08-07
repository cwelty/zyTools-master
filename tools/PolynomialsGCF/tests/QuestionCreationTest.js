/* global Question */
'use strict';

$(document).ready(() => {

    // Create a progression tool instance.
    const question = new Question();

    // Test if tool properties exist.
    const properties = [
        'expectedAnswer',
        'explanation',
        'inputPrefix',
        'inputPostfix',
        'placeholder',
        'prompt',
        'validAnswerExplanation',
    ];

    QUnit.test('Question Tool Creation', assert => {
        properties.forEach(testProperty => assert.ok((testProperty in question), `Question has property ${testProperty}`));
    });

    QUnit.test('QuestionFactory _mathematicallyEquivalentExpressions', assert => {
        let original = '34x^2 + 22x^1 + 35x^0';
        let equivalent = '34x^2 + 22x + 35';

        assert.equal(question._mathematicallyEquivalentExpressions(original), equivalent, `${original} = ${equivalent}`);

        original = '12y^2 + y^1 + x^1 + y^0';
        equivalent = '12y^2 + y + x + 1';

        assert.equal(question._mathematicallyEquivalentExpressions(original), equivalent, `${original} = ${equivalent}`);

        original = '12y^13 + y^11 + x^10 + y^0';
        equivalent = '12y^13 + y^11 + x^10 + 1';

        assert.equal(question._mathematicallyEquivalentExpressions(original), equivalent, `${original} = ${equivalent}`);
    });
});
