function updateArrVal() {
    this.init = function(id, parentResource, options) {
        this.name = '<%= grunt.option("tool") %>';
        this.id = id;
        this.parentResource = parentResource;

        this.useZeroIndexing = false;
        if (options && options.useZeroIndexing) {
            this.useZeroIndexing = true;
        }

        this.numberOfAddresses = 7;
        this.addressIndexes = [];
        for (var i = 0; i < this.numberOfAddresses; i++) {
            var indexToUse = this.useZeroIndexing ? i : (i + 1);
            this.addressIndexes.push(indexToUse);
        }

        var css = '<style><%= grunt.file.read(css_filename) %></style>';
        var html = this[this.name]['updateArrVal']({ id: this.id, addressIndexes: this.addressIndexes });

        var self = this;
        this.progressionTool = require('progressionTool').create();
        this.progressionTool.init(this.id, this.parentResource, {
            html: html,
            css: css,
            numToWin: 6,
            useMultipleParts: options && options.useMultipleParts,
            start: function() {
                self.makeLevel(0);
            },
            reset: function() {
                self.$correctMemTable.css('visibility', 'hidden');
                self.$instructions.text('Update myItems with the given code.');
                self.$correctMemTableTitle.html('');
                self.arrayUpdate_disableMemDataEdit();
            },
            next: function(currentQuestion) { // tool specific behavior when "Next" button clicked
                self.makeLevel(currentQuestion);
            },
            isCorrect: function(currentQuestion) { // tool specific behavior to determine whether an answer is correct when the "Check" button clicked
                var isAnswerCorrect = self.arrayUpdate_isCorrect();

                self.arrayUpdate_disableMemDataEdit();

                self.progressionTool.userAnswer = JSON.stringify(self.arrayUpdate_initMem);
                self.progressionTool.expectedAnswer = JSON.stringify(self.arrayUpdate_corrMem);

                if (isAnswerCorrect) {
                    self.progressionTool.explanationMessage = 'Correct.';
                } else {
                    self.arrayUpdate_setCorrMem();
                    self.$correctMemTable.css('visibility', 'visible');
                    self.$correctMemTableTitle.html('Solution');
                    self.progressionTool.explanationMessage = 'Oops, check the solution.';
                }

                return isAnswerCorrect;
            }
        }); // progression tool init ends here.

        // Caching
        this.$correctMemTable = $('#arrayUpdate_corrMemTable' + this.id);
        this.$arrayUpdateMemory = $('#' + this.id + ' div[id^=arrayUpdate_mem]');
        this.$arrayUpdateMemoryData = $('#' + this.id + ' .memory-data-student');
        this.$arrayUpdateCorrectMemoryData = $('#' + this.id + ' .memory-data [id^=arrayUpdate_corrMem]');
        this.$instructions = $('#arrayUpdate_instructions' + this.id);
        this.$correctMemTableTitle = $('#arrayUpdate_explanation' + this.id);

        // Inits
        this.arrayUpdate_randomizeMemData();
        this.$correctMemTable.css('visibility', 'hidden');
        this.editableIcon = this.parentResource.getResourceURL('editIcon.jpg', this.name);

        // Listeners
        this.$arrayUpdateMemory.keydown(function(e) {
            if (e.which == 13) { // enter key released
                self.progressionTool.checkButtonClick();
                return false;
            }
        });

        this.$arrayUpdateMemory.click(function(e) {
            var element = e.target;

            // If the element is editable, then select the text
            if ($(element).attr('contentEditable') === 'true') {
                var range = document.createRange();
                range.selectNodeContents(element);
                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    };

    // ---------- Tool specific data arrays ---------- //
    this.arrayUpdate_initMem = [];
    this.arrayUpdate_corrMem = [];
    // ---------------------------------------------- //

    // ---------- Tool specific custom functions ---------- //
    this.arrayUpdate_randomizeMemData = function() {
        var randData;
        var self = this;
        this.arrayUpdate_initMem.length = 0;
        this.$arrayUpdateMemoryData.each(function() {
            randData = Math.floor(Math.random() * 100);
            randData = randData.toString();
            $(this).html(randData);
            self.arrayUpdate_initMem.push(randData);
        });
    };

    this.arrayUpdate_copyMemData = function() {
        var self = this;
        self.arrayUpdate_corrMem.length = 0;
        this.$arrayUpdateMemoryData.each(function(i) {
            self.arrayUpdate_corrMem.push($(this).html());
        });
    };

    this.arrayUpdate_assignInt = function() {
        var index = Math.floor(Math.random() * 7);   // randomize 0 - 6
        var newVal = Math.floor(Math.random() * 100); // randomize 0 - 99
        var indexToDisplay = this.useZeroIndexing ? index : (index + 1);
        newVal = newVal.toString();

        this.$instructions.html('Update myItems with<br/>myItems[' + indexToDisplay + '] = ' + newVal);

        this.arrayUpdate_copyMemData();

        this.arrayUpdate_corrMem[index] = newVal;
    };

    this.arrayUpdate_assignOneToAnother = function() {
        var firstIndex = Math.floor(Math.random() * 7);  // randomize 0 - 6
        var secondIndex;
        do {
            secondIndex = Math.floor(Math.random() * 7); // randomly pick second index that cannot be first index
        } while (firstIndex === secondIndex);

        var firstIndexToDisplay = this.useZeroIndexing ? firstIndex : (firstIndex + 1);
        var secondIndexToDisplay = this.useZeroIndexing ? secondIndex : (secondIndex + 1);

        // assign first index to second index
        this.$instructions.html('Update myItems with<br/>myItems[' + secondIndexToDisplay + '] = myItems[' + firstIndexToDisplay + ']');

        this.arrayUpdate_copyMemData();

        this.arrayUpdate_corrMem[secondIndex] = this.arrayUpdate_corrMem[firstIndex];
    };

    this.arrayUpdate_assignUpdateVal = function() {
        var index = Math.floor(Math.random() * 7);     // randomize 0 - 6
        var updatedVal = Math.floor(Math.random() * 9) + 1; // randomize 1 - 9
        var indexToDisplay = this.useZeroIndexing ? index : (index + 1);

        this.$instructions.html('Update myItems with<br/>myItems[' + indexToDisplay + '] = myItems[' + indexToDisplay + '] + ' + updatedVal);

        this.arrayUpdate_copyMemData();

        this.arrayUpdate_corrMem[index] = (parseInt(this.arrayUpdate_corrMem[index]) + parseInt(updatedVal)).toString();
    };

    this.arrayUpdate_isCorrect = function() {
        var isCorrect = true;
        var self = this;
        this.$arrayUpdateMemoryData.each(function(i) {
            var userResponse = $(this).text();
            userResponse = userResponse.trim();

            if (userResponse !== self.arrayUpdate_corrMem[i]) {
                isCorrect = false;
            }
        });

        return isCorrect;
    };

    this.arrayUpdate_setCorrMem = function() {
        var self = this;
        this.$arrayUpdateCorrectMemoryData.each(function(i) {
            var $this = $(this);
            if (self.arrayUpdate_initMem[i] === self.arrayUpdate_corrMem[i]) {
                $this.html(self.arrayUpdate_corrMem[i]);
                $this.css('background-color', 'rgba(0, 0, 0, 0)');
            } else {
                $this.html(self.arrayUpdate_corrMem[i]);
                $this.css('background-color', 'rgb(200, 200, 200)');
            }
        });
    };

    this.arrayUpdate_enableMemDataEdit = function() {
        var self = this;
        this.$arrayUpdateMemoryData.each(function(i) {
            var $this = $(this);
            $this.attr('contenteditable', 'true');
            $this.parent().addClass('memory-data-editable').css('background-image', 'url(' + self.editableIcon + ')');
        });
    };

    this.arrayUpdate_disableMemDataEdit = function() {
        this.$arrayUpdateMemoryData.each(function(i) {
            var $this = $(this);
            $this.attr('contenteditable', 'false');
            $this.parent().removeClass('memory-data-editable').css('background-image', '');
        });
    };

    this.makeLevel = function(currentQuestion) {
        this.$correctMemTable.css('visibility', 'hidden');
        this.$correctMemTableTitle.html('');
        this.arrayUpdate_randomizeMemData();
        this.arrayUpdate_enableMemDataEdit();

        switch (currentQuestion) {
            case 0:
            case 1:
                this.arrayUpdate_assignInt(); // e.g., myItems[1] = 9
                break;

            case 2:
            case 3:
                this.arrayUpdate_assignOneToAnother(); // e.g., myItems[3] = myItems[8]
                break;

            default:
                this.arrayUpdate_assignUpdateVal(); // e.g., myItems[5] = myItems[5] + 1
                break;
        }
    };
    // --------------------------------------------------- //

    // ------------- Tool reset function -------------//
    this.reset = function() {
        this.$instructions.text('Update myItems with the given code.');
        this.$correctMemTable.css('visibility', 'hidden');
        this.arrayUpdate_disableMemDataEdit();
        this.progressionTool.reset();
    };

    <%= grunt.file.read(hbs_output) %>
}

var updateArrValExport = {
    create: function() {
        return new updateArrVal();
    },
    dependencies: <%= grunt.file.read(dependencies) %>
};
module.exports = updateArrValExport;
