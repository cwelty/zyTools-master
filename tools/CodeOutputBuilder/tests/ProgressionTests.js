/* eslint-disable no-magic-numbers */
/* global Progression */
'use strict';

$(document).ready(() => {
    const progression = new Progression('guid', 'caption', 'cpp');

    QUnit.test('Progression: property tests', assert => {
        assert.equal(progression.guid, 'guid');
        assert.equal(progression.caption, 'caption');
        assert.equal(progression.language, 'cpp');
        assert.notOk(progression.highlightNew, false);
        assert.equal(progression.levels.length, 0);
    });

    QUnit.test('Progression: adding, moving, removing and saving levels', assert => {
        progression.addLevel();
        assert.equal(progression.levels.length, 1, 'Added first level');
        progression.addLevel();
        assert.equal(progression.levels.length, 2, 'Added a second level');
        progression.addLevel();

        progression.levels[0].explanation = 'Added first';
        progression.levels[1].explanation = 'Added second';
        progression.levels[2].explanation = 'Added third';

        progression.moveLevel(0, 1);
        assert.equal(progression.levels[0].explanation, 'Added second', 'Moving levels test #1');
        assert.equal(progression.levels[1].explanation, 'Added first', 'Moving levels test #2');
        assert.equal(progression.levels[2].explanation, 'Added third', 'Moving levels test #3');

        progression.moveLevel(2, 1);
        assert.equal(progression.levels[0].explanation, 'Added second', 'Moving levels test #4');
        assert.equal(progression.levels[1].explanation, 'Added third', 'Moving levels test #5');
        assert.equal(progression.levels[2].explanation, 'Added first', 'Moving levels test #6');

        progression.removeLevel(0);
        assert.equal(progression.levels[0].explanation, 'Added third', 'Removing levels test #1');
        assert.equal(progression.levels[1].explanation, 'Added first', 'Removing levels test #2');
        progression.removeLevel(1);
        assert.equal(progression.levels[0].explanation, 'Added third', 'Removing levels test #3');

        const levelData = {
            explanation: 'explanation',
            input: 'input',
            parameters: '{ "simpleVariableName": "Simple variable" }',
            filesData: [ { filename: 'main.cpp', isMain: true, program: 'program' } ],
        };
        const firstLevel = progression.levels[0];

        progression.saveLevel(0, levelData);

        assert.equal(firstLevel.explanation, levelData.explanation, 'Save level: explanation');
        assert.equal(firstLevel.input, levelData.input, 'Save level: input');
        assert.equal(firstLevel.files.length, 1, 'Save level: file added');
        assert.equal(firstLevel.files[0].filename, levelData.filesData[0].filename, 'Save level: name of file');
        assert.ok(firstLevel.files[0].isMain, 'Save level: file is main');
        assert.equal(firstLevel.files[0].content, levelData.filesData[0].program, 'Save level: program of file');
        assert.equal(Object.keys(firstLevel.parameters).length, 1, 'Save level: 1 parameter exists');
        assert.equal(firstLevel.parameters.simpleVariableName, 'Simple variable', 'Save level: parameter is correct');

        const parametersXMLString = '<parameters type=\'dict\'><var>variable</var></parameters>';
        const $parametersXML = $($.parseXML(parametersXMLString)).find('parameters');

        levelData.parameters = $parametersXML.children();

        progression.saveLevel(0, levelData);
        assert.equal(Object.keys(firstLevel.parameters).length, 1, 'Save level (parameter XML): 1 parameter exists');
        assert.equal(firstLevel.parameters.var, 'variable', 'Save level (parameter XML): parameter is correct');
    });

    QUnit.test('Progression: adding, moving, and removing files', assert => {
        const firstLevel = progression.levels[0];

        progression.addFileToLevel(0, 'file2.cpp');
        assert.equal(firstLevel.files.length, 2, 'Added one file. Total 2');
        progression.addFileToLevel(0, 'file3.cpp');
        assert.equal(firstLevel.files.length, 3, 'Added one file. Total 3');

        // In level index 0: Move file from index 1 to index 2. main file2 file3 -> file2 file3 main.
        progression.moveFileFromLevel(0, 0, 2);
        assert.equal(firstLevel.files[0].filename, 'file2.cpp', 'Moving files test #1');
        assert.equal(firstLevel.files[1].filename, 'file3.cpp', 'Moving files test #2');
        assert.equal(firstLevel.files[2].filename, 'main.cpp', 'Moving files test #3');

        // In level index 0: Move file from index 1 to index 0. file2 file3 main -> file3 file2 main.
        progression.moveFileFromLevel(0, 1, 0);
        assert.equal(firstLevel.files[0].filename, 'file3.cpp', 'Moving files test #4');
        assert.equal(firstLevel.files[1].filename, 'file2.cpp', 'Moving files test #5');
        assert.equal(firstLevel.files[2].filename, 'main.cpp', 'Moving files test #6');

        // In level index 0: Remove file index 1
        progression.removeFileFromLevel(0, 1);
        assert.equal(firstLevel.files.length, 2, 'Removed file. Remaining 2');
        assert.equal(firstLevel.files[0].filename, 'file3.cpp');
        assert.equal(firstLevel.files[1].filename, 'main.cpp');
        progression.removeFileFromLevel(0, 0);
        assert.equal(firstLevel.files.length, 1, 'Removed file. Remaining 1');
        assert.equal(firstLevel.files[0].filename, 'main.cpp');
    });

    const progressionXML = `<zyTool name='codeOutput' caption='caption' id='guid' parts='1' challenge='true'>
<zyOptions>
<language>cpp</language>
<levels type='list'>
<level type='dict'>
    <explanation>explanation</explanation>
    <template>program</template>
    <parameters type='dict'>
        <var>variable</var>
    </parameters>
    <input>input</input>
</level>
</levels>
</zyOptions>
</zyTool>`;
    const progressionJSON = {
        globalCode: '',
        language: 'cpp',
        highlightNew: false,
        levels: [ {
            explanation: 'explanation',
            template: 'program',
            parameters: {
                var: 'variable',
            },
            input: 'input',
        } ],
    };

    QUnit.test('Progression: exporting to XML and JSON', assert => {
        assert.equal(progression.toXML(), progressionXML, 'toXML()');
        assert.deepEqual(progression.toJSON(), progressionJSON, 'toJSON()');
    });
});
