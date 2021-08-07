'use strict';

/* global replaceStringVariables */

$(document).ready(() => {
    QUnit.test('replaceStringVariables function', assert => {
        const progressionCode = '';
        const levelCode = '';
        const questionCode = `test = 4
test2 = range(15)
test3 = range(150)
test4 = [ range(10), range(10), range(10), range(10), range(10), range(10), range(10), range(10), range(10), range(10), range(10) ]`;
        const module = require('ProgressionUtilities').create().makePythonModule(progressionCode, levelCode, questionCode);
        const testCases = [

            // Print text without Python variable.
            { input: 'Biscuit', output: 'Biscuit' },
            { input: 'x = y + 4', output: 'x = y + 4' },
            { input: 'first line\nsecond line\nthird line', output: 'first line\nsecond line\nthird line' },

            // Python variable printed as a variable.
            { input: '${test}', output: '4' },
            { input: 'Test: ${test}', output: 'Test: 4' },
            { input: '${test}${test}${test}${test}', output: '4444' },
            { input: '${test}\n${test}\n${test}\n${test}', output: '4\n4\n4\n4' },

            // Error case: Python variable print as a list element.
            { input: '${test[0]}', output: '${test[0]}' },
            { input: 'Test: ${test[0]}', output: 'Test: ${test[0]}' },
            { input: '${test[0]}\n${test[0]}\n${test[0]}', output: '${test[0]}\n${test[0]}\n${test[0]}' },

            // Python list element printed as a list element.
            { input: '${test2[0]}', output: '0' },
            { input: '${test2[1]}', output: '1' },
            { input: '${test2[2]}', output: '2' },
            { input: '${test2[3]}', output: '3' },
            { input: '${test2[4]}', output: '4' },
            { input: '${test2[5]}', output: '5' },
            { input: '${test2[6]}', output: '6' },
            { input: '${test2[7]}', output: '7' },
            { input: '${test2[8]}', output: '8' },
            { input: '${test2[9]}', output: '9' },
            { input: '${test2[10]}', output: '10' },
            { input: '${test2[14]}', output: '14' },
            { input: '${test2[10]} ${test2[14]}', output: '10 14' },
            { input: 'Test: ${test} ${test2[10]} ${test2[14]}', output: 'Test: 4 10 14' },

            // Error case: Python list printed as a list.
            { input: '${test2}', output: '[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]' }, // eslint-disable-line max-len

            // Error case: Python list printed as 2-d list element.
            { input: '${test2[0][0]}', output: '${test2[0][0]}' },

            // Print element from Python list with 100+ elements.
            { input: '${test3[149]}', output: '149' },

            // Python 2-d list element printed as 2-d list element.
            { input: '${test4[0][0]}', output: '0' },
            { input: '${test4[0][1]}', output: '1' },
            { input: '${test4[10][9]}', output: '9' },

            // Error case: Python 2-d list printed as a 2-d list.
            { input: '${test4}', output: '[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]' }, // eslint-disable-line max-len

            // Error case: Python 2-d list printed as a list.
            { input: '${test4[0]}', output: '[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object]' }, // eslint-disable-line max-len
        ];

        testCases.forEach(testCase => {
            const resultString = replaceStringVariables(testCase.input, module);

            assert.equal(resultString, testCase.output);
        });
    });

    /**
        Creates a <p> tag with styling according to what |processExplanation| would build (used for testing that function)
        @method createPTag
        @param {String} [content=''] The content of the <p> tag.
        @param {Boolean} [inline=false] Wether to add 'display: inline'. Only the first <p> tag of each explanation is inline.
        @return {String} The <p> tag built.
    */
    function createPTag(content = '') {
        return `<p><span>${content}</span></p>`;
    }

    /**
        Creates an <img> tag with styling according to what |processExplanation| would build (used for testing that function)
        @method createImgTag
        @param {String} imageID The ID of the image to load.
        @param {String} [width=0] The width of the image tag. If it's 0, no width is set.
        @param {String} [height=0] The height of the image tag. If it's 0, no height is set.
        @return {String} The <img> tag built.
    */
    function createImgTag(imageID, width = 0, height = 0) {
        const widthStyle = width ? `width: ${width}px;` : '';
        let heightStyle = height ? `height: ${height}px;` : '';

        if (widthStyle && heightStyle) {
            heightStyle = ` ${heightStyle}`;
        }
        const styleString = width || height ? ` style="${widthStyle}${heightStyle}"` : '';

        return `<img class="explanation-image" image-id="${imageID}" src="${imageID}"${styleString}>`; // eslint-disable-line max-len
    }

    QUnit.test('processExplanation function', assert => {

        // Dummy parentResource for testing.
        const parentResource = {
            getStaticResource: function(pathToImage) {
                return `https://static-resources.zybooks.com/${pathToImage}`;
            },
            getVersionedImage: function(imageID) {
                return imageID;
            },
        };

        const progressionUtilities = require('ProgressionUtilities').create();

        let explanation = 'Expected: 6';
        let processedExplanation = progressionUtilities.processExplanation(parentResource, explanation);
        let expectedExplanation = createPTag(explanation, true);

        assert.equal(processedExplanation, expectedExplanation);

        explanation = 'Expected: 6[image](image-id)';
        processedExplanation = progressionUtilities.processExplanation(parentResource, explanation);
        expectedExplanation = createPTag('Expected: 6', true) + createImgTag('image-id');

        assert.equal(processedExplanation, expectedExplanation);

        explanation = 'Expected: 6[image](image-id)\nSo unexpected!!';
        processedExplanation = progressionUtilities.processExplanation(parentResource, explanation);
        expectedExplanation = createPTag('Expected: 6', true) + createImgTag('image-id') + createPTag('\nSo unexpected!!');

        assert.equal(processedExplanation, expectedExplanation);

        explanation = 'Expected: 6[image 15](image-id)\n\n[image 200 20](image-id)Yay![image 0 20](image-id)';
        processedExplanation = progressionUtilities.processExplanation(parentResource, explanation);
        expectedExplanation = createPTag('Expected: 6', true) + createImgTag('image-id', 15) + createPTag('\n\n') + // eslint-disable-line no-magic-numbers
                              createImgTag('image-id', 200, 20) + createPTag('Yay!') + createImgTag('image-id', 0, 20); // eslint-disable-line no-magic-numbers

        assert.equal(processedExplanation, expectedExplanation);
    });
});
