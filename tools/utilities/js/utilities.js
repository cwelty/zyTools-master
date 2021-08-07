'use strict';

/* global Carousel, QuestionCache, addPolyfillForArrayFill, addPolyfillForArrayFlat, addPolyfillForArrayIncludes,
    addPolyfillForStringRepeat, addPolyfillForNumberIsInteger, addPolyfillForStringIncludes, addPolyfillForMathTrunc, TestResult, Sk,
    TinkerRecorder */

// Add Polyfill support.
addPolyfillForArrayFill();
addPolyfillForArrayFlat();
addPolyfillForArrayIncludes();
addPolyfillForStringRepeat();
addPolyfillForNumberIsInteger();
addPolyfillForStringIncludes();
addPolyfillForMathTrunc();

/**
    Collection of constant values and functions used by other tools.
    @module Utilities
*/
class Utilities {
    constructor() {

        // Zyante colors
        this.zyanteGray = '#333333';
        this.zyanteExpiredGray = '#666666';
        this.zyanteLightGray = '#CCCCCC';
        this.zyanteTableGray = '#D8D8D8';
        this.zyanteFeaturedBackgroundColor = '#EFEFEF';
        this.zyanteGreen = '#738033';
        this.zyanteDarkBlue = '#5780A6';
        this.zyanteLightBlue = '#6685A8';
        this.zyanteLighterBlue = '#87ADD2';
        this.zyanteMediumRed = '#BB0404';
        this.zyanteOrange = '#C60';

        // zyAnimator colors that complement Zyante colors.
        this.zyAnimatorBlack = this.zyanteGray;
        this.zyAnimatorGray = '#AFAFAF';
        this.zyAnimatorWhite = '#FFFFFF';
        this.zyAnimatorGreen = '#1EC81E';
        this.zyAnimatorRed = '#DC0404';
        this.zyAnimatorBlue = '#5780DC';
        this.zyAnimatorLightBlue = '#B0D6FB';
        this.zyAnimatorOrange = '#E68142';
        this.zyAnimatorLightOrange = '#F9D8BC';
        this.zyAnimatorYellow = '#FFD364';
        this.zyAnimatorPurple = 'rgb(132, 36, 172)';
        this.zyAnimatorBrown = '#886441';

        // Regularly used math symbols
        this.multiplicationSymbol = '&middot;';
        this.subtractionSymbol = '&#8211;';

        // Regularly used key values
        this.TAB_KEY = 9;
        this.ENTER_KEY = 13;
        this.ARROW_LEFT = 37;
        this.ARROW_UP = 38;
        this.ARROW_RIGHT = 39;
        this.ARROW_DOWN = 40;
        this.DELETE_KEY = 46;
        this.B_KEY = 66;
        this.I_KEY = 73;
        this.U_KEY = 85;

        // Reserved words in C++.
        this.cppReservedWords = [
            'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor', 'bool', 'break', 'case', 'catch', 'char', 'char16_t',
            'char32_t', 'class', 'compl', 'const', 'constexpr', 'const_cast', 'continue', 'decltype', 'default', 'delete', 'do', 'double',
            'dynamic_cast', 'else', 'enum', 'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto', 'if', 'inline',
            'int', 'long', 'mutable', 'namespace', 'new', 'noexcept', 'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private',
            'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short', 'signed', 'sizeof', 'static', 'static_assert',
            'static_cast', 'struct', 'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try', 'typedef', 'typeid', 'typename',
            'union', 'unsigned', 'using', 'virtual', 'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq',
        ];
    }

    /**
        Replace the given string's smart quotes with the respective normal quotes.
        @method replaceSmartQuotes
        @param {String} str The string to replace.
        @return {String} The replaced string.
    */
    replaceSmartQuotes(str) {
        if (!str) {
            return '';
        }

        return str.replace(/[“”]+/g, '"').replace(/[‘’]+/g, "'"); // eslint-disable-line quotes
    }

