function BinaryCount() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.values = [
            { decimal: 0, binary: '000' },
            { decimal: 1, binary: '001' },
            { decimal: 2, binary: '010' },
            { decimal: 3, binary: '011' },
            { decimal: 4, binary: '100' },
            { decimal: 5, binary: '101' },
            { decimal: 6, binary: '110' },
            { decimal: 7, binary: '111' },
        ];

        this.useMultipleParts = false;
        if (options && options.useMultipleParts) {
            this.useMultipleParts = true;
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['binaryCount']({ id: this.id, values: this.values });

        this.progressionTool = require('progressionTool').create();
        var self = this;
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: this.values.length,
            useMultipleParts: this.useMultipleParts,
            useTimer: true,
            start: function() {
                self.makeLevel(0);
            },
            reset: function() {
                self.$binaryInput.hide();
                self.$binaryLabel.show();
            },
            next: function(currentQuestion) {
                self.makeLevel(currentQuestion);
            },
            isCorrect: function(currentQuestion) {
                var isAnswerCorrect = false;

                self.progressionTool.userAnswer = self.$binaryInput.eq(currentQuestion).val();
                self.progressionTool.expectedAnswer = self.values[currentQuestion].binary;

                if (self.progressionTool.userAnswer === self.progressionTool.expectedAnswer) {
                    isAnswerCorrect = true;
                    self.progressionTool.explanationMessage = 'Correct.';
                } else {
                    // If user does not enter anything, then inform user to do so.
                    if (self.progressionTool.userAnswer.split(' ').join('') === '') {
                        self.progressionTool.explanationMessage = 'Enter 3 bits.';
                    } else {
                        // If first question is wrong, tell user to enter zero in 3-bits
                        if (currentQuestion === 0) {
                            self.progressionTool.explanationMessage = self.progressionTool.userAnswer + ' is not zero in 3-bit binary.';
                        } else {
                            self.progressionTool.explanationMessage = self.progressionTool.userAnswer + ' does not come after ' + self.values[currentQuestion - 1].binary + '.';
                        }
                    }
                }

                self.disableAllInputs();

                return isAnswerCorrect;
            }
        });

        this.$binaryInput = $('#' + this.id + ' .binary input');
        this.$binaryLabel = $('#' + this.id + ' .binary div');

        this.$binaryInput.hide();

        this.$binaryInput.keypress(function(event) {
            // enter pressed
            if (event.keyCode === 13) {
                self.progressionTool.check();
            }
        });
    };

    // Disable all input fields in tool
    this.disableAllInputs = function() {
        this.$binaryInput.attr('disabled', true);
    };

    // Hide the binary labels and show current question's input, based on |currentQuestionNumber|.
    // |currentQuestionNumber| is a number.
    this.makeLevel = function(currentQuestionNumber) {
        this.$binaryLabel.hide();

        // Show and enable this question's binary input
        var $currentQuestionBinaryInput = this.$binaryInput.eq(currentQuestionNumber);
        $currentQuestionBinaryInput.show();
        $currentQuestionBinaryInput.val('').attr('disabled', false);
        $currentQuestionBinaryInput.focus();
    };

    <%= grunt.file.read(hbs_output) %>
}

var binaryCountExport = {
    create: function() {
        return new BinaryCount();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = binaryCountExport;
