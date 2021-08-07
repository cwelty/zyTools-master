/* global HandlebarsComplete */
/* exported ProgramTemplate */
'use strict';

/**
    ProgramTemplate stores the template for a program. Files with filename, prefix and postfix.
    @class ProgramTemplate
*/
class ProgramTemplate {

    /**
        Build a ProgramTemplate.
        @constructor
        @param {Array} program An array of file definitions or single object. If it's an object, it's a single file program.
        @param {String} language The language of the program.
    */
    constructor(program, language) {
        const languageToFilename = {
            cpp: 'main.cpp',
            c: 'main.c', // eslint-disable-line id-length
            java: 'Main.java',
            python: 'main.py',
            python3: 'main.py',
        };

        this.files = [];
        if ($.isArray(program)) {
            const numberOfEditableFiles = program.filter(file => typeof file.code === 'object').length;

            if (numberOfEditableFiles !== 1) {
                window.alert(`This level has ${numberOfEditableFiles} editable files. The tool expects exactly 1 editable file per level.`); // eslint-disable-line no-alert
            }

            this.files = program.map(file => this._getHandlebarsTemplateFile({
                code: file.code,
                filename: file.filename,
                isMain: Boolean(file.main),
                isInputFile: Boolean(file.inputFile),
                shouldShowContents: !file.inputFile || Boolean(file.showContents),
                language,
            }));
        }
        else {
            const filename = program.filename || languageToFilename[language];

            this.files = [ this._getHandlebarsTemplateFile({
                code: program,
                filename,
                isMain: true,
                language,
                shouldShowContents: true,
            }) ];
        }
    }

    /**
        Builds a handlebars template for a file.
        @private
        @method _getHandlebarsTemplateFile
        @param {Object} code An object containing the prefix, student code and postfix for a file.
        @param {String} filename The name of the file.
        @param {Boolean} isMain Whether the file is the main file.
        @param {String} language The programming language.
        @param {Boolean} shouldShowContents Whether the contents of the file should be shown to the user.
        @param {Boolean} [isInputFile=false] Whether it's an input file.
        @return {Object} An object containing the template of a coding file.
    */
    _getHandlebarsTemplateFile({ code, filename, isMain, language, shouldShowContents, isInputFile = false }) {
        const fileObject = {
            filename: HandlebarsComplete.compile(filename),
            isMain: isMain && !isInputFile,
            shouldShowContents,
        };

        // If |code| is a string, it doesn't have student code or postfix.
        if (typeof code === 'string') {
            const codeTemplate = HandlebarsComplete.compile(code);

            Object.assign(fileObject, {
                prefix: codeTemplate,
                student: HandlebarsComplete.compile(''),
                postfix: HandlebarsComplete.compile(''),
                code: codeTemplate,
                isEditable: false,
            });
        }
        else {
            const codePlaceholder = 'Your code goes here';
            const cCppJavaPlaceholderComment = `/* ${codePlaceholder} */`;
            const pythonPlaceholderComment = `''' ${codePlaceholder} '''`;
            const placeholder = language.includes('python') ? pythonPlaceholderComment : cCppJavaPlaceholderComment;

            const prefix = HandlebarsComplete.compile(code.prefix || '');
            const postfix = HandlebarsComplete.compile(code.postfix || '');
            const studentPlaceholder = code.student || placeholder;
            const student = HandlebarsComplete.compile(studentPlaceholder);
            const codeTemplate = HandlebarsComplete.compile(code.prefix + studentPlaceholder + code.postfix);

            Object.assign(fileObject, {
                prefix,
                student,
                postfix,
                code: codeTemplate,
                isEditable: true,
            });
        }

        return fileObject;
    }

    /**
        Returns the program as an array of files. Each file has been compiled using |parameters|.
        @method getRandomizedProgramFiles
        @param {Object} parameters The parameters that randomize the program.
        @param {Sk.module} [pythonModule=null] Python module with given code run through.
        @return {Array} An array of objects containing a randomized coding file.
    */
    getRandomizedProgramFiles(parameters, pythonModule = null) {
        return this.files.map(file => {
            let filename = file.filename(parameters);
            let prefix = file.prefix(parameters);
            let postfix = file.postfix(parameters);
            let student = file.student(parameters);
            let code = file.code(parameters);
            const replaceStringVariables = require('utilities').replaceStringVariables;

            if (pythonModule) {
                filename = replaceStringVariables(filename, pythonModule);
                prefix = replaceStringVariables(prefix, pythonModule);
                postfix = replaceStringVariables(postfix, pythonModule);
                student = replaceStringVariables(student, pythonModule);
                code = replaceStringVariables(code, pythonModule);
            }

            return {
                filename,
                prefix,
                student,
                postfix,
                code,
                isMain: file.isMain,
                isEditable: file.isEditable,
                shouldShowContents: file.shouldShowContents,
            };
        });
    }
}
