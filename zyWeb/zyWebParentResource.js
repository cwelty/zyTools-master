'use strict'

/**
    Simulation of the parent resource that zyWeb passes into tools.
    This simply proxies method calls to either the event manager or resource manager.
    @class ParentResource
*/
class ParentResource {

    /**
        ParentResource constructor, stores the tool's ID and initializes the values of
        isStudent and activityCompletion depending on the URL parameters. Default values:
        - isStudent is true.
        - activityCompletion marks the first two levels as completed.
        - needsAccessible is false.
        - needsAccessibleAndInteractive is false.
        @constructor
        @param {Integer} resourceId The ID of the tool.
        @param {String} toolName The name of the tool.
        @return {void}
    */
    constructor(resourceId, toolName) {
        this.resourceId = resourceId;
        this.toolName = toolName;
        this.utilities = require('zyWebUtilities');
        this.isLocalStorageSupported = this.utilities.isLocalStorageSupported();

        const isStudentRegExp = /(isStudent=)(true|false)/;
        const isStudentResult = isStudentRegExp.exec(window.location.search);
        const $isStudentCheckbox = this.utilities.checkboxLookupByName('isStudent');

        // isStudent: If there's a value for isStudent in the URL, use it, else, set to true.
        this.isStudentValue = isStudentResult ? isStudentResult[2] === 'true' : false;
        $isStudentCheckbox.eq(0).prop('checked', this.isStudent());

        const needsAccessibleRegExp = /(needsAccessible=)(true|false)/;
        const needsAccessibleResult = needsAccessibleRegExp.exec(window.location.search);
        const $needsAccessibleCheckbox = this.utilities.checkboxLookupByName('needsAccessible');

        const needsAccessibleAndInteractiveRegExp = /(needsAccessibleAndInteractive=)(true|false)/;
        const needsAccessibleAndInteractiveResult = needsAccessibleAndInteractiveRegExp.exec(window.location.search);
        const $needsAccessibleAndInteractiveCheckbox = this.utilities.checkboxLookupByName('needsAccessibleAndInteractive');

        // needsAccessible: If there's a value for needsAccessible in the URL, use it, else set to false.
        this.needsAccessibleValue = needsAccessibleResult ? needsAccessibleResult[2] === 'true' : false;
        $needsAccessibleCheckbox.eq(0).prop('checked', this.needsAccessible());

        // needsAccessibleAndInteractive: If there's a value for needsAccessibleAndInteractive in the URL, use it, else set to false.
        this.needsAccessibleAndInteractiveValue = needsAccessibleAndInteractiveResult ? needsAccessibleAndInteractiveResult[2] === 'true' : false;
        $needsAccessibleAndInteractiveCheckbox.eq(0).prop('checked', this.needsAccessibleAndInteractive());

        const activityCompletionRegExp = /(activityCompletion=)([\d,]*)/;
        const activityCompletionResult = activityCompletionRegExp.exec(window.location.search);
        const $activityCompletionCheckboxes = this.utilities.checkboxLookupByName('activityCompletion');

        // completedActivities: Initial value
        this.completedActivities = { partsCompletionStatus: [
            { complete: 1 }, { complete: 1 }, { complete: 0 }, { complete: 0 },
            { complete: 0 }, { complete: 0 }, { complete: 0 }, { complete: 0 },
        ] };

        // If there's a value for activityCompletion in the URL, use it, else, first two levels are completed.
        if (activityCompletionResult) {
            let completedLevels = [ 0, 0, 0, 0, 0, 0, 0, 0 ];

            // Complete array with 0.
            completedLevels = activityCompletionResult[2].split(',').concat(completedLevels);

            // If more than 8 elements in array, remove exceding elements.
            const maxLength = 8;

            if (completedLevels.length > maxLength) {
                completedLevels.splice(maxLength, completedLevels.length - maxLength);
            }
            completedLevels.forEach((status, index) => {
                this.completedActivities.partsCompletionStatus[index].complete = parseInt(status, 10);
                $activityCompletionCheckboxes[index].checked = status === '1' ? true : false;
            });
        }

        // Set checkbox callbacks.
        $isStudentCheckbox.change(input => {
            this.isStudentValue = input.target.checked;
            console.log(`isStudent changed to ${this.isStudentValue}`);
            this.utilities.updateParameters('isStudent', this.isStudentValue, isStudentRegExp);
        });

        // Set checkbox callbacks.
        $needsAccessibleCheckbox.change(input => {
            this.needsAccessibleValue = input.target.checked;
            console.log(`needsAccessible changed to ${this.needsAccessibleValue}`);
            this.utilities.updateParameters('needsAccessible', this.needsAccessibleValue, needsAccessibleRegExp);
        });

        $needsAccessibleAndInteractiveCheckbox.change(input => {
            this.needsAccessibleAndInteractiveValue = input.target.checked;
            console.log(`needsAccessibleAndInteractive changed to ${this.needsAccessibleAndInteractiveValue}`);
            this.utilities.updateParameters('needsAccessibleAndInteractive', this.needsAccessibleAndInteractiveValue, needsAccessibleAndInteractiveRegExp);
        });

        $activityCompletionCheckboxes.change(input => {
            let status = input.target.checked;
            this.completedActivities.partsCompletionStatus[input.target.value - 1].complete = status ? 1 : 0;

            const completedActivities = this.completedActivities.partsCompletionStatus.map(level => { return level.complete }).join(',')

            console.log(`activityCompletion of level ${input.target.value} changed to ${status}`);
            this.utilities.updateParameters('activityCompletion', completedActivities, activityCompletionRegExp);
        });

        const $viewSolution = $(`div#view-solution-${this.resourceId}`);
        const $infoForReviewers = $(`div#info-for-reviewers-${this.resourceId}`)

        $viewSolution.find('.title-container').click(this.toggleExpandable);
        $infoForReviewers.find('.title-container').click(this.toggleExpandable);
        $viewSolution.hide();
        $infoForReviewers.hide();

        this.eventManager = require('zyWebEventManager');
        this.resourceManager = require('zyWebResourceManager');

        this.utilities.loadSavedCredentials(this);
        $('div.right-buttons').show();
        $('.sign-in-button').click(() => {
            this.buildSignInModal();
        });
    }

