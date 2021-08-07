'use strict';

/* exported Executor */
/* global NumericalInputComponent, NumericalOutputComponent, ExecutionStackElement, ExecutionContext, evaluateAbstractSyntaxTree,
          Randomizer, TextualCodeParser */

/**
    The execution engine that processes a program with input and output. The input and output are optional.
    @class Executor
*/
class Executor {

    /**
        @constructor
        @param {Program} code The program code from which to create an executor.
        @param {String} initialInput The initial input.
        @param {Boolean} isExecutable Whether the program should be executable.
        @param {Boolean} compileOnInit Whether the program should be compiled upon initialization.
    */
    constructor(code, initialInput, isExecutable, compileOnInit = true) {

        /**
            The code from which to make a program.
            @property code
            @type {String}
            @default null
        */
        this.code = null;

        /**
            The program to execute.
            @property program
            @type {Program}
            @default null
        */
        this.program = null;

        if (compileOnInit) {
            this.setProgramAndCodeFromCode(code);
        }
        else {
            this.code = code;
        }

        const isInputSet = (typeof initialInput === 'string');

        /**
            The input component for the program. Add input only if an initial input is given.
            @property input
            @type {NumericalInputComponent}
            @default null
        */
        this.input = isInputSet ? new NumericalInputComponent(initialInput) : null;

        /**
            The output component for the program. Add an output if the program is executable.
            @property output
            @type {NumericalOutputComponent}
            @default null
        */
        this.output = isExecutable ? new NumericalOutputComponent() : null;

        /**
            The call stack used during execution.
            @property stack
            @type {Array} of {ExecutionStackElement}
            @default []
        */
        this.stack = [];

        /**
            Instance of a seedable randomizer.
            @property randomizer
            @type {Randomizer}
        */
        this.randomizer = new Randomizer();
    }

    /**
        Set the program from the given code.
        @method setProgramAndCodeFromCode
        @param {String} code The code to make into a program.
        @return {void}
    */
    setProgramAndCodeFromCode(code) {

        // The code has already successfully compiled, so don't need to do so again.
        if ((this.code === code) && this.program) {
            return;
        }

        // Set |code| to the passed value and set |program| to default.
        this.code = code;
        this.program = null;

        const parser = new TextualCodeParser();

        this.program = parser.parse(code);
    }

    /**
        Prepare the executor for execution.
        @method enterExecution
        @return {void}
    */
    enterExecution() {
        const mainFunctionClone = this.program.functions[0].clone();

        this.stack.push(new ExecutionStackElement(mainFunctionClone, mainFunctionClone.flowchart.startNode));

        if (this.input) {
            this.input.initialize();
        }

        this.randomizer.initialize();
    }

    /**
        Tear down the execution.
        @method exitExecution
        @return {void}
    */
    exitExecution() {
        this.stack.length = 0;
        if (this.input) {
            this.input.editable();
        }
        if (this.output) {
            this.output.clear();
        }
    }

    /**
        Execute the node at the top of the stack.
        @method execute
        @return {ProgramFunction} The function at the top of the stack.
    */
    execute() {

        // Clear whether each memory cell has been written to.
        this.stack.forEach(element => {
            if (element.function.locals) {
                element.function.locals.clearWrittenTo();
            }
            if (element.function.parameters) {
                element.function.parameters.clearWrittenTo();
            }
            if (element.function.return) {
                element.function.return.clearWrittenTo();
            }
        });

        const topOfStack = this.stack[this.stack.length - 1];

        // Node to execute has functions that needs calling, so call the next function.
        if (topOfStack.node.nonBuiltInFunctionCalls.length) {
            const nextCall = topOfStack.node.nonBuiltInFunctionCalls[0];
            const currentFunction = topOfStack.function;
            const nextFunction = nextCall.function.clone();
            const argumentsList = nextCall.children.map(child =>
                evaluateAbstractSyntaxTree(child, this.makeExecutionContext(currentFunction))
            );

            nextFunction.setParametersDuringExecution(argumentsList);

            this.stack.push(new ExecutionStackElement(nextFunction, nextFunction.flowchart.startNode));
        }

        // Execute the node.
        else {
            const stackElement = this.stack.pop();
            const nextNode = stackElement.node.execute(this.makeExecutionContext(stackElement.function));

            stackElement.node.reset();

            // Push the next node onto the stack.
            if (nextNode) {
                this.stack.push(new ExecutionStackElement(stackElement.function, nextNode));
            }

            // No next node means a function return. Get the return value and pass to resolve the function call, if the stack isn't empty.
            else if (this.stack.length) {
                this.stack[this.stack.length - 1].node.resolveFunctionCall(stackElement.function.return[0]);
            }
        }

        return this.stack[this.stack.length - 1] && this.stack[this.stack.length - 1].function;
    }

    /**
        Make a context of the function, input, output, and randomizer.
        @method makeExecutionContext
        @param {ProgramFunction} programFunction The function that the context will include.
        @return {ExecutionContext} Context of the function, input, output, and randomizer.
    */
    makeExecutionContext(programFunction) {
        return new ExecutionContext(this.input, this.output,
            [ programFunction.parameters, programFunction.locals, programFunction.return ],
            this.randomizer
        );
    }

    /**
        Return whether there are any nodes left to execute.
        @method isExecutionDone
        @return {Boolean} Whether there are any nodes left to execute.
    */
    isExecutionDone() {
        return this.stack.length === 0;
    }

    /**
        Throw an error if the input is invalid.
        @method validateInput
        @return {void}
    */
    validateInput() {
        if (this.input) {
            this.input.validateUserInput();
        }
    }
}
