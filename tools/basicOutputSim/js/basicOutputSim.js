function BasicOutputSim() {
    this.init = function(id, eventManager, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['basicOutputSim']({ id: this.id });
        $('#' + this.id).html(css + html);

        this.lang = 'cpp'; // default
        if (options && options['lang'] &&
           (options['lang'] == 'cpp' || options['lang'] == 'c' ||
            options['lang'] == 'java' || options['lang'] == 'python2' ||
            options['lang'] == 'python3')) {
            this.lang = options['lang'];
        }

        this.setCode();

        this.$input = $('#' + this.id + '-basicOutputSim-input');
        this.$output = $('#' + this.id + '-basicOutputSim-output');
        this.$errorMessage = $('#' + this.id + ' .error-message');

        // The user can enter "countryPopulation" (or "country_population" in Python) as a variable that will output as |this.countryPopulation|
        this.countryPopulation = 1344130000;

        // The user can enter "countryName" (or "country_name" in Python) as variable that will output as |this.countryName|
        this.countryName = 'China';

        var self = this;
        this.$input.keyup(function() {
            if (self.lang === 'cpp') {
                self.stringOutputSim_FxnCpp();
            } else if (self.lang === 'c') {
                self.stringOutputSim_FxnC();
            } else if (self.lang === 'java') {
                self.stringOutputSim_FxnJava();
            } else if (self.lang === 'python2') {
                self.stringOutputSim_FxnPython2();
            } else if (self.lang === 'python3') {
                self.stringOutputSim_FxnPython3();
            }

            if (!self.beenSubmitted) {
                var event = {
                    part: 0,
                    complete: true,
                    answer: 'output sim tool',
                    metadata: {
                        event: 'output sim tool used'
                    }
                };

                eventManager.postEvent(event);
            }

            self.beenSubmitted = true;
        });
    };

    /*
        Clear the output and print the error message.
        |customErrorMessage| is optional and a string.
    */
    this.printErrorMessage = function(customErrorMessage) {
        // Use the |customErrorMessage| if provided. Otherwise, use the |defaultErrorMessage|.
        var defaultErrorMessage = 'Keep typing; we\'re waiting for a valid output statement.';
        var errorMessage = customErrorMessage || defaultErrorMessage;

        this.$output.hide();
        this.$errorMessage.show().text(errorMessage);
    };

    /*
        Clear the error message and print the console output.
        |consoleOutput| is required and HTML.
    */
    this.printConsoleOutput = function(consoleOutput) {
        this.$output.show().html(consoleOutput);
        this.$errorMessage.hide();
    };

    /**
        Return whether the textual code uses single quotes for a string.
        @method usesSingleQuotesForString
        @param {String} textToProcess The textual code.
        @return {Boolean}
    */
    this.usesSingleQuotesForString = function(textToProcess) {
        const code = textToProcess.trim();
        const startsWithSingleQuote = code[0] === "'";
        const acceptableUseOfSingleQuote = /^'\\?.'$/.test(code);

        return startsWithSingleQuote && !acceptableUseOfSingleQuote;
    }

    this.stringOutputSim_FxnCpp = function() {
        var textToProcess = this.$input.val();

        // only do these replaces in non-string literals, which are the even numbered indexes in the array
        var textToProcessSplit = textToProcess.split('"');
        for(var i = 0; i < textToProcessSplit.length; i = i + 2) {
            // replace endl with \n
            textToProcessSplit[i] = textToProcessSplit[i].replace(/endl/g, '"\\n"');

            // replace number with SDataTypesSummary_IStrSim2Var_1_var1
            textToProcessSplit[i] = textToProcessSplit[i].replace(/countryPopulation/g, '"' + this.countryPopulation + '"');

            // replace name with SDataTypesSummary_IStrSim2Var_1_var2
            textToProcessSplit[i] = textToProcessSplit[i].replace(/countryName/g, '"' + this.countryName + '"');
        }
        textToProcess = textToProcessSplit.join('"');

        // replace " << " with nothing, eval doesn't used this syntax
        textToProcess = textToProcess.replace(/\"\s*<<\s*\"/g, '');

        this.printErrorMessage();

        // Throw error if code starts with single-quote
        if (!this.usesSingleQuotesForString(textToProcess) && textToProcess) {
            try {
                let outputText = eval(textToProcess); // check for string correctness at least w/in JavaScript

                // convert all ' ' to &nbsp; otherwise space will be eaten by HTML
                outputText = outputText.replace(/ /g, '&nbsp;');

                // replace < and > with &lt; and &gt;, respectively
                outputText = outputText.replace(/</g, '&lt;');
                outputText = outputText.replace(/>/g, '&gt;');

                // convert \n to <br/>, must not have spaces in br or space->&nbsp; will break the br
                outputText = outputText.replace(/\\n/g, '<br/>');

                this.printConsoleOutput(outputText + '<br />');
            }
            catch(err) {
                this.printErrorMessage();
            }
        }
    };

    this.stringOutputSim_FxnC = function() {
        var textToProcess = this.$input.val();

        // Expect to have two quotes w/o anything in front
        // ^\s*".*"(\s*,\w+\s*)+$
        if (textToProcess.indexOf('"') === -1) { // AE 080313: user input does not contain a double quotes
            this.printErrorMessage('Keep typing: too few arguments in printf.');
            return;
        }

        var tS = textToProcess.split('"');
        var beg = tS.shift(1); // ^\s*
        var end = tS.pop(); // (\s*,\w+\s*)+$
        var mid = tS.join('"'); // ".*"
        var tMid = mid;
        mid = mid.replace(/%s/g, this.countryName);
        mid = mid.replace(/%(d|i)/g, String(this.countryPopulation));
        textToProcess = beg + '"' + mid + '"';

        // order of variables must match order of %s and %d (or %i) in string, else syntax error
        var tEnd = '';
        if (end) {
            tEnd = end.replace(/ /g, '');
        }
        var prefixOfPrintf = tEnd.split(',');

        var arrayOfVars = [];
        if (prefixOfPrintf[0]) {
            arrayOfVars.push('error');
        }
        for(i = 1; i < prefixOfPrintf.length; i++) {
            if(prefixOfPrintf[i] == 'countryPopulation') {
                arrayOfVars.push('d');
            } else if(prefixOfPrintf[i] == 'countryName') {
                arrayOfVars.push('s');
            } else {
                arrayOfVars.push('error');
            }
        }

        // Store indices of all %s, replace later with variable values
        var stringIndexes = [];
        var index = tMid.indexOf('%s');
        while (index !== -1) {
            stringIndexes.push([ index, 's' ]);
            tMid = tMid.replace('%s', 'to');
            index = tMid.indexOf('%s');
        }

        // Store indices of all %d and %i, replace later with variable values
        var intIndexes = [];
        index = tMid.indexOf('%d');
        while (index !== -1) {
            intIndexes.push([ index, 'd' ]);
            tMid = tMid.replace('%d', 'to');
            index = tMid.indexOf('%d');
        }
        index = tMid.indexOf('%i');
        while (index !== -1) {
            intIndexes.push([ index, 'd' ]);
            tMid = tMid.replace('%i', 'to');
            index = tMid.indexOf('%i');
        }

        var mergeIndexes = stringIndexes.concat(intIndexes);
        mergeIndexes = mergeIndexes.sort(function(a, b) { return a[0] - b[0];});

        var wasSyntaxError = false;
        for(var i = 0; i < mergeIndexes.length; i++) {
            if(mergeIndexes[i][1] != arrayOfVars[i]) {
                wasSyntaxError = true;
                break;
            }
        }

        for (var i = 0; i < arrayOfVars.length; i++) {
            if (arrayOfVars[i] == 'error') {
                wasSyntaxError = true;
                break;
            }
        }

        this.printErrorMessage();
        if(textToProcess && !wasSyntaxError) {
            try {
                var outputText = eval(textToProcess); // check for string correctness at least w/in JavaScript

                // convert each space to &nbsp; otherwise spaces will be eaten by HTML
                // replace < and > with &lt; and &gt;, respectively
                outputText = outputText.replace(/</g, '&lt;');
                outputText = outputText.replace(/>/g, '&gt;');
                outputText = outputText.replace(/ /g, '&nbsp;');
                this.printConsoleOutput(outputText + '<br />');
            } catch(err) {
                this.printErrorMessage();
            }
        } else {
            this.printErrorMessage();
        }
    };

    this.stringOutputSim_FxnJava = function() {
        var textToProcess = this.$input.val();

        // only do these replaces in non-string literals, which are the even numbered indexes in the array
        var textToProcessSplit = textToProcess.split('"');
        for(var i = 0; i < textToProcessSplit.length; i = i + 2) {
        // replace number with SDataTypesSummary_IStrSim2Var-Java_1_var1
            textToProcessSplit[i] = textToProcessSplit[i].replace(/countryPopulation/g, '"' + this.countryPopulation + '"');

        // replace name with SDataTypesSummary_IStrSim2Var-Java_1_var2
            textToProcessSplit[i] = textToProcessSplit[i].replace(/countryName/g, '"' + this.countryName + '"');
        }
        textToProcess = textToProcessSplit.join('"');

        // replace < and > with &lt; and &gt;, respectively
        textToProcess = textToProcess.replace(/</g, '&lt;');
        textToProcess = textToProcess.replace(/>/g, '&gt;');

        // Remove spaces before first quotes and after last quotes
        var checkSpacing = textToProcess.split('"');
        var syntaxError = false;
        if (checkSpacing[0] !== '') { // if something before first "
            // something can only be spaces, else ERROR
            var beforeSplit = checkSpacing[0].split(' ');
            for (var i = 0; i < beforeSplit.length; i++) {
                if (beforeSplit[i] !== '') {
                    syntaxError = true;
                    break;
                }
            }
        }

        if (checkSpacing[checkSpacing.length - 1] !== '') { // if something after last "
            var afterSplit = checkSpacing[checkSpacing.length - 1].split(' ');
            for (var i = 0; i < afterSplit.length; i++) {
                if (afterSplit[i] !== '') {
                    syntaxError = true;
                    break;
                }
            }
        }

        // remove first and last elements in array, then combine with quotes
        checkSpacing.shift();
        checkSpacing.pop();
        textToProcess = checkSpacing.join('"');
        textToProcess = '"' + textToProcess + '"';

        if (textToProcess && !syntaxError) {
            try {
                var outputText = eval(textToProcess); // check for string correctness at least w/in JavaScript

                // convert all ' ' to &nbsp; otherwise space will be eaten by HTML
                outputText = outputText.replace(/ /g, '&nbsp;');
                this.printConsoleOutput(outputText + '<br />');
            } catch(err) {
                this.printErrorMessage();
            }
        } else {
            this.printErrorMessage();
        }
    };

    this.stringOutputSim_FxnPython2 = function() {
        var textToProcess = this.$input.val();
        var syntaxError = false;

        var trim = function(str) {
            str = str.replace(/^\s+/, '');
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        };

        // Get list of comma-separated terms (could be string literals, variables, or keyword params
        var term = '';
        var terms = [];
        var open_quote = '';
        for (var i = 0; i < textToProcess.length; i += 1) {
            var c = textToProcess[i];
            if ((c === '\'') || (c === '"')) {
                if (open_quote === '') {
                    open_quote = c;
                    term += '"';
                } else {
                    if (c === open_quote) {
                        open_quote = '';
                        term += '"';
                    } else {
                        if (c == '"') {
                            term += '\\"';
                        } else {
                            term += c;
                        }
                    }
                }
            } else if ((c === ',') && (open_quote === '')) {
                terms.push(trim(term));
                term = '';
            } else {
                term += c;
            }
        }
        terms.push(trim(term)); // last term

        // Find predefined variables
        var indexIntVar = [];
        var indexStrVar = [];
        for (var i = 0; i < terms.length; i += 1) {
            if (terms[i] == 'country_population') {
                indexIntVar.push(i);
            }
            if (terms[i] == 'country_name') {
                indexStrVar.push(i);
            }
        }

        // Returns whether the parameter |n| is a number
        // |n| is a require parameters
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        // Error check that all terms are a literal or variable
        for (var i = 0; i < terms.length; i++) {
            // If term is 'country_population' or 'country_name', then continue
            if ((indexIntVar.indexOf(i) !== -1) || (indexStrVar.indexOf(i) !== -1)) {
                continue;
            }

            // Otherwise, check whether term is a literal
            if (terms[i].length > 0 && !isNumber(terms[i])) {
                if ((terms[i].length === 1) && (terms[i][0] === '"')) {
                    syntaxError = true;
                    break;
                }
                if ((terms[i][0] !== '"') || (terms[i][terms[i].length - 1] !== '"')) {
                    syntaxError = true;
                    break;
                }
            }
        }

        // Ready to build an eval string
        var evalStr = '"';

        for (var i = 0; i < terms.length; i += 1) {
            if (indexIntVar.indexOf(i) !== -1) {
                evalStr += this.countryPopulation;
            } else if (indexStrVar.indexOf(i) !== -1) {
                evalStr += this.countryName;
            } else if (isNumber(terms[i])) {
                evalStr += terms[i];
            } else if (!terms[i].indexOf('\\n"') === (terms[i].length - 3)) {
                evalStr += terms[i].slice(1, terms[i].length - 1);
            } else {
                evalStr += terms[i].slice(1, terms[i].length - 1);
            }

            if (i < terms.length - 1) {
                evalStr += ' ';
            }
        }

        evalStr += '"';

        this.printErrorMessage();

        // If there is text and not a syntax error, then try to execute |evalStr|
        if ((textToProcess !== '') && !syntaxError) {
            try {
                var outputText = eval(evalStr); // check for string correctness at least w/in JavaScript

                // convert all ' ' to &nbsp; otherwise space will be eaten by HTML
                outputText = outputText.replace(/ /g, '&nbsp;');
                // replace < and > with &lt; and &gt;, respectively

                outputText = outputText.replace(/</g, '&lt;');
                outputText = outputText.replace(/>/g, '&gt;');
                outputText = outputText.replace(/\\n/g, '<br/>');
                this.printConsoleOutput(outputText + '<br />');
            } catch(err) {
                this.printErrorMessage();
            }
        } else {
            this.printErrorMessage();
        }
    };

    this.stringOutputSim_FxnPython3 = function() {
        var textToProcess = this.$input.val();
        var syntaxError = false;

        var trim = function(str) {
            str = str.replace(/^\s+/, '');
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        };

        // Get list of comma-separated terms (could be string literals, variables, or keyword params
        var term = '';
        var terms = [];
        var open_quote = '';
        for (var i = 0; i < textToProcess.length; i += 1) {
            var c = textToProcess[i];
            if ((c === '\'') || (c === '"')) {
                if (open_quote === '') {
                    open_quote = c;
                    term += '"';
                }
                else {
                    if (c === open_quote) {
                        open_quote = '';
                        term += '"';
                    }
                    else {
                        if (c === '"') {
                            term += '\\"';
                        } else {
                            term += c;
                        }
                    }
                }
            }
            else if (c === ',' && open_quote === '') {
                terms.push(trim(term));
                term = '';
            } else {
                term += c;
            }
        }
        terms.push(trim(term)); // last term

        // Error check: Placement of parameter end or parameter sep must be last
        var indexKeywordEnd = -1;
        var indexKeywordSep = -1;
        for (var i = 0; i < terms.length; i += 1) {
            if (terms[i].indexOf('end=') === 0) {
                // Can't specify keyword param twice
                if (indexKeywordEnd >= 0) {
                    syntaxError = true;
                }
                indexKeywordEnd = i;
            }
            if (terms[i].indexOf('sep=') === 0) {
                // Can't specify keyword param twice
                if (indexKeywordSep >= 0) {
                    syntaxError = true;
                }
                indexKeywordSep = i;
            }
        }

        // end='' and sep='' both given
        if (indexKeywordEnd >= 0 && indexKeywordSep >= 0) {
            if (indexKeywordEnd > indexKeywordSep) { // end='' is after sep=''
                if (indexKeywordEnd != terms.length - 1 || indexKeywordSep != terms.length - 2) {
                    syntaxError = true;
                }
            } else { // sep='' is after end=''
                if (indexKeywordEnd != terms.length - 2 || indexKeywordSep != terms.length - 1) {
                    syntaxError = true;
                }
            }
        } else if (indexKeywordEnd >= 0) { // Just end='' given
            if (indexKeywordEnd != terms.length - 1) {
                syntaxError = true;
            }
        } else if (indexKeywordSep >= 0) { // Just sep='' given
            if (indexKeywordSep != terms.length - 1) {
                syntaxError = true;
            }
        }

        // Find predefined variables
        var indexIntVar = [];
        var indexStrVar = [];
        for (var i = 0; i < terms.length; i += 1) {
            if (terms[i] === 'country_population') {
                indexIntVar.push(i);
            }
            if (terms[i] === 'country_name') {
                indexStrVar.push(i);
            }
        }

        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }

        // Error check that all terms are a literal, variable, or keyword param
        for (var i = 0; i < terms.length; i += 1) {
            // If term is 'country_population' or 'country_name', then continue
            if ((indexIntVar.indexOf(i) !== -1) || (indexStrVar.indexOf(i) !== -1)) {
                continue;
            }

            // Otherwise, check whether term is a literal
            if (i === indexKeywordEnd) {
                // |terms[i]| should start with end= then contain a valid Python string
                if (!terms[i].match(/end=\s*[\'\"]([^\'\"]*)[\'\"]/g)) {
                    syntaxError = true;
                }
            } else if (i == indexKeywordSep) {
                // |terms[i]| should start with sep= then contain a valid Python string
                if (!terms[i].match(/sep=\s*[\'\"]([^\'\"]*)[\'\"]/g)) {
                    syntaxError = true;
                }
            } else if ((terms[i].length > 0) && !isNumber(terms[i])) {
                if ((terms[i].length === 1) && (terms[i][0] === '"')) {
                    syntaxError = true;
                }
                if ((terms[i][0] !== '"') || (terms[i][terms[i].length - 1] !== '"')) {
                    syntaxError = true;
                }
            }

        }

        // Ready to build an eval string
        var evalStr = '\"';

        // Get separator value
        var sep = ' ';
        if (indexKeywordSep >= 0) {
            var sepThenValidPythonStringRegex = /sep=\s*[\'\"]([^\'\"]*)[\'\"]/g;
            var result = sepThenValidPythonStringRegex.exec(terms[indexKeywordSep]);
            if (result) {
                if (result.length > 2) {
                    syntaxError = true;
                } else {
                    sep = result[1];
                }
            }
        }

        for (let index = 0; index < terms.length; index += 1) {
            if ((index === indexKeywordEnd) || (index === indexKeywordSep)) {
                break;
            }

            if (indexIntVar.indexOf(index) >= 0) {
                evalStr += this.countryPopulation;
            }
            else if (indexStrVar.indexOf(index) >= 0) {
                evalStr += this.countryName;
            }
            else if (isNumber(terms[index])) {
                evalStr += terms[index];
            }
            else {
                evalStr += terms[index].slice(1, terms[index].length - 1);
            }

            const keywordEndOffset = indexKeywordEnd >= 0 ? 1 : 0;
            const keywordSepOffset = indexKeywordSep >= 0 ? 1 : 0;

            if (index < (terms.length - 1 - keywordEndOffset - keywordSepOffset)) {
                evalStr += sep;
            }
        }

        // The string in end=' ' go to end of output
        if (indexKeywordEnd >= 0) {
            var re = /end=\s*[\'\"]([^\'\"]*)[\'\"]/g;
            var end = re.exec(terms[indexKeywordEnd]);
            if (end) {
                if (end.length > 2) {
                    syntaxError = true;
                } else {
                    evalStr += end[1];
                }
            }
        }

        evalStr += '"';

        this.printErrorMessage();

        // If there is text and not a syntax error, then try to execute |evalStr|
        if ((textToProcess !== '') && !syntaxError) {
            try {
                var outputText = eval(evalStr); // check for string correctness at least w/in JavaScript

                // convert all ' ' to &nbsp; otherwise space will be eaten by HTML
                outputText = outputText.replace(/ /g, '&nbsp;');
                // replace < and > with &lt; and &gt;, respectively

                outputText = outputText.replace(/</g, '&lt;');
                outputText = outputText.replace(/>/g, '&gt;');
                outputText = outputText.replace(/\\n/g, '<br/>');
                this.printConsoleOutput(outputText + '<br />');
            } catch(err) {
                this.printErrorMessage();
            }
        } else {
            this.printErrorMessage();
        }

        return;
    };

    this.setCode = function() {
        var codeBeforeInput = '';
        var codeAfterInput = '';

        if (this.lang === 'cpp') {
            codeBeforeInput = '<span style="color:#603000; ">cout</span> <span style="color:#808030; ">&lt;</span><span style="color:#808030; ">&lt;</span> ';
            codeAfterInput = '<span style="color:#800080; ">;</span>';
        } else if (this.lang === 'c') {
            codeBeforeInput = '<span style="color:#603000; ">printf</span><span style="color:#808030; ">(</span>';
            codeAfterInput = '<span style="color:#808030; ">)</span><span style="color:#800080; ">;</span>';
        } else if (this.lang === 'java') {
            codeBeforeInput = '<span style="color:#bb7977; font-weight:bold; ">System</span><span style="color:#808030; ">.</span>out<span style="color:#808030; ">.</span>print<span style="color:#808030; ">(</span>';
            codeAfterInput = '<span style="color:#808030; ">)</span><span style="color:#800080; autocorrect=&quot;off&quot; autocapitalize=&quot;off&quot;">;</span>';
        } else if (this.lang === 'python2') {
            codeBeforeInput = '<span>print</span> ';
            codeAfterInput = ' ';
        } else if (this.lang === 'python3') {
            codeBeforeInput = '<span>print(</span>';
            codeAfterInput = '<span>)</span>';
        }

        $('#codeBeforeInput' + this.id).html(codeBeforeInput);
        $('#codeAfterInput' + this.id).html(codeAfterInput);
    };

    <%= grunt.file.read(hbs_output) %>
}

var basicOutputSimExport = {
    create: function() {
        return new BasicOutputSim();
    }
};
module.exports = basicOutputSimExport;