    toggleExpandable() {
        const $expandable = $(this).parent();
        const $icon = $expandable.find('i');

        $expandable.find('.expandable-content').toggle();
        if ($icon.text() === 'keyboard_arrow_up') {
            $icon.text('keyboard_arrow_down');
        }
        else {
            $icon.text('keyboard_arrow_up');
        }
    }

    highlightCode(code, language) {
        return code.split('\n').map(line => `<span style='color: blue;'>${require('utilities').escapeHTML(line)}</span>`).join('\n');
    }

    /**
        Submit an activity event for storing in the database.
        @method postEvent
        @param {Object} event The activity event to store.
        @param {Number} event.part Non-negative integer value for which part of activity this submission refers to.
        @param {Boolean} event.complete Whether this part of the activity is completed.
        @param {String} [answer] The user's answer to this part of the activity.
        @param {Object} [metadata] Any other information to collect.
        @return {void}
    */
    postEvent() {
        this.eventManager.postEvent.apply(this.eventManager, arguments);
    }

    /**
        Request LaTex be rendered for this activity.
        @method latexChanged
        @return {void}
    */
    latexChanged() {
        this.eventManager.latexChanged();
    }

    getDependencyURL() {
        return this.resourceManager.getDependencyURL.apply(this.resourceManager, arguments);
    }

    getImageURL() {
        return this.resourceManager.getImageURL.apply(this.resourceManager, arguments);
    }

    /**
        Get the URL for a specified resource file located in the zyTool's |resource| folder.
        @method getResourceURL
        @param {String} resourcePath The path to the resource file from within the |resource| folder.
        @param {String} toolName Name of the zyTool from which to find the |resource| folder.
        @return {String} The URL to the resource file.
    */
    getResourceURL() {
        return this.resourceManager.getResourceURL.apply(this.resourceManager, arguments);
    }

