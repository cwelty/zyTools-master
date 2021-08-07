'use strict'

class ZyWebUtilities {

    /**
        @constructor
    */
    constructor() {

        /**
            A promise to sign in, so we only send one request.
            @property signInPromise
            @type {Ember.RSVP.Promise}
            @default null
        */
        this.signInPromise = null;

        /**
            The authentication token for the signed in user.
            @property authToken
            @type {String}
            @default null
        */
        this.authToken = null;

        /**
            The first name of the signed in user.
            @property userName
            @type {String}
            @default null
        */
        this.userName = null;
    }

    /**
        Build a namespace for the LocalStore functions.
        @method _makeNamespace
        @return {String} A namespace
    */
    _makeNamespace() {
        return 'zyToolTesting';
    }

    /**
        Whether localStorage is supported or not.
        @method isLocalStorageSupported
        @return {Boolean} True if localStorage is supported, false otherwise
    */
    isLocalStorageSupported() {
        const testKey = 'test';
        const storage = window.localStorage;

        try {
            storage.setItem(testKey, '1');
            storage.removeItem(testKey);
            return true;
        }
        catch (error) {
            return false;
        }
    }

    /**
        Lookup a jQuery reference to a DOM checkbox element based on a name
        @method checkboxLookupByName
        @param {String} checkboxName The name of the checkboxes
        @return {jQuery} Reference to a DOM checkbox element with given name.
    */
    checkboxLookupByName(checkboxName) {
        return $(`input[type=checkbox][name=${checkboxName}]`);
    }

    /**
        Updates the passed URL parameter with the passed value.
        @method updateParameters
        @param {String} parameter The parameter to update.
        @param {String} value The value to set for |parameter|.
        @param {RegExp} regExp The regular expression that defines the parameter.
        @return {void}
    */
    updateParameters(parameter, value, regExp) {
        if (regExp.test(window.location.search)) {
            window.location.search = window.location.search.replace(regExp, `$1${value}`);
        }
        else {
            const firstParam = window.location.search.indexOf('?') === -1;
            const addChar = firstParam ? '?' : '&';

            window.location.search += `${addChar}${parameter}=${value}`;
        }
    }

    /**
        Closes any modal.
        @method closeModal
        @return {void}
    */
    closeModal() {
        $(`.zb-modal`).remove();
    }

    /**
        Given the two strings |a| and |b|, returns the indices in each string that should be highlighted in
        a render of their levenshtein distance..
        Optionally provide two booleans to ignore all casing or spacing in two input strings.
        Code copied from zyWeb/app/js/models/utilities/string-diff.js
        @method stringDiff
        @param {String} a One of the strings.
        @param {String} b The other string.
        @param {Boolean} ignoreCase Whether the diff should ignore casing.
        @param {Boolean} ignoreSpace Whether the diff should ignore spacing.
        @return {Object} Contains two arrays with the differing elements of the strings.
    */
    stringDiff(a, b, ignoreCase, ignoreSpace) {
        if ((!a && a !== '') || (!b && b !== '')) {
            return {
                expectedAnswerIndicies: [],
                userAnswerIndicies: []
            }
        }

        // Cap the size of the strings to diff, since generating a Levenshtein table on large strings is very expensive.
        const MAX_DIFF_LENGTH = 2500;

        a = a.slice(0, MAX_DIFF_LENGTH);
        b = b.slice(0, MAX_DIFF_LENGTH);

        // Remove whitespace from strings a and b before Levenshtein; then adjust output indices for spaces.
        if (ignoreSpace) {

            // Create offset mapping for no space to space versions of a and b strings.
            const aNoSpaceToSpaceMapping = new Array(a.length);

            for (let aCharIndex = 0, aSpaceCount = 0; aCharIndex < a.length; aCharIndex++) {
                if (a.charAt(aCharIndex).match(/\s+/)) {
                    aSpaceCount++;

                    for(let x = aSpaceCount - 1; x > 0; x--) {
                        aNoSpaceToSpaceMapping[aCharIndex - x] = aSpaceCount;
                    }
                }
                aNoSpaceToSpaceMapping[aCharIndex] = aSpaceCount;
            }

            const bNoSpaceToSpaceMapping = new Array(b.length);

            for (let bCharIndex = 0, bSpaceCount = 0; bCharIndex < b.length; bCharIndex++) {
                if (b.charAt(bCharIndex).match(/\s+/)) {
                    bSpaceCount++;

                    for (let y = bSpaceCount - 1; y > 0; y--) {
                        bNoSpaceToSpaceMapping[bCharIndex - y] = bSpaceCount;
                    }
                }
                bNoSpaceToSpaceMapping[bCharIndex] = bSpaceCount;
            }

            // Remove whitespace from a and b; before computing Levenshtein.
            a = a.replace(/\s+/g, '');
            b = b.replace(/\s+/g, '');
        }

        const levenshteinTable = this.generateLevenshteinTable(a, b, ignoreCase);

        const aIndices = [];
        const bIndices = [];

        // Walk backwards through the levenshtein table and generate the highlighted indices for each string.
        let aStringIndex = a.length;
        let bStringIndex = b.length;
        let aChar;
        let bChar;

        while (bStringIndex > 0 && aStringIndex > 0) {

            // Calculate if the cheapest path goes diagonally, up, or left from the current position.
            const currentCost = levenshteinTable[bStringIndex][aStringIndex];

            const diagonalCostDiff = currentCost - levenshteinTable[bStringIndex - 1][aStringIndex - 1];
            const upCostDiff = currentCost - levenshteinTable[bStringIndex - 1][aStringIndex];
            const leftCostDiff = currentCost - levenshteinTable[bStringIndex][aStringIndex - 1];

            const largestDiff = Math.max(diagonalCostDiff, Math.max(upCostDiff, leftCostDiff));

            bChar = b.charAt(bStringIndex - 1);
            aChar = a.charAt(aStringIndex - 1);

            if (largestDiff === diagonalCostDiff) {

                // The cheapest path goes diagonally. If there was a cost increase, this was a substitution, so highlight this index.
                // Otherwise, the characters were the same.
                bStringIndex--;
                aStringIndex--;

                if (largestDiff !== 0) {
                    aIndices.push(aStringIndex);
                    bIndices.push(bStringIndex);
                }
            } else if (largestDiff === upCostDiff) {

                // The cheapest path goes up, so highlight this index in the b string.
                bStringIndex--;
                bIndices.push(bStringIndex);
            } else {

                // The cheapest path goes left, so highlight this index in the a string.
                aStringIndex--;
                aIndices.push(aStringIndex);
            }
        }

        // The a string was shorter than the b string, so highlight the remaining characters of the b string.
        while (bStringIndex > 0) {
            bStringIndex--;
            bIndices.push(bStringIndex);
        }

        // The b string was shorter than the a string, so highlight the remaining characters of the a string.
        while (aStringIndex > 0) {
            aStringIndex--;
            aIndices.push(aStringIndex);
        }

        // If we ignored spaces, we must adjust output indices for spaces.
        if (ignoreSpace) {

            // Adjust indices from offset mapping for a and b indices.
            for(let aAdjustSpaceIndex = 0; aAdjustSpaceIndex < aIndices.length; aAdjustSpaceIndex++) {
                aIndices[aAdjustSpaceIndex] += aNoSpaceToSpaceMapping[aIndices[aAdjustSpaceIndex]];
            }

            for(let bAdjustSpaceIndex = 0; bAdjustSpaceIndex < bIndices.length; bAdjustSpaceIndex++) {
                bIndices[bAdjustSpaceIndex] += bNoSpaceToSpaceMapping[bIndices[bAdjustSpaceIndex]];
            }
        }

        return {
            expectedAnswerIndicies: aIndices,
            userAnswerIndicies: bIndices
        }
    }

