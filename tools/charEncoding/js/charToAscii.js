'use strict';

/* exported charToAscii */

/**
    This function converts a character to ascii numbers
    @method charToAscii
    @param {Object} $charInputObj jQuery reference to the input character to convert.
    @param {String} id The id of the object.
    @param {Boolean} showBitCode Determine if we show the bit code.
    @param {Boolean} useUnicode Should the input accept Unicode. If false, then accept ASCII only.
    @return {void}
*/
function charToAscii($charInputObj, id, showBitCode, useUnicode) {
    const inputChar = $charInputObj.val().charCodeAt(0);
    const maxASCIIChar = 128;
    const isUnicodeButShouldBeASCII = !useUnicode && (inputChar >= maxASCIIChar);

    if (($charInputObj.val() === '') || isUnicodeButShouldBeASCII) {
        if (isUnicodeButShouldBeASCII) {
            $charInputObj.val('');
        }

        $(`#asciiOutput${id}`).val('');
        if (showBitCode) {
            $(`#asciiBitOutput${id}`).val('');
        }
    }
    else {
        if (showBitCode) {
            let binaryValue = inputChar.toString(2); // eslint-disable-line no-magic-numbers

            // The output binary value should always have at least 7-bits
            while (binaryValue.length < 7) { // eslint-disable-line no-magic-numbers
                binaryValue = `0${binaryValue}`;
            }
            $(`#asciiBitOutput${id}`).val(binaryValue);
        }
        $(`#asciiOutput${id}`).val(inputChar);
    }

    $charInputObj.select();
}
