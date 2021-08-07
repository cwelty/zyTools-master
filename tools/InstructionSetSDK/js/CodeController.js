/*
    InstructionController stores an Instructions and DOM ID.
    |instructions| is required and an Instructions object.
    |domID| is required and a string.
    |toolID| is required and a string.
    |instructionsTemplate| is required and a function.
    |instructionTemplate| is required and a function.
    |selectTemplate| is required and a function.
    |instructionOptions| and |registerOptions| are required and an array of strings.
    |inputKeypressFunction| is optional and a function.
*/
function CodeController(instructions, domID, toolID, instructionsTemplate,
    instructionTemplate, selectTemplate, instructionOptions, registerOptions, inputKeypressFunction) {

    // Required parameters each have a value.
    if (!!instructions && !!domID && !!toolID && !!instructionsTemplate && !!instructionTemplate && !!selectTemplate && !!instructionOptions && !!registerOptions) {
        this._domID = domID;
        this._toolID = toolID;
        this._codeTemplate = instructionsTemplate;
        this._instructionTemplate = instructionTemplate;
        this._selectTemplate = selectTemplate;
        this._registerOptions = registerOptions;
        this._dropdownHTML = {};
        this._instructionControllers = [];
        this._labelOptions = [];
        this._disabledInstructions = [];
        this._inputKeypressFunction = inputKeypressFunction || null;
        this._useTextNotInput = false;
        this._useTextForOpcodes = false;

        this._updateDropDownHTML(instructionOptions);
        this._render(instructions);
    }
}

// Attach prototype functions to CodeController.
function buildCodeControllerPrototype() {
    // Inheriting object must specific an InstructionFactory that has a make function.
    CodeController.prototype.instructionFactory = null;

    /*
        Render then output the view.
        Create an InstructionController for each Instruction in |instructions|.
        |instructions| is required and an Instructions.
        |labels| is optional and a Labels object.
    */
    CodeController.prototype._render = function(instructions, labels) {
        labels = labels || new Labels();
        this.empty();

        var code = new Code(instructions, labels);
        var instructionsHTML = this._codeTemplate({
            hasNoLabels: (labels.length === 0),
            id:          this._toolID,
            // Convert |code| to a literal array for use with handlebars' #each.
            code:        code.slice()
        });
        $('#' + this._domID).html(instructionsHTML);

        var instructionIndicesInCode = code.map(function(lineOfCode, index) {
            // If the line of code has an instruction, return the index. Otherwise, return -1.
            return !!lineOfCode.instruction ? index : -1;
        }).filter(function(instructionIndex) {
            // Filter out -1.
            return (instructionIndex !== -1);
        });

        // Create an InstructionController for each |instruction|.
        var self = this;
        this._instructionControllers = instructions.map(function(instruction, index) {
            var instructionIndex = instructionIndicesInCode[index];
            return new InstructionController(
                instruction,
                instructionIndex,
                'instruction-' + instructionIndex + '-' + self._toolID,
                self._instructionTemplate,
                self._dropdownHTML,
                self.instructionFactory,
                self._registerOptions,
                self._labelOptions,
                labels,
                self._inputKeypressFunction,
                self._useTextNotInput,
                self._useTextForOpcodes
            );
        });
    };

    /**
        When rendering instructions with an input component, use a plain text instead.
        @method useTextNotInput
        @return {void}
    */
    CodeController.prototype.useTextNotInput = function() {
        this._useTextNotInput = true;
    };

    /**
        When rendering the opcodes, use text instead of a dropdown.
        @method useTextForOpcodes
        @return {void}
    */
    CodeController.prototype.useTextForOpcodes = function() {
        this._useTextForOpcodes = true;
    };

    /*
        Update the |instructions|, |instructionOptions|, and |registerOptions|.
        |instructions| is required and an Instructions object.
        |labels| is required and a Labels object.
        |instructionOptions|, |registerOptions|, and |labelOptions| are required and an array of strings.
        |disabledInstructions| is required and an array of numbers.
    */
    CodeController.prototype.update = function(instructions, labels, instructionOptions,
                                               labelOptions, registerOptions, disabledInstructions) {
        this._registerOptions = registerOptions;
        this._labelOptions = labelOptions;
        this._disabledInstructions = disabledInstructions;
        this._updateDropDownHTML(instructionOptions);
        this._render(instructions, labels);
    };

    /*
        Update |dropDownHMTL| with |instructionOptions| and |registerOptions|.
        |instructionOptions| is required and an array of strings.
    */
    CodeController.prototype._updateDropDownHTML = function(instructionOptions) {
        this._dropdownHTML.instructionDropdownHTML = this._selectTemplate({
            options: instructionOptions
        });
        this._dropdownHTML.registerDropdownHTML = this._selectTemplate({
            options: this._registerOptions
        });
        this._dropdownHTML.labelDropdownHTML = this._selectTemplate({
            options: this._labelOptions
        });
    };

    // Disable the |instructionControllers|.
    CodeController.prototype.disable = function() {
        this._instructionControllers.forEach(function(instructionController) {
            instructionController.disable();
        });
    };

    // Enable the |instructionControllers|.
    CodeController.prototype.enable = function() {
        var self = this;
        this._instructionControllers.forEach(function(instructionController, index) {
            // Enable |instructionController| if not in |_disabledInstructions|.
            if (self._disabledInstructions.indexOf(index) === -1) {
                instructionController.enable();
            }
        });
    };

    // Clear DOM for each InstructionController then CodeController.
    CodeController.prototype.empty = function() {
        // Clear DOM for each InstructionController in |instructionControllers|.
        this._instructionControllers.forEach(function(instructionController) {
            instructionController.empty();
        });
        this._instructionControllers.length = 0;

        $('#' + this._domID).empty();
    };

    // Return the instruction stored in each element of |_instructionControllers|.
    CodeController.prototype.getInstructions = function() {
        // Get Instruction from each InstructionController.
        var instructionsArray = this._instructionControllers.map(function(instructionController) {
            return instructionController.getInstruction();
        });

        // Convert |instructionsArray| to an Instructions.
        var instructionsObject = new Instructions();
        Array.prototype.push.apply(instructionsObject, instructionsArray);

        return instructionsObject;
    };
}
