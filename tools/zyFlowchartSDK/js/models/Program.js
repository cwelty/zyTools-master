'use strict';

/* global PortedCode, builtInMathFunctionNames, builtInRandomFunctionNames */
/* exported Program */

/**
    Model a program, which stores a list of functions.
    @class Program
*/
class Program {

    /**
        @constructor
        @param {Array} functions Array of {ProgramFunctions}. The list of functions defining this program.
    */
    constructor(functions) {

        /**
            The list of functions defining this program.
            @property functions
            @type {Array} of {ProgramFunctions}
        */
        this.functions = functions;

        /**
            The ported code for this program.
            @property portedCode
            @type {PortedCode}
            @default null
        */
        this.portedCode = null;
    }

    /**
        Build the header code.
        @method buildPortedProgramHeaderCode
        @param {PortedCode} portedCode The ported code.
        @return {void}
    */
    buildPortedProgramHeaderCode(portedCode) {
        const headers = [ '#include <iostream>' ];
        const usesBuiltInMath = this.functions.some(programFunction => programFunction.usesBuiltInFunctions(builtInMathFunctionNames));
        const usesBuiltInRandom = this.functions.some(programFunction => programFunction.usesBuiltInFunctions(builtInRandomFunctionNames));
        const hasArray = this.functions.some(programFunction => programFunction.hasArray());

        if (usesBuiltInMath) {
            headers.push('#include <cmath>');
        }

        if (usesBuiltInRandom) {
            throw new Error('SeedRandomNumbers() and RandomNumber() not supported when porting to C++.');
        }

        if (hasArray) {
            headers.push('#include <vector>');
        }

        headers.push('using namespace std;');
        portedCode.add(headers.join('\n'));
    }

    /**
        Return the Coral program ported in the given language.
        @method getPortedCode
        @param {String} language The language to port to.
        @return {String} The code in the ported language.
    */
    getPortedCode(language) {
        const supportedLanguages = [ 'C++' ];

        if (!supportedLanguages.includes(language)) {
            throw new Error(`Unsupported portLanguage: ${language}`);
        }

        if (!this.portedCode) {
            const portedCode = new PortedCode();

            this.buildPortedProgramHeaderCode(portedCode);

            // Check if any function are using reserved C++ names.
            const reservedName = this.functions.map(programFunction => programFunction.name)
                                               .find(name => require('utilities').cppReservedWords.includes(name));

            if (reservedName) {
                throw new Error(`${reservedName} is a reserved C++ word, so a different function name should be used.`);
            }

            // Sort functions from lowest line number to highest line number, so ported code matches original Coral.
            const functionSortedByLineNumber = this.functions.slice();

            functionSortedByLineNumber.sort((first, second) => {
                const firstLineNumber = first.flowchart.startNode.line.lineNumber;
                const secondLineNumber = second.flowchart.startNode.line.lineNumber;

                return firstLineNumber - secondLineNumber;
            });

            functionSortedByLineNumber.forEach(programFunction => {
                portedCode.add('\n\n');
                programFunction.buildPortedCode(portedCode, language);
            });

            this.portedCode = portedCode;
        }

        return this.portedCode.code;
    }
}
