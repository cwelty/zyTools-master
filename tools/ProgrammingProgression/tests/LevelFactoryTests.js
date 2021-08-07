/* global buildLevelFactory, testPropertiesArePresent */
'use strict';

$(document).ready(() => {
    const javaLevelFactory = buildLevelFactory();
    const properties = [ 'levelTemplates', 'utilities', 'getParameterCombination', 'make' ];

    // Test all the LevelTemplate properties are present
    QUnit.test('LevelFactory properties.', assert => {
        testPropertiesArePresent(javaLevelFactory, properties, assert);
        assert.strictEqual(typeof javaLevelFactory.getParameterCombination, 'function');
        assert.strictEqual(typeof javaLevelFactory.make, 'function');
    });

    const parameters = {
        coolSuperheroes: [ 'Iron Man', 'Batman', 'Flash', 'Superman' ],
        spanishGreetings: [ 'Hola', 'Buenos días' ],
    };
    const chosenParmeters = javaLevelFactory.getParameterCombination(parameters);

    QUnit.test('Parameters are correctly chosen', assert => {
        assert.strictEqual(typeof chosenParmeters, 'object');
        assert.ok('coolSuperheroes' in chosenParmeters);
        assert.ok('spanishGreetings' in chosenParmeters);
    });
});
