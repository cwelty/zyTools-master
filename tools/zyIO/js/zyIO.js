function zyIO() {
    this.ioType = {
        BIT: 0,
        VALUE: 1
    };

    this.init = function(containerID, options, finishedCallback) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = containerID;
        var self = this;
        this.utilities = require('utilities');
        TRUE_COLOR = this.utilities.zyanteGreen;
        FALSE_COLOR = this.utilities.zyanteMediumRed;
        var bits = [];
        var values = [];
        var IOsToMake = [];
        if (options.isInput) {
            IOsToMake = options.inputs;
        }
        else {
            IOsToMake = options.outputs;
        }
        IOsToMake.forEach(function(value) {
            if (value && (value.type === self.ioType.BIT)) {
                bits.push(value);
            }
            else if (value) {
                values.push(value);
            }
        });
        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html;            
        if (options.isInput) {
            html = this[this.name]['input']({
                id: containerID,
                bitInputs: bits,
                valueInputs: values,
                input: options.input
            });
        }
        else {
            html = this[this.name]['output']({
                id: containerID,
                bitOutputs: bits,
                valueOutputs: values,
                output: options.output
            });
        }
        $('#' + this.id).addClass('zyIO').html(css + html);
        this.bits = [];
        bits.forEach(function(elementValue, i) {
            var newIO;
            var name = elementValue.name;
            var value = elementValue.value;
            var synchVariable = elementValue.syncUserVariable;
            var outsideUpdate = elementValue.outsideUpdate;
            if (options.isInput) {
                var $checkbox = $('#input-' + i + self.id);
                var $label = $('#in-label-' + i + self.id);
                var $variableLabel = $('#value-' + i + self.id);
                newIO = new Input($checkbox, $label, $variableLabel, name, value, synchVariable, outsideUpdate);
            }
            else {
                var $led = $('#output-' + i + self.id);
                var $label = $('#out-label-' + i + self.id);
                var $variableLabel = $led.next();
                newIO = new Output($led, $label, $variableLabel, name, value, synchVariable, outsideUpdate);
            }
            self.bits.push(newIO);
        });
        this.values = [];
        values.forEach(function(elementValue, i) {
            if (options.isInput) {
                self.values.push(new ValueInput($('#value-input-' + i + self.id), elementValue.syncUserVariable, elementValue.outsideUpdate));
            }
            else {
                self.values.push(new ValueOutput($('#value-output-' + i + self.id), elementValue.syncUserVariable, elementValue.outsideUpdate));
            }
        });
        if (options.isInput) {
            this.decimalInput = new DecimalIO($('#input-dec-' + this.id), options.input);
            this.bitInputs = this.bits;
            this.valueInputs = this.values
        }
        else {
            this.decimalOutput = new DecimalIO($('#output-dec-' + this.id), options.output);
            this.bitOutputs = this.bits;
            this.valueOutputs = this.values;
        }
        if (finishedCallback) {
            finishedCallback(); 
        }
    }
    <%= grunt.file.read(hbs_output) %>
}

var zyIOExport = {
    create: function() {
        return new zyIO();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
}
module.exports = zyIOExport;
