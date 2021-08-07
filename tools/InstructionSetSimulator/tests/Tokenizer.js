'use strict';

/* exported tokenizerTests */

/**
    Test the Tokenizer object.
    @method tokenizerTests
    @return {void}
*/
function tokenizerTests() {
    var tokenizer = new Tokenizer(MIPSTokenTypes);

    var propertyAndTypes = [
        new PropertyAndType('_tokenTypes', 'array'),
        new PropertyAndType('_tokenizeLine', 'function'),
        new PropertyAndType('tokenize', 'function')
    ];
    testProperties(tokenizer, propertyAndTypes, 'Tokenizer');

    QUnit.test('Tokenizer tokenizing', function(assert) {
        var mipsCode = 'add $s1, $s2, $s3';
        var tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines.length, 1, 'Tokenizer has 1 line with code.');
        assert.equal(tokensOfLines[0].tokens.length, 9, 'Tokenizer processes add instruction.');

        var caughtError = false;
        mipsCode = '()';
        try {
            tokens = tokenizer.tokenize(mipsCode);
        }
        catch (error) {
            caughtError = true;
        }
        assert.ok(caughtError, 'Tokenizer catches unrecognized characters.');

        mipsCode = 'loop:';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines[0].tokens.length, 1, 'Tokenizer processes label.');

        mipsCode = 'loop: add $s1, $s2, $s3';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines[0].tokens.length, 11, 'Tokenizer processes label and add instruction.');

        mipsCode = 'lw $s1, 1000($s3)';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines[0].tokens.length, 6, 'Tokenizer processes lw instruction.');

        mipsCode = 'addi $s1, $s2, 3000';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines[0].tokens.length, 9, 'Tokenizer processes addi instruction.');

        mipsCode = 'add $s2, $zero, $s1';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines[0].tokens.length, 9, 'Tokenizer processes add instruction with $zero.');

        mipsCode = 'addi $s1, $s2, 3000\n'
                 + 'lw $s1, 1000($s3)\n'
                 + 'loop: add $s1, $s2, $s3';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines.length, 3, 'Tokenizer processes three lines.');

        mipsCode = 'addi $s1, $s2, 3000\n'
                 + '\n'
                 + 'lw $s1, 1000($s3)\n'
                 + '\n'
                 + 'loop: add $s1, $s2, $s3';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines.length, 5, 'Tokenizer processes five lines with 2 blank lines.');

        // Test carriage return instead of newline character.
        mipsCode = 'add $t0, $t0, $t0\radd $t0, $t0, $t0';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines.length, 2, 'Tokenizer splits 2 lines via carriage return.'); // eslint-disable-line no-magic-numbers

        // Test carriage return + newline character.
        mipsCode = 'add $t0, $t0, $t0\r\nadd $t0, $t0, $t0';
        tokensOfLines = tokenizer.tokenize(mipsCode);
        assert.equal(tokensOfLines.length, 2, 'Tokenizer splits 2 lines via carriage return + newline character.'); // eslint-disable-line no-magic-numbers
    });
}