    /**
        Get the URL for a static resource not located in the zyTool repo. Ex: HYPE animation files, and author-created image for zyAnimator.
        @method getStaticResource
        @param {String} dependency The name of the resource.
        @return {String} The URL to the resource.
    */
    getStaticResource() {
        return this.resourceManager.getStaticResource.apply(this.resourceManager, arguments);
    }

    getPathToToolJS() {
        return this.resourceManager.getPathToToolJS.apply(this.resourceManager, arguments);
    }

    getImageContentResourceUrl() {
        return this.resourceManager.getImageContentResourceUrl.apply(this.resourceManager, arguments);
    }

    getResource() {
        return this.resourceManager.getResource.apply(this.resourceManager, arguments);
    }

    getDependencies() {
        return this.resourceManager.getDependencies.apply(this.resourceManager, arguments);
    }

    getVersionedImage() {
        return this.resourceManager.getVersionedImage.apply(this.resourceManager, arguments);
    }

    /**
        Produce an alert with the given title and message.
        @method alert
        @param {String} [title=''] The title of the alert.
        @param {String} [message=''] The message of the alert.
        @return {void}
    */
    alert(title, message) {
        const leftButton = {
            decoration: 'button-blue',
            label: 'OK',
        };

        this.showModal(title, message, leftButton, null);
    }

    /**
        Create a modal dialog with the given title, message and left and right buttons.
        buttonObject:
            {
                keepOpen:   Boolean.    Whether or not to close modal automatically on click.
                label:      String.     Description of the button action. Default: Empty string.
                decoration: String.     Specify the class(es) for the button. Optional; Default: 'button-gray'.
                callback:   Function.   Specify a action to perform. Optional; Default: Closes modal.
            }
        decoration options:
            button-gray
            button-red
            button-blue
            button-green

        @method showModal
        @param {String} title The title of the modal.
        @param {String} message The message can be a simple string or HTML code.
        @param {Object} leftButton Data for the left button (label, callback, decoration, etc)
        @param {Object} rightButton Data for the right button (label, callback, decoration, etc)
        @return {void}
    */
    showModal(title, message, leftButton, rightButton) {
        const $container = $(`#${this.resourceId}`).parent().parent();
        const messageHTML = message ? `<p class='message body-text'>${message}</p>` : '';
        const leftButtonHTML = leftButton ? `<button class='leftButton zb-button secondary raised'><span class='title'>${leftButton.label}</span></button>` : ''
        const rightButtonHTML = rightButton ? `<button class='rightButton zb-button warn'><span class='title'>${rightButton.label}</span></button>` : '';
        const modalHTML = `<div class='${this.toolName}-modal zb-modal zb-choices-modal'>
                                <div class='zb-modal-content' tabindex='0' role='dialog'>
                                    <h1 class='card-header'>${title}</h1>
                                    ${messageHTML}
                                    <div class='actions'>
                                        ${leftButtonHTML}
                                        ${rightButtonHTML}
                                    </div>
                                </div>
                            </div>`;

        $container.append(modalHTML);

        const $leftButton = $(`.zb-modal-content .leftButton`);
        const $rightButton = $(`.zb-modal-content .rightButton`);

        if (!rightButton) {
            $leftButton.addClass('only-button');
        }

        $leftButton.click(() => {
            if (leftButton.callback) {
                leftButton.callback();
            }

            if (!leftButton.keepOpen) {
                this.utilities.closeModal();
            }
        });
        $rightButton.click(() => {
            if (rightButton.callback) {
                rightButton.callback();
            }

            if (!rightButton.keepOpen) {
                this.utilities.closeModal();
            }
        });
    }

    /**
        Utility to show the modal containing the special character legend.
        @method showSpecialCharacterLegendModal
        @return {void}
    */
    showSpecialCharacterLegendModal() {
        alert('Special character legend is shown');
    }

