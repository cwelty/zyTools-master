// Note: Can't 'use strict' b/c eval() is needed.

/**
    User can re-arrange and run a set of instructions.
    @module ArrangeInst
    @return {void}
*/
class ArrangeInst { // eslint-disable-line strict

    /**
        Initialize the progression.
        @method init
        @param {String} id The unique identifier given to this module.
        @param {Object} parentResource A dictionary of functions given by the parent resource.
        @param {Object} options Options provided to the module. Options are defined in the README.md.
        @return {void}
    */
    init(id, parentResource, options) {

        <%= grunt.file.read(hbs_output) %>

        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;
        this.errorManager = require('zyWebErrorManager');
        this.variables = [ 'wage', 'hours', 'pay' ];
        this.programInstructions = [
            {
                code: 'wage = 10',
                sortable: false,
            },
            {
                code: 'hours = 40',
                sortable: false,
            },
            {
                code: 'pay = wage * hours',
                sortable: false,
            },
            {
                code: 'print pay',
                sortable: true,
            },
            {
                code: 'hours = 35',
                sortable: true,
            },
            {
                code: 'pay = wage * hours',
                sortable: true,
            },
        ];

        if (options) {
            if (options.variables || options.vars) {
                this.variables = options.variables || options.vars;
            }

            if (options.instructions || options.instrs) {
                this.programInstructions = options.instructions || options.instrs;
            }
        }

        const useNewStyling = (options && options.newVersion);
        const maxAllowedNumberOfInstructions = 6;

        if (this.programInstructions.length === 0) {
            this.errorManager.postError('arrangeInst tool requires at least 1 instruction');
        }
        else if (this.programInstructions.length > maxAllowedNumberOfInstructions) {
            this.errorManager.postError(`arrangeInst tool can only support up to ${maxAllowedNumberOfInstructions} instructions`);
        }

        // Convert |sortable| property in each element in |programInstructions| to be 'sortable' or 'unsortable'.
        this.programInstructions.forEach(instruction => {

            // Legacy support for instructions that had string |sortable| values.
            if (typeof instruction.sortable !== 'string') {
                instruction.sortable = instruction.sortable ? 'sortable' : 'unsortable';
            }
        });

        this.printedLines = 0;

        // Valid states are stopped, running.
        this.state = 'stopped';

        this.animationExecutionLength = 1000;

        const css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name].template({
            arrowURL: parentResource.getResourceURL('arrow.png', this.name),
            id,
            programInstructions: this.programInstructions,
            useNewStyling,
            variables: this.variables,
        });
        const $this = $(`#${id}`);

        $this.html(css + html);

        $this.find('.button').click(() => {
            this.runProgram();
        });

