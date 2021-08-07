'use strict';

// 15 second timeout when making server requests.
var TIMEOUT_LENGTH = 15000;

function HomeworkSystem() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.utilities = require('utilities');
        this.restrictedEditor = require('restrictedEditor').create();

        this.checkmarkImageURL = this.utilities.getCheckmarkImageURL(parentResource);

        this.problemId = options['problem_id'];

        this.language = options.language;

        // Render the HTML and CSS.
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name].homeworkSystem({ id: this.id,
                                                    checkmarkImageURL: this.checkmarkImageURL });
        $('#' + this.id).html(css + html);

        // Initialize the ace editor.
        this.editor = ace.edit('editor-container' + this.id);

        // Set our base properties for all ace instances
        this.utilities.aceBaseSettings(this.editor, this.language);

        var self = this;
        var url = 'homework/' + this.problemId;
        this.utilities.zyDEServer('GET', url, {}, data => {
            var normalizedOptionsAndInstructions = self.normalizeOptions(options,
                                                                         data.instructions);
            options = normalizedOptionsAndInstructions[0];
            var instructions = normalizedOptionsAndInstructions[1];

            // Extract options.
            self.inputEnabled = options.input_enabled;
            self.input = options.input;
            self.prefix = options.prefix;
            self.suffix = options.suffix;

            // Verify that a language and problem id were provided.
            if (!self.problemId || !self.language) {
                var errorManager = require('zyWebErrorManager');
                errorManager.postError('homeworkSystem option missing');
                return;
            }

            // Generate the sample program.
            var codePlaceholder = 'Your solution goes here';
            var languageCommentMap = {
                cpp: '/* ' + codePlaceholder + '  */',
                c: '/* ' + codePlaceholder + '  */',
                java: '/* ' + codePlaceholder + '  */',
                python: '\'\'\'' + codePlaceholder + '\'\'\'',
                python3: '\'\'\'' + codePlaceholder + '\'\'\''
            };

            // Add a bit of whitespace around the editable region if possible.
            var updatedCode = self.addEditableWhitespace(self.prefix,
                                                         self.suffix,
                                                         languageCommentMap[self.language]);
            self.suffix = updatedCode.suffix;
            self.prefix = updatedCode.prefix;
            self.placeholder = updatedCode.placeholder;

            var contents = self.prefix + self.placeholder + self.suffix;

            // Update the instructions and initial program.
            $('#' + self.id + ' .instructions-div').html(instructions);
            self.editor.setValue(contents, 1);

            self.restrictedEditor.init(self.editor, function(message) {
                self.displayNonEditableAreaErrorMessage(message);
            });

            // Sometimes editor renders with only 3 lines. In attempt to fix, force browser to re-render the ace editor and activity.
            self.editor.resize(true);
            $('#' + self.id).hide().show();

            self.restrictedEditor.initializeNonEditableAreas(self.prefix, self.suffix, self.placeholder);

            $('#run-button' + self.id).click(function() {
                var runButton = $(this);

                if (runButton.hasClass('disabled')) {
                    return;
                }

                self.clearResults();

                runButton.text('Running tests...');

                var sampleProgram = self.editor.getValue();

                // If Java, remove all but the main public class.
                if (self.language == 'java') {
                    sampleProgram = self.removePublicJavaClasses(sampleProgram);
                }

                var input = self.input;
                self.startSpinner();
                self.errorOccurred = false;
                self.runProblem(sampleProgram, input, function(results) {
                    if (!results.success) {
                        var $errorOutput = $('#results-area' + self.id + ' > .error-output');
                        $errorOutput.show();
                        $errorOutput.html(results.errorMessage);

                        if (results.status === 'An error occurred') {
                            $errorOutput.addClass('code-compiled');
                        }
                        else {
                            $errorOutput.removeClass('code-compiled');
                        }

                        self.recordEvent(self.restrictedEditor.getWriteEnabledCode(), 'Compilation failed', 0);

                        self.stopSpinner();
                        runButton.removeClass('disabled');
                        runButton.text('Run');

                        self.errorOccurred = true;
                    }
                    else {
                        if (results.errorMessage) {
                            $('#results-area' + self.id + ' > .error-output').show();
                            $('#results-area' + self.id + ' > .error-output').html(results.errorMessage);

                            self.recordEvent(self.restrictedEditor.getWriteEnabledCode(), 'Runtime error', 0);

                            self.stopSpinner();
                            runButton.removeClass('disabled');
                            runButton.text('Run');

                            self.errorOccurred = true;
                        }
                        else {
                            self.stopSpinner();

                            // Mark the last test vector for use in HBS.
                            var testVectors = results.testVectors.filter(function(testVector) {
                                return testVector;
                            });
                            if (testVectors.length > 0) {
                                testVectors[testVectors.length - 1].last = true;
                            }

                            // Get the number of passed test vectors.
                            var numPassedTestVectors = testVectors.filter(function(testVector) {
                                return testVector.success;
                            }).length;

                            // Check if all test vectors passed.
                            var allTestVectorsPassed = testVectors.length > 0 && testVectors.length === numPassedTestVectors;

                            // Record events.
                            if (allTestVectorsPassed && !self.errorOccurred) {
                                self.recordEvent(self.restrictedEditor.getWriteEnabledCode(), 'All test vectors passed', 2);
                            }
                            else {
                                var anyTestVectorsPassed = testVectors.some(function(testVector) {
                                    return testVector.success;
                                });
                                if (anyTestVectorsPassed) {
                                    var eventMessage = numPassedTestVectors + '/' + testVectors.length + ' test vectors passed';
                                    self.recordEvent(self.restrictedEditor.getWriteEnabledCode(), eventMessage, 1);
                                }
                                else {
                                    self.recordEvent(self.restrictedEditor.getWriteEnabledCode(), 'All test vectors failed', 0);
                                }
                            }

                            // Number the test vectors.
                            testVectors.forEach(function(testVector, index) {
                                testVector.index = index;
                            });

                            var html = self[self.name].testVectors({
                                id: self.id,
                                testVectors: testVectors
                            });
                            $('#results-area' + self.id + ' > .results-list').html(html);

                            // Create a first class TestVector object for each test vector.
                            var testVectorObjects = testVectors.map(function(testVector, index) {
                                var newTestVector = new TestVector();

                                newTestVector.init({
                                    containerId: `test-vector-container${self.id}-index${index}`,
                                    parentResource: self.parentResource,
                                    template: self[self.name].testVector,
                                    checkmarkImageURL: self.checkmarkImageURL,
                                    description: testVector.hint,
                                    expected: testVector.expected,
                                    actual: testVector.actual,
                                    pass: testVector.success,
                                    aborted: testVector.testsAborted,
                                    vectorType: testVector.vectorType,
                                    utilities: self.utilities,
                                });

                                return newTestVector;
                            });

                            // Fade in each test vector.
                            var fadeDelay = 1000; // In milliseconds.
                            var currentDelay = 0;
                            var previousTestVector = null;
                            testVectorObjects.forEach(function(testVector, index) {
                                var _testVector = testVector;
                                setTimeout(function() {
                                    // Show the previous test vector if there is one.
                                    if (previousTestVector) {
                                        previousTestVector.setCollapsed(false);
                                        previousTestVector.setSpinning(false);
                                    }

                                    previousTestVector = _testVector;

                                    _testVector.setHidden(false);
                                }, currentDelay);

                                if (!testVector.aborted) {
                                    currentDelay += fadeDelay;
                                }
                            });

                            // After all test vectors have appeared, re-enable the button
                            // and display the status.
                            setTimeout(function() {
                                runButton.removeClass('disabled');
                                runButton.text('Run');

                                if (allTestVectorsPassed && !self.errorOccurred) {
                                    $('#all-tests-passed-label' + self.id).removeClass('hidden');
                                }

                                if (previousTestVector) {
                                    previousTestVector.setCollapsed(false);
                                    previousTestVector.setSpinning(false);
                                }
                            }, currentDelay);
                        }
                    }
                },
                warning => {
                    // Warning message callback.
                    $('#results-area' + self.id + ' .warning-text').html(warning);
                    $('#results-area' + self.id + ' > .warning').show();
                });
            });
        });
    };

    /*
      Accepts a dictionary of options as passed into the tool, and the instructions for this
      homework problem. If the options are in the new style, they are returned as-is along
      with the instructions.

      Otherwise, they are converted to the new style.

      Results are returned as a list of [new options, new instructions].
    */
    this.normalizeOptions = function(options, instructions) {
        var sampleProgramSentinel = 'Sample program:';

        // If |options| is already in the new-style, just return them.
        if (options.prefix) {
            // Remove the sample program if necessary.
            instructions = instructions.substring(0, instructions.indexOf(sampleProgramSentinel));
            return [ options, instructions ];
        }

        // Remove the unnecessary |content| key.
        delete options.content;

        // If a sample program was included in the instructions then extract it.
        if (instructions.indexOf(sampleProgramSentinel) !== -1) {
            // The sample program will be in the following form:
            // Sample program:<br><br><pre>...sample program here...</pre>
            var beginSentinel = '<pre>';
            var endSentinel = '</pre>';
            var sampleProgram = instructions.substring(instructions.indexOf(beginSentinel, instructions.indexOf(sampleProgramSentinel)) + beginSentinel.length);
            sampleProgram = sampleProgram.substring(0, sampleProgram.indexOf(endSentinel));
            sampleProgram = sampleProgram.trim();

            // Unescape all escaped HTML characters.
            sampleProgram = $('<div>').html(sampleProgram).text();

            // Extract the prefix and suffix.
            var studentCodeSentinel = '<STUDENT CODE>';
            var prefix = sampleProgram.substring(0, sampleProgram.indexOf(studentCodeSentinel));
            var suffix = sampleProgram.substring(sampleProgram.indexOf(studentCodeSentinel) + studentCodeSentinel.length);

            options.prefix = prefix;
            options.suffix = suffix;

            // Remove the sample program from the instructions.
            instructions = instructions.substring(0, instructions.indexOf(sampleProgramSentinel));
        } else {
            options.prefix = '';
            options.suffix = '';
        }

        // Check for the now obsolete "For all homework problems ... matches the expected
        // output." text in the instructions, and remove it if it exists.
        var obsoleteInstructionsBeginSentinel = '<b >For all homework problems:</b>';
        var obsoleteInstructionsEndSentinel = 'matches the expected output.';
        if (instructions.indexOf(obsoleteInstructionsBeginSentinel) !== -1 &&
            instructions.indexOf(obsoleteInstructionsEndSentinel) !== -1) {
            instructions = instructions.substring(0, instructions.indexOf(obsoleteInstructionsBeginSentinel));
        }

        return [ options, instructions ];
    };

    /*
      Accepts the prefix, suffix, and code placeholder of this problem, and returns updated
      versions of each in a dictionary.

      If possible, this function removes whitespace from the end of the prefix and beginning of
      the suffix and adds it to the placeholder.
    */
    this.addEditableWhitespace = function(prefix, suffix, placeholder) {
        // Strip trailing spaces from each line.
        prefix = prefix.replace(/ +\n/g, '\n');
        suffix = suffix.replace(/ +\n/g, '\n');
        placeholder = placeholder.replace(/ +\n/g, '\n');

        // Move indentation characters from prefix to placeholder
        var indentationCharacters = [ ' ', '\t' ];
        var inlineComment = false;
        for (var i = prefix.length - 1; i >= 0; --i) {
            var character = prefix[i];
            // Track if a code character is encountered before a newline
            if (/\S/.test(character)) {
                inlineComment = true;
            }

            if (indentationCharacters.indexOf(character) !== -1) {
                // Move character from prefix to placeholder
                placeholder = character + placeholder;
                prefix = prefix.substr(0, prefix.length - 1);
            } else {
                break;
            }
        }

        // Add new lines to placeholder if not immediately surrounded by code.
        // e.g. if (/* Your code goes here */)
        if (!inlineComment) {
            placeholder = '\n' + placeholder + '\n';

            // Remove trailing newline(s) from prefix; only one should exist.
            while (prefix.length > 1 && prefix[prefix.length - 1] === '\n' && prefix[prefix.length - 2] === '\n') {
                prefix = prefix.substring(0, prefix.length - 1);
            }

            // Remove leading newline(s) from prefix; only one should exist.
            while (suffix.length > 1 && suffix[0] === '\n' && suffix[1] === '\n') {
                suffix = suffix.substring(1, suffix.length);
            }
        }

        return {
            prefix: prefix,
            suffix: suffix,
            placeholder: placeholder
        };
    };

    /*
      Accepts some Java code that may potentially contain multiple public classes. If so, this
      function makes all but one of those public classes non-public. The class that remains
      public is the one containing the main function.

      This function also moves all import statements to the top of the file.

      Returns the updated code.
    */
    this.removePublicJavaClasses = function(code) {
        // Extract a list of all public class declarations from the code.
        var publicClassRegex = /public\s*class\s*([a-zA-Z0-9_]*)/g;
        var publicClasses = [];
        var match = publicClassRegex.exec(code);
        while (match) {
            var declaration = match[0];

            // Find the index of this match.
            var matchIndex = code.indexOf(declaration);

            publicClasses.push({
                declaration: declaration,
                index: matchIndex
            });

            match = publicClassRegex.exec(code);
        }

        // Find the main function.
        var mainFunctionRegex = /public\s*static\s*void\s*main\s*\(\s*String\s*\[\]\s*args\s*\)/g;
        var mainFunctionIndex = code.search(mainFunctionRegex);
        if (mainFunctionRegex === -1) {
            // If there's no main function this code won't compile anyway, so just return it unmodified.
            return code;
        }

        // Identify which public class contains the main function.
        var mainFunctionContainerClass = null;
        publicClasses.forEach(function(publicClass) {
            // If this class occurs after the main function, it can't contain the main function.
            if (publicClass.index < mainFunctionIndex) {
                mainFunctionContainerClass = publicClass;
            }
        });

        // If there's no container class this code won't compile anyway, so just return it unmodified.
        if (!mainFunctionContainerClass) {
            return code;
        }

        // Make all other public classes non-public.
        publicClasses.filter(function(publicClass) {
            return publicClass !== mainFunctionContainerClass;
        }).forEach(function(nonPublicClass) {
            var declaration = nonPublicClass.declaration;

            // Remove the "public" keyword from the declaration.
            var nonPublicDeclaration = declaration.replace('public', '');

            code = code.replace(declaration, nonPublicDeclaration);
        });

        // Identify all import statements.
        var importRegex = /import\s*[a-zA-Z0-9_\.]*;/g;
        var imports = [];
        var match = importRegex.exec(code);
        while (match) {
            imports.push(match[0]);

            match = importRegex.exec(code);
        }

        // Move all imports to the top of the file.
        imports.forEach(function(importStatement) {
            code = code.replace(importStatement, '');
        });
        code = imports.join('\n') + code;


        return code;
    };

    this.startSpinner = function() {
        var opts = {
            lines: 13, // The number of lines to draw
            length: 5, // The length of each line
            width: 3, // The line thickness
            radius: 7, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            direction: 1, // 1: clockwise, -1: counterclockwise
            color: '#CC6600', // #rgb or #rrggbb or array of colors
            speed: 1, // Rounds per second
            trail: 60, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '50%', // Top position relative to parent
            left: '50%' // Left position relative to parent
        };
        var target = $('#spinner' + this.id)[0];
        this.spinner = new Spinner(opts).spin(target);
    };

    this.stopSpinner = function() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    };

    // Clears the results area to prepare for another run.
    this.clearResults = function() {
        $('#run-button' + this.id).addClass('disabled');
        $('#results-area' + this.id + ' > .error-output').hide();
        $('#results-area' + this.id + ' > .error-output').html('');
        $('#results-area' + this.id + ' > .results-list').html('');
        $('#results-area' + this.id + ' > .warning').hide();
        this.stopSpinner();
        $('#all-tests-passed-label' + this.id).addClass('hidden');
    };

    // Runs the homework problem and returns the results.
    this.runProblem = function(sampleProgram, input, resultsCallback, warningCallback) {

        // The zyDE will return user and expected output surrounded by these text
        // based sentinels.
        var spanBeginSentinel = 'SPANBEGIN';
        var spanEndSentinel = 'SPANEND';

        var program = this.restrictedEditor.getWriteEnabledCode();

        // Check that the user provided some code.
        if (program.trim() === '' || program.trim() === this.placeholder.trim()) {
            warningCallback('No solution code provided');
        }

        var failureResponse = {
            success: false,
            status: 'Cannot reach server.',
            errorMessage: 'We can\'t seem to reach our server. Please check your Internet connection then try again.',
        };

        var self = this;

        function compileAndRunTests() {

            // Compile the code.
            let url = 'compile_code';
            let params = {
                code: program,
                language: self.language,
                input: input,
                problem_id: self.problemId, // eslint-disable-line
            };

            self.utilities.zyDEServer('POST', url, params,
                data => {

                    // If code compilation failed, return with an error.
                    if (data.success === undefined) { // eslint-disable-line
                        var errorMessage = 'The code you wrote, integrated with our tests, resulted in compilation failure.';

                        if (data.result !== undefined) { // eslint-disable-line
                            errorMessage = self.utilities.escapeHTML(data.result.toString());
                            errorMessage = errorMessage.replace(new RegExp(spanBeginSentinel, 'g'), '<div class="hk-output">');
                            errorMessage = errorMessage.replace(new RegExp(spanEndSentinel, 'g'), '</div>');
                        }

                        resultsCallback({
                            success: false,
                            status: 'Compilation failed',
                            errorMessage: errorMessage,
                        });
                    }
                    else {

                        // Run the code.
                        url = 'run_code';
                        params = {
                            session_id: data.session_id, // eslint-disable-line
                            language: self.language,
                            filename: data.filename,
                            homework_problem: true, // eslint-disable-line
                            problem_id: self.problemId, // eslint-disable-line
                            input: input,
                        };
                        self.utilities.zyDEServer('GET', url, params,
                            data => {

                                // Extract the results of the test vectors.
                                var testVectors = [];

                                if (data.test_vectors !== undefined) { // eslint-disable-line
                                    testVectors = data.test_vectors.map(function(testVector) {
                                        var hintSentinel = 'Expected';

                                        if (testVector.hint.indexOf('Expected') === -1) { // eslint-disable-line no-magic-numbers
                                            hintSentinel = 'Your';
                                        }

                                        var parsedTestVector = {
                                            success: testVector.pass,
                                            testsAborted: testVector.suppress_fail,
                                            hint: testVector.hint.substr(0, testVector.hint.indexOf(hintSentinel)),
                                        };

                                        // Check if this test vector is an "output" or "value" type.
                                        if (testVector.hint.indexOf(hintSentinel + ' value') !== -1) { // eslint-disable-line no-magic-numbers
                                            parsedTestVector.vectorType = 'value';
                                        }
                                        else {
                                            parsedTestVector.vectorType = 'output';
                                        }

                                        // Regex that captures text between the SPANBEGIN and
                                        // SPANEND sentinels.
                                        var outputRegex = /SPANBEGIN(.*|\s)*SPANEND/;
                                        var originalOutput = testVector.hint;
                                        var output = originalOutput.substr(
                                            0, // eslint-disable-line no-magic-numbers
                                            originalOutput.indexOf(spanEndSentinel) + spanEndSentinel.length
                                        );
                                        var match = outputRegex.exec(output);

                                        if (testVector.pass) {
                                            if (match) {
                                                parsedTestVector.expected = match[0].substr(spanBeginSentinel.length, match[0].length -
                                                    (spanBeginSentinel.length + spanEndSentinel.length));
                                                parsedTestVector.actual = parsedTestVector.expected;
                                            }
                                        }
                                        else {

                                            // Check for infinite loop.
                                            if (originalOutput === 'Program end never reached') {
                                                var terminatedAfterThrowingError = (data.result.indexOf('terminate called after throwing') !== -1); // eslint-disable-line no-magic-numbers
                                                var exceptionInThread = (data.result.indexOf('Exception in thread') !== -1); // eslint-disable-line no-magic-numbers
                                                var result = {
                                                    success: false,
                                                    status: 'An error occurred',
                                                    errorMessage: '',
                                                    testVectors: [],
                                                };

                                                // Check for runtime errors in C++ or Java.
                                                if (terminatedAfterThrowingError || exceptionInThread) {
                                                    result.errorMessage = 'Runtime error (commonly due to an invalid array/vector access, divide by 0, etc.).';
                                                }
                                                else {
                                                    result.errorMessage = 'Program end never reached (commonly due to an infinite loop, infinite recursion, or divide/mod by 0).';
                                                }

                                                result.errorMessage = self[self.name].testVectorError({
                                                    errorMessage: result.errorMessage,
                                                });

                                                resultsCallback(result);

                                                return;
                                            }

                                            if (match) {

                                                // If this test vector was suppressed then the
                                                // "expected" output won't be present.
                                                if (originalOutput.indexOf('Expected') === -1) {
                                                    parsedTestVector.expected = null;
                                                } else {
                                                    parsedTestVector.expected = match[0].substr(9, match[0].length - 8 - 8);
                                                }
                                            }

                                            output = originalOutput.substr(originalOutput.indexOf(spanEndSentinel) + spanEndSentinel.length);

                                            // Unless the output was supprssed, run the regex again to
                                            // get the next match.
                                            if (parsedTestVector.expected) {
                                                match = outputRegex.exec(output);
                                            }
                                            if (match) {
                                                parsedTestVector.actual = match[0].substr(spanBeginSentinel.length, match[0].length - (spanBeginSentinel.length + spanEndSentinel.length));
                                            }
                                        }

                                        // Output is empty if output stores: (none)
                                        parsedTestVector.actual = self.makeEmptyIfNone(parsedTestVector.actual);
                                        parsedTestVector.expected = self.makeEmptyIfNone(parsedTestVector.expected);

                                        return parsedTestVector;
                                    });
                                }

                                var errorMessage = data.error;

                                // Check for Python error output and display it.
                                var ERROR_PREFIX = 'ERROR';

                                if (data.failed && [ 'python', 'python3' ].indexOf(self.language) >= 0 && data.result.startsWith(ERROR_PREFIX)) {
                                    errorMessage = data.result.substr(ERROR_PREFIX.length);
                                }

                                resultsCallback({
                                    success: true,
                                    errorMessage: errorMessage,
                                    testVectors: testVectors,
                                });
                            },
                            () => {
                                resultsCallback(failureResponse);
                            },
                            TIMEOUT_LENGTH,
                            'json'
                        );
                    }
                },
                () => {
                    resultsCallback(failureResponse);
                }
            );
        }

        // Compile or run the "sample program" first.
        var self = this;
        var pythonCode = [ 'python', 'python3' ].indexOf(self.language) !== -1; // eslint-disable-line no-magic-numbers

        let url = 'compile_code';
        let params = {
            code: sampleProgram,
            language: self.language,
            input: input,
            files: [],
            compile_only: !pythonCode, // eslint-disable-line
        };

        this.utilities.zyDEServer('POST', url, params,
            data => {
                // If sample program compilation failed, return with an error.
                if (data.success === undefined) { // eslint-disable-line
                    resultsCallback({
                        success: false,
                        status: 'Compilation failed',
                        errorMessage: data.result.toString(),
                    });
                    return;
                }

                // If the language is Python, run the sample program for testing.
                else if ([ 'python', 'python3' ].indexOf(self.language) >= 0) { // eslint-disable-line no-magic-numbers
                    url = 'run_code';
                    params = {
                        session_id: data.session_id, // eslint-disable-line
                        language: self.language,
                        filename: data.filename,
                    };

                    self.utilities.zyDEServer('GET', url, params,
                        returnData => {
                            if (returnData.result.indexOf('File "main.py"') >= 0) { // eslint-disable-line no-magic-numbers
                                var errorMessage = returnData.result;

                                resultsCallback({
                                    success: true,
                                    errorMessage: errorMessage,
                                    testVectors: [],
                                });
                            }
                            else {
                                compileAndRunTests();
                            }
                        },
                        () => {},
                        TIMEOUT_LENGTH,
                        'json'
                    );
                }
                else {
                    compileAndRunTests();
                }
            },
            () => {
                if (self.stringContainsUnicode(sampleProgram)) {
                    resultsCallback({
                        success: false,
                        status: 'Cannot reach server.',
                        errorMessage: 'Your program should not contain unicode characters.',
                    });
                }
                else {
                    resultsCallback(failureResponse);
                }
            },
            TIMEOUT_LENGTH
        );
    };

    /*
      Determines if the specified string `s` contains any unicode characters.
    */
    this.stringContainsUnicode = function(s) {
        return s.split('').some(function(char) {
            return char.charCodeAt(0) > 255;
        });
    };

    /*
        Return an empty string if |output| is (none). Otherwise, return |output|.
        |output| is required and a string.
    */
    this.makeEmptyIfNone = function(output) {
        return ((output === '(none)') ? '' : output);
    };

    /*
      Displays error message in the lower right hand corner of the editor area,
      also flash the highlighted gutter region until a valid command is used.
    */
    this.displayNonEditableAreaErrorMessage = function(message) {
        // Animate in the error message.
        var $nonEditableAreaErrorMessageDiv = $('#non-editable-area-error-message' + this.id);
        $nonEditableAreaErrorMessageDiv.html(message);
        $nonEditableAreaErrorMessageDiv.removeClass('hidden');

        // Animate in the gutter highlight.
        var $highlightedGutterRange = $('#editor-container' + this.id + ' .gutter-highlight');
        $highlightedGutterRange.removeClass('gutter-highlight-flash');

        // Wait 50 milliseconds before adding the |hidden| and |gutter-highlight-flash| classes back
        // so that the respective animation occurs.
        setTimeout(function() {
            $nonEditableAreaErrorMessageDiv.addClass('hidden');
            $highlightedGutterRange.addClass('gutter-highlight-flash');
        }, 50);
    };

    /*
      Post an event through the event manager.

      |code| - The user entered code.
      |message| - A short description of the event.
      |points| - The number of points to record. Each point corresponds to a part. So if points
                 is 1, part 0 will be marked as completed. If points is 2, parts 0 and 1 will
                 be marked as completed.
    */
    this.recordEvent = function(code, message, points) {
        var newEvent = {
            part: 0,
            answer: code,
            metadata: {
                event: 'Homework system: ' + message
            },
            complete: false
        };

        if (points === 0) {
            newEvent.complete = false;
            newEvent.part = 0;
            this.parentResource.postEvent(newEvent);
        } else if (points === 1) {
            newEvent.complete = true;
            newEvent.part = 0;
            this.parentResource.postEvent(newEvent);
        } else if (points === 2) {
            newEvent.complete = true;
            newEvent.part = 0;
            this.parentResource.postEvent(newEvent);

            newEvent.complete = true;
            newEvent.part = 1;
            this.parentResource.postEvent(newEvent);
        }
    };

    // This is more required boilerplate.
    <%= grunt.file.read(hbs_output) %>
}

var homeworkSystemExport = {
    create: function() {
        return new HomeworkSystem();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = homeworkSystemExport;
