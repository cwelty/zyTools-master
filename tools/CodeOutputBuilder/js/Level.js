/* global CodeFile */
/* exported Level */
'use strict';

class Level {

    /**
        @constructor
    */
    constructor() {

        /**
            The input for the level.
            @property input
            @type {String}
            @default ''
        */
        this.input = '';

        /**
            The explanation of the level.
            @property explanation
            @type {String}
            @default ''
        */
        this.explanation = '';

        /**
            The parameters for randomizing the level. Can be an object or a string.
            @property
            @type {Object or String}
            @default ''
        */
        this.parameters = '';

        /**
            A reference to the utilities module.
            @property utilities
            @type {Utilities}
        */
        this.utilities = require('utilities');

        /**
            An array of files in the level.
            @property files
            @default []
        */
        this.files = [];

        /**
            The number of the level.
            @property number
            @type {Number}
            @default null
        */
        this.number = null;

        /**
            Whether this level is currently selected for edition.
            @property isSelected
            @type {Boolean}
            @default false
        */
        this.isSelected = false;
    }

    /**
        Returns whether the parametrs are defined in Python.
        @method _isPythonRandomization
        @return {Boolean}
    */
    _isPythonRandomization() {
        return typeof this.parameters === 'string';
    }

    /**
        Returns the escaped |input| property.
        @method getEscapedInput
        @return {String}
    */
    getEscapedInput() {
        return this.utilities.escapeHTML(this.input);
    }

    /**
        A getter for the |explanation| property.
        @method getEscapedExplanation
        @return {String}
    */
    getEscapedExplanation() {
        return this.utilities.escapeHTML(this.explanation);
    }

    /**
        A setter for the |parameters| property.
        @method setParameters
        @param {String} parameters The code to set.
        @param {Boolean} isPythonRandomization Whether the parameters are Python code.
        @return {void}
    */
    setParameters(parameters, isPythonRandomization) {
        const oldParameters = this.parameters;

        if (isPythonRandomization) {
            this.parameters = parameters;
        }
        else if (parameters) {
            try {
                eval(`this.parameters = ${parameters}`); // eslint-disable-line no-eval
            }
            catch (error) {
                this.parameters = oldParameters;
                throw error;
            }
        }
        else {
            this.parameters = {};
        }
    }

    /**
        Sets the |parameters| data member from an XML string.
        @method setParametersXML
        @param {jQuery} $parametersXML The parameters to set in XML format.
        @param {Boolean} isPythonRandomization Whether the parameters are Python code.
        @return {void}
    */
    setParametersXML($parametersXML, isPythonRandomization) {
        if (isPythonRandomization) {
            const parametersHTML = $parametersXML.html();
            const value = $parametersXML.attr('unescape-html') ? this.utilities.unescapeHTML(parametersHTML) : parametersHTML;

            this.parameters = value;
        }
        else {
            this.parameters = {};
            $parametersXML.each((index, parameter) => {
                const name = $(parameter).prop('tagName');
                const value = this.xmlParameterValueToObject(parameter);

                this.parameters[name] = value;
            });
        }
    }

    /**
        Adds a file to the level.
        @method addFile
        @param {String} filename The name of the new file.
        @return {void}
    */
    addFile(filename) {
        const file = new CodeFile(filename);

        if (this.files.length === 0) {
            file.isMain = true;
        }
        this.files.push(file);
    }

    /**
        Moves a file from one position to another.
        @method moveFile
        @param {Number} currentFileIndex The current index of the file.
        @param {Number} newFileIndex The new index to set for the file.
        @return {void}
    */
    moveFile(currentFileIndex, newFileIndex) {
        const fileBeingMoved = this.files.splice(currentFileIndex, 1)[0];

        this.files.splice(newFileIndex, 0, fileBeingMoved);
        this.files.forEach(file => {
            file.isMain = false;
        });
        this.files[0].isMain = true;
    }

    /**
        Removes a file from the level.
        @method removeFile
        @param {Number} fileIndex The index of the file to remove.
        @return {void}
    */
    removeFile(fileIndex) {
        this.files.splice(fileIndex, 1);
        if (fileIndex === 0) {
            this.files[0].isMain = true;
        }
    }

    /**
        A recursive function that converts a XMLDocument into a javascript object.
        @method xmlParameterValueToObject
        @param {XMLDocument} parentParameter The XMLDocument to convert into an object.
        @return {Object} The parameters in a javascript object.
    */
    xmlParameterValueToObject(parentParameter) {
        const $parentParameter = $(parentParameter);
        const type = $parentParameter.attr('type');
        let value = $parentParameter.html();

        if (type === 'list') {
            value = $parentParameter.children().toArray().map(childParameter => this.xmlParameterValueToObject(childParameter));
        }
        else if (type === 'dict') {
            value = {};
            $parentParameter.children().each((index, parameter) => {
                const $parameter = $(parameter);
                const name = $parameter.prop('tagName');

                value[name] = this.xmlParameterValueToObject(parameter);
            });
        }

        if ($parentParameter.attr('unescape-html')) {
            value = this.utilities.unescapeHTML(value);
        }

        return value;
    }