        $this.find('.sortable-list').sortable({
            items: '> li:not(.unsortable)',
            placeholder: 'empty-placeholder',
        });
    }

    /**
        Update the tool based on the state.
        @method updateState
        @private
        @param {String} state Whether the tool is running or stopped.
        @return {void}
    */
    updateState(state) {
        if (state === 'running') {
            $(`div[id$=-value${this.id}]`).remove();
            $(`[id ^=print][id $=${this.id}]`).remove();
            $(`#${this.id} .button`).addClass('disabled');
            $(`#${this.id} .sortable-list`).sortable('disable');
            this.printedLines = 0;
        }
        else if (state === 'stopped') {
            $(`#${this.id} .button`).removeClass('disabled');
            $(`#${this.id} .sortable-list`).sortable('enable');
        }
        this.state = state;
    }

    /**
        Run the program in the order that the user arranged instructions.
        @method runProgram
        @private
        @return {void}
    */
    runProgram() {
        if (this.state !== 'running') {
            this.updateState('running');

            // Make member of object so we can refer to in closures.
            this.time = 0;

            // Move to first instruction
            this.highlightLine(0, 0);
            $(`#${this.id} .line-highlight`).css('opacity', 1.0);

            let line = 0;

            this.programInstructions.forEach(() => {
                const halfSecondWait = 500;

                setTimeout((tool, currentLine) => {
                    if (tool.isToolStillThere()) {
                        tool.highlightLine(currentLine, halfSecondWait);
                    }
                }, this.time, this, line);

                this.time += this.animationExecutionLength;

                setTimeout((tool, currentLine) => {
                    if (tool.isToolStillThere()) {
                        tool.evaluateBlock(currentLine);
                    }
                }, this.time, this, line);

                this.time += this.animationExecutionLength;
                line++;
            });

            setTimeout(tool => {
                if (tool.isToolStillThere()) {
                    tool.updateState('stopped');
                }
            }, this.time, this);

            // Stringifies the instructions
            let instructionOrder = '';

            $(`#${this.id} .sortable-list span`).each(instruction => {
                instructionOrder += `${instruction.innerHTML}\n`;
            });

            if (!this.beenClicked) {
                this.parentResource.postEvent({
                    part: 0,
                    complete: true,
                    answer: instructionOrder,
                    metadata: {
                        event: 'arrange instructions tool clicked',
                    },
                });
                this.beenClicked = true;
            }
        }
    }

    /**
        Return whether the tool is still there.
        @method isToolStillThere
        @return {Boolean} Whether the tool is still there.
    */
    isToolStillThere() {
        return Boolean($(`#${this.id} .sortable-list li`).length);
    }

    /**
        Highlight the given line number.
        @method highlightLine
        @private
        @param {Number} line The line number to highlight.
        @param {Number} delay The time to wait before animating the highlight.
        @return {void}
    */
    highlightLine(line, delay) {
        const inst = $(`#${this.id} .sortable-list li`).eq(line);
        const heightOffset = 8;
        const instructionHeight = inst.height() + heightOffset;
        const topOffset = inst.position().top;
        const marginTop = parseInt(inst.css('margin-top'), 10);
        const changeInY = topOffset + (marginTop * 2) - (heightOffset / 2); // eslint-disable-line no-magic-numbers
        const $lineHighlight = $(`#${this.id} .line-highlight`);

        $lineHighlight.animate(
            {
                height: instructionHeight,
                top: changeInY,
            },
            delay
        );
    }

    /**
        Evaluate the instruction block at the given line number.
        @method evaluateBlock
        @private
        @param {Number} line The line number of the instruction to evaluate.
        @return {void}
    */
    evaluateBlock(line) {
        const instructionContainer = $(`#${this.id} .sortable-list span`)[line];
        const instruction = $(instructionContainer).text();
        const statements = instruction.split('\n');

        // Block contains multiple statements
        statements.forEach(statement => {
            this.evaluateLine(instructionContainer, statement);
        });
    }

    /**
        Evaluate the given instruction.
        @method evaluateLine
        @private
        @param {DOM} instruction The DOM reference to the instruction to evaluate.
        @param {String} text The instructions stored in text.
        @return {void}
    */
    evaluateLine(instruction, text) {
        const tokens = text.split(' ');
        let evaluationString = '';

        tokens.forEach(token => {
            const tokenIsANumber = (!isNaN(parseFloat(token)) && isFinite(token));
            const tokenIsAnOp = ([ '*', '**', '+', '-', '=', '==', '/', '//', '(', ')' ].indexOf(token) !== -1);

            if (tokenIsANumber || tokenIsAnOp) {
                evaluationString += `${token} `;
            }
            else if ((this.variables.indexOf(token) === -1) && (token !== 'print') && (token !== 'put')) {
                const errorMessage = `Unknown identifier ${token} in arrangeInst tool.`;

                this.errorManager.postError(errorMessage);
                throw Error(errorMessage);
            }
            else if ((token !== '') && (token !== 'print') && (token !== 'put')) {
                evaluationString += `${token}_${this.id} `;
            }
        });

        let result = null;

        try {
            result = eval(evaluationString); // eslint-disable-line no-eval
        }
        catch (error) {
            const errorMessage = `Could not eval() arrangeInst code: ${evaluationString}`;

            this.errorManager.postError(errorMessage);
            throw new Error(errorMessage);
        }

        const $instructionsContainer = $(`#${this.id} .instructions-container`);
        const leftMarginBuffer = 15;

        // Move the output to variable label or screen
        if ((text.indexOf('print') > -1) || (text.indexOf('put') > -1)) {
            const id = `print${this.printedLines}${this.id}`;

            $instructionsContainer.append(`<div id="${id}">${result}</div>`);

            const output = $(`#${id}`);

            output.addClass('printed-text');
            output.css({
                left: parseInt($(instruction).css('width'), 10) + leftMarginBuffer,
                top: $(instruction).position().top,
            });

            let changeInY = 0;
            const $destination = $(`#${this.id} .monitor-screen`);
            const instructionGapOffset = 10;
            const instructionHeightWithBorder = 16;

            if (output.offset().top < $destination.offset().top) {
                changeInY = output.offset().top - $destination.offset().top + (this.printedLines * instructionHeightWithBorder) + instructionGapOffset;
            }
            else {
                changeInY = $destination.offset().top + (this.printedLines * instructionHeightWithBorder) - output.offset().top + instructionGapOffset;
            }

            const changeInX = $destination.offset().left - output.offset().left + instructionGapOffset;

            output.animate({
                top: `+=${changeInY}px`,
                left: `+=${changeInX}px`,
            }, this.animationExecutionLength);
            this.printedLines += 1;
        }
        else {
            const leftHandSide = tokens[0];
            const id = `${leftHandSide}-value${this.id}`;

            $('div').remove(`#${id}`);
            $instructionsContainer.append(`<div id="${id}">${result}</div>`);

            const output = $(`#${id}`);

            output.addClass('result');
            output.css({
                left: parseInt($(instruction).css('width'), 10) + leftMarginBuffer,
                top: $(instruction).position().top,
            });

            let changeInY = 0;
            const targetLabel = $(`#${leftHandSide}-label-${this.id}`);

            if (output.offset().top < targetLabel.offset().top) {
                changeInY = output.offset().top - targetLabel.offset().top;
            }
            else {
                changeInY = targetLabel.offset().top - output.offset().top;
            }

            const topOffset = 2;

            changeInY += topOffset;

            const changeInX = targetLabel.offset().left - output.offset().left +
                     parseInt($(`#${leftHandSide}-label-${this.id} span`).css('width'), 10) + 10; // eslint-disable-line no-magic-numbers

            output.animate({
                top: `+=${changeInY}px`,
                left: `+=${changeInX}px` },
                this.animationExecutionLength
            );
        }
    }
}

module.exports = {
    create: function() {
        return new ArrangeInst();
    },
    dependencies: <%= grunt.file.read(dependencies) %>,
};