    /**
        Returns a levenshtein table for the two strings |a| and |b| as a 2D array.
        Pass in a boolean |ignoreCase| for a case insenstive search.
        Code copied from zyWeb/app/js/models/utilities/string-diff.js
        @method generateLevenshteinTable
        @param {String} a One of the strings.
        @param {String} b The other string.
        @param {Boolean} ignoreCase Whether the diff should ignore casing.
        @return {Array} The levenshtein table.
    */
    generateLevenshteinTable(a, b, ignoreCase) {
        if (a.length === 0) {
            return b.length;
        }
        if (b.length === 0) {
            return a.length;
        }

        if (ignoreCase) {
            a = a.toLowerCase();
            b = b.toLowerCase();
        }

        const matrix = [];

        // Increment along the first column of each row.
        for (let bCharIndex = 0; bCharIndex <= b.length; bCharIndex++) {
            matrix[bCharIndex] = [bCharIndex];
        }

        // Increment each column in the first row.
        for (let aCharIndex = 0; aCharIndex <= a.length; aCharIndex++) {
            matrix[0][aCharIndex] = aCharIndex;
        }

        const SUBSTITUTION_COST = 2;
        const INSERTION_COST = 1;
        const DELETION_COST = 1;

        let aChar;
        let bChar;

        // Fill in the rest of the matrix.
        for (let bFillMatrix = 1; bFillMatrix <= b.length; bFillMatrix++) {
            for (let aFillMatrix = 1; aFillMatrix <= a.length; aFillMatrix++) {

                bChar = b.charAt(bFillMatrix - 1);
                aChar = a.charAt(aFillMatrix - 1);

                if(bChar == aChar) {
                    matrix[bFillMatrix][aFillMatrix] = matrix[bFillMatrix - 1][aFillMatrix - 1];
                }
                else {
                    matrix[bFillMatrix][aFillMatrix] = Math.min(matrix[bFillMatrix - 1][aFillMatrix - 1] + SUBSTITUTION_COST,
                                                                Math.min(matrix[bFillMatrix][aFillMatrix - 1] + INSERTION_COST,
                                                                         matrix[bFillMatrix - 1][aFillMatrix] + DELETION_COST));
                }
            }
        }

        return matrix;
    }

