'use strict';

/* exported ProgramFunction */
/* global lookupMemoryCellFromVariableLists, nodeHasBuiltInFunctions */

/**
    Model a program function, storing the function's name, flowchart, parameters, return value, and local variables.
    @class ProgramFunction
*/
class ProgramFunction {

    /**
        @constructor
        @param {String} name The name of the function.
        @param {Variables} locals The function's local variables.
        @param {Variables} parameters The function's parameters.
        @param {Variables} _return The function's return value.
    */
    constructor(name, locals, parameters, _return) {

        /**
            The name of the function.
            @property name
            @type {String}
        */
        this.name = name;

        /**
            The function's local variables.
            @property locals
            @type {Variables}
        */
        this.locals = locals;

        /**
            The function's parameters.
            @property parameters
            @type {Variables}
        */
        this.parameters = parameters;

        /**
            The function's return value.
            @property return
            @type {Variables}
        */
        this.return = _return;

        /**
            The function's flowchart.
            @property flowchart
            @type {Flowchart}
        */
        this.flowchart = null;

        /**
            Whether this function was injected or parsed from user code.
            @property wasFunctionInjected
            @type {Boolean}
            @default false
        */
        this.wasFunctionInjected = false;
    }

    /**
        Return whether this is a built-in function.
        @method isBuiltIn
        @return {Boolean} Whether this is a built-in function.
    */
    isBuiltIn() {
        return false;
    }

    /**
        Return a clone of this function.
        @method clone
        @return {ProgramFunction} A clone of this function.
    */
    clone() {
        const localsClone = this.locals.clone();
        const parametersClone = this.parameters.clone();
        const returnClone = this.return.clone();
        const arrayOfVariables = [ localsClone, parametersClone, returnClone ];
        const clone = new ProgramFunction(
            this.name,
            localsClone,
            parametersClone,
            returnClone
        );

        clone.flowchart = this.flowchart.clone(arrayOfVariables);

        return clone;
    }

    /**
        Copy the values of the argument list to the parameters during execution.
        @method setParametersDuringExecution
        @param {Array} argumentList Array of {Variable}. The list of arguments to copy by value to the parameters.
        @return {void}
    */
    setParametersDuringExecution(argumentList) {
        argumentList.forEach((argumentVariable, index) => {
            const parameterVariable = this.parameters[index];
            const arrayOfVariables = [ this.locals, this.parameters, this.return ];

            if (parameterVariable.isArray()) {
                argumentVariable.copyMemoryCellValuesTo(parameterVariable, true, true);
            }
            else {
                parameterVariable.setValueDuringExecution(argumentVariable.getValue(arrayOfVariables));
            }
        });
    }

    /**
        Lookup the value of the given variable.
        @method getVariableValueByName
        @param {String} variableName The variable name to look up.
        @return {String} The value of the given variable.
    */
    getVariableValueByName(variableName) {
        const arrayOfVariables = [ this.locals, this.parameters, this.return ];
        const memoryCell = lookupMemoryCellFromVariableLists(variableName, arrayOfVariables);

        return String(memoryCell);
    }

    /**
        Set whether the function was injected.
        @method setWasFunctionInjected
        @param {Boolean} wasFunctionInjected Whether the function was injected.
        @return {void}
    */
    setWasFunctionInjected(wasFunctionInjected) {
        this.wasFunctionInjected = wasFunctionInjected;
    }

    /**
        Return whether some variable is an array.
        @method hasArray
        @return {Boolean} Whether some variable is an array.
    */
    hasArray() {
        return this.locals.hasArray() || this.parameters.hasArray() || this.return.hasArray();
    }

    /**
        Return whether this function uses particular built-in functions.
        @method usesBuiltInFunctions
        @param {Array} functions Array of {String}. The built-in functions to find.
        @return {Boolean} Whether this function uses a built-in math function.
    */
    usesBuiltInFunctions(functions) {
        return this.flowchart.prefixOrder.some(node => nodeHasBuiltInFunctions(node, functions));
    }

    /**
        Return a string of the ported variable declaration.
        @method makePortedVariableDeclaration
        @param {Variable} variable The variable to declare.
        @param {String} language The language to port to.
        @return {String} The ported variable declaration.
    */
    makePortedVariableDeclaration(variable, language) {
        let declaration = `${variable.getPortedDataType(language)} ${variable.name}`;

        if (variable.isArray()) {
            const size = variable.sizeCell.getValue();

            if (size !== '?') {
                declaration += `(${size})`;
            }
        }

        return declaration;
    }