    /**
        Used by progressionTool to ensure appropriate part of activity is shown. Ex: Scroll to top of activity when showing next question.
        @method scrollToTop
        @return {void}
    */
    scrollToTop() {
        const container = $(`#${this.resourceId}`).get(0);
        const heightOfHeader = 50;
        const distanceToQuestionAreaTop = container.getBoundingClientRect().top - heightOfHeader;

        // If the top of the question area is not in view, then scroll up a little.
        if (distanceToQuestionAreaTop < 0) {
            $('.section-container').animate({
                scrollTop: '-=' + Math.abs(distanceToQuestionAreaTop),
            });
        }
    };

    /**
        Utility method to scroll to bottom of content resource.
        @method scrollToBottom
        @return {void}
    */
    scrollToBottom() {
        const container = $(`#${this.resourceId}`).get(0);
        const distanceToExplanationBottom = (container.getBoundingClientRect().bottom - $(window).height());

        // if explanation area is not in view, then scroll down a little.
        if (distanceToExplanationBottom > 0) {
            $('.section-container').animate({
                scrollTop: '+=' + distanceToExplanationBottom,
            });
        }
    };

    /**
        Simulates whether the user has a student subscription.
        @method isStudent
        @return {Boolean} The value of the |isStudent| URL parameter.
    */
    isStudent() {
        return this.isStudentValue;
    };

    /**
        Simulates whether the user needs the accessible version.
        @method needsAccessible
        @return {Boolean} The value of the |needsAccessible| URL parameter.
    */
    needsAccessible() {
        return this.needsAccessibleValue;
    };

    /**
        Simulates whether the user needs the accessible and interactive version.
        @method needsAccessibleAndInteractive
        @return {Boolean} The value of the |needsAccessibleAndInteractive| URL parameter.
    */
    needsAccessibleAndInteractive() {
        return this.needsAccessibleAndInteractiveValue;
    };

    /**
        Get the user's activity completion for this resource.
        @method activityCompletion
        @return {Object} Object that contains information about the compleation of each level.
    */
    activityCompletion() {
        return new Ember.RSVP.Promise(resolve => {
            resolve(this.completedActivities);
        });
    }

    /**
        Utility that builds an object containing the difference between two strings, along with the indices of the differences,
        the HTML of the differences, and a suggested hint message.
        @event buildStringDifferenceObject
        @param {String} expectedAnswer First string to compare.
        @param {String} userAnswer Second string to compare.
        @return {Promise}
    */
    buildStringDifferenceObject(expectedAnswer, userAnswer) {
        return new Ember.RSVP.Promise(resolve => {
            const diff = this.utilities.stringDiff(expectedAnswer, userAnswer);
            const expectedAnswerDiffIndices = diff.expectedAnswerIndicies;
            const userAnswerDiffIndices = diff.userAnswerIndicies;
            const userDifferences = userAnswerDiffIndices.map(index => userAnswer[index]);
            const expectedDifferences = expectedAnswerDiffIndices.map(index => expectedAnswer[index]);
            const allDifferences = userDifferences.concat(expectedDifferences);
            const isWhitespaceTheOnlyDifference = allDifferences.every(difference => (/\s/).test(difference));
            const hintSpecial = isWhitespaceTheOnlyDifference ? 'is nearly correct; but whitespace differs.' : 'differs.';
            const hintMessage = `Output ${hintSpecial} See highlights below.`;
            const unrenderedCharacterRegEx = /([\x00-\x08\x0b-\x0c\x0e-\x1f\x7f-\x9f\xad\u1680\u180E\u2000-\u200f\u2028\u2029\u202F\u205F\u3000\uFEFF\uFFF9-\uFFFC])|[\u1100-\u115F\u11A3-\u11A7\u11FA-\u11FF\u2329-\u232A\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3000-\u303E\u3041-\u3096\u3099-\u30FF\u3105-\u312D\u3131-\u318E\u3190-\u31BA\u31C0-\u31E3\u31F0-\u321E\u3220-\u3247\u3250-\u32FE\u3300-\u4DBF\u4E00-\uA48C\uA490-\uA4C6\uA960-\uA97C\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE66\uFE68-\uFE6B\uFF01-\uFF60\uFFE0-\uFFE6]|[\uD800-\uDBFF][\uDC00-\uDFFF]/; // eslint-disable-line
            const isReplacementADifference = allDifferences.some(difference => unrenderedCharacterRegEx.test(difference));
            const isWhitespaceADifference = allDifferences.some(difference => (/\s/).test(difference));

            resolve({
                expectedAnswerDiffIndices,
                userAnswerDiffIndices,
                expectedAnswerHTML: this.utilities.makeStringDiffHTML(expectedAnswer, expectedAnswerDiffIndices),
                userAnswerHTML: this.utilities.makeStringDiffHTML(userAnswer, userAnswerDiffIndices),
                isReplacementADifference,
                isWhitespaceADifference,
                hintMessage,
            });
        });
    }