    /**
        Returns an XML string defining the parameters.
        @method getParametersXML
        @return {String}
    */
    getParametersXML() {
        let attributes = '';
        let parametersString = '';

        if (this._isPythonRandomization()) {
            const trimmedParameters = this.parameters.trim();

            if (trimmedParameters !== '') {
                const escapedParameterString = this.utilities.escapeHTML(trimmedParameters);

                if (this.parameters !== escapedParameterString) {
                    attributes = ' unescape-html=\'true\'';
                }
                parametersString = `\n${escapedParameterString}`;
            }
        }
        else {
            parametersString = Object.keys(this.parameters)
                                     .map(key => this.parameterToXML(key, this.parameters[key]))
                                     .join('');
            attributes = parametersString.length ? ' type=\'dict\'' : '';
        }
        const spacing = parametersString.length ? '\n    ' : '';

        return `    <parameters${attributes}>${parametersString}${spacing}</parameters>`;
    }

    /**
        Returns the parameters as a JSON string.
        @method getParametersString
        @return {String}
    */
    getParametersString() {
        if (this._isPythonRandomization()) {
            return this.parameters.trim();
        }

        const indentation = 3;
        const parametersLength = Object.keys(this.parameters).length;

        return parametersLength ? JSON.stringify(this.parameters, null, indentation) : '';
    }

    /**
        Converts a parameter object to an XML string.
        @method parameterToXML
        @param {String} name The name of the parameter to converto to XML.
        @param {Object} value The value of the parameter to convert to XML.
        @param {Number} indentationLevel The level of indentation.
        @return {String} The XML representing the parameter.
    */
    parameterToXML(name, value, indentationLevel = 2) { // eslint-disable-line no-magic-numbers
        const spaces = '    '.repeat(indentationLevel);
        let xml = `\n${spaces}<${name}`;

        switch (this.guessParameterType(value)) {

            // Recursive case, parameter is a list.
            case 'list':
                xml += ' type=\'list\'>';
                xml += value.map(element => this.parameterToXML('li', element, indentationLevel + 1)).join('');
                xml += `\n${spaces}`;
                break;

            // Recursive case, parameter is a dictionary.
            case 'dict':
                xml += ' type=\'dict\'>';
                xml += Object.keys(value).map(key => this.parameterToXML(key, value[key], indentationLevel + 1)).join('');
                xml += `\n${spaces}`;
                break;

            // Base case, parameter is plain text.
            default: {
                const escapedValue = this.utilities.escapeHTML(value);

                if (value.toString() !== escapedValue) {
                    xml += ' unescape-html=\'true\'';
                }
                xml += `>${escapedValue}`;
                break;
            }
        }

        xml += `</${name}>`;

        return xml;
    }

    /**
        Runs some tests to find out if |value| is a list, a dictionary or plain text.
        @method guessParameterType
        @param {Object} value The value to guess from.
        @return {String}
    */
    guessParameterType(value) {
        let type = 'text';

        if (Array.isArray(value)) {
            type = 'list';
        }
        else if ($.isPlainObject(value)) {
            type = 'dict';
        }

        return type;
    }

    /**
        Returns a string defining the level in XML.
        @method toXML
        @return {String}
    */
    toXML() {
        const escapedExplanation = this.getEscapedExplanation();
        const shouldEscapeExplanation = this.explanation !== escapedExplanation;
        const escapeExplanation = shouldEscapeExplanation ? ' unescape-html=\'true\'' : '';
        const explanation = escapedExplanation ? `    <explanation${escapeExplanation}>${escapedExplanation}</explanation>` : '';

        const escapedInput = this.getEscapedInput();
        const shouldEscapeInput = this.input !== escapedInput;
        const escapeInput = shouldEscapeInput ? ' unescape-html=\'true\'' : '';
        const parameters = this.getParametersXML();
        const input = escapedInput ? `    <input${escapeInput}>${escapedInput}</input>\n` : '';

        let template = '    <template';

        // If there's only one file, then no need to have a list of files in the template.
        if (this.files.length === 1) {
            const file = this.files[0];
            const escapedCode = file.getContent() === file.getContent(true) ? '' : ' unescape-html=\'true\'';

            template += `${escapedCode}>${file.getContent(true)}</template>`;
        }
        else {
            template += ' type=\'list\'>\n';
            template += this.files.map(file => file.toXML()).join('\n');
            template += `\n    </template>`;
        }

        return `<level type='dict'>\n${explanation}\n${template}\n${parameters}\n${input}</level>`;
    }

    /**
        Returns this level in JSON format.
        @method toJSON
        @return {JSON} The level in JSON.
    */
    toJSON() {
        const template = this.files.length === 1 ? this.files[0].getContent() : this.files.map(file => file.toJSON());

        return {
            explanation: this.explanation,
            template,
            parameters: this.parameters,
            input: this.input,
        };
    }
}
