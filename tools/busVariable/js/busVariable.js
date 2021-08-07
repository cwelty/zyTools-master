function BusVariable() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        const showMemory = options && options.showmemory;
        const useVariables = options && options.useVariables;

        this.startingInstructions = 'You are driving a bus. \nThe bus starts with 5 people.';

        this.instructionArray = [
            { instructions: '3 people get on', startVal: '5', endVal: '8', error: '5 + 3 = ?' },
            { instructions: '2 people get off', startVal: '8', endVal: '6', error: '8 - 2 = ?' },
            { instructions: '4 people get off', startVal: '6', endVal: '2', error: '6 - 4 = ?' },
            { instructions: '5 people get on', startVal: '2', endVal: '7', error: '2 + 5 = ?' },
            { instructions: '4 people get on', startVal: '7', endVal: '11', error: '7 + 4 = ?' }
        ];

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        const html = this[this.name]['busVariable']({ id, showMemory, useVariables });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.instructionArray.length,
            start: function() {
                $('#numPeople_' + self.id).attr('disabled', false);
                self.addInstructionsFromStartToCurr(0);
            },
            reset: function() {
                $('#instructions_' + self.id).text(self.startingInstructions);
                $('#numPeople_' + self.id).val(self.instructionArray[0].startVal);
                $('#numPeople_' + self.id).attr('disabled', true);
            },
            next: function(currentQuestion) {
                $('#numPeople_' + self.id).attr('disabled', false);
                self.addInstructionsFromStartToCurr(currentQuestion);
                $('#numPeople_' + self.id).select();
            },
            isCorrect: function(currentQuestion) {
                $('#numPeople_' + self.id).attr('disabled', true);
                var isAnswerCorrect = false;

                self.progressionTool.userAnswer = $('#numPeople_' + self.id).val();
                self.progressionTool.expectedAnswer = self.instructionArray[currentQuestion].endVal;

                if (self.progressionTool.userAnswer === self.progressionTool.expectedAnswer) {
                    isAnswerCorrect = true;
                    self.progressionTool.explanationMessage = 'Correct';
                } else {
                    isAnswerCorrect = false;
                    self.progressionTool.explanationMessage = self.instructionArray[currentQuestion].error;
                }

                return isAnswerCorrect;
            }
        });

        $('#instructions_' + this.id).text(this.startingInstructions);
        $('#numPeople_' + this.id).val(this.instructionArray[0].startVal);
        $('#numPeople_' + this.id).attr('disabled', true);

        $('#numPeople_' + this.id).keypress(function(event) {
            if (event.keyCode === 13) { // enter pressed
                self.progressionTool.check();
            }
        });
    };

    this.addInstructionsFromStartToCurr = function(currentQuestion) {
        var instrsToCurr = this.startingInstructions;
        for(var i = 0; i <= currentQuestion; i++) {
            instrsToCurr += '\n' + this.instructionArray[i].instructions;
        }
        $('#instructions_' + this.id).text(instrsToCurr);
        $('#numPeople_' + this.id).val(this.instructionArray[currentQuestion].startVal);
        $('#numPeople_' + this.id).focus();
    };

    this.reset = function() {
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var busVariableExport = {
    create: function() {
        return new BusVariable();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = busVariableExport;
