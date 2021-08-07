function IdentifierValidator() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.eventManager = eventManager;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';

        var html = this[this.name]['template']({
            id: this.id
        });

        $('#' + this.id).html(css + html);

        var self = this;
        $('#identifier-validator-validate' + this.id).click(function() {
            self.identifierNameCheck();
        });
        $('#identifier-validator-identifier' + this.id).keypress(function(e) {
            self.identifierNameKeyPress(e);
        });

        // Since lang is legacy we want to deprecate it until all instances no longer exist
        this.language = (options) ? options['lang'] : 'cpp';
        if (options['lang']) {
            console.log('[identifierVaidator][tool]: lang is a deprecated option, please use language.');
        }

        this.language = (options['language']) ? (options['language']) : this.language;
    };

    this.identifierNameCheck = function() {
        var $userInput = $('#identifier-validator-identifier' + this.id);
        var $feedback = $('#identifier-validator-feedback' + this.id);
        var prefixRestriction, notAllowedAlphabet, restrictedWords, postfixRestriction;
        let identifierRestrictionMessage = 'An identifier must start with a letter (a-z or A-Z) or underscore (\'_\'), and can contain letters, underscores, and/or digits (0-9).';

        switch(this.language) {
            case 'c':
                prefixRestriction = /^[0-9]/ig;
                notAllowedAlphabet = /[^0-9a-z_]/ig;
                restrictedWords = [
                    'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do', 'double',
                    'else', 'enum', 'extern', 'float', 'for', 'goto', 'if', 'inline', 'int', 'long',
                    'register', 'restrict', 'return', 'short', 'signed', 'sizeof', 'static', 'struct',
                    'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while', '_Alignas',
                    '_Alignof', '_Atomic', '_Bool', '_Complex', '_Generic', '_Imaginary', '_Noreturn',
                    '_Static_assert', '_Thread_local'
                ];
                break;

            case 'java':
                prefixRestriction = /^[0-9]/ig;
                notAllowedAlphabet = /[^0-9a-z_$]/ig;
                identifierRestrictionMessage = 'An identifier must start with a letter (a-z or A-Z) or characters (\'$\' or \'_\'), and can contain digits (0-9).';
                restrictedWords = [
                    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
                    'const', 'continue', 'default', 'double', 'do', 'else', 'enum', 'extends', 'false',
                    'final', 'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
                    'int', 'interface', 'long', 'native', 'new', 'null', 'package', 'private', 'protected',
                    'public', 'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
                    'this', 'throw', 'throws', 'transient', 'true', 'try', 'void', 'volatile', 'while',
                ];
                break;

            case 'matlab':
                prefixRestriction = /^[0-9_]/;
                notAllowedAlphabet = /[^0-9a-zA-Z_]/;
                identifierRestrictionMessage = 'An identifier must start with a letter (a-z or A-Z), and can contain digits (0-9) and underscores (\'_\').';
                restrictedWords = [
                    'break', 'case', 'catch', 'classdef', 'continue', 'else', 'elseif', 'end', 'for', 'function',
                    'global', 'if', 'otherwise', 'parfor', 'persistent', 'return', 'spmd', 'switch', 'try', 'while'
                ];
                break;

            case 'python27':
                prefixRestriction = /^[0-9]/ig;
                notAllowedAlphabet = /[^0-9a-z_]/ig;
                restrictedWords = [
                    'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
                    'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
                    'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with',
                    'yield', 'False', 'True', 'None'
                ];
                break;

            case 'python3':
                prefixRestriction = /^[0-9]/ig;
                notAllowedAlphabet = /[^0-9a-z_]/ig;
                restrictedWords = [
                    'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
                    'except', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
                    'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield', 'False',
                    'True', 'nonlocal', 'None'
                ];
                break;


            case 'hdl':
                console.log('[idenfitierValidator][tool]: \'hdl\' is a deprecated language type, please update this to verilog.');
            case 'verilog':
                prefixRestriction = /^[0-9$]/ig;
                notAllowedAlphabet = /[^0-9a-zA-Z_$]/ig;
                identifierRestrictionMessage = 'An identifier must start with a letter (a-z or A-Z) or underscores (\'_\'), and can contain characters (0-9, \'$\').';
                restrictedWords = [
                    'always', 'and', 'assign', 'automatic', 'begin', 'buf', 'bufif0', 'bufif1', 'case',
                    'casex', 'casez', 'cell', 'cmos', 'config', 'deassign', 'default', 'defparam',
                    'design', 'disable', 'edge', 'else', 'end', 'endcase', 'endconfig', 'endfunction',
                    'endgenerate', 'endmodule', 'endprimitive', 'endspecify', 'endtable', 'endtask',
                    'event', 'for', 'force', 'forever', 'fork', 'function', 'generate', 'genvar',
                    'highz0', 'highz1', 'if', 'ifnone', 'incdir', 'include', 'initial', 'instance',
                    'inout', 'input', 'integer', 'join', 'large', 'liblist', 'library', 'localparam',
                    'macromodule', 'medium', 'module', 'nand', 'negedge', 'nmos', 'nor', 'not',
                    'noshowcancelled', 'notif0', 'notif1', 'or', 'output', 'parameter', 'pmos',
                    'posedge', 'primitive', 'pull0', 'pull1', 'pulldown', 'pullup', 'pulsestyle_onevent',
                    'pulsestyle_ondetect', 'rcmos', 'real', 'realtime', 'reg', 'release', 'repeat',
                    'rnmos', 'rpmos', 'rtran', 'rtranif0', 'rtranif1', 'scalared', 'signed',
                    'showcancelled', 'small', 'specify', 'specparam', 'strong0', 'strong1', 'supply0',
                    'supply1', 'table', 'task', 'time', 'tran', 'tranif0', 'tranif1', 'tri', 'tri0',
                    'tri1', 'triand', 'trior', 'trireg', 'unsigned', 'use', 'vectored', 'wait', 'wand',
                    'weak0', 'weak1', 'while', 'wire', 'wor', 'xnor', 'xor'
                ];
                break;

            case 'vhdl':
                prefixRestriction = /^[0-9_$]/;
                notAllowedAlphabet = /[^0-9a-zA-Z_]|__/;
                postfixRestriction = /_$/;

                identifierRestrictionMessage = 'An identifier must start with a letter (a-z or A-Z), and can contain letters (a-z or A-Z), digits (0-9), or underscores (_). '
                                             + 'Each underscore must be followed by a letter or digit.';
                restrictedWords = [
                    'abs', 'access', 'after', 'alias', 'all', 'and', 'architecture', 'array', 'assert',
                    'assume', 'assume_guarantee', 'attribute', 'begin', 'block', 'body', 'buffer',
                    'bus', 'case', 'component', 'configuration', 'constant', 'context', 'cover',
                    'default', 'disconnect', 'downto', 'else', 'elsif', 'end', 'entity', 'exit',
                    'fairness', 'file', 'for', 'force', 'function', 'generate', 'generic', 'group',
                    'guarded', 'if', 'impure', 'in', 'inertial', 'inout', 'is', 'label', 'library',
                    'linkage', 'literal', 'loop', 'map', 'mod', 'nand', 'new', 'next', 'nor', 'not',
                    'null', 'of', 'on', 'open', 'or', 'others', 'out', 'package', 'parameter', 'port',
                    'postponed', 'procedure', 'process', 'property', 'protected', 'pure', 'range', 'record',
                    'register', 'reject', 'release', 'rem', 'report', 'restrict', 'restrict_guarantee',
                    'return', 'rol', 'ror', 'select', 'sequence', 'severity', 'shared', 'signal', 'sla',
                    'sll', 'sra', 'srl', 'strong', 'subtype', 'then', 'to', 'transport', 'type', 'unaffected',
                    'units', 'until', 'use', 'variable', 'vmode', 'vprop', 'vunit', 'wait', 'when', 'while',
                    'with', 'xnor', 'xor'
                ];
                break;

            case 'cpp':
            default:
                prefixRestriction = /^[0-9]/ig;
                notAllowedAlphabet = /[^0-9a-z_]/ig;
                restrictedWords = require('utilities').cppReservedWords;
                break;
        }

        this.identifierNameChecker(prefixRestriction, notAllowedAlphabet, postfixRestriction, restrictedWords, identifierRestrictionMessage, $userInput, $feedback);

        if (!this.beenSubmitted) {
            var event = {
                part: 0,
                complete: true,
                answer: 'valid identifiers tool',
                metadata: {
                    event: 'identifier validation tool clicked'
                }
            };

            this.eventManager.postEvent(event);
        }

        this.beenSubmitted = true;
    };

    /*
        Checks if the identifier is valid by checking the starting character and allowed alphabet
        @method identifierNameChecker
        @param {RegEx} prefixRestriction Regular expression for the first character.
        @param {RegEx} notAllowedAlphabet Regular expression of not allowed characters.
        @param {RegEx} postfixRestriction Regular expression for the last character.
        @param {Array} restrictedWords List of not-allowed words as identifiers.
        @param {String} identifierRestrictionMessage Message explaining the rules of the language.
        @param {String} $userInput Reference to DOM object of user input.
        @param {Object} $feedback Reference to DOM object of feedback area.
        @return {void}
    */
    this.identifierNameChecker = function(prefixRestriction, notAllowedAlphabet, postfixRestriction, restrictedWords, identifierRestrictionMessage, $userInput, $feedback) {
        var userValue = $userInput.val();

        // Blank identifier name.
        if (!userValue) {
            $feedback.html('Identifiers cannot be blank.');
            return;
        }

        // Check if user's input is a restricted word.
        var restrictedWordPosition = restrictedWords.indexOf(userValue);
        if (restrictedWordPosition !== -1) {
            $feedback.html('<span class=\'invalid-identifier\'>' + restrictedWords[restrictedWordPosition] + '</span> is a reserved word.');
            return;
        }

        // First character is invalid.
        if (prefixRestriction.test(userValue)) {
            $feedback.html('<span class=\'invalid-identifier\'><span class=\'highlighted-violation\'>'
                        + userValue.substr(0, 1) + '</span>' + userValue.substr(1)
                        + '</span> is an invalid identifier. '
                        + identifierRestrictionMessage);
            return;
        }

        // Highlight all character violations
        var alphabetViolations = userValue.match(notAllowedAlphabet);
        if (alphabetViolations) {
            var highlightedOffenders = '';
            var currOffender = '';
            var didOffend = false;
            // Iterate through all violations and highlight each.
            for (var i = 0; i < userValue.length; i++) {
                didOffend = false;
                for (var j = 0; j < alphabetViolations.toString().length; j++) {
                    currOffender = alphabetViolations.toString().substr(j, 1);
                    if (currOffender == userValue[i]) {
                        didOffend = true;
                        break;
                    }
                }

                var nextCharacter = userValue[i];
                if (didOffend) {
                    var characterOffender = (userValue[i] === ' ') ? '&nbsp;' : userValue[i];
                    nextCharacter = '<span class=\'highlighted-violation\'>' + characterOffender + '</span>';
                }
                highlightedOffenders += nextCharacter;
            }
            // Informs user of violations
            $feedback.html('<span class=\'invalid-identifier\'>' + highlightedOffenders
                        + '</span> is invalid. ' + identifierRestrictionMessage);
            return;
        }

        // Check whether last character is valid.
        if (postfixRestriction && postfixRestriction.test(userValue)) {
            var userValueStart = userValue.substr(0, userValue.length - 1);
            var userValueEnd = userValue.substr(userValue.length - 1);
            $feedback.html('<span class=\'invalid-identifier\'>' + userValueStart + '<span class=\'highlighted-violation\'>'
                        + userValueEnd + '</span></span> is an invalid identifier. '
                        + identifierRestrictionMessage);
            return;
        }

        // Inform user this is a valid identifier
        $feedback.html('<span class=\'valid-identifier\'>' + userValue + '</span> is a valid identifier. ');
    };

    this.identifierNameKeyPress = function(e) {
        if(e.keyCode == 13) {
            this.identifierNameCheck();
        }
    };

    <%= grunt.file.read(hbs_output) %>
}

var identifierValidatorExport = {
    create: function() {
        return new IdentifierValidator();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
module.exports = identifierValidatorExport;