    /**
        Deprecated: Use buildStringDifferenceObject instead.
        Utility to compute the difference between two strings.
        @method stringDifference
        @param {String} string1 One of the strings to use in the diff.
        @param {String} string2 The other string to use in the diff.
        @return {Object} Contains two arrays with the differing elements of the strings.
    */
    stringDifference(string1, string2) {
        alert('parentResource.stringDifference is deprecated; use parentResource.buildStringDifferenceObject instead');
        return this.utilities.stringDiff(string1, string2);
    }

    /**
        Deprecated: Use buildStringDifferenceObject instead.
        Utility to make HTML from string and list of indices to highlight.
        @method makeStringDiffHTML
        @param {String} string The string to process.
        @param {Array} indicesToHighlight The indices of the |string| that have to be highlighted.
        @return {SafeString} HTML code that highlights characters of |string|.
    */
    makeStringDiffHTML(string, indicesToHighlight) {
        alert('parentResource.makeStringDiffHTML is deprecated; use buildStringDifferenceObject instead');
        return this.utilities.makeStringDiffHTML(string, indicesToHighlight);
    }

    /**
        Used by tools to get data from localStorage.
        @method getLocalStore
        @param {String} key The key to the data stored in localStorage.
        @return {Object} The value stored with |key| in localStorage.
    */
    getLocalStore(key) {
        let value = null;

        if (this.isLocalStorageSupported) {
            value = window.localStorage.getItem(this.utilities._makeNamespace() + key);
        }

        return (value ? JSON.parse(value) : value);
    }

    /**
        Used by tools to set data to localStorage.
        @method setLocalStore
        @param {String} key The key to the data to store in localStorage.
        @param {Object} value The value to store in the localStorage.
        @return {void}
    */
    setLocalStore(key, value) {
        if (this.isLocalStorageSupported) {
            window.localStorage.setItem(this.utilities._makeNamespace() + key, JSON.stringify(value));
        }
    }

    /**
        Used by tools to set the solution for the given problem.
        @method setSolution
        @param {String} solution The solution to set.
        @param {String} language The language to display.
        @return {void}
    */
    setSolution(solution, language='') {
        const $viewSolution = $(`div#view-solution-${this.resourceId}`);
        const $expandableContent = $viewSolution.find('.expandable-content');

        $viewSolution.show();
        if (solution) {
            const languageToSay = language || 'text';

            $expandableContent.html(`Solution set as ${languageToSay}:<pre><code>${solution}</code></pre>`);
        }
        else {
            $expandableContent.text('No solution set');
        }
    }

    /**
        Used by tools to set the user's answer for the given problem.
        @method setUserAnswer
        @param {Object} userAnswer The user's answer to set.
        @return {void}
    */
    setUserAnswer(userAnswer) {
        console.log(`Set user answer to: ${userAnswer}`);
    }