    /**
       Performs an AJAX request on a zyDE monolith server, attempting multiple hosts
       until one succesfully resolves.
       @method zyDEServer
       @param {String} method The type of HTTP request to use, e.g., GET or POST. Must be capitalized.
       @param {String} target The endpoint URL, e.g., 'run_code'
       @param {Object} params Parameters to supply in the request.
       @param {Function} resolve A callback to run when the AJAX request succeeds.
       @param {Function} reject A callback to run when th eAJAX request fails.
       @param {Integer} [timeout = null] The amount of time before the timeout request fails.
       @param {String} [dataType = null] The type of data supplied in the AJAX request. E.g., 'json'.
       @param {Boolean} [useMarketingServer=false] Whether to use the marketing server.
       @return {RSVP.Promise}
    */
    zyDEServer(method, target, params, resolve, reject, timeout = null, dataType = null, useMarketingServer = false) {  // eslint-disable-line max-params

        // A list of zyde hosts that will be tried in order.
        const primaryServer = {
            host: 'https://zydelith.zybooks.com',
            forwardCookies: false,
        };
        const secondaryServer = {
            host: 'https://zyde.zybooks.com',
            forwardCookies: false,
        };
        const marketingServer = {
            host: 'https://marketing-zyde.zybooks.com',
            forwardCookies: false,
        };
        const options = useMarketingServer ? [ marketingServer, secondaryServer ] : [ primaryServer, secondaryServer ];

        // Returns a promise to execute the AJAX request and then call one of the provided
        // resolve or reject requests.
        return new Ember.RSVP.Promise(() => {  // eslint-disable-line no-undef

            const loadOption = () => {
                if (options.length === 0) {

                    // We don't have any more hosts left to try. Surrender.
                    reject();
                }
                else {

                    // Try the next host
                    const option = options.shift();

                    $.ajax(
                        `${option.host}/${target}`,
                        {
                            type: method,
                            data: params,
                            timeout,
                            dataType,
                            success: resolve,
                            xhrFields: {
                                withCredentials: option.forwardCookies,
                            },
                        }
                    ).fail(() => {
                        loadOption();
                    });
                }
            };

            loadOption();
        });
    }

    /**
        Add the "ifCond" Handlebars helper.
        @method addIfConditionalHandlebars
        @return {void}
    */
    addIfConditionalHandlebars() {

        /**
            Handlebars helper for conditional expressions.
            @method ifCond
            @param {String} value1 The first value in the expression.
            @param {String} operator The operator in the conditional expression.
            @param {String} value2 The second value in the expression.
            @return {String} Appropriate HTML for whether the expression evaluates to true or false.
        */
        Handlebars.registerHelper('ifCond', (value1, operator, value2, options) => {
            let expressionIsTrue = false;

            switch (operator) {
                case '===':
                    expressionIsTrue = (value1 === value2);
                    break;
                case '!==':
                    expressionIsTrue = (value1 !== value2);
                    break;
                case '||':
                    expressionIsTrue = (value1 || value2);
                    break;
                case '&&':
                    expressionIsTrue = (value1 && value2);
                    break;
                case '>':
                    expressionIsTrue = (value1 > value2);
                    break;
                case '<':
                    expressionIsTrue = (value1 < value2);
                    break;
                case '>=':
                    expressionIsTrue = (value1 >= value2);
                    break;
                case '<=':
                    expressionIsTrue = (value1 <= value2);
                    break;
                default:
                    expressionIsTrue = false;
                    break;
            }

            return (expressionIsTrue ? options.fn() : options.inverse());
        });
    }

    /**
        Return a string with all whitespace removed from |string|.
        @method removeWhitespace
        @param {String} string The string to remove the whitespace.
        @return {String} The string without whitespace.
    */
    removeWhitespace(string) {
        return string.replace(/\s/g, '');
    }

    /**
        Return whether two given arrays are exactly the same.
        @method twoArraysMatch
        @param {Array} array1 The first array.
        @param {Array} array2 The second array.
        @return {Boolean} Whether the arrays are equal.
    */
    twoArraysMatch(array1, array2) {
        if (array1.length === array2.length) {
            return array1.every((element, index) => element === array2[index]);
        }
        return false;
    }

    /**
        Return an HTML newline.
        @method getNewline
        @return {String} An HTML newline.
    */
    getNewline() {
        return '<div></div>';
    }

