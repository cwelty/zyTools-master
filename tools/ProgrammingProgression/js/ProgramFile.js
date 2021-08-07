/* global HandlebarsComplete, PrefixPostfixPlaceholder */
/* exported ProgramFile */
'use strict';

/**
    A file for the ProgrammingProgression program.
    @class ProgramFile
*/
class ProgramFile {

    /**
        Initialize a ProgrammingProgression program file.
        @constructor
        @param {String} filename The name of the file.
        @param {Object} programParts The code of the file. Contains the headers, main, class definition, prefix, student code part and postfix.
        @param {Object} parameters The parameters to use to build the code for the program.
        @param {String} levelType the type of level. Ex: default (just some code in main function), function (student defines a function)...
    */
    constructor(filename, programParts, parameters, levelType) {
        this.filename = filename;
        this.programParts = programParts;
        this.initializeProgramParts();

        // Creates a new object with the final code parts.
        this.codeParts = Object.keys(this.programParts).reduce((previous, current) => {
            const compiled = HandlebarsComplete.compile(this.programParts[current]);

            previous[current] = compiled(parameters);
            return previous;
        }, {});

        const codeOrder = [ 'headers', 'classDefinition', 'preProgramDefinitions' ];

        if (levelType === 'function') {
            codeOrder.push('returnType', 'functionName', 'parameters', 'functionPrefix', 'student', 'functionPostfix', 'main');
        }
        else {
            codeOrder.push('main', 'prefix', 'student', 'postfix', 'returnStatement');
        }

        this.codeTemplate = codeOrder.map(key => this.programParts[key]).join('');
        this.handlebarsCode = HandlebarsComplete.compile(this.codeTemplate);
        this.program = Object.getOwnPropertyNames(parameters).length > 0 ? this.handlebarsCode(parameters) : this.codeTemplate; // eslint-disable-line prefer-reflect

        let prefix = this.codeParts.headers + this.codeParts.classDefinition + this.codeParts.preProgramDefinitions;
        let postfix = '';

        if (levelType === 'function') {
            prefix += this.codeParts.returnType + this.codeParts.functionName + this.codeParts.parameters + this.codeParts.functionPrefix;
            postfix = this.codeParts.functionPostfix + this.codeParts.main;
        }
        else {
            prefix += this.codeParts.main + this.codeParts.prefix;
            postfix = this.codeParts.postfix + this.codeParts.returnStatement;
        }

        const placeholder = this.codeParts.student;

        this.prefixPostfixPlaceholder = new PrefixPostfixPlaceholder(prefix, postfix, placeholder);
    }

    /**
        Initializes the |programParts| attribute of this class.
        @method initializeProgramParts
        @return {void}
    */
    initializeProgramParts() { // eslint-disable-line complexity

        // Default value for each program part.
        // import/include statements.
        this.programParts.headers = this.programParts.headers || '';

        // Mainly for java's class definitions.
        this.programParts.classDefinition = this.programParts.classDefinition || '';

        // structs or additional functions, above main function
        this.programParts.preProgramDefinitions = this.programParts.preProgramDefinitions || '';

        // If progression is of function type, it may have a return type, function name, parameter list, function prefix and postfix.
        this.programParts.returnType = this.programParts.returnType || '';
        this.programParts.functionName = this.programParts.functionName || '';
        this.programParts.solutionFunctionName = this.programParts.solutionFunctionName || '';
        this.programParts.parameters = this.programParts.parameters || '';
        this.programParts.functionPrefix = this.programParts.functionPrefix || '';
        this.programParts.functionPostfix = this.programParts.functionPostfix || '';

        // The main function declaration.
        this.programParts.main = this.programParts.main || '';
        this.programParts.student = this.programParts.student || '';

        // Prefix, postfix and return statement for the main function, mainly for the default type of level.
        this.programParts.prefix = this.programParts.prefix || '';
        this.programParts.postfix = this.programParts.postfix || '';
        this.programParts.returnStatement = this.programParts.returnStatement || '';
    }
}
