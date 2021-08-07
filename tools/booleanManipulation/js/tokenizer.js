/*
    Simple tokenizer class that uses regular expressions that start at the beginning of the input
    string to provide a general tokenizer where the tokens can be defined from regular expressions
*/
function Tokenizer() {
    this.tokenInfos = [];
    this.tokens = [];
}

/*
    Adds a new token for the Tokenizer to recognize, |re| is the regular expression string that recognizes that token, |id| is a unique number for identifying the token
    ex. tokenizer.add('[0-9]+',NUMBER), will make the tokenizer recognize strings of digits
*/
Tokenizer.prototype.add = function(re, id) {
    this.tokenInfos.push({
        re: new RegExp('^(' + re + ')'),
        id: id
    });
};

/*
    Generates a list of tokens from the string |str|, defined by the tokenInfos that have been previously added.
    These tokens can be found in a list called tokens.
*/
Tokenizer.prototype.tokenize = function(str) {
    var stringToTokenize = str.trim();
    this.tokens = [];
    var previousMatch = null;
    // While string is not empty
    while (stringToTokenize) {
        var matched = false;
        for (var i = 0; i < this.tokenInfos.length; i++) {
            var match = stringToTokenize.match(this.tokenInfos[i].re);
            if (match) {
                matched = true;
                stringToTokenize = (stringToTokenize.replace(match[1], '')).trim();
                // Add all of the implicit ands while tokenizing
                if (previousMatch && (previousMatch.id === TERMINALS.LITERAL)) {
                    if ((this.tokenInfos[i].id === TERMINALS.LITERAL) || (this.tokenInfos[i].id === TERMINALS.LEFT_PAREN)) {
                        this.tokens.push({
                            sequence: SYMBOLS.AND,
                            id: TERMINALS.AND
                        });
                    }
                }
                if (previousMatch && (previousMatch.id === TERMINALS.RIGHT_PAREN)) {
                    if (this.tokenInfos[i].id === TERMINALS.LEFT_PAREN) {
                        this.tokens.push({
                            sequence: SYMBOLS.AND,
                            id: TERMINALS.AND
                        });
                    }
                }
                this.tokens.push({
                    sequence: match[1],
                    id: this.tokenInfos[i].id
                });
                previousMatch = this.tokenInfos[i];
            }
        }
        if (!matched && (i === this.tokenInfos.length)) {
            this.tokens.push({
                sequence: stringToTokenize[0],
                id: TERMINALS.UNKNOWN
            });
            stringToTokenize = stringToTokenize.substr(1);
            previousMatch = undefined;
        }
    }
};