    /**
        Function is used during the initialization of the Ace Editor to setup our our base settings
        we want to see for all instances of the ace editor.
        @method aceBaseSettings
        @param {AceEditor} editor Reference to the editor.
        @param {String} language The language of the code to be displayed.
        @return {void}
    */
    aceBaseSettings(editor, language) { // eslint-disable-line complexity
        editor.setTheme('ace/theme/dreamweaver');
        editor.setBehavioursEnabled(false);
        editor.setHighlightSelectedWord(false);
        editor.setShowInvisibles(false);
        editor.setShowPrintMargin(false);
        editor.setShowFoldWidgets(false);
        editor.setOption('dragEnabled', false);
        editor.setOption('enableMultiselect', false);
        editor.commands.removeCommand('find');
        editor.commands.removeCommand('showSettingsMenu');
        editor.getSession().setUseSoftTabs(true);

        let aceSyntaxHighlightLanguage = 'ace/mode/text';
        let aceTabSize = 3;

        switch (language) {
            case 'c':
            case 'cpp':
                aceSyntaxHighlightLanguage = 'ace/mode/c_cpp';
                break;

            case 'java':
                aceSyntaxHighlightLanguage = 'ace/mode/java';
                break;

            case 'matlab':
                aceSyntaxHighlightLanguage = 'ace/mode/matlab';
                break;

            case 'python':
            case 'python2':
            case 'python3':
                aceSyntaxHighlightLanguage = 'ace/mode/python';
                aceTabSize = 4;
                break;

            case 'sql':
                aceSyntaxHighlightLanguage = 'ace/mode/sql';
                break;

            case 'html':
                aceSyntaxHighlightLanguage = 'ace/mode/html';

                // Disable syntax checker. HTML syntax checker is rather pedantic.
                editor.getSession().setUseWorker(false);
                break;

            case 'javascript':
            case 'js':
                aceSyntaxHighlightLanguage = 'ace/mode/javascript';
                this.disableSomeLinterRules(editor);
                break;

            case 'css':
                aceSyntaxHighlightLanguage = 'ace/mode/css';

                // Disable syntax checker. The messages are not desired.
                editor.getSession().setUseWorker(false);
                break;

            case 'MIPS':
            case 'MIPSzy':
                aceSyntaxHighlightLanguage = 'ace/mode/assembly_x86';
                break;

            case 'ARM':
            case 'zyFlowchart':
            case 'coral':
                break;

            default:
                throw new Error('language not specified');
        }

        editor.getSession().setMode(aceSyntaxHighlightLanguage);
        editor.getSession().setTabSize(aceTabSize);

        // Eliminate warning of upcoming ACE editor change.
        editor.$blockScrolling = Infinity;
    }

    /**
        Ace editor shows errors and warnings for some languages based on linter rules. This method disables some of them.
            List of linter errors: https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript/jshint.js#L9232
            List of linter warnings: https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript/jshint.js#L9306
            List of linter info: https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript/jshint.js#L9451
        @method disableSomeLinterRules
        @param {AceEditor} editor Reference to the editor.
        @return {void}
    */
    disableSomeLinterRules(editor) {
        const session = editor.session;

        session.on('changeMode', () => {
            if (session.$worker) {

                /* Disable W083: "Don't make functions within a loop."
                   Disable W104: '<feature>' is avaiable in ES<esversion>... Ex: 'const' is available in ES6... */
                session.$worker.send('setOptions', [ { '-W083': false, '-W104': false } ]);
            }
        });
    }

    /**
        Adds a key binding to execute |check| when Ctrl+Return is pressed on |editor|.
        @method submitOnCtrlReturn
        @param {AceEditor} editor Reference to the editor.
        @param {function} check The function to execute when Ctrl+Return is pressed.
        @return {void}
    */
    submitOnCtrlReturn(editor, check) {
        editor.commands.addCommand({
            name: 'submitprogram',
            bindKey: {
                win: 'Ctrl-Return',
                max: 'Command-Return',
            },
            exec: check,
        });
    }

    /**
        Disables the button both logically and visually.
        @method disableButton
        @param {Object} $button jQuery object for button.
        @return {void}
    */
    disableButton($button) {
        $button.attr('disabled', true);
        $button.addClass('disabled');
    }

    /**
        Enables the button both logically and visually.
        @method disableButton
        @param {Object} $button jQuery object for button.
        @return {void}
    */
    enableButton($button) {
        $button.removeAttr('disabled');
        $button.removeClass('disabled');
    }

    /**
        Return a randomly-chosen number in the range from |start| to |end|.
        @method pickNumberInRange
        @param {Number} start The start of the range.
        @param {Number} end The end of the range.
        @param {Array} exclude These numbers are excluded from the range.
        @return {Number} The random number in range.
    */
    pickNumberInRange(start, end, exclude) {
        const exclusionList = exclude || [];

        let number = null;

        do {
            number = Math.floor(Math.random() * (end - start + 1)) + start;
        } while (exclusionList.indexOf(number) !== -1);

        return number;
    }

    /**
        Return an array of |amountToPick| randomly-chosen numbers in the range from |start| to |end|.
        @method pickNNumbersInRange
        @param {Number} start The start of the range.
        @param {Number} end The end of the range.
        @param {Number} amountToPick The quantity of numbers to pick.
        @return {Array} Array of {Number}. The chosen numbers.
    */
    pickNNumbersInRange(start, end, amountToPick) {
        const pickedNumbers = [];

        while (pickedNumbers.length < amountToPick) {
            const newNumber = this.pickNumberInRange(start, end, pickedNumbers);

            pickedNumbers.push(newNumber);
        }
        return pickedNumbers;
    }

