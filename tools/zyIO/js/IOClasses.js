/*
    Each input needs the checkbox div |$checkbox|, the Label div |$label|, the value div |$variableLabel|, it's name |labelValue|, it's initial value |initValue|,
    a function that synchronizes the global variable that a user can use in actions and conditions |syncUserVariable|,
    and an outsideUpdate function |outsideUpdate| that will be called whenever the user updates the corresponding global variable in code (used to ensure inputs are not written to).
*/
var TRUE_COLOR, FALSE_COLOR;
function Input($checkBox, $label, $variableLabel, labelValue, initValue, syncUserVariable, outsideUpdate) {
    // Takes care of converting if value is boolean.
    this.value = initValue ? 1 : 0;
    this.$variableLabel = $variableLabel;
    this.$checkBox = $checkBox;
    this.$label = $label;
    this.labelValue = labelValue;
    this.syncUserVariable = syncUserVariable;
    this.outsideUpdate = outsideUpdate;
    this.$label.text(labelValue);
    this.$variableLabel.text(this.value);
    this.$checkBox.prop('checked', (this.value > 0));
    var self = this;
    var changed = function() {
        self.value = self.$checkBox.is(':checked');
        self.syncUserVariable(self.value ? 1 : 0);
        self.$variableLabel.text(self.value ? 1 : 0);
        self.$variableLabel.css('color', self.value ? TRUE_COLOR : FALSE_COLOR);
    };
    this.$checkBox.change(changed);
}

// Disables the checkbox for this input.
Input.prototype.disable = function() {
    this.$checkBox.prop('disabled', true);
};

// Enables the checkbox for this input.
Input.prototype.enable = function() {
    this.$checkBox.prop('disabled', false);
};

// Hides all of the ui elements associated with this input.
Input.prototype.hide = function() {
    this.$label.parent().hide();
};
/*
    Sets the value of an input to |value| insuring that the input's value will only be either 1 or 0.
    After doing so it updates the state of the checkbox and syncs with it's corresponding user facing variable.
*/
Input.prototype.setInput = function(value) {
    // Takes care of converting if value is boolean.
    this.value = value ? 1 : 0;
    this.syncUserVariable(this.value);
    this.$checkBox.prop('checked', (this.value > 0));
};

/*
    Class for inputs with multiple bits.
    |$id|, jquery object of the input tag for this input.
    |syncUserVariable|, function that updates the outside user variable.
    |outsideUpdate|, function is called when the outside variable has been updated and the ui needs to be synced.
*/
function ValueInput($id, syncUserVariable, outsideUpdate) {
    // Only allow valid 8 bit unsigned numbers to be entered.
    this.value = parseInt($id.val());
    $id.data('oldValue', $id.val());
    $id.on('keyup change', function(e) {
        var previousValue = $(this).data('oldValue');
        var value = $(this).val();
        // Check if number between 0 and 255.
        if ((value.match(/[0-9]+/)) && (parseInt(value) >= 0) && (parseInt(value) <= 255)) {
            previousValue = value;
            syncUserVariable(parseInt(value));
            $(this).data('oldValue', value);
            this.value = parseInt(value);
        }
        else {
            $(this).val(previousValue);
            $(this).select();
            this.value = parseInt(previousValue);
        }
    });
    this.outsideUpdate = function() {
        var updateValue = outsideUpdate();
        $id.data('oldValue', updateValue);
        $id.val(updateValue);
        this.value = updateValue;
    };
    this.syncUserVariable = syncUserVariable;
}

// Set the value of the input tag to be |value|, |value| is an integer
ValueInput.prototype.setInput = function(value) {
    this.value = value;
    this.syncUserVariable(this.value);
    this.outsideUpdate();
};

/*
    Class used for the combined decimal value of all inputs or outputs.
    |$id|, jquery object for the div.
    |name|, name of the decimal valued variable. ex. A
*/
function DecimalIO($id, name) {
    this.$id = $id;
    $id.text(name + ' = 0');
    this.value = 0;
    this.name = name;
}

// Sets the value of the div, |value| is an integer. ex. A = |value|
DecimalIO.prototype.setValue = function(value) {
    this.$id.text(this.name + ' = ' + value);
    this.value = value;
};

// Hides the associated div
DecimalIO.prototype.hide = function() {
    this.$id.hide();
};

/*
    Class for outputs with multiple bits.
    |$id|, jquery object of the input tag for this input.
    |syncUserVariable|, function that updates the outside user variable.
    |outsideUpdate|, function is called when the outside variable has been updated and the ui needs to be synced.
*/
function ValueOutput($id, syncUserVariable, outsideUpdate) {
    this.$id = $id;
    this.value = parseInt(this.$id.val());
    this.syncUserVariable = syncUserVariable;
    this.outsideUpdate = function() {
        var newValue = outsideUpdate();
        this.setOutput(newValue);
    };
}

// Set the value of the input tag to be |value|, |value| is an integer
ValueOutput.prototype.setOutput = function(value) {
    this.$id.val(value);
    this.value = parseInt(this.$id.val());
    this.syncUserVariable(this.value);
};

// Hides the associated div
ValueOutput.prototype.hide = function() {
    this.$id.hide();
};

/*
    Each output needs the LED div |$led|, the Label div |$label|, the value div |$variableLabel|, it's name |labelValue|, it's initial value |initValue|,
    a function that synchronizes the global variable that a user can use in actions and conditions |syncUserVariable|,
    and an outsideUpdate function |outsideUpdate| that will be called whenever the user updates the corresponding global variable in code
*/
function Output($led, $label, $variableLabel, labelValue, initValue, syncUserVariable, outsideUpdate) {
    // Takes care of converting if value is boolean.
    this.value = initValue ? 1 : 0;
    this.$variableLabel = $variableLabel;
    this.$led = $led;
    this.$label = $label;
    this.labelValue = labelValue;
    this.syncUserVariable = syncUserVariable;
    var self = this;
    this.outsideUpdate = function() {
        self.setOutput(outsideUpdate());
    };
    this.$label.text(labelValue);
    this.$variableLabel.text(initValue);
}

// Hides all ui elements for this output
Output.prototype.hide = function() {
    this.$label.parent().hide();
};

/*
    Sets the value of an output to |value| insuring that the output's value will only be either 1 or 0.
    After doing so it updates the state of the LED and syncs with it's corresponding user facing variable.
*/
Output.prototype.setOutput = function(value) {
    // Takes care of converting if value is boolean.
    this.value = value ? 1 : 0;
    this.syncUserVariable(this.value);
    if (this.value === 0) {
        this.$led.css('background-color', FALSE_COLOR);
        this.$variableLabel.css('color', FALSE_COLOR);
        this.$variableLabel.text('0');
    }
    else if (this.value === 1) {
        this.$led.css('background-color', TRUE_COLOR);
        this.$variableLabel.css('color', TRUE_COLOR);
        this.$variableLabel.text('1');
    }
};