    /**
        Utility that highlights specified indices in the given |string|.
        Code copied from zyWeb/app/js/helpers/utilities.js
        @method makeStringDiffHTML
        @param {String} string The string to process.
        @param {Array} highlightedIndices The indices of the |string| that have to be highlighted.
        @param {String} expectedOutput The expected output of the string diff.
        @param {String} testType The type of string compare test that was run.
        @return {SafeString} HTML code that highlights characters of |string|.
    */
    makeStringDiffHTML(string, highlightedIndices, expectedOutput, testType) {
        if (!string) {
            return new Handlebars.SafeString('');
        }

        const MAX_DIFF_LENGTH = 2500;
        let chars = string.slice(0, MAX_DIFF_LENGTH).split('');

        // In starts with and ends with instances we want to truncate the users output so that it aligns with the expected output.
        if (expectedOutput) {
            const userOutputLength = chars.length;
            const expectedOutputLength = expectedOutput.length;

            if (testType === 'starts') {

                // Remove highlighted indices that are outside of the startsWith range.
                highlightedIndices = highlightedIndices.filter(value => { return value <= expectedOutputLength; });

                // Truncate the string from the start to the length of the expected output plus any error characters.
                chars = chars.slice(0, expectedOutputLength + highlightedIndices.length);
            }
            else if (testType === 'ends') {

                // Remove highlighted indices that are outside of the endsWith range.
                highlightedIndices = highlightedIndices.filter(value => { return value >= userOutputLength - expectedOutputLength - 1 });

                // Adjust index values to accommodate the slice removing front part of the string.
                highlightedIndices = highlightedIndices.map(value => {
                    return value - (userOutputLength - expectedOutputLength - highlightedIndices.length);
                });

                // Truncate the string from the end up to the expected output plus any error characters.
                chars = chars.slice(userOutputLength - expectedOutputLength - highlightedIndices.length, userOutputLength);
            }
        }

        return new Handlebars.SafeString(chars.map((character, index) => {
            if (highlightedIndices.indexOf(index) !== -1) {

                if (character === '\n') {
                    return '<span class="string-diff-highlight newline">' + character + '</span>';
                } else {
                    return '<span class="string-diff-highlight">' + character + '</span>';
                }
            } else {
                return character;
            }
        }).join(''));
    }

    /**
        Queries the local storage to find previously saved credentials.
        @method loadSavedCredentials
        @param {ParentResource} parentResource The parent resource.
        @return {void}
    */
    loadSavedCredentials(parentResource) {
        this.expiryDate = parentResource.getLocalStore('expiry_date');
        const currentDate = new Date();
        const expiryDate = new Date(this.expiryDate);

        if (expiryDate && currentDate < expiryDate) {
            this.authToken = parentResource.getLocalStore('auth_token');
            this.userName = parentResource.getLocalStore('user_name');
        }

        this.signInController(parentResource);
    }

    /**
        The controlls the sign in UI depending on the current state.
        @method signInController
        @param {ParentResource} parentResource The parent resource.
        @param {String} [errorMessage=''] The error to show, if any.
        @return {void}
    */
    signInController(parentResource, errorMessage = '') {
        const $needToSignIn = $('p.sign-in-message');
        const signInButtonHTML = '<button class="sign-in-button zb-button">Sign in</button>';

        $needToSignIn.removeClass('success');
        $needToSignIn.removeClass('error');

        if (errorMessage) {
            $needToSignIn.html(errorMessage + signInButtonHTML);
            $needToSignIn.addClass('error');
        }
        else if (this.authToken) {
            $needToSignIn.text(`Welcome back, ${this.userName}!`);
            $needToSignIn.addClass('success');
            parentResource.setLocalStore('auth_token', this.authToken);
            parentResource.setLocalStore('expiry_date', this.expiryDate);
            parentResource.setLocalStore('user_name', this.userName);
        }
        else {
            $needToSignIn.html(`Sign in to run code ${signInButtonHTML}`);
        }

        $('.sign-in-button').click(() => {
            parentResource.buildSignInModal();
        });
    }

    /**
        Sends the user account credentials to receive an auth token. The auth token is needed to run code in the server.
        @method signIn
        @param {ParentResource} parentResource The parent resource.
        @return {void}
    */
    signIn(parentResource) {
        if (!this.signInPromise && !this.authToken) {
            const email = $('input#email').val();
            const password = $('input#password').val();

            this.singInPromise = new Ember.RSVP.Promise((resolve, reject) => {
                const url = 'https://zyserver.dev.kube.zybooks.com/v1/signin';
                const credentials = {
                    email,
                    password,
                };

                $.ajax({
                    url,
                    data: JSON.stringify(credentials),
                    processData: false,
                    contentType: 'application/json',
                    method: 'POST',
                    success: data => {
                        const $needToSignIn = $('p.sign-in-message');

                        if (data.success) {
                            this.authToken = data.session.auth_token;
                            this.expiryDate = data.session.expiry_date;
                            this.userName = data.user.first_name;
                            this.signInController(parentResource);
                            resolve();
                        }
                        else {
                            this.signInController(parentResource, data.error.message);
                            reject();
                        }
                    }
                })
            });
        }

        return this.signInPromise;
    }
}

module.exports = new ZyWebUtilities();