    /**
        Return either true or false with equal odds of either.
        @method flipCoin
        @return {Boolean} The result of the coin flip.
    */
    flipCoin() {
        return this.pickNumberInRange(0, 1) === 0;
    }

    /**
        Create and return an array of size N.
        @method createArrayOfSizeN
        @param {Number} size The size of the array to create.
        @return {Array} The created array of size N.
    */
    createArrayOfSizeN(size) {
        return Array(size).fill(0);
    }

    /**
        Shuffle the elements of |array|.
        @method shuffleArray
        @param {Array} array The array to shuffle.
        @return {void}
    */
    shuffleArray(array) {
        let currentIndex = array.length;

        // While there remain elements to shuffle
        while (currentIndex > 0) {

            // Randomly pick a remaining element
            const randomIndex = Math.floor(Math.random() * currentIndex);

            currentIndex--;

            // Swap the randomly selected element with the current index element
            const temporaryValue = array[currentIndex];

            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
    }

    /**
        Converts color from rgb(r, g, b) format into #RRGGBB format
        @method rgbToHex
        @param {String} rgb The color to convert to hex.
        @return {String} The color as a hex value.
    */
    rgbToHex(rgb) {

        /**
            Convert a string color to a two-digit hex value.
            @method convertColorToHex
            @param {String} color The color to convert to hex.
            @return {String} The hex value.
        */
        function convertColorToHex(color) {
            const base10 = 10;
            const base16 = 16;
            const removeFirstTwoCharacters = -2;

            const decimalValue = parseInt(color, base10);
            const hexValue = decimalValue.toString(base16).slice(removeFirstTwoCharacters);

            return ((decimalValue < base16) ? `0${hexValue}` : hexValue);
        }

        const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        const hexColors = rgbMatch.slice(1, 4).map(color => `${convertColorToHex(color)}`); // eslint-disable-line no-magic-numbers
        const hexColor = hexColors.join('');

        return `#${hexColor}`;
    }

    /**
        Randomly pick 1 element from the |array|.
        @method pickElementFromArray
        @param {Array} array The array from which to pick.
        @return {Object} The selected element in the array.
    */
    pickElementFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
        Pick |amountToPick| of unique elements from |array|.
        @method pickNElementsFromArray
        @param {Array} array The array to pick from.
        @param {Number} amountToPick The number of elements to pick.
        @return {Array} The chosen elements.
    */
    pickNElementsFromArray(array, amountToPick) {

        // Copy |array| into |temporaryArray|
        const temporaryArray = jQuery.extend([], array);

        this.shuffleArray(temporaryArray);

        // Choose first |amountToPick| elements from |temporaryArray|
        return temporaryArray.filter((element, index) => index < amountToPick);
    }

    /**
        Pick |amountToPick| of unique indices from |array|.
        @method pickNIndicesFromArray
        @param {Array} array The array to pick from.
        @param {Number} amountToPick The number of indices to pick.
        @return {Array} The chosen indices.
    */
    pickNIndicesFromArray(array, amountToPick) {
        const arrayOfIndices = array.map((element, index) => index);

        return this.pickNElementsFromArray(arrayOfIndices, amountToPick);
    }

    /**
        Escapes HTML in the passed in |text|, making it safe to render. Returns the escaped string.
        @method escapeHTML
        @param {String} text Text with HTML to escape.
        @return {String} The text with escaped HTML.
    */
    escapeHTML(text) {
        return $('<div>').text(text).html();
    }

    /**
        Un-escapes HTML entities in |text| and returns the un-escaped string.
        @method unescapeHTML
        @param {String} text Text with escaped HTML.
        @return {String} Text with unescaped HTML.
    */
    unescapeHTML(text) {
        return $('<div>').html(text).text();
    }

    /**
        Return a string with proper spacing for a |constantValue|, e.g., -4 -> ' - 4' and 3 -> ' + 3'.
        If the |constantValue| does not |startsEquation|, then -4 -> '-4', 3 -> '3', and 1 -> ''
        @method stringifyConstantValue
        @param {Number} constantValue The constant value to stringify.
        @param {Boolean} [startsEquation=false] Whether the constant is the start of the equation.
        @param {Boolean} [standAloneConstant=false] Whether the constant is a standing alone, without a variable.
        @return {String} The constant value as a string.
    */
    stringifyConstantValue(constantValue, startsEquation = false, standAloneConstant = false) {
        let stringifiedConstant = constantValue;

        /*
            If the constant starts the equation but isn't a standalone constant, then handle two special cases. Ex:
            1. y = 1x  -> y = x
            2. y = -1x -> y = -x
        */
        if (startsEquation && !standAloneConstant) {
            if (stringifiedConstant === 1) {
                stringifiedConstant = '';
            }
            else if (stringifiedConstant === -1) {
                stringifiedConstant = '-';
            }
        }

        // If the constant does not start an equation, then add spaces before/after the sign.
        else if (!startsEquation) {
            let tmpConstantValue = '';

            // For non-negative values, use +. Otherwise, use the large minus sign &#8211.
            if (stringifiedConstant >= 0) {
                tmpConstantValue = ' + ';
            }
            else {
                tmpConstantValue = ` ${this.subtractionSymbol} `;
                stringifiedConstant *= -1;
            }

            // If |stringifiedConstant| is 1 and not |standAloneConstant|, then omit the 1. Otherwise, print the 1.
            if ((stringifiedConstant === 1) && !standAloneConstant) {
                stringifiedConstant = tmpConstantValue;
            }
            else {
                stringifiedConstant = tmpConstantValue + stringifiedConstant;
            }
        }

        return stringifiedConstant;
    }

    /**
        Return the checkmark image URL.
        @method getCheckmarkImageURL
        @param {Object} parentResource Stores functions including a function to build a URL.
        @return {String} The URL of the checkmark image.
    */
    getCheckmarkImageURL(parentResource) {
        return parentResource.getResourceURL('checkmark.png', '<%= grunt.option("tool") %>');
    }

    /**
        Return a new Carousel from the given array.
        @method getCarousel
        @param {Array} array The arrow to make the Carousel from.
        @return {Carousel} New carousel made from the given array.
    */
    getCarousel(array) {
        this.shuffleArray(array);
        return new Carousel(array);
    }

    /**
        Capitalize the first character in a string.
        @method initialCapitalize
        @param {String} string The string to initial capitalize.
        @return {String} The string with initial capital.
    */
    initialCapitalize(string) {
        return (string.charAt(0).toUpperCase() + string.slice(1));
    }

    /**
        Return a new {TestResult} object with parameters passed through.
        @method getTestResult
        @return {TestResult} New object with parameters passed through.
    */
    getTestResult(...args) {
        return new TestResult(...args);
    }

    /**
        Return a new {QuestionCache}.
        @method getQuestionCache
        @param {Object} questionFactory See {QuestionCache}'s constructor.
        @param {Number} maxQuestionsCached See {QuestionCache}'s constructor.
        @return {QuestionCache}
    */
    getQuestionCache(questionFactory, maxQuestionsCached) {
        return new QuestionCache(questionFactory, maxQuestionsCached);
    }

    /**
        Make a question via the question cache, or by loading from local store (if in exam mode).
        @method makeQuestionFromCacheOrLocalStore
        @param {Object} params Object storing each of the below parameters.
        @param {String} params.id The unique identifier for the tool.
        @param {Boolean} params.isExam Whether in exam mode.
        @param {Integer} params.levelIndex The level of the question to generate.
        @param {Function} params.makeQuestionFromJSON Function to call to make a question from given JSON.
        @param {Object} params.parentResource A dictionary of functions given by the parent resource.
        @param {QuestionCache} params.questionCache The question cache from which to generate new questions.
        @return {Object} The next question to give the user.
    */
    makeQuestionFromCacheOrLocalStore(params) {
        const isExam = params.isExam;
        const questionCache = params.questionCache;
        const id = params.id;
        const levelIndex = params.levelIndex;
        const parentResource = params.parentResource;
        const makeQuestionFromJSON = params.makeQuestionFromJSON;
        let question = questionCache.makeQuestion(levelIndex);

        // If this is the exam system, use the previously generated question if one exists.
        if (isExam) {
            const localId = `question-${id}-${levelIndex}`;
            const questionJSON = parentResource.getLocalStore(localId);

            // A previously generated question's JSON is in local store, so use that JSON to build the previous question.
            if (questionJSON) {
                question = makeQuestionFromJSON(questionJSON);
            }

            // A previous question doesn't exist, so store this new one.
            else {
                parentResource.setLocalStore(localId, question);
            }
        }

        return question;
    }

    /**
        Envelops the passed string with a LaTeX prefix and postfix.
        @method envelopLatex
        @private
        @param {String} latex The latex formatted string.
        @return {String} The same |latex| string enveloped with the prefix and postfix.
    */
    envelopLatex(latex) {
        return `\\( ${latex} \\)`;
    }

    /**
        Return a {String} that represents a LaTeX fraction with the passed numerator and denominator values.
        @method makeLatexFraction
        @param {Number} numeratorValue The value of the numerator.
        @param {Number} denominatorValue The value of the denominator.
        @param {Object} [size={ small: false, large: false }] Specifies the LaTeX font size of the fraction.
        @param {Boolean} [size.small=false] Make the fraction font smaller.
        @param {Boolean} [size.large=false] Make the fraction font larger.
        @return {String} LaTeX with fraction that includes a numerator and denominator.
    */
    makeLatexFraction(numeratorValue, denominatorValue, size = { small: false, large: false }) {
        let fraction = `\\frac{${numeratorValue}}{${denominatorValue}}`;
        const useSizePrefix = (size.small || size.large);

        if (useSizePrefix) {
            const sizePrefix = size.small ? 'small' : 'large';

            fraction = `\\${sizePrefix}{${fraction}}`;
        }

        return fraction;
    }

    /**
        Manages the diff highlighting while the API is being developed.
        @method manageDiffHighlighting
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {String} expectedAnswer The expected answer for the level.
        @param {String} userAnswer The user given answer to the level.
        @return {Object} An object containing the highlighting HTML and whether the only difference are whitespaces or not.
    */
    manageDiffHighlighting(parentResource, expectedAnswer, userAnswer) {
        const diff = parentResource.stringDifference(expectedAnswer, userAnswer);
        let highlightedExpectedOutput = parentResource.makeStringDiffHTML(expectedAnswer, diff.expectedAnswerIndicies).string;
        let highlightedActualOutput = parentResource.makeStringDiffHTML(userAnswer, diff.userAnswerIndicies).string;

        // Add tab class to tab diffs.
        const replaceTabRegExp = /(<span class="string-diff-highlight)(">\t<\/span>)/g;

        highlightedExpectedOutput = highlightedExpectedOutput.replace(replaceTabRegExp, '$1 tab$2');
        highlightedActualOutput = highlightedActualOutput.replace(replaceTabRegExp, '$1 tab$2');

        const expectedAnswerDifferences = diff.expectedAnswerIndicies.map(indexOfDiff => expectedAnswer[indexOfDiff]);
        const differences = expectedAnswerDifferences.concat(diff.userAnswerIndicies.map(indexOfDiff => userAnswer[indexOfDiff]));
        const doesOnlyWhitespaceDiffer = (differences.length > 0) && differences.every(difference => (/^\s*$/).test(difference));
        const wasNewlineExpectedButMissing = expectedAnswerDifferences.some(difference => (/^\n$/).test(difference));

        return { doesOnlyWhitespaceDiffer,
                 expectedOutputDiffIndices: diff.expectedAnswerIndicies,
                 highlightedExpectedOutput,
                 highlightedActualOutput,
                 wasNewlineExpectedButMissing };
    }

    /**
        Return a randomly-generated combination of parameters. The parameters may be a nested combination of dictionaries and lists.
        For each list, randomly pick 1 element in the list.
        @method getParameterCombination
        @param {Object} parameters A list of possible parameters to randomize the level.
        @return {Object} The randomly-generated combination of parameters.
    */
    getParameterCombination(parameters) {
        let dataType = typeof parameters;

        if (parameters === null) {
            dataType = 'undefined';
        }
        else if ($.isArray(parameters)) {
            dataType = 'array';
        }

        switch (dataType) {

            // Base case: Found a parameter without a value. Set the value to empty string, so nothing is printed when this parameter is used.
            case 'undefined':
                return '';

            // Base case: Parameter is a string. Return the escaped string.
            case 'string':
                return this.unescapeHTML(parameters);

            // Base case: Return a number or boolean.
            case 'number':
            case 'boolean':
                return parameters;

            // Recursive case: |parameter| is an array, so pick one element then recursively pick a parameter from that element.
            case 'array': {
                const parameter = this.pickElementFromArray(parameters);

                return this.getParameterCombination(parameter);
            }

            // Recursive case: |parameters| is a dictionary. Recursively call each key.
            case 'object': {
                const parameterCombination = {};

                Object.keys(parameters).forEach(key => {
                    parameterCombination[key] = this.getParameterCombination(parameters[key]);
                });

                return parameterCombination;
            }

            default:
                throw new Error(`Found unexpected data type: ${dataType}`);
        }
    }

    /**
        Return the number of possible permutations.
        @method getNumberOfPermutations
        @param {Object} parameters The parameters from which to calculate the number of permutations.
        @return {Number} The number of possible permutations.
    */
    getNumberOfPermutations(parameters) {

        // Recursive case: |parameter| is an array, so pick one element then recursively pick a parameter from that element.
        if ($.isArray(parameters)) {
            const sum = list => list.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            const itemPermutations = parameters.map(item => this.getNumberOfPermutations(item));

            return sum(itemPermutations);
        }

        // Recursive case: |parameters| is a dictionary. Recursively call each key.
        else if ((parameters !== null) && (typeof parameters === 'object')) {
            const product = list => list.reduce((accumulator, currentValue) => accumulator * currentValue, 1);
            const valuePermutations = Object.values(parameters).map(value => this.getNumberOfPermutations(value));

            return product(valuePermutations);
        }

        // Base case: Found a non-object and non-array parameter.
        return 1;
    }

    /**
        Build a new Python module with given code.
        @method makePythonModule
        @param {String} code The Python code to run through the new module.
        @return {Sk.module} Skulpt Python module with given code run through.
    */
    makePythonModule(code) {

        // Enable import of Python modules.
        Sk.configure({
            read: filename => {
                if (!Sk.builtinFiles || !Sk.builtinFiles.files[filename]) {
                    throw new Error(`File not found: '${filename}'`);
                }
                return Sk.builtinFiles.files[filename];
            },
        });

        // Configure execution timeout.
        const maxSecondsOfExecution = 5;
        const commonImports = 'import random';
        const commonFunctions = 'from common_functions import pick_from, pick_from_range';
        const completeCode = `${commonImports}\n${commonFunctions}\n${code}`;

        Sk.configure({ execLimit: maxSecondsOfExecution * 1000 }); // eslint-disable-line no-magic-numbers

        return Sk.importMainWithBody('<stdin>', false, completeCode);
    }

    /**
        Build a new Python module with given code. In case of error, shows the error to the author.
        @method makePythonModuleWithErrorCheck
        @param {String} code The Python code to run through the new module.
        @return {Sk.module} Skulpt Python module with given code run through.
    */
    makePythonModuleWithErrorCheck(code) {
        try {
            return this.makePythonModule(code);
        }
        catch (error) {
            const errorMessage = this.reviseLineNumberInErrorMessage(error.toString());

            alert(errorMessage); // eslint-disable-line no-alert
        }
        return null;
    }

    /**
        Returns the variable name with the preferred notation. "var_name" returns "${var_name}".
        @method getPythonNotation
        @param {String} pythonVarName The variable name
        @return {String} The variable name in Python notation. Simply returns |pythonVarName| if the string doesn't match the regex.
    */
    getPythonNotation(pythonVarName) {
        const regex = /^((\$\{\w+\})|(\w+))$/;
        const match = regex.exec(pythonVarName);

        if (match) {

            // "${var_name}" notation.
            if (match[2]) {
                return match[2];
            }

            // No notation, just "var_name".
            else if (match[3]) {
                return `\${${match[3]}}`;
            }
        }

        return pythonVarName;
    }

    /**
        Replace each variable in |string| with that variable's value in |module|.
        @method replaceStringVariables
        @param {String} string The string that may have variables to replace.
        @param {Sk.module} module Skulpt Python module that has variables.
        @return {String} The string with variables updated with actual values.
    */
    replaceStringVariables(string, module) {

        // Handle single-variable names. Ex: ${catName} or ${xValue}
        let newString = string.replace(/\$\{(\w+)\}/g, (match, variable) => {
            const moduleVariable = module.tp$getattr(variable);

            return (moduleVariable ? moduleVariable.v : match);
        });

        // Handle list look-up.
        newString = newString.replace(/\$\{(\w+)((\[\d+\])+)\}/g, (match, listName, indicesString) => {
            const listVariable = module.tp$getattr(listName);
            let returnValue = match;

            if (listVariable) {

                /*
                    Convert |indicesString| to an array of integers.
                    Ex: indicesString is '[0][1]'.
                    substring removes the first [ and last ]. Keeping '0][1'
                    split on '][' converts to array: [ '0', '1' ]
                    map converts to array of integers: [ 0, 1 ]
                */
                const indices = indicesString.substring(1, indicesString.length - 1)
                                             .split('][')
                                             .map(index => parseInt(index, 10));
                let listItemVariable = listVariable;

                // Advance each index.
                indices.forEach(index => {
                    if (listItemVariable) {
                        listItemVariable = listItemVariable.v[index];
                    }
                });

                if (listItemVariable) {
                    returnValue = listItemVariable.v;
                }
            }

            return returnValue;
        });

        return newString;
    }

    /**
        Revise the error message's line number by subtracting the number of prefix lines of code.
        @method reviseLineNumberInErrorMessage
        @param {String} errorMessage The error message to revise.
        @param {Number} [linesToSubtract=1] The number of lines to subtract from the result. Default 1: at least imports common functions.
        @return {String} The revised error message.
    */
    reviseLineNumberInErrorMessage(errorMessage, linesToSubtract = 1) {
        return errorMessage.replace(/\son\sline\s(\d+)/g, (match, lineNumberString) => {
            const lineNumber = parseInt(lineNumberString, 10);

            // 1 line of code is always added to Python code in makePythonModule() from utilities (to import common functions).
            const revisedLineNumber = lineNumber - linesToSubtract;

            return (lineNumber > 0) ? ` on line ${revisedLineNumber} of progression's code` : '';
        });
    }

    /**
        Generate a GUID.
        @method generateGUID
        @return {String} A newly created guid.
    */
    generateGUID() {
        let date = new Date().getTime();
        const hexSize = 16;

        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, digit => {
            const randomNum = ((date + Math.random() * hexSize) % hexSize) | 0; // eslint-disable-line no-bitwise

            date = Math.floor(date / hexSize);

            return (digit === 'x' ? randomNum : (randomNum & 0x3 | 0x8)).toString(hexSize); // eslint-disable-line
        });
    }

