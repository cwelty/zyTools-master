/*
    InstructionController is a controller for an Instruction and stores the following:
        |instruction| is required and an Instruction.
        |instructionIndex| is required and a number.
        |domID| is required and a string.
        |instructionTemplate| is required and a function.
        |dropdownHTML| is required and an object of strings.
        |instructionFactory| is required and an InstructionFactory.
        |registerOptions| and |labelOptions| are required and an array of strings.
        |labels| is required and a Labels.
        |inputKeypressFunction| is optional and a function.
    @param {Boolean} [useTextNotInput=false] Whether to use plain text instead of an input.
    @param {Boolean} [useTextForOpcodes=false] Whether the opcodes should be rendered as text.
*/
function InstructionController(instruction, instructionIndex, domID, instructionTemplate,
                               dropdownHTML, instructionFactory, registerOptions, labelOptions,
                               labels, inputKeypressFunction, useTextNotInput = false, useTextForOpcodes = false) {
    this._instruction = instruction;
    this._instructionIndex = instructionIndex;
    this._domID = domID;
    this._instructionTemplate = instructionTemplate;
    this._dropdownHTML = dropdownHTML;
    this._instructionFactory = instructionFactory;
    this._registerOptions = registerOptions;
    this._labelOptions = labelOptions;
    this._labels = labels;
    this._inputKeypressFunction = inputKeypressFunction || null;
    this._useTextNotInput = useTextNotInput;
    this._useTextForOpcodes = useTextForOpcodes;

    this._render();
}

// Attach prototype functions to InstructionController.
function buildInstructionControllerPrototype() {
    /*
        Render then output the view.
        Attach a listener for change of instruction's operation code and properties.
    */
    InstructionController.prototype._render = function() {
        this.empty();
        this._addInstructionToDOM();
        this._setInstructionPropertiesOnView();
        this._addChangeListeners();
    };

    // Add |_instruction| to the DOM at |domID|.
    InstructionController.prototype._addInstructionToDOM = function() {
        var instructionHTML = this._instructionTemplate({
            instructionDropdown:   this._dropdownHTML.instructionDropdownHTML,
            registerDropdown:      this._dropdownHTML.registerDropdownHTML,
            labelDropdown:         this._dropdownHTML.labelDropdownHTML,
            instructionProperties: this._instruction._printProperties,
            useTextForOpcodes: this._useTextForOpcodes,
            opcode: this._instruction.opcode,
        });
        $('#' + this._domID).html(instructionHTML);
    };

    /**
        Set each |_instruction|'s properties on view.
        @method _setInstructionPropertiesOnView
        @private
        @return {void}
    */
    InstructionController.prototype._setInstructionPropertiesOnView = function() {
        $(`#${this._domID}`).find('select, input, span').each((index, property) => {
            const $property = $(property);
            const propertyValue = (index === 0) ? this._instruction.opcode : this._instruction.getPropertyByIndex(index - 1);

            if ($property.is('span.number')) {
                $property.text(propertyValue);
            }
            else if (!$property.is('span.text-opcode')) {
                $property.val(propertyValue);
            }
        });
    };

    // Listen for changes to the |_instruction|'s DOM.
    InstructionController.prototype._addChangeListeners = function() {
        var self = this;
        var $elements = $('#' + this._domID).find('select, input');
        $elements.change(function(event) {
            self._elementChanged(this);
        });

        var $inputs = $('#' + this._domID).find('input');
        $inputs.keypress(function(event) {
            self._elementChanged(this);
            if (!!self._inputKeypressFunction) {
                self._inputKeypressFunction(event);
            }
        });
    };

    /*
        |element| changed, so update the |_instruction| with the new |propertyValue|.
        |element| is required and a DOM object.
    */
    InstructionController.prototype._elementChanged = function(element) {
        const $elements = $(`#${this._domID}`).find('select, input, span');
        const elementIndex = $elements.index(element);
        const $element = $(element);
        let propertyValue = $element.is('span') ? $element.text() : $element.val();

        // Op code changed, so need to create new instruction.
        if (elementIndex === 0) {
            // Create new instruction then import previous instruction's properties.
            var newInstruction = this._instructionFactory.make(propertyValue);
            newInstruction.copyProperties(this._instruction, this._registerOptions);
            newInstruction.setLabels(this._labels);

            if (this._useTextNotInput) {
                newInstruction.useTextNotInput();
            }

            this._instruction = newInstruction;

            this._render();
        }
        // All other properties.
        else {
            // Convert input's value to a number.
            if ($element.is('input')) {
                propertyValue = Number(propertyValue);
            }
            this._instruction.setPropertyByIndex(elementIndex - 1, propertyValue);
        }
    };

    // Disable the select and input DOM elements.
    InstructionController.prototype.disable = function() {
        $('#' + this._domID).find('select, input').prop('disabled', true);
    };

    // Enable the select and input DOM elements.
    InstructionController.prototype.enable = function() {
        $('#' + this._domID).find('select, input').prop('disabled', false);
    };

    // Remove event listeners and view.
    InstructionController.prototype.empty = function() {
        $('#' + this._domID).empty();
    };

    // Return |_instruction|.
    InstructionController.prototype.getInstruction = function() {
        return this._instruction;
    };
}
