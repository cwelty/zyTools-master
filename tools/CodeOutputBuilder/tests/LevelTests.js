/* global Level */
'use strict';

const simpleVariableName = 'Simple variable';
const dictionaryVariableName = {
    key1: 'Value 1',
    key2: 'Value 2',
};
const listVariableName = [ '1', '2', '3' ];
const listOfDictionaries = [
    {
        first: 'out',
        second: 'in',
    },
    {
        first: 'in',
        second: 'out',
    },
];

/**
    Tests that |level| has the parameters set.
    @method testParameters
    @param {Qunit.assert} assert QUnit's assert object.
    @param {Level} level The level that needs checking the parameters.
    @param {String} message A message add to the assert's message.
    @return {void}
*/
function testParameters(assert, level, message) {
    assert.deepEqual(level.parameters.simpleVariableName, simpleVariableName, `Parameter value ${message}`);
    assert.deepEqual(level.parameters.dictionaryVariableName, dictionaryVariableName, `Parameter value ${message}`);
    assert.deepEqual(level.parameters.listVariableName, listVariableName, `Parameter value ${message}`);
    assert.deepEqual(level.parameters.listOfDictionaries, listOfDictionaries, `Parameter value ${message}`);
}

$(document).ready(() => {
    const level = new Level();

    QUnit.test('Level: property tests', assert => {
        assert.equal(level.input, '');
        assert.equal(level.explanation, '');
        assert.deepEqual(level.parameters, '');
        assert.ok(level.utilities);
        assert.equal(level.files.length, 0);
    });

    level.input = '<input>';
    level.explanation = '<explanation>';
    QUnit.test('Level: escaping tests', assert => {
        assert.equal(level.getEscapedInput(), '&lt;input&gt;', 'Testing getEscapedInput()');
        assert.equal(level.getEscapedExplanation(), '&lt;explanation&gt;', 'Testing getEscapedExplanation()');
    });

    const parametersString = `{
   simpleVariableName: 'Simple variable',
   dictionaryVariableName: {
      key1: 'Value 1',
      key2: 'Value 2'
   },
   listVariableName: [ '1', '2', '3' ],
   listOfDictionaries: [
      {
         first: 'out',
         second: 'in',
      },
      {
         first: 'in',
         second: 'out',
      }
   ]
}`;
    const parametersObject = {
        simpleVariableName,
        dictionaryVariableName,
        listVariableName,
        listOfDictionaries,
    };
    const simpleVariableNameXML = '\n        <simpleVariableName>Simple variable</simpleVariableName>';
    const dictionaryVariableNameXML = `\n        <dictionaryVariableName type='dict'>
            <key1>Value 1</key1>
            <key2>Value 2</key2>
        </dictionaryVariableName>`;
    const listVariableNameXML = `\n        <listVariableName type='list'>
            <li>1</li>
            <li>2</li>
            <li>3</li>
        </listVariableName>`;
    const listOfDictionariesXML = `\n        <listOfDictionaries type='list'>
            <li type='dict'>
                <first>out</first>
                <second>in</second>
            </li>
            <li type='dict'>
                <first>in</first>
                <second>out</second>
            </li>
        </listOfDictionaries>`;
    const parametersXMLString = `    <parameters type='dict'>${simpleVariableNameXML}${dictionaryVariableNameXML}` +
                                `${listVariableNameXML}${listOfDictionariesXML}\n    </parameters>`;
    const $parametersXMLDocument = $($.parseXML(parametersXMLString));
    const $parametersXML = $parametersXMLDocument.find('parameters');

    level.setParameters(parametersString);
    QUnit.test('Level: Parameters test', assert => {

        // Invalud parameters string throws error.
        assert.throws(() => level.setParameters('[ 1, 2, 3'));

        // Previous error didn't change the parameter values.
        testParameters(assert, level, 'from string');

        // Converting single parameters with XML.
        assert.equal(level.xmlParameterValueToObject($parametersXML.find('simpleVariableName')), simpleVariableName);
        assert.deepEqual(level.xmlParameterValueToObject($parametersXML.find('dictionaryVariableName')), dictionaryVariableName);
        assert.deepEqual(level.xmlParameterValueToObject($parametersXML.find('listVariableName')), listVariableName);
        assert.deepEqual(level.xmlParameterValueToObject($parametersXML.find('listOfDictionaries')), listOfDictionaries);

        // Seting all parameters with XML.
        level.setParametersXML($parametersXML.children(''));
        testParameters(assert, level, 'from XML');

        // Getting single parameter in XML.
        assert.equal(level.parameterToXML('simpleVariableName', simpleVariableName), simpleVariableNameXML);
        assert.equal(level.parameterToXML('dictionaryVariableName', dictionaryVariableName), dictionaryVariableNameXML);
        assert.equal(level.parameterToXML('listVariableName', listVariableName), listVariableNameXML);
        assert.equal(level.parameterToXML('listOfDictionaries', listOfDictionaries), listOfDictionariesXML);

        // Getting all parameters in XML.
        assert.equal(level.getParametersXML(), parametersXMLString, 'Parameters to XML');

        // Getting all parameters in JSON String.
        const indentation = 3;
        const parametersStringJSON = JSON.stringify(parametersObject, null, indentation);

        assert.equal(level.getParametersString(), parametersStringJSON, 'Parameters to string');

        // Guessing parameter types.
        assert.equal(level.guessParameterType('Test'), 'text');
        assert.equal(level.guessParameterType(1), 'text');
        assert.equal(level.guessParameterType({ 'a': 1, "b": [ 1, 2, 3 ]}), 'dict'); // eslint-disable-line
        assert.equal(level.guessParameterType([ 1, 2, { 'a': 1, "b": 'text' } ]), 'list'); // eslint-disable-line
    });

    QUnit.test('Level: Testing methods', assert => {

        // Adding files.
        assert.equal(level.files.length, 0);
        level.addFile('file-name.cpp');
        assert.equal(level.files.length, 1, 'Added a file');
        assert.equal(level.files[0].filename, 'file-name.cpp');
        assert.ok(level.files[0].isMain);

        level.addFile('file-2.cpp');
        assert.equal(level.files.length, 2, 'Added another file'); // eslint-disable-line no-magic-numbers
        assert.equal(level.files[1].filename, 'file-2.cpp');
        assert.notOk(level.files[1].isMain);
        assert.ok(level.files[0].isMain);

        // Move files. First file is always main file.
        level.moveFile(1, 0);
        assert.equal(level.files.length, 2); // eslint-disable-line no-magic-numbers
        assert.equal(level.files[0].filename, 'file-2.cpp');
        assert.ok(level.files[0].isMain, 'Moved files. File at index 0 is main');
        assert.equal(level.files[1].filename, 'file-name.cpp');
        assert.notOk(level.files[1].isMain, 'File at index 1 is no longer main');

        // Removing files.
        level.removeFile(0);
        assert.equal(level.files.length, 1);
        assert.equal(level.files[0].filename, 'file-name.cpp');
        assert.ok(level.files[0].isMain, 'Removed file. File at index 0 is main');
    });

    level.files[0].content = '<content>';
    level.input = '<input>';
    level.explanation = '<explanation>';

    const fileXML = level.files[0].toXML();
    const explanationXML = '    <explanation unescape-html=\'true\'>&lt;explanation&gt;</explanation>';
    const templateXML = '    <template unescape-html=\'true\'>&lt;content&gt;</template>';
    const inputXML = '    <input unescape-html=\'true\'>&lt;input&gt;</input>';

    const levelJSON = {
        explanation: '<explanation>',
        input: '<input>',
        template: '<content>',
        parameters: parametersObject,
    };

    QUnit.test('Level: exporting to XML and JSON', assert => {
        const singleFileXML = `<level type='dict'>\n${explanationXML}\n${templateXML}\n${parametersXMLString}\n${inputXML}\n</level>`;

        assert.equal(level.toXML(), singleFileXML, 'Exporting to XML level with single file');
        assert.deepEqual(level.toJSON(), levelJSON, 'Exporting to JSON level with single file');

        level.addFile('file-2.cpp');
        level.files[1].content = 'file2';

        levelJSON.template = [ level.files[0].toJSON(), level.files[1].toJSON() ];
        const file2XML = level.files[1].toXML();

        const multipleLevelXML = `<level type='dict'>\n${explanationXML}
    <template type='list'>\n${fileXML}\n${file2XML}\n    </template>\n${parametersXMLString}\n${inputXML}\n</level>`;

        assert.equal(level.toXML(), multipleLevelXML, 'Exporting to XML level with multiple files');
        assert.deepEqual(level.toJSON(), levelJSON, 'Exporting to JSON level with multiple files');
    });
});