    /**
        Returns a FormData object for the explore or coding_progression SDKs in zyServer.
        @method getRunCodeFormDataObject
        @param {String} sdk What SDK is going to handle this request.
        @param {String} language The programming language being used.
        @param {String} mainFilename The name of the main file of the program.
        @param {Array<String>} input The input (or array of inputs) for the program.
        @param {Array<File>} files An array of files of the program.
        @param {Array<String>} [outputFilenames=[]] The names of the output files.
        @return {FormData}
    */
    getRunCodeFormDataObject(sdk, language, mainFilename, input, files, outputFilenames = []) { // eslint-disable-line max-params
        const serverLanguage = language === 'python3' ? 'python' : language;
        const filenamesList = files.filter(file =>
                                                file.name.endsWith(`.${language}`) || file.name.endsWith(`.${language}.student`)
                                          ).map(file => file.name.replace('.student', ''));

        if (!filenamesList.includes(mainFilename)) {
            filenamesList.push(mainFilename);
        }

        const filenamesToCompile = filenamesList.join(' ');
        const compileCommandByLanguage = {
            cpp: `g++ ${filenamesToCompile} -o a.out`,
            c: `gcc ${filenamesToCompile} -o a.out -lm`, // eslint-disable-line id-length
            java: `javac ${filenamesToCompile}`,
        };
        const runCommandByLanguage = {
            cpp: './a.out',
            c: './a.out',  // eslint-disable-line id-length
            java: `java ${mainFilename.slice(0, mainFilename.lastIndexOf('.'))}`,
            python: `python2 ${mainFilename}`,
            python3: `python3 ${mainFilename}`,
        };
        const config = {
            language: serverLanguage,
            compile_command: compileCommandByLanguage[language], // eslint-disable-line camelcase
            output_files: outputFilenames, // eslint-disable-line camelcase
        };

        // explore and coding_progression SDKs handle the run command and input differently. coding_progression may also run solution.
        switch (sdk) {
            case 'explore':
                config.command = runCommandByLanguage[language];
                config.input = input;
                break;
            case 'coding_progression':
                config.run_command = runCommandByLanguage[language]; // eslint-disable-line camelcase
                config.inputs = input;

                // If there are solution files, then we'll want to get the solution too.
                if (files.some(file => file.name.includes('.solution'))) {
                    config.get_solution_too = true; // eslint-disable-line camelcase
                }
                break;
            default:
                throw new Error(`SDK '${sdk}' not supported`);
        }

        const formData = new FormData();

        formData.append('config', JSON.stringify(config));
        files.forEach(file => {
            formData.append(file.name, file);
        });

        return formData;
    }

    /**
        Returns a FormData object for the explore SDK to run SQL code in zyServer.
        @method getSQLConfigFormDataObject
        @param {File} file The file to send to the server.
        @return {FormData}
    */
    getSQLConfigFormDataObject(file) {
        const config = {
            name: 'SQL',
            symbol: 'sql',
            language: 'sql',
            compile: {
                command: '',
                args: '',
            },
            command: `mysql < ${file.name}`,
            command_args: '-X', // eslint-disable-line camelcase
        };
        const formData = new FormData();

        formData.append('config', JSON.stringify(config));
        formData.append(file.name, file);

        return formData;
    }

    /**
        Make a tinker recorder.
        @method makeTinkerRecorder
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @return {TinkerRecorder} The recorder.
    */
    makeTinkerRecorder(parentResource) {
        return new TinkerRecorder(parentResource);
    }
}

module.exports = new Utilities();
