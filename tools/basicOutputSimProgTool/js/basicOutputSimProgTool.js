/* global Ember, getCppText, getCText, getJavaText, getPython2Text, getPython3Text */

function BasicOutputSimProgTool() {

    /**
        The current question's explanation.
        @property questionExplanation
        @type {String}
        @default null
    */
    this.questionExplanation = null;

    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name].basicOutputSimProgTool({ id: this.id });
        const explanationTemplate = this[this.name].explanation;

        this.supportedLanguages = [ 'cpp', 'c', 'java', 'python2', 'python3' ];
        this.language = this.supportedLanguages[0];
        if (options && options.language && (this.supportedLanguages.indexOf(options.language) !== -1)) {
            this.language = options.language;
        }
        this.skipNewlineLevel = options && options.skipNewlineLevel;

        const numLevelsEasyVersion = 2;

        this.numLevelsNormalVersion = this.skipNewlineLevel ? 4 : 5; // eslint-disable-line no-magic-numbers
        this.easyVersion = options && options.easyVersion;
        this.numberToWin = this.easyVersion ? numLevelsEasyVersion : this.numLevelsNormalVersion;

        switch (this.language) {
            case 'cpp':
                this.getTextResult = getCppText;
                break;
            case 'c':
                this.getTextResult = getCText;
                break;
            case 'java':
                this.getTextResult = getJavaText;
                break;
            case 'python2':
                this.getTextResult = getPython2Text;
                break;
            case 'python3':
                this.getTextResult = getPython3Text;
                break;
        }

        /*
            |userAnswer| contains:
                * |expectedOutput| is a string. The expected answer's output.
                * |error| is a string describing the error, if one exists.
                * |usesNumericalLiteral| is a boolean. True if user's answer uses a numerical literal. Ex: 63.
        */
        this.userAnswer = {
            expectedOutput: '',
            error: '',
            usesNumericalLiteral: false,
        };

        this.utilities = require('utilities');
        this.progressionTool = require('progressionTool').create();

        this.progressionTool.init(this.id, parentResource, {
            html,
            css,
            numToWin: this.numberToWin,
            useMultipleParts: true,
            start: () => {
                this.$input.attr('disabled', false);
                this.generateQuestion(0);
            },
            reset: () => {
                this.$input.attr('disabled', true);
                this.$input.val('');
                this.generateQuestion(0);
            },
            next: currentQuestion => {
                this.$input.attr('disabled', false);
                this.generateQuestion(currentQuestion);
            },
            isCorrect: currentQuestion => {
                this.$input.attr('disabled', true);

                // Evaluate and get output text from user input.
                const testResult = this.getTextResult(
                    currentQuestion,
                    this.utilities.replaceSmartQuotes(this.$input.val()),
                    this.randVarName,
                    this.randNumber,
                    this.numLevelsNormalVersion
                );
                const userAnswer = testResult.text;
                const error = testResult.error;
                const usesNumericalLiteral = testResult.usesNumericalLiteral;
                const expectedOutput = this.userAnswer.expectedOutput;

                return new Ember.RSVP.Promise(resolve => {
                    const resolveObject = {
                        expectedOutput,
                        explanationMessage: '',
                        isCorrect: false,
                        userAnswer,
                    };

                    if ((userAnswer === expectedOutput) && !error) {

                        // Last two levels of normal version need print using variable.
                        const needsPrintUsingVariable = [ this.numLevelsNormalVersion - 1, this.numLevelsNormalVersion - 2 ]; // eslint-disable-line no-magic-numbers

                        if (needsPrintUsingVariable.includes(currentQuestion) && usesNumericalLiteral) {
                            resolveObject.explanationMessage = `Must print using the variable ${this.randVarName}, instead of the literal ${this.randNumber}.`; // eslint-disable-line max-len
                        }
                        else {
                            resolveObject.isCorrect = true;
                            resolveObject.explanationMessage = 'Correct.';
                        }
                        resolve(resolveObject);
                    }
                    else if (error) {
                        if (error === 'syntax') {
                            resolveObject.explanationMessage = 'Syntax error. Note: This activity supports a subset of the language.';
                        }
                        else if (error === 'specifier') {
                            resolveObject.explanationMessage = 'This tool supports %d and %i.';
                        }
                        resolve(resolveObject);
                    }
                    else {
                        parentResource.buildStringDifferenceObject(expectedOutput, userAnswer).then(stringDifferenceObject => {
                            resolveObject.explanationMessage = explanationTemplate({
                                expectedOutput: stringDifferenceObject.expectedAnswerHTML,
                                explanation: this.questionExplanation,
                                userOutput: stringDifferenceObject.userAnswerHTML,
                            });
                            resolve(resolveObject);
                        });
                    }

                });
            },
        });

        var $thisTool = $('#' + this.id);
        this.$codeBeforeInput = $thisTool.find('.code-before-input');
        this.$codeAfterInput = $thisTool.find('.code-after-input');
        this.$input = $thisTool.find('input');
        this.$exampleOutput = $thisTool.find('#example-output-' + this.id);
        this.$instructions = $thisTool.find('#instructions-' + this.id);

        // Initialize |$input| and set event listeners on |$input|
        this.$input.val('');
        this.$input.attr('disabled', true);
        this.$input.keypress(event => {
            if (event.keyCode === this.utilities.ENTER_KEY) {
                this.progressionTool.check();
                return false;
            }
            return true;
        });

        this.initializeInputCode();
        this.generateQuestion(0);
    };

    this.initializeInputCode = function() {
        var beforeInput = '';
        var afterInput = '';

        switch (this.language) {
            case 'cpp':
                beforeInput = 'cout <<';
                afterInput = ';';
                break;
            case 'c':
                beforeInput = 'printf(';
                afterInput = ');';
                break;
            case 'java':
                beforeInput = 'System.out.print(';
                afterInput = ');';
                break;
            case 'python2':
                beforeInput = 'print';
                break;
            case 'python3':
                beforeInput = 'print(';
                afterInput = ')';
                break;
        }

        this.$codeBeforeInput.text(beforeInput);
        this.$codeAfterInput.text(afterInput);
    };

    /*
        Print to screen the output example: |exampleOutput|.
        |exampleOutput| is required and a string.
    */
    this.exampleOutputWithSpaces = function(exampleOutput) {
        var exampleOutputObject = exampleOutput.split('').map(function(character) {
            return {
                value:   character,
                isSpace: (character === ' ')
            };
        });

        var outputHTML = this[this.name]['outputWithSpaces']({
            exampleOutputObject: exampleOutputObject
        });

        return outputHTML;
    };

    // |potentialOutputs| is a three-dimensional array of strings, used for the first and second questions
    this.potentialOutputs = [
        [ 'a b c', 'd e f', 'i j k', 'p q r', 'u v w', 'x y z' ],
        [ ' a b c ', ' a b c', ' abc ', ' abc', ' d e f ', ' d e f', ' def ', ' def', ' i j k ', ' i j k', ' ijk ', ' ijk',
          ' p q r ', ' p q r', ' pqr ', ' pqr', ' u v w ', ' u v w', ' uvw ', ' uvw', ' x y z ', ' x y z', ' xyz ', ' xyz' ],
    ];

    /*
        |potentialPersonNames| is an array of arrays of strings,
        with a random string selected from each array to construct a string for the third question
    */
    this.potentialPersonNames = [
        [ 'Hello', 'Howdy', 'Bravo', 'Great' ],
        [ 'Jacob', 'Mason', 'Scott', 'Emily', 'Grace', 'Sofia', 'Daniel' ],
    ];

    // |potentialVariables| is an array of strings. The string is the object name that replaces the word "object" in |potentialSentences|
    this.potentialVariables = [ 'apple', 'book', 'chair', 'cat', 'dog' ];

    // |potentialSentences| is an array of two arrays of strings, used for the fourth and fifth questions
    this.potentialSentences = [
        [ 'object count is 2', 'Number of objects is 2', 'Quantity of objects is 2' ],
        [ 'I have 2 objects.', 'There are 2 objects.', 'We share 2 objects.' ],
    ];

    // Variable used for specifying variable name
    this.randVarName = 'numApples';

    /**
        Generate a question for step |currentQuestion|.
        @method generateQuestion
        @param {Integer} currentQuestion The level of the current question.
        @return {void}
    */
    this.generateQuestion = function(currentQuestion) {
        let instructionText = `Complete the statement to produce the following output.${this.utilities.getNewline()}`;
        let exampleOutput = '';
        const newlineQuestion = 2;

        // If there's a newline level, avoid it by generating a simpler question for the newline level.
        if (currentQuestion <= 1 || (!this.skipNewlineLevel && (currentQuestion === newlineQuestion))) {
            const indexForStringArray = (currentQuestion === 0) ? 0 : 1;

            this.userAnswer.expectedOutput = this.utilities.pickElementFromArray(this.potentialOutputs[indexForStringArray]);
            exampleOutput = this.exampleOutputWithSpaces(this.userAnswer.expectedOutput);

            instructionText += 'Note: Each space is underlined for clarity; you should output a space, not an underline.';
            this.questionExplanation = 'Every character (including spaces) must match exactly. See below for differences.';
        }
        else {

            /*
                Build sentence from different words in |potentialVariables| and random integers.
                Pick variable name from randObject.
            */
            const randNum = this.utilities.pickNumberInRange(1, 99); // eslint-disable-line no-magic-numbers
            const randObject = this.utilities.pickElementFromArray(this.potentialVariables);

            // The first question using variables uses index 0 to generate an easier question.
            const easierVariableQuestion = this.skipNewlineLevel ? 2 : 3; // eslint-disable-line no-magic-numbers
            const isEasierVariableQuestion = currentQuestion === easierVariableQuestion;
            const indexForSentence = isEasierVariableQuestion ? 0 : 1;

            const randSentence = this.utilities.pickElementFromArray(this.potentialSentences[indexForSentence]);

            exampleOutput = this.utilities.initialCapitalize(randSentence.replace('2', randNum).replace('object', randObject));

            this.userAnswer.expectedOutput = exampleOutput;
            this.randNumber = randNum;
            this.randVarName = this.isPython() ? 'user_num' : 'userNum';

            const commonMistake = exampleOutput.replace(this.randNumber, this.randVarName);
            const quotesToUse = this.isPython() ? '\'' : '"';

            instructionText += `Output the value of the variable ${this.randVarName}, not the literal ${this.randNumber}. Hint: Typing ${quotesToUse}${exampleOutput}${quotesToUse} is a common mistake, as is ${quotesToUse}${commonMistake}${quotesToUse}. See above section for how to output a variable's value.`; // eslint-disable-line max-len
            this.questionExplanation = this.makeVariableQuestionExplanation(isEasierVariableQuestion);
        }

        this.$exampleOutput.html(exampleOutput);
        this.$instructions.html(instructionText);

        this.$input.val('');
        this.$input.focus();
    };

    /**
        Make an explanation for a variable question based on the language and difficulty of the question.
        @method makeVariableQuestionExplanation
        @param {Boolean} isEasierVariableQuestion Whether the explanation should be for the easier variable question.
        @return {String} The explanation based on the language.
    */
    this.makeVariableQuestionExplanation = isEasierVariableQuestion => { // eslint-disable-line complexity
        let example = null;

        if (isEasierVariableQuestion) {
            switch (this.language) {
                case 'cpp':
                    example = 'cout << "Wage is: " << userNum;';
                    break;
                case 'c':
                    example = 'printf("Wage is: %d", userNum);';
                    break;
                case 'java':
                    example = 'System.out.println("Wage is: " + userNum);';
                    break;
                case 'python2':
                    example = 'print \'Wage:\', user_num';
                    break;
                case 'python3':
                    example = 'print(\'Wage:\', user_num)';
                    break;
                default:
                    break;
            }
        }
        else {
            switch (this.language) {
                case 'cpp':
                    example = 'cout << "You are " << userNum << " years.";';
                    break;
                case 'c':
                    example = 'printf("You are %d years.", userNum);';
                    break;
                case 'java':
                    example = 'System.out.print("You\'re " + userNum + " years.");';
                    break;
                case 'python2':
                    example = 'print \'You are\', user_num, \'years old.\'';
                    break;
                case 'python3':
                    example = 'print(\'You are\', user_num, \'years old.\')';
                    break;
                default:
                    break;
            }
        }

        return `Hint: Here's a similar example: ${example}`;
    };

    /**
        Return whether the language is Python.
        @method isPython
        @return {Boolean} Whether the language is Python.
    */
    this.isPython = () => (this.language === 'python2') || (this.language === 'python3');

    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

const basicOutputSimProgToolExport = {
    create: function() {
        return new BasicOutputSimProgTool();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};

module.exports = basicOutputSimProgToolExport;