    /**
        Build the ported function header code.
        @method buildPortedFunctionHeader
        @param {PortedCode} portedCode The ported code.
        @param {String} language The language to port to.
        @return {String} The ported function name.
    */
    buildPortedFunctionHeader(portedCode, language) {

        // C++'s main() is lowercase.
        const portedFunctionName = this.name === 'Main' ? 'main' : this.name;

        // Decide on return type.
        let functionReturnType = 'void';

        if (portedFunctionName === 'main') {
            functionReturnType = 'int';
        }
        else if (this.return[0]) {
            functionReturnType = this.return[0].getPortedDataType(language);
        }

        // Build parameter list.
        const parameterList = this.parameters.map(parameter => this.makePortedVariableDeclaration(parameter, language)).join(', ');

        // Add function header.
        portedCode.add(`${functionReturnType} ${portedFunctionName}(${parameterList}) {`);

        return portedFunctionName;
    }

    /**
        Make a variable declaration.
        @method makeVariableDeclaration
        @param {Variable} variable The variable to declare.
        @param {String} language The language in which to declare as.
        @param {String} indentation How much to indent the declaration.
        @return {String} The variable declaration.
    */
    makeVariableDeclaration(variable, language, indentation) {
        return `${indentation}${this.makePortedVariableDeclaration(variable, language)};`;
    }

    /**
        Build the ported local variables.
        @method buildPortedLocalVariables
        @param {PortedCode} portedCode The ported code.
        @param {String} language The language to port to.
        @param {String} indentation One indentation of whitespace.
        @return {void}
    */
    buildPortedLocalVariables(portedCode, language, indentation) {

        // Port the local and return variables.
        const portedLocals = this.locals.map(local => this.makeVariableDeclaration(local, language, indentation));
        const portedReturn = this.return[0] ? this.makeVariableDeclaration(this.return[0], language, indentation) : [];
        const portedDeclarations = portedLocals.concat(portedReturn);
        const portedDeclarationsString = portedDeclarations.map(port => `\n${port}`).join('');

        portedCode.add(portedDeclarationsString);
    }

    /**
        Build the ported function statements.
        @method buildPortedFunctionStatements
        @param {PortedCode} portedCode The ported code.
        @param {String} language The language to port to.
        @param {String} indentation One indentation of whitespace.
        @return {Object} Containing the EndNode and second node in the prefix order.
    */
    buildPortedFunctionStatements(portedCode, language, indentation) {
        return this.flowchart.buildPortedCode(
            portedCode, language, indentation, this.wasFunctionInjected
        );
    }

    /**
        Build the function return statement.
        @method buildPortedFunctionReturnStatement
        @param {PortedCode} portedCode The ported code.
        @param {String} indentation One indentation of whitespace.
        @param {String} portedFunctionName The name of this function after porting.
        @return {void}
    */
    buildPortedFunctionReturnStatement(portedCode, indentation, portedFunctionName) {
        let returnValue = '';

        if (portedFunctionName === 'main') {
            returnValue = '0';
        }
        else if (this.return.length) {
            returnValue = this.return[0].name;
        }
        const afterReturn = returnValue ? ` ${returnValue}` : '';

        // Build the return code.
        portedCode.add(`\n\n${indentation}return${afterReturn};`);
    }

    /**
        Build the Coral function ported to the given language.
        @method buildPortedCode
        @param {PortedCode} portedCode The ported code.
        @param {String} language The language to port to.
        @return {void}
    */
    buildPortedCode(portedCode, language) {
        const languageToIndentation = {
            'C++': '   ',
        };
        const indentation = languageToIndentation[language];
        const portedFunctionName = this.buildPortedFunctionHeader(portedCode, language);
        const variableNames = this.return.concat(this.locals).concat(this.parameters).map(variable => variable.name);
        const reservedName = variableNames.find(name => require('utilities').cppReservedWords.includes(name));

        if (reservedName) {
            throw new Error(`${reservedName} is a reserved C++ word, so a different variable name should be used.`);
        }

        this.buildPortedLocalVariables(portedCode, language, indentation);

        const { endNode, secondNode } = this.buildPortedFunctionStatements(portedCode, language, indentation);

        this.buildPortedFunctionReturnStatement(portedCode, indentation, portedFunctionName);

        // Point EndNode to the return statement.
        endNode.portedLine.lineNumber = portedCode.numberOfLines();
        endNode.portedLine.startIndexOfSegment = 0;
        endNode.portedLine.endIndexOfSegment = portedCode.lengthOfLastLine() - 1;

        // Point StartNode to the second node, which may be the EndNode.
        this.flowchart.startNode.portedLine.lineNumber = secondNode.portedLine.lineNumber;

        // Add function's closing brace.
        portedCode.add('\n}');
    }
}