    /**
        Used by tools to set the number of permutations shown and the total possible permutations.
        @method setPermutationsShownAndTotal
        @param {Object} permutations An object containing the number of shown permutations and total permutations.
        @return {void}
    */
    setPermutationsShownAndTotal(permutations) {
        const $infoForReviewers = $(`div#info-for-reviewers-${this.resourceId}`)
        const $expandableContent = $infoForReviewers.find('.expandable-content');

        permutations.shown = permutations.shown ? permutations.shown : '?';
        permutations.total = permutations.total ? permutations.total : '?';
        $infoForReviewers.show();
        $expandableContent.text(`Shown ${permutations.shown} of ${permutations.total} permutations.`);
    }

    /**
        Builds and shows a modal to sign in. If |formData| was passed, after signing in it will call runCode with the |formData|.
        @method buildSignInModal
        @param {FormData} [formData=null] If passed, the form data to be run after signing in.
        @return {void}
    */
    buildSignInModal() {

        // Only build the modal if we're not in the process of signing in and there isn't any other modal yet.
        if (!this.utilities.signInPromise && ($('.zb-modal').length === 0)) {
            const signInHTML = `<form>
    <div class='user-email zb-input-container'>
        <input id='email' type='email' placeholder='Email' class='zb-input'></input>
    </div>
    <div class='user-password zb-input-container'>
        <input id='password' type='password' placeholder='Password' class='zb-input'></input>
    </div>
    <button type='submit' class='sign-in zb-button secondary raised'>Sign in</button>
    <button class='cancel zb-button warn'>Cancel</button>
</form>`;

            this.showModal('Sign in to run code', signInHTML, null, null);
            $('button.cancel').click(() => {
                this.utilities.closeModal();
            });
            $('form').submit(e => {

                // Prevents a page refresh. Then signs in.
                e.preventDefault();
                this.utilities.signIn(this);
                this.utilities.closeModal();
            });
        }
    }

    /**
       Returns a promise to run code in zyServer.
       @method runCode
       @param {FormData} formData The data to be sent to run (configuration parameters, file objects).
       @return {RSVP.Promise}
    */
    runCode(formData) {
        const hasToSignIn = !this.utilities.authToken;

        if (hasToSignIn) {
            this.buildSignInModal();
        }

        // A promise to make a call to zyServer to run the code.
        return new Ember.RSVP.Promise((resolve, reject) => {
            if (hasToSignIn) {
                reject();
            }
            const baseUrl = 'https://zyserver.dev.kube.zybooks.com/v1/'
            const toolsThatUseCodingProgressionEndpoint = [ 'CodingProgression', 'CodingProgressionBuilder' ];
            const shouldUseCPEndpoint = toolsThatUseCodingProgressionEndpoint.includes(this.toolName);

            // Use the authoring_tools endpoint because the content_resource endpoint requires a CRID and zybook code.
            let endpoint = 'authoring_tools/'

            endpoint += shouldUseCPEndpoint ? 'CodingProgressionBuilder' : 'CodeOutputBuilder';
            endpoint += '/run_code';

            const url = baseUrl + endpoint;
            const checksumString = endpoint + this.utilities.authToken;
            const checksum = CryptoJS.MD5(checksumString).toString();

            formData.append('auth_token', this.utilities.authToken);
            formData.append('__cs__', checksum);

            $.ajax({
                url,
                data: formData,
                processData: false,
                method: 'POST',
                contentType: false,
                success: data => {

                    /* The server's response is an object that contains a URL of where the actual result will be found,
                     * so we make a query to the returned location */
                    if (data.success && data.location) {
                        this.queryRunCodeResults(data.location, resolve, reject);
                    }
                }
            })
        });
    }

