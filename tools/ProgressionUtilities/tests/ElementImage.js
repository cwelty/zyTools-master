'use strict';

/* global ElementImage, elementPropertiesAndTypes, testProperties, PropertyAndType */

$(document).ready(() => {
    const object = new ElementImage({
        type: 'image',
        id: '0',
        name: 'Object 1: Image',
        imageID: '0B74PAULDIwwsLXpCQm1US3RDRmM',
        isInEditMode: false,
        isSelected: false,
        style: {
            height: '435px',
            left: '1px',
            top: '65px',
            width: '560px',
            'z-index': '0',
        },
    });

    const objectPropertiesAndTypes = elementPropertiesAndTypes.concat([
        new PropertyAndType('imageID', 'string'),
        new PropertyAndType('keepHeightRatio', 'boolean'),
        new PropertyAndType('keepWidthRatio', 'boolean'),
        new PropertyAndType('controlHeightWidthPerQuestion', 'boolean'),
    ]);

    testProperties(object, objectPropertiesAndTypes, 'ElementImage');

    /**
        Asserts that the |keepHeightRatio| and |keepWidthRatio| are correctly set.
        @function testRatios
        @param {Object} assert The assertion object.
        @param {Boolean} height Whether |keepHeightRatio| is expected to be true.
        @param {Boolean} width Whether |keepWidthRatio| is expected to be true.
        @return {void}
    */
    function testRatios(assert, { height, width }) {
        assert.equal(object.keepHeightRatio, height);
        assert.equal(object.keepWidthRatio, width);
    }

    QUnit.test('ElementImage: Constructor', assert => {
        assert.notOk(object.controlHeightWidthPerQuestion);
        testRatios(assert, { height: false, width: false });
    });

    QUnit.test('ElementImage: Test updating properties', assert => {
        object._setProperty('style', { width: 'auto' }); // eslint-disable-line no-underscore-dangle
        testRatios(assert, { height: false, width: true });
        object._setProperty('style', { height: 'auto' }); // eslint-disable-line no-underscore-dangle
        testRatios(assert, { height: true, width: true });
        object._setProperty('style', { width: '100px' }); // eslint-disable-line no-underscore-dangle
        testRatios(assert, { height: true, width: false });
        object._setProperty('style', { height: '100px' }); // eslint-disable-line no-underscore-dangle
        testRatios(assert, { height: false, width: false });
    });
});