    /**
        Queries the passed URL for results of running code.
        While the result is not ready, the request will return an object with state === 'PENDING', in that case we call this function again.
        Once the result is ready, the object will have state === 'SUCCESS'. Then we resolve the promise with the results.
        @method queryRunCodeResults
        @param {String} url The URL to query.
        @param {Function} resolve The function that resolves the promise.
        @param {Function} reject The function that rejects the promise.
        @return {Object} The response from the server to running code.
    */
    queryRunCodeResults(url, resolve, reject) {
        const oneSecondInMillis = 1 * 1000;

        $.ajax({
            url,
            method: 'GET',
            success: data => {
                if (data.state === 'PENDING') {
                    setTimeout(() => {
                        this.queryRunCodeResults(url, resolve);
                    }, oneSecondInMillis);
                }
                if (data.state === 'SUCCESS') {
                    resolve(data.results);
                }
                if (data.error) {
                    reject(data.error);
                }
            }
        })
    }

    /**
        Note: Copied from zycommon-web.
        Determine whether to show a hint to the user about when the error message references an uneditable line number.
        @method showErrorMessageHintAboutLineNumbers
        @param {String} errorMessage The error message shown to the user.
        @param {String} code Submitted code, including editable and uneditable parts.
        @param {String} writeEnabledCode The code that the student can edit.
        @param {String} language The language of the code.
        @return {Boolean} Whether to show a hint to the user about when the error message references an uneditable line number.
    */
    showErrorMessageHintAboutLineNumbers(errorMessage, code, writeEnabledCode, language) {

        // Compute the line and column of the last editable character in the code.
        const charactersFromCodeStartToEndOfWriteEnabled = code.indexOf(writeEnabledCode) + writeEnabledCode.length - 1;
        const codeBeforeUneditable = code.substring(0, charactersFromCodeStartToEndOfWriteEnabled);
        const linesOfcodeBeforeUneditable = codeBeforeUneditable.split('\n');
        const lineAndColumn = {
            line: linesOfcodeBeforeUneditable.length,
            column: linesOfcodeBeforeUneditable[linesOfcodeBeforeUneditable.length - 1].length,
        };

        // Get the regex for the language used.
        const cCppRegex = /^.+:(\d+):(\d+):/;
        const pythonsRegex = /^\s*File ".*", line (\d+)/;
        const languageToRegex = {
            cpp: cCppRegex,
            c: cCppRegex, // eslint-disable-line id-length
            java: /^.+:(\d+)/,
            python: pythonsRegex,
            python3: pythonsRegex,
            js: /.*\(line (\d+)\)/,
        };
        const regex = languageToRegex[language];

        // Determine whether the language's error messages support columns.
        const languagesThatSupportColumns = [ 'cpp', 'c' ];
        const doesSupportColumns = languagesThatSupportColumns.indexOf(language) !== -1;

        // Determine whether an error message indicates code beyond the editable code.
        let showErrorMessageHint = false;

        if (regex) {

            // Parse out the line and column from each error message.
            const linesOfErrorMessage = errorMessage.split('\n');
            const lineMatchesFromErrorMessage = linesOfErrorMessage.map(row => row.match(regex)).filter(match => match);
            const linesAndColumnsFromErrorMessage = lineMatchesFromErrorMessage.map(match => {
                const line = parseInt(match[1], 10);
                const column = doesSupportColumns ? parseInt(match[2], 10) : null;

                return { line, column };
            });

            // Determine whether any of the error messages indicate uneditable code.
            showErrorMessageHint = linesAndColumnsFromErrorMessage.some(lineAndColumnFromErrorMessage => {
                const laterLine = lineAndColumnFromErrorMessage.line > lineAndColumn.line;
                const sameLineLaterColumn = doesSupportColumns &&
                                            (lineAndColumnFromErrorMessage.line === lineAndColumn.line) &&
                                            (lineAndColumnFromErrorMessage.column > lineAndColumn.column);

                return laterLine || sameLineLaterColumn;
            });
        }

        return showErrorMessageHint;
    }

    /**
        Inform platform of the current level.
        @method setProgressionLevel
        @param {Integer} levelIndex The progression's current level (0-indexed).
        @return {void}
    */
    setProgressionLevel(levelIndex) {
        console.log(`Progression on level ${levelIndex + 1}`);
    }
}

module.exports = {
    create(id, toolName) {
        return new ParentResource(id, toolName);
    },
};
